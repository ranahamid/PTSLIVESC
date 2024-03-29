﻿using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;

namespace VirtualClassroom.Models
{
    public class Computer
    {
        public Guid uid { get; set; }
        public string id { get; set; }
        public string name { get; set; }
    }

    public class ClassroomViewModel
    {
        public List<Classroom> classRoom { get; set; }
        public IList<String> Roles { get; set; }
        public string UserId { get; set; }
        public string FullName { get; set; }
    }

    [DataObject]
    public class Classroom
    {

        public string id { get; set; }
        public string name { get; set; }
        public string url { get; set; }
        public int? IsActive { get; set; }

        public List<Seat> seats { get; set; }
        public List<Teacher> teachers { get; set; }
        public List<Moderator> moderators { get; set; }
        public List<Featured> featureds { get; set; }

        //without seat computer
        public List<Student> studentsWithOutSeat { get; set; }

        //without seat and teacher computer
        public List<Student> studentsWithOutSeatTeacher { get; set; }

        

    }



    [DataObject]
    public class Seat : Computer
    {
        public List<Student> students { get; set; }
    }

    [DataObject]
    public class Student : Computer
    {
        public int position { get; set; }
        public Teacher teacher { get; set; }
      //  public string featuredpcname{get;set;}
        public Guid FcUid { get; set; }
        public string address1 { get; set; }
        public string State { get; set; }
        public string City { get; set; }
        public string ZipCode { get; set; }
        public string Country { get; set; }

        //add
        public Featured featured { get; set; }
    }


    [DataObject]
    public class Moderator : Computer
    {
        public string title { get; set; }
        public int position { get; set; }
        public Teacher teacher { get; set; }
      //  public string featuredpcname { get; set; }
        public Guid FcUid { get; set; }
        public string address1 { get; set; }
        public string State { get; set; }
        public string City { get; set; }
        public string ZipCode { get; set; }
        public string Country { get; set; }
    }

    [DataObject]
    public class Teacher : Computer
    {
    }
   
    [DataObject]
    public class Featured : Computer
    {
        public List<Student> students { get; set; }
    }

    [DataObject]
    public class Form
    {
        public string id { get; set; }
        public string title { get; set; }
        public Forms.FormType type { get; set; }
        public int pendingCount { get; set; }
        public int answeredCount { get; set; }
        public int declinedCount { get; set; }


        public Form(TblForm form, Guid? tcUid)
        {
            id = form.Uid.ToString();
            title = form.Title;
            type = (Forms.FormType)form.Type;
            pendingCount = form.TblFormAnswers.Where(z => z.Status == (int)Forms.FormAnswerStatus.Pending && z.TblPC.TcUid == tcUid).Count();
            answeredCount = form.TblFormAnswers.Where(z => z.Status == (int)Forms.FormAnswerStatus.Answered && z.TblPC.TcUid == tcUid).Count();
            declinedCount = form.TblFormAnswers.Where(z => z.Status == (int)Forms.FormAnswerStatus.Declined && z.TblPC.TcUid == tcUid).Count();
        }
    }

    [DataObject]
    public class Answer
    {
        public string id { get; set; }
        public string title { get; set; }
        public string name { get; set; }
        public Forms.FormAnswerStatus status { get; set; }
        public Form form { get; set; }

        public Answer(TblFormAnswer answer)
        {
            id = answer.Uid.ToString();
            title = answer.Title;
            name = answer.TblPC.Name;
            status = (Forms.FormAnswerStatus)answer.Status;
            form = new Form(answer.TblForm, answer.TblPC.TcUid);
        }
    }
}