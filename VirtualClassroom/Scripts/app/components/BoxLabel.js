/* tslint:disable:max-line-length */
var VC;
(function (VC) {
    var App;
    (function (App) {
        var Components;
        (function (Components) {
            "use strict";
            (function (BoxLabelStyle) {
                BoxLabelStyle[BoxLabelStyle["NotConnected"] = 0] = "NotConnected";
                BoxLabelStyle[BoxLabelStyle["Connected"] = 1] = "Connected";
                BoxLabelStyle[BoxLabelStyle["HandRaised"] = 2] = "HandRaised";
                BoxLabelStyle[BoxLabelStyle["NoIcon"] = 3] = "NoIcon";
            })(Components.BoxLabelStyle || (Components.BoxLabelStyle = {}));
            var BoxLabelStyle = Components.BoxLabelStyle;
            class BoxLabel extends React.Component {
                constructor(props) {
                    super(props);
                    this.state = { text: props.text, style: props.style, visible: props.visible };
                }
                setText(text, style) {
                    this.setState({ text: text, style: style });
                }
                setStyle(style) {
                    this.setState({ text: this.state.text, style: style });
                }
                setVisibility(visible) {
                    if (visible) {
                        if (this.div.style.display === "none") {
                            this.div.style.display = "block";
                            this.state.visible = true;
                        }
                    }
                    else {
                        if (this.div.style.display === "block") {
                            this.div.style.display = "none";
                            this.state.visible = false;
                        }
                    }
                }
                getIconByStyle(style) {
                    let icon = "";
                    switch (style) {
                        case BoxLabelStyle.Connected:
                            icon = "glyphicon glyphicon-link";
                            break;
                        case BoxLabelStyle.NotConnected:
                            icon = "glyphicon glyphicon-exclamation-sign";
                            break;
                        case BoxLabelStyle.HandRaised:
                            icon = "glyphicon glyphicon-hand-up";
                            break;
                        case BoxLabelStyle.NoIcon:
                            icon = "";
                            break;
                    }
                    return icon;
                }
                getParentDiv() {
                    return this.div;
                }
                render() {
                    let className = this.props.labelClasses[this.state.style];
                    let text = this.state.text;
                    let icon = this.getIconByStyle(this.state.style);
                    if (icon !== "") {
                        text = " " + text;
                    }
                    return (React.createElement("div", {className: this.props.className, ref: (ref) => this.div = ref, style: { display: (this.state.visible ? "block" : "none") }}, React.createElement("div", {className: className}, React.createElement("span", {className: icon}), text)));
                }
            }
            Components.BoxLabel = BoxLabel;
        })(Components = App.Components || (App.Components = {}));
    })(App = VC.App || (VC.App = {}));
})(VC || (VC = {}));
//# sourceMappingURL=BoxLabel.js.map