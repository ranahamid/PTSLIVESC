/* tslint:disable:max-line-length */

namespace VC.Admin.Lists {
    "use strict";

    const FORM_ID: string = "Id";
    const FORM_NAME: string = "Name";

    export interface ITeachersListItem extends IDataItem<string> {
        name: string;
    }

    export class Teachers extends Base<string, ITeachersListItem, TeachersList, TeachersBox> {
        private list: TeachersList;
        private box: TeachersBox;

        public getList(): TeachersList {
            return this.list;
        }
        public getBox(): TeachersBox {
            return this.box;
        }

        render(): JSX.Element {
            return (
                <div>
                    <TeachersList ref={(ref: TeachersList) => this.list = ref} title="Teacher computer" actionUrl={this.props.actionUrl} classroomId={this.props.classroomId} loadMethod="LoadTeachers" showBoxNew={this.showBoxNew.bind(this) } showBoxEdit={this.showBoxEdit.bind(this) } showBoxDelete={this.showBoxDelete.bind(this) } />
                    <TeachersBox ref={(ref: TeachersBox) => this.box = ref} title="Teacher computer" actionUrl={this.props.actionUrl} classroomId={this.props.classroomId} getListItems={this.getListItems.bind(this) } setListItems={this.setListItems.bind(this) } />
                </div>
            );
        }
    }

    interface ITeachersListProps extends IListProps<string> { }
    interface ITeachersListState extends IListState<ITeachersListItem> { }

    class TeachersList extends List<string, ITeachersListItem, ITeachersListProps, ITeachersListState> {

        renderItemCols(d: ITeachersListItem): JSX.Element[] {
            let l: Array<JSX.Element> = [];
            l.push(<td key={"tdId_" + d.id}>{d.id}</td>);
            l.push(<td key={"tdName_" + d.id}>{d.name}</td>);
            return l;
        }
        renderTableHeaderCols(): JSX.Element[] {
            let l: Array<JSX.Element> = [];
            l.push(<th key={"thId"}>ID</th>);
            l.push(<th key={"thTeacher"}>Teacher computer</th>);
            return l;
        }
    }

    interface ITeachersBoxProps extends IBoxProps<ITeachersListItem> { }
    interface ITeachersBoxState extends IBoxState<ITeachersListItem> { }

    class TeachersBox extends Box<string, ITeachersListItem, ITeachersBoxProps, ITeachersBoxState> {

        constructor(props: ITeachersBoxProps) {
            super({ id: "", name: "" } as ITeachersListItem,
                props);
        }

        boxWillShow(): void {
            let tbId: HTMLInputElement = this.refs[REF_FORM_TB + FORM_ID] as HTMLInputElement;
            let tbName: HTMLInputElement = this.refs[REF_FORM_TB + FORM_NAME] as HTMLInputElement;
            $(tbId).val(this.state.item.id);
            $(tbName).val(this.state.item.name);

            this.setValidationStatus(FORM_ID, BoxValidationStatus.None, "");
            this.setValidationStatus(FORM_NAME, BoxValidationStatus.None, "");
        }
        boxDidShow(): void {
            if (this.state.type === BoxTypes.Create) {
                let tbId: HTMLInputElement = this.refs[REF_FORM_TB + FORM_ID] as HTMLInputElement;
                $(tbId).focus();
            } else if (this.state.type === BoxTypes.Edit) {
                let tbName: HTMLInputElement = this.refs[REF_FORM_TB + FORM_NAME] as HTMLInputElement;
                $(tbName).focus();
            }
        }

        isIdValid(id: string): boolean {
            let valid: boolean = id.length > 0; // cannot be empty
            let allowedChars: string = "abcdefghijklmnopqrstuvwxyz0123456789";
            // check allowed chars
            if (valid) {
                for (let i: number = 0; i < id.length && valid; i++) {
                    if (allowedChars.indexOf(id[i].toLowerCase()) === -1) {
                        valid = false;
                    }
                }
            }
            return valid;
        }
        isNameValid(name: string): boolean {
            return name.trim().length > 0; // cannot be empty
        }

