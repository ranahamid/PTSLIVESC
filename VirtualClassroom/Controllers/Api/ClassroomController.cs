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

        [HttpGet]
        public DataResponse<List<Computer>> GetAvailableSeatStudents(string classroomId)
        {
            Guid? scUid = null;

            var q = from x in db.TblPCs
                    where x.ClassroomId.ToLower() == classroomId.ToLower() &&
                    !x.ScUid.HasValue || x.ScUid == scUid
                    select x;

            List<Computer> data = q.Select(x =>
                new Computer() { id = x.Id, name = x.Name }
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
                new Computer() { id = x.Id, name = x.Name }
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
                new Computer() { id = x.Id, name = x.Name }
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
                new Computer() { id = x.Id, name = x.Name }
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
                url = this.Url.Link("AdminClassroom", new { controller = "Admin", action = "Classroom", classroomId = x.Id })
            }).ToList();

            return responseSuccess(data);
        }
        [HttpGet]
        public DataResponse<List<Seat>> LoadSeats(string classroomId)
        {
            List<Seat> data = db.TblSCs.Where(x => x.ClassroomId.ToLower() == classroomId.ToLower()).OrderBy(x => x.Id).Select(x => new Seat()
            {
                id = x.Id,
                name = x.Name,
                students = x.TblPCs.OrderBy(z => z.Position).Select(z => new Student() { id = z.Id, name = z.Name, position = z.Position, teacher = null }).ToList()
            }).ToList();

            return responseSuccess(data);
        }
        [HttpGet]
        public DataResponse<List<Featured>> LoadFeatureds(string classroomId)
        {
            List<Featured> data = db.TblFCs.Where(x => x.ClassroomId.ToLower() == classroomId.ToLower()).OrderBy(x => x.Id).Select(x => new Featured()
            {
                id = x.Id,
                name = x.Name,
                students = x.TblFCPCs.OrderBy(z => z.Position).Select(z => new Student() { id = z.TblPC.Id, name = z.TblPC.Name, position = z.Position, teacher = null }).ToList()
            }).ToList();

            return responseSuccess(data);
        }
        [HttpGet]
        public DataResponse<List<Student>> LoadStudents(string classroomId)
        {
            List<Student> data = db.TblPCs.Where(x => x.ClassroomId.ToLower() == classroomId.ToLower()).OrderBy(x => x.Id).Select(x => new Student()
            {
                id = x.Id,
                name = x.Name,
                teacher = x.TcUid.HasValue ? new Teacher() { id = x.TblTC.Id, name = x.TblTC.Name } : null
            }).ToList();

            return responseSuccess(data);
        }
        [HttpGet]
        public DataResponse<List<Teacher>> LoadTeachers(string classroomId)
        {
            List<Teacher> data = db.TblTCs.Where(x => x.ClassroomId.ToLower() == classroomId.ToLower()).OrderBy(x => x.Id).Select(x => new Teacher()
            {
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
                SessionId = String.Empty
            });

            try
            {
                db.SubmitChanges();

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

            if (q.Count() == 1)
            {
                TblClassroom tblClassroom = q.Single();
                tblClassroom.Name = item.name;

                try
                {
                    db.SubmitChanges();

                    item.url = this.Url.Link("AdminClassroom", new { controller = "Admin", action = "Classroom", classroomId = item.id });

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

            if (q.Count() == 1)
            {
                // delete forms and answers
                db.TblFormAnswers.DeleteAllOnSubmit(from x in db.TblFormAnswers
                                                    where x.TblForm.ClassroomId.ToLower() == loweredId
                                                    select x);
                db.TblForms.DeleteAllOnSubmit(from x in db.TblForms
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
                Name = item.name,
                Audio = true,
                Video = true,
                Volume1 = 80,
                Volume2 = 80,
                Volume3 = 80,
                Volume4 = 80,
                Volume5 = 80,
                Volume6 = 80,
                Volume7 = 80,
                Volume8 = 80
            });

            // assign students and positions
            for (int i = 0; i < 8; i++)
            {
                updateStudentPositionSc(classroomId, item.students[i], scUid, i + 1);
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
        [HttpPost]
        public DataResponse<Seat> UpdateSeat(string classroomId, [FromBody] Seat item)
        {
            var q = from x in db.TblSCs
                    where x.ClassroomId.ToLower() == classroomId.ToLower() && x.Id.ToLower() == item.id.ToLower()
                    select x;

            if (q.Count() == 1)
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

            if (q.Count() == 1)
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
        public DataResponse<bool> IsFeaturedExists(string classroomId, string id, [FromBody] string excludeId)
        {
            var q = from x in db.TblFCs
                    where x.ClassroomId.ToLower() == classroomId.ToLower() && x.Id.ToLower() == id.ToLower() && x.Id.ToLower() != excludeId.ToLower()
                    select x;

            bool exists = q.Count() > 0;

            return responseSuccess(exists);
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
                        Position = position,
                        Volume = 80
                    };
                }
            }

            return null;
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
        [HttpPost]
        public DataResponse<Featured> UpdateFeatured(string classroomId, [FromBody] Featured item)
        {
            var q = from x in db.TblFCs
                    where x.ClassroomId.ToLower() == classroomId.ToLower() && x.Id.ToLower() == item.id.ToLower()
                    select x;

            if (q.Count() == 1)
            {
                TblFC tblFC = q.Single();
                tblFC.Name = item.name;

                // remove assigned students
                db.TblFCPCs.DeleteAllOnSubmit(from x in db.TblFCPCs
                                              where x.FcUid == tblFC.Uid
                                              select x);

                // assign student position 1
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

            if (q.Count() == 1)
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

            db.TblPCs.InsertOnSubmit(new TblPC
            {
                Uid = Guid.NewGuid(),
                Id = item.id,
                ClassroomId = classroomId,
                Name = item.name,
                ScUid = null,
                TcUid = tcUid,
                Position = 0,
                Audio = true,
                Video = true,
                Volume1 = 80,
                Volume2 = 80
            });

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
        [HttpPost]
        public DataResponse<Student> UpdateStudent(string classroomId, [FromBody] Student item)
        {
            var q = from x in db.TblPCs
                    where x.ClassroomId.ToLower() == classroomId.ToLower() && x.Id.ToLower() == item.id.ToLower()
                    select x;

            if (q.Count() == 1)
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

            if (q.Count() == 1)
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
            db.TblTCs.InsertOnSubmit(new TblTC
            {
                Uid = Guid.NewGuid(),
                Id = item.id,
                ClassroomId = classroomId,
                Name = item.name,
                Audio = false,
                Video = true
            });

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
        [HttpPost]
        public DataResponse<Teacher> UpdateTeacher(string classroomId, [FromBody] Teacher item)
        {
            var q = from x in db.TblTCs
                    where x.ClassroomId.ToLower() == classroomId.ToLower() && x.Id.ToLower() == item.id.ToLower()
                    select x;

            if (q.Count() == 1)
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

            if (q.Count() == 1)
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
