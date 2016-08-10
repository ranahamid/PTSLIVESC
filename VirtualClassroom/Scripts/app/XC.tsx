/* tslint:disable:max-line-length */

namespace VC.App {
    "use strict";

    export interface IProps {
        targetId: string;
        actionUrl: string;
        layout?: number;
    }
    export interface IState {
        extensionError: string;
    }

    export enum Roles {
        PC = 1,
        SC = 2,
        TC = 3,
        AC = 4
    }
    export enum ConnectionType {
        XC = 1,
        TC = 2,
        AC = 3
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
        public connections2TC: Array<any> = [];
        public connections2AC: Array<any> = [];
        public alreadyConnected: boolean = false;

        public session: any = null;
        public session2TC: any = null;
        public session2AC: any = null;

        // maxResolution — { width: 1920, height: 1920 }, mirror — false, fitMode — "contain"
        public publishProps = { width: "100%", height: "100%", style: { buttonDisplayMode: "off" } };
        public subscribeProps = { width: "100%", height: "100%", style: { buttonDisplayMode: "on" } };

        public screenSharingExtensionId = "gedopbhbkblbppgdhhinadlfcphccpch";

        constructor(props: IProps, public role: Roles) {
            super(props);
            this.state = { extensionError: "" };
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
                            this.setState({ extensionError: "This browser does not support screen sharing." });
                        } else if (response.extensionInstalled === false && response.extensionRequired) {
                            this.setState({ extensionError: "Please install the screen-sharing extension and load this page over HTTPS." });
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
        /* unused
        private getConnection(id: string): any {
            let c: any = null;
            for (let i = 0; i < this.connections.length && c == null; i++) {
                if (this.connections[i].connectionId == id) {
                    c = this.connections[i];
                }
            }
            return c;
        }
        */
        private isConnectionExists(uid: string): boolean {
            let exists: boolean = false;
            for (let i: number = 0; i < this.connections.length && !exists; i++) {
                if (Global.Fce.toTokenData(this.connections[i].data).Uid === uid) {
                    exists = true;
                }
            }
            return exists;
        }

        // for PC
        public getScConnection(): any {
            let c: any = null;
            for (let i: number = 0; i < this.connections.length && c == null; i++) {
                if (Global.Fce.toTokenData(this.connections[i].data).Role === Roles.SC) {
                    c = this.connections[i];
                }
            }
            return c;
        }
        // for PC, SC, TC
        public getAcConnection(): any {
            let c: any = null;
            for (let i: number = 0; i < this.connections2AC.length && c == null; i++) {
                if (Global.Fce.toTokenData(this.connections2AC[i].data).Role === Roles.AC) {
                    c = this.connections2AC[i];
                }
            }
            return c;
        }
        // for PC
        public getTcConnection(): any {
            let c: any = null;
            for (let i: number = 0; i < this.connections2TC.length && c == null; i++) {
                if (Global.Fce.toTokenData(this.connections2TC[i].data).Role === Roles.TC) {
                    c = this.connections2TC[i];
                }
            }
            return c;
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

        private addConnection2TC(connection: any): void {
            this.connections2TC.push(connection);
        }
        private removeConnection2TC(id: string): boolean {
            let removed: boolean = false;
            let c: Array<any> = [];
            for (let i: number = 0; i < this.connections2TC.length; i++) {
                if (this.connections2TC[i].connectionId !== id) {
                    c.push(this.connections2TC[i]);
                } else {
                    removed = true;
                }
            }
            this.connections2TC = c;
            return removed;
        }

        private addConnection2AC(connection: any): void {
            this.connections2AC.push(connection);
        }
        private removeConnection2AC(id: string): boolean {
            let removed: boolean = false;
            let c: Array<any> = [];
            for (let i: number = 0; i < this.connections2AC.length; i++) {
                if (this.connections2AC[i].connectionId !== id) {
                    c.push(this.connections2AC[i]);
                } else {
                    removed = true;
                }
            }
            this.connections2AC = c;
            return removed;
        }

        private sessionConnect(): void {
            let s: Global.TokBoxSession;

            if (this.role === Roles.PC || this.role === Roles.SC) {
                s = this.dataResponse.ScSession;
            } else if (this.role === Roles.TC) {
                s = this.dataResponse.TcSession;
            } else if (this.role === Roles.AC) {
                s = this.dataResponse.AcSession;
            }

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
                            if (this.role === Roles.PC && this.dataResponse.TcSession != null) {
                                // when PC & when TC is assigned, connect to teacher computer session
                                this.sessionConnect2TC();
                            }
                            if (this.role !== Roles.AC && this.dataResponse.AcSession != null) {
                                // connect to AC session
                                this.sessionConnect2AC();
                            }
                            this.setStatusText("Connected to the session.", Components.StatusStyle.Connected);
                            this.connected(event.connection, ConnectionType.XC);
                        } else if (this.session.connection.connectionId !== event.connection.connectionId
                            && tokenData.Uid !== this.dataResponse.Uid) {
                            // not me and not already connected
                            this.connected(event.connection, ConnectionType.XC);
                        }
                    } else if (this.session.connection.connectionId === event.connection.connectionId) {
                        // its me and already connected - disconnect
                        this.alreadyConnected = true;
                        this.session.disconnect();
                    }
                },
                connectionDestroyed: (event: any): void => {
                    if (this.removeConnection(event.connection.connectionId)) {
                        this.disconnected(event.connection, ConnectionType.XC);
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
                    this.streamCreated(event.stream.connection, event.stream);
                },
                streamDestroyed: (event: any): void => {
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
        private sessionConnect2TC(): void {
            let s: Global.TokBoxSession = this.dataResponse.TcSession;
            this.session2TC = OT.initSession(this.dataResponse.Key, s.SessionId);
            this.session2TC.on({
                signal: (event: any): void => {
                    this.signalReceived(event);
                },
                connectionCreated: (event: any): void => {
                    // add connection
                    this.addConnection2TC(event.connection);
                    if (this.session2TC.connection.connectionId !== event.connection.connectionId) {
                        // if its not me
                        this.connected(event.connection, ConnectionType.TC);
                    }
                },
                connectionDestroyed: (event: any): void => {
                    if (this.removeConnection2TC(event.connection.connectionId)) {
                        if (this.session2TC.connection.connectionId !== event.connection.connectionId) {
                            // if its not me
                            this.disconnected(event.connection, ConnectionType.TC);
                        }
                    }
                },
                streamCreated: (event: any): void => {
                    this.streamCreated(event.stream.connection, event.stream);
                },
                streamDestroyed: (event: any): void => {
                    this.streamDestroyed(event.stream.connection, event.stream);
                }
            });
            this.session2TC.connect(s.Token);
        }
        private sessionConnect2AC(): void {
            let s: Global.TokBoxSession = this.dataResponse.AcSession;
            this.session2AC = OT.initSession(this.dataResponse.Key, s.SessionId);
            this.session2AC.on({
                signal: (event: any): void => {
                    this.signalReceived(event);
                },
                connectionCreated: (event: any): void => {
                    // add connection
                    this.addConnection2AC(event.connection);
                    if (this.session2AC.connection.connectionId !== event.connection.connectionId) {
                        // if its not me
                        this.connected(event.connection, ConnectionType.AC);
                    }
                },
                connectionDestroyed: (event: any): void => {
                    if (this.removeConnection2AC(event.connection.connectionId)) {
                        if (this.session2AC.connection.connectionId !== event.connection.connectionId) {
                            // if its not me
                            this.disconnected(event.connection, ConnectionType.AC);
                        }
                    }
                },
            });
            this.session2AC.connect(s.Token);
        }

        public disconnect(): void {
            if (this.session2AC) {
                this.session2AC.disconnect();
            }
            if (this.session2TC) {
                this.session2TC.disconnect();
            }
            if (this.session) {
                this.session.disconnect();
            }
        }

        abstract setStatusText(text: string, style: Components.StatusStyle): void;

        abstract didMount(): void;
        abstract connected(connectionObj: any, t: ConnectionType): void;
        abstract disconnected(connectionObj: any, t: ConnectionType): void;
        abstract sessionConnected(event: any): void;
        abstract sessionDisconnected(event: any): void;
        abstract streamCreated(connectionObj: any, stream: any): void;
        abstract streamDestroyed(connectionObj: any, stream: any): void;
        abstract streamPropertyChanged(event: any): void;

        abstract signalReceived(event: any): void;
    }
}