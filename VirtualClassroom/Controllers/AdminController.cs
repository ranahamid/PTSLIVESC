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

            ComputerViewModel viewModel = new ComputerViewModel();

            if (q != null && q.Count() == 1)
            {
                TblClassroom tblClassroom = q.Single();

                viewModel.Name = "Virtual Classroom - Administration - " + tblClassroom.Name;
                viewModel.ClassroomId = tblClassroom.Id;
                viewModel.ActionUrl = Url.Action();
            }
            else
            {
                viewModel.Name = "Virtual Classroom - Administration";
                viewModel.ErrorMessage = "Invalid URL.";
            }

            return View(viewModel);
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