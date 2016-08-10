/* tslint:disable:max-line-length */

namespace VC.Forms {
    "use strict";

    enum Errors {
        None,
        FormIsEmpty,
        NoInteractiveComponent
    }
    export enum DataType {
        Form,
        Answer,
        Result
    }

    interface IFormBodyProps {
        view: FormViews;
        components: Array<Forms.Components.IComponent>;
    }
    interface IFormBodyState {
        error: Errors;
        components: Array<Forms.Components.IComponent>;
    }

    export class FormBody extends React.Component<IFormBodyProps, IFormBodyState> {
        constructor(props: IFormBodyProps) {
            super(props);
            this.state = { components: props.components, error: Errors.None } as IFormBodyState;
        }

        public addComponent(type: Components.ComponentTypes, configData: string, answerData: string, resultData: string): number {
            let components: Array<Forms.Components.IComponent> = this.state.components;
            let id: number = this.state.components.length + 1;
            components.push({ id: id, type: type, configData: configData, answerData: answerData, resultData: resultData } as Forms.Components.IComponent);
            this.setState({ components: components, error: Errors.None } as IFormBodyState);
            return components.length;
        }
        public removeComponent(id?: number): number {
            let components: Array<Forms.Components.IComponent> = this.state.components;
            if (components.length > 0) {
                if (id === undefined) {
                    // set last component
                    id = components[components.length - 1].id;
                }
                let _components: Array<Forms.Components.IComponent> = [];
                for (let i: number = 0; i < components.length; i++) {
                    if (components[i].id !== id) {
                        _components.push(components[i]);
                    }
                }
                this.setState({ components: _components } as IFormBodyState);
                return _components.length;
            }
            return components.length;
        }

        public validate(): boolean {
            let valid: boolean = true;
            let components: Array<Forms.Components.IComponent> = this.state.components;
            let error: Errors = Errors.None;

            if (components.length === 0) {
                // empty form
                error = Errors.FormIsEmpty;
                valid = false;
            } else {
                let hasInteractiveComponent: boolean = false;
                // validate each component
                for (let i: number = components.length - 1; i >= 0; i--) {
                    if (components[i].ref !== undefined) {
                        let c: Components.IComponentClass = components[i].ref as Components.IComponentClass;
                        if (!c.validate()) {
                            valid = false;
                        }
                    }
                    if (!hasInteractiveComponent) {
                        hasInteractiveComponent = Components.Component.isInteractiveComponent(components[i].type);
                    }
                }
                // check for active component
                if (!hasInteractiveComponent) {
                    error = Errors.NoInteractiveComponent;
                    valid = false;
                }
            }

            if (this.state.error !== error) {
                this.setState({ error: error } as IFormBodyState);
            }

            return valid;
        }

        public getData(dataType: DataType): string {
            let data: Array<Forms.IFormDataComponent> = [];
            let components: Array<Forms.Components.IComponent> = this.state.components;
            for (let i: number = 0; i < components.length; i++) {
                let configData: string = null;
                let answerData: string = null;

                if (dataType === DataType.Form || dataType === DataType.Answer) {
                    configData = (components[i].ref as Components.IComponentClass).getConfigData(); // when type Result, configData will be null
                }
                if (dataType === DataType.Answer || dataType === DataType.Result) {
                    answerData = (components[i].ref as Components.IComponentClass).getAnswerData(); // when type Form, answerData will be null
                }

                data.push({ type: components[i].type, configData: configData, answerData: answerData } as Forms.IFormDataComponent);
            }
            return JSON.stringify(data);
        }

        public updateResult(resultData: string): void {
            let components: Array<Forms.Components.IComponent> = this.state.components;
            let data: Array<Forms.IFormDataComponent> = JSON.parse(resultData);
            for (let i: number = 0; i < components.length; i++) {
                if (data[i] !== undefined && data[i].answerData !== null) {
                    (components[i].ref as Components.IComponentClass).updateResult(data[i].answerData);
                }
            }
        }

        private renderFormError(error: Errors): JSX.Element {
            if (error === Errors.FormIsEmpty) {
                return (
                    <div style={{ paddingBottom: "5px" }}><div className="text-danger"><span className="glyphicon glyphicon-warning-sign"></span> The Form cannot be empty.</div></div>
                );
            } else if (error === Errors.NoInteractiveComponent) {
                return (
                    <div style={{ paddingBottom: "5px" }}><div className="text-danger" style={{ textAlign: "center", paddingBottom: "10px" }}><span className="glyphicon glyphicon-warning-sign"></span> At least one interactive component needed.</div></div>
                );
            } else {
                return (<div></div>);
            }
        }

        private renderComponent(component: Components.IComponent): JSX.Element {
            switch (component.type) {
                case Components.ComponentTypes.Label:
                    return (<div key={"fc_" + component.id} className="fc-label"><Forms.Components.ComponentLabel ref={(ref: Forms.Components.ComponentLabel) => component.ref = ref} view={this.props.view} component={component} /></div>);
                case Components.ComponentTypes.Textbox:
                    return (<div key={"fc_" + component.id} className="fc-textbox"><Forms.Components.ComponentTextbox ref={(ref: Forms.Components.ComponentTextbox) => component.ref = ref} view={this.props.view} component={component} /></div >);
                case Components.ComponentTypes.Radiobuttons:
                    return (<div key={"fc_" + component.id} className="fc-radiobuttons"><Forms.Components.ComponentRadiobuttons ref={(ref: Forms.Components.ComponentRadiobuttons) => component.ref = ref} view={this.props.view} component={component} /></div >);
                case Components.ComponentTypes.Checkboxes:
                    return (<div key={"fc_" + component.id} className="fc-checkboxes"><Forms.Components.ComponentCheckboxes ref={(ref: Forms.Components.ComponentCheckboxes) => component.ref = ref} view={this.props.view} component={component} /></div >);
            }
            return;
        }

        render(): JSX.Element {
            return (
                <div className="FormBody">
                    {this.state.components.map((component: Components.IComponent) => {
                        return this.renderComponent(component);
                    }) }

                    {this.renderFormError(this.state.error) }
                </div>
                );
        }
    }
}