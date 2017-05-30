using System.Collections.Generic;
using System.Data.Linq;
using System.Linq;
using System.Web.Mvc;
using VirtualClassroom.Code;
using VirtualClassroom.Models;
using System.Text;

namespace VirtualClassroom.Controllers
{
    public class ModeratorController : Interfaces.ControllerR
    {
        private VirtualClassroomDataContext db;

        public ModeratorController()
        {
            db = new VirtualClassroomDataContext();
        }


        // GET: Moderator
        public ActionResult Index(string classroomId, string id)
       // public ActionResult Index()
        {
           // string classroomId= "CTM2016",  id="admin";
            var q = from x in db.TblModerators
                    where x.ClassroomId.ToLower() == classroomId.ToLower() && x.Id.ToLower() == id.ToLower() && x.TblClassroom.IsActive != 0
                    select x;

            ComputerViewModel viewModel = new ComputerViewModel();

            if (q != null && q.Count() == 1)
            {
                TblModerator pc = q.Single();

                //if (pc.ScUid.HasValue || pc.TcUid.HasValue)
               
                viewModel.Name = pc.TblClassroom.Name + " - " + pc.Name;
                viewModel.ClassroomId = pc.TblClassroom.Id;
                viewModel.ActionUrl = Url.Action();
                
            }
            else
            {
                viewModel.Name = "Virtual Classroom - Personal computer";
                viewModel.ErrorMessage = "Invalid URL.";
            }

            return View(viewModel);
        }

        public ActionResult GetData(string classroomId, string id)
        {
            var q = from x in db.TblModerators
                    where x.ClassroomId.ToLower() == classroomId.ToLower() && x.Id.ToLower() == id.ToLower()
                    select x;

            if (q != null && q.Count() == 1)
            {
                TblModerator pc = q.Single();

                //if (pc.ScUid.HasValue || pc.TcUid.HasValue)
                
                    TokBoxHelper.ComputerData cData = new TokBoxHelper.ComputerData();

                    cData.Uid = pc.Uid;
                    cData.Id = pc.Id;
                    cData.Key = TokBoxHelper.Key;
                    cData.ComputerSetting = new TokBoxHelper.ComputerConfig(pc);
                    cData.Session = TokBoxHelper.GetSession(pc.ClassroomId,
                        new TokBoxHelper.TokenData
                        {
                            Uid = pc.Uid,
                            Id = pc.Id,
                            Name = pc.Name,
                            Role = (int)VC.VcRoles.Moderator,
                            Address1 = pc.Address1,
                            State = pc.State,
                            City = pc.City,
                            ZipCode = pc.ZipCode,
                            Country = pc.Country
                        });
                    cData.Group = TokBoxHelper.CreateGroup(pc);

                    return responseSuccess(cData);
                
              
            }
            else
            {
                // error
                return responseError("Invalid URL.");
            }
        }


        [HttpPost]
        public ActionResult TurnAv(string classroomId, string id, bool? audio, bool? video)
        {
            var q = from x in db.TblModerators
                    where x.ClassroomId.ToLower() == classroomId.ToLower() && x.Id.ToLower() == id.ToLower()
                    select x;

            if (q != null && q.Count() == 1)
            {
                TblModerator tblPC = q.Single();
                if (audio.HasValue)
                    tblPC.Audio = audio.Value;
                if (video.HasValue)
                    tblPC.Video = video.Value;

                try
                {
                    db.SubmitChanges();
                    return Json(new { status = VC.RESPONSE_SUCCESS, audio = audio, video = video }, JsonRequestBehavior.AllowGet);
                }
                catch (ChangeConflictException ex)
                {
                    return responseError(ex.Message);
                }
            }
            else
            {
                return responseError("Invalid Moderator Id.");
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