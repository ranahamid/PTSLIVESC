/* tslint:disable:max-line-length */

namespace VC.Admin.Lists {
    "use strict";

    export const REF_FORM_DIV: string = "div";
    export const REF_FORM_TB: string = "tb";
    export const REF_FORM_ICON: string = "ico";

    // enums
    export enum ListStatus {
        Loading,
        Success,
        Error,
    }
    export enum BoxTypes {
        Create,
        Edit,
        Disable,
        Delete,
        Enable
        
    }
    export enum BoxValidationStatus {
        None,
        Success,
        Error
    }

    // data
    export interface IDataItem<R> {
        id: R;
    }

    // base props/state
    export interface IProps {
        actionUrl: string;
        classroomId?: string;
    }
    export interface IState {
    }

    // list props/state
    export interface IListProps<R> {
        actionUrl: string;
        classroomId?: string;
        loadMethod: string;
        title: string;
        showBoxImport?: () => void;
        showBoxNew: () => void;
        showBoxEdit: (id: R) => void;
        showDisableClass: (id: R) => void;
        showEnableClass: (id: R) => void;
        showBoxDelete: (id: R) => void;
        
    }
    export interface IListState<D> {
        status: ListStatus;
        errorMessage: string;
        data: Array<D>;
    }

    // box props/state
    export interface IBoxProps<D> {
        actionUrl: string;
        classroomId?: string;
        title: string;
        getListItems: () => Array<D>;
        setListItems: (data: Array<D>) => void;
    }
    export interface IBoxState<D> {
        type: BoxTypes;
        item: D;
    }

    // === BOX ===
    export interface IBox<R, D> {
        defaultItem: D;
        open(type: BoxTypes, item: D): void;
        close(): void;
    }

    export abstract class Box<R, D extends IDataItem<R>, P extends IBoxProps<D>, S extends IBoxState<D>> extends React.Component<P, S> implements IBox<R, D> {
        private divBox: HTMLDivElement;
        public divButtons: HTMLDivElement;
        public divProcessing: HTMLDivElement;

        constructor(public defaultItem: D, props: P) {
            super(props);
            this.state = { type: BoxTypes.Create, item: defaultItem } as S;
        }

        componentDidMount(): void {
            $(this.divBox).on("shown.bs.modal", () => this.boxDidShow());
            $(this.divBox).on("hidden.bs.modal", () => this.boxDidHide());
        }

        private show(): void {
            // show
            this.boxWillShow();

            $(this.divBox).modal("show");

            this.divButtons.style.display = "block";
            this.divProcessing.style.display = "none";
        }

        // box methods
        public open(type: BoxTypes, item: D): void {
            this.setState({ type: type, item: item as D } as S, () => this.show());
        }
        abstract boxWillShow(): void; // abstract
        abstract boxDidShow(): void; // abstract

        public close(): void {
            this.hide();
        }
        private hide(): void {
            $(this.divBox).modal("hide");
        }
        private boxDidHide(): void {
            this.divButtons.style.display = "block";
            this.divProcessing.style.display = "none";
        }

        public setValidationStatus(ref: string, status: BoxValidationStatus, tooltip: string): void {
            let div: HTMLDivElement = this.refs[REF_FORM_DIV + ref] as HTMLDivElement;
            let icon: HTMLSpanElement = this.refs[REF_FORM_ICON + ref] as HTMLSpanElement;
            let tb: Element = this.refs[REF_FORM_TB + ref] as Element;

            switch (status) {
                case BoxValidationStatus.None:
                    div.className = "form-group";
                    icon.className = "";
                    icon.style.display = "none";
                    break;
                case BoxValidationStatus.Success:
                    div.className = "form-group has-success has-feedback";
                    icon.className = "glyphicon glyphicon-ok form-control-feedback";
                    icon.style.display = "block";
                    break;
                case BoxValidationStatus.Error:
                    div.className = "form-group has-error has-feedback";
                    icon.className = "glyphicon glyphicon-warning-sign form-control-feedback";
                    icon.style.display = "block";
                    break;
            }

            if (tooltip !== "") {
                $(tb).attr("data-toggle", "tooltip");
                $(tb).attr("data-placement", "bottom");
                $(tb).attr("title", tooltip);
                $(tb).tooltip();
            } else {
                $(tb).removeAttr("data-toggle");
                $(tb).removeAttr("data-placement");
                $(tb).removeAttr("title");
                $(tb).tooltip("destroy");
            }
        }

