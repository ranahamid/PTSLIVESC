var VC;
(function (VC) {
    var Forms;
    (function (Forms) {
        var Components;
        (function (Components) {
            "use strict";
            class ComponentLabel extends Components.Component {
                constructor(...args) {
                    super(...args);
                    this.autoValidate = false;
                }
                defaultConfig() {
                    return { text: "" };
                }
                defaultAnswer() {
                    return null;
                }
                onTextChanged(e) {
                    let config = { text: e.target.value };
                    this.saveConfig(config);
                    if (this.autoValidate) {
                        this.validate();
                    }
                }
                validate() {
                    let valid = true;
                    if (this.props.view === Forms.FormViews.Edit) {
                        let text = this.config().text;
                        valid = text.trim().length > 0;
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
                    return (React.createElement("div", {ref: (ref) => this.div = ref, key: "edit_" + this.props.component.id, className: "form-group"}, React.createElement("textarea", {ref: (ref) => this.tb = ref, className: "form-control lbl", onChange: (e) => this.onTextChanged(e), placeholder: "Enter text"}, this.config().text)));
                }
                renderPreview() {
                    return this.renderView();
                }
                renderView() {
                    return (React.createElement("div", {key: "view_" + this.props.component.id, className: "form-group lbl"}, this.config().text));
                }
                renderAnswer() {
                    return this.renderView();
                }
                renderResult() {
                    return this.renderView();
                }
            }
            Components.ComponentLabel = ComponentLabel;
        })(Components = Forms.Components || (Forms.Components = {}));
    })(Forms = VC.Forms || (VC.Forms = {}));
})(VC || (VC = {}));
//# sourceMappingURL=Component.Label.js.map