using System.Collections.Generic;
using System.Data.Linq;
using System.Linq;
using System.Web.Mvc;
using VirtualClassroom.Code;
using VirtualClassroom.Models;
using System.Text;


namespace VirtualClassroom.Controllers
{
    public class PCController : Interfaces.ControllerR
    {
        private VirtualClassroomDataContext db;

        public PCController()
        {
            db = new VirtualClassroomDataContext();
        }

        public ActionResult Index(string classroomId, string id)
        {
            ComputerViewModel viewModel = new ComputerViewModel();

            if (classroomId != null && id != null)
            {
                var q = from x in db.TblPCs
                        where x.ClassroomId.ToLower() == classroomId.ToLower() && x.Id == id && x.TblClassroom.IsActive != 0
                        select x;
               
                if (q != null && q.Count() == 1)
                {
                    TblPC pc = q.Single();

                    if (pc.ScUid.HasValue || pc.TcUid.HasValue)
                    {
                        //    viewModel.Name = pc.TblClassroom.Name + " - " + pc.Name;

                        viewModel.Name = pc.TblClassroom.Name;

                        viewModel.ClassroomId = pc.TblClassroom.Id;
                        viewModel.ActionUrl = Url.Action();
                    }
                    else
                    {
                        viewModel.Name = "Virtual Classroom - Personal computer";
                        viewModel.ErrorMessage = "No seat or teacher computer assigned.";
                    }
                }
                else
                {
                    viewModel.Name = "Virtual Classroom - Personal computer";
                    viewModel.ErrorMessage = "Invalid URL.";
                }
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
            if (classroomId != null && id != null)
            {
                var q = from x in db.TblPCs
                        where x.ClassroomId.ToLower() == classroomId.ToLower() && x.Id.ToLower() == id.ToLower()
                        orderby x.Name
                        select x;

                if (q != null && q.Count() == 1)
                {
                    TblPC pc = q.Single();

                    if (pc.ScUid.HasValue || pc.TcUid.HasValue)
                    {
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
                                Role = (int)VC.VcRoles.PC,
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
                        return responseError("No seat or teacher computer assigned.");
                    }
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


        public ActionResult LoadAnswers(string classroomId, string id)
        {
            if (classroomId != null && id != null)
            {
                var qPC = from x in db.TblPCs
                          where x.ClassroomId.ToLower() == classroomId && x.Id.ToLower() == id.ToLower()
                          select x;

                if (qPC.Count() == 1)
                {
                    TblPC pc = qPC.Single();

                    List<Answer> data = new List<Answer>();

                    if (pc.TcUid.HasValue)
                    {
                        data = db.TblFormAnswers.Where(x => x.PcUid == pc.Uid).OrderBy(x => x.Received).Select(x => new Answer(x)).ToList();
                    }

                    return responseSuccess(data);
                }
                else
                {
                    return responseError("Invalid Student ID.");
                }
            }
            else
            {
                return responseError("Invalid Student ID.");
            }

          
        }



        [HttpPost]
        public ActionResult TurnAv(string classroomId, string id, bool? audio, bool? video)
        {
            if (classroomId != null && id != null)
            {
                var q = from x in db.TblPCs
                        where x.ClassroomId.ToLower() == classroomId.ToLower() && x.Id.ToLower() == id.ToLower()
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
                    return responseError("Invalid Student Id.");
                }
            }
            else
            {
                return responseError("Invalid Student Id.");
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