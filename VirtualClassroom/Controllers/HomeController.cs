using System.Linq;
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
                        seats = x.TblSCs.OrderBy(y => y.Id).Select(y => new Seat()
                        {
                            id = y.Id,
                            name = y.Name,
                            students = y.TblPCs.OrderBy(z => z.Position).Select(z => new Student() { id = z.Id, name = z.Name, position = z.Position, teacher = null }).ToList()
                        }).ToList(),
                        teachers = x.TblTCs.OrderBy(y => y.Id).Select(y => new Teacher()
                        {
                            id = y.Id,
                            name = y.Name
                        }).ToList(),
                        featureds = x.TblFCs.OrderBy(y => y.Id).Select(y => new Featured()
                        {
                            id = y.Id,
                            name = y.Name,
                            students = y.TblFCPCs.OrderBy(z => z.Position).Select(z => new Student() { id = z.TblPC.Id, name = z.TblPC.Name, position = z.Position, teacher = null }).ToList()
                        }).ToList()
                    };

            return View(q.ToList());
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