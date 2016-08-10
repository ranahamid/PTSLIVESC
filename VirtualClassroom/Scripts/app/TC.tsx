/* tslint:disable:max-line-length */

namespace VC.App {
    "use strict";

    class TC extends XC {
        private status: Components.Status;
        private switchButton: Components.SwitchButton;
        private boxPublisher: Components.Box;
        private divStatus: HTMLDivElement;
        private divUI: HTMLDivElement;
        private tabs: VC.Global.Components.Tabs;
        private divUIscreensharing: HTMLDivElement;
        private divUIsurveys: HTMLDivElement;
        private divUIpolls: HTMLDivElement;
        private surveys: TC.SurveysTc;
        private polls: TC.PollsTc;

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
        connected(connection: any, t: ConnectionType): void {
            let tokenData: Global.TokenData = Global.Fce.toTokenData(connection.data);
            if (this.dataResponse.Uid === tokenData.Uid) {
                // me
                this.setStatusVisibility(false);
                this.setUiVisibility(true);
                // show share screen button
                this.switchButton.setStatus(Components.SwitchButtonStatus.Start);
            } else {
                if (tokenData.Role === Roles.PC && t !== ConnectionType.AC) {
                    // student
                    this.connectedPCsChanged();
                } else if (tokenData.Role === Roles.AC) {
                    // admin computer
                    Global.Signaling.sendSignal<Global.ISignalConnectedData>(this.session2AC, this.getAcConnection(), Global.SignalTypes.Connected,
                        {
                            audio: this.dataResponse.ComputerSetting.Audio,
                            video: this.dataResponse.ComputerSetting.Video,
                            volume: this.dataResponse.ComputerSetting.Volume
                        } as Global.ISignalConnectedData);
                }
            }
        }
        disconnected(connection: any, t: ConnectionType): void {
            let tokenData: Global.TokenData = Global.Fce.toTokenData(connection.data);
            if (this.dataResponse.Uid === tokenData.Uid) {
                // me
                this.setStatusText("Disconnected from the session.", Components.StatusStyle.Error);
                // hide share screen button
                this.switchButton.setStatus(Components.SwitchButtonStatus.Hidden);
            } else {
                if (tokenData.Role === Roles.PC && t !== ConnectionType.AC) {
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
                this.boxPublisher.audio(data.audio);
            }
            if (data.video != null) {
                this.dataResponse.ComputerSetting.Video = data.video;
                this.boxPublisher.video(data.video);
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
            this.switchButton.setStatus(Components.SwitchButtonStatus.Stop);
        }
        private publishStopped(event: any): void {
            this.boxPublisher.clearBox();
            this.switchButton.setStatus(Components.SwitchButtonStatus.Start);
        }

        private screenSharingOn(): void {
            this.switchButton.setStatus(Components.SwitchButtonStatus.Hidden);
            this.boxPublisher.publish(this.session, PublishSources.Screen, this.dataResponse.ComputerSetting.Audio, this.dataResponse.ComputerSetting.Video, this.publishStarted.bind(this), this.publishStopped.bind(this));
        }
        private screenSharingOff(): void {
            this.switchButton.setStatus(Components.SwitchButtonStatus.Hidden);
            this.boxPublisher.unpublish(this.session);
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
            Global.Signaling.sendSignalAll<Global.ISignalFormsData>(this.session, Global.SignalTypes.Forms, {} as Global.ISignalFormsData);
        }
        private onAnswerDeleted(pcUid: string): void {
            // send signal to selected student for refresh
            let connection: any = this.getConnectionByUid(pcUid);
            if (connection !== null) {
                Global.Signaling.sendSignal<Global.ISignalFormsData>(this.session, connection, Global.SignalTypes.Forms, {} as Global.ISignalFormsData);
            }
        }
        private onAllAnswersDeleted(formId: string): void {
            // send singnal to all connected students to delete form answers
            Global.Signaling.sendSignalAll<Global.ISignalFormsData>(this.session, Global.SignalTypes.Forms, { formId: formId } as Global.ISignalFormsData);
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
            var boxPublisher1: HTMLDivElement = this.boxPublisher.getBox();
            $(boxPublisher1).css("height", ($(boxPublisher1).width() / 16 * 9) + "px");
        }

        private tabOnClick(id: number): void {
            this.tabs.selectItem(id);

            if (id === 0) {
                this.divUIsurveys.style.display = "none";
                this.divUIpolls.style.display = "none";
                this.divUIscreensharing.style.display = "block";
            } else if (id === 1) {
                this.divUIscreensharing.style.display = "none";
                this.divUIpolls.style.display = "none";
                this.divUIsurveys.style.display = "block";
                this.surveys.init();
            } else if (id === 2) {
                this.divUIscreensharing.style.display = "none";
                this.divUIsurveys.style.display = "none";
                this.divUIpolls.style.display = "block";
                this.polls.init();
            }
        }

        render(): JSX.Element {
            let tabItems: Array<VC.Global.Components.ITabItemProps> = [
                { id: 0, title: "Screen sharing", onClick: this.tabOnClick.bind(this), active: true },
                { id: 1, title: "Surveys", onClick: this.tabOnClick.bind(this), active: false },
                { id: 2, title: "Polls", onClick: this.tabOnClick.bind(this), active: false }
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

                        <div ref={(ref: HTMLDivElement) => this.divUIscreensharing = ref} style={{ display: "block" }}>
                            <div style={{ display: (this.state.extensionError === "" ? "none" : "block") }}>
                                <div className="alert alert-danger"><span className="glyphicon glyphicon-warning-sign"></span> {this.state.extensionError}</div>
                            </div>
                            <div style={{ display: (this.state.extensionError !== "" ? "none" : "block") }}>
                                <Components.SwitchButton ref={(ref: Components.SwitchButton) => this.switchButton = ref} status={Components.SwitchButtonStatus.Hidden} textOn="Start screen sharing" textOff="Stop screen sharing" classOn="btn btn-success" classOff="btn btn-danger" iconOn="glyphicon glyphicon-blackboard" iconOff="glyphicon glyphicon-blackboard" onOn={this.screenSharingOn.bind(this) } onOff={this.screenSharingOff.bind(this) } className="sharingButton" />
                                <Components.Box ref={(ref: Components.Box) => this.boxPublisher = ref} id={this.props.targetId + "_Publisher1"} streamProps={this.publishProps} className="cBox" visible={true} />
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
        constructor(targetId: string, actionUrl: string) {
            ReactDOM.render(<div><TC targetId={targetId} actionUrl={actionUrl} /></div>, document.getElementById(targetId));
        }
    }
}