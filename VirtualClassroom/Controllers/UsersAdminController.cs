using VirtualClassroom.Models;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.Owin;
using Microsoft.AspNet.Identity.EntityFramework;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;

namespace VirtualClassroom.Controllers
{
    [Authorize(Roles = "Administrator")]
    public class UsersAdminController : Controller
    {
        private VirtualClassroomDataContext db;
        public UsersAdminController()
        {
            db = new VirtualClassroomDataContext();
        }

        public UsersAdminController(ApplicationUserManager userManager, ApplicationRoleManager roleManager)
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


        // GET: /Users/
        public async Task<ActionResult> Index(ManageMessageId? message)
        {
            ViewBag.StatusMessage =
                message == ManageMessageId.AddUserSuccess ? "Your user has been created."
              : message == ManageMessageId.DeleteUserSuccess ? "Your user has been deleted."
              : message == ManageMessageId.ChangeUserSuccess ? "Your user has been changed."
              : message == ManageMessageId.CanTDeleteOwn ? "You can't delete your own account."
              : "";

            return View(await UserManager.Users.ToListAsync());
        }



        public enum ManageMessageId
        {
            AddUserSuccess,
            DeleteUserSuccess,
            ChangeUserSuccess,
            CanTDeleteOwn
        }
        //
        // GET: /Users/Details/5
        public async Task<ActionResult> Details(string id)
        {
            if (id == null)
            {
                return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
            }
            var user = await UserManager.FindByIdAsync(id);

            ViewBag.RoleNames = await UserManager.GetRolesAsync(user.Id);
            //
            DetailsUserAdminViewModel model = new DetailsUserAdminViewModel();
            model.user = user;


            //get roles 
            if (user == null)
            {
                return HttpNotFound();
            }

            IList<string> rolesAll = await UserManager.GetRolesAsync(user.Id);
            //user id in lower
            string loweredId = user.Id.ToLower();
            foreach (var item in rolesAll)
            {
                if (item == "Student")
                {
                    //if is in student role
                    var q = from x in db.TblPCs
                            where x.Id == id
                            select x;

                    if (q != null && q.Count() == 1)
                    {
                        TblPC tblPC = q.Single();

                        model.FullName = tblPC.Name != null ? tblPC.Name : string.Empty;
                        model.Address1 = tblPC.Address1 != null ? tblPC.Address1 : string.Empty;
                        model.State = tblPC.State != null ? tblPC.State : string.Empty;
                        model.City = tblPC.City != null ? tblPC.City : string.Empty;
                        model.SelectedCountry = tblPC.Country != null ? tblPC.Country : string.Empty;
                        model.ZipCode = tblPC.ZipCode != null ? tblPC.ZipCode : string.Empty;
                        model.SelectedClassroom = tblPC.ClassroomId != null ? tblPC.ClassroomId : string.Empty;

                        //teacher

                        if (tblPC.TcUid != null)
                        {
                            var qTC = from x in db.TblTCs
                                      where x.Uid.ToString().ToLower() == tblPC.TcUid.ToString().ToLower()
                                      select x;

                            if (qTC != null && qTC.Count() == 1)
                            {
                                TblTC tc = qTC.Single();

                                model.SelectedTeacher = tc.Uid != null ? tc.Uid.ToString() : string.Empty;
                            }
                        }
                        else
                        {
                            model.SelectedTeacher = string.Empty;
                        }
                    }
                    //end of student

                }
                else if (item.Trim().ToLower() == "Teacher".Trim().ToLower())
                {
                    var q = from x in db.TblTCs
                            where x.Id.ToLower() == loweredId
                            select x;

                    if (q != null && q.Count() == 1)
                    {
                        TblTC tblTC = q.Single();
                        model.SelectedClassroom = tblTC.ClassroomId != null ? tblTC.ClassroomId : string.Empty;
                    }
                }
                else if (item.Trim().ToLower() == "Seat".Trim().ToLower())
                {
                    var q = from x in db.TblSCs
                            where x.Id.ToLower() == loweredId
                            select x;

                    if (q != null && q.Count() == 1)
                    {
                        TblSC tblSC = q.Single();
                        model.SelectedClassroom = tblSC.ClassroomId != null ? tblSC.ClassroomId : string.Empty;
                    }
                }

                else if (item.Trim().ToLower() == "Featured".Trim().ToLower())
                {
                    var q = from x in db.TblFCs
                            where x.Id.ToLower() == loweredId
                            select x;

                    if (q != null && q.Count() == 1)
                    {
                        TblFC tblFC = q.Single();
                        model.SelectedClassroom = tblFC.ClassroomId != null ? tblFC.ClassroomId : string.Empty;
                    }

                }
                else if (item.Trim().ToLower() == "Admin".Trim().ToLower())
                {
                    //nothing to do
                }
                //Administrator
                else if (item.Trim().ToLower() == "Administrator".Trim().ToLower())
                {
                    //nothing to do
                }
                else if (item == "Moderator")
                {
                    //if is in moderator role
                    var q = from x in db.TblModerators
                            where x.Id == id
                            select x;

                    if (q != null && q.Count() == 1)
                    {
                        TblModerator tblPC = q.Single();

                        model.FullName = tblPC.Name != null ? tblPC.Name : string.Empty;
                        model.Address1 = tblPC.Address1 != null ? tblPC.Address1 : string.Empty;
                        model.State = tblPC.State != null ? tblPC.State : string.Empty;
                        model.City = tblPC.City != null ? tblPC.City : string.Empty;
                        model.SelectedCountry = tblPC.Country != null ? tblPC.Country : string.Empty;
                        model.ZipCode = tblPC.ZipCode != null ? tblPC.ZipCode : string.Empty;
                        model.SelectedClassroom = tblPC.ClassroomId != null ? tblPC.ClassroomId : string.Empty;

                        //teacher

                        if (tblPC.TcUid != null)
                        {
                            var qTC = from x in db.TblTCs
                                      where x.Uid.ToString().ToLower() == tblPC.TcUid.ToString().ToLower()
                                      select x;

                            if (qTC != null && qTC.Count() == 1)
                            {
                                TblTC tc = qTC.Single();

                                model.SelectedTeacher = tc.Uid != null ? tc.Name.ToString() : string.Empty;
                            }
                        }
                        else
                        {
                            model.SelectedTeacher = string.Empty;
                        }
                    }
                    //end moderator
                }
            }

            return View(model);
        }


