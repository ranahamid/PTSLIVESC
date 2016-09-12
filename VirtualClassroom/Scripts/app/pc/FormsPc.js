/* tslint:disable:max-line-length */
var VC;
(function (VC) {
    var App;
    (function (App) {
        var PC;
        (function (PC) {
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
                        cache: false,
                        type: "GET",
                        url: this.props.actionUrl + "/LoadAnswers",
                        success: (r) => {
                            if (r.status === VC.Global.Data.RESPONSE_SUCCESS) {
                                // success
                                this.setState({ status: ListStatus.Success, errorMessage: "", items: r.data }, 
                                // callback
                                    () => {
                                    this.props.onPendingAnswersChanged(this.getPendingAnswersCount());
                                });
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
                getPendingAnswersCount() {
                    let count = 0;
                    this.state.items.forEach((item) => {
                        if (item.status === VC.Forms.FormAnswerStatus.Pending) {
                            count++;
                        }
                    });
                    return count;
                }
                updateList() {
                    this.loadData();
                }
                updateAnswerStatus(answerId, status) {
                    this.state.items.forEach((item) => {
                        if (item.id === answerId) {
                            item.status = status;
                        }
                    });
                    this.setState({ items: this.state.items }, 
                    // callback
                        () => {
                        this.props.onPendingAnswersChanged(this.getPendingAnswersCount());
                    });
                }
                removeFormAnswer(formId) {
                    let removed = false;
                    let items = this.state.items;
                    let _items = [];
                    for (let i = 0; i < items.length; i++) {
                        if (items[i].form.id === formId) {
                            removed = true;
                        }
                        else {
                            _items.push(items[i]);
                        }
                    }
                    if (removed) {
                        this.setState({ items: _items }, 
                        // callback
                            () => {
                            this.props.onPendingAnswersChanged(this.getPendingAnswersCount());
                        });
                    }
                }
                renderLoader() {
                    return (React.createElement("div", {className: "text-muted"}, "Loading ..."));
                }
                renderError(message) {
                    return (React.createElement("div", {className: "text-danger"}, "ERROR: ", message));
                }
                renderNotFound() {
                    return (React.createElement("div", {className: "text-muted"}, "No survey or poll found."));
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
                        return (React.createElement("span", {className: "label label-warning"}, "Pending ", FormsPc.getTitleByType(item.form.type)));
                    }
                    else if (item.status === VC.Forms.FormAnswerStatus.Answered) {
                        // answered
                        return (React.createElement("span", {className: "label label-success"}, FormsPc.getTitleByType(item.form.type), " Submitted"));
                    }
                    else {
                        // declined
                        return (React.createElement("span", {className: "label label-danger"}, FormsPc.getTitleByType(item.form.type), " Declined"));
                    }
                }
                renderItemButton(item) {
                    if (item.status === VC.Forms.FormAnswerStatus.Pending) {
                        // pending
                        return (React.createElement("button", {type: "button", className: "btn btn-sm btn-success", onClick: () => this.props.onViewClick(item)}, React.createElement("span", {className: "glyphicon glyphicon-play-circle"}), " Start ", FormsPc.getTitleByType(item.form.type)));
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
                    return (React.createElement("div", null, React.createElement("div", {className: "panel panel-default"}, React.createElement("div", {className: "panel-heading"}, React.createElement("h4", null, "Received Surveys & Polls")), this.renderBody())));
                }
            }
            class FormBox extends React.Component {
                constructor(props) {
                    super(props);
                    this.showBox = false;
                    this.state = { formId: "", answerId: "", title: "", type: null, status: null };
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
                open(item) {
                    this.showBox = true;
                    // form view
                    if (item.status === VC.Forms.FormAnswerStatus.Pending) {
                        this.form.changeView(VC.Forms.FormViews.View);
                    }
                    else if (item.status === VC.Forms.FormAnswerStatus.Answered) {
                        this.form.changeView(VC.Forms.FormViews.Answer);
                    }
                    else {
                        this.form.changeView(VC.Forms.FormViews.Preview);
                    }
                    this.setState({ formId: item.form.id, answerId: item.id, title: item.title, type: item.form.type, status: item.status });
                }
                hide() {
                    $(this.divBox).modal("hide");
                }
                submitAnswer() {
                    if (this.form.validate()) {
                        this.divButtons.style.display = "none";
                        this.divProcessing.style.display = "block";
                        let answerData = this.form.getData(VC.Forms.DataType.Answer);
                        VC.Forms.FormApi.UpdateAnswer({ uid: this.state.answerId, formData: answerData, status: VC.Forms.FormAnswerStatus.Answered }, () => {
                            // success
                            let resultData = this.form.getData(VC.Forms.DataType.Result);
                            this.hide();
                            this.props.onAnswerSubmitted(this.state.answerId, this.state.formId, this.state.type, resultData);
                        }, (error) => {
                            // error
                            alert(error);
                            this.hide();
                        });
                    }
                }
                declineAnswer() {
                    this.divButtons.style.display = "none";
                    this.divProcessing.style.display = "block";
                    VC.Forms.FormApi.UpdateAnswer({ uid: this.state.answerId, status: VC.Forms.FormAnswerStatus.Declined }, () => {
                        // success
                        this.hide();
                        this.props.onAnswerDeclined(this.state.answerId, this.state.formId, this.state.type);
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
                    if (status === VC.Forms.FormAnswerStatus.Pending) {
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
            class FormsPc extends React.Component {
                constructor(props) {
                    super(props);
                }
                static getTitleByType(type) {
                    let title = "";
                    switch (type) {
                        case VC.Forms.FormType.Survey:
                            title = "Survey";
                            break;
                        case VC.Forms.FormType.Poll:
                            title = "Poll";
                            break;
                    }
                    return title;
                }
                onViewClick(item) {
                    this.formBox.open(item);
                }
                onAnswerSubmitted(answerId, formId, type, resultData) {
                    this.answersList.updateAnswerStatus(answerId, VC.Forms.FormAnswerStatus.Answered);
                    this.props.onAnswerStatusChanged(formId, answerId, type, VC.Forms.FormAnswerStatus.Answered, resultData);
                }
                onAnswerDeclined(answerId, formId, type) {
                    this.answersList.updateAnswerStatus(answerId, VC.Forms.FormAnswerStatus.Declined);
                    this.props.onAnswerStatusChanged(formId, answerId, type, VC.Forms.FormAnswerStatus.Declined, null);
                }
                formReceived() {
                    this.answersList.updateList();
                }
                formAnswerRemoved(formId) {
                    this.answersList.removeFormAnswer(formId);
                }
                render() {
                    return (React.createElement("div", null, React.createElement("div", {ref: (ref) => this.divAnswersList = ref}, React.createElement(AnswersList, {ref: (ref) => this.answersList = ref, onViewClick: (item) => this.onViewClick(item), onPendingAnswersChanged: (count) => this.props.onPendingAnswersChanged(count), actionUrl: this.props.actionUrl})), React.createElement(FormBox, {ref: (ref) => this.formBox = ref, onAnswerSubmitted: (answerId, formUid, type, resultData) => this.onAnswerSubmitted(answerId, formUid, type, resultData), onAnswerDeclined: (answerId, formUid, type) => this.onAnswerDeclined(answerId, formUid, type)})));
                }
            }
            PC.FormsPc = FormsPc;
        })(PC = App.PC || (App.PC = {}));
    })(App = VC.App || (VC.App = {}));
})(VC || (VC = {}));
//# sourceMappingURL=FormsPc.js.map