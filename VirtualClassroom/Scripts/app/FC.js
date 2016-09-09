var VC;
(function (VC) {
    var App;
    (function (App) {
        "use strict";
        class FC extends App.XC {
            constructor(props) {
                super(props, App.Roles.FC);
                this.boxSubscribers = new Array(8);
                this.label = new Array(8);
            }
            setStatusText(text, style) {
                this.setStatusVisibility(true);
                this.status.setText(text, style);
            }
            didMount() {
                $(window).resize(() => window.setTimeout(() => this.fitLayout(), 0));
            }
            connected(connection) {
                let tokenData = App.Global.Fce.toTokenData(connection.data);
                if (this.dataResponse.Uid === tokenData.Uid) {
                    this.setState({ layout: this.dataResponse.ComputerSetting.Layout });
                    this.setStatusVisibility(false);
                    this.setUiVisibility(true);
                }
                else if (this.isInMyGroup(tokenData.Uid)) {
                    if (tokenData.Role === App.Roles.PC) {
                        let groupComputer = this.getGroupComputer(tokenData.Uid);
                        this.label[groupComputer.Position - 1].setText(tokenData.Name + " connected.", App.Components.BoxLabelStyle.Connected);
                    }
                }
                else if (tokenData.Role === App.Roles.AC) {
                    App.Global.Signaling.sendSignal(this.session, this.getAcConnection(), App.Global.SignalTypes.Connected, {
                        audio: this.dataResponse.ComputerSetting.Audio,
                        video: this.dataResponse.ComputerSetting.Video,
                        volume: this.dataResponse.ComputerSetting.Volume
                    });
                }
            }
            disconnected(connection) {
                let tokenData = App.Global.Fce.toTokenData(connection.data);
                if (this.dataResponse.Uid === tokenData.Uid) {
                    this.setUiVisibility(false);
                    this.setStatusText("Disconnected from the session.", App.Components.StatusStyle.Error);
                }
                else if (this.isInMyGroup(tokenData.Uid)) {
                    if (tokenData.Role === App.Roles.PC) {
                        let groupComputer = this.getGroupComputer(tokenData.Uid);
                        this.label[groupComputer.Position - 1].setText("Student PC not connected.", App.Components.BoxLabelStyle.NotConnected);
                    }
                }
            }
            sessionConnected(event) {
            }
            sessionDisconnected(event) {
                this.setUiVisibility(false);
                this.setStatusVisibility(true);
            }
            streamCreated(connection, stream) {
                let tokenData = App.Global.Fce.toTokenData(connection.data);
                if (this.dataResponse.Uid === tokenData.Uid) {
                }
                else if (this.isInMyGroup(tokenData.Uid)) {
                    let groupComputer = this.getGroupComputer(tokenData.Uid);
                    this.boxSubscribers[groupComputer.Position - 1].subscribe(this.session, stream, this.dataResponse.ComputerSetting.Volume[groupComputer.Position - 1]);
                }
            }
            streamDestroyed(connection, stream) {
                let tokenData = App.Global.Fce.toTokenData(connection.data);
                if (this.dataResponse.Uid === tokenData.Uid) {
                }
                else if (this.isInMyGroup(tokenData.Uid)) {
                    let groupComputer = this.getGroupComputer(tokenData.Uid);
                    this.boxSubscribers[groupComputer.Position - 1].unsubscribe(this.session);
                }
            }
            streamPropertyChanged(event) {
            }
            signalReceived(event) {
                let signalType = App.Global.Signaling.getSignalType(event.type);
                switch (signalType) {
                    case App.Global.SignalTypes.Volume:
                        this.volumeSignalReceived(event);
                        break;
                    case App.Global.SignalTypes.TurnOff:
                        this.turnOffSignalReceived(event);
                        break;
                    case App.Global.SignalTypes.FeaturedChanged:
                        this.featuredChanged(event);
                        break;
                }
            }
            volumeSignalReceived(event) {
                let data = JSON.parse(event.data);
                for (let i = 0; i < data.volume.length; i++) {
                    if (data.volume[i] != null) {
                        this.dataResponse.ComputerSetting.Volume[i] = data.volume[i];
                        this.boxSubscribers[i].audioVolume(data.volume[i]);
                    }
                }
            }
            turnOffSignalReceived(event) {
                this.disconnect();
            }
            featuredChanged(event) {
                $.ajax({
                    cache: false,
                    type: "GET",
                    url: this.props.actionUrl + "/GetData",
                    success: (r) => {
                        if (r.status === VC.Global.Data.RESPONSE_SUCCESS) {
                            this.featuredStudentsChanged(r.data);
                        }
                        else {
                            alert(r.message);
                        }
                    },
                    error: (xhr, status, error) => {
                        alert("XHR Error: " + xhr.statusText);
                    }
                });
            }
            featuredStudentsChanged(data) {
                for (let i = 0; i < this.state.layout; i++) {
                    if (this.boxSubscribers[i].isConnected()) {
                        let newStudent = this.getGroupStudentComputerByPosition(i + 1, data);
                        let currentStudent = this.getGroupStudentComputerByPosition(i + 1, this.dataResponse);
                        if (!this.compareGroupComputers(newStudent, currentStudent)) {
                            this.boxSubscribers[i].unsubscribe(this.session);
                            this.label[i].setText("Student PC not connected.", App.Components.BoxLabelStyle.NotConnected);
                        }
                        else {
                            this.boxSubscribers[i].audioVolume(80);
                        }
                    }
                }
                if (this.dataResponse.ComputerSetting.Layout !== data.ComputerSetting.Layout) {
                    this.setState({ layout: data.ComputerSetting.Layout }, () => {
                        this.fitLayout();
                    });
                }
                for (let i = 0; i < this.state.layout; i++) {
                    if (!this.boxSubscribers[i].isConnected()) {
                        let newStudent = this.getGroupStudentComputerByPosition(i + 1, data);
                        if (newStudent !== null) {
                            let stream = this.getStream(newStudent.Uid);
                            if (stream !== null) {
                                this.boxSubscribers[i].subscribe(this.session, stream, data.ComputerSetting.Volume[i]);
                                let newStudentConnection = this.getConnectionByUid(newStudent.Uid);
                                let tokenData = App.Global.Fce.toTokenData(newStudentConnection.data);
                                this.label[i].setText(tokenData.Name + " connected.", App.Components.BoxLabelStyle.Connected);
                            }
                        }
                    }
                }
                this.dataResponse = data;
            }
            compareGroupComputers(c1, c2) {
                let isEqual = false;
                if (c1 === null && c2 === null) {
                    isEqual = true;
                }
                else if (c1 !== null && c2 !== null) {
                    isEqual = (c1.Uid === c2.Uid);
                }
                return isEqual;
            }
            getGroupStudentComputerByPosition(position, data) {
                let iUser = null;
                for (let i = 0; i < data.Group.length && iUser === null; i++) {
                    if (data.Group[i].Role === VC.App.Roles.PC && data.Group[i].Position === position) {
                        iUser = data.Group[i];
                    }
                }
                return iUser;
            }
            setStatusVisibility(visible) {
                this.divStatus.style.display = visible ? "block" : "none";
            }
            setLayoutVisibility(visible) {
                let divBody1 = document.getElementById("DivBody1");
                divBody1.className = visible ? "divBody" : "";
                let header1 = document.getElementById("Header1");
                header1.style.display = visible ? "block" : "none";
                let footer1 = document.getElementById("Footer1");
                footer1.style.display = visible ? "block" : "none";
            }
            setUiVisibility(visible) {
                this.setLayoutVisibility(!visible);
                this.divUI.style.display = visible ? "block" : "none";
                if (visible) {
                    this.fitLayout();
                }
            }
            fitLayout() {
                let windowHeight = $(window).innerHeight();
                let windowWidth = $(window).innerWidth();
                this.fitLayerSizes(windowWidth, windowHeight);
            }
            fitLayerSizes(windowWidth, windowHeight) {
                if (this.state.layout > 6) {
                    for (let i = 0; i < this.state.layout; i++) {
                        $(this.boxSubscribers[i].getBox())
                            .css("width", "25%")
                            .css("height", windowHeight / 2 + "px");
                        $(this.label[i].getParentDiv()).css("width", "25%");
                    }
                }
                else if (this.state.layout > 4) {
                    for (let i = 0; i < this.state.layout; i++) {
                        $(this.boxSubscribers[i].getBox())
                            .css("width", "33.33%")
                            .css("height", windowHeight / 2 + "px");
                        $(this.label[i].getParentDiv()).css("width", "33.33%");
                    }
                }
                else if (this.state.layout > 2) {
                    for (let i = 0; i < this.state.layout; i++) {
                        $(this.boxSubscribers[i].getBox())
                            .css("width", "50%")
                            .css("height", windowHeight / 2 + "px");
                        $(this.label[i].getParentDiv()).css("width", "50%");
                    }
                }
                else {
                    for (let i = 0; i < this.state.layout; i++) {
                        $(this.boxSubscribers[i].getBox())
                            .css("width", "50%")
                            .css("height", windowHeight + "px");
                        $(this.label[i].getParentDiv()).css("width", "50%");
                    }
                }
                for (let i = 0; i < this.state.layout; i++) {
                    $(this.label[i].getParentDiv())
                        .css("left", $(this.boxSubscribers[i].getBox()).position().left + "px")
                        .css("top", ($(this.boxSubscribers[i].getBox()).position().top + $(this.boxSubscribers[i].getBox()).height() - $(this.label[i].getParentDiv()).height()) + "px");
                }
            }
            render() {
                let statusClasses = [
                    "alert alert-warning",
                    "alert alert-success",
                    "alert alert-danger"
                ];
                let labelClasses = [
                    "notConnected",
                    "connected",
                ];
                return (React.createElement("div", {className: "scContainer"}, React.createElement("div", {ref: (ref) => this.divStatus = ref}, React.createElement(App.Components.Status, {ref: (ref) => this.status = ref, text: "Connecting ...", style: App.Components.StatusStyle.Connecting, className: "cStatus", statusClasses: statusClasses})), React.createElement("div", {ref: (ref) => this.divUI = ref, style: { display: "none" }}, React.createElement(App.Components.Box, {ref: (ref) => this.boxSubscribers[0] = ref, id: this.props.targetId + "_Subscriber1", streamProps: this.subscribeProps, className: "cBox", visible: this.state.layout > 0}), React.createElement(App.Components.Box, {ref: (ref) => this.boxSubscribers[1] = ref, id: this.props.targetId + "_Subscriber2", streamProps: this.subscribeProps, className: "cBox", visible: this.state.layout > 0}), React.createElement(App.Components.Box, {ref: (ref) => this.boxSubscribers[2] = ref, id: this.props.targetId + "_Subscriber3", streamProps: this.subscribeProps, className: "cBox", visible: this.state.layout > 2}), React.createElement(App.Components.Box, {ref: (ref) => this.boxSubscribers[3] = ref, id: this.props.targetId + "_Subscriber4", streamProps: this.subscribeProps, className: "cBox", visible: this.state.layout > 2}), React.createElement(App.Components.Box, {ref: (ref) => this.boxSubscribers[4] = ref, id: this.props.targetId + "_Subscriber5", streamProps: this.subscribeProps, className: "cBox", visible: this.state.layout > 4}), React.createElement(App.Components.Box, {ref: (ref) => this.boxSubscribers[5] = ref, id: this.props.targetId + "_Subscriber6", streamProps: this.subscribeProps, className: "cBox", visible: this.state.layout > 4}), React.createElement(App.Components.Box, {ref: (ref) => this.boxSubscribers[6] = ref, id: this.props.targetId + "_Subscriber7", streamProps: this.subscribeProps, className: "cBox", visible: this.state.layout > 6}), React.createElement(App.Components.Box, {ref: (ref) => this.boxSubscribers[7] = ref, id: this.props.targetId + "_Subscriber8", streamProps: this.subscribeProps, className: "cBox", visible: this.state.layout > 6}), React.createElement(App.Components.BoxLabel, {ref: (ref) => this.label[0] = ref, text: "Student not connected...", style: App.Components.BoxLabelStyle.NotConnected, className: "cBoxLabel", labelClasses: labelClasses, visible: this.state.layout > 0}), React.createElement(App.Components.BoxLabel, {ref: (ref) => this.label[1] = ref, text: "Student not connected...", style: App.Components.BoxLabelStyle.NotConnected, className: "cBoxLabel", labelClasses: labelClasses, visible: this.state.layout > 0}), React.createElement(App.Components.BoxLabel, {ref: (ref) => this.label[2] = ref, text: "Student not connected...", style: App.Components.BoxLabelStyle.NotConnected, className: "cBoxLabel", labelClasses: labelClasses, visible: this.state.layout > 2}), React.createElement(App.Components.BoxLabel, {ref: (ref) => this.label[3] = ref, text: "Student not connected...", style: App.Components.BoxLabelStyle.NotConnected, className: "cBoxLabel", labelClasses: labelClasses, visible: this.state.layout > 2}), React.createElement(App.Components.BoxLabel, {ref: (ref) => this.label[4] = ref, text: "Student not connected...", style: App.Components.BoxLabelStyle.NotConnected, className: "cBoxLabel", labelClasses: labelClasses, visible: this.state.layout > 4}), React.createElement(App.Components.BoxLabel, {ref: (ref) => this.label[5] = ref, text: "Student not connected...", style: App.Components.BoxLabelStyle.NotConnected, className: "cBoxLabel", labelClasses: labelClasses, visible: this.state.layout > 4}), React.createElement(App.Components.BoxLabel, {ref: (ref) => this.label[6] = ref, text: "Student not connected...", style: App.Components.BoxLabelStyle.NotConnected, className: "cBoxLabel", labelClasses: labelClasses, visible: this.state.layout > 6}), React.createElement(App.Components.BoxLabel, {ref: (ref) => this.label[7] = ref, text: "Student not connected...", style: App.Components.BoxLabelStyle.NotConnected, className: "cBoxLabel", labelClasses: labelClasses, visible: this.state.layout > 6}))));
            }
        }
        class InitFC {
            constructor(targetId, classroomId, actionUrl) {
                ReactDOM.render(React.createElement("div", null, React.createElement(FC, {targetId: targetId, classroomId: classroomId, actionUrl: actionUrl})), document.getElementById(targetId));
            }
        }
        App.InitFC = InitFC;
    })(App = VC.App || (VC.App = {}));
})(VC || (VC = {}));
//# sourceMappingURL=FC.js.map