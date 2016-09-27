/* tslint:disable:max-line-length */

namespace VC.App {
    "use strict";

    class AC extends XC {
        private status: Components.Status;
        private divStatus: HTMLDivElement;
        private divUI: HTMLDivElement;
        private tabs: VC.Global.Components.Tabs;
        private computersList: VC.App.AC.ComputersList;
        private featuredBox: VC.App.AC.FeaturedBox;

        constructor(props: IProps) {
            super(props, Roles.AC);
        }

        didMount(): void {
            // nothing to do
        }

        // abstract methods
        setStatusText(text: string, style: Components.StatusStyle): void {
            this.setStatusVisibility(true);
            this.status.setText(text, style);
        }

        connected(connection: any): void {
            let tokenData: Global.TokenData = Global.Fce.toTokenData(connection.data);
            if (this.dataResponse.Uid === tokenData.Uid) {
                // me
                this.setStatusVisibility(false);
                this.setUiVisibility(true);
            }
        }
        disconnected(connection: any): void {
            let tokenData: Global.TokenData = Global.Fce.toTokenData(connection.data);
            if (this.dataResponse.Uid === tokenData.Uid) {
                // me
                this.setUiVisibility(false);
                this.setStatusText("Disconnected from the session.", Components.StatusStyle.Error);
            } else {
                if (this.computersList.removeComputer(tokenData.Uid)) {
                    this.tabs.decreaseBadge(tokenData.Role);
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
            // nothing to do
        }
        streamDestroyed(connection: any, stream: any): void {
            // nothing to do
        }
        streamPropertyChanged(event: any): void {
            // nothing to do
        }

        signalReceived(event: any): void {
            let signalType: Global.SignalTypes = Global.Signaling.getSignalType(event.type);
            switch (signalType) {
                case Global.SignalTypes.Connected:
                    this.connectedSignalReceived(event);
                    break;
                case Global.SignalTypes.RaiseHand:
                    this.raiseHandSignalReceived(event);
                    break;
                case Global.SignalTypes.TurnAv:
                    this.turnAvSignalReceived(event);
                    break;
            }
        }
        private connectedSignalReceived(event: any): void {
            let tokenData: Global.TokenData = Global.Fce.toTokenData(event.from.data);
            let data: Global.ISignalConnectedData = JSON.parse(event.data) as Global.ISignalConnectedData;

            this.computersList.addComputer({
                uid: tokenData.Uid,
                id: tokenData.Id,
                name: tokenData.Name,
                role: tokenData.Role,
                audio: data.audio,
                video: data.video,
                volume: data.volume,
                handRaised: data.handRaised
            } as VC.App.AC.IComputersListItem);
            this.tabs.increaseBadge(tokenData.Role);
        }
        private raiseHandSignalReceived(event: any): void {
            let tokenData: Global.TokenData = Global.Fce.toTokenData(event.from.data);
            let data: Global.ISignalRaiseHandData = JSON.parse(event.data) as Global.ISignalRaiseHandData;
            this.computersList.updateComputerRaiseHandState(tokenData.Uid, data.raised);
        }
        private turnAvSignalReceived(event: any): void {
            let tokenData: Global.TokenData = Global.Fce.toTokenData(event.from.data);
            let data: Global.ISignalTurnAvData = JSON.parse(event.data) as Global.ISignalTurnAvData;
            this.computersList.updateComputerAvState(tokenData.Uid, data.audio, data.video);
        }

        private setStatusVisibility(visible: boolean): void {
            this.divStatus.style.display = visible ? "block" : "none";
        }
        private setUiVisibility(visible: boolean): void {
            this.divUI.style.display = visible ? "block" : "none";
        }

        private tabOnClick(id: number): void {
            this.tabs.selectItem(id);
            this.computersList.changeRole(id);
        };

        private turnAv(uid: string, audio?: boolean, video?: boolean): void {
            let connection: any = this.getConnectionByUid(uid);
            let role: Roles = Global.Fce.toTokenData(connection.data).Role;

            $.ajax({
                cache: false,
                type: "POST",
                url: this.props.actionUrl + "/TurnAv" + Global.Fce.roleAsString(role),
                data: JSON.stringify({ uid: uid, audio: audio, video: video }),
                contentType: "application/json",
                success: (r: any): void => {
                    // send signal
                    Global.Signaling.sendSignal<Global.ISignalTurnAvData>(this.session, connection, Global.SignalTypes.TurnAv, { audio: audio, video: video } as Global.ISignalTurnAvData);
                    this.computersList.updateComputerAvState(uid, audio, video);
                },
                error: (xhr: JQueryXHR, status: string, error: string): void => {
                    // error
                    alert("ERROR: " + error);
                }
            });
        }
        private turnAvAll(role: Roles, audio?: boolean, video?: boolean): void {
            $.ajax({
                cache: false,
                type: "POST",
                url: this.props.actionUrl + "/TurnAvAll" + Global.Fce.roleAsString(role),
                data: JSON.stringify({ audio: audio, video: video }),
                contentType: "application/json",
                success: (r: any): void => {
                    // send signal
                    Global.Signaling.sendSignalAll<Global.ISignalTurnAvData>(this.session, Global.SignalTypes.TurnAv, { role: role, audio: audio, video: video } as Global.ISignalTurnAvData);
                    this.computersList.updateComputerAvAllState(audio, video);
                },
                error: (xhr: JQueryXHR, status: string, error: string): void => {
                    // error
                    alert("ERROR: " + error);
                }
            });
        }
        private turnOff(uid: string): void {
            let connection: any = this.getConnectionByUid(uid);
            // send signal
            Global.Signaling.sendSignal<Global.ISignalTurnOffData>(this.session, connection, Global.SignalTypes.TurnOff, {} as Global.ISignalTurnOffData);
        }
        private turnOffAll(role: Roles): void {
            // send signal
            Global.Signaling.sendSignalAll<Global.ISignalTurnOffData>(this.session, Global.SignalTypes.TurnOff, { role: role } as Global.ISignalTurnOffData);
        }
        private changeVolume(uid: string, volume: Array<number>): void {
            let connection: any = this.getConnectionByUid(uid);
            let role: Roles = Global.Fce.toTokenData(connection.data).Role;

            $.ajax({
                cache: false,
                type: "POST",
                url: this.props.actionUrl + "/Volume" + Global.Fce.roleAsString(role),
                data: JSON.stringify({ uid: uid, volume: volume }),
                contentType: "application/json",
                success: (r: any): void => {
                    // send signal
                    Global.Signaling.sendSignal<Global.ISignalVolumeData>(this.session, connection, Global.SignalTypes.Volume, { volume: volume } as Global.ISignalVolumeData);
                    this.computersList.updateComputerVolumeState(uid, volume);
                },
                error: (xhr: JQueryXHR, status: string, error: string): void => {
                    // error
                    alert("ERROR: " + error);
                }
            });
        }
        private featuredComputerClick(uid: string, name: string): void {
            this.featuredBox.open(uid, name);
        }
        private onFeaturedUpdated(uid: string, layout: number, students: Array<VC.App.AC.IStudentItem>): void {
            // update volume bars of students in the list
            let volume: Array<number> = [];
            for (let i: number = 0; i < layout; i++) {
                volume.push(80); // default volume
            }
            this.computersList.updateComputerVolume(uid, volume);

            // send signal to FC to update group & layout
            let connection: any = this.getConnectionByUid(uid);
            Global.Signaling.sendSignal<Global.ISignalFeaturedChangedData>(this.session, connection, Global.SignalTypes.FeaturedChanged, { } as Global.ISignalFeaturedChangedData);
        }

        render(): JSX.Element {
            let computers: Array<VC.App.AC.IComputersListItem> = [];
            let badgeSC: number = 0;
            let badgePC: number = 0;
            let badgeTC: number = 0;
            let badgeFC: number = 0;

            this.connections.forEach((item: any) => {
                let d: Global.TokenData = Global.Fce.toTokenData(item.data);
                computers.push(
                    { uid: d.Uid, name: d.Name, role: d.Role } as VC.App.AC.IComputersListItem
                );
                switch (d.Role) {
                    case Roles.PC: badgePC++; break;
                    case Roles.SC: badgeSC++; break;
                    case Roles.TC: badgeTC++; break;
                    case Roles.FC: badgeFC++; break;
                }
            });

            let tabItems: Array<VC.Global.Components.ITabItemProps> = [
                { id: Roles.SC, title: "Seat computers", onClick: this.tabOnClick.bind(this), badge: badgeSC, active: true },
                { id: Roles.PC, title: "Student computers", onClick: this.tabOnClick.bind(this), badge: badgePC, active: false },
                { id: Roles.TC, title: "Teacher computers", onClick: this.tabOnClick.bind(this), badge: badgeTC, active: false },
                { id: Roles.FC, title: "Featured computers", onClick: this.tabOnClick.bind(this), badge: badgeFC, active: false }
            ];

            let statusClasses: Array<string> = [
                "alert alert-warning",  // connecting
                "alert alert-success",  // connected
                "alert alert-danger"    // error
            ];

            return (
                <div className="acContainer">
                    <div ref={(ref: HTMLDivElement) => this.divStatus = ref}>
                        <Components.Status ref={(ref: Components.Status) => this.status = ref} text="Connecting ..." style={Components.StatusStyle.Connecting} className="cStatus" statusClasses={statusClasses} />
                    </div>
                    <div ref={(ref: HTMLDivElement) => this.divUI = ref} style={{ display: "none" }}>
                        <div className="labelContainer"><h3>Connected computers: </h3></div>
                        <VC.Global.Components.Tabs ref={(ref: VC.Global.Components.Tabs) => this.tabs = ref} items={tabItems} className="cTabs" />
                        <VC.App.AC.ComputersList ref={(ref: VC.App.AC.ComputersList) => this.computersList = ref} selectedRole={Roles.SC} computers={computers}
                            turnAv={(uid: string, audio?: boolean, video?: boolean) => this.turnAv(uid, audio, video) }
                            turnAvAll={(role: Roles, audio?: boolean, video?: boolean) => this.turnAvAll(role, audio, video) }
                            turnOff={(uid: string) => this.turnOff(uid) }
                            turnOffAll={(role: Roles) => this.turnOffAll(role) }
                            changeVolume={(uid: string, volume: Array<number>) => this.changeVolume(uid, volume) }
                            featuredComputerClick={(uid: string, name: string) => this.featuredComputerClick(uid, name) } />
                        <VC.App.AC.FeaturedBox ref={(ref: VC.App.AC.FeaturedBox) => this.featuredBox = ref} classroomId={this.props.classroomId} onFeaturedUpdated={(uid: string, layout: number, students: Array<VC.App.AC.IStudentItem>) => this.onFeaturedUpdated(uid, layout, students) } />
                    </div>
                </div>
            );
        }
    }

    export class InitAC {
        constructor(targetId: string, classroomId: string, actionUrl: string) {
            ReactDOM.render(<div><AC targetId={targetId} classroomId={classroomId} actionUrl={actionUrl} /></div>, document.getElementById(targetId));
        }
    }
}