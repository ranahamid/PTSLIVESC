var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
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
    (function (PublishSources) {
        PublishSources[PublishSources["Camera"] = 1] = "Camera";
        PublishSources[PublishSources["Screen"] = 2] = "Screen";
        PublishSources[PublishSources["Application"] = 3] = "Application";
        PublishSources[PublishSources["Window"] = 4] = "Window";
    })(App.PublishSources || (App.PublishSources = {}));
    var PublishSources = App.PublishSources;
    var _C = (function (_super) {
        __extends(_C, _super);
        function _C(props, role) {
            _super.call(this, props);
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
        }
        _C.prototype.componentDidMount = function () {
            var _this = this;
            this.didMount();
            if (OT.checkSystemRequirements() === 1) {
                if (this.role === Roles.TC) {
                    // check for screensharing support
                    OT.registerScreenSharingExtension("chrome", this.screenSharingExtensionId, 2);
                    OT.checkScreenSharingCapability(function (response) {
                        if (!response.supported || response.extensionRegistered === false) {
                            _this.setStatusText("This browser does not support screen sharing.", App.Components.StatusStyle.Error);
                        }
                        else if (response.extensionInstalled === false && response.extensionRequired) {
                            _this.setStatusText("Please install the screen-sharing extension and load this page over HTTPS.", App.Components.StatusStyle.Error);
                        }
                        else {
                            _this.getData();
                        }
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
        };
        _C.prototype.getTargetId = function () {
            return this.props.targetId;
        };
        _C.prototype.getData = function () {
            var _this = this;
            $.ajax({
                type: "GET",
                url: this.props.actionUrl + "/GetData",
                success: function (r) {
                    if (r != null) {
                        if (r.status === "success") {
                            _this.dataResponse = r.data;
                            _this.setStatusText("Connecting the session ...", App.Components.StatusStyle.Connecting);
                            _this.sessionConnect();
                        }
                        else {
                            _this.setStatusText(r.message, App.Components.StatusStyle.Error);
                        }
                    }
                    else {
                        _this.setStatusText("GetData action failed.", App.Components.StatusStyle.Error);
                    }
                },
                error: function (xhr, status, error) {
                    _this.setStatusText("XHR Error: " + xhr.statusText, App.Components.StatusStyle.Error);
                }
            });
        };
        _C.prototype.addConnection = function (connection) {
            this.connections.push(connection);
        };
        _C.prototype.removeConnection = function (id) {
            var removed = false;
            var c = [];
            for (var i = 0; i < this.connections.length; i++) {
                if (this.connections[i].connectionId !== id) {
                    c.push(this.connections[i]);
                }
                else {
                    removed = true;
                }
            }
            this.connections = c;
            return removed;
        };
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
        _C.prototype.isConnectionExists = function (uid) {
            var exists = false;
            for (var i = 0; i < this.connections.length && !exists; i++) {
                if (App.Global.Fce.toTokenData(this.connections[i].data).Uid === uid) {
                    exists = true;
                }
            }
            return exists;
        };
        // for PC
        _C.prototype.getScConnection = function () {
            var c = null;
            for (var i = 0; i < this.connections.length && c == null; i++) {
                if (App.Global.Fce.toTokenData(this.connections[i].data).Role === Roles.SC) {
                    c = this.connections[i];
                }
            }
            return c;
        };
        // for PC, SC, TC
        _C.prototype.getAcConnection = function () {
            var c = null;
            for (var i = 0; i < this.connections2AC.length && c == null; i++) {
                if (App.Global.Fce.toTokenData(this.connections2AC[i].data).Role === Roles.AC) {
                    c = this.connections2AC[i];
                }
            }
            return c;
        };
        _C.prototype.getConnectionByUid = function (uid) {
            var c = null;
            for (var i = 0; i < this.connections.length && c == null; i++) {
                if (App.Global.Fce.toTokenData(this.connections[i].data).Uid === uid) {
                    c = this.connections[i];
                }
            }
            return c;
        };
        _C.prototype.addConnection2TC = function (connection) {
            this.connections2TC.push(connection);
        };
        _C.prototype.removeConnection2TC = function (id) {
            var removed = false;
            var c = [];
            for (var i = 0; i < this.connections2TC.length; i++) {
                if (this.connections2TC[i].connectionId !== id) {
                    c.push(this.connections2TC[i]);
                }
                else {
                    removed = true;
                }
            }
            this.connections2TC = c;
            return removed;
        };
        _C.prototype.addConnection2AC = function (connection) {
            this.connections2AC.push(connection);
        };
        _C.prototype.removeConnection2AC = function (id) {
            var removed = false;
            var c = [];
            for (var i = 0; i < this.connections2AC.length; i++) {
                if (this.connections2AC[i].connectionId !== id) {
                    c.push(this.connections2AC[i]);
                }
                else {
                    removed = true;
                }
            }
            this.connections2AC = c;
            return removed;
        };
        _C.prototype.sessionConnect = function () {
            var _this = this;
            var s;
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
                signal: function (event) {
                    _this.signalReceived(event);
                },
                connectionCreated: function (event) {
                    var tokenData = App.Global.Fce.toTokenData(event.connection.data);
                    if (!_this.isConnectionExists(tokenData.Uid)) {
                        // add connection
                        _this.addConnection(event.connection);
                        if (_this.session.connection.connectionId === event.connection.connectionId) {
                            // its me, successfully connected
                            if (_this.role === Roles.PC && _this.dataResponse.TcSession != null) {
                                // when PC & when TC is assigned, connect to teacher computer session
                                _this.sessionConnect2TC();
                            }
                            if (_this.role !== Roles.AC && _this.dataResponse.AcSession != null) {
                                // connect to AC session
                                _this.sessionConnect2AC();
                            }
                            _this.setStatusText('Connected to the session.', App.Components.StatusStyle.Connected);
                            _this.connected(event.connection);
                        }
                        else if (_this.session.connection.connectionId !== event.connection.connectionId && tokenData.Uid != _this.dataResponse.Uid) {
                            // not me and not already connected
                            _this.connected(event.connection);
                        }
                    }
                    else if (_this.session.connection.connectionId === event.connection.connectionId) {
                        // its me and already connected - disconnect
                        _this.alreadyConnected = true;
                        _this.session.disconnect();
                    }
                },
                connectionDestroyed: function (event) {
                    if (_this.removeConnection(event.connection.connectionId)) {
                        _this.disconnected(event.connection);
                    }
                },
                sessionDisconnected: function (event) {
                    if (_this.alreadyConnected) {
                        _this.setStatusText('Already connected.', App.Components.StatusStyle.Error);
                    }
                    else if (event.reason == 'networkDisconnected') {
                        _this.setStatusText('Your network connection terminated.', App.Components.StatusStyle.Error);
                    }
                    else {
                        _this.setStatusText('Disconnected from the session.', App.Components.StatusStyle.Error);
                    }
                    _this.sessionDisconnected(event);
                },
                streamCreated: function (event) {
                    _this.streamCreated(event.stream.connection, event.stream);
                },
                streamDestroyed: function (event) {
                    _this.streamDestroyed(event.stream.connection, event.stream);
                },
                streamPropertyChanged: function (event) {
                    // video / audio changed
                }
            });
            this.session.connect(s.Token, function (err) {
                if (err) {
                    _this.setStatusText('Error connecting: ' + err.message, App.Components.StatusStyle.Error);
                }
                else {
                }
            });
        };
        _C.prototype.sessionConnect2TC = function () {
            var _this = this;
            var s = this.dataResponse.TcSession;
            this.session2TC = OT.initSession(this.dataResponse.Key, s.SessionId);
            this.session2TC.on({
                signal: function (event) {
                    _this.signalReceived(event);
                },
                connectionCreated: function (event) {
                    var tokenData = App.Global.Fce.toTokenData(event.connection.data);
                    // add connection
                    _this.addConnection2TC(event.connection);
                    if (_this.session2TC.connection.connectionId != event.connection.connectionId) {
                        // if its not me
                        _this.connected(event.connection);
                    }
                },
                connectionDestroyed: function (event) {
                    if (_this.removeConnection2TC(event.connection.connectionId)) {
                        if (_this.session2TC.connection.connectionId != event.connection.connectionId) {
                            // if its not me
                            _this.disconnected(event.connection);
                        }
                    }
                },
                streamCreated: function (event) {
                    _this.streamCreated(event.stream.connection, event.stream);
                },
                streamDestroyed: function (event) {
                    _this.streamDestroyed(event.stream.connection, event.stream);
                }
            });
            this.session2TC.connect(s.Token, function (err) { });
        };
        _C.prototype.sessionConnect2AC = function () {
            var _this = this;
            var s = this.dataResponse.AcSession;
            this.session2AC = OT.initSession(this.dataResponse.Key, s.SessionId);
            this.session2AC.on({
                signal: function (event) {
                    _this.signalReceived(event);
                },
                connectionCreated: function (event) {
                    var tokenData = App.Global.Fce.toTokenData(event.connection.data);
                    // add connection
                    _this.addConnection2AC(event.connection);
                    if (_this.session2AC.connection.connectionId != event.connection.connectionId) {
                        // if its not me
                        _this.connected(event.connection);
                    }
                },
                connectionDestroyed: function (event) {
                    if (_this.removeConnection2AC(event.connection.connectionId)) {
                        if (_this.session2AC.connection.connectionId != event.connection.connectionId) {
                            // if its not me
                            _this.disconnected(event.connection);
                        }
                    }
                },
            });
            this.session2AC.connect(s.Token, function (err) { });
        };
        _C.prototype.disconnect = function () {
            if (this.session2AC) {
                this.session2AC.disconnect();
            }
            if (this.session2TC) {
                this.session2TC.disconnect();
            }
            if (this.session) {
                this.session.disconnect();
            }
        };
        return _C;
    }(React.Component));
    App._C = _C;
})(App || (App = {}));
//# sourceMappingURL=_C.js.map