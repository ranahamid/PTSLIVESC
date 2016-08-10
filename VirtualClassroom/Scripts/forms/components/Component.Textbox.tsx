/* tslint:disable:max-line-length */

namespace VC.Forms.Components {
    "use strict";

    interface IConfig {
        required: boolean;
    }
    interface IAnswer {
        text: string;
    }

    export class ComponentTextbox extends Component<IConfig, IAnswer> {
        private tb: HTMLTextAreaElement;
        private div: HTMLDivElement;

        private autoValidate: boolean = false;

        defaultConfig(): IConfig {
            return { required: false } as IConfig;
        }
        defaultAnswer(): IAnswer {
            return { text: "" } as IAnswer;
        }

        // config
        private onRequiredChanged(e: React.FormEvent): void {
            let config: IConfig = { required: (e.target as HTMLInputElement).checked } as IConfig;
            this.saveConfig(config);
        }

        // answer
        private onTextChanged(e: React.FormEvent): void {
            let answer: IAnswer = { text: (e.target as HTMLTextAreaElement).value } as IAnswer;
            this.saveAnswer(answer);

            if (this.autoValidate) {
                this.validate();
            }
        }

        public validate(): boolean {
            let valid: boolean = true;

            if (this.props.view === FormViews.View) {
                if (this.config().required) {
                    let text: string = this.answer().text;
                    valid = text.trim().length > 0;
                }

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
                <div key={"edit_" + this.props.component.id} className="form-group">
                    <textarea className="form-control" disabled={true} readOnly={true} placeholder="Text input"></textarea>
                    <div><label className="required"><input type="checkbox" defaultChecked={this.config().required} onChange={(e: React.FormEvent) => this.onRequiredChanged(e) } /> required</label></div>
                </div>
            );
        }
        renderPreview(): JSX.Element {
            return (
                <div key={"preview_" + this.props.component.id} className="form-group">
                    <textarea className="form-control" disabled={true} readOnly={true} placeholder="Text input"></textarea>
                </div>
            );
        }
        renderView(): JSX.Element {
            return (
                <div ref={(ref: HTMLDivElement) => this.div = ref} key={"view_" + this.props.component.id} className="form-group">
                    <textarea ref={(ref: HTMLTextAreaElement) => this.tb = ref} className="form-control" onChange={(e: React.FormEvent) => this.onTextChanged(e) } placeholder="Enter text">{this.answer().text}</textarea>
                </div>
            );
        }
        renderAnswer(): JSX.Element {
            return (
                <div className="form-group">
                    {this.answer().text}
                </div>
            );
        }
        renderResult(): JSX.Element {
            // same as preview
            return this.renderPreview();
        }
    }
}