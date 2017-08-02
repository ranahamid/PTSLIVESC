using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.Owin;
using System.Linq;
using System.Threading.Tasks;
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
        public HomeController(ApplicationUserManager userManager, ApplicationRoleManager roleManager)
        {
            UserManager = userManager;
            RoleManager = roleManager;
           
        }


        private ApplicationUserManager _userManager;
        public ApplicationUserManager UserManager
        {
            get
            {
                return _userManager ?? HttpContext.GetOwinContext().GetUserManager<ApplicationUserManager>();
            }
            private set
            {
                _userManager = value;
            }
        }

        private ApplicationRoleManager _roleManager;
        public ApplicationRoleManager RoleManager
        {
            get
            {
                return _roleManager ?? HttpContext.GetOwinContext().Get<ApplicationRoleManager>();
            }
            private set
            {
                _roleManager = value;
            }
        }



        public async Task<ActionResult> Index()
        {
            ClassroomViewModel classRoomVM=new ClassroomViewModel();


            var user = await UserManager.FindByEmailAsync(User.Identity.GetUserName());
            
            var RoleNames = await UserManager.GetRolesAsync(user.Id);


            classRoomVM.Roles = RoleNames;
            classRoomVM.UserId = user.Id;
            //fullname
            string FullName = string.Empty;
            if (user != null && user.FullName != null)
            {
                FullName = user.FullName;
            }
            else
            {
                FullName = User.Identity.GetUserName();
            }

            classRoomVM.FullName = FullName;

            var q = from x in db.TblClassrooms
                    orderby x.Id
                    where x.IsActive != 0
                    select new Classroom
                    {
                        id = x.Id,
                        name = x.Name,

                        //seats = x.TblSCs.OrderBy(y => y.Id).Select(y => new Seat()
                        seats = x.TblSCs.OrderBy(y => y.Name).Select(y => new Seat()
                        {
                            uid = y.Uid,
                            id = y.Id,
                            name = y.Name,
                            // students = y.TblPCs.OrderBy(z => z.Position).Select(z => new Student()
                            students = y.TblPCs.OrderBy(z => z.Name).Select(z => new Student()
                            {
                                uid = z.Uid,
                                id = z.Id,
                                name = z.Name,
                                position = z.Position,
                                teacher = null,
                                address1 = z.Address1,
                                State = z.State,
                                City = z.City,
                                ZipCode = z.ZipCode,
                                Country = z.Country
                            }).ToList()
                        }).ToList(),

                        studentsWithOutSeat = x.TblPCs.Where(z => z.ScUid == null && z.TcUid != null).OrderBy(z => z.Name).Select(z => new Student()
                        {
                            uid = z.Uid,
                            id = z.Id,
                            name = z.Name,
                            position = z.Position,
                            teacher = null,
                            address1 = z.Address1,
                            State = z.State,
                            City = z.City,
                            ZipCode = z.ZipCode,
                            Country = z.Country
                        }).ToList(),

                        studentsWithOutSeatTeacher = x.TblPCs.Where(z => z.ScUid == null && z.TcUid == null).OrderBy(z => z.Name).Select(z => new Student()
                        {
                            uid = z.Uid,
                            id = z.Id,
                            name = z.Name,
                            position = z.Position,
                            teacher = null,
                            address1 = z.Address1,
                            State = z.State,
                            City = z.City,
                            ZipCode = z.ZipCode,
                            Country = z.Country
                        }).ToList(),

                        //  teachers = x.TblTCs.OrderBy(y => y.Id).Select(y => new Teacher()
                        teachers = x.TblTCs.OrderBy(y => y.Name).Select(y => new Teacher()
                        {
                            uid = y.Uid,
                            id = y.Id,
                            name = y.Name
                        }).ToList(),


                        //    moderators = x.TblModerators.OrderBy(z => z.Position).Select(z => new Moderator()
                        moderators = x.TblModerators.OrderBy(z => z.Name).Select(z => new Moderator()
                        {
                            uid = z.Uid,
                            id = z.Id,
                            name = z.Name,
                            position = z.Position,
                            teacher = null,
                            address1 = z.Address1,
                            State = z.State,
                            City = z.City,
                            ZipCode = z.ZipCode,
                            Country = z.Country
                        }).ToList(),

                        //  featureds = x.TblFCs.OrderBy(y => y.Id).Select(y => new Featured()
                        featureds = x.TblFCs.OrderBy(y => y.Name).Select(y => new Featured()
                        {
                            uid = y.Uid,
                            id = y.Id,
                            name = y.Name,
                            students = y.TblFCPCs.OrderBy(z => z.TblPC.Name).Select(z => new Student()
                            {
                                uid = z.TblPC.Uid,
                                id = z.TblPC.Id,
                                name = z.TblPC.Name,
                                position = z.Position,
                                teacher = null
                            }).ToList()
                        }).ToList()
                    };

            classRoomVM.classRoom = q.ToList();

            return View(classRoomVM);
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