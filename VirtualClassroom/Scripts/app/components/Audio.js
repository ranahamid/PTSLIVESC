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
                isHandlerAlreadyExists(uid) {
                    let exists = false;
                    for (let i = 0; i < this.handlers.length && !exists; i++) {
                        if (uid === this.handlers[i].uid) {
                            exists = true;
                        }
                    }
                    return exists;
                }
                subscribe(uid, session, stream, volume) {
                    if (stream !== null) {
                        if (!this.isHandlerAlreadyExists(uid)) {
                            let div = document.createElement("div");
                            let handler = null;
                            // document.body.appendChild(div);
                            // subscribe
                            handler = session.subscribe(stream, div, { subscribeToVideo: false }, (error) => {
                                if (error) {
                                    // error
                                    console.log("ERROR 0x05: " + error);
                                }
                                else {
                                    // subscribed
                                    handler.setAudioVolume(volume);
                                    // add to array
                                    let audioHander = {
                                        uid: uid,
                                        div: div,
                                        handler: handler
                                    };
                                    this.handlers.push(audioHander);
                                }
                            });
                        }
                    }
                }
                audioVolume(volume) {
                    this.handlers.forEach((audioHandler) => {
                        if (audioHandler.handler !== null) {
                            audioHandler.handler.setAudioVolume(volume);
                        }
                    });
                }
                unsubscribe(uid, session, stream) {
                    if (stream !== null) {
                        let handlers = [];
                        this.handlers.forEach((audioHandler) => {
                            if (audioHandler.uid === uid) {
                                // unsubscribe
                                session.unsubscribe(stream);
                            }
                            else {
                                handlers.push(audioHandler);
                            }
                        });
                        this.handlers = handlers;
                    }
                }
            }
            Components.Audio = Audio;
        })(Components = App.Components || (App.Components = {}));
    })(App = VC.App || (VC.App = {}));
})(VC || (VC = {}));
//# sourceMappingURL=Audio.js.map