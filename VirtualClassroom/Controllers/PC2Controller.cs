using System.Collections.Generic;
using System.Linq;
using System.Web.Mvc;
using VirtualClassroom.Code;
using VirtualClassroom.Models;

namespace VirtualClassroom.Controllers
{
    public class PC2Controller : Interfaces.ControllerR
    {
        private VirtualClassroomDataContext db;

        public PC2Controller()
        {
            db = new VirtualClassroomDataContext();
        }

        public ActionResult Index(string classroomId, string id)
        {
            var q = from x in db.TblPCs
                    where x.ClassroomId.ToLower() == classroomId.ToLower() && x.Id.ToLower() == id.ToLower()
                    select x;

            ComputerViewModel viewModel = new ComputerViewModel();

            if (q.Count() == 1)
            {
                TblPC pc = q.Single();

                if (pc.ScUid.HasValue || pc.TcUid.HasValue)
                {
                    viewModel.Name = pc.TblClassroom.Name + " - " + pc.Name;
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

            return View(viewModel);
        }

        public ActionResult GetData(string classroomId, string id)
        {
            var q = from x in db.TblPCs
                    where x.ClassroomId.ToLower() == classroomId.ToLower() && x.Id.ToLower() == id.ToLower()
                    select x;

            if (q.Count() == 1)
            {
                TblPC pc = q.Single();

                if (pc.ScUid.HasValue || pc.TcUid.HasValue)
                {
                    TokBoxHelper.ComputerData cData = new TokBoxHelper.ComputerData();

                    cData.Uid = pc.Uid;
                    cData.Key = TokBoxHelper.Key;
                    cData.ComputerSetting = new TokBoxHelper.ComputerConfig(pc);
                    cData.ClassroomSetting = new TokBoxHelper.ClassroomConfig(pc.TblClassroom);
                    cData.Session = TokBoxHelper.GetSession(pc.ClassroomId,
                        new TokBoxHelper.TokenData
                        {
                            Uid = pc.Uid,
                            Name = pc.Name,
                            Role = (int)VC.VcRoles.PC
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

        public ActionResult LoadAnswers(string classroomId, string id)
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