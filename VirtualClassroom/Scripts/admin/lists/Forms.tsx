/* tslint:disable:max-line-length */

namespace VC.Admin.Lists {
    "use strict";

    const FORM_TITLE: string = "Title";

    export interface IFormsListItem extends IDataItem<string> {
        title: string;
        type: Forms.FormType;
        pendingCount: number;
        answeredCount: number;
        declinedCount: number;
    }

    

    export class Moderators extends Base<string, IFormsListItem, FormsList, FormsBox, any> {
        private list: FormsList;
        private box: FormsBox;

        public getList(): FormsList {
            return this.list;
        }
        public getBox(): FormsBox {
            return this.box;
        }
        public getImportBox(): any {
            return null;
        }

        render(): JSX.Element {
            return (
                <div>
                    <ModeratorList ref={(ref: ModeratorList) => this.list = ref} title="Moderator" actionUrl={this.props.actionUrl}  classroomId={this.props.classroomId} loadMethod="LoadModerators" showBoxNew={this.showBoxNew.bind(this) } showBoxEdit={this.showBoxEdit.bind(this) }  showEnableClass={this.showEnableClass.bind(this) }  showDisableClass={this.showDisableClass.bind(this) } showBoxDelete={this.showBoxDelete.bind(this) } />
                    <FormsBox ref={(ref: FormsBox) => this.box = ref} title="Moderator" formType={VC.Forms.FormType.Survey} actionUrl={this.props.actionUrl} classroomId={this.props.classroomId} getListItems={this.getListItems.bind(this) } setListItems={this.setListItems.bind(this) } /> 

                </div>
            );
        }
    }

    export class Surveys extends Base<string, IFormsListItem, FormsList, FormsBox, any> {
        private list: FormsList;
        private box: FormsBox;

        public getList(): FormsList {
            return this.list;
        }
        public getBox(): FormsBox {
            return this.box;
        }
        public getImportBox(): any {
            return null;
        }

        render(): JSX.Element {
            return (
                <div>
                    <FormsList ref={(ref: FormsList) => this.list = ref} title="Survey" actionUrl={this.props.actionUrl}  classroomId={this.props.classroomId} loadMethod="LoadSurveys" showBoxNew={this.showBoxNew.bind(this) } showBoxEdit={this.showBoxEdit.bind(this) }  showEnableClass={this.showEnableClass.bind(this) }  showDisableClass={this.showDisableClass.bind(this) } showBoxDelete={this.showBoxDelete.bind(this) } />
                    <FormsBox ref={(ref: FormsBox) => this.box = ref} title="Survey" formType={VC.Forms.FormType.Survey} actionUrl={this.props.actionUrl} classroomId={this.props.classroomId} getListItems={this.getListItems.bind(this) } setListItems={this.setListItems.bind(this) } />
                </div>
            );
        }
    }

    export class Polls extends Base<string, IFormsListItem, FormsList, FormsBox, any> {
        private list: FormsList;
        private box: FormsBox;

        public getList(): FormsList {
            return this.list;
        }
        public getBox(): FormsBox {
            return this.box;
        }
        public getImportBox(): any {
            return null;
        }

        render(): JSX.Element {
            return (
                <div>
                    <FormsList ref={(ref: FormsList) => this.list = ref} title="Poll" actionUrl={this.props.actionUrl}  classroomId={this.props.classroomId} loadMethod="LoadPolls" showBoxNew={this.showBoxNew.bind(this) } showBoxEdit={this.showBoxEdit.bind(this) }  showEnableClass={this.showEnableClass.bind(this) }  showDisableClass={this.showDisableClass.bind(this) }  showBoxDelete={this.showBoxDelete.bind(this) } />
                    <FormsBox ref={(ref: FormsBox) => this.box = ref} title="Poll" formType={VC.Forms.FormType.Poll} actionUrl={this.props.actionUrl} classroomId={this.props.classroomId} getListItems={this.getListItems.bind(this) } setListItems={this.setListItems.bind(this) } />
                </div>
            );
        }
    }

