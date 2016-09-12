/* tslint:disable:max-line-length */
var VC;
(function (VC) {
    var Forms;
    (function (Forms) {
        var Components;
        (function (Components) {
            "use strict";
            (function (ComponentTypes) {
                ComponentTypes[ComponentTypes["Label"] = 1] = "Label";
                ComponentTypes[ComponentTypes["Textbox"] = 2] = "Textbox";
                ComponentTypes[ComponentTypes["Radiobuttons"] = 3] = "Radiobuttons";
                ComponentTypes[ComponentTypes["Checkboxes"] = 4] = "Checkboxes";
            })(Components.ComponentTypes || (Components.ComponentTypes = {}));
            var ComponentTypes = Components.ComponentTypes;
            class ComponentConsts {
            }
            ComponentConsts.InteractiveComponents = [
                ComponentTypes.Textbox,
                ComponentTypes.Radiobuttons,
                ComponentTypes.Checkboxes
            ];
            ComponentConsts.SurveyComponents = [
                ComponentTypes.Label,
                ComponentTypes.Textbox,
                ComponentTypes.Radiobuttons,
                ComponentTypes.Checkboxes
            ];
            ComponentConsts.PollComponents = [
                ComponentTypes.Label,
                ComponentTypes.Radiobuttons,
                ComponentTypes.Checkboxes
            ];
            class Component extends React.Component {
                constructor(props) {
                    super(props);
                    this.state = { configData: props.component.configData, answerData: props.component.answerData, resultData: props.component.resultData };
                }
                static isInteractiveComponent(componentType) {
                    return ($.inArray(componentType, ComponentConsts.InteractiveComponents) > -1);
                }
                static isSurveyComponent(componentType) {
                    return ($.inArray(componentType, ComponentConsts.SurveyComponents) > -1);
                }
                static isPoolComponent(componentType) {
                    return ($.inArray(componentType, ComponentConsts.PollComponents) > -1);
                }
                config() {
                    let config;
                    if (this.state.configData === null) {
                        config = this.defaultConfig();
                    }
                    else {
                        config = JSON.parse(this.state.configData);
                    }
                    return config;
                }
                answer() {
                    let answer;
                    if (this.state.answerData === null) {
                        answer = this.defaultAnswer();
                    }
                    else {
                        answer = JSON.parse(this.state.answerData);
                    }
                    return answer;
                }
                result() {
                    let result = null;
                    if (this.state.resultData !== null) {
                        result = JSON.parse(this.state.resultData);
                    }
                    return result;
                }
                getConfigData() {
                    return JSON.stringify(this.config());
                }
                getAnswerData() {
                    return JSON.stringify(this.answer());
                }
                updateResult(resultData) {
                    let currentResultData = this.result();
                    if (currentResultData != null) {
                        let rData = JSON.parse(resultData);
                        currentResultData = this.updateResultData(currentResultData, rData);
                    }
                    // save to state
                    this.state.resultData = JSON.stringify(currentResultData);
                }
                saveConfig(config, propagate) {
                    if (propagate === true) {
                        this.setState({ configData: JSON.stringify(config) });
                    }
                    else {
                        this.state.configData = JSON.stringify(config);
                    }
                }
                saveAnswer(answer, propagate) {
                    if (propagate === true) {
                        this.setState({ answerData: JSON.stringify(answer) });
                    }
                    else {
                        this.state.answerData = JSON.stringify(answer);
                    }
                }
                render() {
                    if (this.props.view === Forms.FormViews.Edit) {
                        // edit
                        return this.renderEdit();
                    }
                    else if (this.props.view === Forms.FormViews.Preview) {
                        // preview
                        return this.renderPreview();
                    }
                    else if (this.props.view === Forms.FormViews.View) {
                        // view
                        return this.renderView();
                    }
                    else if (this.props.view === Forms.FormViews.Answer) {
                        // answer
                        return this.renderAnswer();
                    }
                    else {
                        // result
                        return this.renderResult();
                    }
                }
            }
            Components.Component = Component;
        })(Components = Forms.Components || (Forms.Components = {}));
    })(Forms = VC.Forms || (VC.Forms = {}));
})(VC || (VC = {}));
//# sourceMappingURL=Component.js.map