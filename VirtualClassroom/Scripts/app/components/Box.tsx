/* tslint:disable:max-line-length */

namespace VC.App.Components {
    "use strict";

    export enum BoxFitMode {
        Contain,
        Cover
    }

    interface IBoxProps {
        id: string;
        streamProps: any;
        className: string;
        visible: boolean;
        fitMode?: BoxFitMode;
        mirror?: boolean;
    }
    interface IBoxState {
        mirror?: boolean;
        visible: boolean;
    }

    export class Box extends React.Component<IBoxProps, IBoxState> {
        public streamHandler: any = null;
        public isConnected: boolean = false;
        private divBox: HTMLDivElement;

        constructor(props: IBoxProps) {
            super(props);
            this.state = { mirror: props.mirror, visible: props.visible } as IBoxState;
        }

        public getBox(): HTMLDivElement {
            return this.divBox;
        }
        public clearBox(): void {
            let box: HTMLDivElement = this.getBox();
            box.innerHTML = "<div id=" + this.props.id + "></div>";
        }

        public setVisibility(visible: boolean): void {
            if (visible) {
                if (this.divBox.style.display === "none") {
                    this.divBox.style.display = "block";
                    this.state.visible = true;
                }
            } else {
                if (this.divBox.style.display === "block") {
                    this.divBox.style.display = "none";
                    this.state.visible = false;
                }
            }
        }

        public subscribe(session: any, stream: any, volume: number): void {
            this.isConnected = true;

            let subscribeProps: any = this.props.streamProps;
            subscribeProps.audioVolume = volume;

            if (this.props.mirror) {
                subscribeProps.mirror = this.props.mirror;
            }

            switch (this.props.fitMode) {
                case BoxFitMode.Contain:
                    subscribeProps.fitMode = "contain";
                    break;
                case BoxFitMode.Cover:
                    subscribeProps.fitMode = "cover";
                    break;
            }

            this.clearBox();
            this.streamHandler = session.subscribe(
                stream,
                this.props.id,
                subscribeProps,
                (error: any): void => {
                    if (error) {
                        // error
                        console.log("ERROR 0x04: " + error);
                    } else {
                        // subscribed
                        this.streamHandler.setAudioVolume(volume);
                    }
                }
            );
        }
        public subscribeVideo(session: any, stream: any): void {
            this.isConnected = true;

            let subscribeProps: any = this.props.streamProps;

            if (this.props.mirror) {
                subscribeProps.mirror = this.props.mirror;
            }

            subscribeProps.subscribeToAudio = false;

            switch (this.props.fitMode) {
                case BoxFitMode.Contain:
                    subscribeProps.fitMode = "contain";
                    break;
                case BoxFitMode.Cover:
                    subscribeProps.fitMode = "cover";
                    break;
            }

            this.clearBox();
            this.streamHandler = session.subscribe(
                stream,
                this.props.id,
                subscribeProps,
                (error: any): void => {
                    if (error) {
                        // error
                        alert("ERROR 0x03: " + error);
                    } else {
                        // subscribed
                    }
                }
            );
        }
        public subscribeAudio(session: any, stream: any, volume: number): void {
            let subscribeProps: any = this.props.streamProps;

            subscribeProps.subscribeToVideo = false;

            this.clearBox();
            this.streamHandler = session.subscribeToAudio(
                stream,
                this.props.id,
                subscribeProps,
                (error: any): void => {
                    if (error) {
                        // error
                        console.log("ERROR 0x02: " + error);
                    } else {
                        // subscribed
                        this.streamHandler.setAudioVolume(volume);
                        this.isConnected = true;
                    }
                }
            );
        }
        public audioVolume(volume: number): void {
            if (this.streamHandler !== null) {
                this.streamHandler.setAudioVolume(volume);
            }
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

            if (this.state.mirror) {
                publishProps.mirror = this.state.mirror;
            } else if (this.props.mirror) {
                publishProps.mirror = this.props.mirror;
            }

            switch (this.props.fitMode) {
                case BoxFitMode.Contain:
                    publishProps.fitMode = "contain";
                    break;
                case BoxFitMode.Cover:
                    publishProps.fitMode = "cover";
                    break;
            }

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
                                    // stoppedHandler(null);
                                } else {
                                    // audio/video
                                    this.streamHandler.publishAudio(audio);
                                    this.streamHandler.publishVideo(video);
                                    // publishing
                                    // startedHandler(null);
                                    this.isConnected = true;
                                }
                            });
                    }
                });
        }
        public unpublish(session: any): void {
            session.unpublish(this.streamHandler);
            this.streamHandler = null;
            this.clearBox();

            this.isConnected = false;
        }
        public audio(on: boolean): void {
            if (this.streamHandler !== null) {
                this.streamHandler.publishAudio(on);
            }
        }
        public video(on: boolean): void {
            if (this.streamHandler !== null) {
                this.streamHandler.publishVideo(on);
            }
        }

        public setMirror(mirror) {
            this.state.mirror = mirror;
        }

        public unsubscribe(session: any): void {
            session.unsubscribe(this.streamHandler);
            this.streamHandler = null;
            this.clearBox();

            this.isConnected = false;
        }

        public getStats(completionHandler: (error: any, stats: any) => void): void {
            if (this.streamHandler !== null) {
                this.streamHandler.getStats(completionHandler);
            }
        }

        render(): JSX.Element {
            return (
                <div ref={(ref: HTMLDivElement) => this.divBox = ref} className={this.props.className} style={{ display: (this.state.visible ? "block" : "none") }}></div>
            );
        }
    }
}