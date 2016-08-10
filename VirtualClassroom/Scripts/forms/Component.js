/* tslint:disable:max-line-length */
var App;
(function (App) {
    var Surveys;
    (function (Surveys) {
        "use strict";
        class Component extends React.Component {
            constructor(props) {
                super(props);
                this.state = { configData: props.component.configData, answerData: props.component.answerData };
            }
            /*
            componentWillUpdate(prevProps: IComponentProps, prevState: IComponentState): void {
                if (this.props.view === Views.Edit) {
                    this.updateConfig();
                }
                if (this.props.view === Views.View) {
                    this.updateAnswer();
                }
            }
    
            componentDidMount(): void {
                this.showData();
            }
            componentDidUpdate(prevProps: IComponentProps, prevState: IComponentState): void {
                this.showData();
            }
            */
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
                if (this.props.view === Surveys.Views.Edit) {
                    // edit
                    return this.renderEdit();
                }
                else if (this.props.view === Surveys.Views.View) {
                    // view
                    return this.renderView();
                }
                else {
                    // answer
                    return this.renderAnswer();
                }
            }
        }
        Surveys.Component = Component;
    })(Surveys = App.Surveys || (App.Surveys = {}));
})(App || (App = {}));
//# sourceMappingURL=Component.js.map