        validateId(focusOnError: boolean): boolean {
            let valid: boolean = true;

            if (this.state.type === BoxTypes.Create) {
                let tbId: HTMLInputElement = this.refs[REF_FORM_TB + FORM_ID] as HTMLInputElement;
                let idVal: string = $(tbId).val();

                if (this.isIdValid(idVal)) {
                    this.setValidationStatus(FORM_ID, BoxValidationStatus.Success, "");
                } else {
                    this.setValidationStatus(FORM_ID, BoxValidationStatus.Error, "Teacher computer Id cannot be empty. It must be unique and contains only alphanumeric characters.");
                    if (focusOnError) {
                        $(tbId).focus();
                    }
                    valid = false;
                }
            }

            return valid;
        }
        validateName(focusOnError: boolean): boolean {
            let valid: boolean = true;

            if (this.state.type === BoxTypes.Create || this.state.type === BoxTypes.Edit) {
                let tbName: HTMLInputElement = this.refs[REF_FORM_TB + FORM_NAME] as HTMLInputElement;
                let nameVal: string = $(tbName).val();

                if (this.isNameValid(nameVal)) {
                    this.setValidationStatus(FORM_NAME, BoxValidationStatus.Success, "");
                } else {
                    this.setValidationStatus(FORM_NAME, BoxValidationStatus.Error, "Teacher computer name cannot be empty.");
                    if (focusOnError) {
                        $(tbName).focus();
                    }
                    valid = false;
                }
            }

            return valid;
        }
        validateForm(focusOnError: boolean): boolean {
            let valid: boolean = true;

            if (!this.validateName(focusOnError)) {
                valid = false;
            }
            if (!this.validateId(focusOnError)) {
                valid = false;
            }

            return valid;
        }

        onKeyPressId(e: KeyboardEvent): void {
            if (e.which === 13) {
                e.preventDefault();
                this.submitForm();
            } else {
                this.validateId(false);
            }
        }
        onKeyPressName(e: KeyboardEvent): void {
            if (e.which === 13) {
                e.preventDefault();
                this.submitForm();
            } else {
                this.validateName(false);
            }
        }

        checkForExistingId(id: string, excludeId: string, callback: (exist: boolean) => void): void {
            $.ajax({
                cache: false,
                type: "POST",
                url: "/api/Classroom/" + this.props.classroomId + "/IsTeacherExists/" + id,
                data: JSON.stringify(excludeId),
                contentType: "application/json",
                success: (r: Global.Data.IDataResponse<boolean>): void => {
                    if (r.status === Global.Data.RESPONSE_SUCCESS) {
                        callback(r.data);
                    } else {
                        // error
                        alert("ERROR: " + r.message);
                    }
                },
                error: (xhr: JQueryXHR, status: string, error: string): void => {
                    // error
                    alert("ERROR: " + error);
                    this.hide();
                }
             });
        }

        submitForm(): void {
            let tbId: HTMLInputElement = this.refs[REF_FORM_TB + FORM_ID] as HTMLInputElement;

            let isFormValid: boolean = this.validateForm(true);

            if (isFormValid) {
                let valId: string = $(tbId).val();

                this.divButtons.style.display = "none";
                this.divProcessing.style.display = "block";

                if (this.state.type === BoxTypes.Create) {
                    // check for existing item before create
                    this.checkForExistingId(valId, this.state.item.id, this.submitFormIdValidated.bind(this));
                } else if (this.state.type === BoxTypes.Edit) {
                    // edit
                    this.doUpdate();
                } else {
                    // delete
                    this.doDelete();
                }
            }
        }
        submitFormIdValidated(exist: boolean): void {
            if (exist) {
                let tbId: HTMLInputElement = this.refs[REF_FORM_TB + FORM_ID] as HTMLInputElement;

                this.divButtons.style.display = "block";
                this.divProcessing.style.display = "none";

                this.setValidationStatus(FORM_ID, BoxValidationStatus.Error, "Teacher computer Id already exists.");
                $(tbId).focus();
            } else {
                // create
                this.doCreate();
            }
        }

