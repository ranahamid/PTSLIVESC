/* tslint:disable:max-line-length */

namespace VC.App {
    "use strict";

    class SC extends XC {
        private status: Components.Status;
        private boxPublisher: Components.Box;
        private boxSubscribers: Array<Components.Box> = new Array<Components.Box>(8);
        private label: Array<Components.BoxLabel> = new Array<Components.BoxLabel>(8);
        private divFloatingChat: Array<HTMLDivElement> = new Array<HTMLDivElement>(8);
        private floatingChat: Array<Components.ChatList> = new Array<Components.ChatList>(8);
        private divStatus: HTMLDivElement;
        private divUI: HTMLDivElement;
        private connectedStudents: Array<boolean> = [false, false, false, false, false, false, false, false];

        constructor(props: IProps) {
            super(props, Roles.SC);
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
                    this.connectedStudents[groupComputer.Position - 1] = true;
                    this.fitLayout();
                }
            } else if (tokenData.Role === Roles.AC) {
                // admin computer
                Global.Signaling.sendSignal<Global.ISignalConnectedData>(this.session,
                    this.getAcConnection(),
                    Global.SignalTypes.Connected,
                    {
                    } as Global.ISignalConnectedData
                );
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
                if (tokenData.Role === Roles.PC) {
                    // student
                    let groupComputer: Global.GroupComputer = this.getGroupComputer(tokenData.Uid);
                    this.label[groupComputer.Position - 1].setText("Student PC not connected.", Components.BoxLabelStyle.NotConnected);
                    this.connectedStudents[groupComputer.Position - 1] = false;
                    this.fitLayout();
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
                this.boxSubscribers[groupComputer.Position - 1].subscribeVideo(this.session, stream);
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
                case Global.SignalTypes.TurnOff:
                    this.turnOffSignalReceived(event);
                    break;
                case Global.SignalTypes.Chat:
                    this.chatSignalReceived(event);
                    break;
                case Global.SignalTypes.RaiseHand:
                    this.raiseHandSignalReceived(event);
                    break;
            }
        }
        private turnOffSignalReceived(event: any): void {
            let data: Global.ISignalTurnOffData = JSON.parse(event.data) as Global.ISignalTurnOffData;
            if (data.role === undefined || data.role === Roles.SC) {
                this.disconnect();
            }
        }
        private raiseHandSignalReceived(event: any): void {
            let tokenData: Global.TokenData = Global.Fce.toTokenData(event.from.data);
            let groupComputer: Global.GroupComputer = this.getGroupComputer(tokenData.Uid);
            let data: Global.ISignalRaiseHandData = JSON.parse(event.data) as Global.ISignalRaiseHandData;
            this.label[groupComputer.Position - 1].setStyle(data.raised ? Components.BoxLabelStyle.HandRaised : Components.BoxLabelStyle.Connected);
        }
        private chatSignalReceived(event: any): void {
            let data: Global.ISignalChatData = JSON.parse(event.data) as Global.ISignalChatData;
            if (data.type === Global.ChatType.Public) {
                // try to find this student
                let groupComputer: Global.GroupComputer = this.getGroupComputer(data.userUid);
                if (groupComputer !== null) {
                    this.floatingChat[groupComputer.Position - 1].addItem({
                        userUid: data.userUid,
                        userRole: data.userRole,
                        userName: data.userName,
                        message: data.message,
                        timestamp: new Date(),
                        me: false
                    } as Components.IChatListItem);
                }
            }
        }

