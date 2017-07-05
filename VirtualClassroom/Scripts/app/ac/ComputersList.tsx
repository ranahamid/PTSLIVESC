/* tslint:disable:max-line-length */

namespace VC.App.AC {
    "use strict";

    export interface IComputersListItem {
        uid: string;
        id: string;
        name: string;
        role: Roles;
        audio?: boolean;
        video?: boolean;
        volume?: number;
        handRaised: boolean;
    }

    interface IComputersListProps {
        selectedRole: Roles;
        computers: Array<IComputersListItem>;
        turnAv: (uid: string, audio?: boolean, video?: boolean) => void;
        turnAvAll: (role: Roles, audio?: boolean, video?: boolean) => void;
        turnOff: (uid: string) => void;
        turnOffAll: (role: Roles) => void;
        raiseHandAll: (up: boolean) => void;
        raisedHandSingle: (uid: string, up: boolean) => void;

        changeVolume: (uid: string, volume: number) => void;
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
            // sort alphabeticaly
            c = c.sort(function (a: IComputersListItem, b: IComputersListItem) { return (a.name > b.name) ? 1 : -1; });

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

        public updateComputerAvState(uid: string, audio?: boolean, video?: boolean): void {
            let c: Array<IComputersListItem> = [];
            this.state.computers.forEach((item: IComputersListItem) => {
                if (item.uid === uid) {
                    if (audio !== null) {
                        item.audio = audio;
                    }
                    if (video !== null) {
                        item.video = video;
                    }
                }
                c.push(item);
            });

            // refresh
            this.setState({ computers: [] } as IComputersListState, () => {
                this.setState({ computers: c } as IComputersListState);
            });
        }
        public updateComputerAvAllState(role: Roles, audio?: boolean, video?: boolean) {
            let c: Array<IComputersListItem> = this.state.computers;
            c.forEach((item: IComputersListItem) => {
                if (item.role === role) {
                    if (audio !== null) {
                        item.audio = audio;
                    }
                    if (video !== null) {
                        item.video = video;
                    }
                }
            });
            // refresh
            this.setState({ computers: [] } as IComputersListState, () => {
                this.setState({ computers: c } as IComputersListState);
            });
        }

        public updateComputerVolumeState(uid: string, volume: number): void {
            let c: Array<IComputersListItem> = [];
            this.state.computers.forEach((item: IComputersListItem) => {
                if (item.uid === uid) {
                    item.volume = volume;
                }
                c.push(item);
            });
            // just update state
            this.state.computers = c;
        }

        public updateComputerRaiseHandState(uid: string, handRaised: boolean): void {
            this.state.computers.forEach((item: IComputersListItem) => {
                if (item.uid === uid) {
                    // set raise hand
                    item.handRaised = handRaised;
                }
            });
            this.setState(this.state);
        }
        public updateAllPcRaiseHandState(handRaised: boolean): void {
            this.state.computers.forEach((item: IComputersListItem) => {
                if (item.role === Roles.PC) {
                    // set raise hand
                    item.handRaised = handRaised;
                }
            });
            this.setState(this.state);
        }

        public hasRaisedHand(id: string): boolean {
            let handRaised: boolean = false;
            this.state.computers.forEach((item: IComputersListItem) => {
                if (item.role === Roles.PC && item.id === id) {
                    if (item.handRaised !== undefined && item.handRaised) {
                        handRaised = true;
                    }
                }
            });
            return handRaised;
        }

        private getButtonStatus(on?: boolean): Components.SwitchButtonStatus {
            let switchButtonStatus: Components.SwitchButtonStatus = Components.SwitchButtonStatus.Hidden;
            if (on !== null) {
                if (on) {
                    switchButtonStatus = Components.SwitchButtonStatus.Stop;
                } else {
                    switchButtonStatus = Components.SwitchButtonStatus.Start;
                }
            }
            return switchButtonStatus;
        }

