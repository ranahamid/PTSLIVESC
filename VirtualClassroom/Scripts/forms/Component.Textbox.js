/* tslint:disable:max-line-length */
var App;
(function (App) {
    var Surveys;
    (function (Surveys) {
        "use strict";
        class ComponentTextbox extends Surveys.Component {
            defaultConfig() {
                return { required: false };
            }
            defaultAnswer() {
                return { text: "" };
            }
            // config
            onRequiredChanged(e) {
                let config = { required: e.target.checked };
                this.saveConfig(config);
            }
            // answer
            onTextChanged(e) {
                let answer = { text: e.target.value };
                this.saveAnswer(answer);
            }
            renderEdit() {
                return (React.createElement("div", {key: "edit_" + this.props.component.id}, React.createElement("textarea", {className: "form-control", disabled: true, readOnly: true}, "...."), React.createElement("div", null, React.createElement("label", null, React.createElement("input", {type: "checkbox", defaultChecked: this.config().required, onChange: (e) => this.onRequiredChanged(e)}), " required"))));
            }
            renderView() {
                return (React.createElement("div", {key: "view_" + this.props.component.id}, React.createElement("textarea", {className: "form-control", onChange: (e) => this.onTextChanged(e)}, this.answer().text)));
            }
            renderAnswer() {
                return (React.createElement("div", null, this.answer().text));
            }
        }
        Surveys.ComponentTextbox = ComponentTextbox;
    })(Surveys = App.Surveys || (App.Surveys = {}));
})(App || (App = {}));
//# sourceMappingURL=Component.Textbox.js.map