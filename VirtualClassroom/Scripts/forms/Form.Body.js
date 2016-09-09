var VC;
(function (VC) {
    var Forms;
    (function (Forms) {
        "use strict";
        var Errors;
        (function (Errors) {
            Errors[Errors["None"] = 0] = "None";
            Errors[Errors["FormIsEmpty"] = 1] = "FormIsEmpty";
            Errors[Errors["NoInteractiveComponent"] = 2] = "NoInteractiveComponent";
        })(Errors || (Errors = {}));
        (function (DataType) {
            DataType[DataType["Form"] = 0] = "Form";
            DataType[DataType["Answer"] = 1] = "Answer";
            DataType[DataType["Result"] = 2] = "Result";
        })(Forms.DataType || (Forms.DataType = {}));
        var DataType = Forms.DataType;
        class FormBody extends React.Component {
            constructor(props) {
                super(props);
                this.state = { components: props.components, error: Errors.None };
            }
            addComponent(type, configData, answerData, resultData) {
                let components = this.state.components;
                let id = this.state.components.length + 1;
                components.push({ id: id, type: type, configData: configData, answerData: answerData, resultData: resultData });
                this.setState({ components: components, error: Errors.None });
                return components.length;
            }
            removeComponent(id) {
                let components = this.state.components;
                if (components.length > 0) {
                    if (id === undefined) {
                        id = components[components.length - 1].id;
                    }
                    let _components = [];
                    for (let i = 0; i < components.length; i++) {
                        if (components[i].id !== id) {
                            _components.push(components[i]);
                        }
                    }
                    this.setState({ components: _components });
                    return _components.length;
                }
                return components.length;
            }
            validate() {
                let valid = true;
                let components = this.state.components;
                let error = Errors.None;
                if (components.length === 0) {
                    error = Errors.FormIsEmpty;
                    valid = false;
                }
                else {
                    let hasInteractiveComponent = false;
                    for (let i = components.length - 1; i >= 0; i--) {
                        if (components[i].ref !== undefined) {
                            let c = components[i].ref;
                            if (!c.validate()) {
                                valid = false;
                            }
                        }
                        if (!hasInteractiveComponent) {
                            hasInteractiveComponent = Forms.Components.Component.isInteractiveComponent(components[i].type);
                        }
                    }
                    if (!hasInteractiveComponent) {
                        error = Errors.NoInteractiveComponent;
                        valid = false;
                    }
                }
                if (this.state.error !== error) {
                    this.setState({ error: error });
                }
                return valid;
            }
            getData(dataType) {
                let data = [];
                let components = this.state.components;
                for (let i = 0; i < components.length; i++) {
                    let configData = null;
                    let answerData = null;
                    if (dataType === DataType.Form || dataType === DataType.Answer) {
                        configData = components[i].ref.getConfigData();
                    }
                    if (dataType === DataType.Answer || dataType === DataType.Result) {
                        answerData = components[i].ref.getAnswerData();
                    }
                    data.push({ type: components[i].type, configData: configData, answerData: answerData });
                }
                return JSON.stringify(data);
            }
            updateResult(resultData) {
                let components = this.state.components;
                let data = JSON.parse(resultData);
                for (let i = 0; i < components.length; i++) {
                    if (data[i] !== undefined && data[i].answerData !== null) {
                        components[i].ref.updateResult(data[i].answerData);
                    }
                }
            }
            renderFormError(error) {
                if (error === Errors.FormIsEmpty) {
                    return (React.createElement("div", {style: { paddingBottom: "5px" }}, React.createElement("div", {className: "text-danger"}, React.createElement("span", {className: "glyphicon glyphicon-warning-sign"}), " The Form cannot be empty.")));
                }
                else if (error === Errors.NoInteractiveComponent) {
                    return (React.createElement("div", {style: { paddingBottom: "5px" }}, React.createElement("div", {className: "text-danger", style: { textAlign: "center", paddingBottom: "10px" }}, React.createElement("span", {className: "glyphicon glyphicon-warning-sign"}), " At least one interactive component needed.")));
                }
                else {
                    return (React.createElement("div", null));
                }
            }
            renderComponent(component) {
                switch (component.type) {
                    case Forms.Components.ComponentTypes.Label:
                        return (React.createElement("div", {key: "fc_" + component.id, className: "fc-label"}, React.createElement(Forms.Components.ComponentLabel, {ref: (ref) => component.ref = ref, view: this.props.view, component: component})));
                    case Forms.Components.ComponentTypes.Textbox:
                        return (React.createElement("div", {key: "fc_" + component.id, className: "fc-textbox"}, React.createElement(Forms.Components.ComponentTextbox, {ref: (ref) => component.ref = ref, view: this.props.view, component: component})));
                    case Forms.Components.ComponentTypes.Radiobuttons:
                        return (React.createElement("div", {key: "fc_" + component.id, className: "fc-radiobuttons"}, React.createElement(Forms.Components.ComponentRadiobuttons, {ref: (ref) => component.ref = ref, view: this.props.view, component: component})));
                    case Forms.Components.ComponentTypes.Checkboxes:
                        return (React.createElement("div", {key: "fc_" + component.id, className: "fc-checkboxes"}, React.createElement(Forms.Components.ComponentCheckboxes, {ref: (ref) => component.ref = ref, view: this.props.view, component: component})));
                }
                return;
            }
            render() {
                return (React.createElement("div", {className: "FormBody"}, this.state.components.map((component) => {
                    return this.renderComponent(component);
                }), this.renderFormError(this.state.error)));
            }
        }
        Forms.FormBody = FormBody;
    })(Forms = VC.Forms || (VC.Forms = {}));
})(VC || (VC = {}));
//# sourceMappingURL=Form.Body.js.map