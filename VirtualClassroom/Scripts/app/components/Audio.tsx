/* tslint:disable:max-line-length */

namespace VC.App.Components {
    "use strict";

    interface AudioHandler {
        uid: string;
        div: HTMLDivElement;
        handler: any;
    }

    export class Audio {
        private handlers: Array<AudioHandler> = [];

        constructor() {
        }

        private isHandlerAlreadyExists(uid: string): boolean {
            let exists: boolean = false;

            for (let i: number = 0; i < this.handlers.length && !exists; i++) {
                if (uid === this.handlers[i].uid) {
                    exists = true;
                }
            }

            return exists;
        }

        public subscribe(uid: string, session: any, stream: any, volume: number): void {
            if (stream !== null) {
                if (!this.isHandlerAlreadyExists(uid)) {
                    let div: HTMLDivElement = document.createElement("div");
                    let handler: any = null;
                    // document.body.appendChild(div);

                    // subscribe
                    handler = session.subscribe(
                        stream,
                        div,
                        { subscribeToVideo: false },
                        (error: any): void => {
                            if (error) {
                                // error
                                console.log("ERROR 0x05: " + error);
                            } else {
                                // subscribed
                                handler.setAudioVolume(volume);
                                // add to array
                                let audioHander: AudioHandler = {
                                    uid: uid,
                                    div: div,
                                    handler: handler
                                };
                                this.handlers.push(audioHander);
                            }
                        }
                    );
                }
            }
        }
        public audioVolume(volume: number): void {
            this.handlers.forEach((audioHandler: AudioHandler) => {
                if (audioHandler.handler !== null) {
                    audioHandler.handler.setAudioVolume(volume);
                }
            });
        }

        public unsubscribe(uid: string, session: any, stream: any): void {
            if (stream !== null) {
                let handlers: Array<AudioHandler> = [];
                this.handlers.forEach((audioHandler: AudioHandler) => {
                    if (audioHandler.uid === uid) {
                        // unsubscribe
                        session.unsubscribe(stream);
                        // document.body.removeChild(audioHandler.div);
                    } else {
                        handlers.push(audioHandler);
                    }
                });
                this.handlers = handlers;
            }
        }
    }
}