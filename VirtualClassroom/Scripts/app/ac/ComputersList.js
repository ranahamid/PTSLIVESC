var VC;
(function (VC) {
    var App;
    (function (App) {
        var AC;
        (function (AC) {
            "use strict";
            class ComputersList extends React.Component {
                constructor(props) {
                    super(props);
                    this.state = { selectedRole: props.selectedRole, computers: props.computers };
                }
                changeRole(role) {
                    this.setState({ selectedRole: role, computers: this.state.computers });
                }
                addComputer(item) {
                    let c = this.state.computers;
                    c.push(item);
                    if (item.role === this.state.selectedRole) {
                        this.setState({ selectedRole: this.state.selectedRole, computers: c });
                    }
                    else {
                        this.state.computers = c;
                    }
                }
                removeComputer(uid) {
                    let removed = false;
                    let role = null;
                    let c = [];
                    this.state.computers.forEach((item) => {
                        if (item.uid !== uid) {
                            c.push(item);
                        }
                        else {
                            role = item.role;
                            removed = true;
                        }
                    });
                    if (role === this.state.selectedRole) {
                        this.setState({ selectedRole: this.state.selectedRole, computers: c });
                    }
                    else {
                        this.state.computers = c;
                    }
                    return removed;
                }
                updateComputerVolume(uid, volume) {
                    this.state.computers.forEach((item) => {
                        if (item.uid === uid) {
                            for (let i = 0; i < item.volume.length; i++) {
                                this.refs["RefVolumeBar_" + item.uid + "_" + i].resetVolume(80);
                            }
                            item.volume = volume;
                        }
                    });
                    this.setState(this.state);
                }
                updateComputerAvState(uid, audio, video) {
                    let c = [];
                    this.state.computers.forEach((item) => {
                        if (item.uid === uid) {
                            if (audio != null) {
                                item.audio = audio;
                            }
                            if (video != null) {
                                item.video = video;
                            }
                        }
                        c.push(item);
                    });
                    this.state.computers = c;
                }
                updateComputerVolumeState(uid, volume) {
                    let c = [];
                    this.state.computers.forEach((item) => {
                        if (item.uid === uid) {
                            for (let i = 0; i < volume.length; i++) {
                                if (volume[i] !== null) {
                                    item.volume[i] = volume[i];
                                }
                            }
                        }
                        c.push(item);
                    });
                    this.state.computers = c;
                }
                getButtonStatus(on) {
                    let switchButtonStatus = App.Components.SwitchButtonStatus.Hidden;
                    if (on != null) {
                        if (on) {
                            switchButtonStatus = App.Components.SwitchButtonStatus.Stop;
                        }
                        else {
                            switchButtonStatus = App.Components.SwitchButtonStatus.Start;
                        }
                    }
                    return switchButtonStatus;
                }
                changeVolume(uid, volume, index, vol) {
                    volume[index] = vol;
                    this.props.changeVolume(uid, volume);
                }
                renderNotFound() {
                    let notFoundText = "No @0 computer connected.";
                    switch (this.state.selectedRole) {
                        case App.Roles.PC:
                            notFoundText = notFoundText.replace("@0", "Student");
                            break;
                        case App.Roles.SC:
                            notFoundText = notFoundText.replace("@0", "Seat");
                            break;
                        case App.Roles.TC:
                            notFoundText = notFoundText.replace("@0", "Teacher");
                            break;
                        case App.Roles.FC:
                            notFoundText = notFoundText.replace("@0", "Featured");
                            break;
                    }
                    return (React.createElement("table", {className: "table", align: "center"}, React.createElement("tbody", null, React.createElement("tr", null, React.createElement("td", null, React.createElement("div", {className: "text-muted"}, notFoundText))))));
                }
                computerTitle(index) {
                    let name = "";
                    if (this.state.selectedRole === App.Roles.PC) {
                        if (index === 0) {
                            name = "Seat";
                        }
                        else if (index === 1) {
                            name = "Teacher";
                        }
                    }
                    else if (this.state.selectedRole === App.Roles.SC || this.state.selectedRole === App.Roles.FC) {
                        name = "Student #" + (index + 1);
                    }
                    return name;
                }
                renderComputer(item) {
                    return (React.createElement("tr", {key: "tr_" + item.uid}, React.createElement("td", null, React.createElement("div", null, React.createElement("span", {className: "glyphicon glyphicon-link", style: { color: "green" }}), " ", item.name)), React.createElement("td", null, item.volume.map((v, index) => {
                        return (React.createElement(App.Components.Volume, {ref: "RefVolumeBar_" + item.uid + "_" + index, title: this.computerTitle(index), volume: v != null ? v : 0, display: v != null, onVolumeChanged: (vol) => this.changeVolume(item.uid, item.volume, index, vol)}));
                    })), React.createElement("td", {style: { textAlign: "right" }}, React.createElement("div", {className: "cListButton"}, React.createElement("button", {type: "button", className: "btn btn-xs btn-warning", onClick: () => this.props.turnOff(item.uid)}, React.createElement("span", {className: "glyphicon glyphicon-off"}))), React.createElement("div", {className: "cListButton", style: { display: "none" }}, React.createElement("button", {type: "button", className: "btn btn-xs btn-default", disabled: "true"}, React.createElement("span", {className: "glyphicon glyphicon-record"}))), React.createElement("div", {className: "cListButton", style: { display: (this.state.selectedRole === App.Roles.FC ? "none" : "block") }}, React.createElement(App.Components.SwitchButton, {textOn: "", textOff: "", classOn: "btn btn-xs btn-danger", classOff: "btn btn-xs btn-success", iconOn: "glyphicon glyphicon-facetime-video", iconOff: "glyphicon glyphicon-facetime-video", status: this.getButtonStatus(item.video), onOn: () => this.props.turnAv(item.uid, null, true), onOff: () => this.props.turnAv(item.uid, null, false), className: ""})), React.createElement("div", {className: "cListButton", style: { display: (this.state.selectedRole === App.Roles.FC ? "none" : "block") }}, React.createElement(App.Components.SwitchButton, {textOn: "", textOff: "", classOn: "btn btn-xs btn-danger", classOff: "btn btn-xs btn-success", iconOn: "glyphicon glyphicon-music", iconOff: "glyphicon glyphicon-music", status: this.getButtonStatus(item.audio), onOn: () => this.props.turnAv(item.uid, true, null), onOff: () => this.props.turnAv(item.uid, false, null), className: ""})), React.createElement("div", {className: "cListButton", style: { display: (this.state.selectedRole === App.Roles.FC ? "block" : "none") }}, React.createElement("button", {type: "button", className: "btn btn-xs btn-info", onClick: () => this.props.featuredComputerClick(item.uid, item.name)}, React.createElement("span", {className: "glyphicon glyphicon-th"}))))));
                }
                renderComputers() {
                    let items = [];
                    this.state.computers.forEach((item) => {
                        if (item.role === this.state.selectedRole) {
                            items.push(this.renderComputer(item));
                        }
                    });
                    if (items.length > 0) {
                        if (this.state.selectedRole === App.Roles.PC) {
                            return (React.createElement("table", {className: "table", align: "center"}, React.createElement("thead", null, React.createElement("tr", null, React.createElement("th", {style: { width: "50%" }}, "Student computer"), React.createElement("th", null, "Volume"), React.createElement("th", null))), React.createElement("tbody", null, items)));
                        }
                        else if (this.state.selectedRole === App.Roles.SC) {
                            return (React.createElement("table", {className: "table", align: "center"}, React.createElement("thead", null, React.createElement("tr", null, React.createElement("th", {style: { width: "50%" }}, "Seat computer"), React.createElement("th", null, "Volume"), React.createElement("th", null))), React.createElement("tbody", null, items)));
                        }
                        else if (this.state.selectedRole === App.Roles.FC) {
                            return (React.createElement("table", {className: "table", align: "center"}, React.createElement("thead", null, React.createElement("tr", null, React.createElement("th", {style: { width: "50%" }}, "Featured computer"), React.createElement("th", null, "Volume"), React.createElement("th", null))), React.createElement("tbody", null, items)));
                        }
                        else {
                            return (React.createElement("table", {className: "table", align: "center"}, React.createElement("thead", null, React.createElement("tr", null, React.createElement("th", {style: { width: "50%" }}, "Teacher computer"), React.createElement("th", null))), React.createElement("tbody", null, items)));
                        }
                    }
                    else {
                        return this.renderNotFound();
                    }
                }
                render() {
                    return (React.createElement("div", null, this.renderComputers()));
                }
            }
            AC.ComputersList = ComputersList;
        })(AC = App.AC || (App.AC = {}));
    })(App = VC.App || (VC.App = {}));
})(VC || (VC = {}));
//# sourceMappingURL=ComputersList.js.map