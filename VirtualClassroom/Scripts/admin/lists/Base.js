var VC;
(function (VC) {
    var Admin;
    (function (Admin) {
        var Lists;
        (function (Lists) {
            "use strict";
            Lists.REF_FORM_DIV = "div";
            Lists.REF_FORM_TB = "tb";
            Lists.REF_FORM_ICON = "ico";
            (function (ListStatus) {
                ListStatus[ListStatus["Loading"] = 0] = "Loading";
                ListStatus[ListStatus["Success"] = 1] = "Success";
                ListStatus[ListStatus["Error"] = 2] = "Error";
            })(Lists.ListStatus || (Lists.ListStatus = {}));
            var ListStatus = Lists.ListStatus;
            (function (BoxTypes) {
                BoxTypes[BoxTypes["Create"] = 0] = "Create";
                BoxTypes[BoxTypes["Edit"] = 1] = "Edit";
                BoxTypes[BoxTypes["Delete"] = 2] = "Delete";
            })(Lists.BoxTypes || (Lists.BoxTypes = {}));
            var BoxTypes = Lists.BoxTypes;
            (function (BoxValidationStatus) {
                BoxValidationStatus[BoxValidationStatus["None"] = 0] = "None";
                BoxValidationStatus[BoxValidationStatus["Success"] = 1] = "Success";
                BoxValidationStatus[BoxValidationStatus["Error"] = 2] = "Error";
            })(Lists.BoxValidationStatus || (Lists.BoxValidationStatus = {}));
            var BoxValidationStatus = Lists.BoxValidationStatus;
            class Box extends React.Component {
                constructor(defaultItem, props) {
                    super(props);
                    this.defaultItem = defaultItem;
                    this.state = { type: BoxTypes.Create, item: defaultItem };
                }
                componentDidMount() {
                    $(this.divBox).on("shown.bs.modal", () => this.boxDidShow());
                    $(this.divBox).on("hidden.bs.modal", () => this.boxDidHide());
                }
                show() {
                    this.boxWillShow();
                    $(this.divBox).modal("show");
                    this.divButtons.style.display = "block";
                    this.divProcessing.style.display = "none";
                }
                open(type, item) {
                    this.setState({ type: type, item: item }, () => this.show());
                }
                hide() {
                    $(this.divBox).modal("hide");
                }
                boxDidHide() {
                    this.divButtons.style.display = "block";
                    this.divProcessing.style.display = "none";
                }
                setValidationStatus(ref, status, tooltip) {
                    let div = this.refs[Lists.REF_FORM_DIV + ref];
                    let icon = this.refs[Lists.REF_FORM_ICON + ref];
                    let tb = this.refs[Lists.REF_FORM_TB + ref];
                    switch (status) {
                        case BoxValidationStatus.None:
                            div.className = "form-group";
                            icon.className = "";
                            icon.style.display = "none";
                            break;
                        case BoxValidationStatus.Success:
                            div.className = "form-group has-success has-feedback";
                            icon.className = "glyphicon glyphicon-ok form-control-feedback";
                            icon.style.display = "block";
                            break;
                        case BoxValidationStatus.Error:
                            div.className = "form-group has-error has-feedback";
                            icon.className = "glyphicon glyphicon-warning-sign form-control-feedback";
                            icon.style.display = "block";
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
                render() {
                    let title = "";
                    let buttonTitle = "";
                    let buttonClassName = "";
                    let buttonIcon = "";
                    switch (this.state.type) {
                        case BoxTypes.Create:
                            title = "New " + this.props.title;
                            buttonTitle = "Create";
                            buttonClassName = "btn btn-success";
                            buttonIcon = "glyphicon glyphicon-plus";
                            break;
                        case BoxTypes.Edit:
                            title = "Edit " + this.props.title;
                            buttonTitle = "Save";
                            buttonClassName = "btn btn-success";
                            buttonIcon = "glyphicon glyphicon-floppy-disk";
                            break;
                        case BoxTypes.Delete:
                            title = "Delete " + this.props.title;
                            buttonTitle = "Delete";
                            buttonClassName = "btn btn-danger";
                            buttonIcon = "glyphicon glyphicon-trash";
                            break;
                    }
                    return (React.createElement("div", {ref: (ref) => this.divBox = ref, className: "modal fade", role: "dialog"}, React.createElement("div", {className: "modal-dialog"}, React.createElement("div", {className: "modal-content"}, React.createElement("div", {className: "modal-header"}, React.createElement("button", {type: "button", className: "close", "data-dismiss": "modal"}, "× "), React.createElement("h4", {className: "modal-title"}, title)), React.createElement("div", {className: "modal-body"}, this.renderForm()), React.createElement("div", {ref: (ref) => this.divButtons = ref, style: { display: "block" }, className: "modal-footer"}, React.createElement("button", {type: "button", className: buttonClassName, onClick: () => this.submitForm()}, React.createElement("span", {className: buttonIcon}), " ", buttonTitle), React.createElement("button", {type: "button", className: "btn btn-default", "data-dismiss": "modal"}, "Close")), React.createElement("div", {ref: (ref) => this.divProcessing = ref, style: { display: "none" }, className: "modal-footer"}, React.createElement("span", null, "Processing ..."))))));
                }
            }
            Lists.Box = Box;
            class List extends React.Component {
                constructor(props) {
                    super(props);
                    this.state = { status: ListStatus.Loading, errorMessage: "", data: null };
                }
                init() {
                    this.loadData();
                }
                loadData() {
                    $.ajax({
                        cache: false,
                        type: "GET",
                        url: "/api/Classroom/" + (this.props.classroomId === undefined ? "" : this.props.classroomId + "/") + this.props.loadMethod,
                        success: (r) => {
                            if (r.status === VC.Global.Data.RESPONSE_SUCCESS) {
                                this.setState({ status: ListStatus.Success, errorMessage: "", data: r.data });
                            }
                            else {
                                this.setErrorMessage(r.message);
                            }
                        },
                        error: (xhr, status, error) => {
                            this.setErrorMessage("XHR Error - " + xhr.statusText);
                        }
                    });
                }
                setErrorMessage(errorMessage) {
                    this.setState({ status: ListStatus.Error, errorMessage: errorMessage, data: null });
                }
                getItem(id) {
                    let item = null;
                    for (let i = 0; i < this.state.data.length && item == null; i++) {
                        if (this.state.data[i].id === id) {
                            item = this.state.data[i];
                        }
                    }
                    return item;
                }
                getListItems() {
                    return this.state.data;
                }
                setListItems(data) {
                    this.setState({ status: this.state.status, errorMessage: this.state.errorMessage, data: data });
                }
                renderLoader() {
                    return (React.createElement("div", {className: "text-muted"}, "Loading ..."));
                }
                renderError(message) {
                    return (React.createElement("div", {className: "text-danger"}, "ERROR: ", message));
                }
                renderNotFound() {
                    return (React.createElement("div", {className: "text-muted"}, "No ", this.props.title, " found."));
                }
                renderBody() {
                    let body;
                    if (this.state.status === ListStatus.Loading) {
                        body = this.renderLoader();
                    }
                    else if (this.state.status === ListStatus.Error) {
                        body = this.renderError(this.state.errorMessage);
                    }
                    else if (this.state.data.length === 0) {
                        body = this.renderNotFound();
                    }
                    else {
                        body = this.renderTable();
                    }
                    return (React.createElement("div", {className: "panel-body"}, body));
                }
                renderItem(d) {
                    return (React.createElement("tr", {key: d.id}, this.renderItemCols(d), React.createElement("td", {style: { textAlign: "right" }}, React.createElement("button", {type: "button", className: "btn btn-sm btn-info", onClick: () => this.props.showBoxEdit(d.id)}, React.createElement("span", {className: "glyphicon glyphicon-pencil"}), " Edit"), " ", React.createElement("button", {type: "button", className: "btn btn-sm btn-danger", onClick: () => this.props.showBoxDelete(d.id)}, React.createElement("span", {className: "glyphicon glyphicon-trash"}), " Delete"))));
                }
                renderTable() {
                    let items = [];
                    this.state.data.forEach((d) => items.push(this.renderItem(d)));
                    return (React.createElement("table", {className: "table", align: "center"}, React.createElement("thead", null, React.createElement("tr", null, this.renderTableHeaderCols(), React.createElement("th", null))), React.createElement("tbody", null, items)));
                }
                render() {
                    return (React.createElement("div", null, React.createElement("div", {className: "panel panel-default"}, React.createElement("div", {className: "panel-heading"}, React.createElement("h4", null, this.props.title, "s")), this.renderBody()), React.createElement("div", {style: { display: (this.state.data != null ? "block" : "none") }}, React.createElement("button", {type: "button", className: "btn btn-sm btn-success", onClick: () => this.props.showBoxNew()}, React.createElement("span", {className: "glyphicon glyphicon-plus"}), " Add New ", this.props.title))));
                }
            }
            Lists.List = List;
            class Base extends React.Component {
                constructor(props) {
                    super(props);
                    this.initied = false;
                }
                getItem(id) {
                    let List1 = this.getList();
                    return List1.getItem(id);
                }
                showBoxNew() {
                    let Box1 = this.getBox();
                    Box1.open(BoxTypes.Create, Box1.defaultItem);
                }
                showBoxEdit(id) {
                    let item = this.getItem(id);
                    if (item != null) {
                        let Box1 = this.getBox();
                        Box1.open(BoxTypes.Edit, item);
                    }
                }
                showBoxDelete(id) {
                    let item = this.getItem(id);
                    if (item != null) {
                        let Box1 = this.getBox();
                        Box1.open(BoxTypes.Delete, item);
                    }
                }
                getListItems() {
                    let List1 = this.getList();
                    return List1.getListItems();
                }
                setListItems(data) {
                    let List1 = this.getList();
                    List1.setListItems(data);
                }
                init() {
                    if (!this.initied) {
                        this.initied = true;
                        let list1 = this.getList();
                        list1.init();
                    }
                }
            }
            Lists.Base = Base;
        })(Lists = Admin.Lists || (Admin.Lists = {}));
    })(Admin = VC.Admin || (VC.Admin = {}));
})(VC || (VC = {}));
//# sourceMappingURL=Base.js.map