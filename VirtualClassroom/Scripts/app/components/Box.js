/* tslint:disable:max-line-length */
var VC;
(function (VC) {
    var App;
    (function (App) {
        var Components;
        (function (Components) {
            "use strict";
            class Box extends React.Component {
                constructor(props) {
                    super(props);
                    this.streamHandler = null;
                }
                getBox() {
                    return this.divBox;
                }
                clearBox() {
                    let box = this.getBox();
                    box.innerHTML = "<div id=" + this.props.id + "></div>";
                }
                subscribe(session, stream, volume) {
                    let subscribeProps = this.props.streamProps;
                    subscribeProps.audioVolume = volume;
                    this.clearBox();
                    this.streamHandler = session.subscribe(stream, this.props.id, subscribeProps, (error) => {
                        if (error) {
                            // error
                            alert("ERROR: " + error);
                        }
                        else {
                            // subscribed
                            this.streamHandler.setAudioVolume(volume);
                        }
                    });
                }
                unsubscribe(session) {
                    session.unsubscribe(this.streamHandler);
                    this.streamHandler = null;
                    this.clearBox();
                }
                publish(session, source, audio, video, startedHandler, stoppedHandler) {
                    var publishProps = this.props.streamProps;
                    switch (source) {
                        case App.PublishSources.Camera:
                            break;
                        case App.PublishSources.Screen:
                            publishProps.videoSource = "screen";
                            break;
                        case App.PublishSources.Application:
                            publishProps.videoSource = "application";
                            break;
                        case App.PublishSources.Window:
                            publishProps.videoSource = "window";
                            break;
                    }
                    publishProps.publishAudio = audio ? "true" : "false";
                    publishProps.publishVideo = video ? "true" : "false";
                    this.clearBox();
                    this.streamHandler = OT.initPublisher(this.props.id, publishProps, (error) => {
                        if (error) {
                            // initPublisher error
                            // alert("Something went wrong: " + error.message);
                            stoppedHandler(null);
                        }
                        else {
                            this.streamHandler.on({
                                mediaStopped: (event) => stoppedHandler(event),
                                streamCreated: (event) => startedHandler(event),
                                streamDestroyed: (event) => stoppedHandler(event)
                            });
                            session.publish(this.streamHandler, (error) => {
                                if (error) {
                                    // alert("Something went wrong: " + error.message);
                                    stoppedHandler(null);
                                }
                                else {
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
                unpublish(session) {
                    session.unpublish(this.streamHandler);
                    this.streamHandler = null;
                    this.clearBox();
                }
                audio(on) {
                    if (this.streamHandler != null) {
                        this.streamHandler.publishAudio(on);
                    }
                }
                video(on) {
                    if (this.streamHandler != null) {
                        this.streamHandler.publishVideo(on);
                    }
                }
                audioVolume(volume) {
                    if (this.streamHandler != null) {
                        this.streamHandler.setAudioVolume(volume);
                    }
                }
                getStats(completionHandler) {
                    if (this.streamHandler != null) {
                        this.streamHandler.getStats(completionHandler);
                    }
                }
                render() {
                    return (React.createElement("div", {ref: (ref) => this.divBox = ref, className: this.props.className, style: { display: (this.props.visible ? "block" : "none") }}));
                }
            }
            Components.Box = Box;
        })(Components = App.Components || (App.Components = {}));
    })(App = VC.App || (VC.App = {}));
})(VC || (VC = {}));
//# sourceMappingURL=Box.js.map