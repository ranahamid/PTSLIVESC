/* tslint:disable:max-line-length */

namespace VC.App {
    "use strict";

    export interface IProps {
        targetId: string;
        classroomId: string;
        actionUrl: string;
    }
    export interface IState {
        extensionError: string;
        layout: number;
    }

    export enum Roles {
        PC = 1,
        SC = 2,
        TC = 3,
        FC = 4,
        AC = 5
    }
    export enum PublishSources {
        Camera = 1,
        Screen = 2,
        Application = 3,
        Window = 4
    }
    export abstract class XC extends React.Component<IProps, IState> {
        public dataResponse: Global.IComputerData = null;

        public connections: Array<any> = [];
        public alreadyConnected: boolean = false;

        public session: any = null;

        public streams: Array<any> = [];

        // maxResolution — { width: 1920, height: 1920 }, mirror — false, fitMode — "contain" / "cover"
        public publishProps = { width: "100%", height: "100%", style: { buttonDisplayMode: "off" } };
        public subscribeProps = { width: "100%", height: "100%", style: { buttonDisplayMode: "on" } };

        public screenSharingExtensionId = "gedopbhbkblbppgdhhinadlfcphccpch";

        constructor(props: IProps, public role: Roles) {
            super(props);
            this.state = { extensionError: "", layout: 0 } as IState;
        }

        componentDidMount(): void {
            this.didMount();

            if (OT.checkSystemRequirements() === 1) {
                /*
                if (this.role === Roles.TC) {
                    // check for screensharing support
                    OT.registerScreenSharingExtension("chrome", this.screenSharingExtensionId, 2);
                    OT.checkScreenSharingCapability((response: any) => {
                        if (!response.supported || response.extensionRegistered === false) {
                            this.setStatusText("This browser does not support screen sharing.", Components.StatusStyle.Error);
                        } else if (response.extensionInstalled === false && response.extensionRequired) {
                            this.setStatusText("Please install the screen-sharing extension and load this page over HTTPS.",
                                Components.StatusStyle.Error);
                        } else {
                            this.getData();
                        }
                    });
                } else {
                    this.getData();
                }
                */
                if (this.role === Roles.TC) {
                    // check for screensharing support
                    OT.registerScreenSharingExtension("chrome", this.screenSharingExtensionId, 2);
                    OT.checkScreenSharingCapability((response: any) => {
                        if (!response.supported || response.extensionRegistered === false) {
                            this.setState({ extensionError: "This browser does not support screen sharing." } as IState);
                        } else if (response.extensionInstalled === false && response.extensionRequired) {
                            this.setState({ extensionError: "Please install the screen-sharing extension and load this page over HTTPS." } as IState);
                        }
                        this.getData();
                    });
                } else {
                    this.getData();
                }
            } else {
                // the client does not support WebRTC
                this.setStatusText("WebRTC is not supported.", Components.StatusStyle.Error);
            }
        }

        public getTargetId(): string {
            return this.props.targetId;
        }

        private getData(): void {
            $.ajax({
                cache: false,
                type: "GET",
                url: this.props.actionUrl + "/GetData",
                success: (r: VC.Global.Data.IDataResponse<Global.IComputerData>): void => {
                    if (r.status === VC.Global.Data.RESPONSE_SUCCESS) {
                        this.dataResponse = r.data;
                        this.setStatusText("Connecting the session ...", Components.StatusStyle.Connecting);
                        this.sessionConnect();
                    } else {
                        this.setStatusText(r.message, Components.StatusStyle.Error);
                    }
                },
                error: (xhr: JQueryXHR, status: string, error: string): void => {
                    this.setStatusText("XHR Error: " + xhr.statusText, Components.StatusStyle.Error);
                }
            });
        }

        // connections
        private addConnection(connection: any): void {
            this.connections.push(connection);
        }
        private removeConnection(id: string): boolean {
            let removed: boolean = false;
            let c: Array<any> = [];
            for (let i: number = 0; i < this.connections.length; i++) {
                if (this.connections[i].connectionId !== id) {
                    c.push(this.connections[i]);
                } else {
                    removed = true;
                }
            }
            this.connections = c;
            return removed;
        }

