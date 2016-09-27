/* tslint:disable:max-line-length */

namespace VC.App {
    "use strict";

    class FC extends XC {
        private status: Components.Status;
        private boxSubscribers: Array<Components.Box> = new Array<Components.Box>(8);
        private label: Array<Components.BoxLabel> = new Array<Components.BoxLabel>(8);
        private divFloatingChat: Array<HTMLDivElement> = new Array<HTMLDivElement>(8);
        private floatingChat: Array<Components.ChatList> = new Array<Components.ChatList>(8);
        private divStatus: HTMLDivElement;
        private divUI: HTMLDivElement;
        private connectedStudents: Array<boolean> = [false, false, false, false, false, false, false, false];

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
                this.setState({ layout: this.dataResponse.ComputerSetting.Layout } as IState);
                this.setStatusVisibility(false);
                this.setUiVisibility(true);
            } else if (this.isInMyGroup(tokenData.Uid)) {
                // my group
                if (tokenData.Role === Roles.PC) {
                    // student
                    let groupComputer: Global.GroupComputer = this.getGroupComputer(tokenData.Uid);
                    this.label[groupComputer.Position - 1].setText(tokenData.Name + " connected.", Components.BoxLabelStyle.Connected);
                    this.connectedStudents[groupComputer.Position - 1] = true;
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
                    this.connectedStudents[groupComputer.Position - 1] = false;
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
                case Global.SignalTypes.RaiseHand:
                    this.raiseHandSignalReceived(event);
                    break;
                case Global.SignalTypes.Chat:
                    this.chatSignalReceived(event);
                    break;
                case Global.SignalTypes.FeaturedChanged:
                    this.featuredChangedSignalReceived(event);
                    break;
            }
        }
        private volumeSignalReceived(event: any): void {
            let data: Global.ISignalVolumeData = JSON.parse(event.data) as Global.ISignalVolumeData;
            for (let i: number = 0; i < data.volume.length; i++) {
                if (data.volume[i] !== null) {
                    this.dataResponse.ComputerSetting.Volume[i] = data.volume[i];
                    this.boxSubscribers[i].audioVolume(data.volume[i]);
                }
            }
        }
        private turnOffSignalReceived(event: any): void {
            let data: Global.ISignalTurnOffData = JSON.parse(event.data) as Global.ISignalTurnOffData;
            if (data.role === undefined || data.role === Roles.FC) {
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

        private featuredChangedSignalReceived(event: any): void {
            // let data: Global.ISignalFeaturedChangedData = JSON.parse(event.data) as Global.ISignalFeaturedChangedData;
            $.ajax({
                cache: false,
                type: "GET",
                url: this.props.actionUrl + "/GetData",
                success: (r: VC.Global.Data.IDataResponse<Global.IComputerData>): void => {
                    if (r.status === VC.Global.Data.RESPONSE_SUCCESS) {
                        this.featuredStudentsChanged(r.data);
                    } else {
                        // error
                        alert(r.message);
                    }
                },
                error: (xhr: JQueryXHR, status: string, error: string): void => {
                    // error
                    alert("XHR Error: " + xhr.statusText);
                }
            });
        }
        private featuredStudentsChanged(data: Global.IComputerData): void {
            // go thru current layout and unsubscribe from students that doesn't match their position anymore
            for (let i: number = 0; i < this.state.layout; i++) {
                if (this.connectedStudents[i]) {
                    let newStudent: Global.GroupComputer = this.getGroupStudentComputerByPosition(i + 1, data);
                    let currentStudent: Global.GroupComputer = this.getGroupStudentComputerByPosition(i + 1, this.dataResponse);
                    if (!this.compareGroupComputers(newStudent, currentStudent)) {
                        let connection: any = this.getConnectionByUid(currentStudent.Uid);
                        if (connection !== null) {
                            // unsubscribe
                            if (this.boxSubscribers[i].isConnected) {
                                this.boxSubscribers[i].unsubscribe(this.session);
                            }
                            this.label[i].setText("Student PC not connected.", Components.BoxLabelStyle.NotConnected);
                            this.floatingChat[i].clearChat();
                            // send signal to remove from group
                            Global.Signaling.sendSignal<Global.ISignalGroupChanged>(this.session, connection, Global.SignalTypes.GroupChanged, { addUids: [], removeUids: [this.dataResponse.Uid] } as Global.ISignalGroupChanged);
                            // disconnected status
                            this.connectedStudents[i] = false;
                        }
                    } else {
                        // since the student is recreated, update to default volume
                        if (this.boxSubscribers[i].isConnected) {
                            this.boxSubscribers[i].audioVolume(80); // todo: it would be worth to improve somehow .. the solution would be to improve it on the admin computer, so the current volume stays
                        }
                    }
                }
            }
            // update layout when need
            if (this.dataResponse.ComputerSetting.Layout !== data.ComputerSetting.Layout) {
                this.setState({ layout: data.ComputerSetting.Layout } as IState, () => {
                    this.fitLayout();
                });
            }

            // subscribe to new students
            for (let i: number = 0; i < this.state.layout; i++) {
                if (!this.connectedStudents[i]) {
                    let newStudent: Global.GroupComputer = this.getGroupStudentComputerByPosition(i + 1, data);
                    if (newStudent !== null) {
                        // label
                        let newStudentConnection: any = this.getConnectionByUid(newStudent.Uid);
                        if (newStudentConnection !== null) {
                            // try to get stream
                            let stream: any = this.getStream(newStudent.Uid);
                            if (stream !== null) {
                                // subscribe
                                this.boxSubscribers[i].subscribe(this.session, stream, data.ComputerSetting.Volume[i]);
                            }
                            let tokenData: Global.TokenData = Global.Fce.toTokenData(newStudentConnection.data);
                            this.label[i].setText(tokenData.Name + " connected.", Components.BoxLabelStyle.Connected);
                            // send signal to add to group
                            Global.Signaling.sendSignal<Global.ISignalGroupChanged>(this.session, newStudentConnection, Global.SignalTypes.GroupChanged, { addUids: [this.dataResponse.Uid], removeUids: [] } as Global.ISignalGroupChanged);
                            // set connected status
                            this.connectedStudents[i] = true;
                        }
                    }
                }
            }

            // update data response
            this.dataResponse = data;
        }
        private getGroupStudentComputerByPosition(position: number, data: Global.IComputerData): Global.GroupComputer {
            let iUser: Global.GroupComputer = null;
            for (let i: number = 0; i < data.Group.length && iUser === null; i++) {
                if (data.Group[i].Role === VC.App.Roles.PC && data.Group[i].Position === position) {
                    iUser = data.Group[i];
                }
            }
            return iUser;
        }

        private setStatusVisibility(visible: boolean): void {
            this.divStatus.style.display = visible ? "block" : "none";
        }
        private setLayoutVisibility(visible: boolean): void {
            // body1 style
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

        private fitLayout(): void {
            let windowHeight: number = $(window).innerHeight();
            let windowWidth: number = $(window).innerWidth();

            this.fitLayerSizes(windowWidth, windowHeight);
        }
        private fitLayerSizes(windowWidth: number, windowHeight: number): void {
            // boxes + width of labels & floating chat divs
            if (this.state.layout > 6) {
                for (let i: number = 0; i < this.state.layout; i++) {
                    $(this.boxSubscribers[i].getBox())
                        .css("width", "25%")
                        .css("height", windowHeight / 2 + "px"); // 8
                    $(this.label[i].getParentDiv()).css("width", "25%");
                }
            } else if (this.state.layout > 4) {
                for (let i: number = 0; i < this.state.layout; i++) {
                    $(this.boxSubscribers[i].getBox())
                        .css("width", "33.33%")
                        .css("height", windowHeight / 2 + "px"); // 6
                    $(this.label[i].getParentDiv()).css("width", "33.33%");
                }
            } else if (this.state.layout > 2) {
                for (let i: number = 0; i < this.state.layout; i++) {
                    $(this.boxSubscribers[i].getBox())
                        .css("width", "50%")
                        .css("height", windowHeight / 2 + "px"); // 4
                    $(this.label[i].getParentDiv()).css("width", "50%");
                }
            } else if (this.state.layout > 1) {
                for (let i: number = 0; i < this.state.layout; i++) {
                    $(this.boxSubscribers[i].getBox())
                        .css("width", "50%")
                        .css("height", windowHeight + "px"); // 2
                    $(this.label[i].getParentDiv()).css("width", "50%");
                }
            } else {
                for (let i: number = 0; i < this.state.layout; i++) {
                    $(this.boxSubscribers[i].getBox())
                        .css("width", "100%")
                        .css("height", windowHeight + "px"); // 1
                    $(this.label[i].getParentDiv()).css("width", "100%");
                }
            }
            // labels
            for (let i: number = 0; i < this.state.layout; i++) {
                $(this.label[i].getParentDiv())
                    .css("left", $(this.boxSubscribers[i].getBox()).position().left + "px")
                    .css("top", ($(this.boxSubscribers[i].getBox()).position().top + $(this.boxSubscribers[i].getBox()).height() - $(this.label[i].getParentDiv()).height()) + "px");
            }
            // floating chat
            for (let i: number = 0; i < this.state.layout; i++) {

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
                        <Components.Box ref={(ref: Components.Box) => this.boxSubscribers[0] = ref} id={this.props.targetId + "_Subscriber1"} streamProps={this.subscribeProps} className="cBox" visible={this.state.layout > 0} />
                        <Components.Box ref={(ref: Components.Box) => this.boxSubscribers[1] = ref} id={this.props.targetId + "_Subscriber2"} streamProps={this.subscribeProps} className="cBox" visible={this.state.layout > 1} />
                        <Components.Box ref={(ref: Components.Box) => this.boxSubscribers[2] = ref} id={this.props.targetId + "_Subscriber3"} streamProps={this.subscribeProps} className="cBox" visible={this.state.layout > 2} />
                        <Components.Box ref={(ref: Components.Box) => this.boxSubscribers[3] = ref} id={this.props.targetId + "_Subscriber4"} streamProps={this.subscribeProps} className="cBox" visible={this.state.layout > 2} />
                        <Components.Box ref={(ref: Components.Box) => this.boxSubscribers[4] = ref} id={this.props.targetId + "_Subscriber5"} streamProps={this.subscribeProps} className="cBox" visible={this.state.layout > 4} />
                        <Components.Box ref={(ref: Components.Box) => this.boxSubscribers[5] = ref} id={this.props.targetId + "_Subscriber6"} streamProps={this.subscribeProps} className="cBox" visible={this.state.layout > 4} />
                        <Components.Box ref={(ref: Components.Box) => this.boxSubscribers[6] = ref} id={this.props.targetId + "_Subscriber7"} streamProps={this.subscribeProps} className="cBox" visible={this.state.layout > 6} />
                        <Components.Box ref={(ref: Components.Box) => this.boxSubscribers[7] = ref} id={this.props.targetId + "_Subscriber8"} streamProps={this.subscribeProps} className="cBox" visible={this.state.layout > 6} />

                        <Components.BoxLabel ref={(ref: Components.BoxLabel) => this.label[0] = ref} text="Student not connected..." style={Components.BoxLabelStyle.NotConnected} className="cBoxLabel" labelClasses={labelClasses} visible={this.state.layout > 0} />
                        <Components.BoxLabel ref={(ref: Components.BoxLabel) => this.label[1] = ref} text="Student not connected..." style={Components.BoxLabelStyle.NotConnected} className="cBoxLabel" labelClasses={labelClasses} visible={this.state.layout > 1} />
                        <Components.BoxLabel ref={(ref: Components.BoxLabel) => this.label[2] = ref} text="Student not connected..." style={Components.BoxLabelStyle.NotConnected} className="cBoxLabel" labelClasses={labelClasses} visible={this.state.layout > 2} />
                        <Components.BoxLabel ref={(ref: Components.BoxLabel) => this.label[3] = ref} text="Student not connected..." style={Components.BoxLabelStyle.NotConnected} className="cBoxLabel" labelClasses={labelClasses} visible={this.state.layout > 2} />
                        <Components.BoxLabel ref={(ref: Components.BoxLabel) => this.label[4] = ref} text="Student not connected..." style={Components.BoxLabelStyle.NotConnected} className="cBoxLabel" labelClasses={labelClasses} visible={this.state.layout > 4} />
                        <Components.BoxLabel ref={(ref: Components.BoxLabel) => this.label[5] = ref} text="Student not connected..." style={Components.BoxLabelStyle.NotConnected} className="cBoxLabel" labelClasses={labelClasses} visible={this.state.layout > 4} />
                        <Components.BoxLabel ref={(ref: Components.BoxLabel) => this.label[6] = ref} text="Student not connected..." style={Components.BoxLabelStyle.NotConnected} className="cBoxLabel" labelClasses={labelClasses} visible={this.state.layout > 6} />
                        <Components.BoxLabel ref={(ref: Components.BoxLabel) => this.label[7] = ref} text="Student not connected..." style={Components.BoxLabelStyle.NotConnected} className="cBoxLabel" labelClasses={labelClasses} visible={this.state.layout > 6} />

                        <div ref={(ref: HTMLDivElement) => this.divFloatingChat[0] = ref} className="floatingChat" style={{ display: (this.state.layout > 0 ? "block" : "none") }}><Components.ChatList ref={(ref: Components.ChatList) => this.floatingChat[0] = ref} fadingOut={true} /></div>
                        <div ref={(ref: HTMLDivElement) => this.divFloatingChat[1] = ref} className="floatingChat" style={{ display: (this.state.layout > 1 ? "block" : "none") }}><Components.ChatList ref={(ref: Components.ChatList) => this.floatingChat[1] = ref} fadingOut={true} /></div>
                        <div ref={(ref: HTMLDivElement) => this.divFloatingChat[2] = ref} className="floatingChat" style={{ display: (this.state.layout > 2 ? "block" : "none") }}><Components.ChatList ref={(ref: Components.ChatList) => this.floatingChat[2] = ref} fadingOut={true} /></div>
                        <div ref={(ref: HTMLDivElement) => this.divFloatingChat[3] = ref} className="floatingChat" style={{ display: (this.state.layout > 2 ? "block" : "none") }}><Components.ChatList ref={(ref: Components.ChatList) => this.floatingChat[3] = ref} fadingOut={true} /></div>
                        <div ref={(ref: HTMLDivElement) => this.divFloatingChat[4] = ref} className="floatingChat" style={{ display: (this.state.layout > 4 ? "block" : "none") }}><Components.ChatList ref={(ref: Components.ChatList) => this.floatingChat[4] = ref} fadingOut={true} /></div>
                        <div ref={(ref: HTMLDivElement) => this.divFloatingChat[5] = ref} className="floatingChat" style={{ display: (this.state.layout > 4 ? "block" : "none") }}><Components.ChatList ref={(ref: Components.ChatList) => this.floatingChat[5] = ref} fadingOut={true} /></div>
                        <div ref={(ref: HTMLDivElement) => this.divFloatingChat[6] = ref} className="floatingChat" style={{ display: (this.state.layout > 6 ? "block" : "none") }}><Components.ChatList ref={(ref: Components.ChatList) => this.floatingChat[6] = ref} fadingOut={true} /></div>
                        <div ref={(ref: HTMLDivElement) => this.divFloatingChat[7] = ref} className="floatingChat" style={{ display: (this.state.layout > 6 ? "block" : "none") }}><Components.ChatList ref={(ref: Components.ChatList) => this.floatingChat[7] = ref} fadingOut={true} /></div>
                    </div>
                </div>
            );
        }
    }

    export class InitFC {
        constructor(targetId: string, classroomId: string, actionUrl: string) {
            ReactDOM.render(<div><FC targetId={targetId} classroomId={classroomId} actionUrl={actionUrl} /></div>, document.getElementById(targetId));
        }
    }
}