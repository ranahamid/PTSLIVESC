/* tslint:disable:max-line-length */

namespace VC.Forms {
    "use strict";

    export enum FormViews {
        Edit,
        Preview,
        View,
        Answer,
        Result
    }
    export enum FormAnswerStatus {
        Pending = 1,
        Answered = 2,
        Declined = 3
    }
    export enum FormType {
        Survey = 1,
        Poll = 2
    }

    export interface IFormData {
        uid: string;
        classroomId: string;
        type: FormType;
        title: string;
        formData: string;
    }
    export interface IFormAnswerData extends IFormData {
        status: FormAnswerStatus;
        formUid: string;
    }
    export interface IFormResultData extends IFormData {
        totalAnswers: number;
    }

    export interface IFormDataComponent {
        type: Components.ComponentTypes;
        configData?: string;
        answerData?: string;
    }

    interface IFormProps {
        view: FormViews;
        type?: FormType;
    }
    interface IFormState {
        view: FormViews;
        formUid?: string;
        answerUid?: string;
        components?: Array<Forms.Components.IComponent>;
    }

    export class FormApi {
        public static Insert(data: Forms.IFormData, onSuccess: (id: string) => void, onError: (error: string) => void): void {
            $.ajax({
                cache: false,
                type: "POST",
                url: "/api/Form/Insert",
                contentType: "application/json",
                data: JSON.stringify(data),
                success: (r: Global.Data.IDataResponse<string>): void => {
                    if (r.status === Global.Data.RESPONSE_SUCCESS) {
                        // success
                        onSuccess(r.data);
                    } else {
                        // error
                        onError(r.message);
                    }
                },
                error: (xhr: JQueryXHR, status: string, error: string): void => {
                    // error
                    onError(error);
                }
            });
        }
        public static Update(data: Forms.IFormData, onSuccess: () => void, onError: (error: string) => void): void {
            $.ajax({
                cache: false,
                type: "POST",
                url: "/api/Form/Update/",
                data: JSON.stringify(data),
                contentType: "application/json",
                success: (r: Global.Data.IDataResponse<boolean>): void => {
                    if (r.status === Global.Data.RESPONSE_SUCCESS) {
                        if (r.data) {
                            // success
                            onSuccess();
                        } else {
                            // not updated
                            onError("Something went wrong and the record is not updated.");
                        }
                    } else {
                        // error
                        onError(r.message);
                    }
                },
                error: (xhr: JQueryXHR, status: string, error: string): void => {
                    // error
                    onError(error);
                }
            });
        }
        public static Delete(id: string, onSuccess: () => void, onError: (error: string) => void): void {
            $.ajax({
                cache: false,
                type: "POST",
                url: "/api/Form/Delete/" + id,
                contentType: "application/json",
                data: null,
                success: (r: Global.Data.IDataResponse<boolean>): void => {
                    if (r.status === Global.Data.RESPONSE_SUCCESS) {
                        if (r.data) {
                            // success
                            onSuccess();
                        } else {
                            // not deleted
                            onError("Something went wrong and the record is not deleted.");
                        }
                    } else {
                        // error
                        onError(r.message);
                    }
                },
                error: (xhr: JQueryXHR, status: string, error: string): void => {
                    // error
                    onError(error);
                }
            });
        }
        public static UpdateAnswer(data: Forms.IFormAnswerData, onSuccess: () => void, onError: (error: string) => void): void {
            $.ajax({
                cache: false,
                type: "POST",
                url: "/api/Form/UpdateAnswer/",
                data: JSON.stringify(data),
                contentType: "application/json",
                success: (r: Global.Data.IDataResponse<boolean>): void => {
                    if (r.status === Global.Data.RESPONSE_SUCCESS) {
                        if (r.data) {
                            // success
                            onSuccess();
                        } else {
                            // not updated
                            onError("Something went wrong and the record is not updated.");
                        }
                    } else {
                        // error
                        onError(r.message);
                    }
                },
                error: (xhr: JQueryXHR, status: string, error: string): void => {
                    // error
                    onError(error);
                }
            });
        }
    }

    export class Form extends React.Component<IFormProps, IFormState> {
        private formBody: FormBody;
        private formPanel: FormPanel;

        constructor(props: IFormProps) {
            super(props);
            this.state = { view: props.view, components: undefined } as IFormState;
        }

        componentDidMount(): void {
            // this.saveForm();
        }

