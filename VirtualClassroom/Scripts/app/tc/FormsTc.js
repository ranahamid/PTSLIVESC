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
            class FormsList extends React.Component {
                constructor(props) {
                    super(props);
                    this.state = { status: ListStatus.Loading, errorMessage: "", items: null };
                }
                loadForms() {
                    this.setState({ status: ListStatus.Loading, errorMessage: "", items: null }, () => this.loadData());
                }
                loadData() {
                    $.ajax({
                        cache: false,
                        type: "GET",
                        url: this.props.actionUrl + "/LoadForms",
                        data: { type: this.props.type },
                        contentType: "application/json",
                        success: (r) => {
                            if (r.status === VC.Global.Data.RESPONSE_SUCCESS) {
                                this.setState({ status: ListStatus.Success, errorMessage: "", items: r.data });
                            }
                            else {
                                this.setState({ status: ListStatus.Error, errorMessage: r.message, items: null });
                            }
                        },
                        error: (xhr, status, error) => {
                            this.setState({ status: ListStatus.Error, errorMessage: error, items: null });
                        }
                    });
                }
                answerReceived(formId, status, count) {
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
                viewButtonTitleByType(type) {
                    let title = "";
                    switch (type) {
                        case VC.Forms.FormType.Survey:
                            title = "Answers";
                            break;
                        case VC.Forms.FormType.Poll:
                            title = "Results";
                            break;
                    }
                    return title;
                }
                renderLoader() {
                    return (React.createElement("div", {className: "text-muted"}, "Loading ..."));
                }
                renderError(message) {
                    return (React.createElement("div", {className: "text-danger"}, "ERROR: ", message));
                }
                renderNotFound() {
                    return (React.createElement("div", {className: "text-muted"}, "No ", FormsTc.getTitleByType(this.props.type), " found."));
                }
                renderBody() {
                    let body;
                    if (this.state.status === ListStatus.Loading) {
                        body = this.renderLoader();
                    }
                    else if (this.state.status === ListStatus.Error) {
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
                    return (React.createElement("tr", {key: item.id}, React.createElement("td", null, item.title), React.createElement("td", {style: { textAlign: "center" }}, React.createElement("span", {className: "badge", style: item.pendingCount === 0 ? { backgroundColor: "Gray" } : { backgroundColor: "#f0ad4e" }}, item.pendingCount), " ", React.createElement("span", {className: "badge", style: item.answeredCount === 0 ? { backgroundColor: "Gray" } : { backgroundColor: "Green" }}, item.answeredCount), " ", React.createElement("span", {className: "badge", style: item.declinedCount === 0 ? { backgroundColor: "Gray" } : { backgroundColor: "Red" }}, item.declinedCount)), React.createElement("td", {style: { textAlign: "right" }}, React.createElement("button", {type: "button", className: "btn btn-sm btn-success", onClick: () => this.props.onSendFormClick(item)}, React.createElement("span", {className: "glyphicon glyphicon-envelope"}), " Send"), " ", React.createElement("button", {type: "button", className: "btn btn-sm btn-info", onClick: () => this.props.onViewAnswerClick(item)}, React.createElement("span", {className: "glyphicon glyphicon-eye-open"}), " ", this.viewButtonTitleByType(this.props.type)))));
                }
                renderTable() {
                    let items = [];
                    this.state.items.forEach((item) => items.push(this.renderItem(item)));
                    return (React.createElement("table", {className: "table", align: "center"}, React.createElement("thead", null, React.createElement("tr", null, React.createElement("th", null, "Title"), React.createElement("th", {style: { textAlign: "center" }}, "Pending / Received / Declined"), React.createElement("th", null))), React.createElement("tbody", null, items)));
                }
                render() {
                    return (React.createElement("div", null, React.createElement("div", {className: "panel panel-default"}, React.createElement("div", {className: "panel-heading"}, React.createElement("h4", null, FormsTc.getTitleByType(this.props.type), "s")), this.renderBody())));
                }
            }
            class AnswersStatus extends React.Component {
                constructor(props) {
                    super(props);
                    this.state = { answeredCount: 0, pendingCount: 0, declinedCount: 0 };
                }
                init(answered, pending, declined) {
                    this.setState({ answeredCount: answered, pendingCount: pending, declinedCount: declined });
                }
                answerReceived(status) {
                    let _state = this.state;
                    if (status === VC.Forms.FormAnswerStatus.Answered) {
                        _state.answeredCount += 1;
                        _state.pendingCount -= 1;
                    }
                    else if (status === VC.Forms.FormAnswerStatus.Declined) {
                        _state.declinedCount += 1;
                        _state.pendingCount -= 1;
                    }
                    else if (status === VC.Forms.FormAnswerStatus.Pending) {
                        _state.pendingCount += 1;
                    }
                    this.setState(_state);
                }
                answerDeleted(status) {
                    let _state = this.state;
                    if (status === VC.Forms.FormAnswerStatus.Answered) {
                        _state.answeredCount -= 1;
                    }
                    else if (status === VC.Forms.FormAnswerStatus.Declined) {
                        _state.declinedCount -= 1;
                    }
                    else if (status === VC.Forms.FormAnswerStatus.Pending) {
                        _state.pendingCount -= 1;
                    }
                    this.setState(_state);
                }
                getTotalCountOfAnswers() {
                    return this.state.answeredCount + this.state.pendingCount + this.state.declinedCount;
                }
                onDeleteAllClick() {
                    this.deleteBox.show(this.getTotalCountOfAnswers());
                }
                allAnswersDeleted() {
                    this.deleteBox.hide();
                    this.setState({ answeredCount: 0, pendingCount: 0, declinedCount: 0 });
                }
                render() {
                    let title = this.props.title;
                    switch (this.props.type) {
                        case VC.Forms.FormType.Survey:
                            title = "Survey: " + title;
                            break;
                        case VC.Forms.FormType.Poll:
                            title = "Poll: " + title;
                            break;
                    }
                    return (React.createElement("div", null, React.createElement("div", {className: "row"}, React.createElement("div", {className: "col-sm-3"}, React.createElement("strong", null, "Pending: "), " ", React.createElement("span", {className: "badge", style: this.state.pendingCount === 0 ? { backgroundColor: "Gray" } : { backgroundColor: "#f0ad4e" }}, this.state.pendingCount)), React.createElement("div", {className: "col-sm-3"}, React.createElement("strong", null, "Answered: "), " ", React.createElement("span", {className: "badge", style: this.state.answeredCount === 0 ? { backgroundColor: "Gray" } : { backgroundColor: "Green" }}, this.state.answeredCount)), React.createElement("div", {className: "col-sm-3"}, React.createElement("strong", null, "Declined: "), " ", React.createElement("span", {className: "badge", style: this.state.declinedCount === 0 ? { backgroundColor: "Gray" } : { backgroundColor: "Red" }}, this.state.declinedCount)), React.createElement("div", {className: "col-sm-3", style: { textAlign: "right" }}, React.createElement("div", {style: { display: (this.getTotalCountOfAnswers() > 0 ? "block" : "none") }}, React.createElement("button", {type: "button", className: "btn btn-danger", onClick: () => this.onDeleteAllClick()}, "Delete All")))), React.createElement("hr", null), React.createElement(DeleteBox, {ref: (ref) => this.deleteBox = ref, title: title, onDeleteAll: () => this.props.onDeleteAll()})));
                }
            }
            class DeleteBox extends React.Component {
                constructor(props) {
                    super(props);
                    this.state = { count: 0 };
                }
                show(count) {
                    this.setState({ count: count }, () => $(this.divBox).modal("show"));
                }
                hide() {
                    this.divButtons.style.display = "block";
                    this.divProcessing.style.display = "none";
                    $(this.divBox).modal("hide");
                }
                onDeleteClick() {
                    this.divButtons.style.display = "none";
                    this.divProcessing.style.display = "block";
                    this.props.onDeleteAll();
                }
                render() {
                    return (React.createElement("div", {ref: (ref) => this.divBox = ref, className: "modal fade", role: "dialog"}, React.createElement("div", {className: "modal-dialog"}, React.createElement("div", {className: "modal-content"}, React.createElement("div", {className: "modal-header"}, React.createElement("button", {type: "button", className: "close", "data-dismiss": "modal"}, "× "), React.createElement("h4", {className: "modal-title"}, React.createElement("span", {className: "text-danger"}, React.createElement("span", {className: "glyphicon glyphicon-warning-sign"}), " DELETE"))), React.createElement("div", {className: "modal-body", style: { textAlign: "center" }}, React.createElement("div", {className: "text-danger"}, "All the answers to the \"", React.createElement("strong", null, this.props.title), "\" will be permanently deleted."), React.createElement("h3", {className: "text-danger"}, "Are you sure?")), React.createElement("div", {ref: (ref) => this.divButtons = ref, style: { display: "block" }, className: "modal-footer"}, React.createElement("button", {type: "button", className: "btn btn-danger", onClick: () => this.onDeleteClick()}, React.createElement("span", {className: "glyphicon glyphicon-trash"}), " YES, Delete ", React.createElement("span", {className: "badge"}, this.state.count)), React.createElement("button", {type: "button", className: "btn btn-success", "data-dismiss": "modal"}, "NO, Cancel")), React.createElement("div", {ref: (ref) => this.divProcessing = ref, style: { display: "none" }, className: "modal-footer"}, React.createElement("span", null, "Processing ..."))))));
                }
            }
            class AnswersList extends React.Component {
                constructor(props) {
                    super(props);
                    this.state = { formId: "", formTitle: "", status: ListStatus.Loading, errorMessage: "", items: null };
                }
                init(item) {
                    this.answersStatus.init(item.answeredCount, item.pendingCount, item.declinedCount);
                    this.setState({ formId: item.id, formTitle: item.title, status: ListStatus.Loading, errorMessage: "", items: null }, () => this.loadData());
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
                                this.setState({ formId: this.state.formId, formTitle: this.state.formTitle, status: ListStatus.Success, errorMessage: "", items: r.data });
                            }
                            else {
                                this.setState({ formId: this.state.formId, formTitle: this.state.formTitle, status: ListStatus.Error, errorMessage: r.message, items: null });
                            }
                        },
                        error: (xhr, status, error) => {
                            this.setState({ formId: this.state.formId, formTitle: this.state.formTitle, status: ListStatus.Error, errorMessage: error, items: null });
                        }
                    });
                }
                answerReceived(answerId, status) {
                    this.state.items.forEach((item) => {
                        if (item.id === answerId) {
                            item.status = status;
                        }
                    });
                    this.setState({ items: this.state.items });
                    this.answersStatus.answerReceived(status);
                }
                deleteAnswer(answerId) {
                    let items = [];
                    this.state.items.forEach((item) => {
                        if (item.id !== answerId) {
                            items.push(item);
                        }
                        else {
                            this.answersStatus.answerDeleted(item.status);
                        }
                    });
                    this.setState({ items: items });
                }
                deleteAllAnswers() {
                    this.answersStatus.allAnswersDeleted();
                    let items = [];
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
                        body = this.renderLoader();
                    }
                    else if (this.state.status === ListStatus.Error) {
                        body = this.renderError(this.state.errorMessage);
                    }
                    else if (this.state.items.length === 0) {
                        body = this.renderNotFound();
                    }
                    else {
                        body = this.renderTable();
                    }
                    return (React.createElement("div", null, body));
                }
                renderItemStatus(item) {
                    if (item.status === VC.Forms.FormAnswerStatus.Pending) {
                        return (React.createElement("span", {className: "label label-warning"}, "Pending ", FormsTc.getTitleByType(this.props.type)));
                    }
                    else if (item.status === VC.Forms.FormAnswerStatus.Answered) {
                        return (React.createElement("span", {className: "label label-success"}, "Answer Received"));
                    }
                    else {
                        return (React.createElement("span", {className: "label label-danger"}, FormsTc.getTitleByType(this.props.type), " Declined"));
                    }
                }
                renderItemButtons(item) {
                    if (item.status === VC.Forms.FormAnswerStatus.Pending) {
                        return (React.createElement("div", null, React.createElement("button", {type: "button", className: "btn btn-sm btn-default", onClick: () => this.props.onViewClick(item)}, React.createElement("span", {className: "glyphicon glyphicon-eye-open"}), " View")));
                    }
                    else if (item.status === VC.Forms.FormAnswerStatus.Answered) {
                        return (React.createElement("div", null, React.createElement("button", {type: "button", className: "btn btn-sm btn-success", onClick: () => this.props.onViewClick(item)}, React.createElement("span", {className: "glyphicon glyphicon-eye-open"}), " View")));
                    }
                    else {
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
                    return (React.createElement("div", null, React.createElement("div", {className: "panel panel-default"}, React.createElement("div", {className: "panel-heading"}, React.createElement("div", {className: "panelButton"}, React.createElement("button", {type: "button", className: "btn btn-md btn-info", onClick: () => this.props.onBackClick()}, React.createElement("span", {className: "glyphicon glyphicon-chevron-left"}), " Back")), React.createElement("h4", null, FormsTc.getTitleByType(this.props.type), ": ", this.state.formTitle)), React.createElement("div", {className: "panel-body"}, React.createElement(AnswersStatus, {ref: (ref) => this.answersStatus = ref, title: this.state.formTitle, type: this.props.type, onDeleteAll: () => this.props.onDeleteAllClick(this.state.formId)}), this.renderBody()))));
                }
            }
            class AnswersResult extends React.Component {
                constructor(props) {
                    super(props);
                    this.state = { formId: null, formTitle: "", answeredCount: 0, pendingCount: 0, declinedCount: 0 };
                }
                init(item) {
                    this.setState({ formId: item.id, formTitle: item.title });
                    this.form.initResult(item.id);
                    this.answersStatus.init(item.answeredCount, item.pendingCount, item.declinedCount);
                }
                answerReceived(formId, status, resultData) {
                    if (status === VC.Forms.FormAnswerStatus.Answered && resultData !== null) {
                        this.form.updateResult(resultData);
                    }
                    this.answersStatus.answerReceived(status);
                }
                deleteAllAnswers() {
                    this.answersStatus.allAnswersDeleted();
                    this.form.initResult(this.state.formId);
                }
                render() {
                    return (React.createElement("div", null, React.createElement("div", {className: "panel panel-default"}, React.createElement("div", {className: "panel-heading"}, React.createElement("div", {className: "panelButton"}, React.createElement("button", {type: "button", className: "btn btn-md btn-info", onClick: () => this.props.onBackClick()}, React.createElement("span", {className: "glyphicon glyphicon-chevron-left"}), " Back")), React.createElement("h4", null, "Poll: ", this.state.formTitle)), React.createElement("div", {className: "panel-body"}, React.createElement(AnswersStatus, {ref: (ref) => this.answersStatus = ref, title: this.state.formTitle, type: VC.Forms.FormType.Poll, onDeleteAll: () => this.props.onDeleteAllClick(this.state.formId)})), React.createElement("div", {className: "panel-body", style: { textAlign: "center" }}, React.createElement("div", {style: { display: "inline-table" }}, React.createElement(VC.Forms.Form, {ref: (ref) => this.form = ref, view: VC.Forms.FormViews.Result}))))));
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
                    this.state = { title: "", formId: "", answerId: "", name: "", countOfPCs: 0, status: null };
                }
                componentDidMount() {
                    $(this.divBox).on("shown.bs.modal", () => this.boxDidShow());
                    $(this.divBox).on("hidden.bs.modal", () => this.boxDidHide());
                }
                show() {
                    this.boxWillShow();
                    $(this.divBox).modal("show");
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
                openForm(item, countOfPCs) {
                    this.setState({ title: item.title, formId: item.id, answerId: null, name: "", countOfPCs: countOfPCs, status: null }, () => this.show());
                }
                openAnswer(item) {
                    this.setState({ title: item.title, formId: null, name: item.name, answerId: item.id, countOfPCs: 0, status: item.status }, () => this.show());
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
                        return (React.createElement("span", {className: "label label-success"}, "Answered"));
                    }
                    else if (status === VC.Forms.FormAnswerStatus.Declined) {
                        return (React.createElement("span", {className: "label label-danger"}, "Declined"));
                    }
                    else if (status === VC.Forms.FormAnswerStatus.Pending) {
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
                    return (React.createElement("div", {ref: (ref) => this.divBox = ref, className: "modal fade", role: "dialog"}, React.createElement("div", {className: "modal-dialog"}, React.createElement("div", {className: "modal-content"}, React.createElement("div", {className: "modal-header"}, React.createElement("button", {type: "button", className: "close", "data-dismiss": "modal"}, "× "), React.createElement("h4", {className: "modal-title"}, this.state.title, " ", this.renderBoxStatus(this.state.status)), React.createElement("h5", {style: { display: (this.state.name === "" ? "none" : "block") }}, this.state.name)), React.createElement("div", {className: "modal-body"}, React.createElement(VC.Forms.Form, {ref: (ref) => this.form = ref, view: VC.Forms.FormViews.Preview})), React.createElement("div", {ref: (ref) => this.divButtons = ref, style: { display: "block" }, className: "modal-footer"}, this.renderButtons()), React.createElement("div", {ref: (ref) => this.divProcessing = ref, style: { display: "none" }, className: "modal-footer"}, React.createElement("span", null, "Processing ..."))))));
                }
            }
            class FormsTc extends React.Component {
                constructor(props) {
                    super(props);
                    this.state = { connectedPCs: [] };
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
            }
            class SurveysTc extends FormsTc {
                init() {
                    this.divAnswersList.style.display = "none";
                    this.divFormsList.style.display = "block";
                    this.formsList.loadForms();
                }
                connectedPCsChanged(connectedPCs) {
                    this.state.connectedPCs = connectedPCs;
                    this.formBox.countOfPCsChanged(connectedPCs.length);
                }
                onSendClick(item) {
                    this.formBox.openForm(item, this.state.connectedPCs.length);
                }
                onViewClick(item) {
                    this.divFormsList.style.display = "none";
                    this.divAnswersList.style.display = "block";
                    this.answersList.init(item);
                }
                onViewAnswerClick(item) {
                    this.formBox.openAnswer(item);
                }
                onSendFormClick(formId) {
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
                                    this.props.onFormSent();
                                    this.formsList.answerReceived(formId, VC.Forms.FormAnswerStatus.Pending, r.data);
                                }
                                else {
                                    alert("Something went wrong: The survey has not been sent.");
                                }
                            }
                            else {
                                alert("ERROR: " + r.message);
                            }
                        },
                        error: (xhr, status, error) => {
                            alert("ERROR: " + error);
                            this.formBox.hide();
                        }
                    });
                }
                onDeleteAnswerClick(answerId) {
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
                                    this.props.onAnswerDeleted(r.data);
                                    this.answersList.deleteAnswer(answerId);
                                }
                                else {
                                    alert("Something went wrong: The survey answer has not been deleted.");
                                }
                            }
                            else {
                                alert("ERROR: " + r.message);
                            }
                        },
                        error: (xhr, status, error) => {
                            alert("ERROR: " + error);
                            this.formBox.hide();
                        }
                    });
                }
                onDeleteAllClick(formId) {
                    $.ajax({
                        cache: false,
                        type: "POST",
                        url: this.props.actionUrl + "/DeleteAllAnswers",
                        data: JSON.stringify({ formUid: formId }),
                        contentType: "application/json",
                        success: (r) => {
                            this.formBox.hide();
                            if (r.status === VC.Global.Data.RESPONSE_SUCCESS) {
                                if (r.data !== null) {
                                    this.props.onAllAnswersDeleted(r.data);
                                    this.answersList.deleteAllAnswers();
                                }
                                else {
                                    alert("Something went wrong: The survey answers has not been deleted.");
                                }
                            }
                            else {
                                alert("ERROR: " + r.message);
                            }
                        },
                        error: (xhr, status, error) => {
                            alert("ERROR: " + error);
                            this.formBox.hide();
                        }
                    });
                }
                answerReceived(formId, answerId, status) {
                    this.formsList.answerReceived(formId, status);
                    this.answersList.answerReceived(answerId, status);
                    this.formBox.answerReceived(answerId, status);
                }
                onBackToListClick() {
                    this.divAnswersList.style.display = "none";
                    this.divFormsList.style.display = "block";
                    this.formsList.loadForms();
                }
                render() {
                    return (React.createElement("div", null, React.createElement("div", {ref: (ref) => this.divFormsList = ref, style: { display: "block" }}, React.createElement(FormsList, {ref: (ref) => this.formsList = ref, type: VC.Forms.FormType.Survey, actionUrl: this.props.actionUrl, onViewAnswerClick: (item) => this.onViewClick(item), onSendFormClick: (item) => this.onSendClick(item)})), React.createElement("div", {ref: (ref) => this.divAnswersList = ref, style: { display: "none" }}, React.createElement(AnswersList, {ref: (ref) => this.answersList = ref, type: VC.Forms.FormType.Survey, actionUrl: this.props.actionUrl, onViewClick: (item) => this.onViewAnswerClick(item), onBackClick: () => this.onBackToListClick(), onDeleteAllClick: (formId) => this.onDeleteAllClick(formId)})), React.createElement(FormBox, {ref: (ref) => this.formBox = ref, onSendFormClick: (formId) => this.onSendFormClick(formId), onDeleteAnswerClick: (answerId) => this.onDeleteAnswerClick(answerId)})));
                }
            }
            TC.SurveysTc = SurveysTc;
            class PollsTc extends FormsTc {
                init() {
                    this.divAnswersResult.style.display = "none";
                    this.divFormsList.style.display = "block";
                    this.formsList.loadForms();
                }
                connectedPCsChanged(connectedPCs) {
                    this.state.connectedPCs = connectedPCs;
                    this.formBox.countOfPCsChanged(connectedPCs.length);
                }
                onSendClick(item) {
                    this.formBox.openForm(item, this.state.connectedPCs.length);
                }
                onViewClick(item) {
                    this.divFormsList.style.display = "none";
                    this.divAnswersResult.style.display = "block";
                    this.answersResult.init(item);
                }
                onSendFormClick(formId) {
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
                                    this.props.onFormSent();
                                    this.formsList.answerReceived(formId, VC.Forms.FormAnswerStatus.Pending, r.data);
                                }
                                else {
                                    alert("Something went wrong: The poll has not been sent.");
                                }
                            }
                            else {
                                alert("ERROR: " + r.message);
                            }
                        },
                        error: (xhr, status, error) => {
                            alert("ERROR: " + error);
                            this.formBox.hide();
                        }
                    });
                }
                onDeleteAnswerClick(answerId) {
                }
                onDeleteAllClick(formId) {
                    $.ajax({
                        cache: false,
                        type: "POST",
                        url: this.props.actionUrl + "/DeleteAllAnswers",
                        data: JSON.stringify({ formUid: formId }),
                        contentType: "application/json",
                        success: (r) => {
                            this.formBox.hide();
                            if (r.status === VC.Global.Data.RESPONSE_SUCCESS) {
                                if (r.data !== null) {
                                    this.props.onAllAnswersDeleted(r.data);
                                    this.answersResult.deleteAllAnswers();
                                }
                                else {
                                    alert("Something went wrong: The poll answers has not been deleted.");
                                }
                            }
                            else {
                                alert("ERROR: " + r.message);
                            }
                        },
                        error: (xhr, status, error) => {
                            alert("ERROR: " + error);
                            this.formBox.hide();
                        }
                    });
                }
                answerReceived(formId, answerId, status, resultData) {
                    this.formsList.answerReceived(formId, status);
                    this.answersResult.answerReceived(formId, status, resultData);
                }
                onBackToListClick() {
                    this.divAnswersResult.style.display = "none";
                    this.divFormsList.style.display = "block";
                    this.formsList.loadForms();
                }
                render() {
                    return (React.createElement("div", null, React.createElement("div", {ref: (ref) => this.divFormsList = ref, style: { display: "block" }}, React.createElement(FormsList, {ref: (ref) => this.formsList = ref, type: VC.Forms.FormType.Poll, actionUrl: this.props.actionUrl, onViewAnswerClick: (item) => this.onViewClick(item), onSendFormClick: (item) => this.onSendClick(item)})), React.createElement("div", {ref: (ref) => this.divAnswersResult = ref, style: { display: "none" }}, React.createElement(AnswersResult, {ref: (ref) => this.answersResult = ref, actionUrl: this.props.actionUrl, onBackClick: () => this.onBackToListClick(), onDeleteAllClick: (formId) => this.onDeleteAllClick(formId)})), React.createElement(FormBox, {ref: (ref) => this.formBox = ref, onSendFormClick: (formId) => this.onSendFormClick(formId), onDeleteAnswerClick: (answerId) => this.onDeleteAnswerClick(answerId)})));
                }
            }
            TC.PollsTc = PollsTc;
        })(TC = App.TC || (App.TC = {}));
    })(App = VC.App || (VC.App = {}));
})(VC || (VC = {}));
//# sourceMappingURL=FormsTc.js.map