using System;
using System.Collections.Generic;
using System.Data.Linq;
using System.Linq;
using System.Web.Http;
using VirtualClassroom.Models;

namespace VirtualClassroom.Controllers
{
    public class ClassroomController : Interfaces.ApiControllerR
    {
        private VirtualClassroomDataContext db;

        public ClassroomController()
        {
            db = new VirtualClassroomDataContext();
        }

        private bool isValidId(string id)
        {
            bool valid = id.Length > 0;
            string allowedChars = "abcdefghijklmnopqrstuvwxyz0123456789";

            // check allowed chars
            if (valid)
            {
                for (var i = 0; i < id.Length && valid; i++)
                {
                    if (allowedChars.IndexOf(id[i].ToString().ToLower()) == -1)
                    {
                        valid = false;
                    }
                }
            }

            return valid;
        }

        [HttpGet]
        public DataResponse<List<Computer>> GetAvailableSeatStudents(string classroomId)
        {
            Guid? scUid = null;

            var q = from x in db.TblPCs
                    where x.ClassroomId.ToLower() == classroomId.ToLower() &&
                    !x.ScUid.HasValue || x.ScUid == scUid
                    select x;

            List<Computer> data = q.Select(x =>
                new Computer() { uid = x.Uid, id = x.Id, name = x.Name }
                ).ToList();

            return responseSuccess(data);
        }
        [HttpGet]
        public DataResponse<List<Computer>> GetAvailableSeatStudents(string classroomId, string id) // id allows to load assigned students to the current seat id
        {
            Guid? scUid = null;
            if (!String.IsNullOrEmpty(id))
            {
                var qSC = from x in db.TblSCs
                          where x.ClassroomId.ToLower() == classroomId.ToLower()
                          && x.Id.ToLower() == id.ToLower()
                          select x;

                if (qSC.Count() == 1)
                {
                    scUid = qSC.Single().Uid;
                }
            }

            var q = from x in db.TblPCs
                    where x.ClassroomId.ToLower() == classroomId.ToLower() &&
                    !x.ScUid.HasValue || x.ScUid == scUid
                    select x;

            List<Computer> data = q.Select(x =>
                new Computer() { uid = x.Uid, id = x.Id, name = x.Name }
                ).ToList();

            return responseSuccess(data);
        }
        [HttpGet]
        public DataResponse<List<Computer>> GetAvailableFeaturedStudents(string classroomId)
        {
            var q = from x in db.TblPCs
                    where x.ClassroomId.ToLower() == classroomId.ToLower()
                    select x;

            List<Computer> data = q.Select(x =>
                new Computer() { uid = x.Uid, id = x.Id, name = x.Name }
                ).ToList();

            return responseSuccess(data);
        }
        [HttpGet]
        public DataResponse<List<Computer>> GetAvailableTeachers(string classroomId)
        {
            var q = from x in db.TblTCs
                    where x.ClassroomId.ToLower() == classroomId.ToLower()
                    select x;

            List<Computer> data = q.Select(x =>
                new Computer() { uid = x.Uid, id = x.Id, name = x.Name }
                ).ToList();

            return responseSuccess(data);
        }

        [HttpGet]
        public DataResponse<List<Classroom>> Load()
        {
            List<Classroom> data = db.TblClassrooms.OrderBy(x => x.Id).Select(x => new Classroom()
            {
                id = x.Id,
                name = x.Name,
                IsActive = x.IsActive,
                url = this.Url.Link("AdminClassroom", new { controller = "Admin", action = "Classroom", classroomId = x.Id })
            }).ToList();

            return responseSuccess(data);
        }
        [HttpGet]
        public DataResponse<List<Seat>> LoadSeats(string classroomId)
        {
            List<Seat> data = db.TblSCs.Where(x => x.ClassroomId.ToLower() == classroomId.ToLower()).OrderBy(x => x.Id).Select(x => new Seat()
            {
                uid = x.Uid,
                id = x.Id,
                name = x.Name,
                students = x.TblPCs.OrderBy(z => z.Position).Select(z => new Student() { uid = z.Uid, id = z.Id, name = z.Name, position = z.Position, teacher = null }).ToList()
            }).ToList();

            return responseSuccess(data);
        }
        [HttpGet]
        public DataResponse<List<Featured>> LoadFeatureds(string classroomId)
        {
            List<Featured> data = db.TblFCs.Where(x => x.ClassroomId.ToLower() == classroomId.ToLower()).OrderBy(x => x.Id).Select(x => new Featured()
            {
                uid = x.Uid,
                id = x.Id,
                name = x.Name,
                
                students = x.TblFCPCs.OrderBy(z => z.Position).Select(z => new Student()
                {
                    uid = z.Uid,
                    id = z.TblPC.Id,
                    name = z.TblPC.Name,
                
                    position = z.Position,
                    teacher = null,
                    address1 = z.TblPC.Address1,
                    State =z.TblPC.State,
                    City=z.TblPC.City,
                    ZipCode=z.TblPC.ZipCode,
                    Country=z.TblPC.Country
                }).ToList()
            }).ToList();

          //  data= data.OrderBy(x=>x.position)

            return responseSuccess(data);
        }
        [HttpGet]
        public DataResponse<List<Student>> LoadStudents(string classroomId)
        {
            List<Student> data = db.TblPCs.Where(x => x.ClassroomId.ToLower() == classroomId.ToLower()).OrderBy(x => x.Id).Select(x => new Student()
            {
                uid = x.Uid,
                id = x.Id,
                name = x.Name,
             
                featuredpcname = (from FC in db.TblFCs
                                 where FC.Uid ==((from fcpc in db.TblFCPCs
                                                  where fcpc.PcUid == x.Uid
                                                  select fcpc.FcUid).FirstOrDefault())
                                 select FC.Name).FirstOrDefault(),

                teacher = x.TcUid.HasValue ? new Teacher() { id = x.TblTC.Id, name = x.TblTC.Name } : null
            }).ToList();

            return responseSuccess(data);
        }
        [HttpGet]
        public DataResponse<List<Teacher>> LoadTeachers(string classroomId)
        {
            List<Teacher> data = db.TblTCs.Where(x => x.ClassroomId.ToLower() == classroomId.ToLower()).OrderBy(x => x.Id).Select(x => new Teacher()
            {
                uid = x.Uid,
                id = x.Id,
                name = x.Name
            }).ToList();

            return responseSuccess(data);
        }
        [HttpGet]
        public DataResponse<List<Form>> LoadSurveys(string classroomId)
        {
            List<Form> data = db.TblForms.Where(x => x.ClassroomId.ToLower() == classroomId.ToLower() && x.Type == (int)Forms.FormType.Survey).OrderBy(x => x.Title).Select(x => new Form(x, null)).ToList();

            return responseSuccess(data);
        }
        [HttpGet]
        public DataResponse<List<Form>> LoadPolls(string classroomId)
        {
            List<Form> data = db.TblForms.Where(x => x.ClassroomId.ToLower() == classroomId.ToLower() && x.Type == (int)Forms.FormType.Poll).OrderBy(x => x.Title).Select(x => new Form(x, null)).ToList();

            return responseSuccess(data);
        }

