/* tslint:disable:max-line-length */

namespace VC.App.Components {
    "use strict";

    interface IBoxProps {
        id: string;
        streamProps: any;
        className: string;
        visible: boolean;
    }
    interface IBoxState {
    }

    export class Box extends React.Component<IBoxProps, IBoxState> {
        public streamHandler: any = null;
        private divBox: HTMLDivElement;

        constructor(props: IBoxProps) {
            super(props);
        }

        public getBox(): HTMLDivElement {
            return this.divBox;
        }
        public clearBox(): void {
            let box: HTMLDivElement = this.getBox();
            box.innerHTML = "<div id=" + this.props.id + "></div>";
        }
        public subscribe(session: any, stream: any, volume: number): void {
            let subscribeProps: any = this.props.streamProps;
            subscribeProps.audioVolume = volume;

            this.clearBox();
            this.streamHandler = session.subscribe(
                stream,
                this.props.id,
                subscribeProps,
                (error: any): void => {
                    if (error) {
                        // error
                        alert("ERROR: " + error);
                    } else {
                        // subscribed
                        this.streamHandler.setAudioVolume(volume);
                    }
                }
            );
        }
        public unsubscribe(session: any): void {
            session.unsubscribe(this.streamHandler);
            this.streamHandler = null;
            this.clearBox();
        }

        public publish(session: any, source: PublishSources, audio: boolean, video: boolean, startedHandler: (event: any) => void, stoppedHandler: (event: any) => void): void {
            var publishProps: any = this.props.streamProps;

            switch (source) {
                case PublishSources.Camera:
                    break;
                case PublishSources.Screen:
                    publishProps.videoSource = "screen";
                    break;
                case PublishSources.Application:
                    publishProps.videoSource = "application";
                    break;
                case PublishSources.Window:
                    publishProps.videoSource = "window";
                    break;
            }

            publishProps.publishAudio = audio ? "true" : "false";
            publishProps.publishVideo = video ? "true" : "false";

            this.clearBox();
            this.streamHandler = OT.initPublisher(this.props.id,
                publishProps,
                (error: any): void => {
                    if (error) {
                        // initPublisher error
                        // alert("Something went wrong: " + error.message);
                        stoppedHandler(null);
                    } else {
                        this.streamHandler.on({
                            mediaStopped: (event: any): void => stoppedHandler(event),
                            streamCreated: (event: any): void => startedHandler(event),
                            streamDestroyed: (event: any): void => stoppedHandler(event)
                        });
                        session.publish(this.streamHandler,
                            (error: any): void => {
                                if (error) {
                                    // alert("Something went wrong: " + error.message);
                                    stoppedHandler(null);
                                } else {
                                    // audio/video
                                    this.streamHandler.publishAudio(audio);
                                    this.streamHandler.publishVideo(video);
                                    // publishing
                                    startedHandler(null);
                                }
                            });
                    }
                });
        }
        public unpublish(session: any): void {
            session.unpublish(this.streamHandler);
            this.streamHandler = null;
            this.clearBox();
        }
        public audio(on: boolean): void {
            if (this.streamHandler != null) {
                this.streamHandler.publishAudio(on);
            }
        }
        public video(on: boolean): void {
            if (this.streamHandler != null) {
                this.streamHandler.publishVideo(on);
            }
        }
        public audioVolume(volume: number): void {
            if (this.streamHandler != null) {
                this.streamHandler.setAudioVolume(volume);
            }
        }

        public getStats(completionHandler: (error: any, stats: any) => void): void {
            if (this.streamHandler != null) {
                this.streamHandler.getStats(completionHandler);
            }
        }

        public isConnected(): boolean {
            return this.streamHandler !== null;
        }

        render(): JSX.Element {
            return (
                <div ref={(ref: HTMLDivElement) => this.divBox = ref} className={this.props.className} style={{ display: (this.props.visible ? "block" : "none") }}></div>
            );
        }
    }
}