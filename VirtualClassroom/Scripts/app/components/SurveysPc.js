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
            class AnswersList extends React.Component {
                constructor(props) {
                    super(props);
                    this.state = { formId: "", formTitle: "", status: ListStatus.Loading, errorMessage: "", items: null };
                    this.loadData();
                }
                loadData() {
                    $.ajax({
                        type: "GET",
                        url: this.props.actionUrl + "/LoadAnswers",
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
                updateAnswerStatus(answerId, status) {
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
                    return (React.createElement("div", {className: "text-muted"}, "No Received survey found."));
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
                        return (React.createElement("span", {className: "label label-success"}, "Survey Submitted"));
                    }
                    else {
                        // declined
                        return (React.createElement("span", {className: "label label-danger"}, "Survey Declined"));
                    }
                }
                renderItemButton(item) {
                    if (item.status === VC.Forms.FormAnswerStatus.Received) {
                        // received
                        return (React.createElement("button", {type: "button", className: "btn btn-sm btn-success", onClick: () => this.props.onViewClick(item)}, React.createElement("span", {className: "glyphicon glyphicon-play-circle"}), " Start survey"));
                    }
                    else if (item.status === VC.Forms.FormAnswerStatus.Answered) {
                        // answered
                        return (React.createElement("button", {type: "button", className: "btn btn-sm btn-default", onClick: () => this.props.onViewClick(item)}, React.createElement("span", {className: "glyphicon glyphicon-eye-open"}), " View"));
                    }
                    else {
                        // declined
                        return (React.createElement("button", {type: "button", className: "btn btn-sm btn-default", onClick: () => this.props.onViewClick(item)}, React.createElement("span", {className: "glyphicon glyphicon-eye-open"}), " View"));
                    }
                }
                renderItem(item) {
                    return (React.createElement("tr", {key: item.id}, React.createElement("td", null, item.title), React.createElement("td", {style: { textAlign: "center" }}, this.renderItemStatus(item)), React.createElement("td", {style: { textAlign: "right" }}, this.renderItemButton(item))));
                }
                renderTable() {
                    let items = [];
                    this.state.items.forEach((item) => items.push(this.renderItem(item)));
                    return (React.createElement("table", {className: "table", align: "center"}, React.createElement("thead", null, React.createElement("tr", null, React.createElement("th", null, "Title"), React.createElement("th", {style: { textAlign: "center" }}, "Status"), React.createElement("th", null))), React.createElement("tbody", null, items)));
                }
                render() {
                    return (React.createElement("div", null, React.createElement("div", {className: "panel panel-default"}, React.createElement("div", {className: "panel-heading"}, React.createElement("h4", null, "Received surveys")), this.renderBody())));
                }
            }
            class FormBox extends React.Component {
                constructor(props) {
                    super(props);
                    this.showBox = false;
                    this.state = { title: "", answerId: "" };
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
                    this.form.initAnswer(this.state.answerId);
                }
                boxDidHide() {
                    this.form.loading();
                }
                open(title, answerId, status) {
                    this.showBox = true;
                    if (status === VC.Forms.FormAnswerStatus.Received) {
                        this.form.changeView(VC.Forms.FormViews.View);
                    }
                    else if (status === VC.Forms.FormAnswerStatus.Answered) {
                        this.form.changeView(VC.Forms.FormViews.Answer);
                    }
                    else {
                        this.form.changeView(VC.Forms.FormViews.Preview);
                    }
                    this.setState({ title: title, answerId: answerId, status: status });
                }
                hide() {
                    $(this.divBox).modal("hide");
                }
                submitAnswer() {
                    this.divButtons.style.display = "none";
                    this.divProcessing.style.display = "block";
                    let data = this.form.getData(true);
                    VC.Forms.FormApi.UpdateAnswer({ uid: this.state.answerId, formData: data, status: VC.Forms.FormAnswerStatus.Answered }, () => {
                        // success
                        this.hide();
                        this.props.onAnswerSubmitted(this.state.answerId);
                    }, (error) => {
                        // error
                        alert(error);
                        this.hide();
                    });
                }
                declineAnswer() {
                    this.divButtons.style.display = "none";
                    this.divProcessing.style.display = "block";
                    VC.Forms.FormApi.UpdateAnswer({ uid: this.state.answerId, status: VC.Forms.FormAnswerStatus.Declined }, () => {
                        // success
                        this.hide();
                        this.props.onAnswerDeclined(this.state.answerId);
                    }, (error) => {
                        // error
                        alert(error);
                        this.hide();
                    });
                }
                renderBoxStatus(status) {
                    if (status === VC.Forms.FormAnswerStatus.Answered) {
                        // answered
                        return (React.createElement("span", {className: "label label-success"}, "Submitted"));
                    }
                    else if (status === VC.Forms.FormAnswerStatus.Declined) {
                        // declined
                        return (React.createElement("span", {className: "label label-danger"}, "Declined"));
                    }
                    else {
                        return (React.createElement("span", null));
                    }
                }
                renderBoxButtons(status) {
                    if (status === VC.Forms.FormAnswerStatus.Received) {
                        return (React.createElement("div", null, React.createElement("button", {type: "button", className: "btn btn-success", onClick: () => this.submitAnswer()}, React.createElement("span", {className: "glyphicon glyphicon-envelope"}), " Submit"), React.createElement("button", {type: "button", className: "btn btn-danger", onClick: () => this.declineAnswer()}, React.createElement("span", {className: "glyphicon glyphicon-remove"}), " Decline"), React.createElement("button", {type: "button", className: "btn btn-default", "data-dismiss": "modal"}, "Close")));
                    }
                    else {
                        return (React.createElement("div", null, React.createElement("button", {type: "button", className: "btn btn-default", "data-dismiss": "modal"}, "Close")));
                    }
                }
                render() {
                    return (React.createElement("div", {ref: (ref) => this.divBox = ref, className: "modal fade", role: "dialog"}, React.createElement("div", {className: "modal-dialog"}, React.createElement("div", {className: "modal-content"}, React.createElement("div", {className: "modal-header"}, React.createElement("button", {type: "button", className: "close", "data-dismiss": "modal"}, "× "), React.createElement("h4", {className: "modal-title"}, this.state.title, " ", this.renderBoxStatus(this.state.status))), React.createElement("div", {className: "modal-body"}, React.createElement(VC.Forms.Form, {ref: (ref) => this.form = ref, view: VC.Forms.FormViews.Preview})), React.createElement("div", {ref: (ref) => this.divButtons = ref, style: { display: "block" }, className: "modal-footer"}, this.renderBoxButtons(this.state.status)), React.createElement("div", {ref: (ref) => this.divProcessing = ref, style: { display: "none" }, className: "modal-footer"}, React.createElement("span", null, "Processing ..."))))));
                }
            }
            class SurveysPc extends React.Component {
                constructor(props) {
                    super(props);
                }
                onViewClick(item) {
                    this.formBox.open(item.title, item.id, item.status);
                }
                onAnswerSubmitted(answerId) {
                    this.answersList.updateAnswerStatus(answerId, VC.Forms.FormAnswerStatus.Answered);
                }
                onAnswerDeclined(answerId) {
                    this.answersList.updateAnswerStatus(answerId, VC.Forms.FormAnswerStatus.Declined);
                }
                render() {
                    return (React.createElement("div", null, React.createElement("div", {ref: (ref) => this.divAnswersList = ref}, React.createElement(AnswersList, {ref: (ref) => this.answersList = ref, onViewClick: (item) => this.onViewClick(item), actionUrl: this.props.actionUrl})), React.createElement(FormBox, {ref: (ref) => this.formBox = ref, onAnswerSubmitted: (answerId) => this.onAnswerSubmitted(answerId), onAnswerDeclined: (answerId) => this.onAnswerDeclined(answerId)})));
                }
            }
            Components.SurveysPc = SurveysPc;
            class InitSurveysPc {
                constructor(targetId, actionUrl, classroomId) {
                    ReactDOM.render(React.createElement("div", null, React.createElement(SurveysPc, {classroomId: classroomId, actionUrl: "/PC/Room1/Student1"})), document.getElementById(targetId));
                }
            }
            Components.InitSurveysPc = InitSurveysPc;
        })(Components = App.Components || (App.Components = {}));
    })(App = VC.App || (VC.App = {}));
})(VC || (VC = {}));
//# sourceMappingURL=SurveysPc.js.map