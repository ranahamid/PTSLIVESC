using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web.Mvc;
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
            AC = 4
        }

        public const string RESPONSE_SUCCESS = "success";
        public const string RESPONSE_ERROR = "error";


        public static int ScLayout(Guid scUid)
        {
            VirtualClassroomDataContext db = new Models.VirtualClassroomDataContext();

            // get PCs
            var qPC = from x in db.TblPCs
                      where x.ScUid == scUid
                      select x;

            int scLayout = 2;
            if (qPC.Count() > 0)
            {
                int maxPosition = qPC.Max(x => x.Position);
                if (maxPosition > 6)
                    scLayout = 8;
                else if (maxPosition > 4)
                    scLayout = 6;
                else if (maxPosition > 2)
                    scLayout = 4;
            }

            return scLayout;
        }
    }
}
