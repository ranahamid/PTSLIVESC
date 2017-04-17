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
            public string Id { get; set; }
            public string Key { get; set; }
            public ComputerConfig ComputerSetting { get; set; }
            public TokBoxSession Session { get; set; }
            public List<GroupComputer> Group { get; set; }
        }

        [DataObject]
        public class ComputerConfig
        {
            public bool Audio;
            public bool Video;
            public int Volume;

            public ComputerConfig(TblPC pc)
            {
                this.Audio = pc.Audio;
                this.Video = pc.Video;
                this.Volume = pc.Volume;
            }
            public ComputerConfig(TblModerator moderator)
            {
                this.Audio  = moderator.Audio;
                this.Video  = moderator.Video;
                this.Volume = moderator.Volume;
            }
            public ComputerConfig(TblSC sc)
            {
            }
            public ComputerConfig(TblTC tc)
            {
                this.Audio = tc.Audio;
                this.Video = tc.Video;
                this.Volume = tc.Volume;
            }
            public ComputerConfig(TblFC fc)
            {
            }
            public ComputerConfig(TblClassroom ac)
            {
            }
        }
        [DataObject]
        public class GroupComputer
        {
            public Guid Uid { get; set; }
            public string Id { get; set; }
            public int Role { get; set; }
            public int Position { get; set; }

            public string Name { get; set; }
            public string Address1 { get; set; }
            public string State { get; set; }
            public string City { get; set; }
            public string ZipCode { get; set; }
            public string Country { get; set; }
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
            public string Id { get; set; }
            public string Name { get; set; }
            public int Role { get; set; }
            public string Seat { get; set; }
            public string Address1 { get; set; }
            public string State { get; set; }
            public string City { get; set; }
            public string ZipCode { get; set; }
            public string Country { get; set; }
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

             if (q!=null && q.Count() == 1)
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
                    Uid = pc.TblSC.Uid,
                    Id = pc.TblSC.Id,
                    Role = (int)VC.VcRoles.SC,
                    Position = 0
                });
            }

            // students within the teacher
            if (pc.TcUid.HasValue)
            {
                group.AddRange(
                    pc.TblTC.TblPCs
                        .Where(x => x.Uid != pc.Uid) // not me
                        .Select(x => new GroupComputer
                        {
                            Uid = x.Uid,
                            Id = x.Id,
                            Role = (int)VC.VcRoles.PC,
                            Position = x.Position
                        }));
            }

            // teacher computer
            if (pc.TcUid.HasValue)
            {
                group.Add(new GroupComputer
                {
                    Uid = pc.TblTC.Uid,
                    Id = pc.TblTC.Id,
                    Role = (int)VC.VcRoles.TC,
                    Position = 0
                });
            }

            // featured computer
            group.AddRange(
                pc.TblFCPCs.Select(x =>
                    new GroupComputer
                    {
                        Uid = x.TblFC.Uid,
                        Id = x.TblFC.Id,
                        Role = (int)VC.VcRoles.FC,
                        Position = 0
                    }));

            return group;
        }


        public static List<GroupComputer> CreateGroup(TblModerator pc)
        {
            List<GroupComputer> group = new List<GroupComputer>();

            // seat computer
            if (pc.ScUid.HasValue)
            {
                group.Add(new GroupComputer
                {
                    Uid = pc.TblSC.Uid,
                    Id = pc.TblSC.Id,
                    Role = (int)VC.VcRoles.SC,
                    Position = 0
                });
            }

            // students within the teacher
            if (pc.TcUid.HasValue)
            {
                group.AddRange(
                    pc.TblTC.TblPCs
                        .Where(x => x.Uid != pc.Uid) // not me
                        .Select(x => new GroupComputer
                        {
                            Uid = x.Uid,
                            Id = x.Id,
                            Role = (int)VC.VcRoles.PC,
                            Position = x.Position
                        }));
            }

            // teacher computer
            if (pc.TcUid.HasValue)
            {
                group.Add(new GroupComputer
                {
                    Uid = pc.TblTC.Uid,
                    Id = pc.TblTC.Id,
                    Role = (int)VC.VcRoles.TC,
                    Position = 0
                });
            }

            // featured computer
            //group.AddRange(
            //    pc.TblFCPCs.Select(x =>
            //        new GroupComputer
            //        {
            //            Uid = x.TblFC.Uid,
            //            Id = x.TblFC.Id,
            //            Role = (int)VC.VcRoles.FC,
            //            Position = 0
            //        }));

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
                    Id = x.Id,
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
                    Id = x.Id,
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
                    Id = x.TblPC.Id,
                    Name=x.TblPC.Name,
                    Role = (int)VC.VcRoles.PC,
                    Position = x.Position,
             

                }));
            group = group.OrderBy(x => x.Name).ToList();
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
