using System;
using System.Collections.Generic;
using System.Linq;
using System.Web.Mvc;
using VirtualClassroom.Code;
using VirtualClassroom.Models;

namespace VirtualClassroom.Controllers
{
    public class TCController : Interfaces.ControllerR
    {
        private VirtualClassroomDataContext db;

        public TCController()
        {
            db = new VirtualClassroomDataContext();
        }

        public ActionResult Index(string classroomId, string id)
        {
            var q = from x in db.TblTCs
                    where x.ClassroomId.ToLower() == classroomId.ToLower() && x.Id.ToLower() == id.ToLower() && x.TblClassroom.IsActive != 0
                    select x;

            ComputerViewModel viewModel = new ComputerViewModel();

            if (q != null && q.Count() == 1)
            {
                TblTC tc = q.Single();
                viewModel.Name = tc.TblClassroom.Name + " - " + tc.Name;
                viewModel.ClassroomId = tc.TblClassroom.Id;
                viewModel.ActionUrl = Url.Action();
            }
            else
            {
                viewModel.Name = "Virtual Classroom - Teacher computer";
                viewModel.ErrorMessage = "Invalid URL.";
            }

            return View(viewModel);
        }

        public ActionResult GetData(string classroomId, string id)
        {
            var q = from x in db.TblTCs
                    where x.ClassroomId.ToLower() == classroomId.ToLower() && x.Id.ToLower() == id.ToLower()
                    select x;

             if (q!=null && q.Count() == 1)
            {
                TblTC tc = q.Single();

                TokBoxHelper.ComputerData cData = new TokBoxHelper.ComputerData();

                cData.Uid = tc.Uid;
                cData.Id = tc.Id;
                cData.Key = TokBoxHelper.Key;
                cData.ComputerSetting = new TokBoxHelper.ComputerConfig(tc);
                cData.Session = TokBoxHelper.GetSession(tc.ClassroomId,
                    new TokBoxHelper.TokenData
                    {
                        Uid = tc.Uid,
                        Id = tc.Id,
                        Name = tc.Name,
                        Role = (int)VC.VcRoles.TC
                    });
                cData.Group = TokBoxHelper.CreateGroup(tc);

                return responseSuccess(cData);
            }
            else
            {
                // error
                return responseError("Invalid URL.");
            }
        }

        public ActionResult LoadForms(string classroomId, string id, Forms.FormType type)
        {
            var qTC = from x in db.TblTCs
                      where x.ClassroomId.ToLower() == classroomId && x.Id.ToLower() == id.ToLower()
                      select x;

            if (qTC.Count() == 1)
            {
                TblTC tc = qTC.Single();

                List<Form> data = db.TblForms.Where(x => x.ClassroomId.ToLower() == classroomId.ToLower() && x.Type == (int)type).OrderBy(x => x.Title).Select(x => new Form(x, tc.Uid)).ToList();

                return responseSuccess(data);
            }
            else
            {
                return responseError("Invalid Teacher ID.");
            }
        }

        public ActionResult LoadAnswers(string classroomId, string id, Guid formUid)
        {
            var qTC = from x in db.TblTCs
                      where x.ClassroomId.ToLower() == classroomId && x.Id.ToLower() == id.ToLower()
                      select x;

            if (qTC.Count() == 1)
            {
                TblTC tc = qTC.Single();

                List<Answer> data = db.TblFormAnswers.Where(x => x.FormUid == formUid && x.TblPC.TcUid == tc.Uid).OrderBy(x => x.Answered).Select(x => new Answer(x)).ToList();

                return responseSuccess(data);
            }
            else
            {
                return responseError("Invalid Teacher ID.");
            }
        }

        [HttpPost]
        public ActionResult SendForm(string classroomId, string id, Guid formUid, List<Guid> connectedPCs)
        {
            var qForm = from x in db.TblForms
                        where x.ClassroomId.ToLower() == classroomId && x.Uid == formUid
                        select x;

            if (qForm.Count() == 1)
            {
                var qTC = from x in db.TblTCs
                          where x.ClassroomId.ToLower() == classroomId && x.Id.ToLower() == id.ToLower()
                          select x;

                if (qTC.Count() == 1)
                {
                    TblForm form = qForm.Single();
                    TblTC tc = qTC.Single();

                    int countOfPCs = 0;

                    // send
                    foreach (TblPC pc in tc.TblPCs.Where(x => connectedPCs.Contains(x.Uid)).Select(x => x))
                    {
                        db.TblFormAnswers.InsertOnSubmit(new TblFormAnswer
                        {
                            Uid = Guid.NewGuid(),
                            FormUid = form.Uid,
                            PcUid = pc.Uid,
                            Title = form.Title,
                            Data = form.Data,
                            Received = DateTime.UtcNow,
                            Answered = null,
                            Status = (int)Forms.FormAnswerStatus.Pending
                        });
                        countOfPCs++;
                    }

                    if (countOfPCs > 0)
                    {
                        try
                        {
                            db.SubmitChanges();

                            return responseSuccess(countOfPCs);
                        }
                        catch (Exception ex)
                        {
                            return responseError(ex.Message);
                        }
                    }
                    else
                    {
                        return responseError("No Student PC connected.");
                    }
                }
                else
                {
                    return responseError("Invalid Teacher ID.");
                }
            }
            else
            {
                return responseError("Invalid Form ID.");
            }
        }


        [HttpPost]
        public ActionResult DeleteAnswer(string classroomId, string id, Guid answerUid)
        {
            var qAnswer = from x in db.TblFormAnswers
                          where x.TblForm.ClassroomId.ToLower() == classroomId && x.Uid == answerUid
                          select x;

            if (qAnswer.Count() == 1)
            {
                TblFormAnswer answer = qAnswer.Single();

                Guid pcUid = answer.PcUid;

                db.TblFormAnswers.DeleteOnSubmit(answer);

                try
                {
                    db.SubmitChanges();

                    return responseSuccess(pcUid);
                }
                catch (Exception ex)
                {
                    return responseError(ex.Message);
                }
            }
            else
            {
                return responseError("Invalid Answer ID.");
            }
        }


        [HttpPost]
        public ActionResult DeleteAllAnswers(string classroomId, string id, Guid formUid)
        {
            var qTC = from x in db.TblTCs
                      where x.ClassroomId.ToLower() == classroomId && x.Id.ToLower() == id.ToLower()
                      select x;

            if (qTC.Count() == 1)
            {
                TblTC tc = qTC.Single();

                var qAnswer = from x in db.TblFormAnswers
                              where x.TblForm.ClassroomId.ToLower() == classroomId && x.FormUid == formUid && x.TblPC.TcUid == tc.Uid
                              select x;

                db.TblFormAnswers.DeleteAllOnSubmit(qAnswer);

                try
                {
                    db.SubmitChanges();

                    return responseSuccess(formUid);
                }
                catch (Exception ex)
                {
                    return responseError(ex.Message);
                }
            }
            else
            {
                return responseError("Invalid Teacher ID.");
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