    interface IFormsListProps extends IListProps<string> { }
    interface IFormsListState extends IListState<IFormsListItem> { }

    class FormsList extends List<string, IFormsListItem, IFormsListProps, IFormsListState> {

        renderItemCols(d: IFormsListItem): JSX.Element[] {
            let l: Array<JSX.Element> = [];
            l.push(<td key={"tdTitle_" + d.id}>{d.title}</td>);
            return l;
        }
        renderTableHeaderCols(): JSX.Element[] {
            let l: Array<JSX.Element> = [];
            l.push(<th key={"thTitle"}>Title</th>);
            return l;
        }
    }

    class ModeratorList extends List<string, IFormsListItem, IFormsListProps, IFormsListState> {

        renderItemCols(d: IFormsListItem): JSX.Element[] {
            let l: Array<JSX.Element> = [];
            l.push(<td key={"tdTitle_" + d.id}>{d.title}</td>);
            return l;
        }
        renderTableHeaderCols(): JSX.Element[] {
            let l: Array<JSX.Element> = [];
            l.push(<th key={"thTitle"}>Moderator Computer</th>);
            return l;
        }
    }

    interface IFormsBoxProps extends IBoxProps<IFormsListItem> {
        formType: VC.Forms.FormType;
    }
    interface IFormsBoxState extends IBoxState<IFormsListItem> { }

    class FormsBox extends Box<string, IFormsListItem, IFormsBoxProps, IFormsBoxState> {
        private form: VC.Forms.Form;

        constructor(props: IFormsBoxProps) {
            super({ title: "" } as IFormsListItem,
                props);
        }

        boxWillShow(): void {
            let tbTitle: HTMLInputElement = this.refs[REF_FORM_TB + FORM_TITLE] as HTMLInputElement;
            $(tbTitle).val(this.state.item.title);

            this.setValidationStatus(FORM_TITLE, BoxValidationStatus.None, "");

            this.form.loading();
        }
        boxDidShow(): void {
            if (this.state.type === BoxTypes.Create || this.state.type === BoxTypes.Edit) {
                let tbTitle: HTMLInputElement = this.refs[REF_FORM_TB + FORM_TITLE] as HTMLInputElement;
                $(tbTitle).focus();
            }

            if (this.state.type === BoxTypes.Delete) {
                this.form.changeView(VC.Forms.FormViews.Preview);
            } else {
                this.form.changeView(VC.Forms.FormViews.Edit);
            }

            if (this.state.type === BoxTypes.Create) {
                this.form.init();
            } else {
                this.form.initForm(this.state.item.id);
            }
        }

        isTitleValid(title: string): boolean {
            return !(title.length === 0 || !title.trim()); // cannot be empty
        }

        validateTitle(focusOnError: boolean): boolean {
            let valid: boolean = true;

            if (this.state.type === BoxTypes.Create || this.state.type === BoxTypes.Edit) {
                let tbTitle: HTMLInputElement = this.refs[REF_FORM_TB + FORM_TITLE] as HTMLInputElement;
                let titleVal: string = $(tbTitle).val();

                if (this.isTitleValid(titleVal)) {
                    this.setValidationStatus(FORM_TITLE, BoxValidationStatus.Success, "");
                } else {
                    this.setValidationStatus(FORM_TITLE, BoxValidationStatus.Error, "Title cannot be empty.");
                    if (focusOnError) {
                        $(tbTitle).focus();
                    }
                    valid = false;
                }
            }

            return valid;
        }
        validateForm(focusOnError: boolean): boolean {
            let valid: boolean = true;

            if (!this.validateTitle(focusOnError)) {
                valid = false;
            }

            if (!this.form.validate()) {
                valid = false;
            }

            return valid;
        }

        onKeyPressTitle(e: KeyboardEvent): void {
            if (e.which === 13) {
                e.preventDefault();
                this.submitForm();
            } else {
                this.validateTitle(false);
            }
        }

