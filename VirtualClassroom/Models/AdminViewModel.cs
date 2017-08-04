using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Web.Mvc;

namespace VirtualClassroom.Models
{
    public class RoleViewModel
    {
        public string Id { get; set; }
        [Required(AllowEmptyStrings = false)]
        [Display(Name = "RoleName")]
        public string Name { get; set; }
        
        //custom
        public string Description { get; set; }
    }

    public class EditUserViewModel
    {
        public string Id { get; set; }

        [Required(AllowEmptyStrings = false)]
        [Display(Name = "Email")]
        [EmailAddress]
        public string Email { get; set; }

        public IEnumerable<SelectListItem> RolesList { get; set; }

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


        [Required]
        [Display(Name = "Country")]
        public string SelectedCountry { get; set; }


        [Display(Name = "Zip Code")]
        public string ZipCode { get; set; }


        [Display(Name = "Classroom")]
        public IEnumerable<SelectListItem> Classroom { get; set; }

        [Required]
        [Display(Name = "Classroom")]
        public string SelectedClassroom { get; set; }


        [Display(Name = "Teacher")]

        public IEnumerable<SelectListItem> Teacher { get; set; }

        [Required]
        [Display(Name = "Teacher")]
        public string SelectedTeacher { get; set; }

    }
}