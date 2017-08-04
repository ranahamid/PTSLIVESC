using VirtualClassroom.Models;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.Owin;
using Microsoft.Owin.Security;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;
using System.Collections.Generic;
using System;

namespace VirtualClassroom.Controllers
{
    [Authorize]
    public class ManageController : Controller
    {
        private VirtualClassroomDataContext db;
        public ManageController()
        {
            db = new VirtualClassroomDataContext();
        }

        public ManageController(ApplicationUserManager userManager)
        {
            UserManager = userManager;
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

        //
        // GET: /Account/Index
        public async Task<ActionResult> Index(ManageMessageId? message)
        {
            ViewBag.StatusMessage =
                message == ManageMessageId.ChangePasswordSuccess ? "Your password has been changed."
                : message == ManageMessageId.SetPasswordSuccess ? "Your password has been set."
                : message == ManageMessageId.SetTwoFactorSuccess ? "Your two factor provider has been set."
                : message == ManageMessageId.Error ? "An error has occurred."
                : message == ManageMessageId.AddPhoneSuccess ? "The phone number was added."
                : message == ManageMessageId.RemovePhoneSuccess ? "Your phone number was removed."
                : message == ManageMessageId.EditProfileSUccess ? "Your profile has been updated."
                : "";

            var model = new IndexViewModel
            {
                HasPassword = HasPassword(),
                PhoneNumber = await UserManager.GetPhoneNumberAsync(User.Identity.GetUserId()),
                TwoFactor = await UserManager.GetTwoFactorEnabledAsync(User.Identity.GetUserId()),
                Logins = await UserManager.GetLoginsAsync(User.Identity.GetUserId()),
                BrowserRemembered = await AuthenticationManager.TwoFactorBrowserRememberedAsync(User.Identity.GetUserId())
            };
            return View(model);
        }

        [HttpGet]
        public async Task<ActionResult> EditProfile()
        {
            EditProfileViewModel model = new EditProfileViewModel();
            model.DisplayAllOption = false;
            model.DisplayTeacherOption = false;

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
                        // Selected = (item.TwoCharCountryCode == "US") ? true : false
                    });

                }
            }

            model.Country = CountryItems;

            //other properties

            //check in which role
            var user = await UserManager.FindByEmailAsync(User.Identity.GetUserName());
            if (user == null)
            {
                return HttpNotFound();
            }

            IList<string> rolesAll = await UserManager.GetRolesAsync(user.Id);

            foreach (var item in rolesAll)
            {
                if (item == "Student")
                {
                    model.DisplayAllOption = true;
                    model.DisplayTeacherOption = true;
                    //if is in student role

                    var q = from x in db.TblPCs
                            where x.Id == User.Identity.GetUserId()
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
                    //end student


                }
                else if (item.Trim().ToLower() == "Teacher".Trim().ToLower())
                {
                    model.DisplayTeacherOption = true;
                    var q = from x in db.TblTCs
                            where x.Id.ToLower() == User.Identity.GetUserId()
                            select x;

                    if (q != null && q.Count() == 1)
                    {
                        TblTC tblTC = q.Single();
                        model.SelectedClassroom = tblTC.ClassroomId != null ? tblTC.ClassroomId : string.Empty;
                    }
                }
                else if (item.Trim().ToLower() == "Seat".Trim().ToLower())
                {
                    model.DisplayTeacherOption = true;
                    var q = from x in db.TblSCs
                            where x.Id.ToLower() == User.Identity.GetUserId()
                            select x;

                    if (q != null && q.Count() == 1)
                    {
                        TblSC tblSC = q.Single();
                        model.SelectedClassroom = tblSC.ClassroomId != null ? tblSC.ClassroomId : string.Empty;
                    }
                }

                else if (item.Trim().ToLower() == "Featured".Trim().ToLower())
                {
                    model.DisplayTeacherOption = true;
                    var q = from x in db.TblFCs
                            where x.Id.ToLower() == User.Identity.GetUserId()
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

                    model.DisplayAllOption = true;
                    model.DisplayTeacherOption = true;
                    //moderator
                    var q = from x in db.TblModerators
                            where x.Id == User.Identity.GetUserId()
                            select x;

                    if (q != null && q.Count() == 1)
                    {
                        TblModerator tblModerator = q.Single();

                        model.FullName = tblModerator.Name != null ? tblModerator.Name : string.Empty;
                        model.Address1 = tblModerator.Address1 != null ? tblModerator.Address1 : string.Empty;
                        model.State = tblModerator.State != null ? tblModerator.State : string.Empty;
                        model.City = tblModerator.City != null ? tblModerator.City : string.Empty;
                        model.SelectedCountry = tblModerator.Country != null ? tblModerator.Country : string.Empty;
                        model.ZipCode = tblModerator.ZipCode != null ? tblModerator.ZipCode : string.Empty;
                        model.SelectedClassroom = tblModerator.ClassroomId != null ? tblModerator.ClassroomId : string.Empty;


                        //teacher

                        if (tblModerator.TcUid != null)
                        {
                            var qTC = from x in db.TblTCs
                                      where x.Uid.ToString().ToLower() == tblModerator.TcUid.ToString().ToLower()
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
                    //end moderator

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

            model.Classroom = TblClassroomItems;

            //get full name

            string FullName = string.Empty;

            if (user != null && user.FullName != null)
            {
                model.FullName = user.FullName;
            }

            return View(model);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<ActionResult> EditProfile(EditProfileViewModel model)
        {
            if (ModelState.IsValid)
            {
                string fullName = model.FullName != null ? model.FullName : string.Empty;
                model.DisplayAllOption = false;
                model.DisplayTeacherOption = false;

                //update Full Name on identity table
                var user = await UserManager.FindByIdAsync(User.Identity.GetUserId());
                user.FullName = fullName;
                UserManager.Update(user);

                //update TblPC


                string selectedCountry = model.SelectedCountry != null ? model.SelectedCountry : string.Empty;
                string selectedClassroom = model.SelectedClassroom != null ? model.SelectedClassroom : string.Empty;
                Guid selectedTeacher = Guid.NewGuid();

                if (model.SelectedTeacher != null)
                {
                    bool resultGuid = Guid.TryParse(model.SelectedTeacher, out selectedTeacher);
                }
                //check role

                if (user == null)
                {
                    return HttpNotFound();
                }

                IList<string> rolesAll = await UserManager.GetRolesAsync(user.Id);
                string CurrentUserId = user.Id;

                foreach (var item in rolesAll)
                {
                    if (item == "Student")
                    {
                        model.DisplayAllOption = true;
                        model.DisplayTeacherOption = true;

                        //if is in student role
                        var q = from x in db.TblPCs
                                where x.Id == User.Identity.GetUserId()
                                select x;
                        if (q != null && q.Count() == 1)
                        {
                            TblPC tblPC = q.Single();
                            tblPC.Name = fullName;
                            tblPC.Address1 = model.Address1 != null ? model.Address1 : string.Empty;
                            tblPC.State = model.State != null ? model.State : string.Empty;
                            tblPC.City = model.City != null ? model.City : string.Empty;
                            tblPC.Country = selectedCountry;
                            tblPC.ZipCode = model.ZipCode != null ? model.ZipCode : string.Empty;

                            tblPC.ClassroomId = selectedClassroom;
                            tblPC.TcUid = selectedTeacher;
                        }
                        else
                        {
                            //insert
                            //store the others property in tblPC
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
                        }
                        try
                        {
                            db.SubmitChanges();
                        }
                        catch (Exception e)
                        {

                        }

                    }



                    //Teacher
                    if (item.Trim().ToLower() == "Teacher".Trim().ToLower())
                    {

                        model.DisplayTeacherOption = true;

                        var q = from x in db.TblTCs
                                where x.Id.ToLower() == User.Identity.GetUserId().ToLower()
                                select x;

                        if (q != null && q.Count() == 1)
                        {
                            TblTC tblTC = q.Single();
                            tblTC.Name = fullName;
                            tblTC.ClassroomId = selectedClassroom;
                            try
                            {
                                db.SubmitChanges();
                            }
                            catch (Exception ex)
                            {
                            }
                        }
                        else
                        {
                            //insert
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

                        }
                        try
                        {
                            db.SubmitChanges();
                        }
                        catch (Exception e)
                        {

                        }
                    }
                    //Seat
                    if (item.Trim().ToLower() == "Seat".Trim().ToLower())
                    {
                        model.DisplayTeacherOption = true;

                        var q = from x in db.TblSCs
                                where x.Id.ToLower() == User.Identity.GetUserId().ToLower()
                                select x;

                        if (q != null && q.Count() == 1)
                        {
                            TblSC tblSC = q.Single();
                            tblSC.Name = fullName;
                            tblSC.ClassroomId = selectedClassroom;
                            // remove assigned students
                            var qPC = from x in db.TblPCs
                                      where x.ClassroomId.ToLower() == selectedClassroom.ToLower() && x.ScUid.HasValue && x.ScUid == tblSC.Uid
                                      select x;
                            foreach (TblPC tblPC in qPC.Select(x => x))
                            {
                                tblPC.ScUid = null;
                                tblPC.Position = 0;
                            }

                            try
                            {
                                db.SubmitChanges();
                            }
                            catch (Exception ex)
                            {
                            }
                        }
                        else
                        {
                            Guid scUid = Guid.NewGuid();
                            db.TblSCs.InsertOnSubmit(new TblSC
                            {
                                Uid = scUid,
                                Id = CurrentUserId,
                                ClassroomId = selectedClassroom,
                                Name = fullName
                            });

                        }
                        try
                        {
                            db.SubmitChanges();
                        }
                        catch (Exception e)
                        {

                        }

                    }
                    //Featured
                    if (item.Trim().ToLower() == "Featured".Trim().ToLower())
                    {

                        model.DisplayTeacherOption = true;

                        var q = from x in db.TblFCs
                                where x.Id.ToLower() == User.Identity.GetUserId().ToLower()
                                select x;

                        if (q != null && q.Count() == 1)
                        {
                            TblFC tblFC = q.Single();
                            tblFC.Name = fullName;
                            tblFC.ClassroomId = selectedClassroom;


                            try
                            {
                                db.SubmitChanges();
                                // remove assigned students
                                db.TblFCPCs.DeleteAllOnSubmit(from x in db.TblFCPCs
                                                              where x.FcUid == tblFC.Uid
                                                              select x);
                                db.SubmitChanges();
                            }

                            catch (Exception e)
                            {

                            }
                        }
                        else
                        {
                            //inseret
                            Guid fcUid = Guid.NewGuid();
                            db.TblFCs.InsertOnSubmit(new TblFC
                            {
                                Uid = fcUid,
                                Id = CurrentUserId,
                                ClassroomId = selectedClassroom,
                                Name = fullName
                            });

                        }

                        try
                        {
                            db.SubmitChanges();
                        }
                        catch (Exception e)
                        {

                        }

                    }


                    //moderator
                    else if (item == "Moderator")
                    {
                        model.DisplayAllOption = true;
                        model.DisplayTeacherOption = true;

                        //if is in student role
                        var q = from x in db.TblModerators
                                where x.Id == User.Identity.GetUserId()
                                select x;
                        if (q != null && q.Count() == 1)
                        {
                            TblModerator tblModerator = q.Single();
                            tblModerator.Name = fullName;
                            tblModerator.Address1 = model.Address1 != null ? model.Address1 : string.Empty;
                            tblModerator.State = model.State != null ? model.State : string.Empty;
                            tblModerator.City = model.City != null ? model.City : string.Empty;
                            tblModerator.Country = selectedCountry;
                            tblModerator.ZipCode = model.ZipCode != null ? model.ZipCode : string.Empty;

                            tblModerator.ClassroomId = selectedClassroom;
                            tblModerator.TcUid = selectedTeacher;
                        }
                        else
                        {

                            Guid pcUid = Guid.NewGuid();

                            //insert
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
                        }

                        try
                        {
                            db.SubmitChanges();
                        }
                        catch (Exception)
                        {

                        }
                    }

                }

                return RedirectToAction("Index", "Manage", new { Message = ManageMessageId.EditProfileSUccess });
            }

            return View(model);

        }

        public ActionResult FillTeachers(string id)
        {
            var vm = new VirtualClassroom.Models.TeacherViewModel()
            {
                selectedClassroomId = id
            };

            return PartialView("_TeachersEditProfile", vm);
        }

        //
        // GET: /Account/RemoveLogin
        public ActionResult RemoveLogin()
        {
            var linkedAccounts = UserManager.GetLogins(User.Identity.GetUserId());
            ViewBag.ShowRemoveButton = HasPassword() || linkedAccounts.Count > 1;
            return View(linkedAccounts);
        }

        //
        // POST: /Manage/RemoveLogin
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<ActionResult> RemoveLogin(string loginProvider, string providerKey)
        {
            ManageMessageId? message;
            var result = await UserManager.RemoveLoginAsync(User.Identity.GetUserId(), new UserLoginInfo(loginProvider, providerKey));
            if (result.Succeeded)
            {
                var user = await UserManager.FindByIdAsync(User.Identity.GetUserId());
                if (user != null)
                {
                    await SignInAsync(user, isPersistent: false);
                }
                message = ManageMessageId.RemoveLoginSuccess;
            }
            else
            {
                message = ManageMessageId.Error;
            }
            return RedirectToAction("ManageLogins", new { Message = message });
        }

        //
        // GET: /Account/AddPhoneNumber
        public ActionResult AddPhoneNumber()
        {
            return View();
        }

        //
        // POST: /Account/AddPhoneNumber
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<ActionResult> AddPhoneNumber(AddPhoneNumberViewModel model)
        {
            if (!ModelState.IsValid)
            {
                return View(model);
            }
            // Generate the token and send it
            var code = await UserManager.GenerateChangePhoneNumberTokenAsync(User.Identity.GetUserId(), model.Number);
            if (UserManager.SmsService != null)
            {
                var message = new IdentityMessage
                {
                    Destination = model.Number,
                    Body = "Your security code is: " + code
                };
                await UserManager.SmsService.SendAsync(message);
            }
            return RedirectToAction("VerifyPhoneNumber", new { PhoneNumber = model.Number });
        }

        //
        // POST: /Manage/RememberBrowser
        [HttpPost]
        public ActionResult RememberBrowser()
        {
            var rememberBrowserIdentity = AuthenticationManager.CreateTwoFactorRememberBrowserIdentity(User.Identity.GetUserId());
            AuthenticationManager.SignIn(new AuthenticationProperties { IsPersistent = true }, rememberBrowserIdentity);
            return RedirectToAction("Index", "Manage");
        }

        //
        // POST: /Manage/ForgetBrowser
        [HttpPost]
        public ActionResult ForgetBrowser()
        {
            AuthenticationManager.SignOut(DefaultAuthenticationTypes.TwoFactorRememberBrowserCookie);
            return RedirectToAction("Index", "Manage");
        }

        //
        // POST: /Manage/EnableTFA
        [HttpPost]
        public async Task<ActionResult> EnableTFA()
        {
            await UserManager.SetTwoFactorEnabledAsync(User.Identity.GetUserId(), true);
            var user = await UserManager.FindByIdAsync(User.Identity.GetUserId());
            if (user != null)
            {
                await SignInAsync(user, isPersistent: false);
            }
            return RedirectToAction("Index", "Manage");
        }

        //
        // POST: /Manage/DisableTFA
        [HttpPost]
        public async Task<ActionResult> DisableTFA()
        {
            await UserManager.SetTwoFactorEnabledAsync(User.Identity.GetUserId(), false);
            var user = await UserManager.FindByIdAsync(User.Identity.GetUserId());
            if (user != null)
            {
                await SignInAsync(user, isPersistent: false);
            }
            return RedirectToAction("Index", "Manage");
        }

        //
        // GET: /Account/VerifyPhoneNumber
        public async Task<ActionResult> VerifyPhoneNumber(string phoneNumber)
        {
            // This code allows you exercise the flow without actually sending codes
            // For production use please register a SMS provider in IdentityConfig and generate a code here.
            var code = await UserManager.GenerateChangePhoneNumberTokenAsync(User.Identity.GetUserId(), phoneNumber);
            ViewBag.Status = "For DEMO purposes only, the current code is " + code;
            return phoneNumber == null ? View("Error") : View(new VerifyPhoneNumberViewModel { PhoneNumber = phoneNumber });
        }

        //
        // POST: /Account/VerifyPhoneNumber
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<ActionResult> VerifyPhoneNumber(VerifyPhoneNumberViewModel model)
        {
            if (!ModelState.IsValid)
            {
                return View(model);
            }
            var result = await UserManager.ChangePhoneNumberAsync(User.Identity.GetUserId(), model.PhoneNumber, model.Code);
            if (result.Succeeded)
            {
                var user = await UserManager.FindByIdAsync(User.Identity.GetUserId());
                if (user != null)
                {
                    await SignInAsync(user, isPersistent: false);
                }
                return RedirectToAction("Index", new { Message = ManageMessageId.AddPhoneSuccess });
            }
            // If we got this far, something failed, redisplay form
            ModelState.AddModelError("", "Failed to verify phone");
            return View(model);
        }

        //
        // GET: /Account/RemovePhoneNumber
        public async Task<ActionResult> RemovePhoneNumber()
        {
            var result = await UserManager.SetPhoneNumberAsync(User.Identity.GetUserId(), null);
            if (!result.Succeeded)
            {
                return RedirectToAction("Index", new { Message = ManageMessageId.Error });
            }
            var user = await UserManager.FindByIdAsync(User.Identity.GetUserId());
            if (user != null)
            {
                await SignInAsync(user, isPersistent: false);
            }
            return RedirectToAction("Index", new { Message = ManageMessageId.RemovePhoneSuccess });
        }

        //
        // GET: /Manage/ChangePassword
        public ActionResult ChangePassword()
        {
            return View();
        }

        //
        // POST: /Account/Manage
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<ActionResult> ChangePassword(ChangePasswordViewModel model)
        {
            if (!ModelState.IsValid)
            {
                return View(model);
            }
            var result = await UserManager.ChangePasswordAsync(User.Identity.GetUserId(), model.OldPassword, model.NewPassword);
            if (result.Succeeded)
            {
                var user = await UserManager.FindByIdAsync(User.Identity.GetUserId());
                if (user != null)
                {
                    await SignInAsync(user, isPersistent: false);
                    //send mail
                    string FullName = string.Empty;
                    if (user.FullName != null)
                    {
                        FullName = user.FullName;
                    }
                    else
                    {
                        FullName = User.Identity.GetUserName();
                    }
                    string body = "Dear " + FullName + "," +

                            "\n\nRecently your Virtual Classroom account password has changed." +

                            "\n\nIf you did not initiate this request, please contact us immediately at support@example.com." +
                            "\n\nThank you," +
                            "\nThe Virtual Classroom Team.";

                    await UserManager.SendEmailAsync(user.Id, "Your Virtual Classroom account password has changed", body);
                    //end email
                }
                return RedirectToAction("Index", new { Message = ManageMessageId.ChangePasswordSuccess });
            }
            AddErrors(result);
            return View(model);
        }

        //
        // GET: /Manage/SetPassword
        public ActionResult SetPassword()
        {
            return View();
        }

        //
        // POST: /Manage/SetPassword
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<ActionResult> SetPassword(SetPasswordViewModel model)
        {
            if (ModelState.IsValid)
            {
                var result = await UserManager.AddPasswordAsync(User.Identity.GetUserId(), model.NewPassword);
                if (result.Succeeded)
                {
                    var user = await UserManager.FindByIdAsync(User.Identity.GetUserId());
                    if (user != null)
                    {
                        await SignInAsync(user, isPersistent: false);
                    }
                    return RedirectToAction("Index", new { Message = ManageMessageId.SetPasswordSuccess });
                }
                AddErrors(result);
            }

            // If we got this far, something failed, redisplay form
            return View(model);
        }

        //
        // GET: /Account/Manage
        public async Task<ActionResult> ManageLogins(ManageMessageId? message)
        {
            ViewBag.StatusMessage =
                message == ManageMessageId.RemoveLoginSuccess ? "The external login was removed."
                : message == ManageMessageId.Error ? "An error has occurred."
                : "";
            var user = await UserManager.FindByIdAsync(User.Identity.GetUserId());
            if (user == null)
            {
                return View("Error");
            }
            var userLogins = await UserManager.GetLoginsAsync(User.Identity.GetUserId());
            var otherLogins = AuthenticationManager.GetExternalAuthenticationTypes().Where(auth => userLogins.All(ul => auth.AuthenticationType != ul.LoginProvider)).ToList();
            ViewBag.ShowRemoveButton = user.PasswordHash != null || userLogins.Count > 1;
            return View(new ManageLoginsViewModel
            {
                CurrentLogins = userLogins,
                OtherLogins = otherLogins
            });
        }

        //
        // POST: /Manage/LinkLogin
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult LinkLogin(string provider)
        {
            // Request a redirect to the external login provider to link a login for the current user
            return new AccountController.ChallengeResult(provider, Url.Action("LinkLoginCallback", "Manage"), User.Identity.GetUserId());
        }

        //
        // GET: /Manage/LinkLoginCallback
        public async Task<ActionResult> LinkLoginCallback()
        {
            var loginInfo = await AuthenticationManager.GetExternalLoginInfoAsync(XsrfKey, User.Identity.GetUserId());
            if (loginInfo == null)
            {
                return RedirectToAction("ManageLogins", new { Message = ManageMessageId.Error });
            }
            var result = await UserManager.AddLoginAsync(User.Identity.GetUserId(), loginInfo.Login);
            return result.Succeeded ? RedirectToAction("ManageLogins") : RedirectToAction("ManageLogins", new { Message = ManageMessageId.Error });
        }

        #region Helpers
        // Used for XSRF protection when adding external logins
        private const string XsrfKey = "XsrfId";

        private IAuthenticationManager AuthenticationManager
        {
            get
            {
                return HttpContext.GetOwinContext().Authentication;
            }
        }

        private async Task SignInAsync(ApplicationUser user, bool isPersistent)
        {
            AuthenticationManager.SignOut(DefaultAuthenticationTypes.ExternalCookie, DefaultAuthenticationTypes.TwoFactorCookie);
            AuthenticationManager.SignIn(new AuthenticationProperties { IsPersistent = isPersistent }, await user.GenerateUserIdentityAsync(UserManager));
        }

        private void AddErrors(IdentityResult result)
        {
            foreach (var error in result.Errors)
            {
                ModelState.AddModelError("", error);
            }
        }

        private bool HasPassword()
        {
            var user = UserManager.FindById(User.Identity.GetUserId());
            if (user != null)
            {
                return user.PasswordHash != null;
            }
            return false;
        }

        private bool HasPhoneNumber()
        {
            var user = UserManager.FindById(User.Identity.GetUserId());
            if (user != null)
            {
                return user.PhoneNumber != null;
            }
            return false;
        }

        public enum ManageMessageId
        {
            AddPhoneSuccess,
            ChangePasswordSuccess,
            SetTwoFactorSuccess,
            SetPasswordSuccess,
            RemoveLoginSuccess,
            RemovePhoneSuccess,
            Error,
            EditProfileSUccess
        }

        #endregion
    }
}