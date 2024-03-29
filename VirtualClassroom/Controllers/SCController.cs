﻿using System.Linq;
using System.Web.Mvc;
using VirtualClassroom.Code;
using VirtualClassroom.Models;

namespace VirtualClassroom.Controllers
{
    public class SCController : Interfaces.ControllerR
    {
        private VirtualClassroomDataContext db;

        public SCController()
        {
            db = new VirtualClassroomDataContext();
        }

        public ActionResult Index(string classroomId, string id)
        {
            ComputerViewModel viewModel = new ComputerViewModel();
            if (classroomId != null && id != null)
            {
                var q = from x in db.TblSCs
                        where x.ClassroomId.ToLower() == classroomId.ToLower() && x.Id.ToLower() == id.ToLower() && x.TblClassroom.IsActive != 0
                        select x;

                if (q != null && q.Count() == 1)
                {
                    TblSC sc = q.Single();

                    viewModel.Name = sc.TblClassroom.Name + " - " + sc.Name;
                    viewModel.ClassroomId = sc.TblClassroom.Id;
                    viewModel.ActionUrl = Url.Action();
                }
                else
                {
                    viewModel.Name = "Virtual Classroom - Seat computer";
                    viewModel.ErrorMessage = "Invalid URL.";
                }
            }
            else
            {
                viewModel.Name = "Virtual Classroom - Seat computer";
                viewModel.ErrorMessage = "Invalid URL.";
            }
            return View(viewModel);
        }

        public ActionResult GetData(string classroomId, string id)
        {

            if (classroomId != null && id != null)
            {
                var q = from x in db.TblSCs
                        where x.ClassroomId.ToLower() == classroomId.ToLower() && x.Id.ToLower() == id.ToLower()
                        orderby x.Name
                        select x;

                if (q != null && q.Count() == 1)
                {
                    TblSC sc = q.Single();

                    TokBoxHelper.ComputerData cData = new TokBoxHelper.ComputerData();

                    cData.Uid = sc.Uid;
                    cData.Id = sc.Id;
                    cData.Key = TokBoxHelper.Key;
                    cData.ComputerSetting = new TokBoxHelper.ComputerConfig(sc);
                    cData.Session = TokBoxHelper.GetSession(sc.ClassroomId,
                        new TokBoxHelper.TokenData
                        {
                            Uid = sc.Uid,
                            Id = sc.Id,
                            Name = sc.Name,
                            Role = (int)VC.VcRoles.SC
                        });
                    cData.Group = TokBoxHelper.CreateGroup(sc);

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