/* tslint:disable:max-line-length */
var VC;
(function (VC) {
    var App;
    (function (App) {
        "use strict";
        class AC extends App.XC {
            constructor(props) {
                super(props, App.Roles.AC);
            }
            didMount() {
                // nothing to do
            }
            // abstract methods
            setStatusText(text, style) {
                this.setStatusVisibility(true);
                this.status.setText(text, style);
            }
            connected(connection) {
                let tokenData = App.Global.Fce.toTokenData(connection.data);
                if (this.dataResponse.Uid === tokenData.Uid) {
                    // me
                    this.setStatusVisibility(false);
                    this.setUiVisibility(true);
                }
            }
            disconnected(connection) {
                let tokenData = App.Global.Fce.toTokenData(connection.data);
                if (this.dataResponse.Uid === tokenData.Uid) {
                    // me
                    this.setUiVisibility(false);
                    this.setStatusText("Disconnected from the session.", App.Components.StatusStyle.Error);
                }
                else {
                    if (this.computersList.removeComputer(tokenData.Uid)) {
                        this.tabs.decreaseBadge(tokenData.Role);
                    }
                }
            }
            sessionConnected(event) {
                // nothing to do
            }
            sessionDisconnected(event) {
                this.setUiVisibility(false);
                this.setStatusVisibility(true);
            }
            streamCreated(connection, stream) {
                // nothing to do
            }
            streamDestroyed(connection, stream) {
                // nothing to do
            }
            streamPropertyChanged(event) {
                // nothing to do
            }
            signalReceived(event) {
                let signalType = App.Global.Signaling.getSignalType(event.type);
                switch (signalType) {
                    case App.Global.SignalTypes.Connected:
                        this.connectedSignalReceived(event);
                        break;
                    case App.Global.SignalTypes.RaiseHand:
                        this.raiseHandSignalReceived(event);
                        break;
                    case App.Global.SignalTypes.TurnAv:
                        this.turnAvSignalReceived(event);
                        break;
                }
            }
            connectedSignalReceived(event) {
                let tokenData = App.Global.Fce.toTokenData(event.from.data);
                let data = JSON.parse(event.data);
                this.computersList.addComputer({
                    uid: tokenData.Uid,
                    id: tokenData.Id,
                    name: tokenData.Name,
                    address: tokenData.Address,
                    role: tokenData.Role,
                    audio: data.audio,
                    video: data.video,
                    volume: data.volume,
                    handRaised: data.handRaised
                });
                this.tabs.increaseBadge(tokenData.Role);
            }
            raiseHandSignalReceived(event) {
                let tokenData = App.Global.Fce.toTokenData(event.from.data);
                let data = JSON.parse(event.data);
                if (tokenData.Role === App.Roles.AC) {
                    // all
                    this.computersList.updateAllPcRaiseHandState(data.raised);
                }
                else {
                    // single PC
                    this.computersList.updateComputerRaiseHandState(tokenData.Uid, data.raised);
                }
            }
            turnAvSignalReceived(event) {
                let tokenData = App.Global.Fce.toTokenData(event.from.data);
                let data = JSON.parse(event.data);
                this.computersList.updateComputerAvState(tokenData.Uid, data.audio, data.video);
            }
            setStatusVisibility(visible) {
                this.divStatus.style.display = visible ? "block" : "none";
            }
            setUiVisibility(visible) {
                this.divUI.style.display = visible ? "block" : "none";
            }
            tabOnClick(id) {
                this.tabs.selectItem(id);
                this.computersList.changeRole(id);
            }
            ;
            turnAv(uid, audio, video) {
                let connection = this.getConnectionByUid(uid);
                let role = App.Global.Fce.toTokenData(connection.data).Role;
                $.ajax({
                    cache: false,
                    type: "POST",
                    url: this.props.actionUrl + "/TurnAv" + App.Global.Fce.roleAsString(role),
                    data: JSON.stringify({ uid: uid, audio: audio, video: video }),
                    contentType: "application/json",
                    success: (r) => {
                        // send signal
                        App.Global.Signaling.sendSignal(this.session, connection, App.Global.SignalTypes.TurnAv, { audio: audio, video: video });
                        this.computersList.updateComputerAvState(uid, audio, video);
                    },
                    error: (xhr, status, error) => {
                        // error
                        alert("ERROR: " + error);
                    }
                });
            }
            turnAvAll(role, audio, video) {
                $.ajax({
                    cache: false,
                    type: "POST",
                    url: this.props.actionUrl + "/TurnAvAll" + App.Global.Fce.roleAsString(role),
                    data: JSON.stringify({ audio: audio, video: video }),
                    contentType: "application/json",
                    success: (r) => {
                        // send signal
                        App.Global.Signaling.sendSignalAll(this.session, App.Global.SignalTypes.TurnAv, { role: role, audio: audio, video: video });
                        this.computersList.updateComputerAvAllState(role, audio, video);
                    },
                    error: (xhr, status, error) => {
                        // error
                        alert("ERROR: " + error);
                    }
                });
            }
            turnOff(uid) {
                let connection = this.getConnectionByUid(uid);
                // send signal
                App.Global.Signaling.sendSignal(this.session, connection, App.Global.SignalTypes.TurnOff, {});
            }
            turnOffAll(role) {
                // send signal
                App.Global.Signaling.sendSignalAll(this.session, App.Global.SignalTypes.TurnOff, { role: role });
            }
            raiseHandAll(up) {
                // send signal
                App.Global.Signaling.sendSignalAll(this.session, App.Global.SignalTypes.RaiseHand, { raised: up });
            }
            changeVolume(uid, volume) {
                let connection = this.getConnectionByUid(uid);
                let role = App.Global.Fce.toTokenData(connection.data).Role;
                $.ajax({
                    cache: false,
                    type: "POST",
                    url: this.props.actionUrl + "/Volume" + App.Global.Fce.roleAsString(role),
                    data: JSON.stringify({ uid: uid, volume: volume }),
                    contentType: "application/json",
                    success: (r) => {
                        // send signal
                        App.Global.Signaling.sendSignal(this.session, connection, App.Global.SignalTypes.Volume, { volume: volume });
                        this.computersList.updateComputerVolumeState(uid, volume);
                    },
                    error: (xhr, status, error) => {
                        // error
                        alert("ERROR: " + error);
                    }
                });
            }
            featuredComputerClick(uid, name) {
                this.featuredBox.open(uid, name);
            }
            onFeaturedUpdated(uid, students) {
                // send signal to FC
                let connection = this.getConnectionByUid(uid);
                App.Global.Signaling.sendSignal(this.session, connection, App.Global.SignalTypes.FeaturedChanged, {});
            }
            render() {
                let computers = [];
                let badgeSC = 0;
                let badgePC = 0;
                let badgeTC = 0;
                let badgeFC = 0;
                this.connections.forEach((item) => {
                    let d = App.Global.Fce.toTokenData(item.data);
                    computers.push({ uid: d.Uid, name: d.Name, role: d.Role });
                    switch (d.Role) {
                        case App.Roles.PC:
                            badgePC++;
                            break;
                        case App.Roles.SC:
                            badgeSC++;
                            break;
                        case App.Roles.TC:
                            badgeTC++;
                            break;
                        case App.Roles.FC:
                            badgeFC++;
                            break;
                    }
                });
                let tabItems = [
                    { id: App.Roles.SC, title: "Seat computers", onClick: this.tabOnClick.bind(this), badge: badgeSC, active: true },
                    { id: App.Roles.PC, title: "Student computers", onClick: this.tabOnClick.bind(this), badge: badgePC, active: false },
                    { id: App.Roles.TC, title: "Teacher computers", onClick: this.tabOnClick.bind(this), badge: badgeTC, active: false },
                    { id: App.Roles.FC, title: "Featured computers", onClick: this.tabOnClick.bind(this), badge: badgeFC, active: false }
                ];
                let statusClasses = [
                    "alert alert-warning",
                    "alert alert-success",
                    "alert alert-danger" // error
                ];
                return (React.createElement("div", {className: "acContainer"}, React.createElement("div", {ref: (ref) => this.divStatus = ref}, React.createElement(App.Components.Status, {ref: (ref) => this.status = ref, text: "Connecting ...", style: App.Components.StatusStyle.Connecting, className: "cStatus", statusClasses: statusClasses})), React.createElement("div", {ref: (ref) => this.divUI = ref, style: { display: "none" }}, React.createElement("div", {className: "labelContainer"}, React.createElement("h3", null, "Connected computers: ")), React.createElement(VC.Global.Components.Tabs, {ref: (ref) => this.tabs = ref, items: tabItems, className: "cTabs"}), React.createElement(VC.App.AC.ComputersList, {ref: (ref) => this.computersList = ref, selectedRole: App.Roles.SC, computers: computers, turnAv: (uid, audio, video) => this.turnAv(uid, audio, video), turnAvAll: (role, audio, video) => this.turnAvAll(role, audio, video), turnOff: (uid) => this.turnOff(uid), turnOffAll: (role) => this.turnOffAll(role), raiseHandAll: (up) => this.raiseHandAll(up), changeVolume: (uid, volume) => this.changeVolume(uid, volume), featuredComputerClick: (uid, name) => this.featuredComputerClick(uid, name)}), React.createElement(VC.App.AC.FeaturedBox, {ref: (ref) => this.featuredBox = ref, classroomId: this.props.classroomId, onFeaturedUpdated: (uid, students) => this.onFeaturedUpdated(uid, students)}))));
            }
        }
        class InitAC {
            constructor(targetId, classroomId, actionUrl) {
                ReactDOM.render(React.createElement("div", null, React.createElement(AC, {targetId: targetId, classroomId: classroomId, actionUrl: actionUrl})), document.getElementById(targetId));
            }
        }
        App.InitAC = InitAC;
    })(App = VC.App || (VC.App = {}));
})(VC || (VC = {}));
//# sourceMappingURL=AC.js.map