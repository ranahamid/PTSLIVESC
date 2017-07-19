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
            ComputerViewModel viewModel = new ComputerViewModel();
            if (classroomId != null && id != null)
            {

                var q = from x in db.TblFCs
                        where x.ClassroomId.ToLower() == classroomId.ToLower() && x.Id.ToLower() == id.ToLower() && x.TblClassroom.IsActive != 0
                        select x;
                
                if (q != null && q.Count() == 1)
                {
                    TblFC fc = q.Single();

                    viewModel.Name = fc.TblClassroom.Name + " - " + fc.Name;
                    viewModel.ClassroomId = fc.TblClassroom.Id;
                    viewModel.ActionUrl = Url.Action();
                }
                else
                {
                    viewModel.Name = "Virtual Classroom - Featured computer";
                    viewModel.ErrorMessage = "Invalid URL.";
                }
            }
            else
            {
                viewModel.Name = "Virtual Classroom - Featured computer";
                viewModel.ErrorMessage = "Invalid URL.";
            }

            return View(viewModel);
        }

        public ActionResult GetData(string classroomId, string id)
        {
            if (classroomId != null && id != null)
            {
                var q = from x in db.TblFCs
                        where x.ClassroomId.ToLower() == classroomId.ToLower() && x.Id.ToLower() == id.ToLower()
                        orderby x.Name
                        select x;                

                if (q != null && q.Count() == 1)
                {
                    TblFC fc = q.Single();

                    TokBoxHelper.ComputerData cData = new TokBoxHelper.ComputerData();

                    cData.Uid = fc.Uid;
                    cData.Id = fc.Id;
                    cData.Key = TokBoxHelper.Key;
                    cData.ComputerSetting = new TokBoxHelper.ComputerConfig(fc);
                    cData.Session = TokBoxHelper.GetSession(fc.ClassroomId,
                        new TokBoxHelper.TokenData
                        {
                            Uid = fc.Uid,
                            Id = fc.Id,
                            Name = fc.Name,
                            Role = (int)VC.VcRoles.FC,

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