/* tslint:disable:max-line-length */

namespace VC.App.AC {
    "use strict";

    export interface IComputersListItem {
        uid: string;
        name: string;
        role: Roles;
        audio?: boolean;
        video?: boolean;
        volume: Array<number>;
    }

    interface IComputersListProps {
        selectedRole: Roles;
        computers: Array<IComputersListItem>;
        turnAv: (uid: string, audio?: boolean, video?: boolean) => void;
        turnOff: (uid: string) => void;
        changeVolume: (uid: string, volume: Array<number>) => void;
        featuredComputerClick: (uid: string, name: string) => void;
    }
    interface IComputersListState {
        selectedRole: Roles;
        computers: Array<IComputersListItem>;
    }

    export class ComputersList extends React.Component<IComputersListProps, IComputersListState> {
        constructor(props: IComputersListProps) {
            super(props);
            this.state = { selectedRole: props.selectedRole, computers: props.computers };
        }

        public changeRole(role: Roles): void {
            this.setState({ selectedRole: role, computers: this.state.computers });
        }

        public addComputer(item: IComputersListItem): void {
            let c: Array<IComputersListItem> = this.state.computers;
            c.push(item);
            if (item.role === this.state.selectedRole) {
                // update state and render
                this.setState({ selectedRole: this.state.selectedRole, computers: c } as IComputersListState);
            } else {
                // just update state
                this.state.computers = c;
            }
        }
        public removeComputer(uid: string): boolean {
            let removed: boolean = false;
            let role: Roles = null;
            let c: Array<IComputersListItem> = [];
            this.state.computers.forEach((item: IComputersListItem) => {
                if (item.uid !== uid) {
                    c.push(item);
                } else {
                    role = item.role;
                    removed = true;
                }
            });
            if (role === this.state.selectedRole) {
                // update state and render
                this.setState({ selectedRole: this.state.selectedRole, computers: c } as IComputersListState);
            } else {
                // just update state
                this.state.computers = c;
            }
            return removed;
        }

        public updateComputerVolume(uid: string, volume: Array<number>): void {
            this.state.computers.forEach((item: IComputersListItem) => {
                if (item.uid === uid) {
                    // update existing volume bars to default volume
                    for (let i: number = 0; i < item.volume.length; i++) {
                        (this.refs["RefVolumeBar_" + item.uid + "_" + i] as Components.Volume).resetVolume(80); // default volume
                    }
                    // set new volume
                    item.volume = volume;
                }
            });
            this.setState(this.state);
        }

        public updateComputerAvState(uid: string, audio?: boolean, video?: boolean): void {
            let c: Array<IComputersListItem> = [];
            this.state.computers.forEach((item: IComputersListItem) => {
                if (item.uid === uid) {
                    if (audio != null) {
                        item.audio = audio;
                    }
                    if (video != null) {
                        item.video = video;
                    }
                }
                c.push(item);
            });
            // just update state
            this.state.computers = c;
        }

        public updateComputerVolumeState(uid: string, volume: Array<number>): void {
            let c: Array<IComputersListItem> = [];
            this.state.computers.forEach((item: IComputersListItem) => {
                if (item.uid === uid) {
                    for (let i: number = 0; i < volume.length; i++) {
                        if (volume[i] !== null) {
                            item.volume[i] = volume[i];
                        }
                    }
                }
                c.push(item);
            });
            // just update state
            this.state.computers = c;
        }

        private getButtonStatus(on?: boolean): Components.SwitchButtonStatus {
            let switchButtonStatus: Components.SwitchButtonStatus = Components.SwitchButtonStatus.Hidden;
            if (on != null) {
                if (on) {
                    switchButtonStatus = Components.SwitchButtonStatus.Stop;
                } else {
                    switchButtonStatus = Components.SwitchButtonStatus.Start;
                }
            }
            return switchButtonStatus;
        }

        private changeVolume(uid: string, volume: Array<number>, index: number, vol: number): void {
            volume[index] = vol;
            this.props.changeVolume(uid, volume);
        }

        renderNotFound(): JSX.Element {
            let notFoundText: string = "No @0 computer connected.";
            switch (this.state.selectedRole) {
                case Roles.PC: notFoundText = notFoundText.replace("@0", "Student"); break;
                case Roles.SC: notFoundText = notFoundText.replace("@0", "Seat"); break;
                case Roles.TC: notFoundText = notFoundText.replace("@0", "Teacher"); break;
                case Roles.FC: notFoundText = notFoundText.replace("@0", "Featured"); break;
            }
            return (
                <table className="table" align="center">
                    <tbody>
                        <tr><td><div className="text-muted">{notFoundText}</div></td></tr>
                    </tbody>
                </table>
            );
        }

