/* tslint:disable:max-line-length */
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
                this.divFloatingChat = new Array(8);
                this.floatingChat = new Array(8);
                this.connectedStudents = [false, false, false, false, false, false, false, false];
            }
            // abstract methods
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
                    // me
                    this.setState({ layout: this.dataResponse.ComputerSetting.Layout });
                    this.setStatusVisibility(false);
                    this.setUiVisibility(true);
                }
                else if (this.isInMyGroup(tokenData.Uid)) {
                    // my group
                    if (tokenData.Role === App.Roles.PC) {
                        // student
                        let groupComputer = this.getGroupComputer(tokenData.Uid);
                        this.label[groupComputer.Position - 1].setText(tokenData.Name + " connected.", App.Components.BoxLabelStyle.Connected);
                        this.connectedStudents[groupComputer.Position - 1] = true;
                    }
                }
                else if (tokenData.Role === App.Roles.AC) {
                    // admin computer
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
                    // me
                    this.setUiVisibility(false);
                    this.setStatusText("Disconnected from the session.", App.Components.StatusStyle.Error);
                }
                else if (this.isInMyGroup(tokenData.Uid)) {
                    // my group
                    if (tokenData.Role === App.Roles.PC) {
                        // student
                        let groupComputer = this.getGroupComputer(tokenData.Uid);
                        this.label[groupComputer.Position - 1].setText("Student PC not connected.", App.Components.BoxLabelStyle.NotConnected);
                        this.connectedStudents[groupComputer.Position - 1] = false;
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
                let tokenData = App.Global.Fce.toTokenData(connection.data);
                if (this.dataResponse.Uid === tokenData.Uid) {
                }
                else if (this.isInMyGroup(tokenData.Uid)) {
                    // my group
                    let groupComputer = this.getGroupComputer(tokenData.Uid);
                    // student
                    this.boxSubscribers[groupComputer.Position - 1].subscribe(this.session, stream, this.dataResponse.ComputerSetting.Volume[groupComputer.Position - 1]);
                }
            }
            streamDestroyed(connection, stream) {
                let tokenData = App.Global.Fce.toTokenData(connection.data);
                if (this.dataResponse.Uid === tokenData.Uid) {
                }
                else if (this.isInMyGroup(tokenData.Uid)) {
                    // my group
                    let groupComputer = this.getGroupComputer(tokenData.Uid);
                    // student
                    this.boxSubscribers[groupComputer.Position - 1].unsubscribe(this.session);
                }
            }
            streamPropertyChanged(event) {
                // nothing to do
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
                    case App.Global.SignalTypes.RaiseHand:
                        this.raiseHandSignalReceived(event);
                        break;
                    case App.Global.SignalTypes.Chat:
                        this.chatSignalReceived(event);
                        break;
                    case App.Global.SignalTypes.FeaturedChanged:
                        this.featuredChangedSignalReceived(event);
                        break;
                }
            }
            volumeSignalReceived(event) {
                let data = JSON.parse(event.data);
                for (let i = 0; i < data.volume.length; i++) {
                    if (data.volume[i] !== null) {
                        this.dataResponse.ComputerSetting.Volume[i] = data.volume[i];
                        this.boxSubscribers[i].audioVolume(data.volume[i]);
                    }
                }
            }
            turnOffSignalReceived(event) {
                let data = JSON.parse(event.data);
                if (data.role === undefined || data.role === App.Roles.FC) {
                    this.disconnect();
                }
            }
            raiseHandSignalReceived(event) {
                let tokenData = App.Global.Fce.toTokenData(event.from.data);
                let groupComputer = this.getGroupComputer(tokenData.Uid);
                let data = JSON.parse(event.data);
                this.label[groupComputer.Position - 1].setStyle(data.raised ? App.Components.BoxLabelStyle.HandRaised : App.Components.BoxLabelStyle.Connected);
            }
            chatSignalReceived(event) {
                let data = JSON.parse(event.data);
                if (data.type === App.Global.ChatType.Public) {
                    // try to find this student
                    let groupComputer = this.getGroupComputer(data.userUid);
                    if (groupComputer !== null) {
                        this.floatingChat[groupComputer.Position - 1].addItem({
                            userUid: data.userUid,
                            userRole: data.userRole,
                            userName: data.userName,
                            message: data.message,
                            timestamp: new Date(),
                            me: false
                        });
                    }
                }
            }
            featuredChangedSignalReceived(event) {
                // let data: Global.ISignalFeaturedChangedData = JSON.parse(event.data) as Global.ISignalFeaturedChangedData;
                $.ajax({
                    cache: false,
                    type: "GET",
                    url: this.props.actionUrl + "/GetData",
                    success: (r) => {
                        if (r.status === VC.Global.Data.RESPONSE_SUCCESS) {
                            this.featuredStudentsChanged(r.data);
                        }
                        else {
                            // error
                            alert(r.message);
                        }
                    },
                    error: (xhr, status, error) => {
                        // error
                        alert("XHR Error: " + xhr.statusText);
                    }
                });
            }
            featuredStudentsChanged(data) {
                // go thru current layout and unsubscribe from students that doesn't match their position anymore
                for (let i = 0; i < this.state.layout; i++) {
                    if (this.connectedStudents[i]) {
                        let newStudent = this.getGroupStudentComputerByPosition(i + 1, data);
                        let currentStudent = this.getGroupStudentComputerByPosition(i + 1, this.dataResponse);
                        if (!this.compareGroupComputers(newStudent, currentStudent)) {
                            let connection = this.getConnectionByUid(currentStudent.Uid);
                            if (connection !== null) {
                                // unsubscribe
                                if (this.boxSubscribers[i].isConnected) {
                                    this.boxSubscribers[i].unsubscribe(this.session);
                                }
                                this.label[i].setText("Student PC not connected.", App.Components.BoxLabelStyle.NotConnected);
                                this.floatingChat[i].clearChat();
                                // send signal to remove from group
                                App.Global.Signaling.sendSignal(this.session, connection, App.Global.SignalTypes.GroupChanged, { addUids: [], removeUids: [this.dataResponse.Uid] });
                                // disconnected status
                                this.connectedStudents[i] = false;
                            }
                        }
                        else {
                            // since the student is recreated, update to default volume
                            if (this.boxSubscribers[i].isConnected) {
                                this.boxSubscribers[i].audioVolume(80); // todo: it would be worth to improve somehow .. the solution would be to improve it on the admin computer, so the current volume stays
                            }
                        }
                    }
                }
                // update layout when need
                if (this.dataResponse.ComputerSetting.Layout !== data.ComputerSetting.Layout) {
                    this.setState({ layout: data.ComputerSetting.Layout }, () => {
                        this.fitLayout();
                    });
                }
                // subscribe to new students
                for (let i = 0; i < this.state.layout; i++) {
                    if (!this.connectedStudents[i]) {
                        let newStudent = this.getGroupStudentComputerByPosition(i + 1, data);
                        if (newStudent !== null) {
                            // label
                            let newStudentConnection = this.getConnectionByUid(newStudent.Uid);
                            if (newStudentConnection !== null) {
                                // try to get stream
                                let stream = this.getStream(newStudent.Uid);
                                if (stream !== null) {
                                    // subscribe
                                    this.boxSubscribers[i].subscribe(this.session, stream, data.ComputerSetting.Volume[i]);
                                }
                                let tokenData = App.Global.Fce.toTokenData(newStudentConnection.data);
                                this.label[i].setText(tokenData.Name + " connected.", App.Components.BoxLabelStyle.Connected);
                                // send signal to add to group
                                App.Global.Signaling.sendSignal(this.session, newStudentConnection, App.Global.SignalTypes.GroupChanged, { addUids: [this.dataResponse.Uid], removeUids: [] });
                                // set connected status
                                this.connectedStudents[i] = true;
                            }
                        }
                    }
                }
                // update data response
                this.dataResponse = data;
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
                // body1 style
                let body1 = document.getElementById("Body1");
                body1.className = visible ? "lightBody" : "darkBody";
                // divBody1 class
                let divBody1 = document.getElementById("DivBody1");
                divBody1.className = visible ? "divBody" : "";
                // header1
                let header1 = document.getElementById("Header1");
                header1.style.display = visible ? "block" : "none";
                // footer1
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
                // boxes + width of labels & floating chat divs
                if (this.state.layout > 6) {
                    for (let i = 0; i < this.state.layout; i++) {
                        $(this.boxSubscribers[i].getBox())
                            .css("width", "25%")
                            .css("height", windowHeight / 2 + "px"); // 8
                        $(this.label[i].getParentDiv()).css("width", "25%");
                    }
                }
                else if (this.state.layout > 4) {
                    for (let i = 0; i < this.state.layout; i++) {
                        $(this.boxSubscribers[i].getBox())
                            .css("width", "33.33%")
                            .css("height", windowHeight / 2 + "px"); // 6
                        $(this.label[i].getParentDiv()).css("width", "33.33%");
                    }
                }
                else if (this.state.layout > 2) {
                    for (let i = 0; i < this.state.layout; i++) {
                        $(this.boxSubscribers[i].getBox())
                            .css("width", "50%")
                            .css("height", windowHeight / 2 + "px"); // 4
                        $(this.label[i].getParentDiv()).css("width", "50%");
                    }
                }
                else if (this.state.layout > 1) {
                    for (let i = 0; i < this.state.layout; i++) {
                        $(this.boxSubscribers[i].getBox())
                            .css("width", "50%")
                            .css("height", windowHeight + "px"); // 2
                        $(this.label[i].getParentDiv()).css("width", "50%");
                    }
                }
                else {
                    for (let i = 0; i < this.state.layout; i++) {
                        $(this.boxSubscribers[i].getBox())
                            .css("width", "100%")
                            .css("height", windowHeight + "px"); // 1
                        $(this.label[i].getParentDiv()).css("width", "100%");
                    }
                }
                // labels
                for (let i = 0; i < this.state.layout; i++) {
                    $(this.label[i].getParentDiv())
                        .css("left", $(this.boxSubscribers[i].getBox()).position().left + "px")
                        .css("top", ($(this.boxSubscribers[i].getBox()).position().top + $(this.boxSubscribers[i].getBox()).height() - $(this.label[i].getParentDiv()).height()) + "px");
                }
                // floating chat
                for (let i = 0; i < this.state.layout; i++) {
                    $(this.divFloatingChat[i])
                        .css("left", $(this.boxSubscribers[i].getBox()).position().left + "px")
                        .css("top", ($(this.boxSubscribers[i].getBox()).position().top + $(this.label[i].getParentDiv()).height() + 10) + "px")
                        .css("height", ($(this.boxSubscribers[i].getBox()).height() - $(this.label[i].getParentDiv()).height() - 10) + "px");
                }
            }
            render() {
                let statusClasses = [
                    "alert alert-warning",
                    "alert alert-success",
                    "alert alert-danger" // error
                ];
                let labelClasses = [
                    "notConnected",
                    "connected",
                    "handRaised" // handRaised
                ];
                return (React.createElement("div", {className: "scContainer"}, React.createElement("div", {ref: (ref) => this.divStatus = ref}, React.createElement(App.Components.Status, {ref: (ref) => this.status = ref, text: "Connecting ...", style: App.Components.StatusStyle.Connecting, className: "cStatus", statusClasses: statusClasses})), React.createElement("div", {ref: (ref) => this.divUI = ref, style: { display: "none" }}, React.createElement(App.Components.Box, {ref: (ref) => this.boxSubscribers[0] = ref, id: this.props.targetId + "_Subscriber1", streamProps: this.subscribeProps, className: "cBox", visible: this.state.layout > 0}), React.createElement(App.Components.Box, {ref: (ref) => this.boxSubscribers[1] = ref, id: this.props.targetId + "_Subscriber2", streamProps: this.subscribeProps, className: "cBox", visible: this.state.layout > 1}), React.createElement(App.Components.Box, {ref: (ref) => this.boxSubscribers[2] = ref, id: this.props.targetId + "_Subscriber3", streamProps: this.subscribeProps, className: "cBox", visible: this.state.layout > 2}), React.createElement(App.Components.Box, {ref: (ref) => this.boxSubscribers[3] = ref, id: this.props.targetId + "_Subscriber4", streamProps: this.subscribeProps, className: "cBox", visible: this.state.layout > 2}), React.createElement(App.Components.Box, {ref: (ref) => this.boxSubscribers[4] = ref, id: this.props.targetId + "_Subscriber5", streamProps: this.subscribeProps, className: "cBox", visible: this.state.layout > 4}), React.createElement(App.Components.Box, {ref: (ref) => this.boxSubscribers[5] = ref, id: this.props.targetId + "_Subscriber6", streamProps: this.subscribeProps, className: "cBox", visible: this.state.layout > 4}), React.createElement(App.Components.Box, {ref: (ref) => this.boxSubscribers[6] = ref, id: this.props.targetId + "_Subscriber7", streamProps: this.subscribeProps, className: "cBox", visible: this.state.layout > 6}), React.createElement(App.Components.Box, {ref: (ref) => this.boxSubscribers[7] = ref, id: this.props.targetId + "_Subscriber8", streamProps: this.subscribeProps, className: "cBox", visible: this.state.layout > 6}), React.createElement(App.Components.BoxLabel, {ref: (ref) => this.label[0] = ref, text: "Student not connected...", style: App.Components.BoxLabelStyle.NotConnected, className: "cBoxLabel", labelClasses: labelClasses, visible: this.state.layout > 0}), React.createElement(App.Components.BoxLabel, {ref: (ref) => this.label[1] = ref, text: "Student not connected...", style: App.Components.BoxLabelStyle.NotConnected, className: "cBoxLabel", labelClasses: labelClasses, visible: this.state.layout > 1}), React.createElement(App.Components.BoxLabel, {ref: (ref) => this.label[2] = ref, text: "Student not connected...", style: App.Components.BoxLabelStyle.NotConnected, className: "cBoxLabel", labelClasses: labelClasses, visible: this.state.layout > 2}), React.createElement(App.Components.BoxLabel, {ref: (ref) => this.label[3] = ref, text: "Student not connected...", style: App.Components.BoxLabelStyle.NotConnected, className: "cBoxLabel", labelClasses: labelClasses, visible: this.state.layout > 2}), React.createElement(App.Components.BoxLabel, {ref: (ref) => this.label[4] = ref, text: "Student not connected...", style: App.Components.BoxLabelStyle.NotConnected, className: "cBoxLabel", labelClasses: labelClasses, visible: this.state.layout > 4}), React.createElement(App.Components.BoxLabel, {ref: (ref) => this.label[5] = ref, text: "Student not connected...", style: App.Components.BoxLabelStyle.NotConnected, className: "cBoxLabel", labelClasses: labelClasses, visible: this.state.layout > 4}), React.createElement(App.Components.BoxLabel, {ref: (ref) => this.label[6] = ref, text: "Student not connected...", style: App.Components.BoxLabelStyle.NotConnected, className: "cBoxLabel", labelClasses: labelClasses, visible: this.state.layout > 6}), React.createElement(App.Components.BoxLabel, {ref: (ref) => this.label[7] = ref, text: "Student not connected...", style: App.Components.BoxLabelStyle.NotConnected, className: "cBoxLabel", labelClasses: labelClasses, visible: this.state.layout > 6}), React.createElement("div", {ref: (ref) => this.divFloatingChat[0] = ref, className: "floatingChat", style: { display: (this.state.layout > 0 ? "block" : "none") }}, React.createElement(App.Components.ChatList, {ref: (ref) => this.floatingChat[0] = ref, fadingOut: true})), React.createElement("div", {ref: (ref) => this.divFloatingChat[1] = ref, className: "floatingChat", style: { display: (this.state.layout > 1 ? "block" : "none") }}, React.createElement(App.Components.ChatList, {ref: (ref) => this.floatingChat[1] = ref, fadingOut: true})), React.createElement("div", {ref: (ref) => this.divFloatingChat[2] = ref, className: "floatingChat", style: { display: (this.state.layout > 2 ? "block" : "none") }}, React.createElement(App.Components.ChatList, {ref: (ref) => this.floatingChat[2] = ref, fadingOut: true})), React.createElement("div", {ref: (ref) => this.divFloatingChat[3] = ref, className: "floatingChat", style: { display: (this.state.layout > 2 ? "block" : "none") }}, React.createElement(App.Components.ChatList, {ref: (ref) => this.floatingChat[3] = ref, fadingOut: true})), React.createElement("div", {ref: (ref) => this.divFloatingChat[4] = ref, className: "floatingChat", style: { display: (this.state.layout > 4 ? "block" : "none") }}, React.createElement(App.Components.ChatList, {ref: (ref) => this.floatingChat[4] = ref, fadingOut: true})), React.createElement("div", {ref: (ref) => this.divFloatingChat[5] = ref, className: "floatingChat", style: { display: (this.state.layout > 4 ? "block" : "none") }}, React.createElement(App.Components.ChatList, {ref: (ref) => this.floatingChat[5] = ref, fadingOut: true})), React.createElement("div", {ref: (ref) => this.divFloatingChat[6] = ref, className: "floatingChat", style: { display: (this.state.layout > 6 ? "block" : "none") }}, React.createElement(App.Components.ChatList, {ref: (ref) => this.floatingChat[6] = ref, fadingOut: true})), React.createElement("div", {ref: (ref) => this.divFloatingChat[7] = ref, className: "floatingChat", style: { display: (this.state.layout > 6 ? "block" : "none") }}, React.createElement(App.Components.ChatList, {ref: (ref) => this.floatingChat[7] = ref, fadingOut: true})))));
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