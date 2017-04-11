/* tslint:disable:max-line-length */
var VC;
(function (VC) {
    var Admin;
    (function (Admin) {
        var Lists;
        (function (Lists) {
            "use strict";
            const FORM_ID = "Id";
            const FORM_NAME = "Name";
            const FORM_STUDENT1 = "Student1";
            const FORM_STUDENT2 = "Student2";
            const FORM_STUDENT3 = "Student3";
            const FORM_STUDENT4 = "Student4";
            const FORM_STUDENT5 = "Student5";
            const FORM_STUDENT6 = "Student6";
            const FORM_STUDENT7 = "Student7";
            const FORM_STUDENT8 = "Student8";
            class Seats extends Lists.Base {
                getList() {
                    return this.list;
                }
                getBox() {
                    return this.box;
                }
                getImportBox() {
                    return this.boxImport;
                }
                render() {
                    return (React.createElement("div", null, React.createElement(SeatsList, {ref: (ref) => this.list = ref, title: "Seat computer", actionUrl: this.props.actionUrl, classroomId: this.props.classroomId, loadMethod: "LoadSeats", showBoxImport: () => this.showBoxImport(), showBoxNew: this.showBoxNew.bind(this), showEnableClass: this.showEnableClass.bind(this), showDisableClass: this.showDisableClass.bind(this), showBoxEdit: this.showBoxEdit.bind(this), showBoxDelete: this.showBoxDelete.bind(this)}), React.createElement(SeatsBox, {ref: (ref) => this.box = ref, title: "Seat computer", actionUrl: this.props.actionUrl, classroomId: this.props.classroomId, getListItems: this.getListItems.bind(this), setListItems: this.setListItems.bind(this)}), React.createElement(SeatsImportBox, {ref: (ref) => this.boxImport = ref, title: "Import Seat computers", classroomId: this.props.classroomId, getListItems: this.getListItems.bind(this), setListItems: this.setListItems.bind(this)})));
                }
            }
            Lists.Seats = Seats;
            class SeatsList extends Lists.List {
                renderItemCols(d) {
                    let names = "";
                    if (d.students.length === 0) {
                        names = "-";
                    }
                    else {
                        let j = 0;
                        for (let i = 0; i < d.students.length; i++) {
                            if (d.students[i] !== null) {
                                if (j > 0) {
                                    names += ", ";
                                }
                                names += d.students[i].name;
                                j++;
                            }
                        }
                    }
                    var l = [];
                    l.push(React.createElement("td", {key: "tdId_" + d.id}, d.id));
                    l.push(React.createElement("td", {key: "tdName_" + d.id}, d.name));
                    l.push(React.createElement("td", {key: "tdStudents_" + d.id}, names));
                    return l;
                }
                renderTableHeaderCols() {
                    var l = [];
                    l.push(React.createElement("th", {key: "thId"}, "ID"));
                    l.push(React.createElement("th", {key: "thSeat"}, "Seat computer"));
                    l.push(React.createElement("th", {key: "thStudents"}, "Students"));
                    return l;
                }
            }
            class SeatsBox extends Lists.Box {
                constructor(props) {
                    super({ id: "", name: "", students: null }, props);
                }
                getStudentByPosition(position) {
                    let student = null;
                    if (this.state.item.students !== null) {
                        for (let i = 0; i < this.state.item.students.length && student === null; i++) {
                            if (this.state.item.students[i] !== null) {
                                if (this.state.item.students[i].position === position) {
                                    student = this.state.item.students[i];
                                }
                            }
                        }
                    }
                    return student;
                }
                boxWillShow() {
                    let tbId = this.refs[Lists.REF_FORM_TB + FORM_ID];
                    let tbName = this.refs[Lists.REF_FORM_TB + FORM_NAME];
                    $(tbId).val(this.state.item.id);
                    $(tbName).val(this.state.item.name);
                    this.setValidationStatus(FORM_ID, Lists.BoxValidationStatus.None, "");
                    this.setValidationStatus(FORM_NAME, Lists.BoxValidationStatus.None, "");
                    let tbStudent1 = this.refs[Lists.REF_FORM_TB + FORM_STUDENT1];
                    let tbStudent2 = this.refs[Lists.REF_FORM_TB + FORM_STUDENT2];
                    let tbStudent3 = this.refs[Lists.REF_FORM_TB + FORM_STUDENT3];
                    let tbStudent4 = this.refs[Lists.REF_FORM_TB + FORM_STUDENT4];
                    let tbStudent5 = this.refs[Lists.REF_FORM_TB + FORM_STUDENT5];
                    let tbStudent6 = this.refs[Lists.REF_FORM_TB + FORM_STUDENT6];
                    let tbStudent7 = this.refs[Lists.REF_FORM_TB + FORM_STUDENT7];
                    let tbStudent8 = this.refs[Lists.REF_FORM_TB + FORM_STUDENT8];
                    let student1 = this.getStudentByPosition(1);
                    let student2 = this.getStudentByPosition(2);
                    let student3 = this.getStudentByPosition(3);
                    let student4 = this.getStudentByPosition(4);
                    let student5 = this.getStudentByPosition(5);
                    let student6 = this.getStudentByPosition(6);
                    let student7 = this.getStudentByPosition(7);
                    let student8 = this.getStudentByPosition(8);
                    tbStudent1.init(student1 !== null ? student1.id : null, this.state.item.id);
                    tbStudent2.init(student2 !== null ? student2.id : null, this.state.item.id);
                    tbStudent3.init(student3 !== null ? student3.id : null, this.state.item.id);
                    tbStudent4.init(student4 !== null ? student4.id : null, this.state.item.id);
                    tbStudent5.init(student5 !== null ? student5.id : null, this.state.item.id);
                    tbStudent6.init(student6 !== null ? student6.id : null, this.state.item.id);
                    tbStudent7.init(student7 !== null ? student7.id : null, this.state.item.id);
                    tbStudent8.init(student8 !== null ? student8.id : null, this.state.item.id);
                }
                boxDidShow() {
                    if (this.state.type === Lists.BoxTypes.Create) {
                        var tbId = this.refs[Lists.REF_FORM_TB + FORM_ID];
                        $(tbId).focus();
                    }
                    else if (this.state.type === Lists.BoxTypes.Edit) {
                        var tbName = this.refs[Lists.REF_FORM_TB + FORM_NAME];
                        $(tbName).focus();
                    }
                }
                isIdValid(id) {
                    let valid = id.length > 0; // cannot be empty
                    let allowedChars = "abcdefghijklmnopqrstuvwxyz0123456789";
                    // check allowed chars
                    if (valid) {
                        for (let i = 0; i < id.length && valid; i++) {
                            if (allowedChars.indexOf(id[i].toLowerCase()) === -1) {
                                valid = false;
                            }
                        }
                    }
                    return valid;
                }
                isNameValid(name) {
                    return name.trim().length > 0; // cannot be empty
                }
                validateId(focusOnError) {
                    let valid = true;
                    if (this.state.type === Lists.BoxTypes.Create) {
                        let tbId = this.refs[Lists.REF_FORM_TB + FORM_ID];
                        let idVal = $(tbId).val();
                        if (this.isIdValid(idVal)) {
                            this.setValidationStatus(FORM_ID, Lists.BoxValidationStatus.Success, "");
                        }
                        else {
                            this.setValidationStatus(FORM_ID, Lists.BoxValidationStatus.Error, "Seat computer Id cannot be empty. It must be unique and contains only alphanumeric characters.");
                            if (focusOnError) {
                                $(tbId).focus();
                            }
                            valid = false;
                        }
                    }
                    return valid;
                }
                validateName(focusOnError) {
                    let valid = true;
                    if (this.state.type === Lists.BoxTypes.Create || this.state.type === Lists.BoxTypes.Edit) {
                        let tbName = this.refs[Lists.REF_FORM_TB + FORM_NAME];
                        let nameVal = $(tbName).val();
                        if (this.isNameValid(nameVal)) {
                            this.setValidationStatus(FORM_NAME, Lists.BoxValidationStatus.Success, "");
                        }
                        else {
                            this.setValidationStatus(FORM_NAME, Lists.BoxValidationStatus.Error, "Seat computer name cannot be empty.");
                            if (focusOnError) {
                                $(tbName).focus();
                            }
                            valid = false;
                        }
                    }
                    return valid;
                }
                validateStudents(focusOnError) {
                    let tbStudent1 = this.refs[Lists.REF_FORM_TB + FORM_STUDENT1];
                    let tbStudent2 = this.refs[Lists.REF_FORM_TB + FORM_STUDENT2];
                    let tbStudent3 = this.refs[Lists.REF_FORM_TB + FORM_STUDENT3];
                    let tbStudent4 = this.refs[Lists.REF_FORM_TB + FORM_STUDENT4];
                    let tbStudent5 = this.refs[Lists.REF_FORM_TB + FORM_STUDENT5];
                    let tbStudent6 = this.refs[Lists.REF_FORM_TB + FORM_STUDENT6];
                    let tbStudent7 = this.refs[Lists.REF_FORM_TB + FORM_STUDENT7];
                    let tbStudent8 = this.refs[Lists.REF_FORM_TB + FORM_STUDENT8];
                    let valStudent1 = tbStudent1.getSelectedValue();
                    let valStudent2 = tbStudent2.getSelectedValue();
                    let valStudent3 = tbStudent3.getSelectedValue();
                    let valStudent4 = tbStudent4.getSelectedValue();
                    let valStudent5 = tbStudent5.getSelectedValue();
                    let valStudent6 = tbStudent6.getSelectedValue();
                    let valStudent7 = tbStudent7.getSelectedValue();
                    let valStudent8 = tbStudent8.getSelectedValue();
                    let valid = true;
                    if (valStudent1 !== ""
                        && (valStudent1 === valStudent2
                            || valStudent1 === valStudent3
                            || valStudent1 === valStudent4
                            || valStudent1 === valStudent5
                            || valStudent1 === valStudent6
                            || valStudent1 === valStudent7
                            || valStudent1 === valStudent8)) {
                        valid = false;
                        this.setValidationStatus(FORM_STUDENT1, Lists.BoxValidationStatus.Error, "Duplicit Student computer selected.");
                    }
                    else {
                        this.setValidationStatus(FORM_STUDENT1, Lists.BoxValidationStatus.None, "");
                    }
                    if (valStudent2 !== ""
                        && (valStudent2 === valStudent1
                            || valStudent2 === valStudent3
                            || valStudent2 === valStudent4
                            || valStudent2 === valStudent5
                            || valStudent2 === valStudent6
                            || valStudent2 === valStudent7
                            || valStudent2 === valStudent8)) {
                        valid = false;
                        this.setValidationStatus(FORM_STUDENT2, Lists.BoxValidationStatus.Error, "Duplicit Student computer selected.");
                    }
                    else {
                        this.setValidationStatus(FORM_STUDENT2, Lists.BoxValidationStatus.None, "");
                    }
                    if (valStudent3 !== ""
                        && (valStudent3 === valStudent1
                            || valStudent3 === valStudent2
                            || valStudent3 === valStudent4
                            || valStudent3 === valStudent5
                            || valStudent3 === valStudent6
                            || valStudent3 === valStudent7
                            || valStudent3 === valStudent8)) {
                        valid = false;
                        this.setValidationStatus(FORM_STUDENT3, Lists.BoxValidationStatus.Error, "Duplicit Student computer selected.");
                    }
                    else {
                        this.setValidationStatus(FORM_STUDENT3, Lists.BoxValidationStatus.None, "");
                    }
                    if (valStudent4 !== ""
                        && (valStudent4 === valStudent1
                            || valStudent4 === valStudent2
                            || valStudent4 === valStudent3
                            || valStudent4 === valStudent5
                            || valStudent4 === valStudent6
                            || valStudent4 === valStudent7
                            || valStudent4 === valStudent8)) {
                        valid = false;
                        this.setValidationStatus(FORM_STUDENT4, Lists.BoxValidationStatus.Error, "Duplicit Student computer selected.");
                    }
                    else {
                        this.setValidationStatus(FORM_STUDENT4, Lists.BoxValidationStatus.None, "");
                    }
                    if (valStudent5 !== ""
                        && (valStudent5 === valStudent1
                            || valStudent5 === valStudent2
                            || valStudent5 === valStudent3
                            || valStudent5 === valStudent4
                            || valStudent5 === valStudent6
                            || valStudent5 === valStudent7
                            || valStudent5 === valStudent8)) {
                        valid = false;
                        this.setValidationStatus(FORM_STUDENT5, Lists.BoxValidationStatus.Error, "Duplicit Student computer selected.");
                    }
                    else {
                        this.setValidationStatus(FORM_STUDENT5, Lists.BoxValidationStatus.None, "");
                    }
                    if (valStudent6 !== ""
                        && (valStudent6 === valStudent1
                            || valStudent6 === valStudent2
                            || valStudent6 === valStudent3
                            || valStudent6 === valStudent4
                            || valStudent6 === valStudent5
                            || valStudent6 === valStudent7
                            || valStudent6 === valStudent8)) {
                        valid = false;
                        this.setValidationStatus(FORM_STUDENT6, Lists.BoxValidationStatus.Error, "Duplicit Student computer selected.");
                    }
                    else {
                        this.setValidationStatus(FORM_STUDENT6, Lists.BoxValidationStatus.None, "");
                    }
                    if (valStudent7 !== ""
                        && (valStudent7 === valStudent1
                            || valStudent7 === valStudent2
                            || valStudent7 === valStudent3
                            || valStudent7 === valStudent4
                            || valStudent7 === valStudent5
                            || valStudent7 === valStudent6
                            || valStudent7 === valStudent8)) {
                        valid = false;
                        this.setValidationStatus(FORM_STUDENT7, Lists.BoxValidationStatus.Error, "Duplicit Student computer selected.");
                    }
                    else {
                        this.setValidationStatus(FORM_STUDENT7, Lists.BoxValidationStatus.None, "");
                    }
                    if (valStudent8 !== ""
                        && (valStudent8 === valStudent1
                            || valStudent8 === valStudent2
                            || valStudent8 === valStudent3
                            || valStudent8 === valStudent4
                            || valStudent8 === valStudent5
                            || valStudent8 === valStudent6
                            || valStudent8 === valStudent7)) {
                        valid = false;
                        this.setValidationStatus(FORM_STUDENT8, Lists.BoxValidationStatus.Error, "Duplicit Student computer selected.");
                    }
                    else {
                        this.setValidationStatus(FORM_STUDENT8, Lists.BoxValidationStatus.None, "");
                    }
                    return valid;
                }
                validateForm(focusOnError) {
                    let valid = true;
                    if (!this.validateStudents(focusOnError)) {
                        valid = false;
                    }
                    if (!this.validateName(focusOnError)) {
                        valid = false;
                    }
                    if (!this.validateId(focusOnError)) {
                        valid = false;
                    }
                    return valid;
                }
                onKeyPressId(e) {
                    if (e.which === 13) {
                        e.preventDefault();
                        this.submitForm();
                    }
                    else {
                        this.validateId(false);
                    }
                }
                onKeyPressName(e) {
                    if (e.which === 13) {
                        e.preventDefault();
                        this.submitForm();
                    }
                    else {
                        this.validateName(false);
                    }
                }
                checkForExistingId(id, excludeId, callback) {
                    $.ajax({
                        cache: false,
                        type: "POST",
                        url: "/api/Classroom/" + this.props.classroomId + "/IsSeatExists/" + id,
                        data: JSON.stringify(excludeId),
                        contentType: "application/json",
                        success: (r) => {
                            if (r.status === VC.Global.Data.RESPONSE_SUCCESS) {
                                callback(r.data);
                            }
                            else {
                                // error
                                alert("ERROR: " + r.message);
                            }
                        },
                        error: (xhr, status, error) => {
                            // error
                            alert("ERROR: " + error);
                            this.close();
                        }
                    });
                }
                submitForm() {
                    let tbId = this.refs[Lists.REF_FORM_TB + FORM_ID];
                    let isFormValid = this.validateForm(true);
                    if (isFormValid) {
                        let valId = $(tbId).val();
                        this.divButtons.style.display = "none";
                        this.divProcessing.style.display = "block";
                        if (this.state.type === Lists.BoxTypes.Create) {
                            // check for existing item before create
                            this.checkForExistingId(valId, this.state.item.id, this.submitFormIdValidated.bind(this));
                        }
                        else if (this.state.type === Lists.BoxTypes.Edit) {
                            // edit
                            this.doUpdate();
                        }
                        else {
                            // delete
                            this.doDelete();
                        }
                    }
                }
                submitFormIdValidated(exist) {
                    if (exist) {
                        let tbId = this.refs[Lists.REF_FORM_TB + FORM_ID];
                        this.divButtons.style.display = "block";
                        this.divProcessing.style.display = "none";
                        this.setValidationStatus(FORM_ID, Lists.BoxValidationStatus.Error, "Seat Id already exists.");
                        $(tbId).focus();
                    }
                    else {
                        // create
                        this.doCreate();
                    }
                }
                doCreate() {
                    let tbId = this.refs[Lists.REF_FORM_TB + FORM_ID];
                    let tbName = this.refs[Lists.REF_FORM_TB + FORM_NAME];
                    let idVal = $(tbId).val();
                    let nameVal = $(tbName).val();
                    let student1 = null;
                    let tbStudent1 = this.refs[Lists.REF_FORM_TB + FORM_STUDENT1];
                    let selectedStudent1 = tbStudent1.getSelectedValue();
                    if (selectedStudent1 !== "") {
                        student1 = { id: selectedStudent1, name: tbStudent1.getSelectedText(), position: 1 };
                    }
                    let student2 = null;
                    let tbStudent2 = this.refs[Lists.REF_FORM_TB + FORM_STUDENT2];
                    let selectedStudent2 = tbStudent2.getSelectedValue();
                    if (selectedStudent2 !== "") {
                        student2 = { id: selectedStudent2, name: tbStudent2.getSelectedText(), position: 2 };
                    }
                    let student3 = null;
                    let tbStudent3 = this.refs[Lists.REF_FORM_TB + FORM_STUDENT3];
                    let selectedStudent3 = tbStudent3.getSelectedValue();
                    if (selectedStudent3 !== "") {
                        student3 = { id: selectedStudent3, name: tbStudent3.getSelectedText(), position: 3 };
                    }
                    let student4 = null;
                    let tbStudent4 = this.refs[Lists.REF_FORM_TB + FORM_STUDENT4];
                    let selectedStudent4 = tbStudent4.getSelectedValue();
                    if (selectedStudent4 !== "") {
                        student4 = { id: selectedStudent4, name: tbStudent4.getSelectedText(), position: 4 };
                    }
                    let student5 = null;
                    let tbStudent5 = this.refs[Lists.REF_FORM_TB + FORM_STUDENT5];
                    let selectedStudent5 = tbStudent5.getSelectedValue();
                    if (selectedStudent5 !== "") {
                        student5 = { id: selectedStudent5, name: tbStudent5.getSelectedText(), position: 5 };
                    }
                    let student6 = null;
                    let tbStudent6 = this.refs[Lists.REF_FORM_TB + FORM_STUDENT6];
                    let selectedStudent6 = tbStudent6.getSelectedValue();
                    if (selectedStudent6 !== "") {
                        student6 = { id: selectedStudent6, name: tbStudent6.getSelectedText(), position: 6 };
                    }
                    let student7 = null;
                    let tbStudent7 = this.refs[Lists.REF_FORM_TB + FORM_STUDENT7];
                    let selectedStudent7 = tbStudent7.getSelectedValue();
                    if (selectedStudent7 !== "") {
                        student7 = { id: selectedStudent7, name: tbStudent7.getSelectedText(), position: 7 };
                    }
                    let student8 = null;
                    let tbStudent8 = this.refs[Lists.REF_FORM_TB + FORM_STUDENT8];
                    let selectedStudent8 = tbStudent8.getSelectedValue();
                    if (selectedStudent8 !== "") {
                        student8 = { id: selectedStudent8, name: tbStudent8.getSelectedText(), position: 8 };
                    }
                    let students = [student1, student2, student3, student4, student5, student6, student7, student8];
                    $.ajax({
                        cache: false,
                        type: "POST",
                        url: "/api/Classroom/" + this.props.classroomId + "/CreateSeat/",
                        data: JSON.stringify({ id: idVal, name: nameVal, students: students }),
                        contentType: "application/json",
                        success: (r) => {
                            this.close();
                            if (r.status === VC.Global.Data.RESPONSE_SUCCESS) {
                                // add to list
                                let d = this.props.getListItems();
                                d.push(r.data);
                                this.props.setListItems(d);
                            }
                            else {
                                // error
                                alert("ERROR: " + r.message);
                            }
                        },
                        error: (xhr, status, error) => {
                            // error
                            alert("ERROR: " + error);
                            this.close();
                        }
                    });
                }
                doUpdate() {
                    let tbId = this.refs[Lists.REF_FORM_TB + FORM_ID];
                    let tbName = this.refs[Lists.REF_FORM_TB + FORM_NAME];
                    let idVal = $(tbId).val();
                    let nameVal = $(tbName).val();
                    let student1 = null;
                    let tbStudent1 = this.refs[Lists.REF_FORM_TB + FORM_STUDENT1];
                    let selectedStudent1 = tbStudent1.getSelectedValue();
                    if (selectedStudent1 !== "") {
                        student1 = { id: selectedStudent1, name: tbStudent1.getSelectedText(), position: 1 };
                    }
                    let student2 = null;
                    let tbStudent2 = this.refs[Lists.REF_FORM_TB + FORM_STUDENT2];
                    let selectedStudent2 = tbStudent2.getSelectedValue();
                    if (selectedStudent2 !== "") {
                        student2 = { id: selectedStudent2, name: tbStudent2.getSelectedText(), position: 2 };
                    }
                    let student3 = null;
                    let tbStudent3 = this.refs[Lists.REF_FORM_TB + FORM_STUDENT3];
                    let selectedStudent3 = tbStudent3.getSelectedValue();
                    if (selectedStudent3 !== "") {
                        student3 = { id: selectedStudent3, name: tbStudent3.getSelectedText(), position: 3 };
                    }
                    let student4 = null;
                    let tbStudent4 = this.refs[Lists.REF_FORM_TB + FORM_STUDENT4];
                    let selectedStudent4 = tbStudent4.getSelectedValue();
                    if (selectedStudent4 !== "") {
                        student4 = { id: selectedStudent4, name: tbStudent4.getSelectedText(), position: 4 };
                    }
                    let student5 = null;
                    let tbStudent5 = this.refs[Lists.REF_FORM_TB + FORM_STUDENT5];
                    let selectedStudent5 = tbStudent5.getSelectedValue();
                    if (selectedStudent5 !== "") {
                        student5 = { id: selectedStudent5, name: tbStudent5.getSelectedText(), position: 5 };
                    }
                    let student6 = null;
                    let tbStudent6 = this.refs[Lists.REF_FORM_TB + FORM_STUDENT6];
                    let selectedStudent6 = tbStudent6.getSelectedValue();
                    if (selectedStudent6 !== "") {
                        student6 = { id: selectedStudent6, name: tbStudent6.getSelectedText(), position: 6 };
                    }
                    let student7 = null;
                    let tbStudent7 = this.refs[Lists.REF_FORM_TB + FORM_STUDENT7];
                    let selectedStudent7 = tbStudent7.getSelectedValue();
                    if (selectedStudent7 !== "") {
                        student7 = { id: selectedStudent7, name: tbStudent7.getSelectedText(), position: 7 };
                    }
                    let student8 = null;
                    let tbStudent8 = this.refs[Lists.REF_FORM_TB + FORM_STUDENT8];
                    let selectedStudent8 = tbStudent8.getSelectedValue();
                    if (selectedStudent8 !== "") {
                        student8 = { id: selectedStudent8, name: tbStudent8.getSelectedText(), position: 8 };
                    }
                    let students = [student1, student2, student3, student4, student5, student6, student7, student8];
                    $.ajax({
                        cache: false,
                        type: "POST",
                        url: "/api/Classroom/" + this.props.classroomId + "/UpdateSeat/",
                        data: JSON.stringify({ id: idVal, name: nameVal, students: students }),
                        contentType: "application/json",
                        success: (r) => {
                            this.close();
                            if (r.status === VC.Global.Data.RESPONSE_SUCCESS) {
                                // update list
                                let d = this.props.getListItems();
                                for (let i = 0; i < d.length; i++) {
                                    if (d[i].id === this.state.item.id) {
                                        d[i] = r.data;
                                    }
                                }
                                this.props.setListItems(d);
                            }
                            else {
                                // error
                                alert("ERROR: " + r.message);
                            }
                        },
                        error: (xhr, status, error) => {
                            // error
                            alert("ERROR: " + error);
                            this.close();
                        }
                    });
                }
                doDelete() {
                    $.ajax({
                        cache: false,
                        type: "POST",
                        url: "/api/Classroom/" + this.props.classroomId + "/DeleteSeat/",
                        data: JSON.stringify(this.state.item.id),
                        contentType: "application/json",
                        success: (r) => {
                            this.close();
                            if (r.status === VC.Global.Data.RESPONSE_SUCCESS) {
                                // remove from list
                                let d = this.props.getListItems();
                                let _d = [];
                                for (let i = 0; i < d.length; i++) {
                                    if (d[i].id !== this.state.item.id) {
                                        _d.push(d[i]);
                                    }
                                }
                                this.props.setListItems(_d);
                            }
                            else {
                                // error
                                alert("ERROR: " + r.message);
                            }
                        },
                        error: (xhr, status, error) => {
                            // error
                            alert("ERROR: " + error);
                            this.close();
                        }
                    });
                }
                onSelectedStudentChanged() {
                    this.validateStudents(false);
                }
                renderForm() {
                    return (React.createElement("form", {className: "form-horizontal", role: "form"}, React.createElement("div", {ref: Lists.REF_FORM_DIV + FORM_ID, className: "form-group"}, React.createElement("label", {className: "col-sm-2", htmlFor: Lists.REF_FORM_TB + FORM_ID}, "Id: "), React.createElement("div", {className: "col-sm-10"}, React.createElement("input", {ref: Lists.REF_FORM_TB + FORM_ID, type: "text", className: "form-control", disabled: this.state.type !== Lists.BoxTypes.Create, placeholder: "Seat computer Id", maxLength: "25", onPaste: () => this.validateId(false), onCut: () => this.validateId(false), onKeyUp: (e) => this.onKeyPressId(e)}), React.createElement("span", {ref: Lists.REF_FORM_ICON + FORM_ID, style: { display: "none" }}))), React.createElement("div", {ref: Lists.REF_FORM_DIV + FORM_NAME, className: "form-group"}, React.createElement("label", {className: "col-sm-2", htmlFor: Lists.REF_FORM_TB + FORM_NAME}, "Name: "), React.createElement("div", {className: "col-sm-10"}, React.createElement("input", {ref: Lists.REF_FORM_TB + FORM_NAME, type: "text", className: "form-control", disabled: this.state.type === Lists.BoxTypes.Delete, placeholder: "Seat computer name", maxLength: "150", onPaste: () => this.validateName(false), onCut: () => this.validateName(false), onKeyUp: (e) => this.onKeyPressName(e)}), React.createElement("span", {ref: Lists.REF_FORM_ICON + FORM_NAME, style: { display: "none" }}))), React.createElement("div", {ref: Lists.REF_FORM_DIV + FORM_STUDENT1, className: "form-group"}, React.createElement("label", {className: "col-sm-2", htmlFor: Lists.REF_FORM_TB + FORM_STUDENT1}, "Student 1: "), React.createElement("div", {className: "col-sm-10"}, React.createElement(VC.Global.Components.Selector, {ref: Lists.REF_FORM_TB + FORM_STUDENT1, classroomId: this.props.classroomId, loadAction: "GetAvailableSeatStudents", defaultName: "Select Student computer", onSelectedItemChanged: () => this.onSelectedStudentChanged(), className: "form-control"}), React.createElement("span", {ref: Lists.REF_FORM_ICON + FORM_STUDENT1, style: { display: "none" }}))), React.createElement("div", {ref: Lists.REF_FORM_DIV + FORM_STUDENT2, className: "form-group"}, React.createElement("label", {className: "col-sm-2", htmlFor: Lists.REF_FORM_TB + FORM_STUDENT2}, "Student 2: "), React.createElement("div", {className: "col-sm-10"}, React.createElement(VC.Global.Components.Selector, {ref: Lists.REF_FORM_TB + FORM_STUDENT2, classroomId: this.props.classroomId, loadAction: "GetAvailableSeatStudents", defaultName: "Select Student computer", onSelectedItemChanged: () => this.onSelectedStudentChanged(), className: "form-control"}), React.createElement("span", {ref: Lists.REF_FORM_ICON + FORM_STUDENT2, style: { display: "none" }}))), React.createElement("div", {ref: Lists.REF_FORM_DIV + FORM_STUDENT3, className: "form-group"}, React.createElement("label", {className: "col-sm-2", htmlFor: Lists.REF_FORM_TB + FORM_STUDENT3}, "Student 3: "), React.createElement("div", {className: "col-sm-10"}, React.createElement(VC.Global.Components.Selector, {ref: Lists.REF_FORM_TB + FORM_STUDENT3, classroomId: this.props.classroomId, loadAction: "GetAvailableSeatStudents", defaultName: "Select Student computer", onSelectedItemChanged: () => this.onSelectedStudentChanged(), className: "form-control"}), React.createElement("span", {ref: Lists.REF_FORM_ICON + FORM_STUDENT3, style: { display: "none" }}))), React.createElement("div", {ref: Lists.REF_FORM_DIV + FORM_STUDENT4, className: "form-group"}, React.createElement("label", {className: "col-sm-2", htmlFor: Lists.REF_FORM_TB + FORM_STUDENT4}, "Student 4: "), React.createElement("div", {className: "col-sm-10"}, React.createElement(VC.Global.Components.Selector, {ref: Lists.REF_FORM_TB + FORM_STUDENT4, classroomId: this.props.classroomId, loadAction: "GetAvailableSeatStudents", defaultName: "Select Student computer", onSelectedItemChanged: () => this.onSelectedStudentChanged(), className: "form-control"}), React.createElement("span", {ref: Lists.REF_FORM_ICON + FORM_STUDENT4, style: { display: "none" }}))), React.createElement("div", {ref: Lists.REF_FORM_DIV + FORM_STUDENT5, className: "form-group"}, React.createElement("label", {className: "col-sm-2", htmlFor: Lists.REF_FORM_TB + FORM_STUDENT5}, "Student 5: "), React.createElement("div", {className: "col-sm-10"}, React.createElement(VC.Global.Components.Selector, {ref: Lists.REF_FORM_TB + FORM_STUDENT5, classroomId: this.props.classroomId, loadAction: "GetAvailableSeatStudents", defaultName: "Select Student computer", onSelectedItemChanged: () => this.onSelectedStudentChanged(), className: "form-control"}), React.createElement("span", {ref: Lists.REF_FORM_ICON + FORM_STUDENT5, style: { display: "none" }}))), React.createElement("div", {ref: Lists.REF_FORM_DIV + FORM_STUDENT6, className: "form-group"}, React.createElement("label", {className: "col-sm-2", htmlFor: Lists.REF_FORM_TB + FORM_STUDENT6}, "Student  6: "), React.createElement("div", {className: "col-sm-10"}, React.createElement(VC.Global.Components.Selector, {ref: Lists.REF_FORM_TB + FORM_STUDENT6, classroomId: this.props.classroomId, loadAction: "GetAvailableSeatStudents", defaultName: "Select Student computer", onSelectedItemChanged: () => this.onSelectedStudentChanged(), className: "form-control"}), React.createElement("span", {ref: Lists.REF_FORM_ICON + FORM_STUDENT6, style: { display: "none" }}))), React.createElement("div", {ref: Lists.REF_FORM_DIV + FORM_STUDENT7, className: "form-group"}, React.createElement("label", {className: "col-sm-2", htmlFor: Lists.REF_FORM_TB + FORM_STUDENT7}, "Student 7: "), React.createElement("div", {className: "col-sm-10"}, React.createElement(VC.Global.Components.Selector, {ref: Lists.REF_FORM_TB + FORM_STUDENT7, classroomId: this.props.classroomId, loadAction: "GetAvailableSeatStudents", defaultName: "Select Student computer", onSelectedItemChanged: () => this.onSelectedStudentChanged(), className: "form-control"}), React.createElement("span", {ref: Lists.REF_FORM_ICON + FORM_STUDENT7, style: { display: "none" }}))), React.createElement("div", {ref: Lists.REF_FORM_DIV + FORM_STUDENT8, className: "form-group"}, React.createElement("label", {className: "col-sm-2", htmlFor: Lists.REF_FORM_TB + FORM_STUDENT8}, "Student 8: "), React.createElement("div", {className: "col-sm-10"}, React.createElement(VC.Global.Components.Selector, {ref: Lists.REF_FORM_TB + FORM_STUDENT8, classroomId: this.props.classroomId, loadAction: "GetAvailableSeatStudents", defaultName: "Select Student computer", onSelectedItemChanged: () => this.onSelectedStudentChanged(), className: "form-control"}), React.createElement("span", {ref: Lists.REF_FORM_ICON + FORM_STUDENT8, style: { display: "none" }})))));
                }
            }
            class SeatsImportBox extends Lists.ImportBox {
                constructor(props) {
                    super(props);
                }
                renderHelp() {
                    return (React.createElement("div", {className: "text-muted"}, "EXAMPLE: ", React.createElement("br", null), "ID1, \"Seat Name\"", React.createElement("br", null), "ID2, \"Seat Name\"", React.createElement("br", null), "ID3, \"Seat Name\"", React.createElement("br", null)));
                }
                placeholder() {
                    return "ID1, \"Seat Name\"\nID2, \"Seat Name\"\nID3, \"Seat Name\"";
                }
                import() {
                    this.hideError();
                    this.setProcessing(true);
                    let data = this.tb.value;
                    if (data.length === 0) {
                        // nothing to import
                        this.showError("ERROR: Nothing to import", 2000);
                        this.setProcessing(false);
                    }
                    else {
                        $.ajax({
                            cache: false,
                            type: "POST",
                            url: "/api/Classroom/" + this.props.classroomId + "/ImportSeats",
                            data: JSON.stringify(data),
                            contentType: "application/json",
                            success: (r) => {
                                if (r.status === VC.Global.Data.RESPONSE_SUCCESS) {
                                    this.tb.value = "";
                                    this.close();
                                    // add to list
                                    let d = this.props.getListItems();
                                    r.data.forEach((item) => {
                                        d.push(item);
                                    });
                                    this.props.setListItems(d);
                                }
                                else {
                                    // error
                                    this.showError("ERROR: " + r.message);
                                    this.setProcessing(false);
                                }
                            },
                            error: (xhr, status, error) => {
                                // error
                                alert("ERROR: " + error);
                                this.close();
                            }
                        });
                    }
                }
            }
        })(Lists = Admin.Lists || (Admin.Lists = {}));
    })(Admin = VC.Admin || (VC.Admin = {}));
})(VC || (VC = {}));
//# sourceMappingURL=Seats.js.map