        public ActionResult FillTeachers(string id)
        {
            var vm = new VirtualClassroom.Models.TeacherViewModel()
            {
                selectedClassroomId = id
            };

            return PartialView("_TeachersUserAdmin", vm);
        }


        //
        // GET: /Users/Create
        public async Task<ActionResult> Create()
        {
            //Get the list of Roles
            //List<ApplicationRole> roleList = new List<ApplicationRole>();

            //foreach (var item in RoleManager.Roles)
            //{
            //   // if (item.Name == "Admin" || item.Name == "Administrator" || item.Name == "Student" || item.Name == "Moderator")
            //    {
            //        roleList.Add(item);
            //    }

            //}
            //ViewBag.RoleId = new SelectList(roleList, "Name", "Name");
            ViewBag.RoleId = new SelectList(await RoleManager.Roles.ToListAsync(), "Name", "Name");


            //Create

            UserAdminCreateViewModel model = new UserAdminCreateViewModel();
            //country
            var Countries = from x in db.TblCountries
                            select x;

            List<SelectListItem> CountryItems = new List<SelectListItem>();

            if (Countries != null)
            {
                foreach (var item in Countries)
                {
                    CountryItems.Add(new SelectListItem
                    {
                        Text = item.CountryName,
                        Value = item.CountryName,
                        Selected = (item.TwoCharCountryCode == "US") ? true : false
                    });

                }
            }

            model.Country = CountryItems;
            model.SelectedClassroom = "";
            model.SelectedCountry = "";
            model.SelectedTeacher = "";


            //classroom            
            var TblClassrooms = from x in db.TblClassrooms
                                select x;

            List<SelectListItem> TblClassroomItems = new List<SelectListItem>();

            if (TblClassroomItems != null)
            {
                foreach (var item in TblClassrooms)
                {
                    TblClassroomItems.Add(new SelectListItem
                    {
                        Text = item.Name,
                        Value = item.Id
                    });
                }
            }

            model.Classroom = TblClassroomItems;

            return View(model);
        }

