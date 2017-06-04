/* tslint:disable:max-line-length */

namespace VC.App {
    "use strict";

    class PC extends XC {
        private status: Components.Status;
        private switchButtonHand: Components.SwitchButton;
        private switchButtonAudio: Components.SwitchButton;
        private switchButtonVideo: Components.SwitchButton;
        private boxPublisher: Components.Box;
        private boxSubscriber: Components.Box;
        private label: Components.BoxLabel;
        private divStatus: HTMLDivElement;
        private divUI: HTMLDivElement;
        private divButtons: HTMLDivElement;
        private chatPublic: Components.Chat;
        private divMain: HTMLDivElement;
        private divFrame: HTMLDivElement;
        private studentsAudio: Components.Audio;

        public singleBoxVisible: boolean = false;

        constructor(props: IProps) {
            super(props, Roles.PC);
            this.studentsAudio = new Components.Audio();
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
            if (this.dataResponse.Uid === tokenData.Uid)
            {
                // me
                this.setStatusVisibility(false);
                this.setUiVisibility(true);
                this.boxPublisher.publish(this.session,
                    PublishSources.Camera,
                    this.dataResponse.ComputerSetting.Audio,
                    this.dataResponse.ComputerSetting.Video,
                    (event: any) => {
                        // started
                        if (this.dataResponse.ComputerSetting.Audio) {
                            // send signal to subscribe my audio
                            Global.Signaling.sendSignalAll<Global.ISignalAudioPublish>(this.session, Global.SignalTypes.AudioPublish, {
                                studentUid: this.dataResponse.Uid,
                                audionOn: true
                            } as Global.ISignalAudioPublish);
                        }
                    },
                    (event: any) => {
                        // stopped
                        if (this.dataResponse.ComputerSetting.Audio) {
                            // send signal to unsubscribe my audio
                            Global.Signaling.sendSignalAll<Global.ISignalAudioPublish>(this.session, Global.SignalTypes.AudioPublish, {
                                studentUid: this.dataResponse.Uid,
                                audionOn: false
                            } as Global.ISignalAudioPublish);
                        }
                    }
                );
                // av buttons
                this.switchButtonAudio.setStatus(this.dataResponse.ComputerSetting.Audio ? Components.SwitchButtonStatus.Start : Components.SwitchButtonStatus.Stop);
                this.switchButtonVideo.setStatus(this.dataResponse.ComputerSetting.Video ? Components.SwitchButtonStatus.Start : Components.SwitchButtonStatus.Stop);
                // set chat name
                this.setChatUser(tokenData.Uid, tokenData.Name, tokenData.Role);
            } else if (this.isInMyGroup(tokenData.Uid)) {
                // my group
                if (tokenData.Role === Roles.SC) {
                    // seat computer
                    if (this.switchButtonHand.getStatus() === Components.SwitchButtonStatus.Stop) {
                        Global.Signaling.sendSignal<Global.ISignalRaiseHandData>(this.session, connection, Global.SignalTypes.RaiseHand, { raised: true } as Global.ISignalRaiseHandData);
                    }
                } else if (tokenData.Role === Roles.FC) {
                    // featured computer
                    if (this.switchButtonHand.getStatus() === Components.SwitchButtonStatus.Stop) {
                        Global.Signaling.sendSignal<Global.ISignalRaiseHandData>(this.session, connection, Global.SignalTypes.RaiseHand, { raised: true } as Global.ISignalRaiseHandData);
                    }
                } else if (tokenData.Role === Roles.TC) {
                    // teacher computer
                    this.label.setText(tokenData.Name + " connected.", Components.BoxLabelStyle.Connected);
                    // send notification that im connected
                    Global.Signaling.sendSignal<Global.ISignalConnectedData>(this.session, connection, Global.SignalTypes.Connected, {} as Global.ISignalConnectedData);
                    // send signal to subscribe to my audio
                    if (this.dataResponse.ComputerSetting.Audio && this.boxPublisher.isConnected) {
                        Global.Signaling.sendSignal<Global.ISignalAudioPublish>(this.session, connection, Global.SignalTypes.AudioPublish, {
                            studentUid: this.dataResponse.Uid,
                            audionOn: true
                        } as Global.ISignalAudioPublish);
                    }
                } else if (tokenData.Role === Roles.PC) {
                   
                    // send signal to subscribe to my audio
                    if (this.dataResponse.ComputerSetting.Audio && this.boxPublisher.isConnected) {
                        Global.Signaling.sendSignal<Global.ISignalAudioPublish>(this.session, connection, Global.SignalTypes.AudioPublish, {
                            studentUid: this.dataResponse.Uid,
                            audionOn: true
                        } as Global.ISignalAudioPublish);
                    }
                }
            } else if (tokenData.Role === Roles.AC) {
                // admin computer
                Global.Signaling.sendSignal<Global.ISignalConnectedData>(this.session,
                    connection,
                    Global.SignalTypes.Connected,
                    {
                        audio: this.dataResponse.ComputerSetting.Audio,
                        video: this.dataResponse.ComputerSetting.Video,
                        volume: this.dataResponse.ComputerSetting.Volume,
                        handRaised: (this.switchButtonHand.getStatus() === Components.SwitchButtonStatus.Stop)
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
                if (tokenData.Role === Roles.TC) {
                    // teacher computer
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
                    // teacher computer
                    this.boxSubscriber.subscribe(this.session, stream, this.dataResponse.ComputerSetting.Volume);
                } else if (tokenData.Role === Roles.PC) {
                    // student computer
                    // connect to audio .. auto subscribe, we are going to do signal based subscribing, to do not subsribe automatically to everyone
                    // this.studentsAudio.subscribe(tokenData.Uid, this.session, stream, this.dataResponse.ComputerSetting.Volume);
                }
            }
        }
        streamDestroyed(connection: any, stream: any): void {
            let tokenData: Global.TokenData = Global.Fce.toTokenData(connection.data);
            if (this.dataResponse.Uid === tokenData.Uid) {
                // me .. there is not fired this event for publisher
            } else if (this.isInMyGroup(tokenData.Uid)) {
                // my group
                if (tokenData.Role === Roles.TC) {
                    // teacher computer
                    this.boxSubscriber.unsubscribe(this.session);
                } else if (tokenData.Role === Roles.PC) {
                    // student computer
                    this.studentsAudio.unsubscribe(tokenData.Uid, this.session, stream);
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
                case Global.SignalTypes.GroupChanged:
                    this.groupChangedSignalReceived(event);
                    break;
                case Global.SignalTypes.AudioPublish:
                    this.audioPublishSignalReceived(event);
                    break;
                case Global.SignalTypes.RaiseHand:
                    this.raiseHandSignalReceived(event);
                    break;
            }
        }
        private turnAvSignalReceived(event: any): void {
            let data: Global.ISignalTurnAvData = JSON.parse(event.data) as Global.ISignalTurnAvData;
            if (data.role === undefined || data.role === Roles.PC) {
                if (data.audio !== null) {
                    this.dataResponse.ComputerSetting.Audio = data.audio;
                    this.boxPublisher.audio(data.audio);
                    this.switchButtonAudio.setStatus(this.dataResponse.ComputerSetting.Audio ? Components.SwitchButtonStatus.Start : Components.SwitchButtonStatus.Stop);
                }
                if (data.video !== null) {
                    this.dataResponse.ComputerSetting.Video = data.video;
                    this.boxPublisher.video(data.video);
                    this.switchButtonVideo.setStatus(this.dataResponse.ComputerSetting.Video ? Components.SwitchButtonStatus.Start : Components.SwitchButtonStatus.Stop);
                }
            }
        }
        private volumeSignalReceived(event: any): void {
            let data: Global.ISignalVolumeData = JSON.parse(event.data) as Global.ISignalVolumeData;
            if (data.volume !== null) {
                this.dataResponse.ComputerSetting.Volume = data.volume;
                this.boxSubscriber.audioVolume(data.volume);
                this.studentsAudio.audioVolume(data.volume);
            }
        }
        private turnOffSignalReceived(event: any): void {
            let data: Global.ISignalTurnOffData = JSON.parse(event.data) as Global.ISignalTurnOffData;
            if (data.role === undefined || data.role === Roles.PC) {
                this.disconnect();
            }
        }
        private raiseHandSignalReceived(event: any): void {
            let tokenData: Global.TokenData = Global.Fce.toTokenData(event.from.data);

            if (tokenData.Role === Roles.AC) {
                // can be received from AC only
                let data: Global.ISignalRaiseHandData = JSON.parse(event.data) as Global.ISignalRaiseHandData;

                if (data.raised) {
                    this.raiseHand();
                } else {
                    this.lowerHand();
                }
            }
        }
        private chatSignalReceived(event: any): void {
            let data: Global.ISignalChatData = JSON.parse(event.data) as Global.ISignalChatData;
                if (data.type === Global.ChatType.Public) {
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
        private groupChangedSignalReceived(event: any): void {
            let data: Global.ISignalGroupChanged = JSON.parse(event.data) as Global.ISignalGroupChanged;
            data.addUids.forEach((uid: string) => {
                let added: boolean = this.addGroupComputer(uid);
                if (added) {
                    if (this.switchButtonHand.getStatus() === Components.SwitchButtonStatus.Stop) {
                        let connection: any = this.getConnectionByUid(uid);
                        Global.Signaling.sendSignal<Global.ISignalRaiseHandData>(this.session, connection, Global.SignalTypes.RaiseHand, { raised: true } as Global.ISignalRaiseHandData);
                    }
                }
            });
            data.removeUids.forEach((uid: string) => {
                this.removeGroupComputer(uid);
            });
        }
        private audioPublishSignalReceived(event: any): void {
            let data: Global.ISignalAudioPublish = JSON.parse(event.data) as Global.ISignalAudioPublish;

            if (this.isInMyGroup(data.studentUid)) {
                if (data.audionOn) {
                    // subscribe to audio
                    this.studentsAudio.subscribe(data.studentUid, this.session, this.getStream(data.studentUid), this.dataResponse.ComputerSetting.Volume);
                } else {
                    // unsubscribe from audio
                    this.studentsAudio.unsubscribe(data.studentUid, this.session, this.getStream(data.studentUid));
                }
            }
        }

        private raiseHand(): void {
            Global.Signaling.sendSignal<Global.ISignalRaiseHandData>(this.session, this.getScConnection(), Global.SignalTypes.RaiseHand, { raised: true } as Global.ISignalRaiseHandData);
            Global.Signaling.sendSignal<Global.ISignalRaiseHandData>(this.session, this.getAcConnection(), Global.SignalTypes.RaiseHand, { raised: true } as Global.ISignalRaiseHandData);

            this.getFcConnections().forEach((c: any) => {
                Global.Signaling.sendSignal<Global.ISignalRaiseHandData>(this.session, c, Global.SignalTypes.RaiseHand, { raised: true } as Global.ISignalRaiseHandData);
            });

            this.switchButtonHand.setStatus(Components.SwitchButtonStatus.Stop);
        }
        private lowerHand(): void {
            Global.Signaling.sendSignal<Global.ISignalRaiseHandData>(this.session, this.getScConnection(), Global.SignalTypes.RaiseHand, { raised: false } as Global.ISignalRaiseHandData);
            Global.Signaling.sendSignal<Global.ISignalRaiseHandData>(this.session, this.getAcConnection(), Global.SignalTypes.RaiseHand, { raised: false } as Global.ISignalRaiseHandData);

            this.getFcConnections().forEach((c: any) => {
                Global.Signaling.sendSignal<Global.ISignalRaiseHandData>(this.session, c, Global.SignalTypes.RaiseHand, { raised: false } as Global.ISignalRaiseHandData);
            });

            this.switchButtonHand.setStatus(Components.SwitchButtonStatus.Start);
        }

        private setChatUser(uid: string, name: string, role: Roles): void {
            this.chatPublic.setChatUser({ uid: uid, name: name, role: role } as Components.IChatState);
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
        private turnAv(audio?: boolean, video?: boolean): void {
            // set
            if (audio !== null) {
                this.dataResponse.ComputerSetting.Audio = audio;
                this.boxPublisher.audio(audio);
                this.switchButtonAudio.setStatus(this.dataResponse.ComputerSetting.Audio ? Components.SwitchButtonStatus.Start : Components.SwitchButtonStatus.Stop);
                // send signal to subscribe/unsubsribe my audio
                Global.Signaling.sendSignalAll<Global.ISignalAudioPublish>(this.session, Global.SignalTypes.AudioPublish, {
                    studentUid: this.dataResponse.Uid,
                    audionOn: audio
                } as Global.ISignalAudioPublish);
            }
            if (video !== null) {
                this.dataResponse.ComputerSetting.Video = video;
                this.boxPublisher.video(video);
                this.switchButtonVideo.setStatus(this.dataResponse.ComputerSetting.Video ? Components.SwitchButtonStatus.Start : Components.SwitchButtonStatus.Stop);
            }
            // update db
            $.ajax({
                cache: false,
                type: "POST",
                url: this.props.actionUrl + "/TurnAv",
                data: JSON.stringify({ audio: audio, video: video }),
                contentType: "application/json",
                success: (r: any): void => {
                    // send signal
                    Global.Signaling.sendSignal<Global.ISignalTurnAvData>(this.session, this.getAcConnection(), Global.SignalTypes.TurnAv, { audio: audio, video: video } as Global.ISignalTurnAvData);
                },
                error: (xhr: JQueryXHR, status: string, error: string): void => {
                    // error
                    console.log("ERROR 0x01: " + error);
                }
            });
        }


        private setStatusVisibility(visible: boolean): void {
            this.divStatus.style.display = visible ? "block" : "none";
        }
        private setLayoutVisibility(visible: boolean): void {
            // body1 style
            let body1: HTMLBodyElement = document.getElementById("Body1") as HTMLBodyElement;
            body1.className = visible ? "lightBody" : "Gray98";

            /*
            // divBody1 class
            let divBody1: HTMLElement = document.getElementById("DivBody1");
            divBody1.className = visible ? "divBody" : "";

            // header1
            let header1: HTMLElement = document.getElementById("Header1");
            header1.style.display = visible ? "block" : "none";

            // footer1
            let footer1: HTMLElement = document.getElementById("Footer1");
            footer1.style.display = visible ? "block" : "none";
            */
        }

        private setUiVisibility(visible: boolean): void {
            this.setLayoutVisibility(!visible);
            this.divUI.style.display = visible ? "block" : "none";
            if (visible) {
                window.setTimeout(() =>
                    this.fitLayout(), 0);
            }
        }

        private fitLayout(): void {
            let header1: HTMLElement = document.getElementById("Header1");
            let footer1: HTMLElement = document.getElementById("Footer1");

            let windowHeight: number = $(window).innerHeight();

            let headerHeight: number = $(header1).outerHeight();
            let footerHeight: number = $(footer1).outerHeight();

            let innerHeight: number = windowHeight - (headerHeight + footerHeight + 90); // 90 = padding

            if (innerHeight < 653) {
                innerHeight = 653;
            }

            $(this.boxSubscriber.getBox())
                .css("width", "100%")
                .css("height", innerHeight + "px");

            $(this.label.getParentDiv())
                .css("width", $(this.boxSubscriber.getBox()).width() + "px")
                .css("left", $(this.boxSubscriber.getBox()).position().left + "px")
                .css("top", ($(this.boxSubscriber.getBox()).position().top + $(this.boxSubscriber.getBox()).height() - $(this.label.getParentDiv()).height()) + "px");

            // frame
            let frameWidth: number = $(this.divFrame).width();

            let publisherHeight: number = Math.round(frameWidth / 16 * 9);

            $(this.boxPublisher.getBox())
                .css("width", "100%")
                .css("height", publisherHeight + "px");

            let divButtonsHeight: number = $(this.divButtons).height();

            let chatHeight: number = innerHeight - (publisherHeight + divButtonsHeight);

            this.chatPublic.setHeight(chatHeight);

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
                ""              // handRaised (no need for PC)
            ];

            return (
                <div className="pcContainer">
                    <div ref={(ref: HTMLDivElement) => this.divStatus = ref}>
                        <Components.Status ref={(ref: Components.Status) => this.status = ref} text="Connecting ..." style={Components.StatusStyle.Connecting} className="cStatus" statusClasses={statusClasses} />
                    </div>
                    <div ref={(ref: HTMLDivElement) => this.divUI = ref} style={{ display: "none" }} className="layout">
                        <table width="100%" frameBorder="0">
                            <tr>
                                <td>
                                    <div ref={(ref: HTMLDivElement) => this.divMain = ref} className="main">
                                        <Components.Box ref={(ref: Components.Box) => this.boxSubscriber = ref} id={this.props.targetId + "_Subscriber1"} streamProps={this.subscribeProps} className="cBox" visible={true} />
                                        <Components.BoxLabel ref={(ref: Components.BoxLabel) => this.label = ref} text="Teacher computer not connected..." style={Components.BoxLabelStyle.NotConnected} className="cBoxLabel" labelClasses={labelClasses} visible={true} />
                                    </div>
                                    <div ref={(ref: HTMLDivElement) => this.divFrame = ref} className="frame">
                                        <div ref={(ref: HTMLDivElement) => this.divButtons = ref} className="divButtons">
                                            <div ><Components.SwitchButton ref={(ref: Components.SwitchButton) => this.switchButtonVideo = ref} textOn="" textOff="" classOn="btn btn-success" classOff="btn btn-danger" iconOn="glyphicon facetime-video-on" iconOff="glyphicon facetime-video-off" status={Components.SwitchButtonStatus.Hidden } onOn={() => { this.turnAv(null, false) } } onOff={() => { this.turnAv(null, true) } } className="avButton" delayed={500} /></div>
                                            <div ><Components.SwitchButton ref={(ref: Components.SwitchButton) => this.switchButtonAudio = ref} textOn="" textOff="" classOn="btn btn-success" classOff="btn btn-danger" iconOn="glyphicon music-on" iconOff="glyphicon music-off" status={Components.SwitchButtonStatus.Hidden } onOn={() => { this.turnAv(false, null) } } onOff={() => { this.turnAv(true, null) } } className="avButton" delayed={500} /></div>                                            
                                            <div ><Components.SwitchButton ref={(ref: Components.SwitchButton) => this.switchButtonHand = ref} textOn="" textOff="" classOn="btn btn-success " classOff="btn btn-danger " iconOn="glyphicon rise-hand-on" iconOff="glyphicon rise-hand-off" status={Components.SwitchButtonStatus.Start} onOn={this.raiseHand.bind(this) } onOff={this.lowerHand.bind(this) } className="handButton" delayed={500} /></div>                                           
                                        </div>

                                        <div className='header-button2'>      
                                            <span id="video-text">Video</span>                                     
                                            <button id='minimizevideo'>
                                                <i class="fa fa-window-minimize" aria-hidden="true"></i>
                                            </button>
                                        </div>


                                        <Components.Box ref={(ref: Components.Box) => this.boxPublisher = ref} id={this.props.targetId + "_Publisher1"} streamProps={this.publishProps} className="cBoxP" visible={true} />
                                        <Components.Chat ref={(ref: Components.Chat) => this.chatPublic = ref} title="Message Cohort (Public)" fixedHeight={true} onItemSubmitted={(item: Components.IChatListItem) => this.onChatPublicItemSubmitted(item) } />
                                    </div>
                                </td>
                            </tr>
                        </table>
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