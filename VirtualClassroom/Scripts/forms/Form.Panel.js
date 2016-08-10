/* tslint:disable:max-line-length */
var VC;
(function (VC) {
    var Forms;
    (function (Forms) {
        "use strict";
        class FormPanel extends React.Component {
            constructor(props) {
                super(props);
                this.state = { componentCount: 0 };
            }
            componentCount(cnt) {
                this.setState({ componentCount: cnt });
            }
            showComponentButton(componentType) {
                if (this.props.type === Forms.FormType.Survey && Forms.Components.Component.isSurveyComponent(componentType)) {
                    return true;
                }
                else if (this.props.type === Forms.FormType.Poll && Forms.Components.Component.isPoolComponent(componentType)) {
                    return true;
                }
                else {
                    return false;
                }
            }
            renderComponentButton(title, componentType) {
                return (React.createElement("div", {className: "panelButton", style: { display: (this.showComponentButton(componentType) ? "block" : "none") }}, React.createElement("button", {type: "button", onClick: () => this.props.onAddComponent(componentType), className: "btn btn-sm btn-info"}, React.createElement("span", {className: "glyphicon glyphicon-plus"}), " ", title)));
            }
            render() {
                if (this.props.show && this.props.type !== undefined) {
                    return (React.createElement("div", {className: "FormPanel"}, React.createElement("table", null, React.createElement("tbody", null, React.createElement("tr", null, React.createElement("td", null, this.renderComponentButton("Label", Forms.Components.ComponentTypes.Label), this.renderComponentButton("Textbox", Forms.Components.ComponentTypes.Textbox), this.renderComponentButton("Radio buttons", Forms.Components.ComponentTypes.Radiobuttons), this.renderComponentButton("Check boxes", Forms.Components.ComponentTypes.Checkboxes), React.createElement("div", {className: "panelButton", style: { display: this.state.componentCount > 0 ? "block" : "none" }}, React.createElement("button", {type: "button", onClick: () => this.props.onRemoveComponent(), className: "btn btn-sm btn-danger"}, React.createElement("span", {className: "glyphicon glyphicon-minus"}), " Remove"))))))));
                }
                else {
                    return (React.createElement("div", null));
                }
            }
        }
        Forms.FormPanel = FormPanel;
    })(Forms = VC.Forms || (VC.Forms = {}));
})(VC || (VC = {}));
//# sourceMappingURL=Form.Panel.js.map