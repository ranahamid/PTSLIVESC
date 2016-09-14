/* tslint:disable:max-line-length */

namespace VC.App {
    "use strict";

    class TC extends XC {
        private status: Components.Status;
        private switchButtonScreensharing: Components.SwitchButton;
        private switchButtonWebcam: Components.SwitchButton;
        private boxPublisherScreen: Components.Box;
        private boxPublisherWebcam: Components.Box;
        private divStatus: HTMLDivElement;
        private divUI: HTMLDivElement;
        private tabs: VC.Global.Components.Tabs;
        private divUIwebcam: HTMLDivElement;
        private divUIscreensharing: HTMLDivElement;
        private divUIsurveys: HTMLDivElement;
        private divUIpolls: HTMLDivElement;
        private surveys: TC.SurveysTc;
        private polls: TC.PollsTc;
        private isWebcamPublishing: boolean = false;
        private isScreenSharing: boolean = false;
        private chMirror: HTMLInputElement;
        private divMirror: HTMLDivElement;

        constructor(props: IProps) {
            super(props, Roles.TC);
        }

        // abstract methods
        setStatusText(text: string, style: Components.StatusStyle): void {
            this.setStatusVisibility(true);
            this.status.setText(text, style);
        }

        didMount(): void {
            $(window).resize(() => this.fitHeightOfBox());
        }
        connected(connection: any): void {
            let tokenData: Global.TokenData = Global.Fce.toTokenData(connection.data);
            if (this.dataResponse.Uid === tokenData.Uid) {
                // me
                this.setStatusVisibility(false);
                this.setUiVisibility(true);
                // show share screen button
                this.switchButtonScreensharing.setStatus(Components.SwitchButtonStatus.Start);
            } else if (this.isInMyGroup(tokenData.Uid)) {
                // my group
                if (tokenData.Role === Roles.PC) {
                    // student
                    this.connectedPCsChanged();
                }
            } else if (tokenData.Role === Roles.AC) {
                // admin computer
                Global.Signaling.sendSignal<Global.ISignalConnectedData>(this.session, this.getAcConnection(), Global.SignalTypes.Connected,
                    {
                        audio: this.dataResponse.ComputerSetting.Audio,
                        video: this.dataResponse.ComputerSetting.Video,
                        volume: this.dataResponse.ComputerSetting.Volume
                    } as Global.ISignalConnectedData);
            }
        }
        disconnected(connection: any): void {
            let tokenData: Global.TokenData = Global.Fce.toTokenData(connection.data);
            if (this.dataResponse.Uid === tokenData.Uid) {
                // me
                this.setStatusText("Disconnected from the session.", Components.StatusStyle.Error);
                // hide share screen button
                this.switchButtonScreensharing.setStatus(Components.SwitchButtonStatus.Hidden);
            } else {
                if (tokenData.Role === Roles.PC) {
                    // student
                    this.connectedPCsChanged();
                }
            }
        }
        sessionConnected(event: any): void {
            // nothing to do
        }
        sessionDisconnected(event: any): void {
            this.setUiVisibility(false);
            this.setStatusVisibility(true);
        }
        streamCreated(connection: any, stream: any): void {
            let tokenData: Global.TokenData = Global.Fce.toTokenData(connection.data);
            if (this.dataResponse.Uid === tokenData.Uid) {
                // me .. there is not fired this event for publisher
            }
        }
        streamDestroyed(connection: any, stream: any): void {
            let tokenData: Global.TokenData = Global.Fce.toTokenData(connection.data);
            if (this.dataResponse.Uid === tokenData.Uid) {
                // me .. there is not fired this event for publisher
            }
        }
        streamPropertyChanged(event: any): void {
            // nothing to do
        }

