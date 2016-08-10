using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Web;
using System.Web.Configuration;
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
            var q = from x in db.TblSCs
                    where x.ClassroomId.ToLower() == classroomId.ToLower() && x.Id.ToLower() == id.ToLower()
                    select x;

            if (q.Count() == 1)
            {
                TblSC sc = q.Single();
                ViewBag.Name = sc.TblClassroom.Name + " - " + sc.Name;

                ViewBag.ScLayout = VC.ScLayout(sc.Uid);
            }
            else
            {
                ViewBag.Name = "Virtual Classroom - Seat computer";
                ViewBag.ErrorMessage = "Invalid URL.";
            }

            return View();
        }

        public ActionResult GetData(string classroomId, string id)
        {
            var q = from x in db.TblSCs
                    where x.ClassroomId.ToLower() == classroomId.ToLower() && x.Id.ToLower() == id.ToLower()
                    select x;

            if (q.Count() == 1)
            {
                TblSC sc = q.Single();

                TokBoxHelper.ComputerData cData = new TokBoxHelper.ComputerData();

                cData.Uid = sc.Uid;
                cData.Key = TokBoxHelper.Key;
                cData.ComputerSetting = new TokBoxHelper.ComputerConfig(sc);
                cData.ClassroomSetting = new TokBoxHelper.ClassroomConfig(sc.TblClassroom);
                cData.ScSession = TokBoxHelper.GetScSession(sc.Uid,
                    new TokBoxHelper.TokenData
                    {
                        Uid = sc.Uid,
                        Name = sc.Name,
                        Role = (int)VC.VcRoles.SC,
                        Position = 1
                    });
                cData.TcSession = null;
                cData.AcSession = TokBoxHelper.GetAcSession(sc.ClassroomId,
                    new TokBoxHelper.TokenData
                    {
                        Uid = sc.Uid,
                        Name = sc.Name,
                        Role = (int)VC.VcRoles.SC,
                        Position = 1
                    });

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