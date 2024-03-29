/* tslint:disable:max-line-length */
var VC;
(function (VC) {
    var App;
    (function (App) {
        var Global;
        (function (Global) {
            "use strict";
            (function (SignalTypes) {
                SignalTypes[SignalTypes["Unknown"] = 0] = "Unknown";
                SignalTypes[SignalTypes["Connected"] = 1] = "Connected";
                SignalTypes[SignalTypes["RaiseHand"] = 2] = "RaiseHand";
                SignalTypes[SignalTypes["TurnAv"] = 3] = "TurnAv";
                SignalTypes[SignalTypes["Volume"] = 4] = "Volume";
                SignalTypes[SignalTypes["TurnOff"] = 5] = "TurnOff";
                SignalTypes[SignalTypes["Chat"] = 6] = "Chat";
                SignalTypes[SignalTypes["Forms"] = 7] = "Forms";
                SignalTypes[SignalTypes["AudioPublish"] = 8] = "AudioPublish";
                SignalTypes[SignalTypes["FeaturedChanged"] = 9] = "FeaturedChanged";
                SignalTypes[SignalTypes["GroupChanged"] = 10] = "GroupChanged"; // used for FC => PC
            })(Global.SignalTypes || (Global.SignalTypes = {}));
            var SignalTypes = Global.SignalTypes;
            (function (ChatType) {
                ChatType[ChatType["Public"] = 0] = "Public";
            })(Global.ChatType || (Global.ChatType = {}));
            var ChatType = Global.ChatType;
            class Signaling {
                static signalTypeAsString(type) {
                    let e = SignalTypes;
                    for (let k in e) {
                        if (e[k] === type) {
                            return k;
                        }
                    }
                    return null;
                }
                static sendSignal(session, to, type, data) {
                    if (session && to) {
                        session.signal({
                            to: to,
                            type: this.signalTypeAsString(type),
                            data: JSON.stringify(data)
                        }, (error) => {
                            if (error) {
                                console.log("Signal Error: " + error.message);
                            }
                        });
                    }
                }
                static sendSignalAll(session, type, data) {
                    if (session) {
                        session.signal({
                            type: this.signalTypeAsString(type),
                            data: JSON.stringify(data)
                        }, (error) => {
                            if (error) {
                                console.log("Signal Error: " + error.message);
                            }
                        });
                    }
                }
                static getSignalType(type) {
                    let signalType = SignalTypes.Unknown;
                    let signalPrefix = "signal:";
                    switch (type.toLowerCase()) {
                        case signalPrefix + this.signalTypeAsString(SignalTypes.Connected).toLowerCase():
                            signalType = SignalTypes.Connected;
                            break;
                        case signalPrefix + this.signalTypeAsString(SignalTypes.RaiseHand).toLowerCase():
                            signalType = SignalTypes.RaiseHand;
                            break;
                        case signalPrefix + this.signalTypeAsString(SignalTypes.TurnAv).toLowerCase():
                            signalType = SignalTypes.TurnAv;
                            break;
                        case signalPrefix + this.signalTypeAsString(SignalTypes.Volume).toLowerCase():
                            signalType = SignalTypes.Volume;
                            break;
                        case signalPrefix + this.signalTypeAsString(SignalTypes.TurnOff).toLowerCase():
                            signalType = SignalTypes.TurnOff;
                            break;
                        case signalPrefix + this.signalTypeAsString(SignalTypes.Chat).toLowerCase():
                            signalType = SignalTypes.Chat;
                            break;
                        case signalPrefix + this.signalTypeAsString(SignalTypes.Forms).toLowerCase():
                            signalType = SignalTypes.Forms;
                            break;
                        case signalPrefix + this.signalTypeAsString(SignalTypes.AudioPublish).toLowerCase():
                            signalType = SignalTypes.AudioPublish;
                            break;
                        case signalPrefix + this.signalTypeAsString(SignalTypes.FeaturedChanged).toLowerCase():
                            signalType = SignalTypes.FeaturedChanged;
                            break;
                        case signalPrefix + this.signalTypeAsString(SignalTypes.GroupChanged).toLowerCase():
                            signalType = SignalTypes.GroupChanged;
                            break;
                    }
                    return signalType;
                }
            }
            Global.Signaling = Signaling;
        })(Global = App.Global || (App.Global = {}));
    })(App = VC.App || (VC.App = {}));
})(VC || (VC = {}));
//# sourceMappingURL=Signaling.js.map