        signalReceived(event: any): void {
            let signalType: Global.SignalTypes = Global.Signaling.getSignalType(event.type);
            switch (signalType) {
                case Global.SignalTypes.TurnAv:
                    this.turnAvSignalReceived(event);
                    break;
                case Global.SignalTypes.TurnOff:
                    this.turnOffSignalReceived(event);
                    break;
                case Global.SignalTypes.Forms:
                    this.formsSignalReceived(event);
                    break;
            }
        }
        private turnAvSignalReceived(event: any): void {
            var data: Global.ISignalTurnAvData = JSON.parse(event.data) as Global.ISignalTurnAvData;
            if (data.audio != null) {
                this.dataResponse.ComputerSetting.Audio = data.audio;
                this.boxPublisherScreen.audio(data.audio);
            }
            if (data.video != null) {
                this.dataResponse.ComputerSetting.Video = data.video;
                this.boxPublisherScreen.video(data.video);
            }
        }
        private turnOffSignalReceived(event: any): void {
            this.disconnect();
        }
        private formsSignalReceived(event: any): void {
            let data: Global.ISignalFormsData = JSON.parse(event.data) as Global.ISignalFormsData;
            if (data.formId !== undefined && data.answerId !== undefined) {
                if (data.type === Forms.FormType.Survey && this.divUIsurveys.style.display === "block") {
                    this.surveys.answerReceived(data.formId, data.answerId, data.status);
                } else if (data.type === Forms.FormType.Poll && this.divUIpolls.style.display === "block") {
                    this.polls.answerReceived(data.formId, data.answerId, data.status, data.resultData);
                }
            }
        }

        private publishStarted(event: any): void {
            if (this.isScreenSharing) {
                this.switchButtonScreensharing.setStatus(Components.SwitchButtonStatus.Stop);
            } else {
                this.switchButtonWebcam.setStatus(Components.SwitchButtonStatus.Stop);
            }
        }
        private publishStopped(event: any): void {
            if (this.isScreenSharing) {
                this.boxPublisherScreen.clearBox();
                this.switchButtonScreensharing.setStatus(Components.SwitchButtonStatus.Start);
                this.isScreenSharing = false;
                this.tabs.showTab(0);
            } else {
                this.boxPublisherWebcam.clearBox();
                this.switchButtonWebcam.setStatus(Components.SwitchButtonStatus.Start);
                this.isWebcamPublishing = false;
                this.tabs.showTab(1);
                this.divMirror.style.display = "block";
            }
        }

        private screenSharingOn(): void {
            this.isScreenSharing = true;
            this.tabs.hideTab(0);
            this.switchButtonScreensharing.setStatus(Components.SwitchButtonStatus.Hidden);
            this.boxPublisherScreen.publish(this.session, PublishSources.Screen, this.dataResponse.ComputerSetting.Audio, this.dataResponse.ComputerSetting.Video, this.publishStarted.bind(this), this.publishStopped.bind(this));
        }
        private screenSharingOff(): void {
            this.switchButtonScreensharing.setStatus(Components.SwitchButtonStatus.Hidden);
            this.boxPublisherScreen.unpublish(this.session);
        }

        private webcamPublishingOn(): void {
            this.isWebcamPublishing = true;
            this.tabs.hideTab(1);
            this.switchButtonWebcam.setStatus(Components.SwitchButtonStatus.Hidden);
            this.divMirror.style.display = "none";
            this.boxPublisherWebcam.setMirror(this.chMirror.checked);
            this.boxPublisherWebcam.publish(this.session, PublishSources.Camera, this.dataResponse.ComputerSetting.Audio, this.dataResponse.ComputerSetting.Video, this.publishStarted.bind(this), this.publishStopped.bind(this));
        }
        private webcamPublishingOff(): void {
            this.switchButtonWebcam.setStatus(Components.SwitchButtonStatus.Hidden);
            this.boxPublisherWebcam.unpublish(this.session);
        }

