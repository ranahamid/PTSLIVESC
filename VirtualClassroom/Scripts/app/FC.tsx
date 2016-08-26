/* tslint:disable:max-line-length */

namespace VC.App {
    "use strict";

    class FC extends XC {
        private status: Components.Status;
        private boxSubscribers: Array<Components.Box> = new Array<Components.Box>(8);
        private label: Array<Components.BoxLabel> = new Array<Components.BoxLabel>(8);
        private divStatus: HTMLDivElement;
        private divUI: HTMLDivElement;

        constructor(props: IProps) {
            super(props, Roles.FC);
        }

        // abstract methods
        setStatusText(text: string, style: Components.StatusStyle): void {
            this.setStatusVisibility(true);
            this.status.setText(text, style);
        }

        didMount(): void {
            $(window).resize(() => window.setTimeout(() => this.fitLayout(), 0));
        }
        connected(connection: any): void {
            let tokenData: Global.TokenData = Global.Fce.toTokenData(connection.data);
            if (this.dataResponse.Uid === tokenData.Uid) {
                // me
                this.setStatusVisibility(false);
                this.setUiVisibility(true);
            } else if (this.isInMyGroup(tokenData.Uid)) {
                // my group
                if (tokenData.Role === Roles.PC) {
                    // student
                    let groupComputer: Global.GroupComputer = this.getGroupComputer(tokenData.Uid);
                    this.label[groupComputer.Position - 1].setText(tokenData.Name + " connected.", Components.BoxLabelStyle.Connected);
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
                    } as Global.ISignalConnectedData
                );
            }
        }
        disconnected(connection: any): void {
            let tokenData: Global.TokenData = Global.Fce.toTokenData(connection.data);
            if (this.dataResponse.Uid === tokenData.Uid) {
                // me
                this.setUiVisibility(false);
                this.setStatusText("Disconnected from the session.", Components.StatusStyle.Error);
            } else if (this.isInMyGroup(tokenData.Uid)) {
                // my group
                if (tokenData.Role === Roles.PC) {
                    // student
                    let groupComputer: Global.GroupComputer = this.getGroupComputer(tokenData.Uid);
                    this.label[groupComputer.Position - 1].setText("Student PC not connected.", Components.BoxLabelStyle.NotConnected);
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
                let groupComputer: Global.GroupComputer = this.getGroupComputer(tokenData.Uid);
                // student
                this.boxSubscribers[groupComputer.Position - 1].subscribe(this.session, stream, this.dataResponse.ComputerSetting.Volume[groupComputer.Position - 1]);
            }
        }
        streamDestroyed(connection: any, stream: any): void {
            let tokenData: Global.TokenData = Global.Fce.toTokenData(connection.data);
            if (this.dataResponse.Uid === tokenData.Uid) {
                // me .. there is not fired this event for publisher
            } else if (this.isInMyGroup(tokenData.Uid)) {
                // my group
                let groupComputer: Global.GroupComputer = this.getGroupComputer(tokenData.Uid);
                // student
                this.boxSubscribers[groupComputer.Position - 1].unsubscribe(this.session);
            }
        }
        streamPropertyChanged(event: any): void {
            // nothing to do
        }

        signalReceived(event: any): void {
            let signalType: Global.SignalTypes = Global.Signaling.getSignalType(event.type);
            switch (signalType) {
                case Global.SignalTypes.Volume:
                    this.volumeSignalReceived(event);
                    break;
                case Global.SignalTypes.TurnOff:
                    this.turnOffSignalReceived(event);
                    break;
            }
        }
        private volumeSignalReceived(event: any): void {
            let data: Global.ISignalVolumeData = JSON.parse(event.data) as Global.ISignalVolumeData;
            for (let i: number = 0; i < data.volume.length; i++) {
                if (data.volume[i] != null) {
                    this.dataResponse.ComputerSetting.Volume[i] = data.volume[i];
                    this.boxSubscribers[i].audioVolume(data.volume[i]);
                }
            }
        }
        private turnOffSignalReceived(event: any): void {
            this.disconnect();
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
            let windowWidth: number = $(window).innerWidth();

            this.fitLayerSizes(windowWidth, windowHeight);
        }
        private fitLayerSizes(windowWidth: number, windowHeight: number): void {
            // boxes + width of labels & floating chat divs
            if (this.props.layout > 6) {
                for (let i: number = 0; i < this.props.layout; i++) {
                    $(this.boxSubscribers[i].getBox())
                        .css("width", "25%")
                        .css("height", windowHeight / 2 + "px"); // 8
                    $(this.label[i].getParentDiv()).css("width", "25%");
                }
            } else if (this.props.layout > 4) {
                for (let i: number = 0; i < this.props.layout; i++) {
                    $(this.boxSubscribers[i].getBox())
                        .css("width", "33.33%")
                        .css("height", windowHeight / 2 + "px"); // 6
                    $(this.label[i].getParentDiv()).css("width", "33.33%");
                }
            } else if (this.props.layout > 2) {
                for (let i: number = 0; i < this.props.layout; i++) {
                    $(this.boxSubscribers[i].getBox())
                        .css("width", "50%")
                        .css("height", windowHeight / 2 + "px"); // 4
                    $(this.label[i].getParentDiv()).css("width", "50%");
                }
            } else {
                for (let i: number = 0; i < this.props.layout; i++) {
                    $(this.boxSubscribers[i].getBox())
                        .css("width", "50%")
                        .css("height", windowHeight + "px"); // 2
                    $(this.label[i].getParentDiv()).css("width", "50%");
                }
            }
            // labels
            for (let i: number = 0; i < this.props.layout; i++) {
                $(this.label[i].getParentDiv())
                    .css("left", $(this.boxSubscribers[i].getBox()).position().left + "px")
                    .css("top", $(this.boxSubscribers[i].getBox()).position().top + "px");
            }
        }

        render(): JSX.Element {
            let statusClasses: Array<string> = [
                "alert alert-warning", // connecting
                "alert alert-success", // connected
                "alert alert-danger"  // error
            ];

            let labelClasses: Array<string> = [
                "notConnected", // notConnected
                "connected",    // connected
                // "handRaised"    // handRaised
            ];

            return (
                <div className="scContainer">
                    <div ref={(ref: HTMLDivElement) => this.divStatus = ref}>
                        <Components.Status ref={(ref: Components.Status) => this.status = ref} text="Connecting ..." style={Components.StatusStyle.Connecting} className="cStatus" statusClasses={statusClasses} />
                    </div>
                    <div ref={(ref: HTMLDivElement) => this.divUI = ref} style={{ display: "none" }}>
                        <Components.Box ref={(ref: Components.Box) => this.boxSubscribers[0] = ref} id={this.props.targetId + "_Subscriber1"} streamProps={this.subscribeProps} className="cBox" visible={this.props.layout > 0} />
                        <Components.Box ref={(ref: Components.Box) => this.boxSubscribers[1] = ref} id={this.props.targetId + "_Subscriber2"} streamProps={this.subscribeProps} className="cBox" visible={this.props.layout > 0} />
                        <Components.Box ref={(ref: Components.Box) => this.boxSubscribers[2] = ref} id={this.props.targetId + "_Subscriber3"} streamProps={this.subscribeProps} className="cBox" visible={this.props.layout > 2} />
                        <Components.Box ref={(ref: Components.Box) => this.boxSubscribers[3] = ref} id={this.props.targetId + "_Subscriber4"} streamProps={this.subscribeProps} className="cBox" visible={this.props.layout > 2} />
                        <Components.Box ref={(ref: Components.Box) => this.boxSubscribers[4] = ref} id={this.props.targetId + "_Subscriber5"} streamProps={this.subscribeProps} className="cBox" visible={this.props.layout > 4} />
                        <Components.Box ref={(ref: Components.Box) => this.boxSubscribers[5] = ref} id={this.props.targetId + "_Subscriber6"} streamProps={this.subscribeProps} className="cBox" visible={this.props.layout > 4} />
                        <Components.Box ref={(ref: Components.Box) => this.boxSubscribers[6] = ref} id={this.props.targetId + "_Subscriber7"} streamProps={this.subscribeProps} className="cBox" visible={this.props.layout > 6} />
                        <Components.Box ref={(ref: Components.Box) => this.boxSubscribers[7] = ref} id={this.props.targetId + "_Subscriber8"} streamProps={this.subscribeProps} className="cBox" visible={this.props.layout > 6} />

                        <Components.BoxLabel ref={(ref: Components.BoxLabel) => this.label[0] = ref} text="Student not connected..." style={Components.BoxLabelStyle.NotConnected} className="cBoxLabel" labelClasses={labelClasses} visible={this.props.layout > 0} />
                        <Components.BoxLabel ref={(ref: Components.BoxLabel) => this.label[1] = ref} text="Student not connected..." style={Components.BoxLabelStyle.NotConnected} className="cBoxLabel" labelClasses={labelClasses} visible={this.props.layout > 0} />
                        <Components.BoxLabel ref={(ref: Components.BoxLabel) => this.label[2] = ref} text="Student not connected..." style={Components.BoxLabelStyle.NotConnected} className="cBoxLabel" labelClasses={labelClasses} visible={this.props.layout > 2} />
                        <Components.BoxLabel ref={(ref: Components.BoxLabel) => this.label[3] = ref} text="Student not connected..." style={Components.BoxLabelStyle.NotConnected} className="cBoxLabel" labelClasses={labelClasses} visible={this.props.layout > 2} />
                        <Components.BoxLabel ref={(ref: Components.BoxLabel) => this.label[4] = ref} text="Student not connected..." style={Components.BoxLabelStyle.NotConnected} className="cBoxLabel" labelClasses={labelClasses} visible={this.props.layout > 4} />
                        <Components.BoxLabel ref={(ref: Components.BoxLabel) => this.label[5] = ref} text="Student not connected..." style={Components.BoxLabelStyle.NotConnected} className="cBoxLabel" labelClasses={labelClasses} visible={this.props.layout > 4} />
                        <Components.BoxLabel ref={(ref: Components.BoxLabel) => this.label[6] = ref} text="Student not connected..." style={Components.BoxLabelStyle.NotConnected} className="cBoxLabel" labelClasses={labelClasses} visible={this.props.layout > 6} />
                        <Components.BoxLabel ref={(ref: Components.BoxLabel) => this.label[7] = ref} text="Student not connected..." style={Components.BoxLabelStyle.NotConnected} className="cBoxLabel" labelClasses={labelClasses} visible={this.props.layout > 6} />
                    </div>
                </div>
            );
        }
    }

    export class InitFC {
        constructor(targetId: string, actionUrl: string, layout: number) {
            ReactDOM.render(<div><FC targetId={targetId} actionUrl={actionUrl} layout={layout} /></div>, document.getElementById(targetId));
        }
    }
}