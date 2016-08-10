using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using VirtualClassroom.Models;

namespace VirtualClassroom.Controllers
{
    public class HomeController : Controller
    {
        private VirtualClassroomDataContext db;

        public HomeController()
        {
            db = new VirtualClassroomDataContext();
        }

        public ActionResult Index()
        {
            var q = from x in db.TblClassrooms
                    orderby x.Id
                    select new Classroom
                    {
                        id = x.Id,
                        name = x.Name,
                        seats = x.TblSCs.OrderBy(xx => xx.Id).Select(y => new Seat()
                        {
                            id = y.Id,
                            name = y.Name,
                            students = y.TblPCs.OrderBy(z => z.Position).Select(z => new Student() { id = z.Id, name = z.Name, position = z.Position, teacher = null }).ToList()
                        }).ToList(),
                        teachers = x.TblTCs.OrderBy(y => y.Id).Select(y => new Teacher()
                        {
                            id = y.Id,
                            name = y.Name
                        }).ToList()
                    };

            return View(q.ToList());
        }

        public ActionResult Test()
        {
            return View();
        }

        public ActionResult Test2()
        {
            return View();
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