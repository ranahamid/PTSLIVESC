﻿/* tslint:disable:max-line-length */

namespace VC.Admin.Lists {
    "use strict";

    const FORM_ID: string = "Id";
    const FORM_NAME: string = "Name";

    export interface ITeachersListItem extends IDataItem<string> {
        uid: string;
        name: string;
    }

    export class Teachers extends Base<string, ITeachersListItem, TeachersList, TeachersBox, TeachersImportBox> {
        private list: TeachersList;
        private box: TeachersBox;
        private boxImport: TeachersImportBox;

        public getList(): TeachersList {
            return this.list;
        }
        public getBox(): TeachersBox {
            return this.box;
        }
        public getImportBox(): TeachersImportBox {
            return this.boxImport;
        }

        render(): JSX.Element {
            return (
                <div>
                    <TeachersList ref={(ref: TeachersList) => this.list = ref} title="Teacher computer" actionUrl={this.props.actionUrl} classroomId={this.props.classroomId} loadMethod="LoadTeachers" showBoxImport={() => this.showBoxImport() }  showEnableClass={this.showEnableClass.bind(this) }  showDisableClass={this.showDisableClass.bind(this) } showBoxNew={this.showBoxNew.bind(this) } showBoxEdit={this.showBoxEdit.bind(this) } showBoxDelete={this.showBoxDelete.bind(this) } />
                    <TeachersBox ref={(ref: TeachersBox) => this.box = ref} title="Teacher computer" actionUrl={this.props.actionUrl} classroomId={this.props.classroomId} getListItems={this.getListItems.bind(this) } setListItems={this.setListItems.bind(this) } />
                    <TeachersImportBox ref={(ref: TeachersImportBox) => this.boxImport = ref} title="Import Teacher computers" classroomId={this.props.classroomId} getListItems={this.getListItems.bind(this) } setListItems={this.setListItems.bind(this) }></TeachersImportBox>
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
                    this.close();
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
                    this.close();
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
                    this.close();
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
                    this.close();
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
                    this.close();
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
                    this.close();
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
                    this.close();
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

    interface ITeachersImportBoxProps extends IImportBoxProps<ITeachersListItem> { }
    interface ITeachersImportBoxState extends IImportBoxState<ITeachersListItem> { }

    class TeachersImportBox extends ImportBox<string, ITeachersListItem, ITeachersImportBoxProps, ITeachersImportBoxState> {
        constructor(props: ITeachersImportBoxProps) {
            super(props);
        }

        renderHelp(): JSX.Element {
            return (
                <div className="text-muted">
                    EXAMPLE: <br />
                    ID1, "Teacher Name"<br />
                    ID2, "Teacher Name"<br />
                    ID3, "Teacher Name"<br />
                </div>
            );
        }

        placeholder(): string {
            return "ID1, \"Teacher Name\"\nID2, \"Teacher Name\"\nID3, \"Teacher Name\"";
        }

        import(): void {
            this.hideError();
            this.setProcessing(true);

            let data: string = this.tb.value;

            if (data.length === 0) {
                // nothing to import
                this.showError("ERROR: Nothing to import", 2000);
                this.setProcessing(false);
            } else {
                $.ajax({
                    cache: false,
                    type: "POST",
                    url: "/api/Classroom/" + this.props.classroomId + "/ImportTeachers",
                    data: JSON.stringify(data),
                    contentType: "application/json",
                    success: (r: Global.Data.IDataResponse<Array<ITeachersListItem>>): void => {
                        if (r.status === Global.Data.RESPONSE_SUCCESS) {
                            this.tb.value = "";
                            this.close();
                            // add to list
                            let d: Array<ITeachersListItem> = this.props.getListItems();
                            r.data.forEach((item: ITeachersListItem) => {
                                d.push(item);
                            });
                            this.props.setListItems(d);
                        } else {
                            // error
                            this.showError("ERROR: " + r.message);
                            this.setProcessing(false);
                        }
                    },
                    error: (xhr: JQueryXHR, status: string, error: string): void => {
                        // error
                        alert("ERROR: " + error);
                        this.close();
                    }
                });
            }
        }
    }
}



namespace VC.Admin.Lists {
    "use strict";

    const FORM_ID: string = "Id";
    const FORM_NAME: string = "Name";

    export interface IModeratorsListItem extends IDataItem<string> {
        uid: string;
        name: string;
    }

    export class Moderators extends Base<string, IModeratorsListItem, ModeratorsList, ModeratorsBox, ModeratorsImportBox> {
        private list: ModeratorsList;
        private box: ModeratorsBox;
        private boxImport: ModeratorsImportBox;

        public getList(): ModeratorsList {
            return this.list;
        }
        public getBox(): ModeratorsBox {
            return this.box;
        }
        public getImportBox(): ModeratorsImportBox {
            return this.boxImport;
        }

        render(): JSX.Element {
            return (
                <div>
                    <ModeratorsList ref={(ref: ModeratorsList) => this.list = ref} title="Moderator computer" actionUrl={this.props.actionUrl} classroomId={this.props.classroomId} loadMethod="LoadModerators" showBoxImport={() => this.showBoxImport() }  showEnableClass={this.showEnableClass.bind(this) }  showDisableClass={this.showDisableClass.bind(this) } showBoxNew={this.showBoxNew.bind(this) } showBoxEdit={this.showBoxEdit.bind(this) } showBoxDelete={this.showBoxDelete.bind(this) } />
                    <ModeratorsBox ref={(ref: ModeratorsBox) => this.box = ref} title="Moderator computer" actionUrl={this.props.actionUrl} classroomId={this.props.classroomId} getListItems={this.getListItems.bind(this) } setListItems={this.setListItems.bind(this) } />
                    <ModeratorsImportBox ref={(ref: ModeratorsImportBox) => this.boxImport = ref} title="Import Moderator computers" classroomId={this.props.classroomId} getListItems={this.getListItems.bind(this) } setListItems={this.setListItems.bind(this) }></ModeratorsImportBox>
                </div>
            );
        }
    }

    interface IModeratorsListProps extends IListProps<string> { }
    interface IModeratorsListState extends IListState<IModeratorsListItem> { }

    class ModeratorsList extends List<string, IModeratorsListItem, IModeratorsListProps, IModeratorsListState> {

        renderItemCols(d: IModeratorsListItem): JSX.Element[] {
            let l: Array<JSX.Element> = [];
            l.push(<td key={"tdId_" + d.id}>{d.id}</td>);
            l.push(<td key={"tdName_" + d.id}>{d.name}</td>);
            return l;
        }
        renderTableHeaderCols(): JSX.Element[] {
            let l: Array<JSX.Element> = [];
            l.push(<th key={"thId"}>ID</th>);
            l.push(<th key={"thModerator"}>Moderator computer</th>);
            return l;
        }
    }

    interface IModeratorsBoxProps extends IBoxProps<IModeratorsListItem> { }
    interface IModeratorsBoxState extends IBoxState<IModeratorsListItem> { }

    class ModeratorsBox extends Box<string, IModeratorsListItem, IModeratorsBoxProps, IModeratorsBoxState> {

        constructor(props: IModeratorsBoxProps) {
            super({ id: "", name: "" } as IModeratorsListItem,
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
                    this.setValidationStatus(FORM_ID, BoxValidationStatus.Error, "Moderator computer Id cannot be empty. It must be unique and contains only alphanumeric characters.");
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
                    this.setValidationStatus(FORM_NAME, BoxValidationStatus.Error, "Moderator computer name cannot be empty.");
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
                url: "/api/Classroom/" + this.props.classroomId + "/IsModeratorExists/" + id,
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
                    this.close();
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

                this.setValidationStatus(FORM_ID, BoxValidationStatus.Error, "Moderator computer Id already exists.");
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
                url: "/api/Classroom/" + this.props.classroomId + "/CreateModerator",
                data: JSON.stringify({ id: idVal, name: nameVal } as IModeratorsListItem),
                contentType: "application/json",
                success: (r: Global.Data.IDataResponse<IModeratorsListItem>): void => {
                    this.close();
                    if (r.status === Global.Data.RESPONSE_SUCCESS) {
                        // add to list
                        let d: Array<IModeratorsListItem> = this.props.getListItems();
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
                    this.close();
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
                url: "/api/Classroom/" + this.props.classroomId + "/UpdateModerator",
                data: JSON.stringify({ id: idVal, name: nameVal } as IModeratorsListItem),
                contentType: "application/json",
                success: (r: Global.Data.IDataResponse<IModeratorsListItem>): void => {
                    this.close();
                    if (r.status === Global.Data.RESPONSE_SUCCESS) {
                        // update list
                        let d: Array<IModeratorsListItem> = this.props.getListItems();
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
                    this.close();
                }
            });
        }
        doDelete(): void {
            $.ajax({
                cache: false,
                type: "POST",
                url: "/api/Classroom/" + this.props.classroomId + "/DeleteModerator",
                data: JSON.stringify(this.state.item.id),
                contentType: "application/json",
                success: (r: Global.Data.IDataResponse<string>): void => {
                    this.close();
                    if (r.status === Global.Data.RESPONSE_SUCCESS) {
                        // remove from list
                        let d: Array<IModeratorsListItem> = this.props.getListItems();
                        let _d: Array<IModeratorsListItem> = [];
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
                    this.close();
                }
            });
        }

        renderForm(): JSX.Element {
            return (
                <form className="form-horizontal" role="form">
                    <div ref={REF_FORM_DIV + FORM_ID} className="form-group">
                        <label className="col-sm-2" htmlFor={REF_FORM_TB + FORM_ID}>Id: </label>
                        <div className="col-sm-10">
                            <input ref={REF_FORM_TB + FORM_ID} type="text" className="form-control" disabled={this.state.type !== BoxTypes.Create} placeholder="Moderator computer Id" maxLength="25" onPaste={() => this.validateId(false) } onCut={() => this.validateId(false) } onKeyUp={(e: KeyboardEvent) => this.onKeyPressId(e) } />
                            <span ref={REF_FORM_ICON + FORM_ID} style={{ display: "none" }}></span>
                        </div>
                    </div>
                    <div ref={REF_FORM_DIV + FORM_NAME} className="form-group">
                        <label className="col-sm-2" htmlFor={REF_FORM_TB + FORM_NAME}>Name: </label>
                        <div className="col-sm-10">
                            <input ref={REF_FORM_TB + FORM_NAME} type="text" className="form-control" disabled={this.state.type === BoxTypes.Delete} placeholder="Moderator computer name" maxLength="150" onPaste={() => this.validateName(false) } onCut={() => this.validateName(false) } onKeyUp={(e: KeyboardEvent) => this.onKeyPressName(e) } />
                            <span ref={REF_FORM_ICON + FORM_NAME} style={{ display: "none" }}></span>
                        </div>
                    </div>
                </form>
            );
        }
    }

    interface IModeratorsImportBoxProps extends IImportBoxProps<IModeratorsListItem> { }
    interface IModeratorsImportBoxState extends IImportBoxState<IModeratorsListItem> { }

    class ModeratorsImportBox extends ImportBox<string, IModeratorsListItem, IModeratorsImportBoxProps, IModeratorsImportBoxState> {
        constructor(props: IModeratorsImportBoxProps) {
            super(props);
        }

        renderHelp(): JSX.Element {
            return (
                <div className="text-muted">
                    EXAMPLE: <br />
                    ID1, "Moderator Name"<br />
                    ID2, "Moderator Name"<br />
                    ID3, "Moderator Name"<br />
                </div>
            );
        }

        placeholder(): string {
            return "ID1, \"Moderator Name\"\nID2, \"Moderator Name\"\nID3, \"Moderator Name\"";
        }

        import(): void {
            this.hideError();
            this.setProcessing(true);

            let data: string = this.tb.value;

            if (data.length === 0) {
                // nothing to import
                this.showError("ERROR: Nothing to import", 2000);
                this.setProcessing(false);
            } else {
                $.ajax({
                    cache: false,
                    type: "POST",
                    url: "/api/Classroom/" + this.props.classroomId + "/ImportModerators",
                    data: JSON.stringify(data),
                    contentType: "application/json",
                    success: (r: Global.Data.IDataResponse<Array<IModeratorsListItem>>): void => {
                        if (r.status === Global.Data.RESPONSE_SUCCESS) {
                            this.tb.value = "";
                            this.close();
                            // add to list
                            let d: Array<IModeratorsListItem> = this.props.getListItems();
                            r.data.forEach((item: IModeratorsListItem) => {
                                d.push(item);
                            });
                            this.props.setListItems(d);
                        } else {
                            // error
                            this.showError("ERROR: " + r.message);
                            this.setProcessing(false);
                        }
                    },
                    error: (xhr: JQueryXHR, status: string, error: string): void => {
                        // error
                        alert("ERROR: " + error);
                        this.close();
                    }
                });
            }
        }
    }
}