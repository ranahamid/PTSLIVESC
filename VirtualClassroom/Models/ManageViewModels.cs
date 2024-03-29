﻿using Microsoft.AspNet.Identity;
using Microsoft.Owin.Security;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Configuration;
using System.Web.Mvc;

namespace VirtualClassroom.Models
{
    public class IndexViewModel
    {
        public bool HasPassword { get; set; }
        public IList<UserLoginInfo> Logins { get; set; }
        public string PhoneNumber { get; set; }
        public bool TwoFactor { get; set; }
        public bool BrowserRemembered { get; set; }
    }
    public class DetailsUserAdminViewModel
    {
        public ApplicationUser user { get; set; }
        [Required]
        [Display(Name = "Full Name")]
        public string FullName { get; set; }


        [Display(Name = "Address1")]
        public string Address1 { get; set; }

        [Display(Name = "State")]
        public string State { get; set; }

        [Display(Name = "City")]
        public string City { get; set; }

        [Required]
        [Display(Name = "Country")]
        public string SelectedCountry { get; set; }


        [Display(Name = "Zip Code")]
        public string ZipCode { get; set; }

        [Required]
        [Display(Name = "Classroom")]
        public string SelectedClassroom { get; set; }


        [Required]
        [Display(Name = "Teacher")]
        public string SelectedTeacher { get; set; }

    }
    public class EditProfileViewModel
    {
        public bool DisplayAllOption { get; set; }

        public bool DisplayTeacherOption { get; set; }


        [Required]
        [Display(Name = "Full Name")]
        public string FullName { get; set; }


        [Display(Name = "Address1")]
        public string Address1 { get; set; }

        [Display(Name = "State")]
        public string State { get; set; }

        [Display(Name = "City")]
        public string City { get; set; }

        [Display(Name = "Country")]
        public IEnumerable<SelectListItem> Country { get; set; }


        [Display(Name = "Country")]
        public string SelectedCountry { get; set; }


        [Display(Name = "Zip Code")]
        public string ZipCode { get; set; }


        [Display(Name = "Classroom")]
        public IEnumerable<SelectListItem> Classroom { get; set; }


        [Display(Name = "Classroom")]
        public string SelectedClassroom { get; set; }


        [Display(Name = "Teacher")]

        public IEnumerable<SelectListItem> Teacher { get; set; }


        [Display(Name = "Teacher")]
        public string SelectedTeacher { get; set; }

    }
    public class ManageLoginsViewModel
    {
        public IList<UserLoginInfo> CurrentLogins { get; set; }
        public IList<AuthenticationDescription> OtherLogins { get; set; }
    }

    public class FactorViewModel
    {
        public string Purpose { get; set; }
    }

    public class SetPasswordViewModel
    {
        [Required]
        [StringLength(100, ErrorMessage = "The {0} must be at least {2} characters long.", MinimumLength = 6)]
        [DataType(DataType.Password)]
        [Display(Name = "New password")]
        public string NewPassword { get; set; }

        [DataType(DataType.Password)]
        [Display(Name = "Confirm new password")]
        [System.ComponentModel.DataAnnotations.Compare("NewPassword", ErrorMessage = "The new password and confirmation password do not match.")]
        public string ConfirmPassword { get; set; }
    }

    public class ChangePasswordViewModel
    {
        [Required]
        [DataType(DataType.Password)]
        [Display(Name = "Current password")]
        public string OldPassword { get; set; }

        [Required]
        [StringLength(100, ErrorMessage = "The {0} must be at least {2} characters long.", MinimumLength = 4)]
        [DataType(DataType.Password)]
        [Display(Name = "New password")]
        public string NewPassword { get; set; }

        [DataType(DataType.Password)]
        [Display(Name = "Confirm new password")]
        [System.ComponentModel.DataAnnotations.Compare("NewPassword", ErrorMessage = "The new password and confirmation password do not match.")]
        public string ConfirmPassword { get; set; }
    }


    public class AddPhoneNumberViewModel
    {
        [Required]
        [Phone]
        [Display(Name = "Phone Number")]
        public string Number { get; set; }
    }

    public class VerifyPhoneNumberViewModel
    {
        [Required]
        [Display(Name = "Code")]
        public string Code { get; set; }

        [Required]
        [Phone]
        [Display(Name = "Phone Number")]
        public string PhoneNumber { get; set; }
    }

    public class ConfigureTwoFactorViewModel
    {
        public string SelectedProvider { get; set; }
        public ICollection<System.Web.Mvc.SelectListItem> Providers { get; set; }
    }

}