        private isConnectionExists(uid: string): boolean {
            let exists: boolean = false;
            for (let i: number = 0; i < this.connections.length && !exists; i++) {
                if (Global.Fce.toTokenData(this.connections[i].data).Uid === uid) {
                    exists = true;
                }
            }
            return exists;
        }

        public getConnectionByUid(uid: string): any {
            let c: any = null;
            for (let i: number = 0; i < this.connections.length && c == null; i++) {
                if (Global.Fce.toTokenData(this.connections[i].data).Uid === uid) {
                    c = this.connections[i];
                }
            }
            return c;
        }

        public getMyConnection(): any {
            return this.getConnectionByUid(this.dataResponse.Uid);
        }

        public getAcConnection(): any {
            let c: any = null;
            for (let i: number = 0; i < this.connections.length && c == null; i++) {
                if (Global.Fce.toTokenData(this.connections[i].data).Role === Roles.AC) {
                    c = this.connections[i];
                }
            }
            return c;
        }
        public getScConnection(): any {
            let c: any = null;
            for (let i: number = 0; i < this.connections.length && c == null; i++) {
                let tokenData: Global.TokenData = Global.Fce.toTokenData(this.connections[i].data);
                if (tokenData.Role === Roles.SC && this.isInMyGroup(tokenData.Uid)) {
                    c = this.connections[i];
                }
            }
            return c;
        }
        public getFcConnections(): any {
            let c: Array<any> = [];
            for (let i: number = 0; i < this.connections.length; i++) {
                let tokenData: Global.TokenData = Global.Fce.toTokenData(this.connections[i].data);
                if (tokenData.Role === Roles.FC && this.isInMyGroup(tokenData.Uid)) {
                    c.push(this.connections[i]);
                }
            }
            return c;
        }
        public getTcConnection(): any {
            let c: any = null;
            for (let i: number = 0; i < this.connections.length && c == null; i++) {
                let tokenData: Global.TokenData = Global.Fce.toTokenData(this.connections[i].data);
                if (tokenData.Role === Roles.TC && this.isInMyGroup(tokenData.Uid)) {
                    c = this.connections[i];
                }
            }
            return c;
        }

        // streams
        private addStream(stream: any): void {
            this.streams.push(stream);
        }
        private removeStream(stream: any): boolean {
            let removed: boolean = false;
            let s: Array<any> = [];

            for (let i: number = 0; i < this.streams.length; i++) {
                if (this.streams[i].connection.connectionId !== stream.connection.connectionId) {
                    s.push(this.streams[i]);
                } else {
                    removed = true;
                }
            }
            this.streams = s;
            return removed;
        }
        public getStream(userUid: string): any {
            let s: any = null;
            for (let i: number = 0; i < this.streams.length && s == null; i++) {
                let tokenData: Global.TokenData = Global.Fce.toTokenData(this.streams[i].connection.data);
                if (tokenData.Uid === userUid) {
                    s = this.streams[i];
                }
            }
            return s;
        }

        // groups
        public getGroupComputer(uid: string): Global.GroupComputer {
            let iUser: Global.GroupComputer = null;

            for (let i: number = 0; i < this.dataResponse.Group.length && iUser === null; i++) {
                if (this.dataResponse.Group[i].Uid === uid) {
                    iUser = this.dataResponse.Group[i];
                }
            }

            return iUser;
        }
        public isInMyGroup(uid: string): boolean {
            return (this.getGroupComputer(uid) !== null);
        }
        public getConnectionsOfMyGroup(role: VC.App.Roles = null): Array<any> {
            let connections: Array<any> = [];

            for (let i: number = 0; i < this.dataResponse.Group.length; i++) {
                if (role === null || this.dataResponse.Group[i].Role === role) {
                    connections.push(this.getConnectionByUid(this.dataResponse.Group[i].Uid));
                }
            }

            return connections;
        }
        public addGroupComputer(uid: string): boolean {
            let added: boolean = false;
            let connection: any = this.getConnectionByUid(uid);
            if (connection !== null) {
                let tokenData: Global.TokenData = Global.Fce.toTokenData(connection.data);
                // we don't know the position, so it is always 0, but it doesn't matter because we are using it only to assign new FCs
                this.dataResponse.Group.push({ Uid: tokenData.Uid, Id: tokenData.Id, Position: 0, Role: tokenData.Role } as Global.GroupComputer);
                added = true;
            }
            return added;
        }
        public removeGroupComputer(uid: string): boolean {
            let removed: boolean = false;
            let group: Array<Global.GroupComputer> = [];
            this.dataResponse.Group.forEach((g: Global.GroupComputer) => {
                if (g.Uid !== uid) {
                    group.push(g);
                } else {
                    removed = true;
                }
            });
            this.dataResponse.Group = group;
            return removed;
        }
        public compareGroupComputers(c1: Global.GroupComputer, c2: Global.GroupComputer): boolean {
            let isEqual: boolean = false;

            if (c1 === null && c2 === null) {
                isEqual = true;
            } else if (c1 !== null && c2 !== null) {
                isEqual = (c1.Uid === c2.Uid);
            }

            return isEqual;
        }