        private connectedPCsChanged(): void {
            let connectedPCs: Array<string> = [];
            this.connections.forEach((connection: any) => {
                let tokenData: Global.TokenData = Global.Fce.toTokenData(connection.data);
                if (tokenData.Role === Roles.PC) {
                    connectedPCs.push(tokenData.Uid);
                }
            });
            this.surveys.connectedPCsChanged(connectedPCs);
            this.polls.connectedPCsChanged(connectedPCs);
        }
        private onFormSent(): void {
            // send signal to all connected students for refresh
            let connections: Array<any> = this.getConnectionsOfMyGroup(Roles.PC);
            connections.forEach((c: any) => {
                Global.Signaling.sendSignal<Global.ISignalFormsData>(this.session, c, Global.SignalTypes.Forms, {} as Global.ISignalFormsData);
            });
        }
        private onAnswerDeleted(pcUid: string): void {
            // send signal to selected student for refresh
            let connection: any = this.getConnectionByUid(pcUid);
            if (connection !== null) {
                Global.Signaling.sendSignal<Global.ISignalFormsData>(this.session, connection, Global.SignalTypes.Forms, {} as Global.ISignalFormsData);
            }
        }
        private onAllAnswersDeleted(formId: string): void {
            // send signal to all connected students to delete form answers
            let connections: Array<any> = this.getConnectionsOfMyGroup(Roles.PC);
            connections.forEach((c: any) => {
                Global.Signaling.sendSignal<Global.ISignalFormsData>(this.session, c, Global.SignalTypes.Forms, {} as Global.ISignalFormsData);
            });
        }

        private setStatusVisibility(visible: boolean): void {
            this.divStatus.style.display = visible ? "block" : "none";
        }
        private setUiVisibility(visible: boolean): void {
            this.divUI.style.display = visible ? "block" : "none";
            if (visible) {
                this.fitHeightOfBox();
            }
        }

        private fitHeightOfBox(): void {
            var boxPublisherScreen: HTMLDivElement = this.boxPublisherScreen.getBox();
            $(boxPublisherScreen).css("height", ($(boxPublisherScreen).width() / 16 * 9) + "px");

            var boxPublisherWebcam: HTMLDivElement = this.boxPublisherWebcam.getBox();
            $(boxPublisherWebcam).css("height", ($(boxPublisherWebcam).width() / 16 * 9) + "px");
        }

        private tabOnClick(id: number): void {
            this.tabs.selectItem(id);

            this.divUIwebcam.style.display = "none";
            this.divUIscreensharing.style.display = "none";
            this.divUIsurveys.style.display = "none";
            this.divUIpolls.style.display = "none";

            if (id === 0) {
                this.divUIwebcam.style.display = "block";
            } else if (id === 1) {
                this.divUIscreensharing.style.display = "block";
            } else if (id === 2) {
                this.divUIsurveys.style.display = "block";
                this.surveys.init();
            } else if (id === 3) {
                this.divUIpolls.style.display = "block";
                this.polls.init();
            }
        }

