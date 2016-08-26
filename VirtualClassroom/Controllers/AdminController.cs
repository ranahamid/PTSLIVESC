using System.Linq;
using System.Web.Mvc;
using VirtualClassroom.Models;

namespace VirtualClassroom.Controllers
{
    public class AdminController : Interfaces.ControllerR
    {
        private VirtualClassroomDataContext db;

        public AdminController()
        {
            db = new VirtualClassroomDataContext();
        }

        public ActionResult Index()
        {
            return View();
        }
        public ActionResult Classroom(string classroomId)
        {
            var q = from x in db.TblClassrooms
                    where x.Id.ToLower() == classroomId.ToLower()
                    select x;

            ViewBag.ClassroomId = classroomId;

            if (q.Count() == 1)
            {
                TblClassroom tblClassroom = q.Single();

                ViewBag.Name = "Virtual Classroom - Administration - " + tblClassroom.Name;
            }
            else
            {
                ViewBag.Name = "Virtual Classroom - Administration";
                ViewBag.ErrorMessage = "Invalid URL.";
            }

            return View();
        }

        // dispose
        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }
    }
}