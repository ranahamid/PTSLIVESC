/* tslint:disable:max-line-length */

namespace VC.Admin.Lists {
    "use strict";

    const FORM_ID: string = "Id";
    const FORM_NAME: string = "Name";

    interface IClassroomsListItem extends IDataItem<string> {
        name: string;
        url: string;
    }

    export class Classrooms extends Base<string, IClassroomsListItem, ClassroomsList, ClassroomsBox, ClassroomsImportBox> {
        private tabs: Global.Components.Tabs;
        private list: ClassroomsList;
        private box: ClassroomsBox;
        private boxImport: ClassroomsImportBox;

        private tabOnClick(id: number): void {
            this.tabs.selectItem(id);

            if (id === -2) {
                // back to Home
                top.location = "/" as any;
            } else if (id === -1) {
                // classrooms
                top.location = "/Admin/" as any;
            }
        }

        public getList(): ClassroomsList {
            return this.list;
        }
        public getBox(): ClassroomsBox {
            return this.box;
        }
        public getImportBox(): ClassroomsImportBox {
            return this.boxImport;
        }

        componentDidMount(): void {
            this.init();
        }

        render(): JSX.Element {
            let tabItems: Array<Global.Components.ITabItemProps> = [
                { id: -2, title: "Home", onClick: this.tabOnClick.bind(this), active: false },
                { id: -1, title: "Classrooms", onClick: this.tabOnClick.bind(this), active: true }
            ];

            return (
                <div>
                    <div>
                        <Global.Components.Tabs ref={(ref: Global.Components.Tabs) => this.tabs = ref} items={tabItems} className="cTabs" />
                    </div>
                    <div>
                        <ClassroomsList ref={(ref: ClassroomsList) => this.list = ref} title="Classroom" actionUrl={this.props.actionUrl} loadMethod="Load" showBoxImport={() => this.showBoxImport() } showBoxNew={this.showBoxNew.bind(this) } showBoxEdit={this.showBoxEdit.bind(this) } disableClass={this.disableClass.bind(this) } showBoxDelete={this.showBoxDelete.bind(this) } />
                        <ClassroomsBox ref={(ref: ClassroomsBox) => this.box = ref} title="Classroom" actionUrl={this.props.actionUrl} getListItems={this.getListItems.bind(this) } setListItems={this.setListItems.bind(this) } />
                        <ClassroomsImportBox ref={(ref: ClassroomsImportBox) => this.boxImport = ref} title="Import Classrooms" classroomId={this.props.classroomId} getListItems={this.getListItems.bind(this) } setListItems={this.setListItems.bind(this) }></ClassroomsImportBox>
                        
                    </div>
                    
                </div>
               
            );
        }
    }

    interface IClassroomsListProps extends IListProps<string> { }
    interface IClassroomsListState extends IListState<IClassroomsListItem> { }

    class ClassroomsList extends List<string, IClassroomsListItem, IClassroomsListProps, IClassroomsListState> {

        renderItemCols(d: IClassroomsListItem): JSX.Element[] {
            let l: Array<JSX.Element> = [];
            l.push(<td key={"tdId_" + d.id}>{d.id}</td>);
            l.push(<td key={"tdName_" + d.id}><a href={d.url}>{d.name}</a></td>);
            return l;
        }
        renderTableHeaderCols(): JSX.Element[] {
            let l: Array<JSX.Element> = [];
            l.push(<th key={"thId"}>ID</th>);
            l.push(<th key={"tdName"}>Classname</th>);
            return l;
        }
    }

    interface IClassroomsBoxProps extends IBoxProps<IClassroomsListItem> { }
    interface IClassroomsBoxState extends IBoxState<IClassroomsListItem> { }

    class ClassroomsBox extends Box<string, IClassroomsListItem, IClassroomsBoxProps, IClassroomsBoxState> {

