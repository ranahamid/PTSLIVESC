/* tslint:disable:max-line-length */
var VC;
(function (VC) {
    var App;
    (function (App) {
        "use strict";
        class SC extends App.XC {
            constructor(props) {
                super(props, App.Roles.SC);
                this.boxSubscribers = new Array(8);
                this.label = new Array(8);
                this.divFloatingChat = new Array(8);
                this.floatingChat = new Array(8);
                this.privateChatOpened = false;
                this.publicChatOpened = false;
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
                    this.setStatusVisibility(false);
                    this.setUiVisibility(true);
                    this.boxPublisher.publish(this.session, App.PublishSources.Camera, this.dataResponse.ComputerSetting.Audio, this.dataResponse.ComputerSetting.Video, (event) => {
                        // nothing to do
                    }, (event) => {
                        // nothing to do
                    });
                    // set chat name
                    this.setChatUser(tokenData.Uid, tokenData.Name, tokenData.Role);
                }
                else if (this.isInMyGroup(tokenData.Uid)) {
                    // my group
                    if (tokenData.Role === App.Roles.PC) {
                        // student
                        let groupComputer = this.getGroupComputer(tokenData.Uid);
                        this.label[groupComputer.Position - 1].setText(tokenData.Name + " connected.", App.Components.BoxLabelStyle.Connected);
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
                    this.boxPublisher.unpublish(this.session);
                    this.setUiVisibility(false);
                    this.setStatusText("Disconnected from the session.", App.Components.StatusStyle.Error);
                }
                else if (this.isInMyGroup(tokenData.Uid)) {
                    // my group
                    if (tokenData.Role === App.Roles.PC) {
                        // student
                        let groupComputer = this.getGroupComputer(tokenData.Uid);
                        this.label[groupComputer.Position - 1].setText("Student PC not connected.", App.Components.BoxLabelStyle.NotConnected);
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
                    case App.Global.SignalTypes.TurnAv:
                        this.turnAvSignalReceived(event);
                        break;
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
                }
            }
            turnAvSignalReceived(event) {
                let data = JSON.parse(event.data);
                if (data.audio != null) {
                    this.dataResponse.ComputerSetting.Audio = data.audio;
                    this.boxPublisher.audio(data.audio);
                }
                if (data.video != null) {
                    this.dataResponse.ComputerSetting.Video = data.video;
                    this.boxPublisher.video(data.video);
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
            raiseHandSignalReceived(event) {
                let tokenData = App.Global.Fce.toTokenData(event.from.data);
                let groupComputer = this.getGroupComputer(tokenData.Uid);
                let data = JSON.parse(event.data);
                this.label[groupComputer.Position - 1].setStyle(data.raised ? App.Components.BoxLabelStyle.HandRaised : App.Components.BoxLabelStyle.Connected);
            }
            chatSignalReceived(event) {
                let data = JSON.parse(event.data);
                if (data.type === App.Global.ChatType.Private) {
                    // private chat
                    this.chatPrivate.addItem({
                        userUid: data.userUid,
                        userName: data.userName,
                        userRole: data.userRole,
                        message: data.message,
                        timestamp: new Date(),
                        me: false
                    });
                    // students
                    if (data.userRole === App.Roles.PC) {
                        let connection = this.getConnectionByUid(data.userUid);
                        if (connection != null) {
                            let tokenData = App.Global.Fce.toTokenData(connection.data);
                            let groupComputer = this.getGroupComputer(tokenData.Uid);
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
                else if (data.type === App.Global.ChatType.Public) {
                    // public chat
                    this.chatPublic.addItem({
                        userUid: data.userUid,
                        userName: data.userName,
                        userRole: data.userRole,
                        message: data.message,
                        timestamp: new Date(),
                        me: false
                    });
                }
            }
            setStatusVisibility(visible) {
                this.divStatus.style.display = visible ? "block" : "none";
            }
            setLayoutVisibility(visible) {
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
                this.fitPositionOfFloatingButtons(windowWidth, windowHeight);
                this.fitPositionOfChat(windowWidth, windowHeight);
            }
            fitLayerSizes(windowWidth, windowHeight) {
                // boxes + width of labels & floating chat divs
                if (this.props.layout > 6) {
                    for (let i = 0; i < this.props.layout; i++) {
                        $(this.boxSubscribers[i].getBox())
                            .css("width", "25%")
                            .css("height", windowHeight / 2 + "px"); // 8
                        $(this.label[i].getParentDiv()).css("width", "25%");
                        $(this.divFloatingChat[i]).css("width", "25%");
                    }
                }
                else if (this.props.layout > 4) {
                    for (let i = 0; i < this.props.layout; i++) {
                        $(this.boxSubscribers[i].getBox())
                            .css("width", "33.33%")
                            .css("height", windowHeight / 2 + "px"); // 6
                        $(this.label[i].getParentDiv()).css("width", "33.33%");
                        $(this.divFloatingChat[i]).css("width", "33.33%");
                    }
                }
                else if (this.props.layout > 2) {
                    for (let i = 0; i < this.props.layout; i++) {
                        $(this.boxSubscribers[i].getBox())
                            .css("width", "50%")
                            .css("height", windowHeight / 2 + "px"); // 4
                        $(this.label[i].getParentDiv()).css("width", "50%");
                        $(this.divFloatingChat[i]).css("width", "50%");
                    }
                }
                else {
                    for (let i = 0; i < this.props.layout; i++) {
                        $(this.boxSubscribers[i].getBox())
                            .css("width", "50%")
                            .css("height", windowHeight + "px"); // 2
                        $(this.label[i].getParentDiv()).css("width", "50%");
                        $(this.divFloatingChat[i]).css("width", "50%");
                    }
                }
                // labels
                for (let i = 0; i < this.props.layout; i++) {
                    $(this.label[i].getParentDiv())
                        .css("left", $(this.boxSubscribers[i].getBox()).position().left + "px")
                        .css("top", $(this.boxSubscribers[i].getBox()).position().top + "px");
                }
                // floating chat
                for (let i = 0; i < this.props.layout; i++) {
                    $(this.divFloatingChat[i])
                        .css("left", $(this.boxSubscribers[i].getBox()).position().left + "px")
                        .css("top", ($(this.boxSubscribers[i].getBox()).position().top + $(this.label[i].getParentDiv()).height()) + "px")
                        .css("height", ($(this.boxSubscribers[i].getBox()).height() - $(this.label[i].getParentDiv()).height()) + "px");
                }
            }
            fitPositionOfFloatingButtons(windowWidth, windowHeight) {
                // fit buttons on the bottom of the page
                if (!this.privateChatOpened) {
                    this.divButtonChatPrivate.style.left = "0px";
                    this.divButtonChatPrivate.style.top = (windowHeight - this.divButtonChatPrivate.clientHeight) + "px";
                }
                else {
                    this.divButtonChatPrivate.style.left = "0px";
                    this.divButtonChatPrivate.style.top = Math.abs(this.divButtonChatPrivate.clientHeight) + "px";
                }
                if (!this.publicChatOpened) {
                    this.divButtonChatPublic.style.left = (windowWidth / 2) + "px";
                    this.divButtonChatPublic.style.top = (windowHeight - this.divButtonChatPublic.clientHeight) + "px";
                }
                else {
                    this.divButtonChatPublic.style.left = "0px";
                    this.divButtonChatPublic.style.top = Math.abs(this.divButtonChatPublic.clientHeight) + "px";
                }
            }
            fitPositionOfChat(windowWidth, windowHeight) {
                if (this.privateChatOpened) {
                    this.divChatPrivate.style.left = "0px";
                    this.divChatPrivate.style.top = (windowHeight - this.divChatPrivate.clientHeight) + "px";
                }
                else {
                    this.divChatPrivate.style.left = "0px";
                    this.divChatPrivate.style.top = Math.abs(this.divChatPrivate.clientHeight) + "px";
                }
                if (this.publicChatOpened) {
                    this.divChatPublic.style.left = (windowWidth / 2) + "px";
                    this.divChatPublic.style.top = (windowHeight - this.divChatPublic.clientHeight) + "px";
                }
                else {
                    this.divChatPublic.style.left = "0px";
                    this.divChatPublic.style.top = Math.abs(this.divChatPublic.clientHeight) + "px";
                }
            }
            showPrivateChat() {
                for (let i = 0; i < this.props.layout; i++) {
                    this.divFloatingChat[i].style.display = "none";
                }
                this.divButtonChatPrivate.style.display = "none";
                this.divChatPrivate.style.display = "block";
                this.chatPrivate.fitTbHeight();
                this.privateChatOpened = true;
                this.fitLayout();
            }
            showPublicChat() {
                this.divButtonChatPublic.style.display = "none";
                this.divChatPublic.style.display = "block";
                this.chatPublic.fitTbHeight();
                this.publicChatOpened = true;
                this.fitLayout();
            }
            hidePrivateChat() {
                this.divChatPrivate.style.display = "none";
                for (let i = 0; i < this.props.layout; i++) {
                    this.divFloatingChat[i].style.display = "block";
                }
                this.divButtonChatPrivate.style.display = "block";
                this.privateChatOpened = false;
                this.fitLayout();
            }
            hidePublicChat() {
                this.divChatPublic.style.display = "none";
                this.divButtonChatPublic.style.display = "block";
                this.publicChatOpened = false;
                this.fitLayout();
            }
            setChatUser(uid, name, role) {
                this.chatPrivate.setChatUser({ uid: uid, name: name, role: role });
                this.chatPublic.setChatUser({ uid: uid, name: name, role: role });
            }
            onChatPrivateItemSubmitted(item) {
                // private chat, all PCs of my group + me
                let connections = this.getConnectionsOfMyGroup(App.Roles.PC);
                connections.push(this.getMyConnection());
                // send signal
                connections.forEach((c) => {
                    App.Global.Signaling.sendSignal(this.session, c, App.Global.SignalTypes.Chat, {
                        userUid: item.userUid,
                        userName: item.userName,
                        userRole: item.userRole,
                        message: item.message,
                        type: App.Global.ChatType.Private
                    });
                });
            }
            onChatPublicItemSubmitted(item) {
                App.Global.Signaling.sendSignalAll(this.session, App.Global.SignalTypes.Chat, {
                    userUid: item.userUid,
                    userName: item.userName,
                    userRole: item.userRole,
                    message: item.message,
                    type: App.Global.ChatType.Public
                });
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
                return (React.createElement("div", {className: "scContainer"}, React.createElement("div", {ref: (ref) => this.divStatus = ref}, React.createElement(App.Components.Status, {ref: (ref) => this.status = ref, text: "Connecting ...", style: App.Components.StatusStyle.Connecting, className: "cStatus", statusClasses: statusClasses})), React.createElement("div", {ref: (ref) => this.divUI = ref, style: { display: "none" }}, React.createElement(App.Components.Box, {ref: (ref) => this.boxPublisher = ref, id: this.props.targetId + "_Publisher1", streamProps: this.publishProps, className: "", visible: false}), React.createElement(App.Components.Box, {ref: (ref) => this.boxSubscribers[0] = ref, id: this.props.targetId + "_Subscriber1", streamProps: this.subscribeProps, className: "cBox", visible: this.props.layout > 0}), React.createElement(App.Components.Box, {ref: (ref) => this.boxSubscribers[1] = ref, id: this.props.targetId + "_Subscriber2", streamProps: this.subscribeProps, className: "cBox", visible: this.props.layout > 0}), React.createElement(App.Components.Box, {ref: (ref) => this.boxSubscribers[2] = ref, id: this.props.targetId + "_Subscriber3", streamProps: this.subscribeProps, className: "cBox", visible: this.props.layout > 2}), React.createElement(App.Components.Box, {ref: (ref) => this.boxSubscribers[3] = ref, id: this.props.targetId + "_Subscriber4", streamProps: this.subscribeProps, className: "cBox", visible: this.props.layout > 2}), React.createElement(App.Components.Box, {ref: (ref) => this.boxSubscribers[4] = ref, id: this.props.targetId + "_Subscriber5", streamProps: this.subscribeProps, className: "cBox", visible: this.props.layout > 4}), React.createElement(App.Components.Box, {ref: (ref) => this.boxSubscribers[5] = ref, id: this.props.targetId + "_Subscriber6", streamProps: this.subscribeProps, className: "cBox", visible: this.props.layout > 4}), React.createElement(App.Components.Box, {ref: (ref) => this.boxSubscribers[6] = ref, id: this.props.targetId + "_Subscriber7", streamProps: this.subscribeProps, className: "cBox", visible: this.props.layout > 6}), React.createElement(App.Components.Box, {ref: (ref) => this.boxSubscribers[7] = ref, id: this.props.targetId + "_Subscriber8", streamProps: this.subscribeProps, className: "cBox", visible: this.props.layout > 6}), React.createElement(App.Components.BoxLabel, {ref: (ref) => this.label[0] = ref, text: "Student not connected...", style: App.Components.BoxLabelStyle.NotConnected, className: "cBoxLabel", labelClasses: labelClasses, visible: this.props.layout > 0}), React.createElement(App.Components.BoxLabel, {ref: (ref) => this.label[1] = ref, text: "Student not connected...", style: App.Components.BoxLabelStyle.NotConnected, className: "cBoxLabel", labelClasses: labelClasses, visible: this.props.layout > 0}), React.createElement(App.Components.BoxLabel, {ref: (ref) => this.label[2] = ref, text: "Student not connected...", style: App.Components.BoxLabelStyle.NotConnected, className: "cBoxLabel", labelClasses: labelClasses, visible: this.props.layout > 2}), React.createElement(App.Components.BoxLabel, {ref: (ref) => this.label[3] = ref, text: "Student not connected...", style: App.Components.BoxLabelStyle.NotConnected, className: "cBoxLabel", labelClasses: labelClasses, visible: this.props.layout > 2}), React.createElement(App.Components.BoxLabel, {ref: (ref) => this.label[4] = ref, text: "Student not connected...", style: App.Components.BoxLabelStyle.NotConnected, className: "cBoxLabel", labelClasses: labelClasses, visible: this.props.layout > 4}), React.createElement(App.Components.BoxLabel, {ref: (ref) => this.label[5] = ref, text: "Student not connected...", style: App.Components.BoxLabelStyle.NotConnected, className: "cBoxLabel", labelClasses: labelClasses, visible: this.props.layout > 4}), React.createElement(App.Components.BoxLabel, {ref: (ref) => this.label[6] = ref, text: "Student not connected...", style: App.Components.BoxLabelStyle.NotConnected, className: "cBoxLabel", labelClasses: labelClasses, visible: this.props.layout > 6}), React.createElement(App.Components.BoxLabel, {ref: (ref) => this.label[7] = ref, text: "Student not connected...", style: App.Components.BoxLabelStyle.NotConnected, className: "cBoxLabel", labelClasses: labelClasses, visible: this.props.layout > 6}), React.createElement("div", {ref: (ref) => this.divFloatingChat[0] = ref, className: "floatingChat", style: { display: (this.props.layout > 0 ? "block" : "none") }}, React.createElement(App.Components.ChatList, {ref: (ref) => this.floatingChat[0] = ref, fadingOut: true})), React.createElement("div", {ref: (ref) => this.divFloatingChat[1] = ref, className: "floatingChat", style: { display: (this.props.layout > 0 ? "block" : "none") }}, React.createElement(App.Components.ChatList, {ref: (ref) => this.floatingChat[1] = ref, fadingOut: true})), React.createElement("div", {ref: (ref) => this.divFloatingChat[2] = ref, className: "floatingChat", style: { display: (this.props.layout > 2 ? "block" : "none") }}, React.createElement(App.Components.ChatList, {ref: (ref) => this.floatingChat[2] = ref, fadingOut: true})), React.createElement("div", {ref: (ref) => this.divFloatingChat[3] = ref, className: "floatingChat", style: { display: (this.props.layout > 2 ? "block" : "none") }}, React.createElement(App.Components.ChatList, {ref: (ref) => this.floatingChat[3] = ref, fadingOut: true})), React.createElement("div", {ref: (ref) => this.divFloatingChat[4] = ref, className: "floatingChat", style: { display: (this.props.layout > 4 ? "block" : "none") }}, React.createElement(App.Components.ChatList, {ref: (ref) => this.floatingChat[4] = ref, fadingOut: true})), React.createElement("div", {ref: (ref) => this.divFloatingChat[5] = ref, className: "floatingChat", style: { display: (this.props.layout > 4 ? "block" : "none") }}, React.createElement(App.Components.ChatList, {ref: (ref) => this.floatingChat[5] = ref, fadingOut: true})), React.createElement("div", {ref: (ref) => this.divFloatingChat[6] = ref, className: "floatingChat", style: { display: (this.props.layout > 6 ? "block" : "none") }}, React.createElement(App.Components.ChatList, {ref: (ref) => this.floatingChat[6] = ref, fadingOut: true})), React.createElement("div", {ref: (ref) => this.divFloatingChat[7] = ref, className: "floatingChat", style: { display: (this.props.layout > 6 ? "block" : "none") }}, React.createElement(App.Components.ChatList, {ref: (ref) => this.floatingChat[7] = ref, fadingOut: true})), React.createElement("div", {ref: (ref) => this.divButtonChatPrivate = ref, className: "floatingButton", style: { display: "block" }}, React.createElement("button", {type: "button", className: "btn btn-sm btn-default", onClick: () => this.showPrivateChat()}, "Seat chat (Private) ")), React.createElement("div", {ref: (ref) => this.divButtonChatPublic = ref, className: "floatingButton", style: { display: "block" }}, React.createElement("button", {type: "button", className: "btn btn-sm btn-default", onClick: () => this.showPublicChat()}, "Classroom chat (Public) ")), React.createElement("div", {ref: (ref) => this.divChatPrivate = ref, style: { display: "none" }, className: "scChat"}, React.createElement(App.Components.Chat, {ref: (ref) => this.chatPrivate = ref, title: "Seat chat (Private)", fixedHeight: true, onChatClosed: () => this.hidePrivateChat(), onItemSubmitted: (item) => this.onChatPrivateItemSubmitted(item)})), React.createElement("div", {ref: (ref) => this.divChatPublic = ref, style: { display: "none" }, className: "scChat"}, React.createElement(App.Components.Chat, {ref: (ref) => this.chatPublic = ref, title: "Classroom chat (Public)", fixedHeight: true, onChatClosed: () => this.hidePublicChat(), onItemSubmitted: (item) => this.onChatPublicItemSubmitted(item)})))));
            }
        }
        class InitSC {
            constructor(targetId, actionUrl, layout) {
                ReactDOM.render(React.createElement("div", null, React.createElement(SC, {targetId: targetId, actionUrl: actionUrl, layout: layout})), document.getElementById(targetId));
            }
        }
        App.InitSC = InitSC;
    })(App = VC.App || (VC.App = {}));
})(VC || (VC = {}));
//# sourceMappingURL=SC.js.map