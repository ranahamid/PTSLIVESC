using System;
using System.Collections.Generic;

namespace VirtualClassroom.Models
{
    public class Forms
    {
        public enum FormType : int
        {
            Survey = 1,
            Poll = 2
        }
        public enum FormAnswerStatus : int
        {
            Pending = 1,
            Answered = 2,
            Declined = 3
        }

        public enum ComponentTypes : int
        {
            Label = 1,
            Textbox = 2,
            Radiobuttons = 3,
            Checkboxes = 4
        }

        public class FormData
        {
            public Guid uid { get; set; }
            public string classroomId { get; set; }
            public FormType type { get; set; }
            public string title { get; set; }
            public string formData { get; set; }

            public FormData()
            {
            }
            public FormData(TblForm form) {
                uid = form.Uid;
                classroomId = form.ClassroomId.ToString();
                type = (FormType)form.Type;
                title = form.Title;
                formData = form.Data;
            }
        }
        public class FormAnswerData : FormData
        {
            public FormAnswerStatus status { get; set; }
            public Guid formUid { get; set; }

            public FormAnswerData()
            {
            }
            public FormAnswerData(TblFormAnswer answer) : base(answer.TblForm)
            {
                uid = answer.Uid;
                title = answer.Title;
                formData = answer.Data;
                status = (FormAnswerStatus)answer.Status;
                formUid = answer.FormUid;
            }
        }
        public class FormResultData : FormData
        {
            public int totalAnswers { get; set; }

            public FormResultData()
            {
            }
            public FormResultData(TblForm form) : base(form)
            {
            }
        }

        public class FormComponent
        {
            public ComponentTypes type { get; set; }
            public string configData { get; set; }
            public string answerData { get; set; }
        }

        public class Components
        {
            public class Label
            {
                public class IConfig
                {
                    public string text { get; set; }
                }
                public class IAnswer
                {
                }
            }
            public class Textbox
            {
                public class IConfig
                {
                    public bool required { get; set; }
                }
                public class IAnswer
                {
                    public string text { get; set; }
                }
            }
            public class Radiobuttons
            {
                public class IRadioButton
                {
                    public int id { get; set; }
                    public string text { get; set; }
                }
                public class IConfig
                {
                    public List<IRadioButton> items { get; set; }
                }
                public class IAnswer
                {
                    public int selectedItem { get; set; }
                }
            }
            public class Checkboxes
            {
                public class ICheckBox
                {
                    public int id { get; set; }
                    public string text { get; set; }
                }
                public class IConfig
                {
                    public List<ICheckBox> items { get; set; }
                }
                public class IAnswer
                {
                    public List<int> checkedItems { get; set; }
                }
            }
        }
    }
}