        doCreate(): void {
            let tbId: HTMLInputElement = this.refs[REF_FORM_TB + FORM_ID] as HTMLInputElement;
            let tbName: HTMLInputElement = this.refs[REF_FORM_TB + FORM_NAME] as HTMLInputElement;
            let idVal: string = $(tbId).val();
            let nameVal: string = $(tbName).val();

            $.ajax({
                cache: false,
                type: "POST",
                url: "/api/Classroom/" + this.props.classroomId + "/CreateTeacher",
                data: JSON.stringify({ id: idVal, name: nameVal } as ITeachersListItem),
                contentType: "application/json",
                success: (r: Global.Data.IDataResponse<ITeachersListItem>): void => {
                    this.hide();
                    if (r.status === Global.Data.RESPONSE_SUCCESS) {
                        // add to list
                        let d: Array<ITeachersListItem> = this.props.getListItems();
                        d.push(r.data);
                        this.props.setListItems(d);
                    } else {
                        // error
                        alert("ERROR: " + r.message);
                    }
                },
                error: (xhr: JQueryXHR, status: string, error: string): void => {
                    // error
                    alert("ERROR: " + error);
                    this.hide();
                }
             });
        }
        doUpdate(): void {
            let tbId: HTMLInputElement = this.refs[REF_FORM_TB + FORM_ID] as HTMLInputElement;
            let tbName: HTMLInputElement = this.refs[REF_FORM_TB + FORM_NAME] as HTMLInputElement;
            let idVal: string = $(tbId).val();
            let nameVal: string = $(tbName).val();

            $.ajax({
                type: "POST",
                url: "/api/Classroom/" + this.props.classroomId + "/UpdateTeacher",
                data: JSON.stringify({ id: idVal, name: nameVal } as ITeachersListItem),
                contentType: "application/json",
                success: (r: Global.Data.IDataResponse<ITeachersListItem>): void => {
                    this.hide();
                    if (r.status === Global.Data.RESPONSE_SUCCESS) {
                        // update list
                        let d: Array<ITeachersListItem> = this.props.getListItems();
                        for (let i: number = 0; i < d.length; i++) {
                            if (d[i].id === this.state.item.id) {
                                d[i] = r.data;
                            }
                        }
                        this.props.setListItems(d);
                    } else {
                        // error
                        alert("ERROR: " + r.message);
                    }
                },
                error: (xhr: JQueryXHR, status: string, error: string): void => {
                    // error
                    alert("ERROR: " + error);
                    this.hide();
                }
             });
        }
        doDelete(): void {
            $.ajax({
                cache: false,
                type: "POST",
                url: "/api/Classroom/" + this.props.classroomId + "/DeleteTeacher",
                data: JSON.stringify(this.state.item.id),
                contentType: "application/json",
                success: (r: Global.Data.IDataResponse<string>): void => {
                    this.hide();
                    if (r.status === Global.Data.RESPONSE_SUCCESS) {
                        // remove from list
                        let d: Array<ITeachersListItem> = this.props.getListItems();
                        let _d: Array<ITeachersListItem> = [];
                        for (let i: number = 0; i < d.length; i++) {
                            if (d[i].id !== this.state.item.id) {
                                _d.push(d[i]);
                            }
                        }
                        this.props.setListItems(_d);
                    } else {
                        // error
                        alert("ERROR: " + r.message);
                    }
                },
                error: (xhr: JQueryXHR, status: string, error: string): void => {
                    // error
                    alert("ERROR: " + error);
                    this.hide();
                }
             });
        }

        renderForm(): JSX.Element {
            return (
                <form className="form-horizontal" role="form">
                    <div ref={REF_FORM_DIV + FORM_ID} className="form-group">
                        <label className="col-sm-2" htmlFor={REF_FORM_TB + FORM_ID}>Id: </label>
                        <div className="col-sm-10">
                            <input ref={REF_FORM_TB + FORM_ID} type="text" className="form-control" disabled={this.state.type !== BoxTypes.Create} placeholder="Teacher computer Id" maxLength="25" onPaste={() => this.validateId(false) } onCut={() => this.validateId(false) } onKeyUp={(e: KeyboardEvent) => this.onKeyPressId(e) } />
                            <span ref={REF_FORM_ICON + FORM_ID} style={{ display: "none" }}></span>
                        </div>
                    </div>
                    <div ref={REF_FORM_DIV + FORM_NAME} className="form-group">
                        <label className="col-sm-2" htmlFor={REF_FORM_TB + FORM_NAME}>Name: </label>
                        <div className="col-sm-10">
                            <input ref={REF_FORM_TB + FORM_NAME} type="text" className="form-control" disabled={this.state.type === BoxTypes.Delete} placeholder="Teacher computer name" maxLength="150" onPaste={() => this.validateName(false) } onCut={() => this.validateName(false) } onKeyUp={(e: KeyboardEvent) => this.onKeyPressName(e) } />
                            <span ref={REF_FORM_ICON + FORM_NAME} style={{ display: "none" }}></span>
                        </div>
                    </div>
                </form>
            );
        }
    }
}