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
    [Authorize(Roles = "Admin")]
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

        //
        // GET: /Users/
        public async Task<ActionResult> Index(ManageMessageId? message)
        {
            ViewBag.StatusMessage =
                message == ManageMessageId.AddUserSuccess ?    "Your user has been created."
              : message == ManageMessageId.DeleteUserSuccess ? "Your user has been deleted."
              : message == ManageMessageId.ChangeUserSuccess ? "Your user has been changed."
              : "";

            return View(await UserManager.Users.ToListAsync());
        }

        public enum ManageMessageId
        {
            AddUserSuccess,
            DeleteUserSuccess,
            ChangeUserSuccess
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

                        model.SelectedTeacher = tc.Uid != null ? tc.Name.ToString() : string.Empty;
                    }
                }
            }

            return View(model);
        }

        //
        // GET: /Users/Create
        public async Task<ActionResult> Create()
        {
            //Get the list of Roles
            ViewBag.RoleId = new SelectList(await RoleManager.Roles.ToListAsync(), "Name", "Name");
            
            //Create
        
            RegisterViewModel model = new RegisterViewModel();
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
        public async Task<ActionResult> Create(RegisterViewModel model, params string[] selectedRoles)
        {
            if (ModelState.IsValid)
            {
                var user = new ApplicationUser { UserName = model.Email, Email = model.Email, FullName = model.FullName };
                var adminresult = await UserManager.CreateAsync(user, model.Password);

                
                if (adminresult.Succeeded)
                {
                    //add to the db pc
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
                            "\nThe Virtual Classroom Team";
                      
                        await UserManager.SendEmailAsync(user.Id, "Confirm your account", body);

                        ViewBag.Link = callbackUrl;

                        //store the others property in tblPC
                        string fullName = model.FullName != null ? model.FullName : string.Empty;
                        string CurrentUserId = user.Id;

                        string selectedCountry = model.SelectedCountry != null ? model.SelectedCountry : string.Empty;
                        string selectedClassroom = model.SelectedClassroom != null ? model.SelectedClassroom : string.Empty;
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
                        catch (Exception ex)
                        {

                        }
                    //end of store the others property in tblPC

                    //Add User to the selected Roles 
                    if (selectedRoles != null)
                    {
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
                    ViewBag.RoleId = new SelectList(RoleManager.Roles, "Name", "Name");
                    return View();
                }
                return RedirectToAction("Index", "UsersAdmin", new { Message = ManageMessageId.AddUserSuccess });
            }
            ViewBag.RoleId = new SelectList(RoleManager.Roles, "Name", "Name");
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

            return View(new EditUserViewModel()
            {
                Id = user.Id,
                Email = user.Email,
                RolesList = RoleManager.Roles.ToList().Select(x => new SelectListItem()
                {
                    Selected = userRoles.Contains(x.Name),
                    Text = x.Name,
                    Value = x.Name
                })
            });
        }

        //
        // POST: /Users/Edit/5
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<ActionResult> Edit([Bind(Include = "Email,Id")] EditUserViewModel editUser, params string[] selectedRole)
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
                if (id == null)
                {
                    return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
                }

                var user = await UserManager.FindByIdAsync(id);
                if (user == null)
                {
                    return HttpNotFound();
                }
                var result = await UserManager.DeleteAsync(user);
                if (!result.Succeeded)
                {
                    ModelState.AddModelError("", result.Errors.First());
                    return View();
                }
                return RedirectToAction("Index", "UsersAdmin", new { Message = ManageMessageId.DeleteUserSuccess });
            }
            return View();
        }
    }
}
