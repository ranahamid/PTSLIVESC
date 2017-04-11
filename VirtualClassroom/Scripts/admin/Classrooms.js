var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Admin;
(function (Admin) {
    var Classrooms = (function (_super) {
        __extends(Classrooms, _super);
        function Classrooms() {
            _super.apply(this, arguments);
        }
        Classrooms.prototype.getList = function () {
            return this.refs['List1'];
        };
        Classrooms.prototype.getBox = function () {
            return this.refs['Box1'];
        };
        Classrooms.prototype.componentDidMount = function () {
            var list1 = this.getList();
            list1.init();
        };
        Classrooms.prototype.render = function () {
            return (React.createElement("div", null, React.createElement(ClassroomsList, {ref: "List1", title: "Classroom", actionUrl: this.props.actionUrl, loadAction: "LoadClassrooms", showBoxNew: this.showBoxNew.bind(this), showBoxEdit: this.showBoxEdit.bind(this), showBoxDelete: this.showBoxDelete.bind(this)}), React.createElement(ClassroomsBox, {ref: "Box1", title: "Classroom", actionUrl: this.props.actionUrl, getListItems: this.getListItems.bind(this), setListItems: this.setListItems.bind(this)})));
        };
        return Classrooms;
    }(Admin.Base));
    Admin.Classrooms = Classrooms;
    var ClassroomsList = (function (_super) {
        __extends(ClassroomsList, _super);
        function ClassroomsList() {
            _super.apply(this, arguments);
        }
        ClassroomsList.prototype.renderItemCols = function (d) {
            var l = [];
            l.push(React.createElement("td", null, d.id));
            l.push(React.createElement("td", null, d.name));
            return l;
        };
        ClassroomsList.prototype.renderTableHeaderCols = function () {
            var l = [];
            l.push(React.createElement("th", null, "ID"));
            l.push(React.createElement("th", null, "Classname"));

            return l;
        };
        return ClassroomsList;
    }(Admin.List));
    var ClassroomsBox = (function (_super) {
        __extends(ClassroomsBox, _super);
        function ClassroomsBox(props) {
            _super.call(this, { id: '', name: '' }, props);
        }
        ClassroomsBox.prototype.onBoxWillShow = function () {
            var tbId = this.refs['tbId'];
            var tbName = this.refs['tbName'];
            $(tbId).val(this.state.item.id);
            $(tbName).val(this.state.item.name);
            this.setValidationStatus('Id', Admin.BoxValidationStatus.None, '');
            this.setValidationStatus('Name', Admin.BoxValidationStatus.None, '');
        };
        ClassroomsBox.prototype.onBoxDidShow = function () {
            if (this.state.type == Admin.BoxTypes.Create) {
                var tbId = this.refs['tbId'];
                $(tbId).focus();
            }
            else if (this.state.type == Admin.BoxTypes.Edit) {
                var tbName = this.refs['tbName'];
                $(tbName).focus();
            }
        };
        ClassroomsBox.prototype.isIdValid = function (id) {
            var valid = id.length > 0; // cannot be empty
            var allowedChars = 'abcdefghijklmnopqrstuvwxyz0123456789';
            // check allowed chars
            if (valid) {
                for (var i = 0; i < id.length && valid; i++) {
                    if (allowedChars.indexOf(id[i].toLowerCase()) == -1) {
                        valid = false;
                    }
                }
            }
            if (valid) {
            }
            return valid;
        };
        ClassroomsBox.prototype.isNameValid = function (name) {
            return !(name.length === 0 || !name.trim()); // cannot be empty
        };
        ClassroomsBox.prototype.validateId = function (focusOnError) {
            var valid = true;
            if (this.state.type == Admin.BoxTypes.Create) {
                var tbId = this.refs['tbId'];
                var idVal = $(tbId).val();
                if (this.isIdValid(idVal)) {
                    this.setValidationStatus('Id', Admin.BoxValidationStatus.Success, '');
                }
                else {
                    this.setValidationStatus('Id', Admin.BoxValidationStatus.Error, 'Classroom Id cannot be empty. It must be unique and contains only alphanumeric characters.');
                    if (focusOnError) {
                        $(tbId).focus();
                    }
                    valid = false;
                }
            }
            return valid;
        };
        ClassroomsBox.prototype.validateName = function (focusOnError) {
            var valid = true;
            if (this.state.type == Admin.BoxTypes.Create || this.state.type == Admin.BoxTypes.Edit) {
                var tbName = this.refs['tbName'];
                var nameVal = $(tbName).val();
                if (this.isNameValid(nameVal)) {
                    this.setValidationStatus('Name', Admin.BoxValidationStatus.Success, '');
                }
                else {
                    this.setValidationStatus('Name', Admin.BoxValidationStatus.Error, 'Classroom name cannot be empty.');
                    if (focusOnError) {
                        $(tbName).focus();
                    }
                    valid = false;
                }
            }
            return valid;
        };
        ClassroomsBox.prototype.validateForm = function (focusOnError) {
            var valid = true;
            if (!this.validateName(focusOnError)) {
                valid = false;
            }
            if (!this.validateId(focusOnError)) {
                valid = false;
            }
            return valid;
        };
        ClassroomsBox.prototype.onKeyPressId = function (e) {
            if (e.which == 13) {
                e.preventDefault();
                this.submitForm();
            }
            else {
                this.validateId(false);
            }
        };
        ClassroomsBox.prototype.onKeyPressName = function (e) {
            if (e.which == 13) {
                e.preventDefault();
                this.submitForm();
            }
            else {
                this.validateName(false);
            }
        };
        ClassroomsBox.prototype.checkForExistingId = function (id, excludeId, callback) {
            $.ajax({
                type: 'POST',
                url: this.props.actionUrl + '/CheckForExistingClassroomId',
                data: JSON.stringify({ id: id, excludeId: excludeId }),
                contentType: 'application/json',
                beforeSend: function (xhr) { },
                success: function (r) {
                    callback(r);
                },
                error: function (xhr, status, error) {
                }
            });
        };
        ClassroomsBox.prototype.submitForm = function () {
            var tbId = this.refs['tbId'];
            var tbName = this.refs['tbName'];
            var isFormValid = this.validateForm(true);
            if (isFormValid) {
                var valId = $(tbId).val();
                var valName = $(tbName).val();
                var DivButtons = this.refs['DivButtons'];
                var DivProcessing = this.refs['DivProcessing'];
                DivButtons.style.display = 'none';
                DivProcessing.style.display = 'block';
                if (this.state.type == Admin.BoxTypes.Create) {
                    // check for existing item before create
                    this.checkForExistingId(valId, this.state.item.id, this.submitFormIdValidated.bind(this));
                }
                else if (this.state.type == Admin.BoxTypes.Edit) {
                    // edit
                    this.doUpdate();
                }
                else {
                    // delete
                    this.doDelete();
                }
            }
        };
        ClassroomsBox.prototype.submitFormIdValidated = function (exist) {
            if (exist) {
                var tbId = this.refs['tbId'];
                var DivButtons = this.refs['DivButtons'];
                var DivProcessing = this.refs['DivProcessing'];
                DivButtons.style.display = 'block';
                DivProcessing.style.display = 'none';
                this.setValidationStatus('Id', Admin.BoxValidationStatus.Error, 'Classroom Id already exists.');
                $(tbId).focus();
            }
            else {
                // create
                this.doCreate();
            }
        };
        ClassroomsBox.prototype.doCreate = function () {
            var _this = this;
            var tbId = this.refs['tbId'];
            var tbName = this.refs['tbName'];
            var idVal = $(tbId).val();
            var nameVal = $(tbName).val();
            $.ajax({
                type: 'POST',
                url: this.props.actionUrl + '/CreateClassroom',
                data: JSON.stringify({ item: { id: idVal, name: nameVal } }),
                contentType: 'application/json',
                beforeSend: function (xhr) { },
                success: function (r) {
                    _this.hide();
                    // add to list
                    var d = _this.props.getListItems();
                    d.push({ id: idVal, name: nameVal });
                    _this.props.setListItems(d);
                },
                error: function (xhr, status, error) {
                }
            });
        };
        ClassroomsBox.prototype.doUpdate = function () {
            var _this = this;
            var tbId = this.refs['tbId'];
            var tbName = this.refs['tbName'];
            var idVal = $(tbId).val();
            var nameVal = $(tbName).val();
            $.ajax({
                type: 'POST',
                url: this.props.actionUrl + '/UpdateClassroom',
                data: JSON.stringify({ item: { id: idVal, name: nameVal } }),
                contentType: 'application/json',
                beforeSend: function (xhr) { },
                success: function (r) {
                    _this.hide();
                    // update list
                    var d = _this.props.getListItems();
                    for (var i = 0; i < d.length; i++) {
                        if (d[i].id == _this.state.item.id) {
                            d[i] = { id: idVal, name: nameVal };
                        }
                    }
                    _this.props.setListItems(d);
                },
                error: function (xhr, status, error) {
                }
            });
        };
        ClassroomsBox.prototype.doDelete = function () {
            var _this = this;
            $.ajax({
                type: 'POST',
                url: this.props.actionUrl + '/DeleteClassroom',
                data: JSON.stringify({ id: this.state.item.id }),
                contentType: 'application/json',
                beforeSend: function (xhr) { },
                success: function (r) {
                    _this.hide();
                    // remove from list
                    var d = _this.props.getListItems();
                    var _d = [];
                    for (var i = 0; i < d.length; i++) {
                        if (d[i].id != _this.state.item.id) {
                            _d.push(d[i]);
                        }
                    }
                    _this.props.setListItems(_d);
                },
                error: function (xhr, status, error) {
                }
            });
        };
        ClassroomsBox.prototype.renderForm = function () {
            var _this = this;
            return (React.createElement("form", {className: "form-horizontal", role: "form"}, React.createElement("div", {ref: "divId", className: "form-group"}, React.createElement("label", {className: "col-sm-2", for: "tbId"}, "Id: "), React.createElement("div", {className: "col-sm-10"}, React.createElement("input", {ref: "tbId", type: "text", className: "form-control", disabled: this.state.type != Admin.BoxTypes.Create, placeholder: "Classroom Id", maxLength: "25", onPaste: function () { return _this.validateId(false); }, onCut: function () { return _this.validateId(false); }, onKeyUp: function (e) { return _this.onKeyPressId(e); }}), React.createElement("span", {ref: "iconId", style: { display: 'none' }}))), React.createElement("div", {ref: "divName", className: "form-group"}, React.createElement("label", {className: "col-sm-2", for: "tbName"}, "Name: "), React.createElement("div", {className: "col-sm-10"}, React.createElement("input", {ref: "tbName", type: "text", className: "form-control", disabled: this.state.type == Admin.BoxTypes.Delete, placeholder: "Classroom name", maxLength: "150", onPaste: function () { return _this.validateName(false); }, onCut: function () { return _this.validateName(false); }, onKeyUp: function (e) { return _this.onKeyPressName(e); }}), React.createElement("span", {ref: "iconName", style: { display: 'none' }})))));
        };
        return ClassroomsBox;
    }(Admin.Box));
})(Admin || (Admin = {}));
//# sourceMappingURL=Classrooms.js.map