        private bool isIdExists(string classroomId)
        {
            var q = from x in db.TblClassrooms
                    where x.Id.ToLower() == classroomId.ToLower()
                    select x;

            bool exists = q.Count() > 0;

            return exists;
        }
        [HttpPost]
        public DataResponse<bool> IsExists(string classroomId, [FromBody] string excludeId)
        {
            var q = from x in db.TblClassrooms
                    where x.Id.ToLower() == classroomId.ToLower() && x.Id.ToLower() != excludeId.ToLower()
                    select x;

            bool exists = q.Count() > 0;

            return responseSuccess(exists);
        }
        [HttpPost]
        public DataResponse<Classroom> Create([FromBody] Classroom item)
        {
            db.TblClassrooms.InsertOnSubmit(new TblClassroom
            {
                Id = item.id,
                Name = item.name,
                SessionId = String.Empty,
                IsActive = 1
            });

            try
            {
                db.SubmitChanges();
                item.IsActive = 1;
                item.url = this.Url.Link("AdminClassroom", new { controller = "Admin", action = "Classroom", classroomId = item.id });

                return responseSuccess(item);
            }
            catch (ChangeConflictException ex)
            {
                return responseError<Classroom>(ex.Message);
            }
        }
        [HttpPost]
        public DataResponse<Classroom> Update([FromBody] Classroom item)
        {
            var q = from x in db.TblClassrooms
                    where x.Id.ToLower() == item.id.ToLower()
                    select x;

             if (q!=null && q.Count() == 1)
            {
                TblClassroom tblClassroom = q.Single();
                tblClassroom.Name = item.name;
                
                try
                {
                    db.SubmitChanges();

                    item.url = this.Url.Link("AdminClassroom", new { controller = "Admin", action = "Classroom", classroomId = item.id });
                    item.IsActive = tblClassroom.IsActive;
                    return responseSuccess(item);
                }
                catch (ChangeConflictException ex)
                {
                    return responseError<Classroom>(ex.Message);
                }
            }
            else
            {
                return responseError<Classroom>("Classroom Id not found.");
            }
        }


        [HttpPost]
        public DataResponse<Classroom> Enable([FromBody] Classroom item)
        {
            var q = from x in db.TblClassrooms
                    where x.Id.ToLower() == item.id.ToLower()
                    select x;

            if (q != null && q.Count() == 1)
            {
                TblClassroom tblClassroom = q.Single();
                tblClassroom.IsActive = 1;

                try
                {
                    db.SubmitChanges();
                    item.url = this.Url.Link("AdminClassroom", new { controller = "Admin", action = "Classroom", classroomId = item.id });
                    item.IsActive = 1;
                    return responseSuccess(item);

                }
                catch (ChangeConflictException ex)
                {
                    return responseError<Classroom>(ex.Message);
                }
            }
            else
            {
                return responseError<Classroom>("Classroom Id not found.");
            }
        }