        constructor(props: IClassroomsBoxProps) {
            super({ id: "", name: "" } as IClassroomsListItem,
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
                    this.setValidationStatus(FORM_ID, BoxValidationStatus.Error, "Classroom Id cannot be empty. It must be unique and contains only alphanumeric characters.");
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
                    this.setValidationStatus(FORM_NAME, BoxValidationStatus.Error, "Classroom name cannot be empty.");
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
                url: "/api/Classroom/" + id + "/IsExists",
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

                this.setValidationStatus(FORM_ID, BoxValidationStatus.Error, "Classroom Id already exists.");
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
                url: "/api/Classroom/Create",
                data: JSON.stringify({ id: idVal, name: nameVal, url: null } as IClassroomsListItem),
                contentType: "application/json",
                success: (r: Global.Data.IDataResponse<IClassroomsListItem>): void => {
                    this.close();
                    if (r.status === Global.Data.RESPONSE_SUCCESS) {
                        // add to list
                        let d: Array<IClassroomsListItem> = this.props.getListItems();
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
                url: "/api/Classroom/Update",
                data: JSON.stringify({ id: idVal, name: nameVal, url: null } as IClassroomsListItem),
                contentType: "application/json",
                success: (r: Global.Data.IDataResponse<IClassroomsListItem>): void => {
                    this.close();
                    if (r.status === Global.Data.RESPONSE_SUCCESS) {
                        // update list
                        let d: Array<IClassroomsListItem> = this.props.getListItems();
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
                url: "/api/Classroom/Delete",
                data: JSON.stringify(this.state.item.id),
                contentType: "application/json",
                success: (r: Global.Data.IDataResponse<string>): void => {
                    this.close();
                    if (r.status === Global.Data.RESPONSE_SUCCESS) {
                        // remove from list
                        let d: Array<IClassroomsListItem> = this.props.getListItems();
                        let _d: Array<IClassroomsListItem> = [];
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
                            <input ref={REF_FORM_TB + FORM_ID} type="text" className="form-control" disabled={this.state.type !== BoxTypes.Create} placeholder="Classroom Id" maxLength="25" onPaste={() => this.validateId(false) } onCut={() => this.validateId(false) } onKeyUp={(e: KeyboardEvent) => this.onKeyPressId(e) } />
                            <span ref={REF_FORM_ICON + FORM_ID} style={{ display: "none" }}></span>
                        </div>
                    </div>
                    <div ref={REF_FORM_DIV + FORM_NAME} className="form-group">
                        <label className="col-sm-2" htmlFor={REF_FORM_TB + FORM_NAME}>Name: </label>
                        <div className="col-sm-10">
                            <input ref={REF_FORM_TB + FORM_NAME} type="text" className="form-control" disabled={this.state.type === BoxTypes.Delete} placeholder="Classroom name" maxLength="150" onPaste={() => this.validateName(false) } onCut={() => this.validateName(false) } onKeyUp={(e: KeyboardEvent) => this.onKeyPressName(e) } />
                            <span ref={REF_FORM_ICON + FORM_NAME} style={{ display: "none" }}></span>
                        </div>
                    </div>
                </form>
            );
        }
    }

    interface IClassroomsImportBoxProps extends IImportBoxProps<IClassroomsListItem> { }
    interface IClassroomsImportBoxState extends IImportBoxState<IClassroomsListItem> { }

    class ClassroomsImportBox extends ImportBox<string, IClassroomsListItem, IClassroomsImportBoxProps, IClassroomsImportBoxState> {
        constructor(props: IClassroomsImportBoxProps) {
            super(props);
        }

        renderHelp(): JSX.Element {
            return (
                <div className="text-muted">
                    EXAMPLE:<br />
                    ID1, "Classroom Name"<br />
                    ID2, "Classroom Name"<br />
                    ID3, "Classroom Name"<br />
                </div>
            );
        }

        placeholder(): string {
            return "ID1, \"Classroom Name\"\nID2, \"Classroom Name\"\nID3, \"Classroom Name\"";
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
                    url: "/api/Classroom/Import",
                    data: JSON.stringify(data),
                    contentType: "application/json",
                    success: (r: Global.Data.IDataResponse<Array<IClassroomsListItem>>): void => {
                        if (r.status === Global.Data.RESPONSE_SUCCESS) {
                            this.tb.value = "";
                            this.close();
                            // add to list
                            let d: Array<IClassroomsListItem> = this.props.getListItems();
                            r.data.forEach((item: IClassroomsListItem) => {
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

