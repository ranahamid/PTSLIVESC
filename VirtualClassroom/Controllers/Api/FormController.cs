using System;
using System.Collections.Generic;
using System.Data.Linq;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using Newtonsoft.Json;
using VirtualClassroom.Models;

namespace VirtualClassroom.Controllers
{
    public class FormController : Interfaces.ApiControllerR
    {
        private VirtualClassroomDataContext db;

        public FormController()
        {
            db = new VirtualClassroomDataContext();
        }

        // api/Form/Get/{uid}
        [HttpGet]
        public DataResponse<Forms.FormData> Get(Guid uid)
        {
            var q = from x in db.TblForms
                    where x.Uid == uid
                    select x;

            if (q.Count() == 1)
            {
                TblForm form = q.Single();

                Forms.FormData data = new Forms.FormData(form);

                return responseSuccess(data);
            }
            else
            {
                return responseError<Forms.FormData>("Form Uid not found.");
            }
        }

        // api/Form/GetAnswer/{uid}
        [HttpGet]
        public DataResponse<Forms.FormAnswerData> GetAnswer(Guid uid)
        {
            var q = from x in db.TblFormAnswers
                    where x.Uid == uid
                    select x;

            if (q.Count() == 1)
            {
                TblFormAnswer answer = q.Single();

                Forms.FormAnswerData data = new Forms.FormAnswerData(answer);

                return responseSuccess(data);
            }
            else
            {
                return responseError<Forms.FormAnswerData>("Answer Uid not found.");
            }
        }

        // api/Form/GetResult/{uid}
        [HttpGet]
        public DataResponse<Forms.FormResultData> GetResult(Guid uid)
        {
            var q = from x in db.TblForms
                    where x.Uid == uid
                    select x;

            if (q.Count() == 1)
            {
                Forms.FormResultData data = new Forms.FormResultData(q.Single());

                var qA = from x in db.TblFormAnswers
                         where x.FormUid == uid && x.Status == (int)Forms.FormAnswerStatus.Answered
                         select x;

                List<List<int>> results = new List<List<int>>();

                // build result data
                int countOfAnswers = 0;

                // initilize new results arrays
                List<Forms.FormComponent> formComponents = JsonConvert.DeserializeObject<List<Forms.FormComponent>>(data.formData);
                for (int i = 0; i < formComponents.Count; i++)
                {
                    switch (formComponents[i].type)
                    {
                        case Forms.ComponentTypes.Checkboxes:
                            Forms.Components.Checkboxes.IConfig configCheckboxes = JsonConvert.DeserializeObject<Forms.Components.Checkboxes.IConfig>(formComponents[i].configData);
                            results.Add(configCheckboxes.items.Select(x => 0).ToList());
                            results[results.Count - 1].Add(0); // total count
                            break;
                        case Forms.ComponentTypes.Radiobuttons:
                            Forms.Components.Radiobuttons.IConfig configRadiobuttons = JsonConvert.DeserializeObject<Forms.Components.Radiobuttons.IConfig>(formComponents[i].configData);
                            results.Add(configRadiobuttons.items.Select(x => 0).ToList());
                            results[results.Count - 1].Add(0); // total count
                            break;
                        default:
                            results.Add(null);
                            break;
                    }
                }

                foreach (TblFormAnswer answer in qA.Select(x => x))
                {
                    List<Forms.FormComponent> components = JsonConvert.DeserializeObject<List<Forms.FormComponent>>(answer.Data);

                    for (int i = 0; i < components.Count; i++)
                    {
                        // build result for poll components
                        switch (components[i].type)
                        {
                            case Forms.ComponentTypes.Checkboxes:
                                Forms.Components.Checkboxes.IAnswer answerCheckboxes = JsonConvert.DeserializeObject<Forms.Components.Checkboxes.IAnswer>(components[i].answerData);
                                for (int j = 0; j < answerCheckboxes.checkedItems.Count; j++)
                                {
                                    results[i][answerCheckboxes.checkedItems[j] - 1]++;
                                }
                                results[i][results[i].Count - 1]++; // total count
                                break;
                            case Forms.ComponentTypes.Radiobuttons:
                                Forms.Components.Radiobuttons.IAnswer answerRadiobuttons = JsonConvert.DeserializeObject<Forms.Components.Radiobuttons.IAnswer>(components[i].answerData);
                                results[i][answerRadiobuttons.selectedItem - 1]++;
                                results[i][results[i].Count - 1]++; // total count
                                break;
                        }
                    }
                    countOfAnswers++;
                }

                // update data - answer will be result
                data.totalAnswers = countOfAnswers;

                for (int i = 0; i < formComponents.Count; i++)
                {
                    formComponents[i].answerData = JsonConvert.SerializeObject(results[i]);
                }
                // serialize back
                data.formData = JsonConvert.SerializeObject(formComponents);

                return responseSuccess(data);
            }
            else
            {
                return responseError<Forms.FormResultData>("Form Uid not found.");
            }
        }

