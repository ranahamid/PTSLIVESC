/* tslint:disable:max-line-length */
var VC;
(function (VC) {
    var Admin;
    (function (Admin) {
        var Lists;
        (function (Lists) {
            "use strict";
            const FORM_TITLE = "Title";
            class Moderators extends Lists.Base {
                getList() {
                    return this.list;
                }
                getBox() {
                    return this.box;
                }
                getImportBox() {
                    return null;
                }
                render() {
                    return (React.createElement("div", null, React.createElement(ModeratorList, {ref: (ref) => this.list = ref, title: "Moderator", actionUrl: this.props.actionUrl, classroomId: this.props.classroomId, loadMethod: "LoadModerators", showBoxNew: this.showBoxNew.bind(this), showBoxEdit: this.showBoxEdit.bind(this), showEnableClass: this.showEnableClass.bind(this), showDisableClass: this.showDisableClass.bind(this), showBoxDelete: this.showBoxDelete.bind(this)}), React.createElement(FormsBox, {ref: (ref) => this.box = ref, title: "Moderator", formType: VC.Forms.FormType.Survey, actionUrl: this.props.actionUrl, classroomId: this.props.classroomId, getListItems: this.getListItems.bind(this), setListItems: this.setListItems.bind(this)})));
                }
            }
            Lists.Moderators = Moderators;
            class Surveys extends Lists.Base {
                getList() {
                    return this.list;
                }
                getBox() {
                    return this.box;
                }
                getImportBox() {
                    return null;
                }
                render() {
                    return (React.createElement("div", null, React.createElement(FormsList, {ref: (ref) => this.list = ref, title: "Survey", actionUrl: this.props.actionUrl, classroomId: this.props.classroomId, loadMethod: "LoadSurveys", showBoxNew: this.showBoxNew.bind(this), showBoxEdit: this.showBoxEdit.bind(this), showEnableClass: this.showEnableClass.bind(this), showDisableClass: this.showDisableClass.bind(this), showBoxDelete: this.showBoxDelete.bind(this)}), React.createElement(FormsBox, {ref: (ref) => this.box = ref, title: "Survey", formType: VC.Forms.FormType.Survey, actionUrl: this.props.actionUrl, classroomId: this.props.classroomId, getListItems: this.getListItems.bind(this), setListItems: this.setListItems.bind(this)})));
                }
            }
            Lists.Surveys = Surveys;
            class Polls extends Lists.Base {
                getList() {
                    return this.list;
                }
                getBox() {
                    return this.box;
                }
                getImportBox() {
                    return null;
                }
                render() {
                    return (React.createElement("div", null, React.createElement(FormsList, {ref: (ref) => this.list = ref, title: "Poll", actionUrl: this.props.actionUrl, classroomId: this.props.classroomId, loadMethod: "LoadPolls", showBoxNew: this.showBoxNew.bind(this), showBoxEdit: this.showBoxEdit.bind(this), showEnableClass: this.showEnableClass.bind(this), showDisableClass: this.showDisableClass.bind(this), showBoxDelete: this.showBoxDelete.bind(this)}), React.createElement(FormsBox, {ref: (ref) => this.box = ref, title: "Poll", formType: VC.Forms.FormType.Poll, actionUrl: this.props.actionUrl, classroomId: this.props.classroomId, getListItems: this.getListItems.bind(this), setListItems: this.setListItems.bind(this)})));
                }
            }
            Lists.Polls = Polls;
            class FormsList extends Lists.List {
                renderItemCols(d) {
                    let l = [];
                    l.push(React.createElement("td", {key: "tdTitle_" + d.id}, d.title));
                    return l;
                }
                renderTableHeaderCols() {
                    let l = [];
                    l.push(React.createElement("th", {key: "thTitle"}, "Title"));
                    return l;
                }
            }
            class ModeratorList extends Lists.List {
                renderItemCols(d) {
                    let l = [];
                    l.push(React.createElement("td", {key: "tdTitle_" + d.id}, d.title));
                    return l;
                }
                renderTableHeaderCols() {
                    let l = [];
                    l.push(React.createElement("th", {key: "thTitle"}, "Moderator Computer"));
                    return l;
                }
            }
            class FormsBox extends Lists.Box {
                constructor(props) {
                    super({ title: "" }, props);
                }
                boxWillShow() {
                    let tbTitle = this.refs[Lists.REF_FORM_TB + FORM_TITLE];
                    $(tbTitle).val(this.state.item.title);
                    this.setValidationStatus(FORM_TITLE, Lists.BoxValidationStatus.None, "");
                    this.form.loading();
                }
                boxDidShow() {
                    if (this.state.type === Lists.BoxTypes.Create || this.state.type === Lists.BoxTypes.Edit) {
                        let tbTitle = this.refs[Lists.REF_FORM_TB + FORM_TITLE];
                        $(tbTitle).focus();
                    }
                    if (this.state.type === Lists.BoxTypes.Delete) {
                        this.form.changeView(VC.Forms.FormViews.Preview);
                    }
                    else {
                        this.form.changeView(VC.Forms.FormViews.Edit);
                    }
                    if (this.state.type === Lists.BoxTypes.Create) {
                        this.form.init();
                    }
                    else {
                        this.form.initForm(this.state.item.id);
                    }
                }
                isTitleValid(title) {
                    return !(title.length === 0 || !title.trim()); // cannot be empty
                }
                validateTitle(focusOnError) {
                    let valid = true;
                    if (this.state.type === Lists.BoxTypes.Create || this.state.type === Lists.BoxTypes.Edit) {
                        let tbTitle = this.refs[Lists.REF_FORM_TB + FORM_TITLE];
                        let titleVal = $(tbTitle).val();
                        if (this.isTitleValid(titleVal)) {
                            this.setValidationStatus(FORM_TITLE, Lists.BoxValidationStatus.Success, "");
                        }
                        else {
                            this.setValidationStatus(FORM_TITLE, Lists.BoxValidationStatus.Error, "Title cannot be empty.");
                            if (focusOnError) {
                                $(tbTitle).focus();
                            }
                            valid = false;
                        }
                    }
                    return valid;
                }
                validateForm(focusOnError) {
                    let valid = true;
                    if (!this.validateTitle(focusOnError)) {
                        valid = false;
                    }
                    if (!this.form.validate()) {
                        valid = false;
                    }
                    return valid;
                }
                onKeyPressTitle(e) {
                    if (e.which === 13) {
                        e.preventDefault();
                        this.submitForm();
                    }
                    else {
                        this.validateTitle(false);
                    }
                }
                submitForm() {
                    let isFormValid = this.validateForm(true);
                    if (isFormValid) {
                        this.divButtons.style.display = "none";
                        this.divProcessing.style.display = "block";
                        if (this.state.type === Lists.BoxTypes.Create) {
                            // create
                            this.doCreate();
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
                doCreate() {
                    let tbTitle = this.refs[Lists.REF_FORM_TB + FORM_TITLE];
                    let titleVal = $(tbTitle).val();
                    let formData = this.form.getData(VC.Forms.DataType.Form);
                    VC.Forms.FormApi.Insert({ classroomId: this.props.classroomId, type: this.props.formType, title: titleVal, formData: formData }, (id) => {
                        // success
                        this.close();
                        // add to list
                        let d = this.props.getListItems();
                        d.push({ id: id, title: titleVal });
                        this.props.setListItems(d);
                    }, (error) => {
                        // error
                        alert("ERROR: " + error);
                        this.close();
                    });
                }
                doUpdate() {
                    let tbTitle = this.refs[Lists.REF_FORM_TB + FORM_TITLE];
                    let titleVal = $(tbTitle).val();
                    let formData = this.form.getData(VC.Forms.DataType.Form);
                    VC.Forms.FormApi.Update({ uid: this.state.item.id, classroomId: this.props.classroomId, type: this.props.formType, title: titleVal, formData: formData }, () => {
                        // success
                        this.close();
                        // update list
                        let d = this.props.getListItems();
                        for (let i = 0; i < d.length; i++) {
                            if (d[i].id === this.state.item.id) {
                                d[i].title = titleVal;
                            }
                        }
                        this.props.setListItems(d);
                    }, (error) => {
                        // error
                        alert("ERROR: " + error);
                        this.close();
                    });
                }
                doDelete() {
                    VC.Forms.FormApi.Delete(this.state.item.id, () => {
                        // success
                        this.close();
                        // remove from list
                        let d = this.props.getListItems();
                        let _d = [];
                        for (let i = 0; i < d.length; i++) {
                            if (d[i].id !== this.state.item.id) {
                                _d.push(d[i]);
                            }
                        }
                        this.props.setListItems(_d);
                    }, (error) => {
                        // error
                        alert("ERROR: " + error);
                        this.close();
                    });
                }
                renderForm() {
                    return (React.createElement("form", {className: "form-horizontal", role: "form"}, React.createElement("div", {ref: Lists.REF_FORM_DIV + FORM_TITLE, className: "form-group"}, React.createElement("label", {className: "col-sm-2", htmlFor: Lists.REF_FORM_TB + FORM_TITLE}, "Name: "), React.createElement("div", {className: "col-sm-10"}, React.createElement("input", {ref: Lists.REF_FORM_TB + FORM_TITLE, type: "text", className: "form-control", disabled: this.state.type === Lists.BoxTypes.Delete, placeholder: this.props.title + " title", maxLength: "150", onPaste: () => this.validateTitle(false), onCut: () => this.validateTitle(false), onKeyUp: (e) => this.onKeyPressTitle(e)}), React.createElement("span", {ref: Lists.REF_FORM_ICON + FORM_TITLE, style: { display: "none" }}))), React.createElement("div", {style: { display: "none" }}, React.createElement("input", {type: "text"})), React.createElement("div", {className: "form-group"}, React.createElement("label", {className: "col-sm-2"}, this.props.title, ": "), React.createElement("div", {className: "col-sm-10"}, React.createElement("div", {style: { paddingLeft: "15px", paddingRight: "15px" }}, React.createElement(VC.Forms.Form, {ref: (ref) => this.form = ref, view: VC.Forms.FormViews.Edit, type: this.props.formType}))))));
                }
            }
        })(Lists = Admin.Lists || (Admin.Lists = {}));
    })(Admin = VC.Admin || (VC.Admin = {}));
})(VC || (VC = {}));
//# sourceMappingURL=Forms.js.map