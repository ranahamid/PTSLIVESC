/* tslint:disable:max-line-length */
var VC;
(function (VC) {
    var App;
    (function (App) {
        var Components;
        (function (Components) {
            "use strict";
            (function (ListStatus) {
                ListStatus[ListStatus["Loading"] = 0] = "Loading";
                ListStatus[ListStatus["Success"] = 1] = "Success";
                ListStatus[ListStatus["Error"] = 2] = "Error";
            })(Components.ListStatus || (Components.ListStatus = {}));
            var ListStatus = Components.ListStatus;
            class SurveyList extends React.Component {
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
                openAnswers(id) {
                }
                sendSurvey(id) {
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
                    return (React.createElement("tr", {key: item.id}, React.createElement("td", null, item.title), React.createElement("td", null, item.answers), React.createElement("td", {style: { textAlign: "right" }}, React.createElement("button", {type: "button", className: "btn btn-xs btn-info", onClick: () => this.openAnswers(item.id)}, React.createElement("span", {className: "glyphicon glyphicon-eye-open"})), " ", React.createElement("button", {type: "button", className: "btn btn-xs btn-success", onClick: () => this.sendSurvey(item.id)}, React.createElement("span", {className: "glyphicon glyphicon-envelope"})))));
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
            Components.SurveyList = SurveyList;
            class InitSurveyList {
                constructor(targetId, actionUrl, classroomId) {
                    ReactDOM.render(React.createElement("div", null, React.createElement(SurveyList, {classroomId: classroomId})), document.getElementById(targetId));
                }
            }
            Components.InitSurveyList = InitSurveyList;
        })(Components = App.Components || (App.Components = {}));
    })(App = VC.App || (VC.App = {}));
})(VC || (VC = {}));
//# sourceMappingURL=SurveysList.js.map