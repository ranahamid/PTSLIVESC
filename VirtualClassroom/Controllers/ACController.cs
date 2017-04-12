using System;
using System.Collections.Generic;
using System.Data.Linq;
using System.Linq;
using System.Web.Mvc;
using VirtualClassroom.Code;
using VirtualClassroom.Models;

namespace VirtualClassroom.Controllers
{
    public class ACController : Interfaces.ControllerR
    {
        private VirtualClassroomDataContext db;
        public ACController()
        {
            db = new VirtualClassroomDataContext();
        }

        public ActionResult Index(string classroomId)
        {
            var q = from x in db.TblClassrooms
                    where x.Id.ToLower() == classroomId.ToLower() && x.Status!=0
                    
                    select x;

            ComputerViewModel viewModel = new ComputerViewModel();

            if (q!=null && q.Count() == 1)
            {
                TblClassroom ac = q.Single();
                viewModel.Name = "Admin computer - " + ac.Name;
                viewModel.ClassroomId = ac.Id;
                viewModel.ActionUrl = Url.Action();
            }
            else
            {
                viewModel.Name = "Virtual Classroom - Admin computer";
                viewModel.ErrorMessage = "Invalid URL.";
            }

            return View(viewModel);
        }

        public ActionResult GetData(string classroomId)
        {
            var q = from x in db.TblClassrooms
                    where x.Id.ToLower() == classroomId.ToLower()
                    select x;

            if (q != null && q.Count() == 1)
            {
                TblClassroom classroom = q.Single();

                TokBoxHelper.ComputerData cData = new TokBoxHelper.ComputerData();

                cData.Uid = Guid.Empty;
                cData.Id = classroom.Id;
                cData.Key = TokBoxHelper.Key;
                cData.ComputerSetting = new TokBoxHelper.ComputerConfig(classroom);
                cData.Session = TokBoxHelper.GetSession(classroom.Id,
                        new TokBoxHelper.TokenData
                        {
                            Uid = Guid.Empty,
                            Id = classroom.Id,
                            Name = "Admin",
                            Role = (int)VC.VcRoles.AC
                        });
                cData.Group = TokBoxHelper.CreateGroup(classroom);

                return responseSuccess(cData);
            }
            else
            {
                // error
                return responseError("Invalid URL.");
            }
        }

        [HttpPost]
        public ActionResult TurnAvPC(string classroomId, Guid uid, bool? audio, bool? video)
        {
            var q = from x in db.TblPCs
                    where x.ClassroomId.ToLower() == classroomId.ToLower() && x.Uid == uid
                    select x;

            if (q != null && q.Count() == 1)
            {
                TblPC tblPC = q.Single();
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
                return responseError("Id not found.");
            }
        }
        [HttpPost]
        public ActionResult TurnAvTC(string classroomId, Guid uid, bool? audio, bool? video)
        {
            var q = from x in db.TblTCs
                    where x.ClassroomId.ToLower() == classroomId.ToLower() && x.Uid == uid
                    select x;

             if (q!=null && q.Count() == 1)
            {
                TblTC tblTC = q.Single();
                if (audio.HasValue)
                    tblTC.Audio = audio.Value;
                if (video.HasValue)
                    tblTC.Video = video.Value;

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
                return responseError("Id not found.");
            }
        }

        [HttpPost]
        public ActionResult TurnAvAllPC(string classroomId, bool? audio, bool? video)
        {
            var q = from x in db.TblPCs
                    where x.ClassroomId.ToLower() == classroomId.ToLower()
                    select x;

            foreach (TblPC tblPC in q.Select(x => x))
            {
                if (audio.HasValue)
                    tblPC.Audio = audio.Value;
                if (video.HasValue)
                    tblPC.Video = video.Value;
            }

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
        [HttpPost]
        public ActionResult TurnAvAllTC(string classroomId, bool? audio, bool? video)
        {
            var q = from x in db.TblTCs
                    where x.ClassroomId.ToLower() == classroomId.ToLower()
                    select x;

            foreach (TblTC tblTC in q.Select(x => x))
            {
                if (audio.HasValue)
                    tblTC.Audio = audio.Value;
                if (video.HasValue)
                    tblTC.Video = video.Value;
            }

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

        [HttpPost]
        public ActionResult VolumePC(string classroomId, Guid uid, int volume)
        {
            var q = from x in db.TblPCs
                    where x.ClassroomId.ToLower() == classroomId.ToLower() && x.Uid == uid
                    select x;

             if (q!=null && q.Count() == 1)
            {
                TblPC tblPC = q.Single();
                tblPC.Volume = volume;

                try
                {
                    db.SubmitChanges();
                    return Json(new { status = VC.RESPONSE_SUCCESS, volume = volume }, JsonRequestBehavior.AllowGet);
                }
                catch (ChangeConflictException ex)
                {
                    return responseError(ex.Message);
                }
            }
            else
            {
                return responseError("Id not found.");
            }
        }
        [HttpPost]
        public ActionResult VolumeTC(string classroomId, Guid uid, int volume)
        {
            var q = from x in db.TblTCs
                    where x.ClassroomId.ToLower() == classroomId.ToLower() && x.Uid == uid
                    select x;

             if (q!=null && q.Count() == 1)
            {
                TblTC tblTC = q.Single();
                tblTC.Volume = volume;

                try
                {
                    db.SubmitChanges();
                    return Json(new { status = VC.RESPONSE_SUCCESS, volume = volume }, JsonRequestBehavior.AllowGet);
                }
                catch (ChangeConflictException ex)
                {
                    return responseError(ex.Message);
                }
            }
            else
            {
                return responseError("Id not found.");
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