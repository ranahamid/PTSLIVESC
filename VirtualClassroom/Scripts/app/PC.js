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
                }
                else if (this.isInMyGroup(tokenData.Uid)) {
                    // my group
                    if (tokenData.Role === App.Roles.SC) {
                        // show raise hand button
                        this.switchButton.setStatus(App.Components.SwitchButtonStatus.Start);
                    }
                    else if (tokenData.Role === App.Roles.TC) {
                        // seat computer
                        this.label.setText(tokenData.Name + " connected.", App.Components.BoxLabelStyle.Connected);
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
                        // hide raise hand button
                        this.switchButton.setStatus(App.Components.SwitchButtonStatus.Hidden);
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
                if (data.volume[1] != null) {
                    this.dataResponse.ComputerSetting.Volume[1] = data.volume[1];
                    this.boxSubscriber.audioVolume(data.volume[1]);
                }
            }
            turnOffSignalReceived(event) {
                this.disconnect();
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
                // box
                $(this.boxSubscriber.getBox())
                    .css("width", "100%")
                    .css("height", windowHeight + "px");
                // label
                $(this.label.getParentDiv())
                    .css("width", "100%")
                    .css("left", $(this.boxSubscriber.getBox()).position().left + "px")
                    .css("top", ($(this.boxSubscriber.getBox()).position().top + $(this.boxSubscriber.getBox()).height() - $(this.label.getParentDiv()).height()) + "px");
                $(this.divHandButton)
                    .css("top", ($(this.label.getParentDiv()).position().top - $(this.divHandButton).height()) + "px");
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
                return (React.createElement("div", {className: "pcContainer"}, React.createElement("div", {ref: (ref) => this.divStatus = ref}, React.createElement(App.Components.Status, {ref: (ref) => this.status = ref, text: "Connecting ...", style: App.Components.StatusStyle.Connecting, className: "cStatus", statusClasses: statusClasses})), React.createElement("div", {ref: (ref) => this.divUI = ref, style: { display: "none" }}, React.createElement("div", {style: { display: "none" }}, React.createElement(App.Components.Box, {ref: (ref) => this.boxPublisher = ref, id: this.props.targetId + "_Publisher1", streamProps: this.publishProps, className: "cBoxP", visible: true})), React.createElement("div", null, React.createElement(App.Components.Box, {ref: (ref) => this.boxSubscriber = ref, id: this.props.targetId + "_Subscriber1", streamProps: this.subscribeProps, className: "cBox", visible: true}), React.createElement(App.Components.BoxLabel, {ref: (ref) => this.label = ref, text: "Teacher computer not connected...", style: App.Components.BoxLabelStyle.NotConnected, className: "cBoxLabel", labelClasses: labelClasses, visible: true}), React.createElement("div", {ref: (ref) => this.divHandButton = ref, className: "divHandButton"}, React.createElement(App.Components.SwitchButton, {ref: (ref) => this.switchButton = ref, textOn: "Raise your hand", textOff: "Lower your hand", classOn: "btn btn-success", classOff: "btn btn-danger", iconOn: "glyphicon glyphicon-hand-up", iconOff: "glyphicon glyphicon-hand-down", status: App.Components.SwitchButtonStatus.Hidden, onOn: this.raiseHand.bind(this), onOff: this.lowerHand.bind(this), className: "handButton"}))))));
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