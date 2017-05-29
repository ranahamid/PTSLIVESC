/* tslint:disable:max-line-length */
var VC;
(function (VC) {
    var Admin;
    (function (Admin) {
        "use strict";
        var Menu;
        (function (Menu) {
            Menu[Menu["Seats"] = 0] = "Seats";
            Menu[Menu["Students"] = 1] = "Students";
            Menu[Menu["Teachers"] = 2] = "Teachers";
            Menu[Menu["Featureds"] = 3] = "Featureds";
            Menu[Menu["Surveys"] = 4] = "Surveys";
            Menu[Menu["Polls"] = 5] = "Polls";
            Menu[Menu["Moderators"] = 6] = "Moderators";
        })(Menu || (Menu = {}));
        class Administration extends React.Component {
            constructor(props) {
                super(props);
            }
            render() {
                return (React.createElement("div", null, React.createElement(Admin.Lists.Classrooms, {actionUrl: this.props.actionUrl})));
            }
        }
        class Classrooms extends React.Component {
            constructor(props) {
                super(props);
            }
            tabOnClick(id) {
                this.tabs.selectItem(id);
                if (id === -2) {
                    // back to Home
                    top.location = "/";
                }
                else if (id === -1) {
                    // back to Classrooms
                    top.location = "/Admin/";
                }
                else {
                    // tabs
                    this.divSeats.style.display = "none";
                    this.divStudents.style.display = "none";
                    this.divTeachers.style.display = "none";
                    this.divFeatureds.style.display = "none";
                    this.divModerators.style.display = "none";
                    this.divSurveys.style.display = "none";
                    this.divPolls.style.display = "none";
                    switch (id) {
                        case Menu.Seats:
                            this.seats.init();
                            this.divSeats.style.display = "block";
                            break;
                        case Menu.Students:
                            this.students.init();
                            this.divStudents.style.display = "block";
                            break;
                        case Menu.Teachers:
                            this.teachers.init();
                            this.divTeachers.style.display = "block";
                            break;
                        case Menu.Featureds:
                            this.featureds.init();
                            this.divFeatureds.style.display = "block";
                            break;
                        case Menu.Moderators:
                            this.moderators.init();
                            this.divModerators.style.display = "block";
                            break;
                        case Menu.Surveys:
                            this.surveys.init();
                            this.divSurveys.style.display = "block";
                            break;
                        case Menu.Polls:
                            this.polls.init();
                            this.divPolls.style.display = "block";
                            break;
                    }
                }
            }
            componentDidMount() {
                // init active tab
                this.seats.init();
            }
            render() {
                let tabItems = [
                    { id: -2, title: "Home", onClick: this.tabOnClick.bind(this), active: false },
                    { id: -1, title: "Classrooms", onClick: this.tabOnClick.bind(this), active: false },
                    { id: Menu.Seats, title: "Seat computers", onClick: this.tabOnClick.bind(this), active: true },
                    { id: Menu.Students, title: "Student computers", onClick: this.tabOnClick.bind(this), active: false },
                    { id: Menu.Teachers, title: "Teacher computers", onClick: this.tabOnClick.bind(this), active: false },
                    { id: Menu.Featureds, title: "Featured computers", onClick: this.tabOnClick.bind(this), active: false },
                    { id: Menu.Moderators, title: "Moderator computers", onClick: this.tabOnClick.bind(this), active: false },
                    { id: Menu.Surveys, title: "Surveys", onClick: this.tabOnClick.bind(this), active: false },
                    { id: Menu.Polls, title: "Polls", onClick: this.tabOnClick.bind(this), active: false }
                ];
                return (React.createElement("div", null, React.createElement("div", null, React.createElement(VC.Global.Components.Tabs, {ref: (ref) => this.tabs = ref, items: tabItems, className: "cTabs"})), React.createElement("div", {ref: (ref) => this.divSeats = ref, style: { display: "block" }}, React.createElement(Admin.Lists.Seats, {ref: (ref) => this.seats = ref, actionUrl: this.props.actionUrl, classroomId: this.props.classroomId})), React.createElement("div", {ref: (ref) => this.divStudents = ref, style: { display: "none" }}, React.createElement(Admin.Lists.Students, {ref: (ref) => this.students = ref, actionUrl: this.props.actionUrl, classroomId: this.props.classroomId})), React.createElement("div", {ref: (ref) => this.divTeachers = ref, style: { display: "none" }}, React.createElement(Admin.Lists.Teachers, {ref: (ref) => this.teachers = ref, actionUrl: this.props.actionUrl, classroomId: this.props.classroomId})), React.createElement("div", {ref: (ref) => this.divFeatureds = ref, style: { display: "none" }}, React.createElement(Admin.Lists.Featureds, {ref: (ref) => this.featureds = ref, actionUrl: this.props.actionUrl, classroomId: this.props.classroomId})), React.createElement("div", {ref: (ref) => this.divModerators = ref, style: { display: "none" }}, React.createElement(Admin.Lists.Moderators, {ref: (ref) => this.moderators = ref, actionUrl: this.props.actionUrl, classroomId: this.props.classroomId})), React.createElement("div", {ref: (ref) => this.divSurveys = ref, style: { display: "none" }}, React.createElement(Admin.Lists.Surveys, {ref: (ref) => this.surveys = ref, actionUrl: this.props.actionUrl, classroomId: this.props.classroomId})), React.createElement("div", {ref: (ref) => this.divPolls = ref, style: { display: "none" }}, React.createElement(Admin.Lists.Polls, {ref: (ref) => this.polls = ref, actionUrl: this.props.actionUrl, classroomId: this.props.classroomId}))));
            }
        }
        class InitAdministration {
            constructor(targetId, actionUrl) {
                ReactDOM.render(React.createElement("div", null, React.createElement(Administration, {actionUrl: actionUrl})), document.getElementById(targetId));
            }
        }
        Admin.InitAdministration = InitAdministration;
        class InitClassrooms {
            constructor(targetId, classroomId, actionUrl) {
                ReactDOM.render(React.createElement("div", null, React.createElement(Classrooms, {classroomId: classroomId, actionUrl: actionUrl})), document.getElementById(targetId));
            }
        }
        Admin.InitClassrooms = InitClassrooms;
    })(Admin = VC.Admin || (VC.Admin = {}));
})(VC || (VC = {}));
//# sourceMappingURL=Administration.js.map