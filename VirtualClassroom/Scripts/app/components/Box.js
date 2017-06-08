/* tslint:disable:max-line-length */
var VC;
(function (VC) {
    var App;
    (function (App) {
        var Components;
        (function (Components) {
            "use strict";
            (function (BoxFitMode) {
                BoxFitMode[BoxFitMode["Contain"] = 0] = "Contain";
                BoxFitMode[BoxFitMode["Cover"] = 1] = "Cover";
            })(Components.BoxFitMode || (Components.BoxFitMode = {}));
            var BoxFitMode = Components.BoxFitMode;
            //add
            (function (BoxStyle) {
                BoxStyle[BoxStyle["NotConnected"] = 0] = "NotConnected";
                BoxStyle[BoxStyle["Connected"] = 1] = "Connected";
                BoxStyle[BoxStyle["HandRaised"] = 2] = "HandRaised";
            })(Components.BoxStyle || (Components.BoxStyle = {}));
            var BoxStyle = Components.BoxStyle;
            class Box extends React.Component {
                constructor(props) {
                    super(props);
                    this.streamHandler = null;
                    this.isConnected = false;
                    //add
                    this.state = { mirror: props.mirror, visible: props.visible, style: props.style };
                }
                //add
                setStyle(style) {
                    this.setState({ visible: true, style: style });
                }
                getBox() {
                    return this.divBox;
                }
                clearBox() {
                    let box = this.getBox();
                    box.innerHTML = "<div id=" + this.props.id + "></div>";
                }
                setVisibility(visible) {
                    if (visible) {
                        if (this.divBox.style.display === "none") {
                            this.divBox.style.display = "block";
                            this.state.visible = true;
                        }
                    }
                    else {
                        if (this.divBox.style.display === "block") {
                            this.divBox.style.display = "none";
                            this.state.visible = false;
                        }
                    }
                }
                subscribe(session, stream, volume) {
                    this.isConnected = true;
                    let subscribeProps = this.props.streamProps;
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
                    this.streamHandler = session.subscribe(stream, this.props.id, subscribeProps, (error) => {
                        if (error) {
                            // error
                            console.log("ERROR 0x04: " + error);
                        }
                        else {
                            // subscribed
                            this.streamHandler.setAudioVolume(volume);
                        }
                    });
                }
                subscribeVideo(session, stream) {
                    this.isConnected = true;
                    let subscribeProps = this.props.streamProps;
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
                    this.streamHandler = session.subscribe(stream, this.props.id, subscribeProps, (error) => {
                        if (error) {
                            // error
                            alert("ERROR 0x03: " + error);
                        }
                        else {
                        }
                    });
                }
                subscribeAudio(session, stream, volume) {
                    let subscribeProps = this.props.streamProps;
                    subscribeProps.subscribeToVideo = false;
                    this.clearBox();
                    this.streamHandler = session.subscribeToAudio(stream, this.props.id, subscribeProps, (error) => {
                        if (error) {
                            // error
                            console.log("ERROR 0x02: " + error);
                        }
                        else {
                            // subscribed
                            this.streamHandler.setAudioVolume(volume);
                            this.isConnected = true;
                        }
                    });
                }
                audioVolume(volume) {
                    if (this.streamHandler !== null) {
                        this.streamHandler.setAudioVolume(volume);
                    }
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
                    if (this.state.mirror) {
                        publishProps.mirror = this.state.mirror;
                    }
                    else if (this.props.mirror) {
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
                                }
                                else {
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
                unpublish(session) {
                    session.unpublish(this.streamHandler);
                    this.streamHandler = null;
                    this.clearBox();
                    this.isConnected = false;
                }
                audio(on) {
                    if (this.streamHandler !== null) {
                        this.streamHandler.publishAudio(on);
                    }
                }
                video(on) {
                    if (this.streamHandler !== null) {
                        this.streamHandler.publishVideo(on);
                    }
                }
                setMirror(mirror) {
                    this.state.mirror = mirror;
                }
                unsubscribe(session) {
                    session.unsubscribe(this.streamHandler);
                    this.streamHandler = null;
                    this.clearBox();
                    this.isConnected = false;
                }
                getStats(completionHandler) {
                    if (this.streamHandler !== null) {
                        this.streamHandler.getStats(completionHandler);
                    }
                }
                render() {
                    let className = this.props.BoxClasses[this.state.style];
                    let thisClassName = this.props.className;
                    let TotalClassName = className + " " + thisClassName;
                    return (React.createElement("div", {ref: (ref) => this.divBox = ref, className: TotalClassName, style: { display: (this.state.visible ? "block" : "none") }}));
                }
            }
            Components.Box = Box;
        })(Components = App.Components || (App.Components = {}));
    })(App = VC.App || (VC.App = {}));
})(VC || (VC = {}));
//# sourceMappingURL=Box.js.map