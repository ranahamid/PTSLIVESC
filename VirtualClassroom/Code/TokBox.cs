using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Web;
using System.Web.Configuration;
using Newtonsoft.Json;
using VirtualClassroom.Models;

namespace VirtualClassroom.Code
{
    public class TokBoxHelper
    {
        [DataObject]
        public class ComputerData
        {
            public Guid Uid { get; set; }
            public string Key { get; set; }
            public ComputerConfig ComputerSetting { get; set; }
            public ClassroomConfig ClassroomSetting { get; set; }
            public TokBoxSession Session { get; set; }
            public List<GroupComputer> Group { get; set; }
        }

        [DataObject]
        public class ClassroomConfig
        {
            public ClassroomConfig()
            {
            }
            public ClassroomConfig(TblClassroom tblClassroom)
            {
            }
        }
        [DataObject]
        public class ComputerConfig
        {
            public bool Audio;
            public bool Video;
            public List<int?> Volume;

            public ComputerConfig()
            {
            }
            public ComputerConfig(bool audio, bool video)
            {
                this.Audio = audio;
                this.Video = video;
                this.Volume = new List<int?>();
            }
            public ComputerConfig(TblPC pc)
            {
                this.Audio = pc.Audio;
                this.Video = pc.Video;
                this.Volume = new List<int?>()
                {
                    pc.Volume1,
                    pc.Volume2
                };
            }
            public ComputerConfig(TblSC sc)
            {
                this.Audio = sc.Audio;
                this.Video = sc.Video;
                this.Volume = new List<int?>();

                int scLayout = VC.ScLayout(sc.Uid);

                if (scLayout > 0)
                {
                    this.Volume.Add(sc.Volume1);
                    this.Volume.Add(sc.Volume2);
                }
                if (scLayout > 2)
                {
                    this.Volume.Add(sc.Volume3);
                    this.Volume.Add(sc.Volume4);
                }
                if (scLayout > 4)
                {
                    this.Volume.Add(sc.Volume5);
                    this.Volume.Add(sc.Volume6);
                }
                if (scLayout > 6)
                {
                    this.Volume.Add(sc.Volume7);
                    this.Volume.Add(sc.Volume8);
                }
            }
            public ComputerConfig(TblTC tc)
            {
                this.Audio = tc.Audio;
                this.Video = tc.Video;
                this.Volume = new List<int?>()
                {
                };
            }
            public ComputerConfig(TblFC fc)
            {
                this.Video = false;
                this.Audio = false;

                var q = from x in fc.TblFCPCs
                        orderby x.Position
                        select x;

                this.Volume = q.Select(x => (int?)x.Volume).ToList();
            }
        }
        [DataObject]
        public class GroupComputer
        {
            public Guid Uid { get; set; }
            public int Role { get; set; }
            public int Position { get; set; }
        }

        [DataObject]
        public class TokBoxSession
        {
            public string SessionId { get; set; }
            public string Token { get; set; }
        }

        [Serializable]
        public class TokenData
        {
            public Guid Uid { get; set; }
            public string Name { get; set; }
            public int Role { get; set; }
        }

        public static string Key
        {
            get { return WebConfigurationManager.AppSettings["TokBoxKey"]; }
        }
        public static string Secret
        {
            get { return WebConfigurationManager.AppSettings["TokBoxSecret"]; }
        }
        public static string GenerateToken(string sessionId, OpenTokSDK.Role role, string data = null)
        {
            OpenTokSDK.OpenTok openTok = new OpenTokSDK.OpenTok(int.Parse(Key), Secret);
            string token = String.Empty;
            try
            {
                token = openTok.GenerateToken(sessionId, role, 0, data);
            }
            catch { }

            return token;
        }
        public static string CreateSession(string location)
        {
            OpenTokSDK.OpenTok openTok = new OpenTokSDK.OpenTok(int.Parse(Key), Secret);
            string sessionId = String.Empty;
            try
            {
                OpenTokSDK.Session toksession = openTok.CreateSession(location, OpenTokSDK.MediaMode.ROUTED);
                sessionId = toksession.Id;
            }
            catch { }

            return sessionId;
        }