        // abstract methods
        abstract renderForm(): JSX.Element;
        abstract submitForm(): void;

        // render
        render(): JSX.Element {

            let title: string = "";
            let buttonTitle: string = "";
            let buttonClassName: string = "";
            let buttonIcon: string = "";

            switch (this.state.type) {
                case BoxTypes.Create:
                    title = "New " + this.props.title;
                    buttonTitle = "Create";
                    buttonClassName = "btn btn-success";
                    buttonIcon = "glyphicon glyphicon-plus";
                    break;
                case BoxTypes.Edit:
                    title = "Edit " + this.props.title;
                    buttonTitle = "Save";
                    buttonClassName = "btn btn-success";
                    buttonIcon = "glyphicon glyphicon-floppy-disk";
                    break;

                case BoxTypes.Disable:
                    title = "Disable " + this.props.title;
                    buttonTitle = "Disable";
                    buttonClassName = "btn btn-warning";
                    buttonIcon = "glyphicon glyphicon-minus-sign";
                    break;
                case BoxTypes.Enable:
                    title = "Enable " + this.props.title;
                    buttonTitle = "Enable";
                    buttonClassName = "btn btn-success";
                    buttonIcon = "glyphicon glyphicon-plus-sign";
                    break;

                case BoxTypes.Delete:
                    title = "Delete " + this.props.title;
                    buttonTitle = "Delete";
                    buttonClassName = "btn btn-danger";
                    buttonIcon = "glyphicon glyphicon-trash";
                    break;
            }

            return (
                <div ref={(ref: HTMLDivElement) => this.divBox = ref} className="modal fade" role="dialog">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <button type="button" className="close" data-dismiss="modal">&times; </button>
                                <h4 className="modal-title">{title}</h4>
                            </div>
                            <div className="modal-body">
                                {this.renderForm() }
                            </div>
                            <div ref={(ref: HTMLDivElement) => this.divButtons = ref} style={{ display: "block" }} className="modal-footer">
                                <button type="button" className={buttonClassName} onClick={() => this.submitForm() }><span className={buttonIcon}></span> {buttonTitle}</button>
                                <button type="button" className="btn btn-default" data-dismiss="modal">Close</button>
                            </div>
                            <div ref={(ref: HTMLDivElement) => this.divProcessing = ref} style={{ display: "none" }} className="modal-footer">
                                <span>Processing ...</span>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
    }

    // === IMPORT BOX ===
    export interface IImportBoxProps<D> {
        title: string;
        classroomId?: string;
        getListItems: () => Array<D>;
        setListItems: (data: Array<D>) => void;
    }
    export interface IImportBoxState<D> {
        errorMessage: string;
        errorTime: number;
    }

    export interface IImportBox<R, D> {
        open(): void;
        close(): void;
    }

    export abstract class ImportBox<R, D extends IDataItem<R>, P extends IImportBoxProps<D>, S extends IImportBoxState<D>> extends React.Component<P, S> implements IImportBox<R, D> {
        private divBox: HTMLDivElement;
        public divButtons: HTMLDivElement;
        public divProcessing: HTMLDivElement;
        private divError: HTMLDivElement;
        private divHelp: HTMLDivElement;
        public tb: HTMLTextAreaElement;

        constructor(props: P) {
            super(props);
            this.state = { errorMessage: "", errorTime: 0 } as S;
        }

        componentDidMount(): void {
            $(this.divBox).on("shown.bs.modal", () => this.boxDidShow());
            $(this.divBox).on("hidden.bs.modal", () => this.boxDidHide());
        }

        public open(): void {
            this.show();
        }
        private show(): void {
            this.boxWillShow();

            $(this.divBox).modal("show");

            this.divButtons.style.display = "block";
            this.divProcessing.style.display = "none";
            this.divError.style.display = "none";
        }
        private boxWillShow(): void {
            // implement
        }
        private boxDidShow(): void {
            // implement
        }

        public close(): void {
            this.hide();
        }
        private hide(): void {
            $(this.divBox).modal("hide");
        }
        private boxDidHide(): void {
            this.divButtons.style.display = "block";
            this.divProcessing.style.display = "none";
            this.divError.style.display = "none";
        }

        public showError(errorMessage: string, errorTime: number = null): void {
            this.setState({ errorMessage: errorMessage } as S);
            this.divError.style.display = "block";
            if (errorTime) {
                window.setTimeout(() => { this.hideError(); }, errorTime);
            }
        }
        public hideError(): void {
            this.divError.style.display = "none";
        }

        public setProcessing(processing: boolean): void {
            this.divButtons.style.display = processing ? "none" : "block";
            this.divProcessing.style.display = processing ? "block" : "none";
        }

        private helpClick(): void {
            $(this.divHelp).slideToggle();
        }

        abstract import(): void;

        abstract renderHelp(): JSX.Element;
        abstract placeholder(): string;

        render(): JSX.Element {
            return (
                <div ref={(ref: HTMLDivElement) => this.divBox = ref} className="modal fade" role="dialog">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <button type="button" className="close" data-dismiss="modal">&times; </button>
                                <h4 className="modal-title">{this.props.title}</h4>
                            </div>
                            <div className="modal-body">
                                <div style={{ textAlign: "right" }}><span className="glyphicon glyphicon-info-sign" style={{ cursor: "pointer" }} onClick={() => this.helpClick() }></span></div>
                                <div ref={(ref: HTMLDivElement) => this.divHelp = ref} style={{ display: "none" }}>{this.renderHelp() }</div>
                                <div><textarea ref={(ref: HTMLTextAreaElement) => this.tb = ref} className="importTextbox" placeholder={this.placeholder() }></textarea></div>
                                <div ref={(ref: HTMLDivElement) => this.divError = ref} className="text-danger" style={{ display: "none" }}>{this.state.errorMessage}</div>
                            </div>
                            <div ref={(ref: HTMLDivElement) => this.divButtons = ref} style={{ display: "block" }} className="modal-footer">
                                <button type="button" className="btn btn-success" onClick={() => this.import() }><span className="glyphicon glyphicon-import"></span> Import</button>
                                <button type="button" className="btn btn-default" data-dismiss="modal">Close</button>
                            </div>
                            <div ref={(ref: HTMLDivElement) => this.divProcessing = ref} style={{ display: "none" }} className="modal-footer">
                                <span>Processing ...</span>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
    }

    // === LIST ===
    export interface IList<R, D> {
        init(): void;
        getItem(id: R): D;
        getListItems(): Array<D>;
        setListItems(data: Array<D>): void;
    }
    export abstract class List<R, D extends IDataItem<R>, P extends IListProps<R>, S extends IListState<D>> extends React.Component<P, S> implements IList<R, D> {
        constructor(props: P) {
            super(props);
            this.state = { status: ListStatus.Loading, errorMessage: "", data: null } as S;
        }

        public init(): void {
            this.loadData();
        }

        private loadData(): void {
            $.ajax({
                cache: false,
                type: "GET",
                url: "/api/Classroom/" + (this.props.classroomId === undefined ? "" : this.props.classroomId + "/") + this.props.loadMethod,
                success: (r: Global.Data.IDataResponse<Array<D>>): void => {
                    if (r.status === Global.Data.RESPONSE_SUCCESS) {
                        this.setState({ status: ListStatus.Success, errorMessage: "", data: r.data } as S);
                    } else {
                        this.setErrorMessage(r.message);
                    }
                },
                error: (xhr: JQueryXHR, status: string, error: string): void => {
                    this.setErrorMessage("XHR Error - " + xhr.statusText);
                }
            });
        }
        private setErrorMessage(errorMessage: string): void {
            this.setState({ status: ListStatus.Error, errorMessage: errorMessage, data: null } as S);
        }

        public getItem(id: R): D {
            let item: D = null;
            for (let i: number = 0; i < this.state.data.length && item == null; i++) {
                if (this.state.data[i].id === id) {
                    item = this.state.data[i];
                }
            }
            return item;
        }
        public getListItems(): Array<D> {
            return this.state.data;
        }
        public setListItems(data: Array<D>): void {
            this.setState({ status: this.state.status, errorMessage: this.state.errorMessage, data: data } as S);
        }

        renderLoader(): JSX.Element {
            return (
                <div className="text-muted">Loading ...</div>
            );
        }
        renderError(message: string): JSX.Element {
            return (
                <div className="text-danger">ERROR: {message}</div>
            );
        }
        renderNotFound(): JSX.Element {
            return (
                <div className="text-muted">No {this.props.title} found.</div>
            );
        }
        renderBody(): JSX.Element {
            let body: JSX.Element;

            if (this.state.status === ListStatus.Loading) {
                // loading
                body = this.renderLoader();
            } else if (this.state.status === ListStatus.Error) {
                // error
                body = this.renderError(this.state.errorMessage);
            } else if (this.state.data.length === 0) {
                body = this.renderNotFound();
            } else {
                body = this.renderTable();
            }

            return (
                <div className="panel-body">{body}</div>
            );
        }

        renderItem(d: D): JSX.Element {
            return (
                <tr key={d.id}>
                    {this.renderItemCols(d) }
                    <td style={{ textAlign: "right" }}>
                        <button type="button" className="btn btn-sm btn-info"    onClick={() => this.props.showBoxEdit(d.id) }><span className="glyphicon glyphicon-pencil"></span>Edit</button>
                        &nbsp;
                        <button type="button" style={{ display: "none" }} className="showDisableClass btn btn-sm btn-warning" onClick={() => this.props.showDisableClass(d.id) } ><span className="glyphicon glyphicon-minus-sign"></span>Disable</button>
                        &nbsp;  
                        <button type="button" style={{ display: "none" }} className="showEnableClass btn btn-sm btn-success" onClick={() => this.props.showEnableClass(d.id) } ><span className="glyphicon glyphicon-plus-sign"></span>Enable</button>
                        &nbsp;                        
                        <button type="button" className="btn btn-sm btn-danger"  onClick={() => this.props.showBoxDelete(d.id) }><span className="glyphicon glyphicon-trash"></span>Delete</button>
                    </td>
                </tr>
            );
        }
        renderTable(): JSX.Element {
            let items: Array<JSX.Element> = [];
            this.state.data.forEach((d: D) => items.push(this.renderItem(d)));
            return (
                <table className="table" align="center">
                    <thead>
                        <tr>
                            {this.renderTableHeaderCols() }
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {items}
                    </tbody>
                </table>
            );
        }

        abstract renderItemCols(d: D): JSX.Element[];
        abstract renderTableHeaderCols(): JSX.Element[];

        render(): JSX.Element {
            return (
                <div>
                    <div className="panel panel-default">
                        <div className="panel-heading"><h4>{this.props.title}s</h4></div>
                        {this.renderBody() }
                    </div>
                    <div style={{ display: (this.state.data !== null ? "block" : "none") }}>
                        <div style={{ display: "inline", paddingRight: "5px" }}><button type="button" className="btn btn-sm btn-success" onClick={() => this.props.showBoxNew() }><span className="glyphicon glyphicon-plus"></span> Add New {this.props.title}</button></div>
                        <div style={{ display: (this.props.showBoxImport !== undefined ? "inline" : "none") }}><button type="button" className="btn btn-sm btn-info" onClick={() => this.props.showBoxImport() }><span className="glyphicon glyphicon-import"></span> Import {this.props.title}s</button></div>
                    </div>
                </div>
            );
        }
    }

    // === BASE ===
    export abstract class Base<R, D, L extends IList<R, D>, B extends IBox<R, D>, I extends IImportBox<R, D>> extends React.Component<IProps, IState> {
        private initied: boolean = false;

        constructor(props: IProps) {
            super(props);
        }

        private getItem(id: R): D {
            let List1: L = this.getList();
            return List1.getItem(id) as D;
        }

        public showBoxNew(): void {
            let Box1: B = this.getBox();
            Box1.open(BoxTypes.Create, Box1.defaultItem);
        }
        public showBoxEdit(id: R): void {
            let item: D = this.getItem(id);
            if (item !== null) {
                let Box1: B = this.getBox();
                Box1.open(BoxTypes.Edit, item);
            }
        }

        public showDisableClass(id: R): void {
            let item: D = this.getItem(id);
            if (item !== null) {
                let Box1: B = this.getBox();
                Box1.open(BoxTypes.Disable, item);
            }
        }
    
        public showEnableClass(id: R): void {
            let item: D = this.getItem(id);
            if (item !== null) {
                let Box1: B = this.getBox();
                Box1.open(BoxTypes.Enable, item);
            }
        }


        public showBoxDelete(id: R): void {
            let item: D = this.getItem(id);
            if (item !== null) {
                let Box1: B = this.getBox();
                Box1.open(BoxTypes.Delete, item);
            }
        }
        
      

        public showBoxImport(): void {
            let ImportBox1: I = this.getImportBox();
            ImportBox1.open();
        }

        public getListItems(): Array<D> {
            let List1: L = this.getList();
            return List1.getListItems();
        }
        public setListItems(data: Array<D>): void {
            let List1: L = this.getList();
            List1.setListItems(data);
        }

        abstract getList(): L;
        abstract getBox(): B;
        abstract getImportBox(): I;

        public init(): void {
            if (!this.initied) {
                this.initied = true;
                let list1: L = this.getList();
                list1.init();
            }
        }
    }
}