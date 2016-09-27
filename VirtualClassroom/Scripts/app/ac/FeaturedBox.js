/* tslint:disable:max-line-length */
var VC;
(function (VC) {
    var App;
    (function (App) {
        var AC;
        (function (AC) {
            "use strict";
            const REF_FORM_DIV = "div";
            const REF_FORM_TB = "tb";
            const FORM_STUDENT1 = "Student1";
            const FORM_STUDENT2 = "Student2";
            const FORM_STUDENT3 = "Student3";
            const FORM_STUDENT4 = "Student4";
            const FORM_STUDENT5 = "Student5";
            const FORM_STUDENT6 = "Student6";
            const FORM_STUDENT7 = "Student7";
            const FORM_STUDENT8 = "Student8";
            var BoxStatus;
            (function (BoxStatus) {
                BoxStatus[BoxStatus["Loading"] = 0] = "Loading";
                BoxStatus[BoxStatus["Processing"] = 1] = "Processing";
                BoxStatus[BoxStatus["View"] = 2] = "View";
            })(BoxStatus || (BoxStatus = {}));
            var BoxValidationStatus;
            (function (BoxValidationStatus) {
                BoxValidationStatus[BoxValidationStatus["None"] = 0] = "None";
                BoxValidationStatus[BoxValidationStatus["Success"] = 1] = "Success";
                BoxValidationStatus[BoxValidationStatus["Error"] = 2] = "Error";
            })(BoxValidationStatus || (BoxValidationStatus = {}));
            class FeaturedBox extends React.Component {
                constructor(props) {
                    super(props);
                    this.state = { uid: "", name: "", status: BoxStatus.Loading, item: null };
                }
                componentDidMount() {
                    $(this.divBox).on("shown.bs.modal", () => this.boxDidShow());
                    $(this.divBox).on("hidden.bs.modal", () => this.boxDidHide());
                }
                show() {
                    // show
                    this.boxWillShow();
                    $(this.divBox).modal("show");
                    this.divButtons.style.display = "block";
                    this.divProcessing.style.display = "none";
                }
                boxWillShow() {
                    this.loadFeatured();
                }
                boxDidShow() {
                }
                hide() {
                    $(this.divBox).modal("hide");
                }
                boxDidHide() {
                    this.divButtons.style.display = "block";
                    this.divProcessing.style.display = "none";
                }
                open(uid, name) {
                    this.setState({ uid: uid, name: name, status: BoxStatus.Loading, item: null }, () => {
                        this.show();
                    });
                }
                loadFeatured() {
                    $.ajax({
                        cache: false,
                        type: "GET",
                        url: "/api/Classroom/" + this.props.classroomId + "/LoadFeatured/" + this.state.uid,
                        contentType: "application/json",
                        success: (r) => {
                            if (r.status === VC.Global.Data.RESPONSE_SUCCESS) {
                                // loaded
                                this.setState({ item: r.data, status: BoxStatus.View }, () => {
                                    this.loaded();
                                });
                            }
                            else {
                                // error
                                alert(r.message);
                            }
                        },
                        error: (xhr, status, error) => {
                            // xhr error
                            alert("XHR Error - " + xhr.statusText);
                        }
                    });
                }
                loaded() {
                    let tbStudent1 = this.refs[REF_FORM_TB + FORM_STUDENT1];
                    let tbStudent2 = this.refs[REF_FORM_TB + FORM_STUDENT2];
                    let tbStudent3 = this.refs[REF_FORM_TB + FORM_STUDENT3];
                    let tbStudent4 = this.refs[REF_FORM_TB + FORM_STUDENT4];
                    let tbStudent5 = this.refs[REF_FORM_TB + FORM_STUDENT5];
                    let tbStudent6 = this.refs[REF_FORM_TB + FORM_STUDENT6];
                    let tbStudent7 = this.refs[REF_FORM_TB + FORM_STUDENT7];
                    let tbStudent8 = this.refs[REF_FORM_TB + FORM_STUDENT8];
                    let student1 = this.getStudentByPosition(1);
                    let student2 = this.getStudentByPosition(2);
                    let student3 = this.getStudentByPosition(3);
                    let student4 = this.getStudentByPosition(4);
                    let student5 = this.getStudentByPosition(5);
                    let student6 = this.getStudentByPosition(6);
                    let student7 = this.getStudentByPosition(7);
                    let student8 = this.getStudentByPosition(8);
                    tbStudent1.init(student1 !== null ? student1.id : null);
                    tbStudent2.init(student2 !== null ? student2.id : null);
                    tbStudent3.init(student3 !== null ? student3.id : null);
                    tbStudent4.init(student4 !== null ? student4.id : null);
                    tbStudent5.init(student5 !== null ? student5.id : null);
                    tbStudent6.init(student6 !== null ? student6.id : null);
                    tbStudent7.init(student7 !== null ? student7.id : null);
                    tbStudent8.init(student8 !== null ? student8.id : null);
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
                onSelectedStudentChanged() {
                    this.validateStudents(false);
                }
                setValidationStatus(ref, status, tooltip) {
                    let div = this.refs[REF_FORM_DIV + ref];
                    let tb = this.refs[REF_FORM_TB + ref];
                    switch (status) {
                        case BoxValidationStatus.None:
                            div.className = "form-group";
                            break;
                        case BoxValidationStatus.Success:
                            div.className = "form-group has-success has-feedback";
                            break;
                        case BoxValidationStatus.Error:
                            div.className = "form-group has-error has-feedback";
                            break;
                    }
                    if (tooltip !== "") {
                        $(tb).attr("data-toggle", "tooltip");
                        $(tb).attr("data-placement", "bottom");
                        $(tb).attr("title", tooltip);
                        $(tb).tooltip();
                    }
                    else {
                        $(tb).removeAttr("data-toggle");
                        $(tb).removeAttr("data-placement");
                        $(tb).removeAttr("title");
                        $(tb).tooltip("destroy");
                    }
                }
                validateStudents(focusOnError) {
                    let tbStudent1 = this.refs[REF_FORM_TB + FORM_STUDENT1];
                    let tbStudent2 = this.refs[REF_FORM_TB + FORM_STUDENT2];
                    let tbStudent3 = this.refs[REF_FORM_TB + FORM_STUDENT3];
                    let tbStudent4 = this.refs[REF_FORM_TB + FORM_STUDENT4];
                    let tbStudent5 = this.refs[REF_FORM_TB + FORM_STUDENT5];
                    let tbStudent6 = this.refs[REF_FORM_TB + FORM_STUDENT6];
                    let tbStudent7 = this.refs[REF_FORM_TB + FORM_STUDENT7];
                    let tbStudent8 = this.refs[REF_FORM_TB + FORM_STUDENT8];
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
                        this.setValidationStatus(FORM_STUDENT1, BoxValidationStatus.Error, "Duplicit Student computer selected.");
                    }
                    else {
                        this.setValidationStatus(FORM_STUDENT1, BoxValidationStatus.None, "");
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
                        this.setValidationStatus(FORM_STUDENT2, BoxValidationStatus.Error, "Duplicit Student computer selected.");
                    }
                    else {
                        this.setValidationStatus(FORM_STUDENT2, BoxValidationStatus.None, "");
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
                        this.setValidationStatus(FORM_STUDENT3, BoxValidationStatus.Error, "Duplicit Student computer selected.");
                    }
                    else {
                        this.setValidationStatus(FORM_STUDENT3, BoxValidationStatus.None, "");
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
                        this.setValidationStatus(FORM_STUDENT4, BoxValidationStatus.Error, "Duplicit Student computer selected.");
                    }
                    else {
                        this.setValidationStatus(FORM_STUDENT4, BoxValidationStatus.None, "");
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
                        this.setValidationStatus(FORM_STUDENT5, BoxValidationStatus.Error, "Duplicit Student computer selected.");
                    }
                    else {
                        this.setValidationStatus(FORM_STUDENT5, BoxValidationStatus.None, "");
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
                        this.setValidationStatus(FORM_STUDENT6, BoxValidationStatus.Error, "Duplicit Student computer selected.");
                    }
                    else {
                        this.setValidationStatus(FORM_STUDENT6, BoxValidationStatus.None, "");
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
                        this.setValidationStatus(FORM_STUDENT7, BoxValidationStatus.Error, "Duplicit Student computer selected.");
                    }
                    else {
                        this.setValidationStatus(FORM_STUDENT7, BoxValidationStatus.None, "");
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
                        this.setValidationStatus(FORM_STUDENT8, BoxValidationStatus.Error, "Duplicit Student computer selected.");
                    }
                    else {
                        this.setValidationStatus(FORM_STUDENT8, BoxValidationStatus.None, "");
                    }
                    return valid;
                }
                validateForm(focusOnError) {
                    let valid = true;
                    if (!this.validateStudents(focusOnError)) {
                        valid = false;
                    }
                    return valid;
                }
                updateFeatured() {
                    let isFormValid = this.validateForm(true);
                    if (isFormValid) {
                        this.setState({ status: BoxStatus.Processing });
                        // update
                        this.doUpdate();
                    }
                }
                doUpdate() {
                    let student1 = null;
                    let tbStudent1 = this.refs[REF_FORM_TB + FORM_STUDENT1];
                    let selectedStudent1 = tbStudent1.getSelectedValue();
                    if (selectedStudent1 !== "") {
                        student1 = { id: selectedStudent1, name: tbStudent1.getSelectedText(), position: 1 };
                    }
                    let student2 = null;
                    let tbStudent2 = this.refs[REF_FORM_TB + FORM_STUDENT2];
                    let selectedStudent2 = tbStudent2.getSelectedValue();
                    if (selectedStudent2 !== "") {
                        student2 = { id: selectedStudent2, name: tbStudent2.getSelectedText(), position: 2 };
                    }
                    let student3 = null;
                    let tbStudent3 = this.refs[REF_FORM_TB + FORM_STUDENT3];
                    let selectedStudent3 = tbStudent3.getSelectedValue();
                    if (selectedStudent3 !== "") {
                        student3 = { id: selectedStudent3, name: tbStudent3.getSelectedText(), position: 3 };
                    }
                    let student4 = null;
                    let tbStudent4 = this.refs[REF_FORM_TB + FORM_STUDENT4];
                    let selectedStudent4 = tbStudent4.getSelectedValue();
                    if (selectedStudent4 !== "") {
                        student4 = { id: selectedStudent4, name: tbStudent4.getSelectedText(), position: 4 };
                    }
                    let student5 = null;
                    let tbStudent5 = this.refs[REF_FORM_TB + FORM_STUDENT5];
                    let selectedStudent5 = tbStudent5.getSelectedValue();
                    if (selectedStudent5 !== "") {
                        student5 = { id: selectedStudent5, name: tbStudent5.getSelectedText(), position: 5 };
                    }
                    let student6 = null;
                    let tbStudent6 = this.refs[REF_FORM_TB + FORM_STUDENT6];
                    let selectedStudent6 = tbStudent6.getSelectedValue();
                    if (selectedStudent6 !== "") {
                        student6 = { id: selectedStudent6, name: tbStudent6.getSelectedText(), position: 6 };
                    }
                    let student7 = null;
                    let tbStudent7 = this.refs[REF_FORM_TB + FORM_STUDENT7];
                    let selectedStudent7 = tbStudent7.getSelectedValue();
                    if (selectedStudent7 !== "") {
                        student7 = { id: selectedStudent7, name: tbStudent7.getSelectedText(), position: 7 };
                    }
                    let student8 = null;
                    let tbStudent8 = this.refs[REF_FORM_TB + FORM_STUDENT8];
                    let selectedStudent8 = tbStudent8.getSelectedValue();
                    if (selectedStudent8 !== "") {
                        student8 = { id: selectedStudent8, name: tbStudent8.getSelectedText(), position: 8 };
                    }
                    let students = [student1, student2, student3, student4, student5, student6, student7, student8];
                    let layout = 1;
                    if (student8 || student7) {
                        layout = 8;
                    }
                    else if (student6 || student5) {
                        layout = 6;
                    }
                    else if (student4 || student3) {
                        layout = 4;
                    }
                    else if (student2) {
                        layout = 2;
                    }
                    $.ajax({
                        cache: false,
                        type: "POST",
                        url: "/api/Classroom/" + this.props.classroomId + "/UpdateFeatured/",
                        data: JSON.stringify({ id: this.state.item.id, name: this.state.item.name, students: students }),
                        contentType: "application/json",
                        success: (r) => {
                            this.hide();
                            if (r.status === VC.Global.Data.RESPONSE_SUCCESS) {
                                // update list
                                this.props.onFeaturedUpdated(this.state.uid, layout, students);
                            }
                            else {
                                // error
                                alert("ERROR: " + r.message);
                            }
                        },
                        error: (xhr, status, error) => {
                            // error
                            alert("ERROR: " + error);
                            this.hide();
                        }
                    });
                }
                renderForm() {
                    return (React.createElement("form", {className: "form-horizontal", role: "form"}, React.createElement("div", {ref: REF_FORM_DIV + FORM_STUDENT1, className: "form-group"}, React.createElement("label", {className: "col-sm-2", htmlFor: REF_FORM_TB + FORM_STUDENT1}, "Student 1: "), React.createElement("div", {className: "col-sm-10"}, React.createElement(VC.Global.Components.Selector, {ref: REF_FORM_TB + FORM_STUDENT1, classroomId: this.props.classroomId, loadAction: "GetAvailableFeaturedStudents", defaultName: "Select Student computer", onSelectedItemChanged: () => this.onSelectedStudentChanged(), className: "form-control"}))), React.createElement("div", {ref: REF_FORM_DIV + FORM_STUDENT2, className: "form-group"}, React.createElement("label", {className: "col-sm-2", htmlFor: REF_FORM_TB + FORM_STUDENT2}, "Student 2: "), React.createElement("div", {className: "col-sm-10"}, React.createElement(VC.Global.Components.Selector, {ref: REF_FORM_TB + FORM_STUDENT2, classroomId: this.props.classroomId, loadAction: "GetAvailableFeaturedStudents", defaultName: "Select Student computer", onSelectedItemChanged: () => this.onSelectedStudentChanged(), className: "form-control"}))), React.createElement("div", {ref: REF_FORM_DIV + FORM_STUDENT3, className: "form-group"}, React.createElement("label", {className: "col-sm-2", htmlFor: REF_FORM_TB + FORM_STUDENT3}, "Student 3: "), React.createElement("div", {className: "col-sm-10"}, React.createElement(VC.Global.Components.Selector, {ref: REF_FORM_TB + FORM_STUDENT3, classroomId: this.props.classroomId, loadAction: "GetAvailableFeaturedStudents", defaultName: "Select Student computer", onSelectedItemChanged: () => this.onSelectedStudentChanged(), className: "form-control"}))), React.createElement("div", {ref: REF_FORM_DIV + FORM_STUDENT4, className: "form-group"}, React.createElement("label", {className: "col-sm-2", htmlFor: REF_FORM_TB + FORM_STUDENT4}, "Student 4: "), React.createElement("div", {className: "col-sm-10"}, React.createElement(VC.Global.Components.Selector, {ref: REF_FORM_TB + FORM_STUDENT4, classroomId: this.props.classroomId, loadAction: "GetAvailableFeaturedStudents", defaultName: "Select Student computer", onSelectedItemChanged: () => this.onSelectedStudentChanged(), className: "form-control"}))), React.createElement("div", {ref: REF_FORM_DIV + FORM_STUDENT5, className: "form-group"}, React.createElement("label", {className: "col-sm-2", htmlFor: REF_FORM_TB + FORM_STUDENT5}, "Student 5: "), React.createElement("div", {className: "col-sm-10"}, React.createElement(VC.Global.Components.Selector, {ref: REF_FORM_TB + FORM_STUDENT5, classroomId: this.props.classroomId, loadAction: "GetAvailableFeaturedStudents", defaultName: "Select Student computer", onSelectedItemChanged: () => this.onSelectedStudentChanged(), className: "form-control"}))), React.createElement("div", {ref: REF_FORM_DIV + FORM_STUDENT6, className: "form-group"}, React.createElement("label", {className: "col-sm-2", htmlFor: REF_FORM_TB + FORM_STUDENT6}, "Student  6: "), React.createElement("div", {className: "col-sm-10"}, React.createElement(VC.Global.Components.Selector, {ref: REF_FORM_TB + FORM_STUDENT6, classroomId: this.props.classroomId, loadAction: "GetAvailableFeaturedStudents", defaultName: "Select Student computer", onSelectedItemChanged: () => this.onSelectedStudentChanged(), className: "form-control"}))), React.createElement("div", {ref: REF_FORM_DIV + FORM_STUDENT7, className: "form-group"}, React.createElement("label", {className: "col-sm-2", htmlFor: REF_FORM_TB + FORM_STUDENT7}, "Student 7: "), React.createElement("div", {className: "col-sm-10"}, React.createElement(VC.Global.Components.Selector, {ref: REF_FORM_TB + FORM_STUDENT7, classroomId: this.props.classroomId, loadAction: "GetAvailableFeaturedStudents", defaultName: "Select Student computer", onSelectedItemChanged: () => this.onSelectedStudentChanged(), className: "form-control"}))), React.createElement("div", {ref: REF_FORM_DIV + FORM_STUDENT8, className: "form-group"}, React.createElement("label", {className: "col-sm-2", htmlFor: REF_FORM_TB + FORM_STUDENT8}, "Student 8: "), React.createElement("div", {className: "col-sm-10"}, React.createElement(VC.Global.Components.Selector, {ref: REF_FORM_TB + FORM_STUDENT8, classroomId: this.props.classroomId, loadAction: "GetAvailableFeaturedStudents", defaultName: "Select Student computer", onSelectedItemChanged: () => this.onSelectedStudentChanged(), className: "form-control"})))));
                }
                render() {
                    return (React.createElement("div", {ref: (ref) => this.divBox = ref, className: "modal fade", role: "dialog"}, React.createElement("div", {className: "modal-dialog"}, React.createElement("div", {className: "modal-content"}, React.createElement("div", {className: "modal-header"}, React.createElement("button", {type: "button", className: "close", "data-dismiss": "modal"}, "× "), React.createElement("h4", {className: "modal-title"}, this.state.name)), React.createElement("div", {className: "model-body", style: { display: (this.state.status === BoxStatus.Loading ? "block" : "none") }}, React.createElement("span", null, "Loading ...")), React.createElement("div", {className: "modal-body", style: { display: (this.state.status !== BoxStatus.Loading ? "block" : "none") }}, this.renderForm()), React.createElement("div", {ref: (ref) => this.divButtons = ref, className: "modal-footer", style: { display: (this.state.status === BoxStatus.View ? "block" : "none") }}, React.createElement("button", {type: "button", className: "btn btn-success", onClick: () => this.updateFeatured()}, React.createElement("span", {className: "glyphicon glyphicon-plus"}), " Update"), React.createElement("button", {type: "button", className: "btn btn-default", "data-dismiss": "modal"}, "Close")), React.createElement("div", {ref: (ref) => this.divProcessing = ref, className: "modal-footer", style: { display: (this.state.status === BoxStatus.Processing ? "block" : "none") }}, React.createElement("span", null, "Processing ..."))))));
                }
            }
            AC.FeaturedBox = FeaturedBox;
        })(AC = App.AC || (App.AC = {}));
    })(App = VC.App || (VC.App = {}));
})(VC || (VC = {}));
//# sourceMappingURL=FeaturedBox.js.map