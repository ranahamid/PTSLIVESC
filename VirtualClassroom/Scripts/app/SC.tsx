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
        private chatPrivate: Components.Chat;
        private chatPublic: Components.Chat;
        private divChatPrivate: HTMLDivElement;
        private divChatPublic: HTMLDivElement;
        private divButtonChatPrivate: HTMLDivElement;
        private divButtonChatPublic: HTMLDivElement;

        constructor(props: IProps) {
            super(props, Roles.SC);
        }

        private privateChatOpened: boolean = false;
        private publicChatOpened: boolean = false;

        // abstract methods
        setStatusText(text: string, style: Components.StatusStyle): void {
            this.setStatusVisibility(true);
            this.status.setText(text, style);
        }

        didMount(): void {
            $(window).resize(() => window.setTimeout(() => this.fitLayout(), 0));
        }
        connected(connection: any, t: ConnectionType): void {
            let tokenData: Global.TokenData = Global.Fce.toTokenData(connection.data);
            if (this.dataResponse.Uid === tokenData.Uid) {
                // me
                this.setStatusVisibility(false);
                this.setUiVisibility(true);
                this.boxPublisher.publish(this.session,
                    PublishSources.Camera,
                    this.dataResponse.ComputerSetting.Audio,
                    this.dataResponse.ComputerSetting.Video,
                    (event: any):void => {
                        // nothing to do
                    },
                    (event: any): void => {
                        // nothing to do
                    }
                );
                // set chat name
                this.setChatUser(tokenData.Uid, tokenData.Name, tokenData.Role);
            } else {
                if (tokenData.Role === Roles.PC && t !== ConnectionType.AC) {
                    // student
                    this.label[tokenData.Position - 1].setText(tokenData.Name + " connected.", Components.BoxLabelStyle.Connected);
               } else if (tokenData.Role === Roles.AC) {
                    // admin computer
                    Global.Signaling.sendSignal<Global.ISignalConnectedData>(this.session2AC,
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
        }
        disconnected(connection: any, t: ConnectionType): void {
            let tokenData: Global.TokenData = Global.Fce.toTokenData(connection.data);
            if (this.dataResponse.Uid === tokenData.Uid) {
                // me
                this.boxPublisher.unpublish(this.session);
                this.setUiVisibility(false);
                this.setStatusText("Disconnected from the session.", Components.StatusStyle.Error);
            } else {
                if (tokenData.Role === Roles.PC && t !== ConnectionType.AC) {
                    // student
                    this.label[tokenData.Position - 1].setText("Student PC not connected.", Components.BoxLabelStyle.NotConnected);
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
            } else {
                // student
                this.boxSubscribers[tokenData.Position - 1].subscribe(this.session, stream, this.dataResponse.ComputerSetting.Volume[tokenData.Position - 1]);
            }
        }
        streamDestroyed(connection: any, stream: any): void {
            let tokenData: Global.TokenData = Global.Fce.toTokenData(connection.data);
            if (this.dataResponse.Uid === tokenData.Uid) {
                // me .. there is not fired this event for publisher
            } else {
                // student
                this.boxSubscribers[tokenData.Position - 1].unsubscribe(this.session);
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
                case Global.SignalTypes.RaiseHand:
                    this.raiseHandSignalReceived(event);
                    break;
                case Global.SignalTypes.Chat:
                    this.chatSignalReceived(event);
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
        private raiseHandSignalReceived(event: any): void {
            let tokenData: Global.TokenData = Global.Fce.toTokenData(event.from.data);
            let data: Global.ISignalRaiseHandData = JSON.parse(event.data) as Global.ISignalRaiseHandData;

            this.label[tokenData.Position].setStyle(data.raised ? Components.BoxLabelStyle.HandRaised : Components.BoxLabelStyle.Connected);
        }
        private chatSignalReceived(event: any): void {
            let data: Global.ISignalChatData = JSON.parse(event.data) as Global.ISignalChatData;
            if (data.type === Global.ChatType.Private) {
                // private chat
                this.chatPrivate.addItem({
                    userUid: data.userUid,
                    userName: data.userName,
                    userRole: data.userRole,
                    message: data.message,
                    timestamp: new Date(),
                    me: false
                } as Components.IChatListItem);
                // students
                if (data.userRole === Roles.PC) {
                    let connection: any = this.getConnectionByUid(data.userUid);
                    if (connection != null) {
                        let tokenData: Global.TokenData = Global.Fce.toTokenData(connection.data);
                        this.floatingChat[tokenData.Position - 1].addItem({
                            userUid: data.userUid,
                            userRole: data.userRole,
                            userName: data.userName,
                            message: data.message,
                            timestamp: new Date(),
                            me: false
                        } as Components.IChatListItem);
                    }
                }
            } else if (data.type === Global.ChatType.Public) {
                // public chat
                this.chatPublic.addItem({
                    userUid: data.userUid,
                    userName: data.userName,
                    userRole: data.userRole,
                    message: data.message,
                    timestamp: new Date(),
                    me: false
                } as Components.IChatListItem);
            }
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
            this.fitPositionOfFloatingButtons(windowWidth, windowHeight);
            this.fitPositionOfChat(windowWidth, windowHeight);
        }
        private fitLayerSizes(windowWidth: number, windowHeight: number): void {
            // boxes + width of labels & floating chat divs
            if (this.props.layout > 6) {
                for (let i: number = 0; i < this.props.layout; i++) {
                    $(this.boxSubscribers[i].getBox())
                        .css("width", "25%")
                        .css("height", windowHeight / 2 + "px"); // 8
                    $(this.label[i].getParentDiv()).css("width", "25%");
                    $(this.divFloatingChat[i]).css("width", "25%");
                }
            } else if (this.props.layout > 4) {
                for (let i: number = 0; i < this.props.layout; i++) {
                    $(this.boxSubscribers[i].getBox())
                        .css("width", "33.33%")
                        .css("height", windowHeight / 2 + "px"); // 6
                    $(this.label[i].getParentDiv()).css("width", "33.33%");
                    $(this.divFloatingChat[i]).css("width", "33.33%");
                }
            } else if (this.props.layout > 2) {
                for (let i: number = 0; i < this.props.layout; i++) {
                    $(this.boxSubscribers[i].getBox())
                        .css("width", "50%")
                        .css("height", windowHeight / 2 + "px"); // 4
                    $(this.label[i].getParentDiv()).css("width", "50%");
                    $(this.divFloatingChat[i]).css("width", "50%");
                }
            } else {
                for (let i: number = 0; i < this.props.layout; i++) {
                    $(this.boxSubscribers[i].getBox())
                        .css("width", "50%")
                        .css("height", windowHeight + "px"); // 2
                    $(this.label[i].getParentDiv()).css("width", "50%");
                    $(this.divFloatingChat[i]).css("width", "50%");
                }
            }
            // labels
            for (let i: number = 0; i < this.props.layout; i++) {
                $(this.label[i].getParentDiv())
                    .css("left", $(this.boxSubscribers[i].getBox()).position().left + "px")
                    .css("top", $(this.boxSubscribers[i].getBox()).position().top + "px");
            }
            // floating chat
            for (let i: number = 0; i < this.props.layout; i++) {

                $(this.divFloatingChat[i])
                    .css("left", $(this.boxSubscribers[i].getBox()).position().left + "px")
                    .css("top", ($(this.boxSubscribers[i].getBox()).position().top + $(this.label[i].getParentDiv()).height()) + "px")
                    .css("height", ($(this.boxSubscribers[i].getBox()).height() - $(this.label[i].getParentDiv()).height()) + "px");
            }
        }

        private fitPositionOfFloatingButtons(windowWidth: number, windowHeight: number): void {
            // fit buttons on the bottom of the page
            if (!this.privateChatOpened) {
                this.divButtonChatPrivate.style.left = "0px";
                this.divButtonChatPrivate.style.top = (windowHeight - this.divButtonChatPrivate.clientHeight) + "px";
            } else {
                this.divButtonChatPrivate.style.left = "0px";
                this.divButtonChatPrivate.style.top = Math.abs(this.divButtonChatPrivate.clientHeight) + "px";
            }

            if (!this.publicChatOpened) {
                this.divButtonChatPublic.style.left = (windowWidth / 2) + "px";
                this.divButtonChatPublic.style.top = (windowHeight - this.divButtonChatPublic.clientHeight) + "px";
            } else {
                this.divButtonChatPublic.style.left = "0px";
                this.divButtonChatPublic.style.top = Math.abs(this.divButtonChatPublic.clientHeight) + "px";
            }
        }
        private fitPositionOfChat(windowWidth: number, windowHeight: number): void {
            if (this.privateChatOpened) {
                this.divChatPrivate.style.left = "0px";
                this.divChatPrivate.style.top = (windowHeight - this.divChatPrivate.clientHeight) + "px";
            } else {
                this.divChatPrivate.style.left = "0px";
                this.divChatPrivate.style.top = Math.abs(this.divChatPrivate.clientHeight) + "px";
            }

            if (this.publicChatOpened) {
                this.divChatPublic.style.left = (windowWidth / 2) + "px";
                this.divChatPublic.style.top = (windowHeight - this.divChatPublic.clientHeight) + "px";
            } else {
                this.divChatPublic.style.left = "0px";
                this.divChatPublic.style.top = Math.abs(this.divChatPublic.clientHeight) + "px";
            }
        }

        private showPrivateChat(): void {
            for (let i: number = 0; i < this.props.layout; i++) {
                this.divFloatingChat[i].style.display = "none";
            }
            this.divButtonChatPrivate.style.display = "none";
            this.divChatPrivate.style.display = "block";
            this.chatPrivate.fitTbHeight();

            this.privateChatOpened = true;
            this.fitLayout();
        }
        private showPublicChat(): void {
            this.divButtonChatPublic.style.display = "none";
            this.divChatPublic.style.display = "block";
            this.chatPublic.fitTbHeight();

            this.publicChatOpened = true;
            this.fitLayout();
        }

        private hidePrivateChat(): void {
            this.divChatPrivate.style.display = "none";
            for (let i: number = 0; i < this.props.layout; i++) {
                this.divFloatingChat[i].style.display = "block";
            }
            this.divButtonChatPrivate.style.display = "block";

            this.privateChatOpened = false;
            this.fitLayout();
        }
        private hidePublicChat(): void {
            this.divChatPublic.style.display = "none";
            this.divButtonChatPublic.style.display = "block";

            this.publicChatOpened = false;
            this.fitLayout();
        }

        private setChatUser(uid: string, name: string, role: Roles): void {
            this.chatPrivate.setChatUser({ uid: uid, name: name, role: role } as Components.IChatState);
            this.chatPublic.setChatUser({ uid: uid, name: name, role: role } as Components.IChatState);
        }

        private onChatPrivateItemSubmitted(item: Components.IChatListItem): void {
            Global.Signaling.sendSignalAll<Global.ISignalChatData>(this.session, Global.SignalTypes.Chat, {
                userUid: item.userUid,
                userName: item.userName,
                userRole: item.userRole,
                message: item.message,
                type: Global.ChatType.Private
            } as Global.ISignalChatData);
        }
        private onChatPublicItemSubmitted(item: Components.IChatListItem): void {
            Global.Signaling.sendSignalAll<Global.ISignalChatData>(this.session2AC, Global.SignalTypes.Chat, {
                userUid: item.userUid,
                userName: item.userName,
                userRole: item.userRole,
                message: item.message,
                type: Global.ChatType.Public
            } as Global.ISignalChatData);
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

                        <div ref={(ref: HTMLDivElement) => this.divFloatingChat[0] = ref} className="floatingChat" style={{ display: (this.props.layout > 0 ? "block" : "none") }}><Components.ChatList ref={(ref: Components.ChatList) => this.floatingChat[0] = ref} fadingOut={true} /></div>
                        <div ref={(ref: HTMLDivElement) => this.divFloatingChat[1] = ref} className="floatingChat" style={{ display: (this.props.layout > 0 ? "block" : "none") }}><Components.ChatList ref={(ref: Components.ChatList) => this.floatingChat[1] = ref} fadingOut={true} /></div>
                        <div ref={(ref: HTMLDivElement) => this.divFloatingChat[2] = ref} className="floatingChat" style={{ display: (this.props.layout > 2 ? "block" : "none") }}><Components.ChatList ref={(ref: Components.ChatList) => this.floatingChat[2] = ref} fadingOut={true} /></div>
                        <div ref={(ref: HTMLDivElement) => this.divFloatingChat[3] = ref} className="floatingChat" style={{ display: (this.props.layout > 2 ? "block" : "none") }}><Components.ChatList ref={(ref: Components.ChatList) => this.floatingChat[3] = ref} fadingOut={true} /></div>
                        <div ref={(ref: HTMLDivElement) => this.divFloatingChat[4] = ref} className="floatingChat" style={{ display: (this.props.layout > 4 ? "block" : "none") }}><Components.ChatList ref={(ref: Components.ChatList) => this.floatingChat[4] = ref} fadingOut={true} /></div>
                        <div ref={(ref: HTMLDivElement) => this.divFloatingChat[5] = ref} className="floatingChat" style={{ display: (this.props.layout > 4 ? "block" : "none") }}><Components.ChatList ref={(ref: Components.ChatList) => this.floatingChat[5] = ref} fadingOut={true} /></div>
                        <div ref={(ref: HTMLDivElement) => this.divFloatingChat[6] = ref} className="floatingChat" style={{ display: (this.props.layout > 6 ? "block" : "none") }}><Components.ChatList ref={(ref: Components.ChatList) => this.floatingChat[6] = ref} fadingOut={true} /></div>
                        <div ref={(ref: HTMLDivElement) => this.divFloatingChat[7] = ref} className="floatingChat" style={{ display: (this.props.layout > 6 ? "block" : "none") }}><Components.ChatList ref={(ref: Components.ChatList) => this.floatingChat[7] = ref} fadingOut={true} /></div>

                        <div ref={(ref: HTMLDivElement) => this.divButtonChatPrivate = ref} className="floatingButton" style={{ display: "block" }}>
                            <button type="button" className="btn btn-sm btn-default" onClick={() => this.showPrivateChat() }>Seat chat (Private) </button>
                        </div>
                        <div ref={(ref: HTMLDivElement) => this.divButtonChatPublic = ref} className="floatingButton" style={{ display: "block" }}>
                            <button type="button" className="btn btn-sm btn-default" onClick={() => this.showPublicChat() }>Classroom chat (Public) </button>
                        </div>

                        <div ref={(ref: HTMLDivElement) => this.divChatPrivate = ref} style={{ display: "none" }} className="scChat">
                            <Components.Chat ref={(ref: Components.Chat) => this.chatPrivate = ref} title="Seat chat (Private)" fixedHeight={true} onChatClosed={() => this.hidePrivateChat() } onItemSubmitted={(item: Components.IChatListItem) => this.onChatPrivateItemSubmitted(item) }  />
                        </div>
                        <div ref={(ref: HTMLDivElement) => this.divChatPublic = ref} style={{ display: "none" }}className="scChat">
                            <Components.Chat ref={(ref: Components.Chat) => this.chatPublic = ref} title="Classroom chat (Public)" fixedHeight={true} onChatClosed={() => this.hidePublicChat() } onItemSubmitted={(item: Components.IChatListItem) => this.onChatPublicItemSubmitted(item) }  />
                        </div>

                    </div>
                </div>
            );
        }
    }

    export class InitSC {
        constructor(targetId: string, actionUrl: string, layout: number) {
            ReactDOM.render(<div><SC targetId={targetId} actionUrl={actionUrl} layout={layout} /></div>, document.getElementById(targetId));
        }
    }
}