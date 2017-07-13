using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace VirtualClassroom.Models
{

    public class TeacherViewModel
    {
        private VirtualClassroomDataContext db;
        public TeacherViewModel()
        {
            db = new VirtualClassroomDataContext();
        }

        public string selectedTeacherId { get; set; }
        public string selectedClassroomId { get; set; }

        [Display(Name = "Classroom")]
        public IEnumerable<SelectListItem> Teacher
        {
            get
            {
                var TblTeachers = from x in db.TblTCs
                                    where x.ClassroomId==selectedClassroomId
                                    select x;

                List<SelectListItem> _teachers = new List<SelectListItem>();
                foreach (var item in TblTeachers)
                {
                    _teachers.Add(new SelectListItem
                    {
                        Text = item.Name,
                        Value = item.Id,
                        //Selected = (item.TwoCharCountryCode == "US") ? true : false
                    });
                }
                return _teachers;
            }
        }

    }
}