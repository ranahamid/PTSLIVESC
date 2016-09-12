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
            Roles[Roles["FC"] = 4] = "FC";
            Roles[Roles["AC"] = 5] = "AC";
        })(App.Roles || (App.Roles = {}));
        var Roles = App.Roles;
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
                this.alreadyConnected = false;
                this.session = null;
                this.streams = [];
                // maxResolution — { width: 1920, height: 1920 }, mirror — false, fitMode — "contain"
                this.publishProps = { width: "100%", height: "100%", style: { buttonDisplayMode: "off" } };
                this.subscribeProps = { width: "100%", height: "100%", style: { buttonDisplayMode: "on" } };
                this.screenSharingExtensionId = "gedopbhbkblbppgdhhinadlfcphccpch";
                this.state = { extensionError: "", layout: 0 };
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
            // connections
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
            isConnectionExists(uid) {
                let exists = false;
                for (let i = 0; i < this.connections.length && !exists; i++) {
                    if (App.Global.Fce.toTokenData(this.connections[i].data).Uid === uid) {
                        exists = true;
                    }
                }
                return exists;
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
            getMyConnection() {
                return this.getConnectionByUid(this.dataResponse.Uid);
            }
            getAcConnection() {
                let c = null;
                for (let i = 0; i < this.connections.length && c == null; i++) {
                    if (App.Global.Fce.toTokenData(this.connections[i].data).Role === Roles.AC) {
                        c = this.connections[i];
                    }
                }
                return c;
            }
            getScConnection() {
                let c = null;
                for (let i = 0; i < this.connections.length && c == null; i++) {
                    let tokenData = App.Global.Fce.toTokenData(this.connections[i].data);
                    if (tokenData.Role === Roles.SC && this.isInMyGroup(tokenData.Uid)) {
                        c = this.connections[i];
                    }
                }
                return c;
            }
            getTcConnection() {
                let c = null;
                for (let i = 0; i < this.connections.length && c == null; i++) {
                    let tokenData = App.Global.Fce.toTokenData(this.connections[i].data);
                    if (tokenData.Role === Roles.TC && this.isInMyGroup(tokenData.Uid)) {
                        c = this.connections[i];
                    }
                }
                return c;
            }
            // streams
            addStream(stream) {
                this.streams.push(stream);
            }
            removeStream(stream) {
                let removed = false;
                let s = [];
                for (let i = 0; i < this.streams.length; i++) {
                    if (this.streams[i].connection.connectionId !== stream.connection.connectionId) {
                        s.push(this.streams[i]);
                    }
                    else {
                        removed = true;
                    }
                }
                this.streams = s;
                return removed;
            }
            getStream(userUid) {
                let s = null;
                for (let i = 0; i < this.streams.length && s == null; i++) {
                    let tokenData = App.Global.Fce.toTokenData(this.streams[i].connection.data);
                    if (tokenData.Uid === userUid) {
                        s = this.streams[i];
                    }
                }
                return s;
            }
            // groups
            getGroupComputer(uid) {
                let iUser = null;
                for (let i = 0; i < this.dataResponse.Group.length && iUser === null; i++) {
                    if (this.dataResponse.Group[i].Uid === uid) {
                        iUser = this.dataResponse.Group[i];
                    }
                }
                return iUser;
            }
            isInMyGroup(uid) {
                return (this.getGroupComputer(uid) !== null);
            }
            getConnectionsOfMyGroup(role = null) {
                let connections = [];
                for (let i = 0; i < this.dataResponse.Group.length; i++) {
                    if (role === null || this.dataResponse.Group[i].Role === role) {
                        connections.push(this.getConnectionByUid(this.dataResponse.Group[i].Uid));
                    }
                }
                return connections;
            }
            sessionConnect() {
                let s = this.dataResponse.Session;
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
                                this.setStatusText("Connected to the session.", App.Components.StatusStyle.Connected);
                                this.connected(event.connection);
                            }
                            else if (this.session.connection.connectionId !== event.connection.connectionId
                                && tokenData.Uid !== this.dataResponse.Uid) {
                                // not me and not already connected
                                this.connected(event.connection);
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
                            this.disconnected(event.connection);
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
                        this.addStream(event.stream);
                        this.streamCreated(event.stream.connection, event.stream);
                    },
                    streamDestroyed: (event) => {
                        this.removeStream(event.stream);
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
            disconnect() {
                if (this.session) {
                    this.session.disconnect();
                }
            }
        }
        App.XC = XC;
    })(App = VC.App || (VC.App = {}));
})(VC || (VC = {}));
//# sourceMappingURL=XC.js.map