/* tslint:disable:max-line-length */
var VC;
(function (VC) {
    var Forms;
    (function (Forms) {
        "use strict";
        (function (ComponentTypes) {
            ComponentTypes[ComponentTypes["Label"] = 1] = "Label";
            ComponentTypes[ComponentTypes["Textbox"] = 2] = "Textbox";
            ComponentTypes[ComponentTypes["Radiobuttons"] = 3] = "Radiobuttons";
            ComponentTypes[ComponentTypes["Checkboxes"] = 4] = "Checkboxes";
        })(Forms.ComponentTypes || (Forms.ComponentTypes = {}));
        var ComponentTypes = Forms.ComponentTypes;
        (function (Views) {
            Views[Views["Edit"] = 0] = "Edit";
            Views[Views["View"] = 1] = "View";
            Views[Views["Answer"] = 2] = "Answer";
        })(Forms.Views || (Forms.Views = {}));
        var Views = Forms.Views;
        class Survey extends React.Component {
            constructor(props) {
                super(props);
                this.state = { view: props.view, components: props.components };
            }
            componentDidMount() {
                this.load();
            }
            load() {
                // load
                if (this.props.components !== undefined) {
                    // template
                    this.setState({ components: this.props.components });
                }
                else if (this.props.answerUid !== undefined) {
                }
                else if (this.props.surveyUid !== undefined) {
                }
            }
            addComponent(type) {
                let countOfComponents = this.form.addComponent(type);
                this.formPanel.componentCount(countOfComponents);
            }
            removeComponent(id) {
                let countOfComponents = this.form.removeComponent(id);
                this.formPanel.componentCount(countOfComponents);
            }
            changeView(view) {
                // save
                this.setState({ view: view });
            }
            validate() {
                return this.form.validate();
            }
            renderLoading() {
                return (React.createElement("div", {className: "Surveys"}, React.createElement("div", {className: "text-warning"}, "Loading...")));
            }
            renderForm() {
                return (React.createElement("div", {className: "Surveys"}, React.createElement(Forms.Form, {ref: (ref) => this.form = ref, components: this.state.components, view: this.state.view}), React.createElement(Forms.FormPanel, {ref: (ref) => this.formPanel = ref, show: this.state.view === Views.Edit, onAddComponent: (type) => this.addComponent(type), onRemoveComponent: (id) => this.removeComponent(id)}), React.createElement("div", {style: { paddingTop: "10px" }}, React.createElement("button", {type: "button", onClick: () => this.changeView(Views.Edit), className: "btn btn-sm btn-default"}, "Edit"), " ", React.createElement("button", {type: "button", onClick: () => this.changeView(Views.View), className: "btn btn-sm btn-default"}, "View"), " ", React.createElement("button", {type: "button", onClick: () => this.changeView(Views.Answer), className: "btn btn-sm btn-default"}, "Answer")), React.createElement("div", {style: { paddingTop: "10px" }}, React.createElement("button", {type: "button", onClick: () => this.validate(), className: "btn btn-sm btn-warning"}, "Validate"))));
            }
            render() {
                if (this.state.components === undefined) {
                    return this.renderLoading();
                }
                else {
                    return this.renderForm();
                }
            }
        }
        Forms.Survey = Survey;
        class InitSurvey {
            constructor(targetId, actionUrl) {
                ReactDOM.render(React.createElement("div", null, React.createElement(Survey, {view: Views.Edit})), document.getElementById(targetId));
            }
        }
        Forms.InitSurvey = InitSurvey;
    })(Forms = VC.Forms || (VC.Forms = {}));
})(VC || (VC = {}));
//# sourceMappingURL=Survey.js.map