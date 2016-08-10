/* tslint:disable:max-line-length */

namespace VC.Forms.Components {
    "use strict";

    interface IConfig {
        text: string;
    }
    interface IAnswer {
    }

    export class ComponentLabel extends Component<IConfig, any> {
        private tb: HTMLTextAreaElement;
        private div: HTMLDivElement;

        private autoValidate: boolean = false;

        defaultConfig(): IConfig {
            return { text: "" } as IConfig;
        }
        defaultAnswer(): IAnswer {
            return null;
        }

        // config
        private onTextChanged(e: React.FormEvent): void {
            let config: IConfig = { text: (e.target as HTMLTextAreaElement).value } as IConfig;
            this.saveConfig(config);

            if (this.autoValidate) {
                this.validate();
            }
        }

        public validate(): boolean {
            let valid: boolean = true;

            if (this.props.view === FormViews.Edit) {
                let text: string = this.config().text;
                valid = text.trim().length > 0;

                this.setValidationStatus(valid);

                if (!valid) {
                    this.autoValidate = true;
                }
            }

            return valid;
        }

        private setValidationStatus(valid: boolean): void {
            let tooltip: string = "This field cannot be empty.";

            if (valid) {
                this.div.className = "form-group has-success";
                $(this.tb).removeAttr("data-toggle");
                $(this.tb).removeAttr("data-placement");
                $(this.tb).removeAttr("title");
                $(this.tb).tooltip("destroy");
            } else {
                this.div.className = "form-group has-error";
                $(this.tb).attr("data-toggle", "tooltip");
                $(this.tb).attr("data-placement", "bottom");
                $(this.tb).attr("title", tooltip);
                $(this.tb).tooltip();
            }
        }

        public updateResultData(result: Array<number>, resultData: IAnswer): Array<number> {
            return null;
        }

        renderEdit(): JSX.Element {
            return (
                <div ref={(ref: HTMLDivElement) => this.div = ref} key={"edit_" + this.props.component.id} className="form-group">
                    <textarea ref={(ref: HTMLTextAreaElement) => this.tb = ref} className="form-control lbl" onChange={(e: React.FormEvent) => this.onTextChanged(e) } placeholder="Enter text">{this.config().text}</textarea>
                </div>
            );
        }
        renderPreview(): JSX.Element {
            // same as view
            return this.renderView();
        }
        renderView(): JSX.Element {
            return (
                <div key={"view_" + this.props.component.id} className="form-group lbl">
                    {this.config().text}
                </div>
            );
        }
        renderAnswer(): JSX.Element {
            // same as view
            return this.renderView();
        }
        renderResult(): JSX.Element {
            // same as view
            return this.renderView();
        }
    }
}