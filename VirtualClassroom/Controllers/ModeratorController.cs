using System.Collections.Generic;
using System.Data.Linq;
using System.Linq;
using System.Web.Mvc;
using VirtualClassroom.Code;
using VirtualClassroom.Models;
using System.Text;


namespace VirtualClassroom.Controllers
{
    public class ModeratorController : Controller
    {
        private VirtualClassroomDataContext db;

        public ModeratorController()
        {
            db = new VirtualClassroomDataContext();
        }



        // GET: Moderator
        public ActionResult Index()
        {
            return View();
        }

        public ActionResult GetData(string classroomId, string id)
        {
            return null;
        }
    }
}