        public loading(): void {
            this.setState({
                view: this.state.view,
                formUid: undefined,
                answerUid: undefined,
                components: undefined
            } as IFormState);
        }
        public init(): void {
            this.setState({
                view: this.state.view,
                formUid: undefined,
                answerUid: undefined,
                components: []
            } as IFormState);
        }
        public initForm(formUid: string): void {
            // clear & set loading
            this.setState({
                view: this.state.view,
                formUid: formUid,
                answerUid: undefined,
                components: undefined
            } as IFormState, () => {
                // load form on callback
                $.ajax({
                    cache: false,
                    type: "GET",
                    url: "/api/Form/Get/" + formUid,
                    success: (r: Global.Data.IDataResponse<IFormData>): void => {
                        if (r.status === Global.Data.RESPONSE_SUCCESS) {
                            // successfully loaded - init
                            this.init();
                            // parse & add components
                            let components: Array<IFormDataComponent> = JSON.parse(r.data.formData) as Array<IFormDataComponent>;
                            for (let i: number = 0; i < components.length; i++) {
                                this.addComponent(components[i].type, components[i].configData, null, null); // no answer or result
                            }
                        } else {
                            // error
                            alert("ERROR: " + r.message);
                        }
                    },
                    error: (xhr: JQueryXHR, status: string, error: string): void => {
                        // error
                        alert("ERROR: " + error);
                    }
                });
            });
        }
        public initAnswer(answerUid: string): void {
            // clear & set loading
            this.setState({
                view: this.state.view,
                formUid: undefined,
                answerUid: answerUid,
                componets: undefined
            } as IFormState, () => {
                // load form answer on callback
                $.ajax({
                    cache: false,
                    type: "GET",
                    url: "/api/Form/GetAnswer/" + answerUid,
                    success: (r: Global.Data.IDataResponse<IFormAnswerData>): void => {
                        if (r.status === Global.Data.RESPONSE_SUCCESS) {
                            // successfully loaded - init
                            this.init();
                            // parse & add components
                            let components: Array<IFormDataComponent> = JSON.parse(r.data.formData) as Array<IFormDataComponent>;
                            for (let i: number = 0; i < components.length; i++) {
                                this.addComponent(components[i].type, components[i].configData, components[i].answerData, null); // answer
                            }
                        } else {
                            // error
                            alert("ERROR: " + r.message);
                        }
                    },
                    error: (xhr: JQueryXHR, status: string, error: string): void => {
                        // error
                        alert("ERROR: " + error);
                    }
                });
            });
        }
        public initResult(formUid: string): void {
            // clear & set loading
            this.setState({
                view: this.state.view,
                formUid: formUid,
                answerUid: undefined,
                components: undefined
            } as IFormState, () => {
                // load form on callback
                $.ajax({
                    cache: false,
                    type: "GET",
                    url: "/api/Form/GetResult/" + formUid,
                    success: (r: Global.Data.IDataResponse<IFormResultData>): void => {
                        if (r.status === Global.Data.RESPONSE_SUCCESS) {
                            // successfully loaded - init
                            this.init();
                            // parse & add components
                            let components: Array<IFormDataComponent> = JSON.parse(r.data.formData) as Array<IFormDataComponent>;
                            for (let i: number = 0; i < components.length; i++) {
                                this.addComponent(components[i].type, components[i].configData, null, components[i].answerData); // result
                            }
                        } else {
                            // error
                            alert("ERROR: " + r.message);
                        }
                    },
                    error: (xhr: JQueryXHR, status: string, error: string): void => {
                        // error
                        alert("ERROR: " + error);
                    }
                });
            });
        }

        public updateResult(resultData: string): void {
            if (this.state.components !== undefined) { // when loaded
                this.formBody.updateResult(resultData);
            }
        }

        public getData(dataType: DataType): string {
            return this.formBody.getData(dataType);
        }

        private addComponent(type: Components.ComponentTypes, configData: string, answerData: string, resultData: string): void {
            let countOfComponents: number = this.formBody.addComponent(type, configData, answerData, resultData);
            this.formPanel.componentCount(countOfComponents);
        }
        private removeComponent(id?: number): void {
            let countOfComponents: number = this.formBody.removeComponent(id);
            this.formPanel.componentCount(countOfComponents);
        }

        public changeView(view: FormViews): void {
            // save
            this.setState({ view: view } as IFormState);
        }

        public validate(): boolean {
            return this.formBody.validate();
        }

        renderLoading(): JSX.Element {
            return (
                <div className="Forms">
                    <div className="text-muted">Loading...</div>
                </div>
                );
        }
        renderForm(): JSX.Element {
            return (
                <div className="Forms">
                    <FormBody ref={(ref: FormBody) => this.formBody = ref} components={this.state.components} view={this.state.view} />
                    <FormPanel ref={(ref: FormPanel) => this.formPanel = ref} show={this.state.view === FormViews.Edit} type={this.props.type} onAddComponent={(type: Components.ComponentTypes): void => this.addComponent(type, null, null, null) } onRemoveComponent={(id?: number): void => this.removeComponent(id) } />
                </div>
            );
        }
        render(): JSX.Element {
            if (this.state.components === undefined) {
                return this.renderLoading();
            } else {
                return this.renderForm();
            }
        }
    }
}
