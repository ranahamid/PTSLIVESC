/* tslint:disable:max-line-length */

namespace VC.App.Components {
    "use strict";

    interface AudioHandler {
        uid: string;
        session: any;
        handler: any;
        div: HTMLDivElement;
    }

    export class Audio {
        private handlers: Array<AudioHandler> = [];

        constructor() {
        }

        public subscribe(uid: string, session: any, stream: any, volume: number): void {
            // create div
            let div: HTMLDivElement = document.createElement("div");
            let handler: any = null;

            handler = session.subscribe(
                stream,
                div,
                { subscribeToVideo: false },
                (error: any): void => {
                    if (error) {
                        // error
                        alert("ERROR: " + error);
                    } else {
                        // subscribed
                        handler.setAudioVolume(volume);
                        // add to array
                        let audioHander: AudioHandler = {
                            uid: uid,
                            session: session,
                            div: div,
                            handler: handler
                        };
                        this.handlers.push(audioHander);
                    }
                }
            );
        }
        public audioVolume(volume: number): void {
            this.handlers.forEach((audioHandler: AudioHandler) => {
                if (audioHandler.handler !== null) {
                    audioHandler.handler.setAudioVolume(volume);
                }
            });
        }

        public unsubscribe(uid: string): void {
            let handlers: Array<AudioHandler> = [];
            this.handlers.forEach((audioHandler: AudioHandler) => {
                if (audioHandler.uid === uid) {
                    // unsubscribe
                    audioHandler.session.unsubscribe(audioHandler.handler);
                } else {
                    handlers.push(audioHandler);
                }
            });
            this.handlers = handlers;
        }

    }
}