/* tslint:disable:max-line-length */
var VC;
(function (VC) {
    var App;
    (function (App) {
        var Components;
        (function (Components) {
            "use strict";
            (function (SwitchButtonStatus) {
                SwitchButtonStatus[SwitchButtonStatus["Start"] = 0] = "Start";
                SwitchButtonStatus[SwitchButtonStatus["Stop"] = 1] = "Stop";
                SwitchButtonStatus[SwitchButtonStatus["Hidden"] = 2] = "Hidden";
            })(Components.SwitchButtonStatus || (Components.SwitchButtonStatus = {}));
            var SwitchButtonStatus = Components.SwitchButtonStatus;
            class SwitchButton extends React.Component {
                constructor(props) {
                    super(props);
                    this.state = { status: props.status };
                }
                getButtonValue(status) {
                    let btnValue = "";
                    switch (status) {
                        case SwitchButtonStatus.Start:
                            btnValue = this.props.textOn;
                            break;
                        case SwitchButtonStatus.Stop:
                            btnValue = this.props.textOff;
                            break;
                    }
                    return btnValue;
                }
                getButtonClassName(status) {
                    let btnClassName = "";
                    switch (status) {
                        case SwitchButtonStatus.Start:
                            btnClassName = this.props.classOn;
                            break;
                        case SwitchButtonStatus.Stop:
                            btnClassName = this.props.classOff;
                            break;
                    }
                    return btnClassName;
                }
                getIconClassName(status) {
                    let iconClassName = "";
                    switch (status) {
                        case SwitchButtonStatus.Start:
                            iconClassName = this.props.iconOn;
                            break;
                        case SwitchButtonStatus.Stop:
                            iconClassName = this.props.iconOff;
                            break;
                    }
                    return iconClassName;
                }
                onClick() {
                    if (!this.button.disabled) {
                        if (this.props.delayed !== undefined) {
                            this.button.disabled = true;
                            window.setTimeout(() => { this.performClick(); }, this.props.delayed);
                        }
                        else {
                            this.performClick();
                        }
                    }
                }
                performClick() {
                    if (this.state.status === SwitchButtonStatus.Start) {
                        this.setState({ status: SwitchButtonStatus.Stop }, this.props.onOn);
                    }
                    else if (this.state.status === SwitchButtonStatus.Stop) {
                        this.setState({ status: SwitchButtonStatus.Start }, this.props.onOff);
                    }
                    this.button.disabled = false;
                }
                setStatus(status) {
                    this.setState({ status: status });
                }
                getStatus() {
                    return this.state.status;
                }
                render() {
                    let btnValue = this.getButtonValue(this.state.status);
                    let btnClassName = this.getButtonClassName(this.state.status);
                    let iconClassName = this.getIconClassName(this.state.status);
                    if (iconClassName !== "" && btnValue !== "") {
                        btnValue = " " + btnValue;
                    }
                    return (React.createElement("div", {style: { display: (this.state.status === SwitchButtonStatus.Hidden ? "none" : "block") }, className: this.props.className}, React.createElement("button", {ref: (ref) => this.button = ref, type: "button", className: btnClassName, onClick: () => this.onClick()}, React.createElement("span", {className: iconClassName}), btnValue)));
                }
            }
            Components.SwitchButton = SwitchButton;
        })(Components = App.Components || (App.Components = {}));
    })(App = VC.App || (VC.App = {}));
})(VC || (VC = {}));
//# sourceMappingURL=SwitchButton.js.map