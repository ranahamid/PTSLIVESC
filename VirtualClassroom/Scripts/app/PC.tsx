/* tslint:disable:max-line-length */

namespace VC.App {
    "use strict";

    class PC extends XC {
        private status: Components.Status;
        private switchButton: Components.SwitchButton;
        private boxPublisher: Components.Box;
        private boxSubscriberLeft: Components.Box;
        private boxSubscriberRight: Components.Box;
        private labelLeft: Components.BoxLabel;
        private labelRight: Components.BoxLabel;
        private divLeftScreen: HTMLDivElement;
        private divRightScreen: HTMLDivElement;
        private divStatus: HTMLDivElement;
        private divUI: HTMLDivElement;
        private tabs: VC.Global.Components.Tabs;
        private chatPrivate: Components.Chat;
        private chatPublic: Components.Chat;
        private divForms: HTMLDivElement;
        private forms: PC.FormsPc;
        private divChat: HTMLDivElement;

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
            $(window).resize(() => this.fitHeightOfBoxes());
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
                // set chat name
                this.setChatUser(tokenData.Uid, tokenData.Name, tokenData.Role);
            } else if (this.isInMyGroup(tokenData.Uid)) {
                // my group
                if (tokenData.Role === Roles.SC) {
                    // seat computer
                    this.labelLeft.setText(tokenData.Name + " connected.", Components.BoxLabelStyle.Connected);
                    // show raise hand button
                    this.switchButton.setStatus(Components.SwitchButtonStatus.Start);
                } else if (tokenData.Role === Roles.TC) {
                    // teacher computer
                    this.labelRight.setText(tokenData.Name + " connected.", Components.BoxLabelStyle.Connected);
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
                    // seat computer
                    this.labelLeft.setText("Seat computer not connected.", Components.BoxLabelStyle.NotConnected);
                    // hide raise hand button
                    this.switchButton.setStatus(Components.SwitchButtonStatus.Hidden);
                } else if (tokenData.Role === Roles.TC) {
                    // teacher computer
                    this.labelRight.setText("Teacher computer not connected.", Components.BoxLabelStyle.NotConnected);
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
                if (tokenData.Role === Roles.SC) {
                    // seat computer
                    this.boxSubscriberLeft.subscribe(this.session, stream, this.dataResponse.ComputerSetting.Volume[0]);
                } else if (tokenData.Role === Roles.TC) {
                    // teacher computer
                    this.boxSubscriberRight.subscribe(this.session, stream, this.dataResponse.ComputerSetting.Volume[1]);
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
                if (tokenData.Role === Roles.SC) {
                    // seat computer
                    this.boxSubscriberLeft.unsubscribe(this.session);
                } else if (tokenData.Role === Roles.TC) {
                    // teacher computer
                    this.boxSubscriberRight.unsubscribe(this.session);
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
                case Global.SignalTypes.Chat:
                    this.chatSignalReceived(event);
                    break;
                case Global.SignalTypes.Forms:
                    this.formsSignalReceived(event);
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
            if (data.volume[0] != null) {
                this.dataResponse.ComputerSetting.Volume[0] = data.volume[0];
                this.boxSubscriberLeft.audioVolume(data.volume[0]);
            }
            if (data.volume[1] != null) {
                this.dataResponse.ComputerSetting.Volume[1] = data.volume[1];
                this.boxSubscriberRight.audioVolume(data.volume[1]);
            }
        }
        private turnOffSignalReceived(event: any): void {
            this.disconnect();
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
        private formsSignalReceived(event: any): void {
            let data: Global.ISignalFormsData = JSON.parse(event.data) as Global.ISignalFormsData;
            if (data.formId === undefined) {
                // answer received
                // we do a complete refresh here, its the only way how we can send the group signal from TC
                this.forms.formReceived();
            } else {
                // form answer deleted
                this.forms.formAnswerRemoved(data.formId);
            }
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
        private setUiVisibility(visible: boolean): void {
            this.divUI.style.display = visible ? "block" : "none";
            if (visible) {
                this.fitHeightOfBoxes();
            }
        }

        private tabOnClick(id: number): void {
            this.tabs.selectItem(id);

            if (id === 0) {
                // left screen
                this.showScreens(true, false);
            } else if (id === 1) {
                // left & right screen
                this.showScreens(true, true);
            } else if (id === 2) {
                // right screen
                this.showScreens(false, true);
            } else if (id === 3) {
                // surveys
                this.showSurveys();
            }
        };
        private showScreens(leftScreenVisible: boolean, rightScreenVisible: boolean): void {
            this.divForms.style.display = "none";
            this.divChat.style.display = "block";

            if (!leftScreenVisible) {
                // right screen only
                this.divLeftScreen.className = "";
                this.divLeftScreen.style.display = "none";
                this.divRightScreen.className = "col-sm-12";
                this.divRightScreen.style.display = "block";
                this.singleBoxVisible = true;
            } else if (!rightScreenVisible) {
                // left screen only
                this.divRightScreen.className = "";
                this.divRightScreen.style.display = "none";
                this.divLeftScreen.className = "col-sm-12";
                this.divLeftScreen.style.display = "block";
                this.singleBoxVisible = true;
            } else {
                // left & right screen
                this.divRightScreen.className = "col-sm-6";
                this.divRightScreen.style.display = "block";
                this.divLeftScreen.className = "col-sm-6";
                this.divLeftScreen.style.display = "block";
                this.singleBoxVisible = false;
            }

            this.fitHeightOfBoxes();
        }
        private showSurveys(): void {
            this.divLeftScreen.style.display = "none";
            this.divRightScreen.style.display = "none";
            this.divChat.style.display = "none";
            this.divForms.style.display = "block";
        }

        private fitHeightOfBoxes(): void {
            this.fitHeightOfBox(this.boxPublisher.getBox(), true);
            this.fitHeightOfBox(this.boxSubscriberLeft.getBox(), false);
            this.fitHeightOfBox(this.boxSubscriberRight.getBox(), false);
        }
        private fitHeightOfBox(box: HTMLDivElement, isPublisherBox: boolean): void {
            if (this.singleBoxVisible || isPublisherBox) {
                // 16:9
                $(box).css("height", ($(box).width() / 16 * 9) + "px");
            } else {
                // 4:3
                $(box).css("height", ($(box).width() / 4 * 3) + "px");
            }
        }

        private setChatUser(uid: string, name: string, role: Roles): void {
            this.chatPrivate.setChatUser({ uid: uid, name: name, role: role } as Components.IChatState);
            this.chatPublic.setChatUser({ uid: uid, name: name, role: role } as Components.IChatState);
        }

        private onChatPrivateItemSubmitted(item: Components.IChatListItem): void {
            // private chat, all PCs of my group + SC of my group + me
            let connections: Array<any> = [];
            connections = connections.concat(this.getConnectionsOfMyGroup(Roles.PC), this.getConnectionsOfMyGroup(Roles.SC));
            connections.push(this.getMyConnection());
            // send signal
            connections.forEach((c: any) => {
                Global.Signaling.sendSignal<Global.ISignalChatData>(this.session, c, Global.SignalTypes.Chat, {
                    userUid: item.userUid,
                    userName: item.userName,
                    userRole: item.userRole,
                    message: item.message,
                    type: Global.ChatType.Private
                } as Global.ISignalChatData);
            });
        }
        private onChatPublicItemSubmitted(item: Components.IChatListItem): void {
            Global.Signaling.sendSignalAll<Global.ISignalChatData>(this.session, Global.SignalTypes.Chat, {
                userUid: item.userUid,
                userName: item.userName,
                userRole: item.userRole,
                message: item.message,
                type: Global.ChatType.Public
            } as Global.ISignalChatData);
        }

        private onPendingAnswersChanged(count: number): void {
            if (count === 0) {
                this.tabs.updateBadge(3);
            } else {
                this.tabs.updateBadge(3, count);
            }
        }
        private onAnswerStatusChanged(formUid: string, answerUid: string, type: Forms.FormType, status: Forms.FormAnswerStatus, resultData: string): void {
            Global.Signaling.sendSignal<Global.ISignalFormsData>(this.session, this.getTcConnection(), Global.SignalTypes.Forms, {
                formId: formUid,
                answerId: answerUid,
                type: type,
                status: status,
                resultData: resultData
            } as Global.ISignalFormsData);
        }

        render(): JSX.Element {
            let tabItems: Array<VC.Global.Components.ITabItemProps> = [
                { id: 0, title: "Left screen only", onClick: this.tabOnClick.bind(this), active: false },
                { id: 1, title: "Left & Right screen", onClick: this.tabOnClick.bind(this), active: true },
                { id: 2, title: "Right screen only", onClick: this.tabOnClick.bind(this), active: false },
                { id: 3, title: "Surveys & Polls", onClick: this.tabOnClick.bind(this), active: false }
            ];

            let statusClasses: Array<string> = [
                "alert alert-warning",  // connecting
                "alert alert-success",  // connected
                "alert alert-danger"    // error
            ];

            let labelClasses: Array<string> = [
                "alert alert-warning",      // notConnected
                "alert alert-success",      // connected
                ""                          // handRaised (no need for PC)
            ];

            return (
                <div className="_cContainer">
                    <div ref={(ref: HTMLDivElement) => this.divStatus = ref}>
                        <Components.Status ref={(ref: Components.Status) => this.status = ref} text="Connecting ..." style={Components.StatusStyle.Connecting} className="cStatus" statusClasses={statusClasses} />
                    </div>
                    <div ref={(ref: HTMLDivElement) => this.divUI = ref} style={{ display: "none" }}>
                        <div className="row">
                            <div className="col-sm-2">
                                <Components.Box ref={(ref: Components.Box) => this.boxPublisher = ref} id={this.props.targetId + "_Publisher1"} streamProps={this.publishProps} className="cBoxP" visible={true} />
                            </div>
                            <div className="col-sm-10">
                                <Components.SwitchButton ref={(ref: Components.SwitchButton) => this.switchButton = ref} textOn="Raise your hand" textOff="Lower your hand" classOn="btn btn-success" classOff="btn btn-danger" iconOn="glyphicon glyphicon-hand-up" iconOff="glyphicon glyphicon-hand-down" status={Components.SwitchButtonStatus.Hidden} onOn={this.raiseHand.bind(this) } onOff={this.lowerHand.bind(this) } className="handButton" />
                            </div>
                        </div>
                        <VC.Global.Components.Tabs ref={(ref: VC.Global.Components.Tabs) => this.tabs = ref} items={tabItems} className="cTabs" />
                        <div className="row">
                            <div ref={(ref: HTMLDivElement) => this.divLeftScreen = ref} className="col-sm-6">
                                <Components.BoxLabel ref={(ref: Components.BoxLabel) => this.labelLeft = ref} text="Seat computer not connected..." style={Components.BoxLabelStyle.NotConnected} className="cBoxLabel" labelClasses={labelClasses} visible={true} />
                                <Components.Box ref={(ref: Components.Box) => this.boxSubscriberLeft = ref} id={this.props.targetId + "_Subscriber1"} streamProps={this.subscribeProps} className="cBox" visible={true} />
                            </div>
                            <div ref={(ref: HTMLDivElement) => this.divRightScreen = ref} className="col-sm-6">
                                <Components.BoxLabel ref={(ref: Components.BoxLabel) => this.labelRight = ref} text="Teacher computer not connected..." style={Components.BoxLabelStyle.NotConnected} className="cBoxLabel" labelClasses={labelClasses} visible={true} />
                                <Components.Box ref={(ref: Components.Box) => this.boxSubscriberRight = ref} id={this.props.targetId + "_Subscriber2"} streamProps={this.subscribeProps} className="cBox" visible={true} />
                            </div>
                        </div>

                        <div className="row" ref={(ref: HTMLDivElement) => this.divChat = ref}>
                            <div className="col-sm-6">
                                <Components.Chat ref={(ref: Components.Chat) => this.chatPrivate = ref} title="Seat chat (Private)" fixedHeight={false} onItemSubmitted={(item: Components.IChatListItem) => this.onChatPrivateItemSubmitted(item) } />
                            </div>
                            <div className="col-sm-6">
                                <Components.Chat ref={(ref: Components.Chat) => this.chatPublic = ref} title="Classroom chat (Public)" fixedHeight={false} onItemSubmitted={(item: Components.IChatListItem) => this.onChatPublicItemSubmitted(item) } />
                            </div>
                        </div>

                        <div ref={(ref: HTMLDivElement) => this.divForms = ref} style={{ display: "none" }}>
                            <App.PC.FormsPc ref={(ref: PC.FormsPc) => this.forms = ref} onPendingAnswersChanged={(count: number) => this.onPendingAnswersChanged(count) } onAnswerStatusChanged={(formUid: string, answerUid: string, type: Forms.FormType, status: Forms.FormAnswerStatus, resultData: string) => this.onAnswerStatusChanged(formUid, answerUid, type, status, resultData) } actionUrl={this.props.actionUrl} />
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