        [HttpPost]
        public DataResponse<Classroom> Disable([FromBody] Classroom item)
        {
            var q = from x in db.TblClassrooms
                    where x.Id.ToLower() == item.id.ToLower()
                    select x;

            if (q != null && q.Count() == 1)
            {
                TblClassroom tblClassroom = q.Single();
                tblClassroom.IsActive = 0;

                try
                {
                    db.SubmitChanges();
                    item.url = this.Url.Link("AdminClassroom", new { controller = "Admin", action = "Classroom", classroomId = item.id });
                    item.IsActive = 0;
                    return responseSuccess(item);

                }
                catch (ChangeConflictException ex)
                {
                    return responseError<Classroom>(ex.Message);
                }
            }
            else
            {
                return responseError<Classroom>("Classroom Id not found.");
            }
        }
        [HttpPost]
        public DataResponse<string> Delete([FromBody] string id)
        {
            string loweredId = id.ToLower();

            var q = from x in db.TblClassrooms
                    where x.Id.ToLower() == loweredId
                    select x;

             if (q!=null && q.Count() == 1)
            {
                // delete forms and answers
                db.TblFormAnswers.DeleteAllOnSubmit(from x in db.TblFormAnswers
                                                    where x.TblForm.ClassroomId.ToLower() == loweredId
                                                    select x);
                db.TblForms.DeleteAllOnSubmit(from x in db.TblForms
                                              where x.ClassroomId.ToLower() == loweredId
                                              select x);


                db.TblFCPCs.DeleteAllOnSubmit(from x in db.TblFCPCs
                                            where x.TblFC.ClassroomId.ToLower() == loweredId
                                            select x);
                db.TblFCs.DeleteAllOnSubmit(from x in db.TblFCs
                                            where x.ClassroomId.ToLower() == loweredId
                                            select x);
                db.TblPCs.DeleteAllOnSubmit(from x in db.TblPCs
                                            where x.ClassroomId.ToLower() == loweredId
                                            select x);
                db.TblSCs.DeleteAllOnSubmit(from x in db.TblSCs
                                            where x.ClassroomId.ToLower() == loweredId
                                            select x);
                db.TblTCs.DeleteAllOnSubmit(from x in db.TblTCs
                                            where x.ClassroomId.ToLower() == loweredId
                                            select x);
                db.TblClassrooms.DeleteAllOnSubmit(q);

                try
                {
                    db.SubmitChanges();

                    return responseSuccess(id);
                }
                catch (ChangeConflictException ex)
                {
                    return responseError<string>(ex.Message);
                }
            }
            else
            {
                return responseError<string>("Classroom Id not found.");
            }
        }
        [HttpPost]
        public DataResponse<List<Classroom>> Import([FromBody] string data)
        {
            List<Classroom> importedClassrooms = new List<Classroom>();
            string error = String.Empty;

            // split rows
            string[] datas = data.Split('\n');

            // enumerate rows
            for (int i = 0; i < datas.Length && String.IsNullOrEmpty(error); i++)
            {
                if (!String.IsNullOrEmpty(datas[i]))
                {
                    string[] row = datas[i].Split(',');

                    // validate row
                    if (row.Length < 1 || String.IsNullOrEmpty(row[0]))
                    {
                        error = "[Row: " + (i + 1) + "] Missing ID";
                    }
                    else if (row.Length < 2 || String.IsNullOrEmpty(row[1]))
                    {
                        error = "[Row: " + (i + 1) + "] Missing Name";
                    }

                    if (String.IsNullOrEmpty(error))
                    {
                        string id = row[0].Trim().Replace("\"", "");
                        string name = row[1].Trim().Replace("\"", "");

                        // validate ID & name
                        if (!isValidId(id))
                        {
                            error = "[Row: " + (i + 1) + "] Invalid ID";
                        }
                        else if (id.Length > 20)
                        {
                            error = "[Row: " + (i + 1) + "] ID max length is 20";
                        }
                        else if (isIdExists(id))
                        {
                            error = "[Row: " + (i + 1) + "] ID already exists";
                        }
                        else if (name.Length == 0)
                        {
                            error = "[Row: " + (i + 1) + "] Name is empty";
                        }
                        else if (name.Length > 256)
                        {
                            error = "[Row: " + (i + 1) + "] Name max length is 256";
                        }

                        if (String.IsNullOrEmpty(error))
                        {
                            // can be imported
                            importedClassrooms.Add(new Classroom()
                            {
                                id = id,
                                name = name,
                                url = this.Url.Link("AdminClassroom", new { controller = "Admin", action = "Classroom", classroomId = id })
                            });
                        }
                    }
                }
            }

            if (String.IsNullOrEmpty(error))
            {
                if (importedClassrooms.Count == 0)
                {
                    return responseError<List<Classroom>>("Nothing to import");
                }
                else
                {
                    // import to DB
                    List<TblClassroom> classrooms = new List<TblClassroom>();
                    foreach (Classroom classroom in importedClassrooms)
                    {
                        classrooms.Add(new TblClassroom
                        {
                            Id = classroom.id,
                            Name = classroom.name,
                            SessionId = String.Empty
                        });
                    }

                    db.TblClassrooms.InsertAllOnSubmit(classrooms);

                    try
                    {
                        db.SubmitChanges();

                        return responseSuccess(importedClassrooms);
                    }
                    catch (ChangeConflictException ex)
                    {
                        return responseError<List<Classroom>>(ex.Message);
                    }
                }
            }
            else
            {
                return responseError<List<Classroom>>(error);
            }
        }

