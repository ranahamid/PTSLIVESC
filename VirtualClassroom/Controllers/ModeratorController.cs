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
        {
            ComputerViewModel viewModel = new ComputerViewModel();

            if (classroomId != null && id != null)
            {
                var q = from x in db.TblModerators
                        where x.ClassroomId.ToLower() == classroomId.ToLower() && x.Id.ToLower() == id.ToLower() && x.TblClassroom.IsActive != 0
                        select x;

                if (q != null && q.Count() == 1)
                {
                    TblModerator moderator = q.Single();


                    viewModel.Name = moderator.TblClassroom.Name + " - " + moderator.Name;
                    viewModel.ClassroomId = moderator.TblClassroom.Id;
                    viewModel.ActionUrl = Url.Action();

                }
                else
                {
                    viewModel.Name = "Virtual Classroom - Moderator computer";
                    viewModel.ErrorMessage = "Invalid URL.";
                }
            }
            else
            {
                viewModel.Name = "Virtual Classroom - Moderator computer";
                viewModel.ErrorMessage = "Invalid URL.";
            }
            return View(viewModel);
        }


        public ActionResult GetData(string classroomId, string id)
        {
            if (classroomId != null && id != null)
            {
                var q = from x in db.TblModerators
                        where x.ClassroomId.ToLower() == classroomId.ToLower() && x.Id.ToLower() == id.ToLower()
                        select x;

                if (q != null && q.Count() == 1)
                {
                    TblModerator moderator = q.Single();
                    TokBoxHelper.ComputerData cData = new TokBoxHelper.ComputerData();

                    cData.Uid = moderator.Uid;
                    cData.Id = moderator.Id;
                    cData.Key = TokBoxHelper.Key;
                    cData.ComputerSetting = new TokBoxHelper.ComputerConfig(moderator);
                    cData.Session = TokBoxHelper.GetSession(moderator.ClassroomId,
                        new TokBoxHelper.TokenData
                        {
                            Uid = moderator.Uid,
                            Id = moderator.Id,
                            Name = moderator.Name,
                            Role = (int)VC.VcRoles.Moderator,
                            Address1 = moderator.Address1,
                            State = moderator.State,
                            City = moderator.City,
                            ZipCode = moderator.ZipCode,
                            Country = moderator.Country
                        });
                    cData.Group = TokBoxHelper.CreateGroup(moderator);

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


        //TurnAv

        [HttpPost]
        public ActionResult TurnAv(string classroomId, string id, bool? audio, bool? video)
        {
            if (classroomId != null && id != null)
            {
                var q = from x in db.TblModerators
                        where x.ClassroomId.ToLower() == classroomId.ToLower() && x.Id.ToLower() == id.ToLower()
                        select x;

                if (q != null && q.Count() == 1)
                {
                    TblModerator tblModerator = q.Single();
                    if (audio.HasValue)
                        tblModerator.Audio = audio.Value;
                    if (video.HasValue)
                        tblModerator.Video = video.Value;

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