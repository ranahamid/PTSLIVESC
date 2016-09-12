/* tslint:disable:max-line-length */
var VC;
(function (VC) {
    var App;
    (function (App) {
        "use strict";
        class PC extends App.XC {
            constructor(props) {
                super(props, App.Roles.PC);
                this.singleBoxVisible = false;
            }
            // abstract methods
            setStatusText(text, style) {
                this.setStatusVisibility(true);
                this.status.setText(text, style);
            }
            didMount() {
                $(window).resize(() => this.fitHeightOfBoxes());
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
                    if (tokenData.Role === App.Roles.SC) {
                        // seat computer
                        this.labelLeft.setText(tokenData.Name + " connected.", App.Components.BoxLabelStyle.Connected);
                        // show raise hand button
                        this.switchButton.setStatus(App.Components.SwitchButtonStatus.Start);
                    }
                    else if (tokenData.Role === App.Roles.TC) {
                        // teacher computer
                        this.labelRight.setText(tokenData.Name + " connected.", App.Components.BoxLabelStyle.Connected);
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
                    if (tokenData.Role === App.Roles.SC) {
                        // seat computer
                        this.labelLeft.setText("Seat computer not connected.", App.Components.BoxLabelStyle.NotConnected);
                        // hide raise hand button
                        this.switchButton.setStatus(App.Components.SwitchButtonStatus.Hidden);
                    }
                    else if (tokenData.Role === App.Roles.TC) {
                        // teacher computer
                        this.labelRight.setText("Teacher computer not connected.", App.Components.BoxLabelStyle.NotConnected);
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
                    if (tokenData.Role === App.Roles.SC) {
                        // seat computer
                        this.boxSubscriberLeft.subscribe(this.session, stream, this.dataResponse.ComputerSetting.Volume[0]);
                    }
                    else if (tokenData.Role === App.Roles.TC) {
                        // teacher computer
                        this.boxSubscriberRight.subscribe(this.session, stream, this.dataResponse.ComputerSetting.Volume[1]);
                    }
                }
            }
            streamDestroyed(connection, stream) {
                let tokenData = App.Global.Fce.toTokenData(connection.data);
                if (this.dataResponse.Uid === tokenData.Uid) {
                }
                else if (this.isInMyGroup(tokenData.Uid)) {
                    // my group
                    // seat or teacher computer
                    if (tokenData.Role === App.Roles.SC) {
                        // seat computer
                        this.boxSubscriberLeft.unsubscribe(this.session);
                    }
                    else if (tokenData.Role === App.Roles.TC) {
                        // teacher computer
                        this.boxSubscriberRight.unsubscribe(this.session);
                    }
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
                    case App.Global.SignalTypes.Chat:
                        this.chatSignalReceived(event);
                        break;
                    case App.Global.SignalTypes.Forms:
                        this.formsSignalReceived(event);
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
                if (data.volume[0] != null) {
                    this.dataResponse.ComputerSetting.Volume[0] = data.volume[0];
                    this.boxSubscriberLeft.audioVolume(data.volume[0]);
                }
                if (data.volume[1] != null) {
                    this.dataResponse.ComputerSetting.Volume[1] = data.volume[1];
                    this.boxSubscriberRight.audioVolume(data.volume[1]);
                }
            }
            turnOffSignalReceived(event) {
                this.disconnect();
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
            formsSignalReceived(event) {
                let data = JSON.parse(event.data);
                if (data.formId === undefined) {
                    // answer received
                    // we do a complete refresh here, its the only way how we can send the group signal from TC
                    this.forms.formReceived();
                }
                else {
                    // form answer deleted
                    this.forms.formAnswerRemoved(data.formId);
                }
            }
            raiseHand() {
                App.Global.Signaling.sendSignal(this.session, this.getScConnection(), App.Global.SignalTypes.RaiseHand, { raised: true });
                this.switchButton.setStatus(App.Components.SwitchButtonStatus.Stop);
            }
            lowerHand() {
                App.Global.Signaling.sendSignal(this.session, this.getScConnection(), App.Global.SignalTypes.RaiseHand, { raised: false });
                this.switchButton.setStatus(App.Components.SwitchButtonStatus.Start);
            }
            setStatusVisibility(visible) {
                this.divStatus.style.display = visible ? "block" : "none";
            }
            setUiVisibility(visible) {
                this.divUI.style.display = visible ? "block" : "none";
                if (visible) {
                    this.fitHeightOfBoxes();
                }
            }
            tabOnClick(id) {
                this.tabs.selectItem(id);
                if (id === 0) {
                    // left screen
                    this.showScreens(true, false);
                }
                else if (id === 1) {
                    // left & right screen
                    this.showScreens(true, true);
                }
                else if (id === 2) {
                    // right screen
                    this.showScreens(false, true);
                }
                else if (id === 3) {
                    // surveys
                    this.showSurveys();
                }
            }
            ;
            showScreens(leftScreenVisible, rightScreenVisible) {
                this.divForms.style.display = "none";
                this.divChat.style.display = "block";
                if (!leftScreenVisible) {
                    // right screen only
                    this.divLeftScreen.className = "";
                    this.divLeftScreen.style.display = "none";
                    this.divRightScreen.className = "col-sm-12";
                    this.divRightScreen.style.display = "block";
                    this.singleBoxVisible = true;
                }
                else if (!rightScreenVisible) {
                    // left screen only
                    this.divRightScreen.className = "";
                    this.divRightScreen.style.display = "none";
                    this.divLeftScreen.className = "col-sm-12";
                    this.divLeftScreen.style.display = "block";
                    this.singleBoxVisible = true;
                }
                else {
                    // left & right screen
                    this.divRightScreen.className = "col-sm-6";
                    this.divRightScreen.style.display = "block";
                    this.divLeftScreen.className = "col-sm-6";
                    this.divLeftScreen.style.display = "block";
                    this.singleBoxVisible = false;
                }
                this.fitHeightOfBoxes();
            }
            showSurveys() {
                this.divLeftScreen.style.display = "none";
                this.divRightScreen.style.display = "none";
                this.divChat.style.display = "none";
                this.divForms.style.display = "block";
            }
            fitHeightOfBoxes() {
                this.fitHeightOfBox(this.boxPublisher.getBox(), true);
                this.fitHeightOfBox(this.boxSubscriberLeft.getBox(), false);
                this.fitHeightOfBox(this.boxSubscriberRight.getBox(), false);
            }
            fitHeightOfBox(box, isPublisherBox) {
                if (this.singleBoxVisible || isPublisherBox) {
                    // 16:9
                    $(box).css("height", ($(box).width() / 16 * 9) + "px");
                }
                else {
                    // 4:3
                    $(box).css("height", ($(box).width() / 4 * 3) + "px");
                }
            }
            setChatUser(uid, name, role) {
                this.chatPrivate.setChatUser({ uid: uid, name: name, role: role });
                this.chatPublic.setChatUser({ uid: uid, name: name, role: role });
            }
            onChatPrivateItemSubmitted(item) {
                // private chat, all PCs of my group + SC of my group + me
                let connections = [];
                connections = connections.concat(this.getConnectionsOfMyGroup(App.Roles.PC), this.getConnectionsOfMyGroup(App.Roles.SC));
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
            onPendingAnswersChanged(count) {
                if (count === 0) {
                    this.tabs.updateBadge(3);
                }
                else {
                    this.tabs.updateBadge(3, count);
                }
            }
            onAnswerStatusChanged(formUid, answerUid, type, status, resultData) {
                App.Global.Signaling.sendSignal(this.session, this.getTcConnection(), App.Global.SignalTypes.Forms, {
                    formId: formUid,
                    answerId: answerUid,
                    type: type,
                    status: status,
                    resultData: resultData
                });
            }
            render() {
                let tabItems = [
                    { id: 0, title: "Left screen only", onClick: this.tabOnClick.bind(this), active: false },
                    { id: 1, title: "Left & Right screen", onClick: this.tabOnClick.bind(this), active: true },
                    { id: 2, title: "Right screen only", onClick: this.tabOnClick.bind(this), active: false },
                    { id: 3, title: "Surveys & Polls", onClick: this.tabOnClick.bind(this), active: false }
                ];
                let statusClasses = [
                    "alert alert-warning",
                    "alert alert-success",
                    "alert alert-danger" // error
                ];
                let labelClasses = [
                    "alert alert-warning",
                    "alert alert-success",
                    "" // handRaised (no need for PC)
                ];
                return (React.createElement("div", {className: "_cContainer"}, React.createElement("div", {ref: (ref) => this.divStatus = ref}, React.createElement(App.Components.Status, {ref: (ref) => this.status = ref, text: "Connecting ...", style: App.Components.StatusStyle.Connecting, className: "cStatus", statusClasses: statusClasses})), React.createElement("div", {ref: (ref) => this.divUI = ref, style: { display: "none" }}, React.createElement("div", {className: "row"}, React.createElement("div", {className: "col-sm-2"}, React.createElement(App.Components.Box, {ref: (ref) => this.boxPublisher = ref, id: this.props.targetId + "_Publisher1", streamProps: this.publishProps, className: "cBoxP", visible: true})), React.createElement("div", {className: "col-sm-10"}, React.createElement(App.Components.SwitchButton, {ref: (ref) => this.switchButton = ref, textOn: "Raise your hand", textOff: "Lower your hand", classOn: "btn btn-success", classOff: "btn btn-danger", iconOn: "glyphicon glyphicon-hand-up", iconOff: "glyphicon glyphicon-hand-down", status: App.Components.SwitchButtonStatus.Hidden, onOn: this.raiseHand.bind(this), onOff: this.lowerHand.bind(this), className: "handButton"}))), React.createElement(VC.Global.Components.Tabs, {ref: (ref) => this.tabs = ref, items: tabItems, className: "cTabs"}), React.createElement("div", {className: "row"}, React.createElement("div", {ref: (ref) => this.divLeftScreen = ref, className: "col-sm-6"}, React.createElement(App.Components.BoxLabel, {ref: (ref) => this.labelLeft = ref, text: "Seat computer not connected...", style: App.Components.BoxLabelStyle.NotConnected, className: "cBoxLabel", labelClasses: labelClasses, visible: true}), React.createElement(App.Components.Box, {ref: (ref) => this.boxSubscriberLeft = ref, id: this.props.targetId + "_Subscriber1", streamProps: this.subscribeProps, className: "cBox", visible: true})), React.createElement("div", {ref: (ref) => this.divRightScreen = ref, className: "col-sm-6"}, React.createElement(App.Components.BoxLabel, {ref: (ref) => this.labelRight = ref, text: "Teacher computer not connected...", style: App.Components.BoxLabelStyle.NotConnected, className: "cBoxLabel", labelClasses: labelClasses, visible: true}), React.createElement(App.Components.Box, {ref: (ref) => this.boxSubscriberRight = ref, id: this.props.targetId + "_Subscriber2", streamProps: this.subscribeProps, className: "cBox", visible: true}))), React.createElement("div", {className: "row", ref: (ref) => this.divChat = ref}, React.createElement("div", {className: "col-sm-6"}, React.createElement(App.Components.Chat, {ref: (ref) => this.chatPrivate = ref, title: "Seat chat (Private)", fixedHeight: false, onItemSubmitted: (item) => this.onChatPrivateItemSubmitted(item)})), React.createElement("div", {className: "col-sm-6"}, React.createElement(App.Components.Chat, {ref: (ref) => this.chatPublic = ref, title: "Classroom chat (Public)", fixedHeight: false, onItemSubmitted: (item) => this.onChatPublicItemSubmitted(item)}))), React.createElement("div", {ref: (ref) => this.divForms = ref, style: { display: "none" }}, React.createElement(App.PC.FormsPc, {ref: (ref) => this.forms = ref, onPendingAnswersChanged: (count) => this.onPendingAnswersChanged(count), onAnswerStatusChanged: (formUid, answerUid, type, status, resultData) => this.onAnswerStatusChanged(formUid, answerUid, type, status, resultData), actionUrl: this.props.actionUrl})))));
            }
        }
        class InitPC {
            constructor(targetId, classroomId, actionUrl) {
                ReactDOM.render(React.createElement("div", null, React.createElement(PC, {targetId: targetId, classroomId: classroomId, actionUrl: actionUrl})), document.getElementById(targetId));
            }
        }
        App.InitPC = InitPC;
    })(App = VC.App || (VC.App = {}));
})(VC || (VC = {}));
//# sourceMappingURL=PC.js.map