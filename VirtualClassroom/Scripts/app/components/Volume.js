/* tslint:disable:max-line-length */
var VC;
(function (VC) {
    var App;
    (function (App) {
        var Components;
        (function (Components) {
            "use strict";
            class Volume extends React.Component {
                constructor(props) {
                    super(props);
                    this.state = { volume: this.props.volume };
                }
                setVolume(volume) {
                    if (this.state.volume !== volume) {
                        this.setState({ volume: volume });
                        this.props.onVolumeChanged(volume);
                    }
                }
                resetVolume(volume) {
                    // same as set Volume, just without callback
                    if (this.state.volume !== volume) {
                        this.setState({ volume: volume });
                    }
                }
                increaseVolume() {
                    let v = this.state.volume;
                    if (v < 100) {
                        v += 10;
                    }
                    if (v > 100) {
                        v = 100;
                    }
                    this.setVolume(v);
                }
                decreaseVolume() {
                    let v = this.state.volume;
                    if (v > 0) {
                        v -= 10;
                    }
                    if (v < 0) {
                        v = 0;
                    }
                    this.setVolume(v);
                }
                barClick(event) {
                    let e = event || window.event;
                    if (window.event !== null && e.button === 1 || e.button === 0) {
                        let clickX = e.clientX - $(this.progressBar).offset().left;
                        let pbW = $(this.progressBar).width();
                        let volume = 0;
                        if (clickX > 0) {
                            volume = Math.round(clickX / (pbW / 10)) * 10;
                        }
                        if (volume > 100) {
                            volume = 100;
                        }
                        this.setVolume(volume);
                    }
                }
                render() {
                    return (React.createElement("div", {className: "cVolume", style: { display: this.props.display ? "block" : "none" }}, React.createElement("table", null, React.createElement("tbody", null, React.createElement("tr", null, React.createElement("td", {className: "tbBtn"}, React.createElement("button", {type: "button", disabled: this.state.volume === 0, className: this.state.volume > 0 ? "btn btn-xs btn-info" : "btn btn-xs btn-danger", onClick: () => this.decreaseVolume()}, React.createElement("span", {className: this.state.volume > 0 ? "glyphicon glyphicon-volume-down" : "glyphicon glyphicon-volume-off"}))), React.createElement("td", {className: "tbVol"}, React.createElement("div", {ref: (ref) => this.progressBar = ref, className: "progress progressBar", onClick: (e) => this.barClick(e)}, React.createElement("div", {className: "progress-bar progress-bar-success progressBarInner", role: "progressbar", style: { width: this.state.volume + "%" }}, this.state.volume, "%"))), React.createElement("td", {className: "tbBtn"}, React.createElement("button", {type: "button", disabled: this.state.volume === 100, className: this.state.volume < 100 ? "btn btn-xs btn-info" : "btn btn-xs btn-success", onClick: () => this.increaseVolume()}, React.createElement("span", {className: "glyphicon glyphicon-volume-up"}))))))));
                }
            }
            Components.Volume = Volume;
        })(Components = App.Components || (App.Components = {}));
    })(App = VC.App || (VC.App = {}));
})(VC || (VC = {}));
//# sourceMappingURL=Volume.js.map