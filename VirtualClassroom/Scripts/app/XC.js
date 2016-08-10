/* tslint:disable:max-line-length */
var VC;
(function (VC) {
    var App;
    (function (App) {
        "use strict";
        (function (Roles) {
            Roles[Roles["PC"] = 1] = "PC";
            Roles[Roles["SC"] = 2] = "SC";
            Roles[Roles["TC"] = 3] = "TC";
            Roles[Roles["AC"] = 4] = "AC";
        })(App.Roles || (App.Roles = {}));
        var Roles = App.Roles;
        (function (ConnectionType) {
            ConnectionType[ConnectionType["XC"] = 1] = "XC";
            ConnectionType[ConnectionType["TC"] = 2] = "TC";
            ConnectionType[ConnectionType["AC"] = 3] = "AC";
        })(App.ConnectionType || (App.ConnectionType = {}));
        var ConnectionType = App.ConnectionType;
        (function (PublishSources) {
            PublishSources[PublishSources["Camera"] = 1] = "Camera";
            PublishSources[PublishSources["Screen"] = 2] = "Screen";
            PublishSources[PublishSources["Application"] = 3] = "Application";
            PublishSources[PublishSources["Window"] = 4] = "Window";
        })(App.PublishSources || (App.PublishSources = {}));
        var PublishSources = App.PublishSources;
        class XC extends React.Component {
            constructor(props, role) {
                super(props);
                this.role = role;
                this.dataResponse = null;
                this.connections = [];
                this.connections2TC = [];
                this.connections2AC = [];
                this.alreadyConnected = false;
                this.session = null;
                this.session2TC = null;
                this.session2AC = null;
                // maxResolution — { width: 1920, height: 1920 }, mirror — false, fitMode — "contain"
                this.publishProps = { width: "100%", height: "100%", style: { buttonDisplayMode: "off" } };
                this.subscribeProps = { width: "100%", height: "100%", style: { buttonDisplayMode: "on" } };
                this.screenSharingExtensionId = "gedopbhbkblbppgdhhinadlfcphccpch";
                this.state = { extensionError: "" };
            }
            componentDidMount() {
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
                        OT.checkScreenSharingCapability((response) => {
                            if (!response.supported || response.extensionRegistered === false) {
                                this.setState({ extensionError: "This browser does not support screen sharing." });
                            }
                            else if (response.extensionInstalled === false && response.extensionRequired) {
                                this.setState({ extensionError: "Please install the screen-sharing extension and load this page over HTTPS." });
                            }
                            this.getData();
                        });
                    }
                    else {
                        this.getData();
                    }
                }
                else {
                    // the client does not support WebRTC
                    this.setStatusText("WebRTC is not supported.", App.Components.StatusStyle.Error);
                }
            }
            getTargetId() {
                return this.props.targetId;
            }
            getData() {
                $.ajax({
                    cache: false,
                    type: "GET",
                    url: this.props.actionUrl + "/GetData",
                    success: (r) => {
                        if (r.status === VC.Global.Data.RESPONSE_SUCCESS) {
                            this.dataResponse = r.data;
                            this.setStatusText("Connecting the session ...", App.Components.StatusStyle.Connecting);
                            this.sessionConnect();
                        }
                        else {
                            this.setStatusText(r.message, App.Components.StatusStyle.Error);
                        }
                    },
                    error: (xhr, status, error) => {
                        this.setStatusText("XHR Error: " + xhr.statusText, App.Components.StatusStyle.Error);
                    }
                });
            }
            addConnection(connection) {
                this.connections.push(connection);
            }
            removeConnection(id) {
                let removed = false;
                let c = [];
                for (let i = 0; i < this.connections.length; i++) {
                    if (this.connections[i].connectionId !== id) {
                        c.push(this.connections[i]);
                    }
                    else {
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
            isConnectionExists(uid) {
                let exists = false;
                for (let i = 0; i < this.connections.length && !exists; i++) {
                    if (App.Global.Fce.toTokenData(this.connections[i].data).Uid === uid) {
                        exists = true;
                    }
                }
                return exists;
            }
            // for PC
            getScConnection() {
                let c = null;
                for (let i = 0; i < this.connections.length && c == null; i++) {
                    if (App.Global.Fce.toTokenData(this.connections[i].data).Role === Roles.SC) {
                        c = this.connections[i];
                    }
                }
                return c;
            }
            // for PC, SC, TC
            getAcConnection() {
                let c = null;
                for (let i = 0; i < this.connections2AC.length && c == null; i++) {
                    if (App.Global.Fce.toTokenData(this.connections2AC[i].data).Role === Roles.AC) {
                        c = this.connections2AC[i];
                    }
                }
                return c;
            }
            // for PC
            getTcConnection() {
                let c = null;
                for (let i = 0; i < this.connections2TC.length && c == null; i++) {
                    if (App.Global.Fce.toTokenData(this.connections2TC[i].data).Role === Roles.TC) {
                        c = this.connections2TC[i];
                    }
                }
                return c;
            }
            getConnectionByUid(uid) {
                let c = null;
                for (let i = 0; i < this.connections.length && c == null; i++) {
                    if (App.Global.Fce.toTokenData(this.connections[i].data).Uid === uid) {
                        c = this.connections[i];
                    }
                }
                return c;
            }
            addConnection2TC(connection) {
                this.connections2TC.push(connection);
            }
            removeConnection2TC(id) {
                let removed = false;
                let c = [];
                for (let i = 0; i < this.connections2TC.length; i++) {
                    if (this.connections2TC[i].connectionId !== id) {
                        c.push(this.connections2TC[i]);
                    }
                    else {
                        removed = true;
                    }
                }
                this.connections2TC = c;
                return removed;
            }
            addConnection2AC(connection) {
                this.connections2AC.push(connection);
            }
            removeConnection2AC(id) {
                let removed = false;
                let c = [];
                for (let i = 0; i < this.connections2AC.length; i++) {
                    if (this.connections2AC[i].connectionId !== id) {
                        c.push(this.connections2AC[i]);
                    }
                    else {
                        removed = true;
                    }
                }
                this.connections2AC = c;
                return removed;
            }
            sessionConnect() {
                let s;
                if (this.role === Roles.PC || this.role === Roles.SC) {
                    s = this.dataResponse.ScSession;
                }
                else if (this.role === Roles.TC) {
                    s = this.dataResponse.TcSession;
                }
                else if (this.role === Roles.AC) {
                    s = this.dataResponse.AcSession;
                }
                this.session = OT.initSession(this.dataResponse.Key, s.SessionId);
                this.session.on({
                    signal: (event) => {
                        this.signalReceived(event);
                    },
                    connectionCreated: (event) => {
                        let tokenData = App.Global.Fce.toTokenData(event.connection.data);
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
                                this.setStatusText("Connected to the session.", App.Components.StatusStyle.Connected);
                                this.connected(event.connection, ConnectionType.XC);
                            }
                            else if (this.session.connection.connectionId !== event.connection.connectionId
                                && tokenData.Uid !== this.dataResponse.Uid) {
                                // not me and not already connected
                                this.connected(event.connection, ConnectionType.XC);
                            }
                        }
                        else if (this.session.connection.connectionId === event.connection.connectionId) {
                            // its me and already connected - disconnect
                            this.alreadyConnected = true;
                            this.session.disconnect();
                        }
                    },
                    connectionDestroyed: (event) => {
                        if (this.removeConnection(event.connection.connectionId)) {
                            this.disconnected(event.connection, ConnectionType.XC);
                        }
                    },
                    sessionCreated: (event) => {
                        // session created
                    },
                    sessionDisconnected: (event) => {
                        if (this.alreadyConnected) {
                            this.setStatusText("Already connected.", App.Components.StatusStyle.Error);
                        }
                        else if (event.reason === "networkDisconnected") {
                            this.setStatusText("Your network connection terminated.", App.Components.StatusStyle.Error);
                        }
                        else {
                            this.setStatusText("Disconnected from the session.", App.Components.StatusStyle.Error);
                        }
                        this.sessionDisconnected(event);
                    },
                    streamCreated: (event) => {
                        this.streamCreated(event.stream.connection, event.stream);
                    },
                    streamDestroyed: (event) => {
                        this.streamDestroyed(event.stream.connection, event.stream);
                    },
                    streamPropertyChanged: (event) => {
                        // video / audio changed
                    }
                });
                this.session.connect(s.Token, (err) => {
                    if (err) {
                        this.setStatusText("Error connecting: " + err.message, App.Components.StatusStyle.Error);
                    }
                    else {
                    }
                });
            }
            sessionConnect2TC() {
                let s = this.dataResponse.TcSession;
                this.session2TC = OT.initSession(this.dataResponse.Key, s.SessionId);
                this.session2TC.on({
                    signal: (event) => {
                        this.signalReceived(event);
                    },
                    connectionCreated: (event) => {
                        // add connection
                        this.addConnection2TC(event.connection);
                        if (this.session2TC.connection.connectionId !== event.connection.connectionId) {
                            // if its not me
                            this.connected(event.connection, ConnectionType.TC);
                        }
                    },
                    connectionDestroyed: (event) => {
                        if (this.removeConnection2TC(event.connection.connectionId)) {
                            if (this.session2TC.connection.connectionId !== event.connection.connectionId) {
                                // if its not me
                                this.disconnected(event.connection, ConnectionType.TC);
                            }
                        }
                    },
                    streamCreated: (event) => {
                        this.streamCreated(event.stream.connection, event.stream);
                    },
                    streamDestroyed: (event) => {
                        this.streamDestroyed(event.stream.connection, event.stream);
                    }
                });
                this.session2TC.connect(s.Token);
            }
            sessionConnect2AC() {
                let s = this.dataResponse.AcSession;
                this.session2AC = OT.initSession(this.dataResponse.Key, s.SessionId);
                this.session2AC.on({
                    signal: (event) => {
                        this.signalReceived(event);
                    },
                    connectionCreated: (event) => {
                        // add connection
                        this.addConnection2AC(event.connection);
                        if (this.session2AC.connection.connectionId !== event.connection.connectionId) {
                            // if its not me
                            this.connected(event.connection, ConnectionType.AC);
                        }
                    },
                    connectionDestroyed: (event) => {
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
            disconnect() {
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
        }
        App.XC = XC;
    })(App = VC.App || (VC.App = {}));
})(VC || (VC = {}));
//# sourceMappingURL=XC.js.map