        //
        // POST: /Users/Create
        [HttpPost]
        public async Task<ActionResult> Create(UserAdminCreateViewModel model, params string[] selectedRoles)
        {
            if (ModelState.IsValid)
            {
                var user = new ApplicationUser { UserName = model.Email, Email = model.Email, FullName = model.FullName };
                var adminresult = await UserManager.CreateAsync(user, model.Password);


                if (adminresult.Succeeded)
                {

                    var code = await UserManager.GenerateEmailConfirmationTokenAsync(user.Id);
                    var callbackUrl = Url.Action("ConfirmEmail", "Account", new { userId = user.Id, code = code }, protocol: Request.Url.Scheme);
                    //body
                    string FullName = string.Empty;
                    if (model.FullName != null)
                    {
                        FullName = model.FullName;
                    }
                    else
                    {
                        FullName = User.Identity.GetUserName();
                    }

                    //send email
                    string body = "Dear " + FullName + "," +
                       ",\n\nWelcome to Virtual Classroom!" +
                        "\n\nA request has been received to open your Virtual Classroom account." +
                        "\n\nPlease confirm your account by clicking this link: <a href=\"" + callbackUrl + "\">Click here</a>." +

                        "\n\nIf you did not initiate this request, please contact us immediately at support@example.com." +
                        "\n\nThank you," +
                        "\nThe Virtual Classroom Team.";

                    await UserManager.SendEmailAsync(user.Id, "Confirm your account", body);
                    ViewBag.Link = callbackUrl;

                    //Add User to the selected Roles 
                    if (selectedRoles != null)
                    {
                        #region foreach
                        foreach (var role in selectedRoles)
                        {
                            string fullName = model.FullName != null ? model.FullName : string.Empty;
                            string CurrentUserId = user.Id;
                            //Teacher
                            if (role.Trim().ToLower() == "Teacher".Trim().ToLower())
                            {

                                string selectedClassroom = model.SelectedClassroom != null ? model.SelectedClassroom : string.Empty;

                                Guid tcUid = Guid.NewGuid();

                                db.TblTCs.InsertOnSubmit(new TblTC
                                {
                                    Uid = tcUid,
                                    Id = CurrentUserId,
                                    ClassroomId = selectedClassroom,
                                    Name = fullName,
                                    Audio = true,
                                    Video = true
                                });
                                try
                                {
                                    db.SubmitChanges();
                                }
                                catch (Exception e)
                                {

                                }

                            }
                            //Seat
                            if (role.Trim().ToLower() == "Seat".Trim().ToLower())
                            {
                                string selectedClassroom = model.SelectedClassroom != null ? model.SelectedClassroom : string.Empty;

                                Guid scUid = Guid.NewGuid();
                                db.TblSCs.InsertOnSubmit(new TblSC
                                {
                                    Uid = scUid,
                                    Id = CurrentUserId,
                                    ClassroomId = selectedClassroom,
                                    Name = fullName
                                });
                                try
                                {
                                    db.SubmitChanges();
                                }
                                catch (Exception e)
                                {

                                }

                            }
                            //Featured
                            if (role.Trim().ToLower() == "Featured".Trim().ToLower())
                            {
                                string selectedClassroom = model.SelectedClassroom != null ? model.SelectedClassroom : string.Empty;

                                Guid fcUid = Guid.NewGuid();
                                db.TblFCs.InsertOnSubmit(new TblFC
                                {
                                    Uid = fcUid,
                                    Id = CurrentUserId,
                                    ClassroomId = selectedClassroom,
                                    Name = fullName
                                });
                                try
                                {
                                    db.SubmitChanges();
                                }
                                catch (Exception e)
                                {

                                }

                            }

                            #region Student
                            //student pc
                            if (role.Trim().ToLower() == "Student".Trim().ToLower())
                            {
                                //store the others property in tblPC

                                string selectedClassroom = model.SelectedClassroom != null ? model.SelectedClassroom : string.Empty;

                                string selectedCountry = model.SelectedCountry != null ? model.SelectedCountry : string.Empty;

                                Guid selectedTeacher = Guid.NewGuid();

                                if (model.SelectedTeacher != null)
                                {
                                    bool resultGuid = Guid.TryParse(model.SelectedTeacher, out selectedTeacher);
                                }

                                Guid pcUid = Guid.NewGuid();

                                db.TblPCs.InsertOnSubmit(new TblPC
                                {
                                    Uid = pcUid,
                                    Id = CurrentUserId,
                                    ClassroomId = selectedClassroom,
                                    Name = fullName,
                                    ScUid = null,
                                    TcUid = selectedTeacher,
                                    Position = 0,
                                    Audio = true,
                                    Video = true,
                                    Volume = 80,
                                    Address1 = model.Address1 != null ? model.Address1 : string.Empty,
                                    City = model.City != null ? model.City : string.Empty,
                                    Country = selectedCountry,
                                    ZipCode = model.ZipCode != null ? model.ZipCode : string.Empty,
                                    State = model.State != null ? model.State : string.Empty,
                                });

                                try
                                {
                                    db.SubmitChanges();
                                }
                                catch (Exception e)
                                {

                                }
                                //end of store the others property in tblPC
                            }
                            #endregion

                            #region Moderator                            
                            //Moderator
                            if (role.Trim().ToLower() == "Moderator".Trim().ToLower())
                            {
                                //store the others property in tblModerator                                
                                string selectedCountry = model.SelectedCountry != null ? model.SelectedCountry : string.Empty;

                                string selectedClassroom = model.SelectedClassroom != null ? model.SelectedClassroom : string.Empty;

                                Guid selectedTeacher = Guid.NewGuid();

                                if (model.SelectedTeacher != null)
                                {
                                    bool resultGuid = Guid.TryParse(model.SelectedTeacher, out selectedTeacher);
                                }

                                Guid pcUid = Guid.NewGuid();

                                db.TblModerators.InsertOnSubmit(new TblModerator
                                {
                                    Uid = pcUid,
                                    Id = CurrentUserId,
                                    ClassroomId = selectedClassroom,
                                    Name = fullName,
                                    // ScUid = null,
                                    TcUid = selectedTeacher,
                                    Position = 0,
                                    Audio = true,
                                    Video = true,
                                    Volume = 80,
                                    Address1 = model.Address1 != null ? model.Address1 : string.Empty,
                                    City = model.City != null ? model.City : string.Empty,
                                    Country = selectedCountry,
                                    ZipCode = model.ZipCode != null ? model.ZipCode : string.Empty,
                                    State = model.State != null ? model.State : string.Empty,
                                });

                                try
                                {
                                    db.SubmitChanges();
                                }
                                catch (Exception e)
                                {

                                }
                                //end of store the others property in tblModerator
                            }
                            #endregion

                            //Admin
                            if (role.Trim().ToLower() == "Admin".Trim().ToLower())
                            {
                                //nothing to do
                            }
                            //Administrator
                            if (role.Trim().ToLower() == "Administrator".Trim().ToLower())
                            {
                                //nothing to do
                            }
                        }
                        //end for each
                        #endregion

                        //add user to roles
                        var result = await UserManager.AddToRolesAsync(user.Id, selectedRoles);
                        if (!result.Succeeded)
                        {
                            ModelState.AddModelError("", result.Errors.First());
                            ViewBag.RoleId = new SelectList(await RoleManager.Roles.ToListAsync(), "Name", "Name");
                            return View();
                        }
                    }
                }
                else
                {
                    ModelState.AddModelError("", adminresult.Errors.First());
                    //ViewBag.RoleId = new SelectList(RoleManager.Roles, "Name", "Name");

                    ViewBag.RoleId = new SelectList(await RoleManager.Roles.ToListAsync(), "Name", "Name");
                    return View();
                }
                return RedirectToAction("Index", "UsersAdmin", new { Message = ManageMessageId.AddUserSuccess });
            }

            //ViewBag.RoleId = new SelectList(RoleManager.Roles, "Name", "Name");
            List<ApplicationRole> roleList = new List<ApplicationRole>();

            foreach (var item in RoleManager.Roles)
            {
                // if (item.Name == "Admin" || item.Name == "Administrator" || item.Name == "Student" || item.Name == "Moderator")
                {
                    roleList.Add(item);
                }

            }
            ViewBag.RoleId = new SelectList(roleList, "Name", "Name");
            return View();
        }

