var VC;
(function (VC) {
    var App;
    (function (App) {
        var Components;
        (function (Components) {
            "use strict";
            (function (StatusStyle) {
                StatusStyle[StatusStyle["Connecting"] = 0] = "Connecting";
                StatusStyle[StatusStyle["Connected"] = 1] = "Connected";
                StatusStyle[StatusStyle["Error"] = 2] = "Error";
            })(Components.StatusStyle || (Components.StatusStyle = {}));
            var StatusStyle = Components.StatusStyle;
            class Status extends React.Component {
                constructor(props) {
                    super(props);
                    this.state = { text: props.text, style: props.style };
                }
                setText(text, style) {
                    this.setState({ text: text, style: style });
                }
                getIconByStyle(style) {
                    let icon = "";
                    switch (style) {
                        case StatusStyle.Connecting:
                            icon = "glyphicon glyphicon-transfer";
                            break;
                        case StatusStyle.Connected:
                            icon = "glyphicon glyphicon-link";
                            break;
                        case StatusStyle.Error:
                            icon = "glyphicon glyphicon-warning-sign";
                            break;
                    }
                    return icon;
                }
                render() {
                    let className = this.props.statusClasses[this.state.style];
                    let text = this.state.text;
                    let icon = this.getIconByStyle(this.state.style);
                    if (icon !== "") {
                        text = " " + text;
                    }
                    return (React.createElement("div", {className: this.props.className}, React.createElement("div", {className: className}, React.createElement("span", {className: icon}), text)));
                }
            }
            Components.Status = Status;
        })(Components = App.Components || (App.Components = {}));
    })(App = VC.App || (VC.App = {}));
})(VC || (VC = {}));
//# sourceMappingURL=Status.js.map