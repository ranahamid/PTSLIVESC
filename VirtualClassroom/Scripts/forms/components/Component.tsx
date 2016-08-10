/* tslint:disable:max-line-length */

namespace VC.Forms.Components {
    "use strict";

    export enum ComponentTypes {
        Label = 1,
        Textbox = 2,
        Radiobuttons = 3,
        Checkboxes = 4
    }

    class ComponentConsts {
        public static InteractiveComponents: Array<ComponentTypes> = [
            ComponentTypes.Textbox,
            ComponentTypes.Radiobuttons,
            ComponentTypes.Checkboxes
        ];

        public static SurveyComponents: Array<ComponentTypes> = [
            ComponentTypes.Label,
            ComponentTypes.Textbox,
            ComponentTypes.Radiobuttons,
            ComponentTypes.Checkboxes
        ];

        public static PollComponents: Array<ComponentTypes> = [
            ComponentTypes.Label,
            ComponentTypes.Radiobuttons,
            ComponentTypes.Checkboxes
        ];
    }

    export interface IComponent {
        id: number;
        type: ComponentTypes;
        configData: string;
        answerData: string;
        resultData: string;
        ref?: any;
    }

    export interface IComponentProps {
        view: FormViews;
        component: IComponent;
    }
    export interface IComponentState {
        configData: string;
        answerData: string;
        resultData: string;
    }

    export interface IComponentClass {
        validate(): boolean;
        getConfigData(): string;
        getAnswerData(): string;
        updateResult(resultData: string): void;
    }

    export abstract class Component<C, A> extends React.Component<IComponentProps, IComponentState> implements IComponentClass {

        constructor(props: IComponentProps) {
            super(props);
            this.state = { configData: props.component.configData, answerData: props.component.answerData, resultData: props.component.resultData } as IComponentState;
        }

        public static isInteractiveComponent(componentType: ComponentTypes): boolean {
            return ($.inArray(componentType, ComponentConsts.InteractiveComponents) > -1);
        }
        public static isSurveyComponent(componentType: ComponentTypes): boolean {
            return ($.inArray(componentType, ComponentConsts.SurveyComponents) > -1);
        }
        public static isPoolComponent(componentType: ComponentTypes): boolean {
            return ($.inArray(componentType, ComponentConsts.PollComponents) > -1);
        }

        public config(): C {
            let config: C;
            if (this.state.configData === null) {
                config = this.defaultConfig();
            } else {
                config = JSON.parse(this.state.configData) as C;
            }
            return config;
        }
        public answer(): A {
            let answer: A;
            if (this.state.answerData === null) {
                answer = this.defaultAnswer();
            } else {
                answer = JSON.parse(this.state.answerData) as A;
            }
            return answer;
        }
        public result(): Array<number> {
            let result: Array<number> = null;
            if (this.state.resultData !== null) {
                result = JSON.parse(this.state.resultData) as Array<number>;
            }
            return result;
        }

        public getConfigData(): string {
            return JSON.stringify(this.config());
        }
        public getAnswerData(): string {
            return JSON.stringify(this.answer());
        }

        public updateResult(resultData: string): void {
            let currentResultData: Array<number> = this.result();
            if (currentResultData != null) {
                let rData: A = JSON.parse(resultData) as A;
                currentResultData = this.updateResultData(currentResultData, rData);
            }
            // save to state
            this.state.resultData = JSON.stringify(currentResultData);
        }

        public saveConfig(config: C, propagate?: boolean): void {
            if (propagate === true) {
                this.setState({ configData: JSON.stringify(config) } as IComponentState);
            } else {
                this.state.configData = JSON.stringify(config);
            }
        }
        public saveAnswer(answer: A, propagate?: boolean): void {
            if (propagate === true) {
                this.setState({ answerData: JSON.stringify(answer) } as IComponentState);
            } else {
                this.state.answerData = JSON.stringify(answer);
            }
        }

        abstract defaultConfig(): C;
        abstract defaultAnswer(): A;

        abstract validate(): boolean;

        abstract updateResultData(result: Array<number>, resultData: A): Array<number>;

        abstract renderEdit(): JSX.Element;
        abstract renderPreview(): JSX.Element;
        abstract renderView(): JSX.Element;
        abstract renderAnswer(): JSX.Element;
        abstract renderResult(): JSX.Element;

        render(): JSX.Element {
            if (this.props.view === FormViews.Edit) {
                // edit
                return this.renderEdit();
            } else if (this.props.view === FormViews.Preview) {
                // preview
                return this.renderPreview();
            } else if (this.props.view === FormViews.View) {
                // view
                return this.renderView();
            } else if (this.props.view === FormViews.Answer) {
                // answer
                return this.renderAnswer();
            } else {
                // result
                return this.renderResult();
            }
        }
    }
}