        public static TokBoxSession GetSession(string classroomId, TokenData data)
        {
            VirtualClassroomDataContext db = new VirtualClassroomDataContext();

            var q = from x in db.TblClassrooms
                    where x.Id.ToLower() == classroomId.ToLower()
                    select x;

            if (q.Count() == 1)
            {
                // Classroom id found
                TblClassroom ac = q.Single();

                string sessionId = String.Empty;

                if (!String.IsNullOrEmpty(ac.SessionId))
                {
                    // session exists
                    sessionId = ac.SessionId;
                }
                else
                {
                    // create new session
                    sessionId = TokBoxHelper.CreateSession(HttpContext.Current.Request.ServerVariables["REMOTE_ADDR"]);

                    if (!String.IsNullOrEmpty(sessionId))
                    {
                        // session succefully created - update in db
                        ac.SessionId = sessionId;
                        db.SubmitChanges();
                    }
                    else
                    {
                        // session creation failed
                        return null;
                    }
                }

                if (!String.IsNullOrEmpty(sessionId))
                {
                    // create token
                    string token = TokBoxHelper.GenerateToken(sessionId, OpenTokSDK.Role.PUBLISHER, JsonConvert.SerializeObject(data));
                    if (!String.IsNullOrEmpty(token))
                    {
                        // token created - return
                        return new TokBoxHelper.TokBoxSession
                        {
                            SessionId = sessionId,
                            Token = token
                        };
                    }
                    else
                    {
                        // token creation failed
                        return null;
                    }
                }
                else
                {
                    // session empty
                    return null;
                }
            }
            else
            {
                // uid not found
                return null;
            }
        }

        public static List<GroupComputer> CreateGroup(TblPC pc)
        {
            List<GroupComputer> group = new List<GroupComputer>();

            // seat computer
            if (pc.ScUid.HasValue)
            {
                group.Add(new GroupComputer
                {
                    Uid = pc.ScUid.Value,
                    Role = (int)VC.VcRoles.SC,
                    Position = 0
                });
            }

            // students within the seat (for private chat)
            if (pc.ScUid.HasValue)
            {
                group.AddRange(
                    pc.TblSC.TblPCs
                        .Where(x => x.Uid != pc.Uid) // not me
                        .Select(x => new GroupComputer
                        {
                            Uid = x.Uid,
                            Role = (int)VC.VcRoles.PC,
                            Position = x.Position
                        }));
            }

            // teacher computer
            if (pc.TcUid.HasValue)
            {
                group.Add(new GroupComputer
                {
                    Uid = pc.TcUid.Value,
                    Role = (int)VC.VcRoles.TC,
                    Position = 0
                });
            }

            // featured computers
            group.AddRange(
                pc.TblFCPCs.Select(x =>
                    new GroupComputer
                    {
                        Uid = x.TblFC.Uid,
                        Role = (int)VC.VcRoles.FC,
                        Position = 0
                    }));

            return group;
        }
        public static List<GroupComputer> CreateGroup(TblSC sc)
        {
            List<GroupComputer> group = new List<GroupComputer>();

            // student computers
            group.AddRange(
                sc.TblPCs.Select(x => new GroupComputer
                {
                    Uid = x.Uid,
                    Role = (int)VC.VcRoles.PC,
                    Position = x.Position
                }));

            return group;
        }
        public static List<GroupComputer> CreateGroup(TblTC tc)
        {
            List<GroupComputer> group = new List<GroupComputer>();

            // student computers
            group.AddRange(
                tc.TblPCs.Select(x => new GroupComputer
                {
                    Uid = x.Uid,
                    Role = (int)VC.VcRoles.PC,
                    Position = 0
                }));

            return group;
        }
        public static List<GroupComputer> CreateGroup(TblFC fc)
        {
            List<GroupComputer> group = new List<GroupComputer>();

            // student computers
            group.AddRange(
                fc.TblFCPCs.Select(x => new GroupComputer
                {
                    Uid = x.TblPC.Uid,
                    Role = (int)VC.VcRoles.PC,
                    Position = x.Position
                }));

            return group;
        }
        public static List<GroupComputer> CreateGroup(TblClassroom classroom)
        {
            List<GroupComputer> group = new List<GroupComputer>();

            // everyone in classroom, nothing to insert

            return group;
        }
    }
}
