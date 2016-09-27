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
                $(window).resize(() => this.fitLayout());
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
                    // av buttons
                    this.switchButtonAudio.setStatus(this.dataResponse.ComputerSetting.Audio ? App.Components.SwitchButtonStatus.Start : App.Components.SwitchButtonStatus.Stop);
                    this.switchButtonVideo.setStatus(this.dataResponse.ComputerSetting.Video ? App.Components.SwitchButtonStatus.Start : App.Components.SwitchButtonStatus.Stop);
                    // set chat name
                    this.setChatUser(tokenData.Uid, tokenData.Name, tokenData.Role);
                }
                else if (this.isInMyGroup(tokenData.Uid)) {
                    // my group
                    if (tokenData.Role === App.Roles.SC) {
                        // seat computer
                        // show raise hand button
                        // this.switchButton.setStatus(Components.SwitchButtonStatus.Start);
                        if (this.switchButtonHand.getStatus() === App.Components.SwitchButtonStatus.Stop) {
                            App.Global.Signaling.sendSignal(this.session, connection, App.Global.SignalTypes.RaiseHand, { raised: true });
                        }
                    }
                    else if (tokenData.Role === App.Roles.FC) {
                        if (this.switchButtonHand.getStatus() === App.Components.SwitchButtonStatus.Stop) {
                            App.Global.Signaling.sendSignal(this.session, connection, App.Global.SignalTypes.RaiseHand, { raised: true });
                        }
                    }
                    else if (tokenData.Role === App.Roles.TC) {
                        // teacher computer
                        this.label.setText(tokenData.Name + " connected.", App.Components.BoxLabelStyle.Connected);
                    }
                }
                else if (tokenData.Role === App.Roles.AC) {
                    // admin computer
                    App.Global.Signaling.sendSignal(this.session, connection, App.Global.SignalTypes.Connected, {
                        audio: this.dataResponse.ComputerSetting.Audio,
                        video: this.dataResponse.ComputerSetting.Video,
                        volume: this.dataResponse.ComputerSetting.Volume,
                        handRaised: (this.switchButtonHand.getStatus() === App.Components.SwitchButtonStatus.Stop)
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
                        // hide raise hand button
                        // this.switchButton.setStatus(Components.SwitchButtonStatus.Hidden);
                        this.fitLayout();
                    }
                    else if (tokenData.Role === App.Roles.TC) {
                        // seat computer
                        this.label.setText("Teacher computer not connected.", App.Components.BoxLabelStyle.NotConnected);
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
                    if (tokenData.Role === App.Roles.TC) {
                        // seat computer
                        this.boxSubscriber.subscribe(this.session, stream, this.dataResponse.ComputerSetting.Volume[1]);
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
                    if (tokenData.Role === App.Roles.TC) {
                        // seat computer
                        this.boxSubscriber.unsubscribe(this.session);
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
                    case App.Global.SignalTypes.GroupChanged:
                        this.groupChangedSignalReceived(event);
                        break;
                }
            }
            turnAvSignalReceived(event) {
                let data = JSON.parse(event.data);
                if (data.role === undefined || data.role === App.Roles.PC) {
                    if (data.audio !== null) {
                        this.dataResponse.ComputerSetting.Audio = data.audio;
                        this.boxPublisher.audio(data.audio);
                        this.switchButtonAudio.setStatus(this.dataResponse.ComputerSetting.Audio ? App.Components.SwitchButtonStatus.Start : App.Components.SwitchButtonStatus.Stop);
                    }
                    if (data.video !== null) {
                        this.dataResponse.ComputerSetting.Video = data.video;
                        this.boxPublisher.video(data.video);
                        this.switchButtonVideo.setStatus(this.dataResponse.ComputerSetting.Video ? App.Components.SwitchButtonStatus.Start : App.Components.SwitchButtonStatus.Stop);
                    }
                }
            }
            volumeSignalReceived(event) {
                let data = JSON.parse(event.data);
                if (data.volume[1] !== null) {
                    this.dataResponse.ComputerSetting.Volume[1] = data.volume[1];
                    this.boxSubscriber.audioVolume(data.volume[1]);
                }
            }
            turnOffSignalReceived(event) {
                let data = JSON.parse(event.data);
                if (data.role === undefined || data.role === App.Roles.PC) {
                    this.disconnect();
                }
            }
            chatSignalReceived(event) {
                let data = JSON.parse(event.data);
                if (data.type === App.Global.ChatType.Public) {
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
            groupChangedSignalReceived(event) {
                let data = JSON.parse(event.data);
                data.addUids.forEach((uid) => {
                    let added = this.addGroupComputer(uid);
                    if (added) {
                        if (this.switchButtonHand.getStatus() === App.Components.SwitchButtonStatus.Stop) {
                            let connection = this.getConnectionByUid(uid);
                            App.Global.Signaling.sendSignal(this.session, connection, App.Global.SignalTypes.RaiseHand, { raised: true });
                        }
                    }
                });
                data.removeUids.forEach((uid) => {
                    this.removeGroupComputer(uid);
                });
            }
            raiseHand() {
                App.Global.Signaling.sendSignal(this.session, this.getScConnection(), App.Global.SignalTypes.RaiseHand, { raised: true });
                App.Global.Signaling.sendSignal(this.session, this.getAcConnection(), App.Global.SignalTypes.RaiseHand, { raised: true });
                this.getFcConnections().forEach((c) => {
                    App.Global.Signaling.sendSignal(this.session, c, App.Global.SignalTypes.RaiseHand, { raised: true });
                });
                this.switchButtonHand.setStatus(App.Components.SwitchButtonStatus.Stop);
            }
            lowerHand() {
                App.Global.Signaling.sendSignal(this.session, this.getScConnection(), App.Global.SignalTypes.RaiseHand, { raised: false });
                App.Global.Signaling.sendSignal(this.session, this.getAcConnection(), App.Global.SignalTypes.RaiseHand, { raised: false });
                this.getFcConnections().forEach((c) => {
                    App.Global.Signaling.sendSignal(this.session, c, App.Global.SignalTypes.RaiseHand, { raised: false });
                });
                this.switchButtonHand.setStatus(App.Components.SwitchButtonStatus.Start);
            }
            setChatUser(uid, name, role) {
                this.chatPublic.setChatUser({ uid: uid, name: name, role: role });
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
            turnAv(audio, video) {
                // set
                if (audio !== null) {
                    this.dataResponse.ComputerSetting.Audio = audio;
                    this.boxPublisher.audio(audio);
                    this.switchButtonAudio.setStatus(this.dataResponse.ComputerSetting.Audio ? App.Components.SwitchButtonStatus.Start : App.Components.SwitchButtonStatus.Stop);
                }
                if (video !== null) {
                    this.dataResponse.ComputerSetting.Video = video;
                    this.boxPublisher.video(video);
                    this.switchButtonVideo.setStatus(this.dataResponse.ComputerSetting.Video ? App.Components.SwitchButtonStatus.Start : App.Components.SwitchButtonStatus.Stop);
                }
                // update db
                $.ajax({
                    cache: false,
                    type: "POST",
                    url: this.props.actionUrl + "/TurnAv",
                    data: JSON.stringify({ audio: audio, video: video }),
                    contentType: "application/json",
                    success: (r) => {
                        // send signal
                        App.Global.Signaling.sendSignal(this.session, this.getAcConnection(), App.Global.SignalTypes.TurnAv, { audio: audio, video: video });
                    },
                    error: (xhr, status, error) => {
                        // error
                        alert("ERROR: " + error);
                    }
                });
            }
            setStatusVisibility(visible) {
                this.divStatus.style.display = visible ? "block" : "none";
            }
            setLayoutVisibility(visible) {
                // body1 style
                let body1 = document.getElementById("Body1");
                body1.className = visible ? "lightBody" : "darkBody";
                /*
                // divBody1 class
                let divBody1: HTMLElement = document.getElementById("DivBody1");
                divBody1.className = visible ? "divBody" : "";
    
                // header1
                let header1: HTMLElement = document.getElementById("Header1");
                header1.style.display = visible ? "block" : "none";
    
                // footer1
                let footer1: HTMLElement = document.getElementById("Footer1");
                footer1.style.display = visible ? "block" : "none";
                */
            }
            setUiVisibility(visible) {
                this.setLayoutVisibility(!visible);
                this.divUI.style.display = visible ? "block" : "none";
                if (visible) {
                    window.setTimeout(() => this.fitLayout(), 0);
                }
            }
            fitLayout() {
                let header1 = document.getElementById("Header1");
                let footer1 = document.getElementById("Footer1");
                let windowHeight = $(window).innerHeight();
                let headerHeight = $(header1).outerHeight();
                let footerHeight = $(footer1).outerHeight();
                let innerHeight = windowHeight - (headerHeight + footerHeight + 90); // 90 = padding
                if (innerHeight < 400) {
                    innerHeight = 400;
                }
                $(this.boxSubscriber.getBox())
                    .css("width", "100%")
                    .css("height", innerHeight + "px");
                $(this.label.getParentDiv())
                    .css("width", $(this.boxSubscriber.getBox()).width() + "px")
                    .css("left", $(this.boxSubscriber.getBox()).position().left + "px")
                    .css("top", ($(this.boxSubscriber.getBox()).position().top + $(this.boxSubscriber.getBox()).height() - $(this.label.getParentDiv()).height()) + "px");
                // frame
                let frameWidth = $(this.divFrame).width();
                let publisherHeight = Math.round(frameWidth / 16 * 9);
                $(this.boxPublisher.getBox())
                    .css("width", "100%")
                    .css("height", publisherHeight + "px");
                let divButtonsHeight = $(this.divButtons).height();
                let chatHeight = innerHeight - (publisherHeight + divButtonsHeight);
                this.chatPublic.setHeight(chatHeight);
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
                    "" // handRaised (no need for PC)
                ];
                return (React.createElement("div", {className: "pcContainer"}, React.createElement("div", {ref: (ref) => this.divStatus = ref}, React.createElement(App.Components.Status, {ref: (ref) => this.status = ref, text: "Connecting ...", style: App.Components.StatusStyle.Connecting, className: "cStatus", statusClasses: statusClasses})), React.createElement("div", {ref: (ref) => this.divUI = ref, style: { display: "none" }, className: "layout"}, React.createElement("table", {width: "100%", frameBorder: "0"}, React.createElement("tr", null, React.createElement("td", null, React.createElement("div", {ref: (ref) => this.divMain = ref, className: "main"}, React.createElement(App.Components.Box, {ref: (ref) => this.boxSubscriber = ref, id: this.props.targetId + "_Subscriber1", streamProps: this.subscribeProps, className: "cBox", visible: true}), React.createElement(App.Components.BoxLabel, {ref: (ref) => this.label = ref, text: "Teacher computer not connected...", style: App.Components.BoxLabelStyle.NotConnected, className: "cBoxLabel", labelClasses: labelClasses, visible: true})), React.createElement("div", {ref: (ref) => this.divFrame = ref, className: "frame"}, React.createElement("div", {ref: (ref) => this.divButtons = ref, className: "divButtons"}, React.createElement("div", null, React.createElement(App.Components.SwitchButton, {ref: (ref) => this.switchButtonHand = ref, textOn: "Raise your hand", textOff: "Lower your hand", classOn: "btn btn-success", classOff: "btn btn-danger", iconOn: "glyphicon glyphicon-hand-up", iconOff: "glyphicon glyphicon-hand-down", status: App.Components.SwitchButtonStatus.Start, onOn: this.raiseHand.bind(this), onOff: this.lowerHand.bind(this), className: "handButton"})), React.createElement("div", null, React.createElement(App.Components.SwitchButton, {ref: (ref) => this.switchButtonAudio = ref, textOn: "", textOff: "", classOn: "btn btn-success", classOff: "btn btn-danger", iconOn: "glyphicon glyphicon-music", iconOff: "glyphicon glyphicon-music", status: App.Components.SwitchButtonStatus.Hidden, onOn: () => { this.turnAv(false, null); }, onOff: () => { this.turnAv(true, null); }, className: "avButton"})), React.createElement("div", null, React.createElement(App.Components.SwitchButton, {ref: (ref) => this.switchButtonVideo = ref, textOn: "", textOff: "", classOn: "btn btn-success", classOff: "btn btn-danger", iconOn: "glyphicon glyphicon-facetime-video", iconOff: "glyphicon glyphicon-facetime-video", status: App.Components.SwitchButtonStatus.Hidden, onOn: () => { this.turnAv(null, false); }, onOff: () => { this.turnAv(null, true); }, className: "avButton"}))), React.createElement(App.Components.Box, {ref: (ref) => this.boxPublisher = ref, id: this.props.targetId + "_Publisher1", streamProps: this.publishProps, className: "cBoxP", visible: true}), React.createElement(App.Components.Chat, {ref: (ref) => this.chatPublic = ref, title: "Classroom chat (Public)", fixedHeight: true, onItemSubmitted: (item) => this.onChatPublicItemSubmitted(item)}))))))));
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