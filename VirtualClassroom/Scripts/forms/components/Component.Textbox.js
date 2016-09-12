/* tslint:disable:max-line-length */
var VC;
(function (VC) {
    var Forms;
    (function (Forms) {
        var Components;
        (function (Components) {
            "use strict";
            class ComponentTextbox extends Components.Component {
                constructor(...args) {
                    super(...args);
                    this.autoValidate = false;
                }
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
                    if (this.autoValidate) {
                        this.validate();
                    }
                }
                validate() {
                    let valid = true;
                    if (this.props.view === Forms.FormViews.View) {
                        if (this.config().required) {
                            let text = this.answer().text;
                            valid = text.trim().length > 0;
                        }
                        this.setValidationStatus(valid);
                        if (!valid) {
                            this.autoValidate = true;
                        }
                    }
                    return valid;
                }
                setValidationStatus(valid) {
                    let tooltip = "This field cannot be empty.";
                    if (valid) {
                        this.div.className = "form-group has-success";
                        $(this.tb).removeAttr("data-toggle");
                        $(this.tb).removeAttr("data-placement");
                        $(this.tb).removeAttr("title");
                        $(this.tb).tooltip("destroy");
                    }
                    else {
                        this.div.className = "form-group has-error";
                        $(this.tb).attr("data-toggle", "tooltip");
                        $(this.tb).attr("data-placement", "bottom");
                        $(this.tb).attr("title", tooltip);
                        $(this.tb).tooltip();
                    }
                }
                updateResultData(result, resultData) {
                    return null;
                }
                renderEdit() {
                    return (React.createElement("div", {key: "edit_" + this.props.component.id, className: "form-group"}, React.createElement("textarea", {className: "form-control", disabled: true, readOnly: true, placeholder: "Text input"}), React.createElement("div", null, React.createElement("label", {className: "required"}, React.createElement("input", {type: "checkbox", defaultChecked: this.config().required, onChange: (e) => this.onRequiredChanged(e)}), " required"))));
                }
                renderPreview() {
                    return (React.createElement("div", {key: "preview_" + this.props.component.id, className: "form-group"}, React.createElement("textarea", {className: "form-control", disabled: true, readOnly: true, placeholder: "Text input"})));
                }
                renderView() {
                    return (React.createElement("div", {ref: (ref) => this.div = ref, key: "view_" + this.props.component.id, className: "form-group"}, React.createElement("textarea", {ref: (ref) => this.tb = ref, className: "form-control", onChange: (e) => this.onTextChanged(e), placeholder: "Enter text"}, this.answer().text)));
                }
                renderAnswer() {
                    return (React.createElement("div", {className: "form-group"}, this.answer().text));
                }
                renderResult() {
                    // same as preview
                    return this.renderPreview();
                }
            }
            Components.ComponentTextbox = ComponentTextbox;
        })(Components = Forms.Components || (Forms.Components = {}));
    })(Forms = VC.Forms || (VC.Forms = {}));
})(VC || (VC = {}));
//# sourceMappingURL=Component.Textbox.js.map