var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Admin;
(function (Admin) {
    // enums
    (function (ListStatus) {
        ListStatus[ListStatus["Loading"] = 0] = "Loading";
        ListStatus[ListStatus["Success"] = 1] = "Success";
        ListStatus[ListStatus["Error"] = 2] = "Error";
    })(Admin.ListStatus || (Admin.ListStatus = {}));
    var ListStatus = Admin.ListStatus;
    (function (BoxTypes) {
        BoxTypes[BoxTypes["Create"] = 0] = "Create";
        BoxTypes[BoxTypes["Edit"] = 1] = "Edit";
        BoxTypes[BoxTypes["Delete"] = 2] = "Delete";
    })(Admin.BoxTypes || (Admin.BoxTypes = {}));
    var BoxTypes = Admin.BoxTypes;
    (function (BoxValidationStatus) {
        BoxValidationStatus[BoxValidationStatus["None"] = 0] = "None";
        BoxValidationStatus[BoxValidationStatus["Success"] = 1] = "Success";
        BoxValidationStatus[BoxValidationStatus["Error"] = 2] = "Error";
    })(Admin.BoxValidationStatus || (Admin.BoxValidationStatus = {}));
    var BoxValidationStatus = Admin.BoxValidationStatus;
    var Box = (function (_super) {
        __extends(Box, _super);
        function Box(defaultItem, props) {
            _super.call(this, props);
            this.defaultItem = defaultItem;
            this.showBox = false;
            this.state = { type: BoxTypes.Create, item: defaultItem };
        }
        Box.prototype.componentDidMount = function () {
            var _this = this;
            var box1 = this.refs['Box1'];
            $(box1).on('shown.bs.modal', function () { return _this.onBoxDidShow(); });
            $(box1).on('hidden.bs.modal', function () { return _this.onBoxDidHide(); });
        };
        Box.prototype.componentDidUpdate = function (prevProps, prevState) {
            if (this.showBox) {
                this.showBox = false;
                // show
                var box1 = this.refs['Box1'];
                $(box1).modal('show');
                this.onBoxWillShow();
            }
        };
        // box methods
        Box.prototype.open = function (type, item) {
            this.showBox = true;
            this.setState({ type: type, item: item });
        };
        Box.prototype.hide = function () {
            var box1 = this.refs['Box1'];
            $(box1).modal('hide');
        };
        Box.prototype.onBoxDidHide = function () {
            var DivButtons = this.refs['DivButtons'];
            var DivProcessing = this.refs['DivProcessing'];
            DivButtons.style.display = 'block';
            DivProcessing.style.display = 'none';
        };
        Box.prototype.setValidationStatus = function (ref, status, tooltip) {
            var div = this.refs['div' + ref];
            var icon = this.refs['icon' + ref];
            var tb = this.refs['tb' + ref];
            switch (status) {
                case BoxValidationStatus.None:
                    div.className = "form-group";
                    icon.className = "";
                    icon.style.display = 'none';
                    break;
                case BoxValidationStatus.Success:
                    div.className = "form-group has-success has-feedback";
                    icon.className = "glyphicon glyphicon-ok form-control-feedback";
                    icon.style.display = 'block';
                    break;
                case BoxValidationStatus.Error:
                    div.className = "form-group has-error has-feedback";
                    icon.className = "glyphicon glyphicon-warning-sign form-control-feedback";
                    icon.style.display = 'block';
                    break;
            }
            if (tooltip != '') {
                $(tb).attr("data-toggle", "tooltip");
                $(tb).attr("data-placement", "bottom");
                $(tb).attr("title", tooltip);
                $(tb).tooltip();
            }
            else {
                $(tb).removeAttr("data-toggle");
                $(tb).removeAttr("data-placement");
                $(tb).removeAttr("title");
                $(tb).tooltip('destroy');
            }
        };
        // render
        Box.prototype.render = function () {
            var title = '';
            var buttonTitle = '';
            var buttonClassName = '';
            var buttonIcon = '';
            switch (this.state.type) {
                case BoxTypes.Create:
                    title = 'New ' + this.props.title;
                    buttonTitle = 'Create';
                    buttonClassName = 'btn btn-success';
                    buttonIcon = 'glyphicon glyphicon-plus';
                    break;
                case BoxTypes.Edit:
                    title = 'Edit ' + this.props.title;
                    buttonTitle = 'Save';
                    buttonClassName = 'btn btn-success';
                    buttonIcon = 'glyphicon glyphicon-floppy-disk';
                    break;
                case BoxTypes.Delete:
                    title = 'Delete ' + this.props.title;
                    buttonTitle = 'Delete';
                    buttonClassName = 'btn btn-danger';
                    buttonIcon = 'glyphicon glyphicon-trash';
                    break;
            }
            return (React.createElement("div", {ref: 'Box1', id: "test", className: "modal fade", role: "dialog"}, React.createElement("div", {className: "modal-dialog"}, React.createElement("div", {className: "modal-content"}, React.createElement("div", {className: "modal-header"}, React.createElement("button", {type: "button", className: "close", "data-dismiss": "modal"}, "× "), React.createElement("h4", {className: "modal-title"}, title)), React.createElement("div", {className: "modal-body"}, this.renderForm()), React.createElement("div", {ref: 'DivButtons', style: { display: 'block' }, className: "modal-footer"}, React.createElement("button", {type: "button", className: buttonClassName, onClick: this.submitForm.bind(this)}, React.createElement("span", {className: buttonIcon}), " ", buttonTitle), React.createElement("button", {type: "button", className: "btn btn-default", "data-dismiss": "modal"}, "Close")), React.createElement("div", {ref: 'DivProcessing', style: { display: 'none' }, className: "modal-footer"}, React.createElement("span", null, "Processing ..."))))));
        };
        return Box;
    }(React.Component));
    Admin.Box = Box;
    var List = (function (_super) {
        __extends(List, _super);
        function List(props) {
            _super.call(this, props);
            this.state = { status: ListStatus.Loading, errorMessage: '', data: null };
        }
        List.prototype.componentDidMount = function () {
        };
        List.prototype.init = function () {
            this.loadData();
        };
        List.prototype.loadData = function () {
            var _this = this;
            $.ajax({
                type: 'GET',
                url: this.props.actionUrl + '/' + this.props.loadAction,
                beforeSend: function (xhr) { },
                success: function (r) {
                    if (r != null) {
                        if (r.status == 'success') {
                            _this.setState({ status: ListStatus.Success, errorMessage: '', data: r.data });
                        }
                        else {
                            _this.setErrorMessage(r.message);
                        }
                    }
                    else {
                        _this.setErrorMessage(_this.props.loadAction + ' action failed');
                    }
                },
                error: function (xhr, status, error) {
                    _this.setErrorMessage('XHR Error - ' + xhr.statusText);
                }
            });
        };
        List.prototype.setErrorMessage = function (errorMessage) {
            this.setState({ status: ListStatus.Error, errorMessage: errorMessage, data: null });
        };
        List.prototype.setLoadingStatus = function () {
            this.setState({ status: ListStatus.Loading, errorMessage: '', data: null });
        };
        List.prototype.getItem = function (id) {
            var item = null;
            for (var i = 0; i < this.state.data.length && item == null; i++) {
                if (this.state.data[i].id == id) {
                    item = this.state.data[i];
                }
            }
            return item;
        };
        List.prototype.getListItems = function () {
            return this.state.data;
        };
        List.prototype.setListItems = function (data) {
            this.setState({ status: this.state.status, errorMessage: this.state.errorMessage, data: data });
        };
        List.prototype.renderLoader = function () {
            return (React.createElement("div", {className: "text-primary"}, "Loading ..."));
        };
        List.prototype.renderError = function (message) {
            return (React.createElement("div", null, "ERROR: ", message));
        };
        List.prototype.renderNotFound = function () {
            return (React.createElement("div", {className: "text-muted"}, "No ", this.props.title, " found."));
        };
        List.prototype.renderBody = function () {
            var body;
            if (this.state.status == ListStatus.Loading) {
                // loading
                body = this.renderLoader();
            }
            else if (this.state.status == ListStatus.Error) {
                // error
                body = this.renderError(this.state.errorMessage);
            }
            else if (this.state.data.length == 0) {
                body = this.renderNotFound();
            }
            else {
                body = this.renderTable();
            }
            return (React.createElement("div", {className: "panel-body"}, body));
        };
        List.prototype.renderItem = function (d) {
            var _this = this;
            return (React.createElement("tr", null, this.renderItemCols(d), React.createElement("td", {style: { textAlign: 'right' }}, React.createElement("button", {type: "button", className: "btn btn-xs btn-info", onClick: function () { return _this.props.showBoxEdit(d.id); }}, React.createElement("span", {className: "glyphicon glyphicon-pencil"})), " ", React.createElement("button", {type: "button", className: "btn btn-xs btn-danger", onClick: function () { return _this.props.showBoxDelete(d.id); }}, React.createElement("span", {className: "glyphicon glyphicon-trash"})))));
        };
        List.prototype.renderTable = function () {
            var _this = this;
            var items = [];
            this.state.data.forEach(function (d) { return items.push(_this.renderItem(d)); });
            return (React.createElement("table", {className: "table", align: "center"}, React.createElement("thead", null, React.createElement("tr", null, this.renderTableHeaderCols(), React.createElement("th", null))), React.createElement("tbody", null, items)));
        };
        List.prototype.render = function () {
            var _this = this;
            return (React.createElement("div", null, React.createElement("div", {className: "panel panel-default"}, React.createElement("div", {className: "panel-heading"}, React.createElement("h4", null, this.props.title, "s")), this.renderBody()), React.createElement("div", {style: { display: (this.state.data != null ? 'block' : 'none') }}, React.createElement("button", {type: "button", className: "btn btn-sm btn-success", onClick: function () { return _this.props.showBoxNew(); }}, React.createElement("span", {className: "glyphicon glyphicon-plus"}), " Add New ", this.props.title))));
        };
        return List;
    }(React.Component));
    Admin.List = List;
    // BASE
    var Base = (function (_super) {
        __extends(Base, _super);
        function Base(props) {
            _super.call(this, props);
            this.state = { classRoomId: props.classRoomId };
        }
        Base.prototype.getItem = function (id) {
            var List1 = this.getList();
            return List1.getItem(id);
        };
        Base.prototype.showBoxNew = function () {
            var Box1 = this.getBox();
            Box1.open(BoxTypes.Create, Box1.defaultItem);
        };
        Base.prototype.showBoxEdit = function (id) {
            var item = this.getItem(id);
            if (item != null) {
                var Box1 = this.getBox();
                Box1.open(BoxTypes.Edit, item);
            }
        };
        Base.prototype.showBoxDelete = function (id) {
            var item = this.getItem(id);
            if (item != null) {
                var Box1 = this.getBox();
                Box1.open(BoxTypes.Delete, item);
            }
        };
        Base.prototype.getListItems = function () {
            var List1 = this.getList();
            return List1.getListItems();
        };
        Base.prototype.setListItems = function (data) {
            var List1 = this.getList();
            List1.setListItems(data);
        };
        return Base;
    }(React.Component));
    Admin.Base = Base;
})(Admin || (Admin = {}));
//# sourceMappingURL=Base.js.map