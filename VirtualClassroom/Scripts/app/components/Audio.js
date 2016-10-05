/* tslint:disable:max-line-length */
var VC;
(function (VC) {
    var App;
    (function (App) {
        var Components;
        (function (Components) {
            "use strict";
            class Audio {
                constructor() {
                    this.handlers = [];
                }
                subscribe(uid, session, stream, volume) {
                    // create div
                    let div = document.createElement("div");
                    let handler = null;
                    handler = session.subscribe(stream, div, { subscribeToVideo: false }, (error) => {
                        if (error) {
                            // error
                            alert("ERROR: " + error);
                        }
                        else {
                            // subscribed
                            handler.setAudioVolume(volume);
                            // add to array
                            let audioHander = {
                                uid: uid,
                                session: session,
                                div: div,
                                handler: handler
                            };
                            this.handlers.push(audioHander);
                        }
                    });
                }
                audioVolume(volume) {
                    this.handlers.forEach((audioHandler) => {
                        if (audioHandler.handler !== null) {
                            audioHandler.handler.setAudioVolume(volume);
                        }
                    });
                }
                unsubscribe(uid) {
                    let handlers = [];
                    this.handlers.forEach((audioHandler) => {
                        if (audioHandler.uid === uid) {
                            // unsubscribe
                            audioHandler.session.unsubscribe(audioHandler.handler);
                        }
                        else {
                            handlers.push(audioHandler);
                        }
                    });
                    this.handlers = handlers;
                }
            }
            Components.Audio = Audio;
        })(Components = App.Components || (App.Components = {}));
    })(App = VC.App || (VC.App = {}));
})(VC || (VC = {}));
//# sourceMappingURL=Audio.js.map