// A '.tsx' file enables JSX support in the TypeScript compiler, 
// for more information see the following page on the TypeScript wiki:
// https://github.com/Microsoft/TypeScript/wiki/JSX
/* tslint:disable:max-line-length */
var VC;
(function (VC) {
    var App;
    (function (App) {
        "use strict";
        class PC extends App.XC {
            constructor(props) {
                super(props, App.Roles.Moderator);
                this.singleBoxVisible = false;
                this.studentsAudio = new App.Components.Audio();
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
                        // started
                        if (this.dataResponse.ComputerSetting.Audio) {
                            // send signal to subscribe my audio
                            App.Global.Signaling.sendSignalAll(this.session, App.Global.SignalTypes.AudioPublish, {
                                studentUid: this.dataResponse.Uid,
                                audionOn: true
                            });
                        }
                    }, (event) => {
                        // stopped
                        if (this.dataResponse.ComputerSetting.Audio) {
                            // send signal to unsubscribe my audio
                            App.Global.Signaling.sendSignalAll(this.session, App.Global.SignalTypes.AudioPublish, {
                                studentUid: this.dataResponse.Uid,
                                audionOn: false
                            });
                        }
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
                        if (this.switchButtonHand.getStatus() === App.Components.SwitchButtonStatus.Stop) {
                            App.Global.Signaling.sendSignal(this.session, connection, App.Global.SignalTypes.RaiseHand, { raised: true });
                        }
                    }
                    else if (tokenData.Role === App.Roles.FC) {
                        // featured computer
                        if (this.switchButtonHand.getStatus() === App.Components.SwitchButtonStatus.Stop) {
                            App.Global.Signaling.sendSignal(this.session, connection, App.Global.SignalTypes.RaiseHand, { raised: true });
                        }
                    }
                    else if (tokenData.Role === App.Roles.TC) {
                        // teacher computer
                        this.label.setText(tokenData.Name + " connected.", App.Components.BoxLabelStyle.Connected);
                        // send notification that im connected
                        App.Global.Signaling.sendSignal(this.session, connection, App.Global.SignalTypes.Connected, {});
                        // send signal to subscribe to my audio
                        if (this.dataResponse.ComputerSetting.Audio && this.boxPublisher.isConnected) {
                            App.Global.Signaling.sendSignal(this.session, connection, App.Global.SignalTypes.AudioPublish, {
                                studentUid: this.dataResponse.Uid,
                                audionOn: true
                            });
                        }
                    }
                    else if (tokenData.Role === App.Roles.PC || tokenData.Role === App.Roles.Moderator) {
                        // send signal to subscribe to my audio
                        if (this.dataResponse.ComputerSetting.Audio && this.boxPublisher.isConnected) {
                            App.Global.Signaling.sendSignal(this.session, connection, App.Global.SignalTypes.AudioPublish, {
                                studentUid: this.dataResponse.Uid,
                                audionOn: true
                            });
                        }
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
                    if (tokenData.Role === App.Roles.TC) {
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
                        // teacher computer
                        this.boxSubscriber.subscribe(this.session, stream, this.dataResponse.ComputerSetting.Volume);
                    }
                    else if (tokenData.Role === App.Roles.Moderator) {
                    }
                }
            }
            streamDestroyed(connection, stream) {
                let tokenData = App.Global.Fce.toTokenData(connection.data);
                if (this.dataResponse.Uid === tokenData.Uid) {
                }
                else if (this.isInMyGroup(tokenData.Uid)) {
                    // my group
                    if (tokenData.Role === App.Roles.TC) {
                        // teacher computer
                        this.boxSubscriber.unsubscribe(this.session);
                    }
                    else if (tokenData.Role === App.Roles.Moderator) {
                        // student computer
                        this.studentsAudio.unsubscribe(tokenData.Uid, this.session, stream);
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
                    case App.Global.SignalTypes.AudioPublish:
                        this.audioPublishSignalReceived(event);
                        break;
                    case App.Global.SignalTypes.RaiseHand:
                        this.raiseHandSignalReceived(event);
                        break;
                }
            }
            turnAvSignalReceived(event) {
                let data = JSON.parse(event.data);
                if (data.role === undefined || data.role === App.Roles.Moderator) {
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
                if (data.volume !== null) {
                    this.dataResponse.ComputerSetting.Volume = data.volume;
                    this.boxSubscriber.audioVolume(data.volume);
                    this.studentsAudio.audioVolume(data.volume);
                }
            }
            turnOffSignalReceived(event) {
                let data = JSON.parse(event.data);
                if (data.role === undefined || data.role === App.Roles.Moderator) {
                    this.disconnect();
                }
            }
            raiseHandSignalReceived(event) {
                let tokenData = App.Global.Fce.toTokenData(event.from.data);
                if (tokenData.Role === App.Roles.AC) {
                    // can be received from AC only
                    let data = JSON.parse(event.data);
                    if (data.raised) {
                        this.raiseHand();
                    }
                    else {
                        this.lowerHand();
                    }
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
            audioPublishSignalReceived(event) {
                let data = JSON.parse(event.data);
                if (this.isInMyGroup(data.studentUid)) {
                    if (data.audionOn) {
                        // subscribe to audio
                        this.studentsAudio.subscribe(data.studentUid, this.session, this.getStream(data.studentUid), this.dataResponse.ComputerSetting.Volume);
                    }
                    else {
                        // unsubscribe from audio
                        this.studentsAudio.unsubscribe(data.studentUid, this.session, this.getStream(data.studentUid));
                    }
                }
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
                    // send signal to subscribe/unsubsribe my audio
                    App.Global.Signaling.sendSignalAll(this.session, App.Global.SignalTypes.AudioPublish, {
                        studentUid: this.dataResponse.Uid,
                        audionOn: audio
                    });
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
                        console.log("ERROR 0x01: " + error);
                    }
                });
            }
            setStatusVisibility(visible) {
                this.divStatus.style.display = visible ? "block" : "none";
            }
            setLayoutVisibility(visible) {
                // body1 style
                let body1 = document.getElementById("Body1");
                body1.className = visible ? "lightBody" : "Gray98";
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
                if (innerHeight < 580) {
                    innerHeight = 580;
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
                return (React.createElement("div", {className: "pcContainer"}, React.createElement("div", {ref: (ref) => this.divStatus = ref}, React.createElement(App.Components.Status, {ref: (ref) => this.status = ref, text: "Connecting ...", style: App.Components.StatusStyle.Connecting, className: "cStatus", statusClasses: statusClasses})), React.createElement("div", {ref: (ref) => this.divUI = ref, style: { display: "none" }, className: "layout"}, React.createElement("table", {width: "100%", frameBorder: "0"}, React.createElement("tr", null, React.createElement("td", null, React.createElement("div", {ref: (ref) => this.divMain = ref, className: "main"}, React.createElement(App.Components.Box, {ref: (ref) => this.boxSubscriber = ref, id: this.props.targetId + "_Subscriber1", streamProps: this.subscribeProps, className: "cBox", visible: true, style: App.Components.BoxStyle.NotConnected, BoxClasses: labelClasses}), React.createElement(App.Components.BoxLabel, {ref: (ref) => this.label = ref, text: "", style: App.Components.BoxLabelStyle.NoIcon, className: "cBoxLabel", labelClasses: labelClasses, visible: true})), React.createElement("div", {ref: (ref) => this.divFrame = ref, className: "frame"}, React.createElement("div", {ref: (ref) => this.divButtons = ref, className: "divButtons"}, React.createElement("div", null, React.createElement(App.Components.SwitchButton, {ref: (ref) => this.switchButtonVideo = ref, textOn: "", textOff: "", classOn: "btn  btn-successWhite", classOff: "btn btn-danger", iconOn: "glyphicon facetime-video-on icon-btn-color-on", iconOff: "glyphicon facetime-video-off  icon-btn-color-off", status: App.Components.SwitchButtonStatus.Hidden, onOn: () => { this.turnAv(null, false); }, onOff: () => { this.turnAv(null, true); }, className: "avButton", delayed: 500})), React.createElement("div", null, React.createElement(App.Components.SwitchButton, {ref: (ref) => this.switchButtonAudio = ref, textOn: "", textOff: "", classOn: "btn  btn-successWhite", classOff: "btn btn-danger", iconOn: "glyphicon music-on  icon-btn-color-on", iconOff: "glyphicon music-off icon-btn-color-off", status: App.Components.SwitchButtonStatus.Hidden, onOn: () => { this.turnAv(false, null); }, onOff: () => { this.turnAv(true, null); }, className: "avButton", delayed: 500})), React.createElement("div", {style: { display: "none" }}, React.createElement(App.Components.SwitchButton, {ref: (ref) => this.switchButtonHand = ref, textOn: "", textOff: "", classOn: "btn btn-successWhite", classOff: "btn btn-danger ", iconOn: "glyphicon rise-hand-on  icon-btn-color-on", iconOff: "glyphicon rise-hand-off icon-btn-color-off", status: App.Components.SwitchButtonStatus.Start, onOn: this.raiseHand.bind(this), onOff: this.lowerHand.bind(this), className: "handButton", delayed: 500}))), React.createElement("div", {className: "top-panel"}, React.createElement("div", {className: 'header-button2'}, React.createElement("span", {id: "video-text"}, "Video"), React.createElement("button", {id: 'minimizevideo'}, React.createElement("i", {class: "fa fa-window-minimize", "aria-hidden": "true"}))), React.createElement(App.Components.Box, {ref: (ref) => this.boxPublisher = ref, id: this.props.targetId + "_Publisher1", streamProps: this.publishProps, className: "cBoxP", visible: true, style: App.Components.BoxStyle.NotConnected, BoxClasses: labelClasses})), React.createElement(App.Components.Chat, {ref: (ref) => this.chatPublic = ref, title: "Message Cohort (Public)", fixedHeight: true, onItemSubmitted: (item) => this.onChatPublicItemSubmitted(item)}))))))));
            }
        }
        class InitModerator {
            constructor(targetId, classroomId, actionUrl) {
                ReactDOM.render(React.createElement("div", null, React.createElement(PC, {targetId: targetId, classroomId: classroomId, actionUrl: actionUrl})), document.getElementById(targetId));
            }
        }
        App.InitModerator = InitModerator;
    })(App = VC.App || (VC.App = {}));
})(VC || (VC = {}));
//# sourceMappingURL=Moderator.js.map