        renderNotFound(): JSX.Element {
            let notFoundText: string = "No @0 computer connected.";
            switch (this.state.selectedRole) {
                case Roles.PC: notFoundText = notFoundText.replace("@0", "Student"); break;
                case Roles.SC: notFoundText = notFoundText.replace("@0", "Seat"); break;
                case Roles.TC: notFoundText = notFoundText.replace("@0", "Teacher"); break;
                case Roles.FC: notFoundText = notFoundText.replace("@0", "Featured"); break;
                case Roles.Moderator: notFoundText = notFoundText.replace("@0", "Moderator"); break;
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
                    <td  style={{ width: "30%" }}>
                        <div>
                            <span className="glyphicon glyphicon-link" style={{ color: "green" }}></span>&nbsp;
                            <span className={(item.handRaised ? "glyphicon glyphicon-hand-up" : "glyphicon glyphicon-hand-down")} style={{ color: (item.handRaised ? "red" : "gray"), display: (this.state.selectedRole === Roles.PC ? "inline-block" : "none") }}></span>&nbsp;
                            {item.name}
                        </div>
                    </td>


                    <td style={{ width: "15%", display: (this.state.selectedRole === Roles.PC || this.state.selectedRole === Roles.Moderator || this.state.selectedRole === Roles.ModeratorWarning || this.state.selectedRole === Roles.TC ? "block" : "none") }}>
                        <Components.Volume ref={"RefVolumeBar_" + item.uid} volume={item.video !== undefined ? item.volume : 0} display={item.video !== undefined} onVolumeChanged={(vol: number) => this.props.changeVolume(item.uid, vol) } />
                    </td>

                    <td style={{ width: "15%", display: (this.state.selectedRole === Roles.PC ? "block" : "none") }}>
                        <button type="button" style={{ color: (item.handRaised ? "red" : "gray") }} className={(item.handRaised ? "glyphicon glyphicon-hand-down" : "glyphicon glyphicon-hand-up") } onClick={() => { this.props.raisedHandSingle(item.uid, item.handRaised); } }>
                            <span style={{ display: (item.handRaised ? "block" : "none") }}>Hands Down</span>
                            <span style={{ display: (!item.handRaised ? "block" : "none") }}>Hands Up</span>
                        </button>                   
                    </td>
                 

                    <td style={{ width: "40%", textAlign: "right" }}>
                        <div className="cListButton"><button type="button" className="btn btn-xs btn-warning" onClick={() => this.props.turnOff(item.uid) }><span className="glyphicon glyphicon-off"></span></button></div>
                        <div className="cListButton" style={{ display: "none" }}><button type="button" className="btn btn-xs btn-default" disabled="true"><span className="glyphicon glyphicon-record"></span></button></div>
                        <div className="cListButton" style={{ display: (this.state.selectedRole === Roles.FC || this.state.selectedRole === Roles.SC ? "none" : "block") }}><Components.SwitchButton textOn="" textOff="" classOn="btn btn-xs btn-danger" classOff="btn btn-xs btn-success" iconOn="glyphicon glyphicon-facetime-video" iconOff="glyphicon glyphicon-facetime-video" status={this.getButtonStatus(item.video) } onOn={() => this.props.turnAv(item.uid, null, true) } onOff={() => this.props.turnAv(item.uid, null, false) } className="" /></div>
                        <div className="cListButton" style={{ display: (this.state.selectedRole === Roles.FC || this.state.selectedRole === Roles.SC ? "none" : "block") }}><Components.SwitchButton textOn="" textOff="" classOn="btn btn-xs btn-danger" classOff="btn btn-xs btn-success" iconOn="glyphicon glyphicon-music" iconOff="glyphicon glyphicon-music" status={this.getButtonStatus(item.audio) } onOn={() => this.props.turnAv(item.uid, true, null) } onOff={() => this.props.turnAv(item.uid, false, null) } className="" /></div>
                        <div className="cListButton" style={{ display: (this.state.selectedRole === Roles.FC ? "block" : "none") }}><button type="button" className="btn btn-xs btn-info" onClick={() => this.props.featuredComputerClick(item.uid, item.name) }><span className="glyphicon glyphicon-th"></span></button></div>
                    </td>
                </tr>
            );
        }
        renderComputerAllButtons(role: Roles): JSX.Element {
            let audioOn: boolean = false;
            for (let i: number = 0; i < this.state.computers.length; i++) {
                if (this.state.computers[i].role === role && this.state.computers[i].audio) {
                    audioOn = true;
                    i = this.state.computers.length;
                }
            }

            let videoOn: boolean = false;
            for (let i: number = 0; i < this.state.computers.length; i++) {
                if (this.state.computers[i].role === role && this.state.computers[i].video) {
                    videoOn = true;
                    i = this.state.computers.length;
                }
            }

            return (
                <div>
                    <div className="cListButton" style={{ display: (this.state.computers.length === 0 ? "none" : "block") }}><button type="button" className="btn btn-xs btn-warning" onClick={() => this.props.turnOffAll(role) }><span className="glyphicon glyphicon-off"></span> ALL</button></div>
                    <div key={"ButtonVideoAll_" + role} className="cListButton" style={{ display: (this.state.computers.length === 0 || role === Roles.FC || role === Roles.SC ? "none" : "block") }}>
                        <div style={{ display: "none" }}><Components.SwitchButton textOn="ALL" textOff="ALL" classOn="btn btn-xs btn-danger" classOff="btn btn-xs btn-success" iconOn="glyphicon glyphicon-facetime-video" iconOff="glyphicon glyphicon-facetime-video" status={(videoOn ? Components.SwitchButtonStatus.Stop : Components.SwitchButtonStatus.Start) } onOn={() => this.props.turnAvAll(role, null, true) } onOff={() => this.props.turnAvAll(role, null, false) } className="" /></div>
                    </div>
                    <div key={"ButtonAudioAll_" + role} className="cListButton" style={{ display: (this.state.computers.length === 0 || role === Roles.FC || role === Roles.SC ? "none" : "block") }}>
                        <div style={{ display: "none" }}><Components.SwitchButton textOn="ALL" textOff="ALL" classOn="btn btn-xs btn-danger" classOff="btn btn-xs btn-success" iconOn="glyphicon glyphicon-music" iconOff="glyphicon glyphicon-music" status={(audioOn ? Components.SwitchButtonStatus.Stop : Components.SwitchButtonStatus.Start) } onOn={() => this.props.turnAvAll(role, true, null) } onOff={() => this.props.turnAvAll(role, false, null) } className="" /></div>
                        <button type="button" className="btn btn-xs btn-danger" onClick={() => { this.props.turnAvAll(role, false, null) } }><span className="glyphicon glyphicon-music"></span> Mute ALL</button>
                    </div>

                    <div key={"ButtonHandsAll_" + role} className="cListButton" style={{ display: (this.state.computers.length === 0 || role !== Roles.PC ? "none" : "block") }}>
                        <button type="button" className="btn btn-xs btn-danger" onClick={() => { this.props.raiseHandAll(false); } }><span className="glyphicon glyphicon-hand-down"></span> ALL Hands Down</button>
                    </div>

                </div>
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
                                    <th>{this.renderComputerAllButtons(this.state.selectedRole) }</th>
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
                                    <th>{this.renderComputerAllButtons(this.state.selectedRole) }</th>
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
                                    <th>{this.renderComputerAllButtons(this.state.selectedRole) }</th>
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
                                    <th>Volume</th>
                                    <th>{this.renderComputerAllButtons(this.state.selectedRole) }</th>
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