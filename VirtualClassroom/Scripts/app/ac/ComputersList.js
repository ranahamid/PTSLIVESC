/* tslint:disable:max-line-length */
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
                    // sort alphabeticaly
                    c = c.sort(function (a, b) { return (a.name > b.name) ? 1 : -1; });
                    if (item.role === this.state.selectedRole) {
                        // update state and render
                        this.setState({ selectedRole: this.state.selectedRole, computers: c });
                    }
                    else {
                        // just update state
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
                        // update state and render
                        this.setState({ selectedRole: this.state.selectedRole, computers: c });
                    }
                    else {
                        // just update state
                        this.state.computers = c;
                    }
                    return removed;
                }
                updateComputerAvState(uid, audio, video) {
                    let c = [];
                    this.state.computers.forEach((item) => {
                        if (item.uid === uid) {
                            if (audio !== null) {
                                item.audio = audio;
                            }
                            if (video !== null) {
                                item.video = video;
                            }
                        }
                        c.push(item);
                    });
                    // refresh
                    this.setState({ computers: [] }, () => {
                        this.setState({ computers: c });
                    });
                }
                updateComputerAvAllState(role, audio, video) {
                    let c = this.state.computers;
                    c.forEach((item) => {
                        if (item.role === role) {
                            if (audio !== null) {
                                item.audio = audio;
                            }
                            if (video !== null) {
                                item.video = video;
                            }
                        }
                    });
                    // refresh
                    this.setState({ computers: [] }, () => {
                        this.setState({ computers: c });
                    });
                }
                updateComputerVolumeState(uid, volume) {
                    let c = [];
                    this.state.computers.forEach((item) => {
                        if (item.uid === uid) {
                            item.volume = volume;
                        }
                        c.push(item);
                    });
                    // just update state
                    this.state.computers = c;
                }
                updateComputerRaiseHandState(uid, handRaised) {
                    this.state.computers.forEach((item) => {
                        if (item.uid === uid) {
                            // set raise hand
                            item.handRaised = handRaised;
                        }
                    });
                    this.setState(this.state);
                }
                updateAllPcRaiseHandState(handRaised) {
                    this.state.computers.forEach((item) => {
                        if (item.role === App.Roles.PC) {
                            // set raise hand
                            item.handRaised = handRaised;
                        }
                    });
                    this.setState(this.state);
                }
                hasRaisedHand(id) {
                    let handRaised = false;
                    this.state.computers.forEach((item) => {
                        if (item.role === App.Roles.PC && item.id === id) {
                            if (item.handRaised !== undefined && item.handRaised) {
                                handRaised = true;
                            }
                        }
                    });
                    return handRaised;
                }
                getButtonStatus(on) {
                    let switchButtonStatus = App.Components.SwitchButtonStatus.Hidden;
                    if (on !== null) {
                        if (on) {
                            switchButtonStatus = App.Components.SwitchButtonStatus.Stop;
                        }
                        else {
                            switchButtonStatus = App.Components.SwitchButtonStatus.Start;
                        }
                    }
                    return switchButtonStatus;
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
                        case App.Roles.Moderator:
                            notFoundText = notFoundText.replace("@0", "Moderator");
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
                    let isHandRaise = false;
                    isHandRaise = !item.handRaised;
                    return (React.createElement("tr", {key: "tr_" + item.uid}, React.createElement("td", null, React.createElement("div", null, React.createElement("span", {className: "glyphicon glyphicon-link", style: { color: "green" }}), " ", React.createElement("span", {className: (item.handRaised ? "glyphicon glyphicon-hand-up" : "glyphicon glyphicon-hand-down"), style: { color: (item.handRaised ? "red" : "gray"), display: (this.state.selectedRole === App.Roles.PC ? "inline-block" : "none") }}), " ", item.name)), React.createElement("td", {style: { display: (this.state.selectedRole === App.Roles.PC || this.state.selectedRole === App.Roles.Moderator || this.state.selectedRole === App.Roles.ModeratorWarning || this.state.selectedRole === App.Roles.TC ? "block" : "none") }}, React.createElement(App.Components.Volume, {ref: "RefVolumeBar_" + item.uid, volume: item.video !== undefined ? item.volume : 0, display: item.video !== undefined, onVolumeChanged: (vol) => this.props.changeVolume(item.uid, vol)})), React.createElement("td", {style: { display: (this.state.selectedRole == App.Roles.PC ? "run-in" : "none") }}, React.createElement("div", null, React.createElement("button", {type: "button", className: (item.handRaised ? "btn btn-xs btn-danger" : "btn btn-xs btn-success"), onClick: () => { this.props.raiseHandSingle(item.uid, isHandRaise); }}, React.createElement("div", {style: { display: (item.handRaised ? "block" : "none") }}, "  ", React.createElement("span", {className: "glyphicon glyphicon-hand-down"}), " Hands Down "), React.createElement("div", {style: { display: (!item.handRaised ? "block" : "none") }}, "  ", React.createElement("span", {className: "glyphicon glyphicon-hand-up"}), " Hands Up ")))), React.createElement("td", {style: { textAlign: "right" }}, React.createElement("div", {className: "cListButton"}, React.createElement("button", {type: "button", className: "btn btn-xs btn-warning", onClick: () => this.props.turnOff(item.uid)}, React.createElement("span", {className: "glyphicon glyphicon-off"}))), React.createElement("div", {className: "cListButton", style: { display: "none" }}, React.createElement("button", {type: "button", className: "btn btn-xs btn-default", disabled: "true"}, React.createElement("span", {className: "glyphicon glyphicon-record"}))), React.createElement("div", {className: "cListButton", style: { display: (this.state.selectedRole === App.Roles.FC || this.state.selectedRole === App.Roles.SC ? "none" : "block") }}, React.createElement(App.Components.SwitchButton, {textOn: "", textOff: "", classOn: "btn btn-xs btn-danger", classOff: "btn btn-xs btn-success", iconOn: "glyphicon glyphicon-facetime-video", iconOff: "glyphicon glyphicon-facetime-video", status: this.getButtonStatus(item.video), onOn: () => this.props.turnAv(item.uid, null, true), onOff: () => this.props.turnAv(item.uid, null, false), className: ""})), React.createElement("div", {className: "cListButton", style: { display: (this.state.selectedRole === App.Roles.FC || this.state.selectedRole === App.Roles.SC ? "none" : "block") }}, React.createElement(App.Components.SwitchButton, {textOn: "", textOff: "", classOn: "btn btn-xs btn-danger", classOff: "btn btn-xs btn-success", iconOn: "glyphicon glyphicon-music", iconOff: "glyphicon glyphicon-music", status: this.getButtonStatus(item.audio), onOn: () => this.props.turnAv(item.uid, true, null), onOff: () => this.props.turnAv(item.uid, false, null), className: ""})), React.createElement("div", {className: "cListButton", style: { display: (this.state.selectedRole === App.Roles.FC ? "block" : "none") }}, React.createElement("button", {type: "button", className: "btn btn-xs btn-info", onClick: () => this.props.featuredComputerClick(item.uid, item.name)}, React.createElement("span", {className: "glyphicon glyphicon-th"}))))));
                }
                renderComputerAllButtons(role) {
                    let audioOn = false;
                    for (let i = 0; i < this.state.computers.length; i++) {
                        if (this.state.computers[i].role === role && this.state.computers[i].audio) {
                            audioOn = true;
                            i = this.state.computers.length;
                        }
                    }
                    let videoOn = false;
                    for (let i = 0; i < this.state.computers.length; i++) {
                        if (this.state.computers[i].role === role && this.state.computers[i].video) {
                            videoOn = true;
                            i = this.state.computers.length;
                        }
                    }
                    return (React.createElement("div", null, React.createElement("div", {className: "cListButton", style: { display: (this.state.computers.length === 0 ? "none" : "block") }}, React.createElement("button", {type: "button", className: "btn btn-xs btn-warning", onClick: () => this.props.turnOffAll(role)}, React.createElement("span", {className: "glyphicon glyphicon-off"}), " ALL")), React.createElement("div", {key: "ButtonVideoAll_" + role, className: "cListButton", style: { display: (this.state.computers.length === 0 || role === App.Roles.FC || role === App.Roles.SC ? "none" : "block") }}, React.createElement("div", {style: { display: "none" }}, React.createElement(App.Components.SwitchButton, {textOn: "ALL", textOff: "ALL", classOn: "btn btn-xs btn-danger", classOff: "btn btn-xs btn-success", iconOn: "glyphicon glyphicon-facetime-video", iconOff: "glyphicon glyphicon-facetime-video", status: (videoOn ? App.Components.SwitchButtonStatus.Stop : App.Components.SwitchButtonStatus.Start), onOn: () => this.props.turnAvAll(role, null, true), onOff: () => this.props.turnAvAll(role, null, false), className: ""}))), React.createElement("div", {key: "ButtonAudioAll_" + role, className: "cListButton", style: { display: (this.state.computers.length === 0 || role === App.Roles.FC || role === App.Roles.SC ? "none" : "block") }}, React.createElement("div", {style: { display: "none" }}, React.createElement(App.Components.SwitchButton, {textOn: "ALL", textOff: "ALL", classOn: "btn btn-xs btn-danger", classOff: "btn btn-xs btn-success", iconOn: "glyphicon glyphicon-music", iconOff: "glyphicon glyphicon-music", status: (audioOn ? App.Components.SwitchButtonStatus.Stop : App.Components.SwitchButtonStatus.Start), onOn: () => this.props.turnAvAll(role, true, null), onOff: () => this.props.turnAvAll(role, false, null), className: ""})), React.createElement("button", {type: "button", className: "btn btn-xs btn-danger", onClick: () => { this.props.turnAvAll(role, false, null); }}, React.createElement("span", {className: "glyphicon glyphicon-music"}), " Mute ALL")), React.createElement("div", {key: "ButtonHandsAll_" + role, className: "cListButton", style: { display: (this.state.computers.length === 0 || role !== App.Roles.PC ? "none" : "block") }}, React.createElement("button", {type: "button", className: "btn btn-xs btn-danger", onClick: () => { this.props.raiseHandAll(false); }}, React.createElement("span", {className: "glyphicon glyphicon-hand-down"}), " ALL Hands Down"))));
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
                            return (React.createElement("table", {className: "table", align: "center"}, React.createElement("thead", null, React.createElement("tr", null, React.createElement("th", {style: { width: "30%" }}, "Student computer"), React.createElement("th", {style: { width: "25%" }}, "Volume"), React.createElement("th", {style: { width: "15%" }}, "Hands"), React.createElement("th", {style: { width: "30%" }}, this.renderComputerAllButtons(this.state.selectedRole)))), React.createElement("tbody", null, items)));
                        }
                        else if (this.state.selectedRole === App.Roles.SC) {
                            return (React.createElement("table", {className: "table", align: "center"}, React.createElement("thead", null, React.createElement("tr", null, React.createElement("th", {style: { width: "50%" }}, "Seat computer"), React.createElement("th", null, this.renderComputerAllButtons(this.state.selectedRole)))), React.createElement("tbody", null, items)));
                        }
                        else if (this.state.selectedRole === App.Roles.FC) {
                            return (React.createElement("table", {className: "table", align: "center"}, React.createElement("thead", null, React.createElement("tr", null, React.createElement("th", {style: { width: "50%" }}, "Featured computer"), React.createElement("th", null, this.renderComputerAllButtons(this.state.selectedRole)))), React.createElement("tbody", null, items)));
                        }
                        else {
                            return (React.createElement("table", {className: "table", align: "center"}, React.createElement("thead", null, React.createElement("tr", null, React.createElement("th", {style: { width: "50%" }}, "Teacher computer"), React.createElement("th", null, "Volume"), React.createElement("th", null, this.renderComputerAllButtons(this.state.selectedRole)))), React.createElement("tbody", null, items)));
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