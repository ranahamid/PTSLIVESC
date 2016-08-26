﻿/* tslint:disable:max-line-length */

namespace VC.App {
    "use strict";

    class AC extends XC {
        private status: Components.Status;
        private divStatus: HTMLDivElement;
        private divUI: HTMLDivElement;
        private tabs: VC.Global.Components.Tabs;
        private computersList: Components.ComputersList;

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
            }
        }
        private connectedSignalReceived(event: any): void {
            let tokenData: Global.TokenData = Global.Fce.toTokenData(event.from.data);
            let data: Global.ISignalConnectedData = JSON.parse(event.data) as Global.ISignalConnectedData;

            this.computersList.addComputer({
                uid: tokenData.Uid,
                name: tokenData.Name,
                role: tokenData.Role,
                audio: data.audio,
                video: data.video,
                volume: data.volume
            } as Components.IComputersListItem);
            this.tabs.increaseBadge(tokenData.Role);
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
        private turnOff(uid: string): void {
            let connection: any = this.getConnectionByUid(uid);
            // send signal
            Global.Signaling.sendSignal<Global.ISignalTurnOffData>(this.session, connection,
                Global.SignalTypes.TurnOff, {} as Global.ISignalTurnOffData);
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

        render(): JSX.Element {
            let computers: Array<Components.IComputersListItem> = [];
            let badgeSC: number = 0;
            let badgePC: number = 0;
            let badgeTC: number = 0;
            let badgeFC: number = 0;

            this.connections.forEach((item: any) => {
                let d: Global.TokenData = Global.Fce.toTokenData(item.data);
                computers.push(
                    { uid: d.Uid, name: d.Name, role: d.Role } as Components.IComputersListItem
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
                        <Components.ComputersList ref={(ref: Components.ComputersList) => this.computersList = ref} selectedRole={Roles.SC} computers={computers} turnAv={this.turnAv.bind(this) } turnOff={this.turnOff.bind(this) } changeVolume={this.changeVolume.bind(this) } />
                    </div>
                </div>
            );
        }
    }

    export class InitAC {
        constructor(targetId: string, actionUrl: string) {
            ReactDOM.render(<div><AC targetId={targetId} actionUrl={actionUrl} /></div>, document.getElementById(targetId));
        }
    }
}