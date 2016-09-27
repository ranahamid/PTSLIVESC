using System;
using System.Linq;
using VirtualClassroom.Models;

namespace VirtualClassroom.Code
{
    public class VC
    {
        public enum VcRoles : int
        {
            PC = 1,
            SC = 2,
            TC = 3,
            FC = 4,
            AC = 5,
        }

        public const string RESPONSE_SUCCESS = "success";
        public const string RESPONSE_ERROR = "error";


        public static int ScLayout(Guid scUid)
        {
            VirtualClassroomDataContext db = new VirtualClassroomDataContext();

            // get PCs
            var qPC = from x in db.TblPCs
                      where x.ScUid == scUid
                      select x;

            int scLayout = 1;
            if (qPC.Count() > 0)
            {
                int maxPosition = qPC.Max(x => x.Position);
                if (maxPosition > 6)
                    scLayout = 8;
                else if (maxPosition > 4)
                    scLayout = 6;
                else if (maxPosition > 2)
                    scLayout = 4;
                else if (maxPosition > 1)
                    scLayout = 2;
            }

            return scLayout;
        }
        public static int FcLayout(Guid fcUid)
        {
            VirtualClassroomDataContext db = new VirtualClassroomDataContext();

            // get PCs
            var qPC = from x in db.TblFCPCs
                      where x.FcUid == fcUid
                      select x;

            int fcLayout = 1;
            if (qPC.Count() > 0)
            {
                int maxPosition = qPC.Max(x => x.Position);
                if (maxPosition > 6)
                    fcLayout = 8;
                else if (maxPosition > 4)
                    fcLayout = 6;
                else if (maxPosition > 2)
                    fcLayout = 4;
                else if (maxPosition > 1)
                    fcLayout = 2;
            }

            return fcLayout;
        }
    }
}