        render(): JSX.Element {
            let tabItems: Array<VC.Global.Components.ITabItemProps> = [
                { id: 0, title: "Webcam publishing", onClick: this.tabOnClick.bind(this), active: true },
                { id: 1, title: "Screen sharing", onClick: this.tabOnClick.bind(this), active: false },
                { id: 2, title: "Surveys", onClick: this.tabOnClick.bind(this), active: false },
                { id: 3, title: "Polls", onClick: this.tabOnClick.bind(this), active: false }
            ];

            var statusClasses: Array<string> = [
                "alert alert-warning", // connecting
                "alert alert-success", // connected
                "alert alert-danger"   // error
            ];

            return (
                <div className="_cContainer">
                    <div ref={(ref: HTMLDivElement) => this.divStatus = ref}>
                        <Components.Status ref={(ref: Components.Status) => this.status = ref} text="Connecting ..." style={Components.StatusStyle.Connecting} className="cStatus" statusClasses={statusClasses} />
                    </div>
                    <div ref={(ref: HTMLDivElement) => this.divUI = ref} style={{ display: "none" }}>
                        <VC.Global.Components.Tabs ref={(ref: VC.Global.Components.Tabs) => this.tabs = ref} items={tabItems} className="cTabs" />

                        <div ref={(ref: HTMLDivElement) => this.divUIwebcam = ref} style={{ display: "block" }}>
                            <Components.SwitchButton ref={(ref: Components.SwitchButton) => this.switchButtonWebcam = ref} status={Components.SwitchButtonStatus.Start} textOn="Start webcam publishing" textOff="Stop webcam publishing" classOn="btn btn-success" classOff="btn btn-danger" iconOn="glyphicon glyphicon-blackboard" iconOff="glyphicon glyphicon-blackboard" onOn={this.webcamPublishingOn.bind(this) } onOff={this.webcamPublishingOff.bind(this) } className="publishingButton" />
                            <div style={{ float: "right", paddingTop: "10px", paddingRight: "15px" }} ref={(ref: HTMLDivElement) => this.divMirror = ref}><label><input ref={(ref: HTMLInputElement) => this.chMirror = ref} type="checkbox" /> Mirror video source</label></div>
                            <Components.Box ref={(ref: Components.Box) => this.boxPublisherWebcam = ref} fitMode={Components.BoxFitMode.Cover} id={this.props.targetId + "_PublisherWebcam"} streamProps={this.publishProps} className="cBox" visible={true} />
                        </div>

                        <div ref={(ref: HTMLDivElement) => this.divUIscreensharing = ref} style={{ display: "none" }}>
                            <div style={{ display: (this.state.extensionError === "" ? "none" : "block") }}>
                                <div className="alert alert-danger"><span className="glyphicon glyphicon-warning-sign"></span> {this.state.extensionError}</div>
                            </div>
                            <div style={{ display: (this.state.extensionError !== "" ? "none" : "block") }}>
                                <Components.SwitchButton ref={(ref: Components.SwitchButton) => this.switchButtonScreensharing = ref} status={Components.SwitchButtonStatus.Hidden} textOn="Start screen sharing" textOff="Stop screen sharing" classOn="btn btn-success" classOff="btn btn-danger" iconOn="glyphicon glyphicon-blackboard" iconOff="glyphicon glyphicon-blackboard" onOn={this.screenSharingOn.bind(this) } onOff={this.screenSharingOff.bind(this) } className="publishingButton" />
                                <Components.Box ref={(ref: Components.Box) => this.boxPublisherScreen = ref} id={this.props.targetId + "_PublisherScreen"} streamProps={this.publishProps} className="cBox" visible={true} />
                            </div>
                        </div>
                        <div ref={(ref: HTMLDivElement) => this.divUIsurveys = ref} style={{ display: "none" }}>
                            <App.TC.SurveysTc ref={(ref: TC.SurveysTc) => this.surveys = ref} onFormSent={() => this.onFormSent() } onAnswerDeleted={(pcUid: string) => this.onAnswerDeleted(pcUid) } onAllAnswersDeleted={(formId: string) => this.onAllAnswersDeleted(formId) } actionUrl={this.props.actionUrl} />
                        </div>
                        <div ref={(ref: HTMLDivElement) => this.divUIpolls = ref} style={{ display: "none" }}>
                            <App.TC.PollsTc ref={(ref: TC.PollsTc) => this.polls = ref} onFormSent={() => this.onFormSent() } onAnswerDeleted={(pcUid: string) => this.onAnswerDeleted(pcUid) } onAllAnswersDeleted={(formId: string) => this.onAllAnswersDeleted(formId) } actionUrl={this.props.actionUrl} />
                        </div>
                    </div>
                </div>
            );
        }
    }

    export class InitTC {
        constructor(targetId: string, classroomId: string, actionUrl: string) {
            ReactDOM.render(<div><TC targetId={targetId} classroomId={classroomId} actionUrl={actionUrl} /></div>, document.getElementById(targetId));
        }
    }
}