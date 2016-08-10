/* tslint:disable:max-line-length */
var VC;
(function (VC) {
    var App;
    (function (App) {
        var TC;
        (function (TC) {
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
                loadSurveys() {
                    this.setState({ status: ListStatus.Loading, errorMessage: "", items: null }, () => this.loadData());
                }
                loadData() {
                    $.ajax({
                        cache: false,
                        type: "GET",
                        url: this.props.actionUrl + "/LoadSurveys",
                        // url: "/api/Classroom/" + this.props.classroomId + "/LoadSurveys",
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
                answerReceived(formId, status, count) {
                    // try to find the form and update status
                    if (count === undefined) {
                        count = 1;
                    }
                    this.state.items.forEach((item) => {
                        if (item.id === formId) {
                            if (status === VC.Forms.FormAnswerStatus.Answered) {
                                item.answeredCount += count;
                                item.pendingCount -= count;
                            }
                            else if (status === VC.Forms.FormAnswerStatus.Declined) {
                                item.declinedCount += count;
                                item.pendingCount -= count;
                            }
                            else if (status === VC.Forms.FormAnswerStatus.Pending) {
                                item.pendingCount += count;
                            }
                        }
                    });
                    this.setState({ items: this.state.items });
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
                    return (React.createElement("tr", {key: item.id}, React.createElement("td", null, item.title), React.createElement("td", {style: { textAlign: "center" }}, React.createElement("span", {className: "badge", style: item.pendingCount === 0 ? { backgroundColor: "Gray" } : { backgroundColor: "#f0ad4e" }}, item.pendingCount), " ", React.createElement("span", {className: "badge", style: item.answeredCount === 0 ? { backgroundColor: "Gray" } : { backgroundColor: "Green" }}, item.answeredCount), " ", React.createElement("span", {className: "badge", style: item.declinedCount === 0 ? { backgroundColor: "Gray" } : { backgroundColor: "Red" }}, item.declinedCount)), React.createElement("td", {style: { textAlign: "right" }}, React.createElement("button", {type: "button", className: "btn btn-sm btn-success", onClick: () => this.props.onSendSurveyClick(item)}, React.createElement("span", {className: "glyphicon glyphicon-envelope"}), " Send"), " ", React.createElement("button", {type: "button", className: "btn btn-sm btn-info", onClick: () => this.props.onViewAnswersClick(item)}, React.createElement("span", {className: "glyphicon glyphicon-eye-open"}), " Answers"))));
                }
                renderTable() {
                    let items = [];
                    this.state.items.forEach((item) => items.push(this.renderItem(item)));
                    return (React.createElement("table", {className: "table", align: "center"}, React.createElement("thead", null, React.createElement("tr", null, React.createElement("th", null, "Title"), React.createElement("th", {style: { textAlign: "center" }}, "Pending / Received / Declined"), React.createElement("th", null))), React.createElement("tbody", null, items)));
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
                        cache: false,
                        type: "GET",
                        url: this.props.actionUrl + "/LoadAnswers",
                        data: { formUid: this.state.formId },
                        contentType: "application/json",
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
                answerReceived(answerId, status) {
                    // try to find the answer and update status
                    this.state.items.forEach((item) => {
                        if (item.id === answerId) {
                            item.status = status;
                        }
                    });
                    this.setState({ items: this.state.items });
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
                    if (item.status === VC.Forms.FormAnswerStatus.Pending) {
                        // pending
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
                    if (item.status === VC.Forms.FormAnswerStatus.Pending) {
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
                    return (React.createElement("div", null, React.createElement("div", {className: "panel panel-default"}, React.createElement("div", {className: "panel-heading"}, React.createElement("div", {className: "panelButton"}, React.createElement("button", {type: "button", className: "btn btn-md btn-info", onClick: () => this.props.onBackClick()}, React.createElement("span", {className: "glyphicon glyphicon-chevron-left"}), " Back")), React.createElement("h4", null, "Survey: ", this.state.formTitle)), this.renderBody())));
                }
            }
            class FormBoxSendButton extends React.Component {
                constructor(props) {
                    super(props);
                    this.state = { countOfPCs: props.countOfPCs };
                }
                countOfPCsChanged(count) {
                    if (this.state.countOfPCs !== count) {
                        this.setState({ countOfPCs: count });
                    }
                }
                render() {
                    if (this.state.countOfPCs === 0) {
                        return (React.createElement("span", {className: "text-warning"}, "No Student PC connected. "));
                    }
                    else {
                        return (React.createElement("button", {type: "button", className: "btn btn-success", onClick: () => this.props.onSendClick()}, React.createElement("span", {className: "glyphicon glyphicon-envelope"}), " Send ", React.createElement("span", {className: "badge"}, this.state.countOfPCs)));
                    }
                }
            }
            class FormBox extends React.Component {
                constructor(props) {
                    super(props);
                    this.showBox = false;
                    this.state = { title: "", formId: "", answerId: "", countOfPCs: 0, status: null };
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
                        this.form.loading();
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
                openForm(title, formId, countOfPCs) {
                    this.showBox = true;
                    this.setState({ title: title, formId: formId, answerId: null, countOfPCs: countOfPCs, status: null });
                }
                openAnswer(title, answerId, status) {
                    this.showBox = true;
                    this.setState({ title: title, formId: null, answerId: answerId, countOfPCs: 0, status: status });
                }
                answerReceived(answerId, status) {
                    if (this.state.answerId === answerId && this.state.status !== status) {
                        this.setState({ status: status }, () => {
                            this.boxDidShow();
                        });
                    }
                }
                hide() {
                    $(this.divBox).modal("hide");
                }
                countOfPCsChanged(count) {
                    if (this.state.formId !== null && this.btnSend !== undefined) {
                        this.btnSend.countOfPCsChanged(count);
                    }
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
                    else if (status === VC.Forms.FormAnswerStatus.Pending) {
                        // pending
                        return (React.createElement("span", {className: "label label-warning"}, "Pending"));
                    }
                    else {
                        return (React.createElement("span", null));
                    }
                }
                renderButtons() {
                    if (this.state.formId !== null) {
                        return (React.createElement("div", null, React.createElement(FormBoxSendButton, {ref: (ref) => this.btnSend = ref, countOfPCs: this.state.countOfPCs, onSendClick: () => this.sendForm()}), React.createElement("button", {type: "button", className: "btn btn-default", "data-dismiss": "modal"}, "Close")));
                    }
                    else if (this.state.answerId !== null) {
                        return (React.createElement("div", null, React.createElement("button", {type: "button", className: "btn btn-danger", onClick: () => this.deleteAnswer()}, React.createElement("span", {className: "glyphicon glyphicon-trash"}), " Delete"), React.createElement("button", {type: "button", className: "btn btn-default", "data-dismiss": "modal"}, "Close")));
                    }
                }
                render() {
                    return (React.createElement("div", {ref: (ref) => this.divBox = ref, className: "modal fade", role: "dialog"}, React.createElement("div", {className: "modal-dialog"}, React.createElement("div", {className: "modal-content"}, React.createElement("div", {className: "modal-header"}, React.createElement("button", {type: "button", className: "close", "data-dismiss": "modal"}, "× "), React.createElement("h4", {className: "modal-title"}, this.state.title, " ", this.renderBoxStatus(this.state.status))), React.createElement("div", {className: "modal-body"}, React.createElement(VC.Forms.Form, {ref: (ref) => this.form = ref, view: VC.Forms.FormViews.Preview, type: VC.Forms.FormType.Survey})), React.createElement("div", {ref: (ref) => this.divButtons = ref, style: { display: "block" }, className: "modal-footer"}, this.renderButtons()), React.createElement("div", {ref: (ref) => this.divProcessing = ref, style: { display: "none" }, className: "modal-footer"}, React.createElement("span", null, "Processing ..."))))));
                }
            }
            class SurveysTc extends React.Component {
                constructor(props) {
                    super(props);
                    this.state = { connectedPCs: [] };
                }
                init() {
                    this.divAnswersList.style.display = "none";
                    this.divSurveysList.style.display = "block";
                    this.surveysList.loadSurveys();
                }
                connectedPCsChanged(connectedPCs) {
                    this.state.connectedPCs = connectedPCs;
                    this.formBox.countOfPCsChanged(connectedPCs.length);
                }
                onSendSurveyClick(item) {
                    this.formBox.openForm(item.title, item.id, this.state.connectedPCs.length);
                }
                onViewAnswerClick(item) {
                    this.formBox.openAnswer(item.title, item.id, item.status);
                }
                onViewAnswerListClick(item) {
                    this.divSurveysList.style.display = "none";
                    this.divAnswersList.style.display = "block";
                    this.answersList.loadAnswers(item.id, item.title);
                }
                onSendFormClick(formId) {
                    // send
                    $.ajax({
                        cache: false,
                        type: "POST",
                        url: this.props.actionUrl + "/SendForm",
                        data: JSON.stringify({ formUid: formId, connectedPCs: this.state.connectedPCs }),
                        contentType: "application/json",
                        success: (r) => {
                            this.formBox.hide();
                            if (r.status === VC.Global.Data.RESPONSE_SUCCESS) {
                                if (r.data) {
                                    // success
                                    this.props.onSurveySent();
                                    this.surveysList.answerReceived(formId, VC.Forms.FormAnswerStatus.Pending, r.data);
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
                        cache: false,
                        type: "POST",
                        url: this.props.actionUrl + "/DeleteAnswer",
                        data: JSON.stringify({ answerUid: answerId }),
                        contentType: "application/json",
                        success: (r) => {
                            this.formBox.hide();
                            if (r.status === VC.Global.Data.RESPONSE_SUCCESS) {
                                if (r.data !== null) {
                                    // success - update list
                                    this.props.onAnswerDeleted(r.data);
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
                answerReceived(formId, answerId, status) {
                    this.surveysList.answerReceived(formId, status);
                    this.answersList.answerReceived(answerId, status);
                    this.formBox.answerReceived(answerId, status);
                }
                onBackToSurveyListClick() {
                    this.divAnswersList.style.display = "none";
                    this.divSurveysList.style.display = "block";
                    this.surveysList.loadSurveys();
                }
                render() {
                    return (React.createElement("div", null, React.createElement("div", {ref: (ref) => this.divSurveysList = ref, style: { display: "block" }}, React.createElement(SurveysList, {ref: (ref) => this.surveysList = ref, actionUrl: this.props.actionUrl, onViewAnswersClick: (item) => this.onViewAnswerListClick(item), onSendSurveyClick: (item) => this.onSendSurveyClick(item)})), React.createElement("div", {ref: (ref) => this.divAnswersList = ref, style: { display: "none" }}, React.createElement(AnswersList, {ref: (ref) => this.answersList = ref, actionUrl: this.props.actionUrl, onViewClick: (item) => this.onViewAnswerClick(item), onBackClick: () => this.onBackToSurveyListClick()})), React.createElement(FormBox, {ref: (ref) => this.formBox = ref, onSendFormClick: (formId) => this.onSendFormClick(formId), onDeleteAnswerClick: (answerId) => this.onDeleteAnswerClick(answerId)})));
                }
            }
            TC.SurveysTc = SurveysTc;
        })(TC = App.TC || (App.TC = {}));
    })(App = VC.App || (VC.App = {}));
})(VC || (VC = {}));
//# sourceMappingURL=SurveysTc.js.map