        //
        // GET: /Users/Edit/1
        public async Task<ActionResult> Edit(string id)
        {
            if (id == null)
            {
                return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
            }
            var user = await UserManager.FindByIdAsync(id);
            if (user == null)
            {
                return HttpNotFound();
            }

            var userRoles = await UserManager.GetRolesAsync(user.Id);


            //others property


            //country
            var Countries = from x in db.TblCountries
                            select x;

            List<SelectListItem> CountryItems = new List<SelectListItem>();

            if (Countries != null)
            {
                foreach (var item in Countries)
                {
                    CountryItems.Add(new SelectListItem
                    {
                        Text = item.CountryName,
                        Value = item.CountryName,
                        Selected = (item.TwoCharCountryCode == "US") ? true : false
                    });

                }
            }



            //classroom            
            var TblClassrooms = from x in db.TblClassrooms
                                select x;

            List<SelectListItem> TblClassroomItems = new List<SelectListItem>();

            if (TblClassroomItems != null)
            {
                foreach (var item in TblClassrooms)
                {
                    TblClassroomItems.Add(new SelectListItem
                    {
                        Text = item.Name,
                        Value = item.Id
                    });
                }
            }


            //details
            EditUserViewModel vm = new EditUserViewModel();
            vm.SelectedClassroom = string.Empty;
            vm.SelectedCountry = string.Empty;
            vm.SelectedTeacher = string.Empty;


            IList<string> rolesAll = await UserManager.GetRolesAsync(user.Id);
            //user id in lower
            string loweredId = user.Id.ToLower();
            foreach (var item in rolesAll)
            {
                if (item == "Student")
                {
                    //if is in student role
                    var q = from x in db.TblPCs
                            where x.Id == id
                            select x;

                    if (q != null && q.Count() == 1)
                    {
                        TblPC tblPC = q.Single();

                        vm.FullName = tblPC.Name != null ? tblPC.Name : string.Empty;
                        vm.Address1 = tblPC.Address1 != null ? tblPC.Address1 : string.Empty;
                        vm.State = tblPC.State != null ? tblPC.State : string.Empty;
                        vm.City = tblPC.City != null ? tblPC.City : string.Empty;
                        vm.SelectedCountry = tblPC.Country != null ? tblPC.Country : string.Empty;
                        vm.ZipCode = tblPC.ZipCode != null ? tblPC.ZipCode : string.Empty;
                        vm.SelectedClassroom = tblPC.ClassroomId != null ? tblPC.ClassroomId : string.Empty;

                        //teacher

                        if (tblPC.TcUid != null)
                        {
                            var qTC = from x in db.TblTCs
                                      where x.Uid.ToString().ToLower() == tblPC.TcUid.ToString().ToLower()
                                      select x;

                            if (qTC != null && qTC.Count() == 1)
                            {
                                TblTC tc = qTC.Single();

                                vm.SelectedTeacher = tc.Uid != null ? tc.Uid.ToString() : string.Empty;
                            }
                        }
                        else
                        {
                            vm.SelectedTeacher = string.Empty;
                        }
                    }
                    //end of student

                }
                else if (item.Trim().ToLower() == "Teacher".Trim().ToLower())
                {
                    var q = from x in db.TblTCs
                            where x.Id.ToLower() == loweredId
                            select x;

                    if (q != null && q.Count() == 1)
                    {
                        TblTC tblTC = q.Single();
                        vm.SelectedClassroom = tblTC.ClassroomId != null ? tblTC.ClassroomId : string.Empty;
                    }
                }
                else if (item.Trim().ToLower() == "Seat".Trim().ToLower())
                {
                    var q = from x in db.TblSCs
                            where x.Id.ToLower() == loweredId
                            select x;

                    if (q != null && q.Count() == 1)
                    {
                        TblSC tblSC = q.Single();
                        vm.SelectedClassroom = tblSC.ClassroomId != null ? tblSC.ClassroomId : string.Empty;
                    }
                }

                else if (item.Trim().ToLower() == "Featured".Trim().ToLower())
                {
                    var q = from x in db.TblFCs
                            where x.Id.ToLower() == loweredId
                            select x;

                    if (q != null && q.Count() == 1)
                    {
                        TblFC tblFC = q.Single();
                        vm.SelectedClassroom = tblFC.ClassroomId != null ? tblFC.ClassroomId : string.Empty;
                    }

                }
                else if (item.Trim().ToLower() == "Admin".Trim().ToLower())
                {
                    //nothing to do
                }
                //Administrator
                else if (item.Trim().ToLower() == "Administrator".Trim().ToLower())
                {
                    //nothing to do
                }
                else if (item == "Moderator")
                {
                    //if is in moderator role
                    var q = from x in db.TblModerators
                            where x.Id == id
                            select x;

                    if (q != null && q.Count() == 1)
                    {
                        TblModerator tblPC = q.Single();

                        vm.FullName = tblPC.Name != null ? tblPC.Name : string.Empty;
                        vm.Address1 = tblPC.Address1 != null ? tblPC.Address1 : string.Empty;
                        vm.State = tblPC.State != null ? tblPC.State : string.Empty;
                        vm.City = tblPC.City != null ? tblPC.City : string.Empty;
                        vm.SelectedCountry = tblPC.Country != null ? tblPC.Country : string.Empty;
                        vm.ZipCode = tblPC.ZipCode != null ? tblPC.ZipCode : string.Empty;
                        vm.SelectedClassroom = tblPC.ClassroomId != null ? tblPC.ClassroomId : string.Empty;

                        //teacher

                        if (tblPC.TcUid != null)
                        {
                            var qTC = from x in db.TblTCs
                                      where x.Uid.ToString().ToLower() == tblPC.TcUid.ToString().ToLower()
                                      select x;

                            if (qTC != null && qTC.Count() == 1)
                            {
                                TblTC tc = qTC.Single();

                                vm.SelectedTeacher = tc.Uid != null ? tc.Name.ToString() : string.Empty;
                            }
                        }
                        else
                        {
                            vm.SelectedTeacher = string.Empty;
                        }
                    }
                    //end moderator
                }
            }

            vm.Id = user.Id;
            vm.Email = user.Email;
            vm.Classroom = TblClassroomItems;
            vm.Country = CountryItems;

            vm.RolesList = RoleManager.Roles.ToList().Select(x => new SelectListItem()
            {
                Selected = userRoles.Contains(x.Name),
                Text = x.Name,
                Value = x.Name
            });

            return View(vm);
        }

