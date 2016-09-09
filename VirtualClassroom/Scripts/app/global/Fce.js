var VC;
(function (VC) {
    var App;
    (function (App) {
        var Global;
        (function (Global) {
            "use strict";
            class Fce {
                static toTokenData(sData) {
                    return JSON.parse(sData);
                }
                static roleAsString(role) {
                    let e = App.Roles;
                    for (let k in e) {
                        if (e[k] === role) {
                            return k;
                        }
                    }
                    return null;
                }
                static toSimplifiedTimeString(ms) {
                    let m = Math.floor(ms / 60000);
                    let time = "";
                    if (m < 1) {
                        time += "< 1 min";
                    }
                    else {
                        time += m + " min";
                    }
                    return time;
                }
            }
            Global.Fce = Fce;
        })(Global = App.Global || (App.Global = {}));
    })(App = VC.App || (VC.App = {}));
})(VC || (VC = {}));
//# sourceMappingURL=Fce.js.map