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
            class Teachers extends Lists.Base {
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
                    return (React.createElement("div", null, React.createElement(TeachersList, {ref: (ref) => this.list = ref, title: "Teacher computer", actionUrl: this.props.actionUrl, classroomId: this.props.classroomId, loadMethod: "LoadTeachers", showBoxImport: () => this.showBoxImport(), showBoxNew: this.showBoxNew.bind(this), showBoxEdit: this.showBoxEdit.bind(this), showBoxDelete: this.showBoxDelete.bind(this)}), React.createElement(TeachersBox, {ref: (ref) => this.box = ref, title: "Teacher computer", actionUrl: this.props.actionUrl, classroomId: this.props.classroomId, getListItems: this.getListItems.bind(this), setListItems: this.setListItems.bind(this)}), React.createElement(TeachersImportBox, {ref: (ref) => this.boxImport = ref, title: "Import Teacher computers", classroomId: this.props.classroomId, getListItems: this.getListItems.bind(this), setListItems: this.setListItems.bind(this)})));
                }
            }
            Lists.Teachers = Teachers;
            class TeachersList extends Lists.List {
                renderItemCols(d) {
                    let l = [];
                    l.push(React.createElement("td", {key: "tdId_" + d.id}, d.id));
                    l.push(React.createElement("td", {key: "tdName_" + d.id}, d.name));
                    return l;
                }
                renderTableHeaderCols() {
                    let l = [];
                    l.push(React.createElement("th", {key: "thId"}, "ID"));
                    l.push(React.createElement("th", {key: "thTeacher"}, "Teacher computer"));
                    return l;
                }
            }
            class TeachersBox extends Lists.Box {
                constructor(props) {
                    super({ id: "", name: "" }, props);
                }
                boxWillShow() {
                    let tbId = this.refs[Lists.REF_FORM_TB + FORM_ID];
                    let tbName = this.refs[Lists.REF_FORM_TB + FORM_NAME];
                    $(tbId).val(this.state.item.id);
                    $(tbName).val(this.state.item.name);
                    this.setValidationStatus(FORM_ID, Lists.BoxValidationStatus.None, "");
                    this.setValidationStatus(FORM_NAME, Lists.BoxValidationStatus.None, "");
                }
                boxDidShow() {
                    if (this.state.type === Lists.BoxTypes.Create) {
                        let tbId = this.refs[Lists.REF_FORM_TB + FORM_ID];
                        $(tbId).focus();
                    }
                    else if (this.state.type === Lists.BoxTypes.Edit) {
                        let tbName = this.refs[Lists.REF_FORM_TB + FORM_NAME];
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
                            this.setValidationStatus(FORM_ID, Lists.BoxValidationStatus.Error, "Teacher computer Id cannot be empty. It must be unique and contains only alphanumeric characters.");
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
                            this.setValidationStatus(FORM_NAME, Lists.BoxValidationStatus.Error, "Teacher computer name cannot be empty.");
                            if (focusOnError) {
                                $(tbName).focus();
                            }
                            valid = false;
                        }
                    }
                    return valid;
                }
                validateForm(focusOnError) {
                    let valid = true;
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
                        url: "/api/Classroom/" + this.props.classroomId + "/IsTeacherExists/" + id,
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
                        this.setValidationStatus(FORM_ID, Lists.BoxValidationStatus.Error, "Teacher computer Id already exists.");
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
                    $.ajax({
                        cache: false,
                        type: "POST",
                        url: "/api/Classroom/" + this.props.classroomId + "/CreateTeacher",
                        data: JSON.stringify({ id: idVal, name: nameVal }),
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
                    $.ajax({
                        type: "POST",
                        url: "/api/Classroom/" + this.props.classroomId + "/UpdateTeacher",
                        data: JSON.stringify({ id: idVal, name: nameVal }),
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
                        url: "/api/Classroom/" + this.props.classroomId + "/DeleteTeacher",
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
                renderForm() {
                    return (React.createElement("form", {className: "form-horizontal", role: "form"}, React.createElement("div", {ref: Lists.REF_FORM_DIV + FORM_ID, className: "form-group"}, React.createElement("label", {className: "col-sm-2", htmlFor: Lists.REF_FORM_TB + FORM_ID}, "Id: "), React.createElement("div", {className: "col-sm-10"}, React.createElement("input", {ref: Lists.REF_FORM_TB + FORM_ID, type: "text", className: "form-control", disabled: this.state.type !== Lists.BoxTypes.Create, placeholder: "Teacher computer Id", maxLength: "25", onPaste: () => this.validateId(false), onCut: () => this.validateId(false), onKeyUp: (e) => this.onKeyPressId(e)}), React.createElement("span", {ref: Lists.REF_FORM_ICON + FORM_ID, style: { display: "none" }}))), React.createElement("div", {ref: Lists.REF_FORM_DIV + FORM_NAME, className: "form-group"}, React.createElement("label", {className: "col-sm-2", htmlFor: Lists.REF_FORM_TB + FORM_NAME}, "Name: "), React.createElement("div", {className: "col-sm-10"}, React.createElement("input", {ref: Lists.REF_FORM_TB + FORM_NAME, type: "text", className: "form-control", disabled: this.state.type === Lists.BoxTypes.Delete, placeholder: "Teacher computer name", maxLength: "150", onPaste: () => this.validateName(false), onCut: () => this.validateName(false), onKeyUp: (e) => this.onKeyPressName(e)}), React.createElement("span", {ref: Lists.REF_FORM_ICON + FORM_NAME, style: { display: "none" }})))));
                }
            }
            class TeachersImportBox extends Lists.ImportBox {
                constructor(props) {
                    super(props);
                }
                renderHelp() {
                    return (React.createElement("div", {className: "text-muted"}, "EXAMPLE: ", React.createElement("br", null), "ID1, \"Teacher Name\"", React.createElement("br", null), "ID2, \"Teacher Name\"", React.createElement("br", null), "ID3, \"Teacher Name\"", React.createElement("br", null)));
                }
                placeholder() {
                    return "ID1, \"Teacher Name\"\nID2, \"Teacher Name\"\nID3, \"Teacher Name\"";
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
                            url: "/api/Classroom/" + this.props.classroomId + "/ImportTeachers",
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
//# sourceMappingURL=Teachers.js.map