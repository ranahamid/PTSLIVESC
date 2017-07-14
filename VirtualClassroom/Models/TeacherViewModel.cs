using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace VirtualClassroom.Models
{

    public class TeacherViewModel:RegisterViewModel
    {
        private VirtualClassroomDataContext db;
        public TeacherViewModel()
        {
            db = new VirtualClassroomDataContext();
        }

       
        public string selectedClassroomId { get; set; }

        [Display(Name = "Classroom")]
        public IEnumerable<SelectListItem> TeacherslList
        {
            get
            {
                var TblTeachers = from x in db.TblTCs
                                    where x.ClassroomId==selectedClassroomId
                                    select x;

                List<SelectListItem> _teachers = new List<SelectListItem>();
                foreach (var item in TblTeachers)
                {
                    if(item.Uid!=null)
                    {
                        _teachers.Add(new SelectListItem
                        {
                            Text = item.Name,
                            Value = (item.Uid).ToString().ToUpper()
                    });
                    }
                }
                return _teachers;
            }
        }

    }
}