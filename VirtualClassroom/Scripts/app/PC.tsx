/* tslint:disable:max-line-length */

namespace VC.App {
    "use strict";

    class PC extends XC {
        private status: Components.Status;
        private switchButton: Components.SwitchButton;
        private boxPublisher: Components.Box;
        private boxSubscriber: Components.Box;
        private label: Components.BoxLabel;
        private divStatus: HTMLDivElement;
        private divUI: HTMLDivElement;
        private divHandButton: HTMLDivElement;

        public singleBoxVisible: boolean = false;

        constructor(props: IProps) {
            super(props, Roles.PC);
        }

        // abstract methods
        setStatusText(text: string, style: Components.StatusStyle): void {
            this.setStatusVisibility(true);
            this.status.setText(text, style);
        }

        didMount(): void {
            $(window).resize(() => this.fitLayout());
        }
        connected(connection: any): void {
            let tokenData: Global.TokenData = Global.Fce.toTokenData(connection.data);
            if (this.dataResponse.Uid === tokenData.Uid) {
                // me
                this.setStatusVisibility(false);
                this.setUiVisibility(true);
                this.boxPublisher.publish(this.session,
                    PublishSources.Camera,
                    this.dataResponse.ComputerSetting.Audio,
                    this.dataResponse.ComputerSetting.Video,
                    (event: any) => {
                        // nothing to do
                    },
                    (event: any) => {
                        // nothing to do
                    }
                );
            } else if (this.isInMyGroup(tokenData.Uid)) {
                // my group
                if (tokenData.Role === Roles.SC) {
                    // show raise hand button
                    this.switchButton.setStatus(Components.SwitchButtonStatus.Start);
                } else if (tokenData.Role === Roles.TC) {
                    // seat computer
                    this.label.setText(tokenData.Name + " connected.", Components.BoxLabelStyle.Connected);
                }
            } else if (tokenData.Role === Roles.AC) {
                // admin computer
                Global.Signaling.sendSignal<Global.ISignalConnectedData>(this.session,
                    this.getAcConnection(),
                    Global.SignalTypes.Connected,
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
                this.boxPublisher.unpublish(this.session);
                this.setUiVisibility(false);
                this.setStatusText("Disconnected from the session.", Components.StatusStyle.Error);
            } else if (this.isInMyGroup(tokenData.Uid)) {
                // my group
                if (tokenData.Role === Roles.SC) {
                    // hide raise hand button
                    this.switchButton.setStatus(Components.SwitchButtonStatus.Hidden);
                } else if (tokenData.Role === Roles.TC) {
                    // seat computer
                    this.label.setText("Teacher computer not connected.", Components.BoxLabelStyle.NotConnected);
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
            } else if (this.isInMyGroup(tokenData.Uid)) {
                // my group
                if (tokenData.Role === Roles.TC) {
                    // seat computer
                    this.boxSubscriber.subscribe(this.session, stream, this.dataResponse.ComputerSetting.Volume[1]);
                }
            }
        }
        streamDestroyed(connection: any, stream: any): void {
            let tokenData: Global.TokenData = Global.Fce.toTokenData(connection.data);
            if (this.dataResponse.Uid === tokenData.Uid) {
                // me .. there is not fired this event for publisher
            } else if (this.isInMyGroup(tokenData.Uid)) {
                // my group
                // seat or teacher computer
                if (tokenData.Role === Roles.TC) {
                    // seat computer
                    this.boxSubscriber.unsubscribe(this.session);
                }
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
                case Global.SignalTypes.Volume:
                    this.volumeSignalReceived(event);
                    break;
                case Global.SignalTypes.TurnOff:
                    this.turnOffSignalReceived(event);
                    break;
            }
        }
        private turnAvSignalReceived(event: any): void {
            let data: Global.ISignalTurnAvData = JSON.parse(event.data) as Global.ISignalTurnAvData;
            if (data.audio != null) {
                this.dataResponse.ComputerSetting.Audio = data.audio;
                this.boxPublisher.audio(data.audio);
            }
            if (data.video != null) {
                this.dataResponse.ComputerSetting.Video = data.video;
                this.boxPublisher.video(data.video);
            }
        }
        private volumeSignalReceived(event: any): void {
            let data: Global.ISignalVolumeData = JSON.parse(event.data) as Global.ISignalVolumeData;
            if (data.volume[1] != null) {
                this.dataResponse.ComputerSetting.Volume[1] = data.volume[1];
                this.boxSubscriber.audioVolume(data.volume[1]);
            }
        }
        private turnOffSignalReceived(event: any): void {
            this.disconnect();
        }

        private raiseHand(): void {
            Global.Signaling.sendSignal<Global.ISignalRaiseHandData>(this.session,
                this.getScConnection(), Global.SignalTypes.RaiseHand, { raised: true } as Global.ISignalRaiseHandData);

            this.switchButton.setStatus(Components.SwitchButtonStatus.Stop);
        }
        private lowerHand(): void {
            Global.Signaling.sendSignal<Global.ISignalRaiseHandData>(this.session,
                this.getScConnection(),
                Global.SignalTypes.RaiseHand,
                { raised: false } as Global.ISignalRaiseHandData
            );

            this.switchButton.setStatus(Components.SwitchButtonStatus.Start);
        }

        private setStatusVisibility(visible: boolean): void {
            this.divStatus.style.display = visible ? "block" : "none";
        }
        private setLayoutVisibility(visible: boolean): void {
            // divBody1 class
            let divBody1: HTMLElement = document.getElementById("DivBody1");
            divBody1.className = visible ? "divBody" : "";

            // header1
            let header1: HTMLElement = document.getElementById("Header1");
            header1.style.display = visible ? "block" : "none";

            // footer1
            let footer1: HTMLElement = document.getElementById("Footer1");
            footer1.style.display = visible ? "block" : "none";
        }

        private setUiVisibility(visible: boolean): void {
            this.setLayoutVisibility(!visible);
            this.divUI.style.display = visible ? "block" : "none";
            if (visible) {
                this.fitLayout();
            }
        }

        private fitLayout(): void {
            let windowHeight: number = $(window).innerHeight();

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

        render(): JSX.Element {
            let statusClasses: Array<string> = [
                "alert alert-warning",  // connecting
                "alert alert-success",  // connected
                "alert alert-danger"    // error
            ];

            let labelClasses: Array<string> = [
                "notConnected", // notConnected
                "connected",    // connected
                ""                          // handRaised (no need for PC)
            ];

            return (
                <div className="pcContainer">
                    <div ref={(ref: HTMLDivElement) => this.divStatus = ref}>
                        <Components.Status ref={(ref: Components.Status) => this.status = ref} text="Connecting ..." style={Components.StatusStyle.Connecting} className="cStatus" statusClasses={statusClasses} />
                    </div>
                    <div ref={(ref: HTMLDivElement) => this.divUI = ref} style={{ display: "none" }}>
                        <div style={{ display: "none" }}>
                            <Components.Box ref={(ref: Components.Box) => this.boxPublisher = ref} id={this.props.targetId + "_Publisher1"} streamProps={this.publishProps} className="cBoxP" visible={true} />
                        </div>
                        <div>
                            <Components.Box ref={(ref: Components.Box) => this.boxSubscriber = ref} id={this.props.targetId + "_Subscriber1"} streamProps={this.subscribeProps} className="cBox" visible={true} />
                            <Components.BoxLabel ref={(ref: Components.BoxLabel) => this.label = ref} text="Teacher computer not connected..." style={Components.BoxLabelStyle.NotConnected} className="cBoxLabel" labelClasses={labelClasses} visible={true} />
                            <div ref={(ref: HTMLDivElement) => this.divHandButton = ref} className="divHandButton"><Components.SwitchButton ref={(ref: Components.SwitchButton) => this.switchButton = ref} textOn="Raise your hand" textOff="Lower your hand" classOn="btn btn-success" classOff="btn btn-danger" iconOn="glyphicon glyphicon-hand-up" iconOff="glyphicon glyphicon-hand-down" status={Components.SwitchButtonStatus.Hidden} onOn={this.raiseHand.bind(this) } onOff={this.lowerHand.bind(this) } className="handButton" /></div>
                        </div>
                    </div>
                </div>
            );
        }
    }

    export class InitPC {
        constructor(targetId: string, classroomId: string, actionUrl: string) {
            ReactDOM.render(<div><PC targetId={targetId} classroomId={classroomId} actionUrl={actionUrl} /></div>, document.getElementById(targetId));
        }
    }
}