        private computerTitle(index:number): string {
            let name: string = "";
            if (this.state.selectedRole === Roles.PC) {
                if (index === 0) {
                    name = "Seat";
                } else if (index === 1) {
                    name = "Teacher";
                }
            } else if (this.state.selectedRole === Roles.SC || this.state.selectedRole === Roles.FC) {

                name = "Student #" + (index + 1);
            }
            return name;
        }
        renderComputer(item: IComputersListItem): JSX.Element {
            return (
                <tr key={"tr_" + item.uid}>
                    <td><div><span className="glyphicon glyphicon-link" style={{ color: "green" }}></span> {item.name}</div></td>
                    <td>
                        {
                            item.volume.map((v: number, index: number) => {
                                return (
                                    <Components.Volume ref={"RefVolumeBar_" + item.uid + "_" + index} title={this.computerTitle(index) } volume={v != null ? v : 0} display={v != null} onVolumeChanged={(vol: number) => this.changeVolume(item.uid, item.volume, index, vol) } />);
                            })
                        }
                    </td>
                    <td style={{ textAlign: "right" }}>
                        <div className="cListButton"><button type="button" className="btn btn-xs btn-warning" onClick={() => this.props.turnOff(item.uid) }><span className="glyphicon glyphicon-off"></span></button></div>
                        <div className="cListButton" style={{ display: "none" }}><button type="button" className="btn btn-xs btn-default" disabled="true"><span className="glyphicon glyphicon-record"></span></button></div>
                        <div className="cListButton" style={{ display: (this.state.selectedRole === Roles.FC ? "none" : "block") }}><Components.SwitchButton textOn="" textOff="" classOn="btn btn-xs btn-danger" classOff="btn btn-xs btn-success" iconOn="glyphicon glyphicon-facetime-video" iconOff="glyphicon glyphicon-facetime-video" status={this.getButtonStatus(item.video) } onOn={() => this.props.turnAv(item.uid, null, true) } onOff={() => this.props.turnAv(item.uid, null, false) } className="" /></div>
                        <div className="cListButton" style={{ display: (this.state.selectedRole === Roles.FC ? "none" : "block") }}><Components.SwitchButton textOn="" textOff="" classOn="btn btn-xs btn-danger" classOff="btn btn-xs btn-success" iconOn="glyphicon glyphicon-music" iconOff="glyphicon glyphicon-music" status={this.getButtonStatus(item.audio) } onOn={() => this.props.turnAv(item.uid, true, null) } onOff={() => this.props.turnAv(item.uid, false, null) } className="" /></div>
                        <div className="cListButton" style={{ display: (this.state.selectedRole === Roles.FC ? "block" : "none") }}><button type="button" className="btn btn-xs btn-info" onClick={() => this.props.featuredComputerClick(item.uid, item.name) }><span className="glyphicon glyphicon-th"></span></button></div>
                    </td>
                </tr>
            );
        }
        renderComputers(): JSX.Element {
            let items: Array<JSX.Element> = [];
            this.state.computers.forEach((item: IComputersListItem) => {
                if (item.role === this.state.selectedRole) {
                    items.push(this.renderComputer(item));
                }
            });
            if (items.length > 0) {
                if (this.state.selectedRole === Roles.PC) {
                    return (
                        <table className="table" align="center">
                            <thead>
                                <tr>
                                    <th style={{ width: "50%" }}>Student computer</th>
                                    <th>Volume</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {items}
                            </tbody>
                        </table>
                    );
                } else if (this.state.selectedRole === Roles.SC) {
                    return (
                        <table className="table" align="center">
                            <thead>
                                <tr>
                                    <th style={{ width: "50%" }}>Seat computer</th>
                                    <th>Volume</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {items}
                            </tbody>
                        </table>
                    );
                } else if (this.state.selectedRole === Roles.FC) {
                    return (
                        <table className="table" align="center">
                            <thead>
                                <tr>
                                    <th style={{ width: "50%" }}>Featured computer</th>
                                    <th>Volume</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {items}
                            </tbody>
                        </table>
                    );
                } else {
                    return (
                        <table className="table" align="center">
                            <thead>
                                <tr>
                                    <th style={{ width: "50%" }}>Teacher computer</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {items}
                            </tbody>
                        </table>
                    );
                }
            } else {
                return this.renderNotFound();
            }
        }

        render(): JSX.Element {
            return (
                <div>
                    {this.renderComputers() }
                </div>
            );
        }
    }
}