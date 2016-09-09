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
                    where x.Id.ToLower() == classroomId.ToLower()
                    select x;

            ComputerViewModel viewModel = new ComputerViewModel();

            if (q.Count() == 1)
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

            if (q.Count() == 1)
            {
                TblClassroom classroom = q.Single();

                TokBoxHelper.ComputerData cData = new TokBoxHelper.ComputerData();

                cData.Uid = Guid.Empty;
                cData.Key = TokBoxHelper.Key;
                cData.ComputerSetting = new TokBoxHelper.ComputerConfig() { Audio = false, Video = false };
                cData.ClassroomSetting = new TokBoxHelper.ClassroomConfig(classroom);
                cData.Session = TokBoxHelper.GetSession(classroom.Id,
                        new TokBoxHelper.TokenData
                        {
                            Uid = Guid.Empty,
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

            if (q.Count() == 1)
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
        public ActionResult TurnAvSC(string classroomId, Guid uid, bool? audio, bool? video)
        {
            var q = from x in db.TblSCs
                    where x.ClassroomId.ToLower() == classroomId.ToLower() && x.Uid == uid
                    select x;

            if (q.Count() == 1)
            {
                TblSC tblSC = q.Single();
                if (audio.HasValue)
                    tblSC.Audio = audio.Value;
                if (video.HasValue)
                    tblSC.Video = video.Value;

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

            if (q.Count() == 1)
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
        public ActionResult VolumePC(string classroomId, Guid uid, List<int?> volume)
        {
            var q = from x in db.TblPCs
                    where x.ClassroomId.ToLower() == classroomId.ToLower() && x.Uid == uid
                    select x;

            if (q.Count() == 1)
            {
                TblPC tblPC = q.Single();
                if (volume.Count > 0 && volume[0].HasValue)
                    tblPC.Volume1 = volume[0].Value;
                if (volume.Count > 1 && volume[1].HasValue)
                    tblPC.Volume2 = volume[1].Value;

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
        public ActionResult VolumeSC(string classroomId, Guid uid, List<int?> volume)
        {
            var q = from x in db.TblSCs
                    where x.ClassroomId.ToLower() == classroomId.ToLower() && x.Uid == uid
                    select x;

            if (q.Count() == 1)
            {
                TblSC tblSC = q.Single();
                if (volume.Count > 0 && volume[0].HasValue)
                    tblSC.Volume1 = volume[0].Value;
                if (volume.Count > 1 && volume[1].HasValue)
                    tblSC.Volume2 = volume[1].Value;
                if (volume.Count > 2 && volume[2].HasValue)
                    tblSC.Volume3 = volume[2].Value;
                if (volume.Count > 3 && volume[3].HasValue)
                    tblSC.Volume4 = volume[3].Value;
                if (volume.Count > 4 && volume[4].HasValue)
                    tblSC.Volume5 = volume[4].Value;
                if (volume.Count > 5 && volume[5].HasValue)
                    tblSC.Volume6 = volume[5].Value;
                if (volume.Count > 6 && volume[6].HasValue)
                    tblSC.Volume7 = volume[6].Value;
                if (volume.Count > 7 && volume[7].HasValue)
                    tblSC.Volume8 = volume[7].Value;

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
        public ActionResult VolumeFC(string classroomId, Guid uid, List<int?> volume)
        {
            var q = from x in db.TblFCs
                    where x.ClassroomId.ToLower() == classroomId.ToLower() && x.Uid == uid
                    select x;

            if (q.Count() == 1)
            {
                var qPCs = from x in db.TblFCPCs
                           where x.FcUid == uid
                           select x;

                foreach (TblFCPC tbl in qPCs.Select(x => x))
                {
                    if (volume.Count >= tbl.Position)
                    {
                        if (volume[tbl.Position - 1].HasValue)
                        {
                            tbl.Volume = volume[tbl.Position - 1].Value;
                        }
                    }
                }

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