        private sessionConnect(): void {
            let s: Global.TokBoxSession = this.dataResponse.Session;

            this.session = OT.initSession(this.dataResponse.Key, s.SessionId);
            this.session.on({
                signal: (event: any): void => {
                    this.signalReceived(event);
                },
                connectionCreated: (event: any): void => {
                    let tokenData: Global.TokenData = Global.Fce.toTokenData(event.connection.data);
                    if (!this.isConnectionExists(tokenData.Uid)) {
                        // add connection
                        this.addConnection(event.connection);
                        if (this.session.connection.connectionId === event.connection.connectionId) {
                            // its me, successfully connected
                            this.setStatusText("Connected to the session.", Components.StatusStyle.Connected);
                            this.connected(event.connection);
                        } else if (this.session.connection.connectionId !== event.connection.connectionId
                            && tokenData.Uid !== this.dataResponse.Uid) {
                            // not me and not already connected
                            this.connected(event.connection);
                        }
                    } else if (this.session.connection.connectionId === event.connection.connectionId) {
                        // its me and already connected - disconnect
                        this.alreadyConnected = true;
                        this.session.disconnect();
                    }
                },
                connectionDestroyed: (event: any): void => {
                    if (this.removeConnection(event.connection.connectionId)) {
                        this.disconnected(event.connection);
                    }
                },
                sessionCreated: (event: any): void => {
                    // session created
                },
                sessionDisconnected: (event: any): void => {
                    if (this.alreadyConnected) {
                        this.setStatusText("Already connected.", Components.StatusStyle.Error);
                    } else if (event.reason === "networkDisconnected") {
                        this.setStatusText("Your network connection terminated.", Components.StatusStyle.Error);
                    } else {
                        this.setStatusText("Disconnected from the session.", Components.StatusStyle.Error);
                    }
                    this.sessionDisconnected(event);
                },
                streamCreated: (event: any): void => {
                    this.addStream(event.stream);
                    this.streamCreated(event.stream.connection, event.stream);
                },
                streamDestroyed: (event: any): void => {
                    this.removeStream(event.stream);
                    this.streamDestroyed(event.stream.connection, event.stream);
                },
                streamPropertyChanged: (event: any): void => {
                    // video / audio changed
                }
            });
            this.session.connect(s.Token, (err: any): void => {
                if (err) {
                    this.setStatusText("Error connecting: " + err.message, Components.StatusStyle.Error);
                } else {
                    // connected, better to use connectionCreated event
                }
            });
        }

        public disconnect(): void {
            if (this.session) {
                this.session.disconnect();
            }
        }

        abstract setStatusText(text: string, style: Components.StatusStyle): void;

        abstract didMount(): void;
        abstract connected(connectionObj: any): void;
        abstract disconnected(connectionObj: any): void;
        abstract sessionConnected(event: any): void;
        abstract sessionDisconnected(event: any): void;
        abstract streamCreated(connectionObj: any, stream: any): void;
        abstract streamDestroyed(connectionObj: any, stream: any): void;
        abstract streamPropertyChanged(event: any): void;

        abstract signalReceived(event: any): void;
    }
}