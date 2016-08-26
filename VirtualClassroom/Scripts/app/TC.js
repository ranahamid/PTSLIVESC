/* tslint:disable:max-line-length */
var VC;
(function (VC) {
    var App;
    (function (App) {
        "use strict";
        class TC extends App.XC {
            constructor(props) {
                super(props, App.Roles.TC);
            }
            // abstract methods
            setStatusText(text, style) {
                this.setStatusVisibility(true);
                this.status.setText(text, style);
            }
            didMount() {
                $(window).resize(() => this.fitHeightOfBox());
            }
            connected(connection) {
                let tokenData = App.Global.Fce.toTokenData(connection.data);
                if (this.dataResponse.Uid === tokenData.Uid) {
                    // me
                    this.setStatusVisibility(false);
                    this.setUiVisibility(true);
                    // show share screen button
                    this.switchButton.setStatus(App.Components.SwitchButtonStatus.Start);
                }
                else if (this.isInMyGroup(tokenData.Uid)) {
                    // my group
                    if (tokenData.Role === App.Roles.PC) {
                        // student
                        this.connectedPCsChanged();
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
                    this.setStatusText("Disconnected from the session.", App.Components.StatusStyle.Error);
                    // hide share screen button
                    this.switchButton.setStatus(App.Components.SwitchButtonStatus.Hidden);
                }
                else {
                    if (tokenData.Role === App.Roles.PC) {
                        // student
                        this.connectedPCsChanged();
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
            }
            streamDestroyed(connection, stream) {
                let tokenData = App.Global.Fce.toTokenData(connection.data);
                if (this.dataResponse.Uid === tokenData.Uid) {
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
                    case App.Global.SignalTypes.TurnOff:
                        this.turnOffSignalReceived(event);
                        break;
                    case App.Global.SignalTypes.Forms:
                        this.formsSignalReceived(event);
                        break;
                }
            }
            turnAvSignalReceived(event) {
                var data = JSON.parse(event.data);
                if (data.audio != null) {
                    this.dataResponse.ComputerSetting.Audio = data.audio;
                    this.boxPublisher.audio(data.audio);
                }
                if (data.video != null) {
                    this.dataResponse.ComputerSetting.Video = data.video;
                    this.boxPublisher.video(data.video);
                }
            }
            turnOffSignalReceived(event) {
                this.disconnect();
            }
            formsSignalReceived(event) {
                let data = JSON.parse(event.data);
                if (data.formId !== undefined && data.answerId !== undefined) {
                    if (data.type === VC.Forms.FormType.Survey && this.divUIsurveys.style.display === "block") {
                        this.surveys.answerReceived(data.formId, data.answerId, data.status);
                    }
                    else if (data.type === VC.Forms.FormType.Poll && this.divUIpolls.style.display === "block") {
                        this.polls.answerReceived(data.formId, data.answerId, data.status, data.resultData);
                    }
                }
            }
            publishStarted(event) {
                this.switchButton.setStatus(App.Components.SwitchButtonStatus.Stop);
            }
            publishStopped(event) {
                this.boxPublisher.clearBox();
                this.switchButton.setStatus(App.Components.SwitchButtonStatus.Start);
            }
            screenSharingOn() {
                this.switchButton.setStatus(App.Components.SwitchButtonStatus.Hidden);
                this.boxPublisher.publish(this.session, App.PublishSources.Screen, this.dataResponse.ComputerSetting.Audio, this.dataResponse.ComputerSetting.Video, this.publishStarted.bind(this), this.publishStopped.bind(this));
            }
            screenSharingOff() {
                this.switchButton.setStatus(App.Components.SwitchButtonStatus.Hidden);
                this.boxPublisher.unpublish(this.session);
            }
            connectedPCsChanged() {
                let connectedPCs = [];
                this.connections.forEach((connection) => {
                    let tokenData = App.Global.Fce.toTokenData(connection.data);
                    if (tokenData.Role === App.Roles.PC) {
                        connectedPCs.push(tokenData.Uid);
                    }
                });
                this.surveys.connectedPCsChanged(connectedPCs);
                this.polls.connectedPCsChanged(connectedPCs);
            }
            onFormSent() {
                // send signal to all connected students for refresh
                let connections = this.getConnectionsOfMyGroup(App.Roles.PC);
                connections.forEach((c) => {
                    App.Global.Signaling.sendSignal(this.session, c, App.Global.SignalTypes.Forms, {});
                });
            }
            onAnswerDeleted(pcUid) {
                // send signal to selected student for refresh
                let connection = this.getConnectionByUid(pcUid);
                if (connection !== null) {
                    App.Global.Signaling.sendSignal(this.session, connection, App.Global.SignalTypes.Forms, {});
                }
            }
            onAllAnswersDeleted(formId) {
                // send signal to all connected students to delete form answers
                let connections = this.getConnectionsOfMyGroup(App.Roles.PC);
                connections.forEach((c) => {
                    App.Global.Signaling.sendSignal(this.session, c, App.Global.SignalTypes.Forms, {});
                });
            }
            setStatusVisibility(visible) {
                this.divStatus.style.display = visible ? "block" : "none";
            }
            setUiVisibility(visible) {
                this.divUI.style.display = visible ? "block" : "none";
                if (visible) {
                    this.fitHeightOfBox();
                }
            }
            fitHeightOfBox() {
                var boxPublisher1 = this.boxPublisher.getBox();
                $(boxPublisher1).css("height", ($(boxPublisher1).width() / 16 * 9) + "px");
            }
            tabOnClick(id) {
                this.tabs.selectItem(id);
                if (id === 0) {
                    this.divUIsurveys.style.display = "none";
                    this.divUIpolls.style.display = "none";
                    this.divUIscreensharing.style.display = "block";
                }
                else if (id === 1) {
                    this.divUIscreensharing.style.display = "none";
                    this.divUIpolls.style.display = "none";
                    this.divUIsurveys.style.display = "block";
                    this.surveys.init();
                }
                else if (id === 2) {
                    this.divUIscreensharing.style.display = "none";
                    this.divUIsurveys.style.display = "none";
                    this.divUIpolls.style.display = "block";
                    this.polls.init();
                }
            }
            render() {
                let tabItems = [
                    { id: 0, title: "Screen sharing", onClick: this.tabOnClick.bind(this), active: true },
                    { id: 1, title: "Surveys", onClick: this.tabOnClick.bind(this), active: false },
                    { id: 2, title: "Polls", onClick: this.tabOnClick.bind(this), active: false }
                ];
                var statusClasses = [
                    "alert alert-warning",
                    "alert alert-success",
                    "alert alert-danger" // error
                ];
                return (React.createElement("div", {className: "_cContainer"}, React.createElement("div", {ref: (ref) => this.divStatus = ref}, React.createElement(App.Components.Status, {ref: (ref) => this.status = ref, text: "Connecting ...", style: App.Components.StatusStyle.Connecting, className: "cStatus", statusClasses: statusClasses})), React.createElement("div", {ref: (ref) => this.divUI = ref, style: { display: "none" }}, React.createElement(VC.Global.Components.Tabs, {ref: (ref) => this.tabs = ref, items: tabItems, className: "cTabs"}), React.createElement("div", {ref: (ref) => this.divUIscreensharing = ref, style: { display: "block" }}, React.createElement("div", {style: { display: (this.state.extensionError === "" ? "none" : "block") }}, React.createElement("div", {className: "alert alert-danger"}, React.createElement("span", {className: "glyphicon glyphicon-warning-sign"}), " ", this.state.extensionError)), React.createElement("div", {style: { display: (this.state.extensionError !== "" ? "none" : "block") }}, React.createElement(App.Components.SwitchButton, {ref: (ref) => this.switchButton = ref, status: App.Components.SwitchButtonStatus.Hidden, textOn: "Start screen sharing", textOff: "Stop screen sharing", classOn: "btn btn-success", classOff: "btn btn-danger", iconOn: "glyphicon glyphicon-blackboard", iconOff: "glyphicon glyphicon-blackboard", onOn: this.screenSharingOn.bind(this), onOff: this.screenSharingOff.bind(this), className: "sharingButton"}), React.createElement(App.Components.Box, {ref: (ref) => this.boxPublisher = ref, id: this.props.targetId + "_Publisher1", streamProps: this.publishProps, className: "cBox", visible: true}))), React.createElement("div", {ref: (ref) => this.divUIsurveys = ref, style: { display: "none" }}, React.createElement(App.TC.SurveysTc, {ref: (ref) => this.surveys = ref, onFormSent: () => this.onFormSent(), onAnswerDeleted: (pcUid) => this.onAnswerDeleted(pcUid), onAllAnswersDeleted: (formId) => this.onAllAnswersDeleted(formId), actionUrl: this.props.actionUrl})), React.createElement("div", {ref: (ref) => this.divUIpolls = ref, style: { display: "none" }}, React.createElement(App.TC.PollsTc, {ref: (ref) => this.polls = ref, onFormSent: () => this.onFormSent(), onAnswerDeleted: (pcUid) => this.onAnswerDeleted(pcUid), onAllAnswersDeleted: (formId) => this.onAllAnswersDeleted(formId), actionUrl: this.props.actionUrl})))));
            }
        }
        class InitTC {
            constructor(targetId, actionUrl) {
                ReactDOM.render(React.createElement("div", null, React.createElement(TC, {targetId: targetId, actionUrl: actionUrl})), document.getElementById(targetId));
            }
        }
        App.InitTC = InitTC;
    })(App = VC.App || (VC.App = {}));
})(VC || (VC = {}));
//# sourceMappingURL=TC.js.map