        submitForm(): void {
            let isFormValid: boolean = this.validateForm(true);

            if (isFormValid) {
                this.divButtons.style.display = "none";
                this.divProcessing.style.display = "block";

                if (this.state.type === BoxTypes.Create) {
                    // create
                    this.doCreate();
                } else if (this.state.type === BoxTypes.Edit) {
                    // edit
                    this.doUpdate();
                } else {
                    // delete
                    this.doDelete();
                }
            }
        }

        doCreate(): void {
            let tbTitle: HTMLInputElement = this.refs[REF_FORM_TB + FORM_TITLE] as HTMLInputElement;
            let titleVal: string = $(tbTitle).val();
            let formData: string = this.form.getData(Forms.DataType.Form);

            VC.Forms.FormApi.Insert({ classroomId: this.props.classroomId, type: this.props.formType, title: titleVal, formData: formData } as Forms.IFormData,
                (id: string) => {
                    // success
                    this.close();
                    // add to list
                    let d: Array<IFormsListItem> = this.props.getListItems();
                    d.push({ id: id, title: titleVal } as IFormsListItem);
                    this.props.setListItems(d);
                },
                (error: string) => {
                    // error
                    alert("ERROR: " + error);
                    this.close();
                }
            );
        }
        doUpdate(): void {
            let tbTitle: HTMLInputElement = this.refs[REF_FORM_TB + FORM_TITLE] as HTMLInputElement;
            let titleVal: string = $(tbTitle).val();
            let formData: string = this.form.getData(Forms.DataType.Form);

            VC.Forms.FormApi.Update({ uid: this.state.item.id, classroomId: this.props.classroomId, type: this.props.formType, title: titleVal, formData: formData } as Forms.IFormData,
                () => {
                    // success
                    this.close();
                    // update list
                    let d: Array<IFormsListItem> = this.props.getListItems();
                    for (let i: number = 0; i < d.length; i++) {
                        if (d[i].id === this.state.item.id) {
                            d[i].title = titleVal;
                        }
                    }
                    this.props.setListItems(d);
                },
                (error: string) => {
                    // error
                    alert("ERROR: " + error);
                    this.close();
                }
            );
        }
        doDelete(): void {

            VC.Forms.FormApi.Delete(this.state.item.id,
                () => {
                    // success
                    this.close();
                    // remove from list
                    let d: Array<IFormsListItem> = this.props.getListItems();
                    let _d: Array<IFormsListItem> = [];
                    for (let i: number = 0; i < d.length; i++) {
                        if (d[i].id !== this.state.item.id) {
                            _d.push(d[i]);
                        }
                    }
                    this.props.setListItems(_d);
                },
                (error: string) => {
                    // error
                    alert("ERROR: " + error);
                    this.close();
                }
            );
        }

        renderForm(): JSX.Element {
            return (
                <form className="form-horizontal" role="form">
                    <div ref={REF_FORM_DIV + FORM_TITLE} className="form-group">
                        <label className="col-sm-2" htmlFor={REF_FORM_TB + FORM_TITLE}>Name: </label>
                        <div className="col-sm-10">
                            <input ref={REF_FORM_TB + FORM_TITLE} type="text" className="form-control" disabled={this.state.type === BoxTypes.Delete} placeholder={this.props.title + " title"} maxLength="150" onPaste={() => this.validateTitle(false) } onCut={() => this.validateTitle(false) } onKeyUp={(e: KeyboardEvent) => this.onKeyPressTitle(e) } />
                            <span ref={REF_FORM_ICON + FORM_TITLE} style={{ display: "none" }}></span>
                        </div>
                    </div>
                    <div style={{display:"none"}}><input type="text" /></div>
                    <div className="form-group">
                        <label className="col-sm-2">{this.props.title}: </label>
                        <div className="col-sm-10">
                            <div style={{ paddingLeft: "15px", paddingRight: "15px" }}>
                                <VC.Forms.Form ref={(ref: VC.Forms.Form) => this.form = ref} view={VC.Forms.FormViews.Edit} type={this.props.formType} />
                            </div>
                        </div>
                    </div>
                </form>
            );
        }
    }
}