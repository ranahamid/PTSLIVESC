/* tslint:disable:max-line-length */
var App;
(function (App) {
    var Surveys;
    (function (Surveys) {
        "use strict";
        class ComponentLabel extends Surveys.Component {
            defaultConfig() {
                return { text: "" };
            }
            defaultAnswer() {
                // pasive component, nothing to implement
            }
            // config
            onTextChanged(e) {
                let config = { text: e.target.value };
                this.saveConfig(config);
            }
            renderEdit() {
                return (React.createElement("div", {key: "edit_" + this.props.component.id}, React.createElement("textarea", {className: "form-control", onChange: (e) => this.onTextChanged(event)}, this.config().text)));
            }
            renderView() {
                return (React.createElement("div", {key: "view_" + this.props.component.id}, this.config().text));
            }
            renderAnswer() {
                // pasive component, same as view
                return this.renderView();
            }
        }
        Surveys.ComponentLabel = ComponentLabel;
    })(Surveys = App.Surveys || (App.Surveys = {}));
})(App || (App = {}));
//# sourceMappingURL=Component.Label.js.map