        private bool isSeatIdExists(string classroomId, string id)
        {
            var q = from x in db.TblSCs
                    where x.ClassroomId.ToLower() == classroomId.ToLower() && x.Id.ToLower() == id.ToLower()
                    select x;

            bool exists = q.Count() > 0;

            return exists;
        }
        private void updateStudentPositionSc(string classroomId, Student student, Guid scUid, int position)
        {
            if (student != null)
            {
                var qPC = from x in db.TblPCs
                          where x.ClassroomId.ToLower() == classroomId.ToLower() && x.Id.ToLower() == student.id.ToLower()
                          select x;
                if (qPC.Count() == 1)
                {
                    TblPC tblPC = qPC.Single();
                    tblPC.ScUid = scUid;
                    tblPC.Position = position;
                }
            }
        }
        [HttpPost]
        public DataResponse<bool> IsSeatExists(string classroomId, string id, [FromBody] string excludeId)
        {
            var q = from x in db.TblSCs
                    where x.ClassroomId.ToLower() == classroomId.ToLower() && x.Id.ToLower() == id.ToLower() && x.Id.ToLower() != excludeId.ToLower()
                    select x;

            bool exists = q.Count() > 0;

            return responseSuccess(exists);
        }
        [HttpPost]
        public DataResponse<Seat> CreateSeat(string classroomId, [FromBody] Seat item)
        {
            Guid scUid = Guid.NewGuid();
            db.TblSCs.InsertOnSubmit(new TblSC
            {
                Uid = scUid,
                Id = item.id,
                ClassroomId = classroomId,
                Name = item.name
            });

            // assign students and positions
            for (int i = 0; i < 8; i++)
            {
                updateStudentPositionSc(classroomId, item.students[i], scUid, i + 1);
            }

            try
            {
                db.SubmitChanges();

                item.uid = scUid;

                return responseSuccess(item);
            }
            catch (ChangeConflictException ex)
            {
                return responseError<Seat>(ex.Message);
            }
        }
        [HttpPost]
        public DataResponse<Seat> UpdateSeat(string classroomId, [FromBody] Seat item)
        {
            var q = from x in db.TblSCs
                    where x.ClassroomId.ToLower() == classroomId.ToLower() && x.Id.ToLower() == item.id.ToLower()
                    select x;

             if (q!=null && q.Count() == 1)
            {
                TblSC tblSC = q.Single();
                tblSC.Name = item.name;

                // remove assigned students
                var qPC = from x in db.TblPCs
                          where x.ClassroomId.ToLower() == classroomId.ToLower() && x.ScUid.HasValue && x.ScUid == tblSC.Uid
                          select x;
                foreach (TblPC tblPC in qPC.Select(x => x))
                {
                    tblPC.ScUid = null;
                    tblPC.Position = 0;
                }

                // assign student position 1
                for (int i = 0; i < 8; i++)
                {
                    updateStudentPositionSc(classroomId, item.students[i], tblSC.Uid, i + 1);
                }

                try
                {
                    db.SubmitChanges();

                    return responseSuccess(item);
                }
                catch (ChangeConflictException ex)
                {
                    return responseError<Seat>(ex.Message);
                }
            }
            else
            {
                return responseError<Seat>("Seat Id not found.");
            }
        }
        [HttpPost]
        public DataResponse<string> DeleteSeat(string classroomId, [FromBody] string id)
        {
            string loweredId = id.ToLower();

            var q = from x in db.TblSCs
                    where x.ClassroomId.ToLower() == classroomId.ToLower() && x.Id.ToLower() == loweredId
                    select x;

             if (q!=null && q.Count() == 1)
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

                    return responseSuccess(id);
                }
                catch (ChangeConflictException ex)
                {
                    return responseError<string>(ex.Message);
                }
            }
            else
            {
                return responseError<string>("Seat Id not found.");
            }
        }
        [HttpPost]
        public DataResponse<List<Seat>> ImportSeats(string classroomId, [FromBody] string data)
        {
            List<Seat> importedSeats = new List<Seat>();
            string error = String.Empty;

            // split rows
            string[] datas = data.Split('\n');

            // enumerate rows
            for (int i = 0; i < datas.Length && String.IsNullOrEmpty(error); i++)
            {
                if (!String.IsNullOrEmpty(datas[i]))
                {
                    string[] row = datas[i].Split(',');

                    // validate row
                    if (row.Length < 1 || String.IsNullOrEmpty(row[0]))
                    {
                        error = "[Row: " + (i + 1) + "] Missing ID";
                    }
                    else if (row.Length < 2 || String.IsNullOrEmpty(row[1]))
                    {
                        error = "[Row: " + (i + 1) + "] Missing Name";
                    }

                    if (String.IsNullOrEmpty(error))
                    {
                        string id = row[0].Trim().Replace("\"", "");
                        string name = row[1].Trim().Replace("\"", "");

                        // validate ID & name
                        if (!isValidId(id))
                        {
                            error = "[Row: " + (i + 1) + "] Invalid ID";
                        }
                        else if (id.Length > 20)
                        {
                            error = "[Row: " + (i + 1) + "] ID max length is 20";
                        }
                        else if (isSeatIdExists(classroomId, id))
                        {
                            error = "[Row: " + (i + 1) + "] ID already exists";
                        }
                        else if (name.Length == 0)
                        {
                            error = "[Row: " + (i + 1) + "] Name is empty";
                        }
                        else if (name.Length > 256)
                        {
                            error = "[Row: " + (i + 1) + "] Name max length is 256";
                        }

                        if (String.IsNullOrEmpty(error))
                        {
                            // can be imported
                            importedSeats.Add(new Seat()
                            {
                                id = id,
                                name = name,
                                students = new List<Student>()
                            });
                        }
                    }
                }
            }

            if (String.IsNullOrEmpty(error))
            {
                if (importedSeats.Count == 0)
                {
                    return responseError<List<Seat>>("Nothing to import");
                }
                else
                {
                    // import to DB
                    List<TblSC> scs = new List<TblSC>();
                    foreach (Seat seat in importedSeats)
                    {
                        Guid newScUid = Guid.NewGuid();

                        scs.Add(new TblSC
                        {
                            Uid = newScUid,
                            Id = seat.id,
                            ClassroomId = classroomId,
                            Name = seat.name
                        });

                        seat.uid = newScUid;
                    }

                    db.TblSCs.InsertAllOnSubmit(scs);

                    try
                    {
                        db.SubmitChanges();

                        return responseSuccess(importedSeats);
                    }
                    catch (ChangeConflictException ex)
                    {
                        return responseError<List<Seat>>(ex.Message);
                    }
                }
            }
            else
            {
                return responseError<List<Seat>>(error);
            }
        }

        private bool isFeaturedIdExists(string classroomId, string id)
        {
            var q = from x in db.TblFCs
                    where x.ClassroomId.ToLower() == classroomId.ToLower() && x.Id.ToLower() == id.ToLower()
                    select x;

            bool exists = q.Count() > 0;

            return exists;
        }
        private TblFCPC createStudentFcPc(string classroomId, Student student, Guid fcUid, int position)
        {
            if (student != null)
            {
                var qPC = from x in db.TblPCs
                          where x.ClassroomId.ToLower() == classroomId.ToLower() && x.Id.ToLower() == student.id.ToLower()
                          select x;
                if (qPC.Count() == 1)
                {
                    TblPC tblPC = qPC.Single();

                    return new TblFCPC
                    {
                        Uid = Guid.NewGuid(),
                        FcUid = fcUid,
                        PcUid = tblPC.Uid,
                        Position = position
                    };
                }
            }

            return null;
        }
        [HttpPost]
        public DataResponse<bool> IsFeaturedExists(string classroomId, string id, [FromBody] string excludeId)
        {
            var q = from x in db.TblFCs
                    where x.ClassroomId.ToLower() == classroomId.ToLower() && x.Id.ToLower() == id.ToLower() && x.Id.ToLower() != excludeId.ToLower()
                    select x;

            bool exists = q.Count() > 0;

            return responseSuccess(exists);
        }
        [HttpGet]
        public DataResponse<Featured> LoadFeatured(string classroomId, string id)
        {
            Guid uid = new Guid(id);

            Featured data = db.TblFCs.Where(x => x.Uid == uid && x.ClassroomId.ToLower() == classroomId.ToLower()).Select(x => new Featured()
            {
                uid = x.Uid,
                id = x.Id,
                name = x.Name,
                students = x.TblFCPCs.OrderBy(z => z.Position).Select(z => new Student() { uid = z.Uid, id = z.TblPC.Id, name = z.TblPC.Name, position = z.Position, teacher = null }).ToList()
            }).SingleOrDefault();

            return responseSuccess(data);
        }
        [HttpPost]
        public DataResponse<Featured> CreateFeatured(string classroomId, [FromBody] Featured item)
        {
            Guid fcUid = Guid.NewGuid();
            db.TblFCs.InsertOnSubmit(new TblFC
            {
                Uid = fcUid,
                Id = item.id,
                ClassroomId = classroomId,
                Name = item.name
            });

            // assign students and positions
            if (item.students != null)
            {
                List<TblFCPC> fcPcs = new List<TblFCPC>();
                for (int i = 0; i < 8; i++)
                {
                    TblFCPC tblFCPC = createStudentFcPc(classroomId, item.students[i], fcUid, i + 1);

                    if (tblFCPC != null)
                    {
                        fcPcs.Add(tblFCPC);
                    }
                }
                if (fcPcs.Count > 0)
                {
                    db.TblFCPCs.InsertAllOnSubmit(fcPcs);
                }
            }

            try
            {
                db.SubmitChanges();

                item.uid = fcUid;

                return responseSuccess(item);
            }
            catch (ChangeConflictException ex)
            {
                return responseError<Featured>(ex.Message);
            }
        }
        [HttpPost]
        public DataResponse<Featured> UpdateFeatured(string classroomId, [FromBody] Featured item)
        {
            var q = from x in db.TblFCs
                    where x.ClassroomId.ToLower() == classroomId.ToLower() && x.Id.ToLower() == item.id.ToLower()
                    select x;

             if (q!=null && q.Count() == 1)
            {
                TblFC tblFC = q.Single();
                tblFC.Name = item.name;

                // remove assigned students
                if (item.students != null)
                {
                    db.TblFCPCs.DeleteAllOnSubmit(from x in db.TblFCPCs
                                                  where x.FcUid == tblFC.Uid
                                                  select x);

                    // assign students
                    List<TblFCPC> fcPcs = new List<TblFCPC>();
                    for (int i = 0; i < 8; i++)
                    {
                        TblFCPC tblFCPC = createStudentFcPc(classroomId, item.students[i], tblFC.Uid, i + 1);

                        if (tblFCPC != null)
                        {
                            fcPcs.Add(tblFCPC);
                        }
                    }
                    if (fcPcs.Count > 0)
                    {
                        db.TblFCPCs.InsertAllOnSubmit(fcPcs);
                    }
                }

                try
                {
                    db.SubmitChanges();

                    return responseSuccess(item);
                }
                catch (ChangeConflictException ex)
                {
                    return responseError<Featured>(ex.Message);
                }
            }
            else
            {
                return responseError<Featured>("Featured Id not found.");
            }
        }
        [HttpPost]
        public DataResponse<string> DeleteFeatured(string classroomId, [FromBody] string id)
        {
            string loweredId = id.ToLower();

            var q = from x in db.TblFCs
                    where x.ClassroomId.ToLower() == classroomId.ToLower() && x.Id.ToLower() == loweredId
                    select x;

             if (q!=null && q.Count() == 1)
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

                    return responseSuccess(id);
                }
                catch (ChangeConflictException ex)
                {
                    return responseError<string>(ex.Message);
                }
            }
            else
            {
                return responseError<string>("Featured Id not found.");
            }
        }
        [HttpPost]
        public DataResponse<List<Featured>> ImportFeatureds(string classroomId, [FromBody] string data)
        {
            List<Featured> importedFeatureds = new List<Featured>();
            string error = String.Empty;

            // split rows
            string[] datas = data.Split('\n');

            // enumerate rows
            for (int i = 0; i < datas.Length && String.IsNullOrEmpty(error); i++)
            {
                if (!String.IsNullOrEmpty(datas[i]))
                {
                    string[] row = datas[i].Split(',');

                    // validate row
                    if (row.Length < 1 || String.IsNullOrEmpty(row[0]))
                    {
                        error = "[Row: " + (i + 1) + "] Missing ID";
                    }
                    else if (row.Length < 2 || String.IsNullOrEmpty(row[1]))
                    {
                        error = "[Row: " + (i + 1) + "] Missing Name";
                    }

                    if (String.IsNullOrEmpty(error))
                    {
                        string id = row[0].Trim().Replace("\"", "");
                        string name = row[1].Trim().Replace("\"", "");

                        // validate ID & name
                        if (!isValidId(id))
                        {
                            error = "[Row: " + (i + 1) + "] Invalid ID";
                        }
                        else if (id.Length > 20)
                        {
                            error = "[Row: " + (i + 1) + "] ID max length is 20";
                        }
                        else if (isFeaturedIdExists(classroomId, id))
                        {
                            error = "[Row: " + (i + 1) + "] ID already exists";
                        }
                        else if (name.Length == 0)
                        {
                            error = "[Row: " + (i + 1) + "] Name is empty";
                        }
                        else if (name.Length > 256)
                        {
                            error = "[Row: " + (i + 1) + "] Name max length is 256";
                        }

                        if (String.IsNullOrEmpty(error))
                        {
                            // can be imported
                            importedFeatureds.Add(new Featured()
                            {
                                id = id,
                                name = name,
                                students = new List<Student>()
                            });
                        }
                    }
                }
            }

            if (String.IsNullOrEmpty(error))
            {
                if (importedFeatureds.Count == 0)
                {
                    return responseError<List<Featured>>("Nothing to import");
                }
                else
                {
                    // import to DB
                    List<TblFC> fcs = new List<TblFC>();
                    foreach (Featured featured in importedFeatureds)
                    {
                        Guid newFcUid = Guid.NewGuid();

                        fcs.Add(new TblFC
                        {
                            Uid = newFcUid,
                            Id = featured.id,
                            ClassroomId = classroomId,
                            Name = featured.name
                        });

                        featured.uid = newFcUid;
                    }

                    db.TblFCs.InsertAllOnSubmit(fcs);

                    try
                    {
                        db.SubmitChanges();

                        return responseSuccess(importedFeatureds);
                    }
                    catch (ChangeConflictException ex)
                    {
                        return responseError<List<Featured>>(ex.Message);
                    }
                }
            }
            else
            {
                return responseError<List<Featured>>(error);
            }
        }

        private bool isStudentIdExists(string classroomId, string id)
        {
            var q = from x in db.TblPCs
                    where x.ClassroomId.ToLower() == classroomId.ToLower() && x.Id.ToLower() == id.ToLower()
                    select x;

            bool exists = q.Count() > 0;

            return exists;
        }
        [HttpPost]
        public DataResponse<bool> IsStudentExists(string classroomId, string id, [FromBody] string excludeId)
        {
            var q = from x in db.TblPCs
                    where x.ClassroomId.ToLower() == classroomId.ToLower() && x.Id.ToLower() == id.ToLower() && x.Id.ToLower() != excludeId.ToLower()
                    select x;

            bool exists = q.Count() > 0;

            return responseSuccess(exists);
        }
        [HttpPost]
        public DataResponse<Student> CreateStudent(string classroomId, [FromBody] Student item)
        {
            Guid? tcUid = null;
            if (item.teacher != null)
            {
                var qTC = from x in db.TblTCs
                          where x.ClassroomId.ToLower() == classroomId.ToLower()
                          && x.Id.ToLower() == item.teacher.id.ToLower()
                          select x;

                if (qTC.Count() == 1)
                {
                    tcUid = qTC.Single().Uid;
                }
            }

            Guid pcUid = Guid.NewGuid();

            db.TblPCs.InsertOnSubmit(new TblPC
            {
                Uid = pcUid,
                Id = item.id,
                ClassroomId = classroomId,
                Name = item.name,
                ScUid = null,
                TcUid = tcUid,
                Position = 0,
                Audio = true,
                Video = true,
                Volume = 80
            });

            try
            {
                db.SubmitChanges();

                item.uid = pcUid;

                return responseSuccess(item);
            }
            catch (ChangeConflictException ex)
            {
                return responseError<Student>(ex.Message);
            }
        }
        [HttpPost]
        public DataResponse<Student> UpdateStudent(string classroomId, [FromBody] Student item)
        {
            var q = from x in db.TblPCs
                    where x.ClassroomId.ToLower() == classroomId.ToLower() && x.Id.ToLower() == item.id.ToLower()
                    select x;

             if (q!=null && q.Count() == 1)
            {
                Guid? tcUid = null;
                if (item.teacher != null)
                {
                    var qTC = from x in db.TblTCs
                              where x.ClassroomId.ToLower() == classroomId.ToLower()
                              && x.Id.ToLower() == item.teacher.id.ToLower()
                              select x;

                    if (qTC.Count() == 1)
                    {
                        tcUid = qTC.Single().Uid;
                    }
                }

                TblPC tblPC = q.Single();
                tblPC.Name = item.name;
                tblPC.TcUid = tcUid;

                try
                {
                    db.SubmitChanges();

                    return responseSuccess(item);
                }
                catch (ChangeConflictException ex)
                {
                    return responseError<Student>(ex.Message);
                }
            }
            else
            {
                return responseError<Student>("Student Id not found.");
            }
        }
        [HttpPost]
        public DataResponse<string> DeleteStudent(string classroomId, [FromBody] string id)
        {
            string loweredId = id.ToLower();

            var q = from x in db.TblPCs
                    where x.ClassroomId.ToLower() == classroomId.ToLower() && x.Id.ToLower() == loweredId
                    select x;

             if (q!=null && q.Count() == 1)
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

                    return responseSuccess(id);
                }
                catch (ChangeConflictException ex)
                {
                    return responseError<string>(ex.Message);
                }
            }
            else
            {
                return responseError<string>("Student Id not found.");
            }
        }
        [HttpPost]
        public DataResponse<List<Student>> ImportStudents(string classroomId, [FromBody] string data)
        {
            List<Student> importedStudents = new List<Student>();
            string error = String.Empty;

            // split rows
            string[] datas = data.Split('\n');

            // enumerate rows
            for (int i = 0; i < datas.Length && String.IsNullOrEmpty(error); i++)
            {
                if (!String.IsNullOrEmpty(datas[i]))
                {
                    string[] row = datas[i].Split(',');
                    
                    // validate row
                    if (row.Length < 1 || String.IsNullOrEmpty(row[0]))
                    {
                        error = "[Row: " + (i + 1) + "] Missing ID";
                    }
                    else if (row.Length < 2 || String.IsNullOrEmpty(row[1]))
                    {
                        error = "[Row: " + (i + 1) + "] Missing Name";
                    }

                    if (String.IsNullOrEmpty(error))
                    {
                        string id = row[0].Trim().Replace("\"", "");
                        string name = row[1].Trim().Replace("\"", "");

                        // validate ID & name
                        if (!isValidId(id))
                        {
                            error = "[Row: " + (i + 1) + "] Invalid ID";
                        }
                        else if (id.Length > 20)
                        {
                            error = "[Row: " + (i + 1) + "] ID max length is 20";
                        }
                        else if (isStudentIdExists(classroomId, id))
                        {
                            error = "[Row: " + (i + 1) + "] ID already exists";
                        }
                        else if (name.Length == 0)
                        {
                            error = "[Row: " + (i + 1) + "] Name is empty";
                        }
                        else if (name.Length > 256)
                        {
                            error = "[Row: " + (i + 1) + "] Name max length is 256";
                        }

                        if (String.IsNullOrEmpty(error))
                        {
                            // can be imported
                            importedStudents.Add(new Student()
                            {
                                id = id,
                                name = name,
                                position = 0,
                                teacher = null
                            });
                        }
                    }
                }
            }

            if (String.IsNullOrEmpty(error))
            {
                if (importedStudents.Count == 0)
                {
                    return responseError<List<Student>>("Nothing to import");
                }
                else
                {
                    // import to DB
                    List<TblPC> pcs = new List<TblPC>();
                    foreach (Student student in importedStudents)
                    {
                        Guid newPcUid = Guid.NewGuid();

                        pcs.Add(new TblPC
                        {
                            Uid = newPcUid,
                            Id = student.id,
                            ClassroomId = classroomId,
                            Name = student.name,
                            ScUid = null,
                            TcUid = null,
                            Position = 0,
                            Audio = true,
                            Video = true,
                            Volume = 80
                        });

                        student.uid = newPcUid;
                    }

                    db.TblPCs.InsertAllOnSubmit(pcs);

                    try
                    {
                        db.SubmitChanges();

                        return responseSuccess(importedStudents);
                    }
                    catch (ChangeConflictException ex)
                    {
                        return responseError<List<Student>>(ex.Message);
                    }
                }
            }
            else
            {
                return responseError<List<Student>>(error);
            }
        }

        private bool isTeacherIdExists(string classroomId, string id)
        {
            var q = from x in db.TblTCs
                    where x.ClassroomId.ToLower() == classroomId.ToLower() && x.Id.ToLower() == id.ToLower()
                    select x;

            bool exists = q.Count() > 0;

            return exists;
        }
        [HttpPost]
        public DataResponse<bool> IsTeacherExists(string classroomId, string id, [FromBody] string excludeId)
        {
            var q = from x in db.TblTCs
                    where x.ClassroomId.ToLower() == classroomId.ToLower() && x.Id.ToLower() == id.ToLower() && x.Id.ToLower() != excludeId.ToLower()
                    select x;

            bool exists = q.Count() > 0;

            return responseSuccess(exists);
        }
        [HttpPost]
        public DataResponse<Teacher> CreateTeacher(string classroomId, [FromBody] Teacher item)
        {
            Guid tcUid = Guid.NewGuid();

            db.TblTCs.InsertOnSubmit(new TblTC
            {
                Uid = tcUid,
                Id = item.id,
                ClassroomId = classroomId,
                Name = item.name,
                Audio = true,
                Video = true
            });

            try
            {
                db.SubmitChanges();

                item.uid = tcUid;

                return responseSuccess(item);
            }
            catch (ChangeConflictException ex)
            {
                return responseError<Teacher>(ex.Message);
            }
        }
        [HttpPost]
        public DataResponse<Teacher> UpdateTeacher(string classroomId, [FromBody] Teacher item)
        {
            var q = from x in db.TblTCs
                    where x.ClassroomId.ToLower() == classroomId.ToLower() && x.Id.ToLower() == item.id.ToLower()
                    select x;

             if (q!=null && q.Count() == 1)
            {
                TblTC tblTC = q.Single();
                tblTC.Name = item.name;

                try
                {
                    db.SubmitChanges();

                    return responseSuccess(item);
                }
                catch (ChangeConflictException ex)
                {
                    return responseError<Teacher>(ex.Message);
                }
            }
            else
            {
                return responseError<Teacher>("Teacher Id not found.");
            }
        }
        [HttpPost]
        public DataResponse<string> DeleteTeacher(string classroomId, [FromBody] string id)
        {
            string loweredId = id.ToLower();

            var q = from x in db.TblTCs
                    where x.ClassroomId.ToLower() == classroomId.ToLower() && x.Id.ToLower() == loweredId
                    select x;

             if (q!=null && q.Count() == 1)
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

                    return responseSuccess(id);
                }
                catch (ChangeConflictException ex)
                {
                    return responseError<string>(ex.Message);
                }
            }
            else
            {
                return responseError<string>("Teacher Id not found.");
            }
        }
        [HttpPost]
        public DataResponse<List<Teacher>> ImportTeachers(string classroomId, [FromBody] string data)
        {
            List<Teacher> importedTeachers = new List<Teacher>();
            string error = String.Empty;

            // split rows
            string[] datas = data.Split('\n');

            // enumerate rows
            for (int i = 0; i < datas.Length && String.IsNullOrEmpty(error); i++)
            {
                if (!String.IsNullOrEmpty(datas[i]))
                {
                    string[] row = datas[i].Split(',');

                    // validate row
                    if (row.Length < 1 || String.IsNullOrEmpty(row[0]))
                    {
                        error = "[Row: " + (i + 1) + "] Missing ID";
                    }
                    else if (row.Length < 2 || String.IsNullOrEmpty(row[1]))
                    {
                        error = "[Row: " + (i + 1) + "] Missing Name";
                    }

                    if (String.IsNullOrEmpty(error))
                    {
                        string id = row[0].Trim().Replace("\"", "");
                        string name = row[1].Trim().Replace("\"", "");

                        // validate ID & name
                        if (!isValidId(id))
                        {
                            error = "[Row: " + (i + 1) + "] Invalid ID";
                        }
                        else if (id.Length > 20)
                        {
                            error = "[Row: " + (i + 1) + "] ID max length is 20";
                        }
                        else if (isTeacherIdExists(classroomId, id))
                        {
                            error = "[Row: " + (i + 1) + "] ID already exists";
                        }
                        else if (name.Length == 0)
                        {
                            error = "[Row: " + (i + 1) + "] Name is empty";
                        }
                        else if (name.Length > 256)
                        {
                            error = "[Row: " + (i + 1) + "] Name max length is 256";
                        }

                        if (String.IsNullOrEmpty(error))
                        {
                            // can be imported
                            importedTeachers.Add(new Teacher()
                            {
                                id = id,
                                name = name
                            });
                        }
                    }
                }
            }

            if (String.IsNullOrEmpty(error))
            {
                if (importedTeachers.Count == 0)
                {
                    return responseError<List<Teacher>>("Nothing to import");
                }
                else
                {
                    // import to DB
                    List<TblTC> tcs = new List<TblTC>();
                    foreach (Teacher teacher in importedTeachers)
                    {
                        Guid newTcUid = Guid.NewGuid();

                        tcs.Add(new TblTC
                        {
                            Uid = newTcUid,
                            Id = teacher.id,
                            ClassroomId = classroomId,
                            Name = teacher.name,
                            Audio = true,
                            Video = true
                        });

                        teacher.uid = newTcUid;
                    }

                    db.TblTCs.InsertAllOnSubmit(tcs);

                    try
                    {
                        db.SubmitChanges();

                        return responseSuccess(importedTeachers);
                    }
                    catch (ChangeConflictException ex)
                    {
                        return responseError<List<Teacher>>(ex.Message);
                    }
                }
            }
            else
            {
                return responseError<List<Teacher>>(error);
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