        //
        // POST: /Users/Edit/5
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<ActionResult> Edit(EditUserViewModel editUser, params string[] selectedRole)
        {
            if (ModelState.IsValid)
            {
                var user = await UserManager.FindByIdAsync(editUser.Id);
                if (user == null)
                {
                    return HttpNotFound();
                }

                user.UserName = editUser.Email;
                user.Email = editUser.Email;

                var userRoles = await UserManager.GetRolesAsync(user.Id);

                selectedRole = selectedRole ?? new string[] { };

                var result = await UserManager.AddToRolesAsync(user.Id, selectedRole.Except(userRoles).ToArray<string>());

                if (!result.Succeeded)
                {
                    ModelState.AddModelError("", result.Errors.First());
                    return View();
                }
                result = await UserManager.RemoveFromRolesAsync(user.Id, userRoles.Except(selectedRole).ToArray<string>());

                //update user's based on role
                var roles = await UserManager.GetRolesAsync(user.Id);

                //user id in lower
                string loweredId = user.Id.ToLower();

                foreach (var role in roles)
                {
                    //update 
                    if (role.Trim().ToLower() == "Teacher".Trim().ToLower())
                    {

                        var q = from x in db.TblTCs
                                where x.Id.ToLower() == loweredId
                                select x;

                        if (q != null && q.Count() == 1)
                        {
                            TblTC tblTC = q.Single();
                        }
                    }
                    if (role.Trim().ToLower() == "Seat".Trim().ToLower())
                    {
                        var q = from x in db.TblSCs
                                where x.Id.ToLower() == loweredId
                                select x;

                        if (q != null && q.Count() == 1)
                        {
                            TblSC tblSC = q.Single();
                        }
                    }
                    if (role.Trim().ToLower() == "Featured".Trim().ToLower())

                    {
                        var q = from x in db.TblFCs
                                where x.Id.ToLower() == loweredId
                                select x;

                        if (q != null && q.Count() == 1)
                        {
                            TblFC tblFC = q.Single();
                        }

                    }
                    if (role.Trim().ToLower() == "Admin".Trim().ToLower())
                    {
                        //nothing to do
                    }
                    //Administrator
                    if (role.Trim().ToLower() == "Administrator".Trim().ToLower())
                    {
                        //nothing to do
                    }
                    if (role.Trim().ToLower() == "Student".Trim().ToLower())
                    {

                    }
                    if (role.Trim().ToLower() == "Moderator".Trim().ToLower())
                    {
                        
                    }
                }

                if (!result.Succeeded)
                {
                    ModelState.AddModelError("", result.Errors.First());
                    return View();
                }
                return RedirectToAction("Index", "UsersAdmin", new { Message = ManageMessageId.ChangeUserSuccess });
            }
            ModelState.AddModelError("", "Something failed.");
            return View();
        }

