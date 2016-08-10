var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Admin;
(function (Admin) {
    var Seats = (function (_super) {
        __extends(Seats, _super);
        function Seats() {
            _super.apply(this, arguments);
        }
        Seats.prototype.getList = function () {
            return this.refs['List1'];
        };
        Seats.prototype.getBox = function () {
            return this.refs['Box1'];
        };
        Seats.prototype.componentDidMount = function () {
            var list1 = this.getList();
            list1.init();
        };
        Seats.prototype.render = function () {
            return (React.createElement("div", null, React.createElement(SeatsList, {ref: "List1", title: "Seat computer", actionUrl: this.props.actionUrl, loadAction: "LoadSeats/?classRoomId=" + this.props.classRoomId, showBoxNew: this.showBoxNew.bind(this), showBoxEdit: this.showBoxEdit.bind(this), showBoxDelete: this.showBoxDelete.bind(this)}), React.createElement(SeatsBox, {ref: "Box1", title: "Seat computer", actionUrl: this.props.actionUrl, getListItems: this.getListItems.bind(this), setListItems: this.setListItems.bind(this)})));
        };
        return Seats;
    }(Admin.Base));
    Admin.Seats = Seats;
    var SeatsList = (function (_super) {
        __extends(SeatsList, _super);
        function SeatsList() {
            _super.apply(this, arguments);
        }
        SeatsList.prototype.renderItemCols = function (d) {
            var l = [];
            l.push(React.createElement("td", null, d.id));
            l.push(React.createElement("td", null, d.name));
            return l;
        };
        SeatsList.prototype.renderTableHeaderCols = function () {
            var l = [];
            l.push(React.createElement("th", null, "ID"));
            l.push(React.createElement("th", null, "Seat computer"));
            return l;
        };
        return SeatsList;
    }(Admin.List));
    var SeatsBox = (function (_super) {
        __extends(SeatsBox, _super);
        function SeatsBox(props) {
            _super.call(this, { id: '', name: '' }, props);
        }
        SeatsBox.prototype.onBoxWillShow = function () {
        };
        SeatsBox.prototype.onBoxDidShow = function () {
        };
        SeatsBox.prototype.submitForm = function () {
            this.hide();
        };
        SeatsBox.prototype.renderForm = function () {
            return (React.createElement("form", {className: "form-horizontal", role: "form"}, React.createElement("div", {ref: "divId", className: "form-group"}, React.createElement("label", {className: "col-sm-2", for: "tbId"}, "Id: "), React.createElement("div", {className: "col-sm-10"}, "XXX")), React.createElement("div", {ref: "divName", className: "form-group"}, React.createElement("label", {className: "col-sm-2", for: "tbName"}, "Name: "), React.createElement("div", {className: "col-sm-10"}, "XXX"))));
        };
        return SeatsBox;
    }(Admin.Box));
})(Admin || (Admin = {}));
//# sourceMappingURL=Seats.js.map