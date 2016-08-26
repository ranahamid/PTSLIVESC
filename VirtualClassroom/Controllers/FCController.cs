using System.Linq;
using System.Web.Mvc;
using VirtualClassroom.Code;
using VirtualClassroom.Models;

namespace VirtualClassroom.Controllers
{
    public class FCController : Interfaces.ControllerR
    {
        private VirtualClassroomDataContext db;

        public FCController()
        {
            db = new VirtualClassroomDataContext();
        }

        public ActionResult Index(string classroomId, string id)
        {
            var q = from x in db.TblFCs
                    where x.ClassroomId.ToLower() == classroomId.ToLower() && x.Id.ToLower() == id.ToLower()
                    select x;

            if (q.Count() == 1)
            {
                TblFC fc = q.Single();
                ViewBag.Name = fc.TblClassroom.Name + " - " + fc.Name;

                ViewBag.FcLayout = VC.FcLayout(fc.Uid);
            }
            else
            {
                ViewBag.Name = "Virtual Classroom - Featured computer";
                ViewBag.ErrorMessage = "Invalid URL.";
            }

            return View();
        }

        public ActionResult GetData(string classroomId, string id)
        {
            var q = from x in db.TblFCs
                    where x.ClassroomId.ToLower() == classroomId.ToLower() && x.Id.ToLower() == id.ToLower()
                    select x;
            
            if (q.Count() == 1)
            {
                TblFC fc = q.Single();

                TokBoxHelper.ComputerData cData = new TokBoxHelper.ComputerData();

                cData.Uid = fc.Uid;
                cData.Key = TokBoxHelper.Key;
                cData.ComputerSetting = new TokBoxHelper.ComputerConfig(fc);
                cData.ClassroomSetting = new TokBoxHelper.ClassroomConfig(fc.TblClassroom);
                cData.Session = TokBoxHelper.GetSession(fc.ClassroomId,
                    new TokBoxHelper.TokenData
                    {
                        Uid = fc.Uid,
                        Name = fc.Name,
                        Role = (int)VC.VcRoles.FC
                    });
                cData.Group = TokBoxHelper.CreateGroup(fc);

                return responseSuccess(cData);
            }
            else
            {
                // error
                return responseError("Invalid URL.");
            }
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