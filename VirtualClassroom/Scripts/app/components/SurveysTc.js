/* tslint:disable:max-line-length */
var VC;
(function (VC) {
    var App;
    (function (App) {
        var Components;
        (function (Components) {
            "use strict";
            var ListStatus;
            (function (ListStatus) {
                ListStatus[ListStatus["Loading"] = 0] = "Loading";
                ListStatus[ListStatus["Success"] = 1] = "Success";
                ListStatus[ListStatus["Error"] = 2] = "Error";
            })(ListStatus || (ListStatus = {}));
            class SurveysList extends React.Component {
                constructor(props) {
                    super(props);
                    this.state = { status: ListStatus.Loading, errorMessage: "", items: null };
                }
                loadData() {
                    $.ajax({
                        type: "GET",
                        url: "/api/Classroom/" + this.props.classroomId + "/LoadSurveys",
                        success: (r) => {
                            if (r.status === VC.Global.Data.RESPONSE_SUCCESS) {
                                // success
                                this.setState({ status: ListStatus.Success, errorMessage: "", items: r.data });
                            }
                            else {
                                // error
                                this.setState({ status: ListStatus.Error, errorMessage: r.message, items: null });
                            }
                        },
                        error: (xhr, status, error) => {
                            // error
                            this.setState({ status: ListStatus.Error, errorMessage: error, items: null });
                        }
                    });
                }
                componentDidMount() {
                    this.loadData();
                }
                renderLoader() {
                    return (React.createElement("div", {className: "text-muted"}, "Loading ..."));
                }
                renderError(message) {
                    return (React.createElement("div", {className: "text-danger"}, "ERROR: ", message));
                }
                renderNotFound() {
                    return (React.createElement("div", {className: "text-muted"}, "No Survey found."));
                }
                renderBody() {
                    let body;
                    if (this.state.status === ListStatus.Loading) {
                        // loading
                        body = this.renderLoader();
                    }
                    else if (this.state.status === ListStatus.Error) {
                        // error
                        body = this.renderError(this.state.errorMessage);
                    }
                    else if (this.state.items.length === 0) {
                        body = this.renderNotFound();
                    }
                    else {
                        body = this.renderTable();
                    }
                    return (React.createElement("div", {className: "panel-body"}, body));
                }
                renderItem(item) {
                    return (React.createElement("tr", {key: item.id}, React.createElement("td", null, item.title), React.createElement("td", null, item.answers), React.createElement("td", {style: { textAlign: "right" }}, React.createElement("button", {type: "button", className: "btn btn-sm btn-success", onClick: () => this.props.onSendSurveyClick(item.id, item.title)}, React.createElement("span", {className: "glyphicon glyphicon-envelope"}), " Send"), " ", React.createElement("button", {type: "button", className: "btn btn-sm btn-info", onClick: () => this.props.onViewAnswersClick(item.id, item.title)}, React.createElement("span", {className: "glyphicon glyphicon-eye-open"}), " Answers"))));
                }
                renderTable() {
                    let items = [];
                    this.state.items.forEach((item) => items.push(this.renderItem(item)));
                    return (React.createElement("table", {className: "table", align: "center"}, React.createElement("thead", null, React.createElement("tr", null, React.createElement("th", null, "Title"), React.createElement("th", null, "Answers"), React.createElement("th", null))), React.createElement("tbody", null, items)));
                }
                render() {
                    return (React.createElement("div", null, React.createElement("div", {className: "panel panel-default"}, React.createElement("div", {className: "panel-heading"}, React.createElement("h4", null, "Surveys")), this.renderBody())));
                }
            }
            class AnswersList extends React.Component {
                constructor(props) {
                    super(props);
                    this.state = { formId: "", formTitle: "", status: ListStatus.Loading, errorMessage: "", items: null };
                }
                loadAnswers(formId, formTitle) {
                    this.setState({ formId: formId, formTitle: formTitle, status: ListStatus.Loading, errorMessage: "", items: null }, () => this.loadData());
                }
                loadData() {
                    $.ajax({
                        type: "GET",
                        url: this.props.actionUrl + "/LoadAnswers",
                        data: { formUid: this.state.formId },
                        contentType: "application/json",
                        cache: false,
                        success: (r) => {
                            if (r.status === VC.Global.Data.RESPONSE_SUCCESS) {
                                // success
                                this.setState({ formId: this.state.formId, formTitle: this.state.formTitle, status: ListStatus.Success, errorMessage: "", items: r.data });
                            }
                            else {
                                // error
                                this.setState({ formId: this.state.formId, formTitle: this.state.formTitle, status: ListStatus.Error, errorMessage: r.message, items: null });
                            }
                        },
                        error: (xhr, status, error) => {
                            // error
                            this.setState({ formId: this.state.formId, formTitle: this.state.formTitle, status: ListStatus.Error, errorMessage: error, items: null });
                        }
                    });
                }
                deleteAnswer(answerId) {
                    let items = [];
                    this.state.items.forEach((item) => {
                        if (item.id !== answerId) {
                            items.push(item);
                        }
                    });
                    this.setState({ items: items });
                }
                renderLoader() {
                    return (React.createElement("div", {className: "text-muted"}, "Loading ..."));
                }
                renderError(message) {
                    return (React.createElement("div", {className: "text-danger"}, "ERROR: ", message));
                }
                renderNotFound() {
                    return (React.createElement("div", {className: "text-muted"}, "No Answer found."));
                }
                renderBody() {
                    let body;
                    if (this.state.status === ListStatus.Loading) {
                        // loading
                        body = this.renderLoader();
                    }
                    else if (this.state.status === ListStatus.Error) {
                        // error
                        body = this.renderError(this.state.errorMessage);
                    }
                    else if (this.state.items.length === 0) {
                        body = this.renderNotFound();
                    }
                    else {
                        body = this.renderTable();
                    }
                    return (React.createElement("div", {className: "panel-body"}, body));
                }
                renderItemStatus(item) {
                    if (item.status === VC.Forms.FormAnswerStatus.Received) {
                        // received
                        return (React.createElement("span", {className: "label label-warning"}, "Pending Survey"));
                    }
                    else if (item.status === VC.Forms.FormAnswerStatus.Answered) {
                        // answered
                        return (React.createElement("span", {className: "label label-success"}, "Answer Received"));
                    }
                    else {
                        // declined
                        return (React.createElement("span", {className: "label label-danger"}, "Survey Declined"));
                    }
                }
                renderItemButtons(item) {
                    if (item.status === VC.Forms.FormAnswerStatus.Received) {
                        // received
                        return (React.createElement("div", null, React.createElement("button", {type: "button", className: "btn btn-sm btn-default", onClick: () => this.props.onViewClick(item)}, React.createElement("span", {className: "glyphicon glyphicon-eye-open"}), " View")));
                    }
                    else if (item.status === VC.Forms.FormAnswerStatus.Answered) {
                        // answered
                        return (React.createElement("div", null, React.createElement("button", {type: "button", className: "btn btn-sm btn-success", onClick: () => this.props.onViewClick(item)}, React.createElement("span", {className: "glyphicon glyphicon-eye-open"}), " View")));
                    }
                    else {
                        // declined
                        return (React.createElement("div", null, React.createElement("button", {type: "button", className: "btn btn-sm btn-default", onClick: () => this.props.onViewClick(item)}, React.createElement("span", {className: "glyphicon glyphicon-eye-open"}), " View")));
                    }
                }
                renderItem(item) {
                    return (React.createElement("tr", {key: item.id}, React.createElement("td", null, item.name), React.createElement("td", {style: { textAlign: "center" }}, this.renderItemStatus(item)), React.createElement("td", {style: { textAlign: "right" }}, this.renderItemButtons(item))));
                }
                renderTable() {
                    let items = [];
                    this.state.items.forEach((item) => items.push(this.renderItem(item)));
                    return (React.createElement("table", {className: "table", align: "center"}, React.createElement("thead", null, React.createElement("tr", null, React.createElement("th", null, "Student"), React.createElement("th", {style: { textAlign: "center" }}, "Status"), React.createElement("th", null))), React.createElement("tbody", null, items)));
                }
                render() {
                    return (React.createElement("div", null, React.createElement("div", {className: "panel panel-default"}, React.createElement("div", {className: "panel-heading"}, React.createElement("div", {className: "panelButton"}, React.createElement("button", {type: "button", className: "btn btn-md btn-default", onClick: () => this.props.onBackClick()}, React.createElement("span", {className: "glyphicon glyphicon-chevron-left"}), " Back")), React.createElement("h4", null, "Survey: ", this.state.formTitle)), this.renderBody())));
                }
            }
            class FormBox extends React.Component {
                constructor(props) {
                    super(props);
                    this.showBox = false;
                    this.state = { title: "", formId: "", answerId: "", status: null };
                }
                componentDidMount() {
                    $(this.divBox).on("shown.bs.modal", () => this.boxDidShow());
                    $(this.divBox).on("hidden.bs.modal", () => this.boxDidHide());
                }
                componentDidUpdate(prevProps, prevState) {
                    if (this.showBox) {
                        this.showBox = false;
                        // show
                        $(this.divBox).modal("show");
                        this.boxWillShow();
                    }
                }
                boxWillShow() {
                    this.divButtons.style.display = "block";
                    this.divProcessing.style.display = "none";
                }
                boxDidShow() {
                    if (this.state.formId !== null) {
                        this.form.initForm(this.state.formId);
                        this.form.changeView(VC.Forms.FormViews.Preview);
                    }
                    else if (this.state.answerId !== null) {
                        this.form.initAnswer(this.state.answerId);
                        if (this.state.status === VC.Forms.FormAnswerStatus.Answered) {
                            this.form.changeView(VC.Forms.FormViews.Answer);
                        }
                        else {
                            this.form.changeView(VC.Forms.FormViews.Preview);
                        }
                    }
                }
                boxDidHide() {
                    this.form.loading();
                }
                openForm(title, formId) {
                    this.showBox = true;
                    this.setState({ title: title, formId: formId, answerId: null, status: null });
                }
                openAnswer(title, answerId, status) {
                    this.showBox = true;
                    this.setState({ title: title, formId: null, answerId: answerId, status: status });
                }
                hide() {
                    $(this.divBox).modal("hide");
                }
                sendForm() {
                    this.divButtons.style.display = "none";
                    this.divProcessing.style.display = "block";
                    this.props.onSendFormClick(this.state.formId);
                }
                deleteAnswer() {
                    this.divButtons.style.display = "none";
                    this.divProcessing.style.display = "block";
                    this.props.onDeleteAnswerClick(this.state.answerId);
                }
                renderBoxStatus(status) {
                    if (status === VC.Forms.FormAnswerStatus.Answered) {
                        // answered
                        return (React.createElement("span", {className: "label label-success"}, "Answered"));
                    }
                    else if (status === VC.Forms.FormAnswerStatus.Declined) {
                        // declined
                        return (React.createElement("span", {className: "label label-danger"}, "Declined"));
                    }
                    else if (status === VC.Forms.FormAnswerStatus.Received) {
                        // received
                        return (React.createElement("span", {className: "label label-warning"}, "Pending"));
                    }
                    else {
                        return (React.createElement("span", null));
                    }
                }
                renderButtons() {
                    if (this.state.formId !== null) {
                        return (React.createElement("div", null, React.createElement("button", {type: "button", className: "btn btn-success", onClick: () => this.sendForm()}, React.createElement("span", {className: "glyphicon glyphicon-envelope"}), " Send"), React.createElement("button", {type: "button", className: "btn btn-default", "data-dismiss": "modal"}, "Close")));
                    }
                    else if (this.state.answerId !== null) {
                        return (React.createElement("div", null, React.createElement("button", {type: "button", className: "btn btn-danger", onClick: () => this.deleteAnswer()}, React.createElement("span", {className: "glyphicon glyphicon-trash"}), " Delete"), React.createElement("button", {type: "button", className: "btn btn-default", "data-dismiss": "modal"}, "Close")));
                    }
                }
                render() {
                    return (React.createElement("div", {ref: (ref) => this.divBox = ref, className: "modal fade", role: "dialog"}, React.createElement("div", {className: "modal-dialog"}, React.createElement("div", {className: "modal-content"}, React.createElement("div", {className: "modal-header"}, React.createElement("button", {type: "button", className: "close", "data-dismiss": "modal"}, "× "), React.createElement("h4", {className: "modal-title"}, this.state.title, " ", this.renderBoxStatus(this.state.status))), React.createElement("div", {className: "modal-body"}, React.createElement(VC.Forms.Form, {ref: (ref) => this.form = ref, view: VC.Forms.FormViews.Preview})), React.createElement("div", {ref: (ref) => this.divButtons = ref, style: { display: "block" }, className: "modal-footer"}, this.renderButtons()), React.createElement("div", {ref: (ref) => this.divProcessing = ref, style: { display: "none" }, className: "modal-footer"}, React.createElement("span", null, "Processing ..."))))));
                }
            }
            class SurveysTc extends React.Component {
                constructor(props) {
                    super(props);
                }
                onSendSurveyClick(formId, formTitle) {
                    this.formBox.openForm(formTitle, formId);
                }
                onViewAnswersClick(item) {
                    this.formBox.openAnswer(item.title, item.id, item.status);
                }
                onViewAnswerListClick(formId, formTitle) {
                    this.divSurveysList.style.display = "none";
                    this.divAnswersList.style.display = "block";
                    this.answersList.loadAnswers(formId, formTitle);
                }
                onSendFormClick(formId) {
                    // send
                    $.ajax({
                        type: "POST",
                        url: this.props.actionUrl + "/SendForm",
                        data: JSON.stringify({ formUid: formId }),
                        contentType: "application/json",
                        success: (r) => {
                            this.formBox.hide();
                            if (r.status === VC.Global.Data.RESPONSE_SUCCESS) {
                                if (r.data) {
                                }
                                else {
                                    // not send
                                    alert("Something went wrong: The survey has not been sent.");
                                }
                            }
                            else {
                                // error
                                alert("ERROR: " + r.message);
                            }
                        },
                        error: (xhr, status, error) => {
                            // error
                            alert("ERROR: " + error);
                            this.formBox.hide();
                        }
                    });
                }
                onDeleteAnswerClick(answerId) {
                    // delete
                    $.ajax({
                        type: "POST",
                        url: this.props.actionUrl + "/DeleteAnswer",
                        data: JSON.stringify({ answerUid: answerId }),
                        contentType: "application/json",
                        success: (r) => {
                            this.formBox.hide();
                            if (r.status === VC.Global.Data.RESPONSE_SUCCESS) {
                                if (r.data) {
                                    // success - update list
                                    this.answersList.deleteAnswer(answerId);
                                }
                                else {
                                    // not deleted
                                    alert("Something went wrong: The survey answer has not been deleted.");
                                }
                            }
                            else {
                                // error
                                alert("ERROR: " + r.message);
                            }
                        },
                        error: (xhr, status, error) => {
                            // error
                            alert("ERROR: " + error);
                            this.formBox.hide();
                        }
                    });
                }
                onBackToSurveyListClick() {
                    this.divAnswersList.style.display = "none";
                    this.divSurveysList.style.display = "block";
                }
                render() {
                    return (React.createElement("div", null, React.createElement("div", {ref: (ref) => this.divSurveysList = ref, style: { display: "block" }}, React.createElement(SurveysList, {ref: (ref) => this.surveysList = ref, classroomId: this.props.classroomId, onViewAnswersClick: (formId, formTitle) => this.onViewAnswerListClick(formId, formTitle), onSendSurveyClick: (formId, formTitle) => this.onSendSurveyClick(formId, formTitle)})), React.createElement("div", {ref: (ref) => this.divAnswersList = ref, style: { display: "none" }}, React.createElement(AnswersList, {ref: (ref) => this.answersList = ref, actionUrl: this.props.actionUrl, onViewClick: (item) => this.onViewAnswersClick(item), onBackClick: () => this.onBackToSurveyListClick()})), React.createElement(FormBox, {ref: (ref) => this.formBox = ref, onSendFormClick: (formId) => this.onSendFormClick(formId), onDeleteAnswerClick: (answerId) => this.onDeleteAnswerClick(answerId)})));
                }
            }
            Components.SurveysTc = SurveysTc;
            class InitSurveysTc {
                constructor(targetId, actionUrl, classroomId) {
                    ReactDOM.render(React.createElement("div", null, React.createElement(SurveysTc, {classroomId: classroomId, actionUrl: "/TC/Room1/Teacher1"})), document.getElementById(targetId));
                }
            }
            Components.InitSurveysTc = InitSurveysTc;
        })(Components = App.Components || (App.Components = {}));
    })(App = VC.App || (VC.App = {}));
})(VC || (VC = {}));
//# sourceMappingURL=SurveysTc.js.map