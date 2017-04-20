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
            Moderator = 6,
        }

        public const string RESPONSE_SUCCESS = "success";
        public const string RESPONSE_ERROR = "error";
    }
}