        // api/Form/Insert/
        [HttpPost]
        public DataResponse<Guid?> Insert([FromBody] Forms.FormData data)
        {
            Guid? uid = Guid.NewGuid();

            db.TblForms.InsertOnSubmit(new TblForm
            {
                Uid = uid.Value,
                ClassroomId = data.classroomId,
                Type = (int)data.type,
                Title = data.title,
                Data = data.formData
            });

            try
            {
                db.SubmitChanges();

                return responseSuccess(uid);
            }
            catch (Exception ex)
            {
                return responseError<Guid?>(ex.Message);
            }
        }

        // api/Form/Update/
        [HttpPost]
        public DataResponse<bool> Update([FromBody] Forms.FormData data)
        {
            var q = from x in db.TblForms
                    where x.Uid == data.uid
                    select x;

            if (q.Count() == 1)
            {
                TblForm form = q.Single();

                // when form is poll has changed, remove form answers
                if (form.Type == (int)Forms.FormType.Poll && form.Data != data.formData)
                {
                    db.TblFormAnswers.DeleteAllOnSubmit(from x in db.TblFormAnswers
                                                        where x.FormUid == data.uid
                                                        select x);
                }

                form.Title = data.title;
                form.Data = data.formData;

                try
                {
                    db.SubmitChanges();

                    return responseSuccess(true);
                }
                catch (Exception ex)
                {
                    return responseError<bool>(ex.Message);
                }
            }
            else
            {
                return responseError<bool>("Form Uid not found.");
            }
        }

        // api/Form/Delete/{uid}
        [HttpPost]
        public DataResponse<bool> Delete(Guid uid)
        {
            var q = from x in db.TblForms
                    where x.Uid == uid
                    select x;

            if (q.Count() == 1)
            {
                // delete form answers
                db.TblFormAnswers.DeleteAllOnSubmit(from x in db.TblFormAnswers
                                                    where x.FormUid == uid
                                                    select x);

                // delete form
                db.TblForms.DeleteAllOnSubmit(q);

                try
                {
                    db.SubmitChanges();

                    return responseSuccess(true);
                }
                catch (Exception ex)
                {
                    return responseError<bool>(ex.Message);
                }
            }
            else
            {
                return responseError<bool>("Form Uid not found.");
            }
        }

        // api/Form/UpdateAnswer/
        public DataResponse<bool> UpdateAnswer([FromBody] Forms.FormAnswerData data)
        {
            var q = from x in db.TblFormAnswers
                    where x.Uid == data.uid
                    select x;

            if (q.Count() == 1)
            {
                TblFormAnswer answer = q.Single();

                if (data.status == Forms.FormAnswerStatus.Answered)
                {
                    answer.Status = (int)data.status;
                    answer.Data = data.formData;
                    answer.Answered = DateTime.UtcNow;
                }
                else if (data.status == Forms.FormAnswerStatus.Declined)
                {
                    answer.Status = (int)data.status;
                    answer.Answered = DateTime.UtcNow;
                }

                try
                {
                    db.SubmitChanges();

                    return responseSuccess(true);
                }
                catch (Exception ex)
                {
                    return responseError<bool>(ex.Message);
                }
            }
            else
            {
                return responseError<bool>("Form Answer Uid not found.");
            }
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