        //
        // GET: /Users/Delete/5
        public async Task<ActionResult> Delete(string id)
        {
            if (id == null)
            {
                return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
            }
            else if (id == User.Identity.GetUserId())
            {
                return RedirectToAction("Index", "UsersAdmin", new { Message = ManageMessageId.CanTDeleteOwn });
            }

            var user = await UserManager.FindByIdAsync(id);
            if (user == null)
            {
                return HttpNotFound();
            }
            return View(user);
        }

        //
        // POST: /Users/Delete/5
        [HttpPost, ActionName("Delete")]
        [ValidateAntiForgeryToken]
        public async Task<ActionResult> DeleteConfirmed(string id)
        {
            if (ModelState.IsValid)
            {
                string UserIdSt = id;

                if (id == null)
                {
                    return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
                }
                //own user id
                else if (id == User.Identity.GetUserId())
                {
                    return RedirectToAction("Index", "UsersAdmin", new { Message = ManageMessageId.CanTDeleteOwn });
                }
                else
                {
                    var user = await UserManager.FindByIdAsync(id);
                    if (user == null)
                    {
                        return HttpNotFound();
                    }

                    string FullName = string.Empty;
                    if (user.FullName != null)
                    {
                        FullName = user.FullName;
                    }
                    else
                    {
                        FullName = User.Identity.GetUserName();
                    }
                    //delete from student & moderator table
                    var roles = await UserManager.GetRolesAsync(user.Id);

                    //user id in lower
                    string loweredId = id.ToLower();

                    foreach (var role in roles)
                    {

                        if (role.Trim().ToLower() == "Teacher".Trim().ToLower())
                        {
                            //delete from Teacher
                            var q = from x in db.TblTCs
                                    where x.Id.ToLower() == loweredId
                                    select x;

                            if (q != null && q.Count() == 1)
                            {
                                TblTC tblTC = q.Single();

                                Guid tcUid = tblTC.Uid;

                                foreach (TblPC tblPC in db.TblPCs.Where(x => x.TcUid.HasValue && x.TcUid == tcUid).Select(x => x))
                                {
                                    tblPC.TcUid = null;
                                }
                                db.TblTCs.DeleteOnSubmit(tblTC);

                                try
                                {
                                    db.SubmitChanges();
                                }
                                catch (Exception ex)
                                {

                                }
                            }
                        }
                        if (role.Trim().ToLower() == "Seat".Trim().ToLower())
                        {
                            //delete from Seat
                            var q = from x in db.TblSCs
                                    where x.Id.ToLower() == loweredId
                                    select x;

                            if (q != null && q.Count() == 1)
                            {
                                TblSC tblSC = q.Single();

                                Guid scUid = tblSC.Uid;

                                foreach (TblPC tblPC in db.TblPCs.Where(x => x.ScUid.HasValue && x.ScUid == scUid).Select(x => x))
                                {
                                    tblPC.ScUid = null;
                                    tblPC.Position = 0;
                                }
                                db.TblSCs.DeleteOnSubmit(tblSC);

                                try
                                {
                                    db.SubmitChanges();

                                }
                                catch (Exception ex)
                                {

                                }
                            }
                        }
                        if (role.Trim().ToLower() == "Featured".Trim().ToLower())
                        {
                            //delete from Featured
                            var q = from x in db.TblFCs
                                    where x.Id.ToLower() == loweredId
                                    select x;

                            if (q != null && q.Count() == 1)
                            {
                                TblFC tblFC = q.Single();

                                Guid fcUid = tblFC.Uid;

                                // remove assigned students
                                db.TblFCPCs.DeleteAllOnSubmit(from x in db.TblFCPCs
                                                              where x.FcUid == tblFC.Uid
                                                              select x);

                                db.TblFCs.DeleteOnSubmit(tblFC);

                                try
                                {
                                    db.SubmitChanges();
                                }
                                catch (Exception ex)
                                {

                                }
                            }
                        }
                        if (role.Trim().ToLower() == "Admin".Trim().ToLower())
                        {
                            //nothing to do
                        }
                        //Administrator
                        if (role.Trim().ToLower() == "Administrator".Trim().ToLower())
                        {
                            //nothing to do
                        }

                        if (role.Trim().ToLower() == "Student".Trim().ToLower())
                        {
                            //delete from student


                            var q = from x in db.TblPCs
                                    where x.Id.ToLower() == loweredId
                                    select x;

                            if (q != null && q.Count() == 1)
                            {
                                TblPC tblPC = q.Single();

                                // delete form answers of this student
                                db.TblFormAnswers.DeleteAllOnSubmit(from x in db.TblFormAnswers
                                                                    where x.PcUid == tblPC.Uid
                                                                    select x);

                                // delete from featured computer
                                db.TblFCPCs.DeleteAllOnSubmit(from x in db.TblFCPCs
                                                              where x.PcUid == tblPC.Uid
                                                              select x);

                                // delete student
                                db.TblPCs.DeleteOnSubmit(tblPC);

                                try
                                {
                                    db.SubmitChanges();
                                }
                                catch (Exception)
                                {

                                }
                            }
                            else
                            {

                            }
                        }
                        if (role.Trim().ToLower() == "Moderator".Trim().ToLower())
                        {


                            var q = from x in db.TblModerators
                                    where x.Id.ToLower() == loweredId
                                    select x;

                            if (q != null && q.Count() == 1)
                            {
                                TblModerator tblModerator = q.Single();

                                db.TblModerators.DeleteOnSubmit(tblModerator);

                                try
                                {
                                    db.SubmitChanges();
                                }
                                catch (Exception)
                                {

                                }
                            }
                            else
                            {

                            }
                        }


                    }
                    //end from student & mod

                    //send mail                      
                    string body = "Dear " + FullName + "," +
                            "\n\nRecently your Virtual Classroom account has been deleted." +
                            "\n\nIf you did not initiate this request, please contact us immediately at support@example.com." +
                            "\n\nThank you," +
                            "\nThe Virtual Classroom Team.";

                    await UserManager.SendEmailAsync(UserIdSt, "Your Virtual Classroom account has been deleted", body);
                    //end email

                    //delete from identity
                    var result = await UserManager.DeleteAsync(user);

                    if (!result.Succeeded)
                    {
                        ModelState.AddModelError("", result.Errors.First());
                        return View();
                    }
                    else
                    {
                        return RedirectToAction("Index", "UsersAdmin", new { Message = ManageMessageId.DeleteUserSuccess });
                    }
                }

            }
            return View();
        }
    }
}
