/* tslint:disable:max-line-length */

namespace VC.Forms {
    "use strict";

    interface IFormPanelProps {
        type?: FormType;
        onAddComponent: (type: Components.ComponentTypes) => void;
        onRemoveComponent: (id?: number) => void;
        show: boolean;
    }
    interface IFormPanelState {
        componentCount: number;
    }

    export class FormPanel extends React.Component<IFormPanelProps, IFormPanelState> {
        constructor(props: IFormPanelProps) {
            super(props);
            this.state = { componentCount: 0 } as IFormPanelState;
        }

        public componentCount(cnt: number): void {
            this.setState({ componentCount: cnt } as IFormPanelState);
        }

        private showComponentButton(componentType: Components.ComponentTypes): boolean {
            if (this.props.type === FormType.Survey && Components.Component.isSurveyComponent(componentType)) {
                return true;
            } else if (this.props.type === FormType.Poll && Components.Component.isPoolComponent(componentType)) {
                return true;
            } else {
                return false;
            }
        }

        renderComponentButton(title: string, componentType: Components.ComponentTypes): JSX.Element {
            return (
                <div className="panelButton" style={{ display: (this.showComponentButton(componentType) ? "block" : "none") }}><button type="button" onClick={() => this.props.onAddComponent(componentType) } className="btn btn-sm btn-info"><span className="glyphicon glyphicon-plus"></span> {title}</button></div>
            );
        }

        render(): JSX.Element {
            if (this.props.show && this.props.type !== undefined) {
                return (
                    <div className="FormPanel">
                        <table>
                            <tbody>
                                <tr>
                                    <td>
                                        {this.renderComponentButton("Label", Components.ComponentTypes.Label) }
                                        {this.renderComponentButton("Textbox", Components.ComponentTypes.Textbox) }
                                        {this.renderComponentButton("Radio buttons", Components.ComponentTypes.Radiobuttons) }
                                        {this.renderComponentButton("Check boxes", Components.ComponentTypes.Checkboxes) }
                                        <div className="panelButton" style={{ display: this.state.componentCount > 0 ? "block" : "none" }}><button type="button" onClick={() => this.props.onRemoveComponent() } className="btn btn-sm btn-danger"><span className="glyphicon glyphicon-minus"></span> Remove</button></div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                );
            } else {
                return (<div></div>);
            }
        }
    }
}