        private setStatusVisibility(visible: boolean): void {
            this.divStatus.style.display = visible ? "block" : "none";
        }
        private setLayoutVisibility(visible: boolean): void {
            // Body1 style
            let body1: HTMLBodyElement = document.getElementById("Body1") as HTMLBodyElement;
            body1.className = visible ? "lightBody" : "darkBody";

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

        private getCountOfConnectedStudents(): number {
            let connectedStudentsCount: number = 0;
            this.connectedStudents.forEach((connected: boolean) => {
                if (connected) {
                    connectedStudentsCount++;
                }
            });
            return connectedStudentsCount;
        }
        private getLayoutSize(): number {
            let layout: number = 1;

            let connectedStudentsCount: number = this.getCountOfConnectedStudents();

            if (connectedStudentsCount > 6) {
                layout = 8;
            } else if (connectedStudentsCount > 4) {
                layout = 6;
            } else if (connectedStudentsCount > 2) {
                layout = 4;
            } else if (connectedStudentsCount > 1) {
                layout = 2;
            }

            return layout;
        }
        private fitLayout(): void {
            let windowHeight: number = $(window).innerHeight();
            let windowWidth: number = $(window).innerWidth();

            this.fitLayerSizes(windowWidth, windowHeight);
        }
        private fitLayerSizes(windowWidth: number, windowHeight: number): void {
            let connectedStudentsCount: number = this.getCountOfConnectedStudents();
            let layout: number = this.getLayoutSize();
            let countOfVisibleBoxes: number = 0;

            // visibility of boxes + labels + floating chat divs
            for (let i: number = 0; i < 8; i++) {
                if (this.connectedStudents[i]) {
                    this.boxSubscribers[i].setVisibility(true);
                    this.label[i].setVisibility(true);
                    if (this.divFloatingChat[i].style.display === "none") {
                        this.divFloatingChat[i].style.display = "block";
                    }
                    countOfVisibleBoxes++;
                } else {
                    this.boxSubscribers[i].setVisibility(false);
                    this.label[i].setVisibility(false);
                    if (this.divFloatingChat[i].style.display === "block") {
                        this.divFloatingChat[i].style.display = "none";
                    }
                }
            }
            // show boxes left
            for (let i: number = 7; i >= 0 && countOfVisibleBoxes < layout; i++) {
                if (!this.connectedStudents[i]) {
                    this.boxSubscribers[i].setVisibility(true);
                    this.label[i].setVisibility(true);
                    if (this.divFloatingChat[i].style.display === "none") {
                        this.divFloatingChat[i].style.display = "block";
                    }
                    countOfVisibleBoxes++;
                }
            }

            // sizes and position of boxes + labels + floating chat divs
            if (layout > 6) {
                for (let i: number = 0; i < 8; i++) {
                    $(this.boxSubscribers[i].getBox())
                        .css("width", "25%")
                        .css("height", windowHeight / 2 + "px"); // 8
                    $(this.label[i].getParentDiv()).css("width", "25%");
                    $(this.divFloatingChat[i]).css("width", "25%");
                }
            } else if (layout > 4) {
                for (let i: number = 0; i < 8; i++) {
                    $(this.boxSubscribers[i].getBox())
                        .css("width", "33.33%")
                        .css("height", windowHeight / 2 + "px"); // 6
                    $(this.label[i].getParentDiv()).css("width", "33.33%");
                    $(this.divFloatingChat[i]).css("width", "33.33%");
                }
            } else if (layout > 2) {
                for (let i: number = 0; i < 8; i++) {
                    $(this.boxSubscribers[i].getBox())
                        .css("width", "50%")
                        .css("height", windowHeight / 2 + "px"); // 4
                    $(this.label[i].getParentDiv()).css("width", "50%");
                    $(this.divFloatingChat[i]).css("width", "50%");
                }
            } else if (layout > 1) {
                for (let i: number = 0; i < 8; i++) {
                    $(this.boxSubscribers[i].getBox())
                        .css("width", "50%")
                        .css("height", windowHeight + "px"); // 2
                    $(this.label[i].getParentDiv()).css("width", "50%");
                    $(this.divFloatingChat[i]).css("width", "50%");
                }
            } else {
                for (let i: number = 0; i < 8; i++) {
                    $(this.boxSubscribers[i].getBox())
                        .css("width", "100%")
                        .css("height", windowHeight + "px"); // 1
                    $(this.label[i].getParentDiv()).css("width", "100%");
                    $(this.divFloatingChat[i]).css("width", "100%");
                }
            }
            // labels
            for (let i: number = 0; i < 8; i++) {
                $(this.label[i].getParentDiv())
                    .css("left", $(this.boxSubscribers[i].getBox()).position().left + "px")
                    .css("top", ($(this.boxSubscribers[i].getBox()).position().top + $(this.boxSubscribers[i].getBox()).height() - $(this.label[i].getParentDiv()).height()) + "px");
            }
            // floating chat
            for (let i: number = 0; i < 8; i++) {
                $(this.divFloatingChat[i])
                    .css("left", $(this.boxSubscribers[i].getBox()).position().left + "px")
                    .css("top", ($(this.boxSubscribers[i].getBox()).position().top + $(this.label[i].getParentDiv()).height() + 10) + "px")
                    .css("height", ($(this.boxSubscribers[i].getBox()).height() - $(this.label[i].getParentDiv()).height() - 10) + "px");
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
                "handRaised"    // handRaised
            ];

            return (
                <div className="scContainer">
                    <div ref={(ref: HTMLDivElement) => this.divStatus = ref}>
                        <Components.Status ref={(ref: Components.Status) => this.status = ref} text="Connecting ..." style={Components.StatusStyle.Connecting} className="cStatus" statusClasses={statusClasses} />
                    </div>
                    <div ref={(ref: HTMLDivElement) => this.divUI = ref} style={{ display: "none" }}>
                        <Components.Box ref={(ref: Components.Box) => this.boxPublisher = ref} id={this.props.targetId + "_Publisher1"} streamProps={this.publishProps} className="" visible={false} />

                        <Components.Box ref={(ref: Components.Box) => this.boxSubscribers[0] = ref} id={this.props.targetId + "_Subscriber1"} streamProps={this.subscribeProps} className="cBox" visible={false} />
                        <Components.Box ref={(ref: Components.Box) => this.boxSubscribers[1] = ref} id={this.props.targetId + "_Subscriber2"} streamProps={this.subscribeProps} className="cBox" visible={false} />
                        <Components.Box ref={(ref: Components.Box) => this.boxSubscribers[2] = ref} id={this.props.targetId + "_Subscriber3"} streamProps={this.subscribeProps} className="cBox" visible={false} />
                        <Components.Box ref={(ref: Components.Box) => this.boxSubscribers[3] = ref} id={this.props.targetId + "_Subscriber4"} streamProps={this.subscribeProps} className="cBox" visible={false} />
                        <Components.Box ref={(ref: Components.Box) => this.boxSubscribers[4] = ref} id={this.props.targetId + "_Subscriber5"} streamProps={this.subscribeProps} className="cBox" visible={false} />
                        <Components.Box ref={(ref: Components.Box) => this.boxSubscribers[5] = ref} id={this.props.targetId + "_Subscriber6"} streamProps={this.subscribeProps} className="cBox" visible={false} />
                        <Components.Box ref={(ref: Components.Box) => this.boxSubscribers[6] = ref} id={this.props.targetId + "_Subscriber7"} streamProps={this.subscribeProps} className="cBox" visible={false} />
                        <Components.Box ref={(ref: Components.Box) => this.boxSubscribers[7] = ref} id={this.props.targetId + "_Subscriber8"} streamProps={this.subscribeProps} className="cBox" visible={false} />

                        <Components.BoxLabel ref={(ref: Components.BoxLabel) => this.label[0] = ref} text="Student not connected..." style={Components.BoxLabelStyle.NotConnected} className="cBoxLabel" labelClasses={labelClasses} visible={false} />
                        <Components.BoxLabel ref={(ref: Components.BoxLabel) => this.label[1] = ref} text="Student not connected..." style={Components.BoxLabelStyle.NotConnected} className="cBoxLabel" labelClasses={labelClasses} visible={false} />
                        <Components.BoxLabel ref={(ref: Components.BoxLabel) => this.label[2] = ref} text="Student not connected..." style={Components.BoxLabelStyle.NotConnected} className="cBoxLabel" labelClasses={labelClasses} visible={false} />
                        <Components.BoxLabel ref={(ref: Components.BoxLabel) => this.label[3] = ref} text="Student not connected..." style={Components.BoxLabelStyle.NotConnected} className="cBoxLabel" labelClasses={labelClasses} visible={false} />
                        <Components.BoxLabel ref={(ref: Components.BoxLabel) => this.label[4] = ref} text="Student not connected..." style={Components.BoxLabelStyle.NotConnected} className="cBoxLabel" labelClasses={labelClasses} visible={false} />
                        <Components.BoxLabel ref={(ref: Components.BoxLabel) => this.label[5] = ref} text="Student not connected..." style={Components.BoxLabelStyle.NotConnected} className="cBoxLabel" labelClasses={labelClasses} visible={false} />
                        <Components.BoxLabel ref={(ref: Components.BoxLabel) => this.label[6] = ref} text="Student not connected..." style={Components.BoxLabelStyle.NotConnected} className="cBoxLabel" labelClasses={labelClasses} visible={false} />
                        <Components.BoxLabel ref={(ref: Components.BoxLabel) => this.label[7] = ref} text="Student not connected..." style={Components.BoxLabelStyle.NotConnected} className="cBoxLabel" labelClasses={labelClasses} visible={false} />

                        <div ref={(ref: HTMLDivElement) => this.divFloatingChat[0] = ref} className="floatingChat" style={{ display: "none" }}><Components.ChatList ref={(ref: Components.ChatList) => this.floatingChat[0] = ref} fadingOut={true} /></div>
                        <div ref={(ref: HTMLDivElement) => this.divFloatingChat[1] = ref} className="floatingChat" style={{ display: "none" }}><Components.ChatList ref={(ref: Components.ChatList) => this.floatingChat[1] = ref} fadingOut={true} /></div>
                        <div ref={(ref: HTMLDivElement) => this.divFloatingChat[2] = ref} className="floatingChat" style={{ display: "none" }}><Components.ChatList ref={(ref: Components.ChatList) => this.floatingChat[2] = ref} fadingOut={true} /></div>
                        <div ref={(ref: HTMLDivElement) => this.divFloatingChat[3] = ref} className="floatingChat" style={{ display: "none" }}><Components.ChatList ref={(ref: Components.ChatList) => this.floatingChat[3] = ref} fadingOut={true} /></div>
                        <div ref={(ref: HTMLDivElement) => this.divFloatingChat[4] = ref} className="floatingChat" style={{ display: "none" }}><Components.ChatList ref={(ref: Components.ChatList) => this.floatingChat[4] = ref} fadingOut={true} /></div>
                        <div ref={(ref: HTMLDivElement) => this.divFloatingChat[5] = ref} className="floatingChat" style={{ display: "none" }}><Components.ChatList ref={(ref: Components.ChatList) => this.floatingChat[5] = ref} fadingOut={true} /></div>
                        <div ref={(ref: HTMLDivElement) => this.divFloatingChat[6] = ref} className="floatingChat" style={{ display: "none" }}><Components.ChatList ref={(ref: Components.ChatList) => this.floatingChat[6] = ref} fadingOut={true} /></div>
                        <div ref={(ref: HTMLDivElement) => this.divFloatingChat[7] = ref} className="floatingChat" style={{ display: "none" }}><Components.ChatList ref={(ref: Components.ChatList) => this.floatingChat[7] = ref} fadingOut={true} /></div>
                    </div>
                </div>
            );
        }
    }

    export class InitSC {
        constructor(targetId: string, classroomId: string, actionUrl: string) {
            ReactDOM.render(<div><SC targetId={targetId} classroomId={classroomId} actionUrl={actionUrl} /></div>, document.getElementById(targetId));
        }
    }
}