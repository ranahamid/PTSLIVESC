/* tslint:disable:max-line-length */

namespace VC.App.TC {
    "use strict";

    enum ListStatus {
        Loading,
        Success,
        Error,
    }

    // forms List
    interface IFormsListItem {
        id: string;
        title: string;
        type: Forms.FormType;
        pendingCount: number;
        answeredCount: number;
        declinedCount: number;
    }

    interface IFormsListProps {
        actionUrl: string;
        type: Forms.FormType;
        onSendFormClick: (item: IFormsListItem) => void;
        onViewAnswerClick: (item: IFormsListItem) => void;
    }
    interface IFormsListState {
        status: ListStatus;
        errorMessage: string;
        items: Array<IFormsListItem>;
    }

    class FormsList extends React.Component<IFormsListProps, IFormsListState> {
        constructor(props: IFormsListProps) {
            super(props);
            this.state = { status: ListStatus.Loading, errorMessage: "", items: null } as IFormsListState;
        }

        public loadForms(): void {
            this.setState({ status: ListStatus.Loading, errorMessage: "", items: null } as IFormsListState,
                () => this.loadData());
        }

        private loadData(): void {
            $.ajax({
                cache: false,
                type: "GET",
                url: this.props.actionUrl + "/LoadForms",
                data: { type: this.props.type },
                contentType: "application/json",
                success: (r: VC.Global.Data.IDataResponse<Array<IFormsListItem>>): void => {
                    if (r.status === VC.Global.Data.RESPONSE_SUCCESS) {
                        // success
                        this.setState({ status: ListStatus.Success, errorMessage: "", items: r.data });
                    } else {
                        // error
                        this.setState({ status: ListStatus.Error, errorMessage: r.message, items: null });
                    }
                },
                error: (xhr: JQueryXHR, status: string, error: string): void => {
                    // error
                    this.setState({ status: ListStatus.Error, errorMessage: error, items: null });
                }
            });
        }

        public answerReceived(formId: string, status: Forms.FormAnswerStatus, count?: number): void {
            // try to find the form and update status
            if (count === undefined) {
                count = 1;
            }
            this.state.items.forEach((item: IFormsListItem) => {
                if (item.id === formId) {
                    if (status === Forms.FormAnswerStatus.Answered) {
                        item.answeredCount += count;
                        item.pendingCount -= count;
                    } else if (status === Forms.FormAnswerStatus.Declined) {
                        item.declinedCount += count;
                        item.pendingCount -= count;
                    } else if (status === Forms.FormAnswerStatus.Pending) {
                        item.pendingCount += count;
                    }
                }
            });
            this.setState({ items: this.state.items } as IFormsListState);
        }

        public viewButtonTitleByType(type: Forms.FormType): string {
            let title: string = "";
            switch (type) {
                case Forms.FormType.Survey: title = "Answers"; break;
                case Forms.FormType.Poll: title = "Results"; break;
            }
            return title;
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
                <div className="text-muted">No {FormsTc.getTitleByType(this.props.type) } found.</div>
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
            } else if (this.state.items.length === 0) {
                body = this.renderNotFound();
            } else {
                body = this.renderTable();
            }

            return (
                <div className="panel-body">{body}</div>
            );
        }

        renderItem(item: IFormsListItem): JSX.Element {
            return (
                <tr key={item.id}>
                    <td>{item.title}</td>
                    <td style={{ textAlign: "center" }}>
                        <span className="badge" style={item.pendingCount === 0 ? { backgroundColor: "Gray" } : { backgroundColor: "#f0ad4e" }}>{item.pendingCount}</span> <span className="badge" style={item.answeredCount === 0 ? { backgroundColor: "Gray" } : { backgroundColor: "Green" }}>{item.answeredCount}</span> <span className="badge" style={item.declinedCount === 0 ? { backgroundColor: "Gray" } : { backgroundColor: "Red" }}>{item.declinedCount}</span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                        <button type="button" className="btn btn-sm btn-success" onClick={() => this.props.onSendFormClick(item) }><span className="glyphicon glyphicon-envelope"></span> Send</button>
                        &nbsp;
                        <button type="button" className="btn btn-sm btn-info" onClick={() => this.props.onViewAnswerClick(item) }><span className="glyphicon glyphicon-eye-open"></span> {this.viewButtonTitleByType(this.props.type) }</button>
                    </td>
                </tr>
            );
        }
        renderTable(): JSX.Element {
            let items: Array<JSX.Element> = [];
            this.state.items.forEach((item: IFormsListItem) => items.push(this.renderItem(item)));
            return (
                <table className="table" align="center">
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th style={{ textAlign: "center" }}>Pending / Received / Declined</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {items}
                    </tbody>
                </table>
            );
        }

        render(): JSX.Element {
            return (
                <div>
                    <div className="panel panel-default">
                        <div className="panel-heading"><h4>{FormsTc.getTitleByType(this.props.type) }s</h4></div>
                        {this.renderBody() }
                    </div>
                </div>
                );
        }
    }

    // answers status
    interface IAnswersStatusProps {
        title: string;
        type: Forms.FormType;
        onDeleteAll: () => void;
    }
    interface IAnswersStatusState {
        answeredCount: number;
        pendingCount: number;
        declinedCount: number;
    }

    class AnswersStatus extends React.Component<IAnswersStatusProps, IAnswersStatusState> {
        private deleteBox: DeleteBox;

        constructor(props: IAnswersStatusProps) {
            super(props);
            this.state = { answeredCount: 0, pendingCount: 0, declinedCount: 0 } as IAnswersStatusState;
        }

        public init(answered: number, pending: number, declined: number): void {
            this.setState({ answeredCount: answered, pendingCount: pending, declinedCount: declined } as IAnswersStatusState);
        }

        public answerReceived(status: Forms.FormAnswerStatus): void {
            let _state: IAnswersStatusState = this.state;
            if (status === Forms.FormAnswerStatus.Answered) {
                _state.answeredCount += 1;
                _state.pendingCount -= 1;
            } else if (status === Forms.FormAnswerStatus.Declined) {
                _state.declinedCount += 1;
                _state.pendingCount -= 1;
            } else if (status === Forms.FormAnswerStatus.Pending) {
                _state.pendingCount += 1;
            }
            this.setState(_state);
        }
        public answerDeleted(status: Forms.FormAnswerStatus): void {
            let _state: IAnswersStatusState = this.state;
            if (status === Forms.FormAnswerStatus.Answered) {
                _state.answeredCount -= 1;
            } else if (status === Forms.FormAnswerStatus.Declined) {
                _state.declinedCount -= 1;
            } else if (status === Forms.FormAnswerStatus.Pending) {
                _state.pendingCount -= 1;
            }
            this.setState(_state);
        }

        private getTotalCountOfAnswers(): number {
            return this.state.answeredCount + this.state.pendingCount + this.state.declinedCount;
        }

        private onDeleteAllClick(): void {
            this.deleteBox.show(this.getTotalCountOfAnswers());
        }

        public allAnswersDeleted(): void {
            this.deleteBox.hide();
            this.setState({ answeredCount: 0, pendingCount: 0, declinedCount: 0 } as IAnswersStatusState);
        }

        render(): JSX.Element {
            let title: string = this.props.title;
            switch (this.props.type) {
                case Forms.FormType.Survey: title = "Survey: " + title; break;
                case Forms.FormType.Poll: title = "Poll: " + title; break;
            }

            return (
                <div>
                    <div className="row">
                        <div className="col-sm-3"><strong>Pending: </strong> <span className="badge" style={this.state.pendingCount === 0 ? { backgroundColor: "Gray" } : { backgroundColor: "#f0ad4e" }}>{this.state.pendingCount}</span></div>
                        <div className="col-sm-3"><strong>Answered: </strong> <span className="badge" style={this.state.answeredCount === 0 ? { backgroundColor: "Gray" } : { backgroundColor: "Green" }}>{this.state.answeredCount}</span></div>
                        <div className="col-sm-3"><strong>Declined: </strong> <span className="badge" style={this.state.declinedCount === 0 ? { backgroundColor: "Gray" } : { backgroundColor: "Red" }}>{this.state.declinedCount}</span></div>
                        <div className="col-sm-3" style={{ textAlign: "right" }}>
                            <div style={{ display: (this.getTotalCountOfAnswers() > 0 ? "block" : "none") }}><button type="button" className="btn btn-danger" onClick={() => this.onDeleteAllClick() }>Delete All</button></div>
                        </div>
                    </div>
                    <hr />
                    <DeleteBox ref={(ref: DeleteBox) => this.deleteBox = ref} title={title} onDeleteAll={() => this.props.onDeleteAll() } />
                </div>
            );
        }
    }

    // delete box
    interface IDeleteBoxProps {
        title: string;
        onDeleteAll: () => void;
    }
    interface IDeleteBoxState {
        count: number;
    }

    class DeleteBox extends React.Component<IDeleteBoxProps, IDeleteBoxState> {
        private divBox: HTMLDivElement;
        private divButtons: HTMLDivElement;
        private divProcessing: HTMLDivElement;

        constructor(props: IDeleteBoxProps) {
            super(props);
            this.state = { count: 0 } as IDeleteBoxState;
        }

        public show(count: number): void {
            this.setState({ count: count } as IDeleteBoxState, () => $(this.divBox).modal("show"));
        }

        public hide(): void {
            this.divButtons.style.display = "block";
            this.divProcessing.style.display = "none";
            $(this.divBox).modal("hide");
        }

        public onDeleteClick(): void {
            this.divButtons.style.display = "none";
            this.divProcessing.style.display = "block";
            this.props.onDeleteAll();
        }

        render(): JSX.Element {
            return (
                <div ref={(ref: HTMLDivElement) => this.divBox = ref} className="modal fade" role="dialog">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <button type="button" className="close" data-dismiss="modal">&times; </button>
                                <h4 className="modal-title"><span className="text-danger"><span className="glyphicon glyphicon-warning-sign"></span> DELETE</span></h4>
                            </div>
                            <div className="modal-body" style={{textAlign:"center"}}>
                                <div className="text-danger">All the answers to the "<strong>{this.props.title}</strong>" will be permanently deleted.</div>
                                <h3 className="text-danger">Are you sure?</h3>
                            </div>
                            <div ref={(ref: HTMLDivElement) => this.divButtons = ref} style={{ display: "block" }} className="modal-footer">
                                <button type="button" className="btn btn-danger" onClick={() => this.onDeleteClick() }><span className="glyphicon glyphicon-trash"></span> YES, Delete <span className="badge">{this.state.count}</span></button>
                                <button type="button" className="btn btn-success" data-dismiss="modal">NO, Cancel</button>
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


    // answers List
    interface IAnswersListItem {
        id: string;
        title: string;
        name: string;
        status: Forms.FormAnswerStatus;
        form: IFormsListItem;
    }

    interface IAnswersListProps {
        actionUrl: string;
        type: Forms.FormType;
        onViewClick: (item: IAnswersListItem) => void;
        onBackClick: () => void;
        onDeleteAllClick: (formId: string) => void;
    }
    interface IAnswersListState {
        formId: string;
        formTitle: string;
        status: ListStatus;
        errorMessage: string;
        items: Array<IAnswersListItem>;
    }

    class AnswersList extends React.Component<IAnswersListProps, IAnswersListState> {
        private answersStatus: AnswersStatus;

        constructor(props: IAnswersListProps) {
            super(props);
            this.state = { formId: "", formTitle: "", status: ListStatus.Loading, errorMessage: "", items: null } as IAnswersListState;
        }

        public init(item: IFormsListItem): void {
            this.answersStatus.init(item.answeredCount, item.pendingCount, item.declinedCount);
            this.setState({ formId: item.id, formTitle: item.title, status: ListStatus.Loading, errorMessage: "", items: null } as IAnswersListState,
                () => this.loadData()
            );
        }

        private loadData(): void {
            $.ajax({
                cache: false,
                type: "GET",
                url: this.props.actionUrl + "/LoadAnswers",
                data: { formUid: this.state.formId },
                contentType: "application/json",
                success: (r: VC.Global.Data.IDataResponse<Array<IAnswersListItem>>): void => {
                    if (r.status === VC.Global.Data.RESPONSE_SUCCESS) {
                        // success
                        this.setState({ formId: this.state.formId, formTitle: this.state.formTitle, status: ListStatus.Success, errorMessage: "", items: r.data });
                    } else {
                        // error
                        this.setState({ formId: this.state.formId, formTitle: this.state.formTitle, status: ListStatus.Error, errorMessage: r.message, items: null });
                    }
                },
                error: (xhr: JQueryXHR, status: string, error: string): void => {
                    // error
                    this.setState({ formId: this.state.formId, formTitle: this.state.formTitle, status: ListStatus.Error, errorMessage: error, items: null });
                }
            });
        }

        public answerReceived(answerId: string, status: Forms.FormAnswerStatus): void {
            // try to find the answer and update status
            this.state.items.forEach((item: IAnswersListItem) => {
                if (item.id === answerId) {
                    item.status = status;
                }
            });
            this.setState({ items: this.state.items } as IAnswersListState);
            this.answersStatus.answerReceived(status);
        }

        public deleteAnswer(answerId: string): void {
            let items: Array<IAnswersListItem> = [];
            this.state.items.forEach((item: IAnswersListItem) => {
                if (item.id !== answerId) {
                    items.push(item);
                } else {
                    this.answersStatus.answerDeleted(item.status);
                }
            });
            this.setState({ items: items } as IAnswersListState);
        }

        public deleteAllAnswers(): void {
            this.answersStatus.allAnswersDeleted();
            let items: Array<IAnswersListItem> = [];
            this.setState({ items: items } as IAnswersListState);
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
                <div className="text-muted">No Answer found.</div>
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
            } else if (this.state.items.length === 0) {
                body = this.renderNotFound();
            } else {
                body = this.renderTable();
            }

            return (
                <div>{body}</div>
            );
        }

        renderItemStatus(item: IAnswersListItem): JSX.Element {
            if (item.status === Forms.FormAnswerStatus.Pending) {
                // pending
                return (<span className="label label-warning">Pending {FormsTc.getTitleByType(this.props.type) }</span>);
            } else if (item.status === Forms.FormAnswerStatus.Answered) {
                // answered
                return (<span className="label label-success">Answer Received</span>);
            } else {
                // declined
                return (<span className="label label-danger">{FormsTc.getTitleByType(this.props.type) } Declined</span>);
            }
        }
        renderItemButtons(item: IAnswersListItem): JSX.Element {
            if (item.status === Forms.FormAnswerStatus.Pending) {
                // received
                return (
                    <div>
                        <button type="button" className="btn btn-sm btn-default" onClick={() => this.props.onViewClick(item) }><span className="glyphicon glyphicon-eye-open"></span> View</button>
                    </div>
                );
            } else if (item.status === Forms.FormAnswerStatus.Answered) {
                // answered
                return (
                    <div>
                        <button type="button" className="btn btn-sm btn-success" onClick={() => this.props.onViewClick(item) }><span className="glyphicon glyphicon-eye-open"></span> View</button>
                    </div>
                );
            } else {
                // declined
                return (
                    <div>
                        <button type="button" className="btn btn-sm btn-default" onClick={() => this.props.onViewClick(item) }><span className="glyphicon glyphicon-eye-open"></span> View</button>
                    </div>
                );
            }
        }
        renderItem(item: IAnswersListItem): JSX.Element {
            return (
                <tr key={item.id}>
                    <td>{item.name}</td>
                    <td style={{ textAlign: "center" }}>{this.renderItemStatus(item) }</td>
                    <td style={{ textAlign: "right" }}>
                        {this.renderItemButtons(item) }
                    </td>
                </tr>
            );
        }
        renderTable(): JSX.Element {
            let items: Array<JSX.Element> = [];
            this.state.items.forEach((item: IAnswersListItem) => items.push(this.renderItem(item)));
            return (
                <table className="table" align="center">
                    <thead>
                        <tr>
                            <th>Student</th>
                            <th style={{ textAlign: "center" }}>Status</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {items}
                    </tbody>
                </table>
            );
        }

        render(): JSX.Element {
            return (
                <div>
                    <div className="panel panel-default">
                        <div className="panel-heading">
                            <div className="panelButton"><button type="button" className="btn btn-md btn-info" onClick={() => this.props.onBackClick() }><span className="glyphicon glyphicon-chevron-left"></span> Back</button></div>
                            <h4>{FormsTc.getTitleByType(this.props.type) }: {this.state.formTitle}</h4>
                        </div>
                        <div className="panel-body">
                            <AnswersStatus ref={(ref: AnswersStatus) => this.answersStatus = ref} title={this.state.formTitle} type={this.props.type} onDeleteAll={() => this.props.onDeleteAllClick(this.state.formId) } />
                            {this.renderBody() }
                        </div>
                    </div>
                </div>
            );
        }
    }

    // results
    interface IAnswersResultProps {
        actionUrl: string;
        onBackClick: () => void;
        onDeleteAllClick: (formId: string) => void;
    }
    interface IAnswersResultState {
        formId: string;
        formTitle: string;
    }

    class AnswersResult extends React.Component<IAnswersResultProps, IAnswersResultState> {
        private answersStatus: AnswersStatus;

        private form: Forms.Form;

        constructor(props: IAnswersResultProps) {
            super(props);
            this.state = { formId: null, formTitle: "", answeredCount: 0, pendingCount: 0, declinedCount: 0 } as IAnswersResultState;
        }

        public init(item: IFormsListItem): void {
            this.setState({ formId: item.id, formTitle: item.title } as IAnswersResultState);
            this.form.initResult(item.id);
            this.answersStatus.init(item.answeredCount, item.pendingCount, item.declinedCount);
        }

        public answerReceived(formId: string, status: Forms.FormAnswerStatus, resultData: string): void {
            if (status === Forms.FormAnswerStatus.Answered && resultData !== null) {
                // update result in the form
                this.form.updateResult(resultData);
            }
            this.answersStatus.answerReceived(status);
        }

        public deleteAllAnswers(): void {
            this.answersStatus.allAnswersDeleted();
            this.form.initResult(this.state.formId);
        }

        render(): JSX.Element {
            return (
                <div>
                    <div className="panel panel-default">
                        <div className="panel-heading">
                            <div className="panelButton"><button type="button" className="btn btn-md btn-info" onClick={() => this.props.onBackClick() }><span className="glyphicon glyphicon-chevron-left"></span> Back</button></div>
                            <h4>Poll: {this.state.formTitle}</h4>
                        </div>
                        <div className="panel-body">
                            <AnswersStatus ref={(ref: AnswersStatus) => this.answersStatus = ref} title={this.state.formTitle} type={Forms.FormType.Poll} onDeleteAll={() => this.props.onDeleteAllClick(this.state.formId) } />
                        </div>
                        <div className="panel-body" style={{ textAlign: "center" }}>
                            <div style={{ display:"inline-table" }}>
                                <Forms.Form ref={(ref: Forms.Form) => this.form = ref} view={Forms.FormViews.Result} />
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
    }

    // form box send button
    interface IFormBoxSendButtonProps {
        countOfPCs: number;
        onSendClick: () => void;
    }
    interface IFormBoxSendButtonState {
        countOfPCs: number;
    }

    class FormBoxSendButton extends React.Component<IFormBoxSendButtonProps, IFormBoxSendButtonState> {
        constructor(props: IFormBoxSendButtonProps) {
            super(props);
            this.state = { countOfPCs: props.countOfPCs } as IFormBoxSendButtonState;
        }

        public countOfPCsChanged(count: number): void {
            if (this.state.countOfPCs !== count) {
                this.setState({ countOfPCs: count } as IFormBoxSendButtonState);
            }
        }

        render(): JSX.Element {
            if (this.state.countOfPCs === 0) {
                return (<span className="text-warning">No Student PC connected. </span>);
            } else {
                return (<button type="button" className="btn btn-success" onClick={() => this.props.onSendClick() }><span className="glyphicon glyphicon-envelope"></span> Send <span className="badge">{this.state.countOfPCs}</span></button>);
            }
        }
    }

    // form box
    interface IFormBoxProps {
        onSendFormClick: (formId: string) => void;
        onDeleteAnswerClick: (answerId: string) => void;
    }
    interface IFormBoxState {
        title: string;
        name: string;
        formId: string;
        answerId: string;
        countOfPCs: number;
        status: Forms.FormAnswerStatus;
    }

    class FormBox extends React.Component<IFormBoxProps, IFormBoxState> {
        private divBox: HTMLDivElement;
        private divButtons: HTMLDivElement;
        private divProcessing: HTMLDivElement;
        private form: Forms.Form;
        private btnSend: FormBoxSendButton;

        constructor(props: IFormBoxProps) {
            super(props);
            this.state = { title: "", formId: "", answerId: "", name: "", countOfPCs: 0, status: null } as IFormBoxState;
        }

        componentDidMount(): void {
            $(this.divBox).on("shown.bs.modal", () => this.boxDidShow());
            $(this.divBox).on("hidden.bs.modal", () => this.boxDidHide());
        }

        private show(): void {
            this.boxWillShow();
            $(this.divBox).modal("show");
        }

        private boxWillShow(): void {
            this.divButtons.style.display = "block";
            this.divProcessing.style.display = "none";
        }
        private boxDidShow(): void {
            if (this.state.formId !== null) {
                this.form.initForm(this.state.formId);
                this.form.changeView(Forms.FormViews.Preview);
            } else if (this.state.answerId !== null) {
                this.form.loading();
                this.form.initAnswer(this.state.answerId);
                if (this.state.status === Forms.FormAnswerStatus.Answered) {
                    this.form.changeView(Forms.FormViews.Answer);
                } else {
                    this.form.changeView(Forms.FormViews.Preview);
                }
            }
        }
        private boxDidHide(): void {
            this.form.loading();
        }

        public openForm(item: IFormsListItem, countOfPCs: number): void {
            this.setState({ title: item.title, formId: item.id, answerId: null, name: "", countOfPCs: countOfPCs, status: null } as IFormBoxState, () => this.show());
        }
        public openAnswer(item: IAnswersListItem): void {
            this.setState({ title: item.title, formId: null, name: item.name, answerId: item.id, countOfPCs: 0, status: item.status } as IFormBoxState, () => this.show());
        }

        public answerReceived(answerId: string, status: Forms.FormAnswerStatus): void {
            if (this.state.answerId === answerId && this.state.status !== status) {
                this.setState({ status: status } as IFormBoxState, () => {
                    this.boxDidShow();
                });
            }
        }

        public hide(): void {
            $(this.divBox).modal("hide");
        }

        public countOfPCsChanged(count: number): void {
            if (this.state.formId !== null && this.btnSend !== undefined) {
                this.btnSend.countOfPCsChanged(count);
            }
        }

        private sendForm(): void {
            this.divButtons.style.display = "none";
            this.divProcessing.style.display = "block";
            this.props.onSendFormClick(this.state.formId);
        }
        private deleteAnswer(): void {
            this.divButtons.style.display = "none";
            this.divProcessing.style.display = "block";
            this.props.onDeleteAnswerClick(this.state.answerId);
        }

        renderBoxStatus(status: Forms.FormAnswerStatus): JSX.Element {
            if (status === Forms.FormAnswerStatus.Answered) {
                // answered
                return (<span className="label label-success">Answered</span>);
            } else if (status === Forms.FormAnswerStatus.Declined) {
                // declined
                return (<span className="label label-danger">Declined</span>);
            } else if (status === Forms.FormAnswerStatus.Pending) {
                // pending
                return (<span className="label label-warning">Pending</span>);
            } else {
                return (<span></span>);
            }
        }
        renderButtons(): JSX.Element {
            if (this.state.formId !== null) {
                return (
                    <div>
                        <FormBoxSendButton ref={(ref: FormBoxSendButton) => this.btnSend = ref} countOfPCs={this.state.countOfPCs} onSendClick={() => this.sendForm() } />
                        <button type="button" className="btn btn-default" data-dismiss="modal">Close</button>
                    </div>
                );
            } else if (this.state.answerId !== null) {
                return (
                    <div>
                        <button type="button" className="btn btn-danger" onClick={() => this.deleteAnswer() }><span className="glyphicon glyphicon-trash"></span> Delete</button>
                        <button type="button" className="btn btn-default" data-dismiss="modal">Close</button>
                    </div>
                );
            }
        }
        render(): JSX.Element {
            return (
                <div ref={(ref: HTMLDivElement) => this.divBox = ref} className="modal fade" role="dialog">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <button type="button" className="close" data-dismiss="modal">&times; </button>
                                <h4 className="modal-title">{this.state.title} {this.renderBoxStatus(this.state.status) }</h4>
                                <h5 style={{ display: (this.state.name === "" ? "none" : "block") }}>{this.state.name}</h5>
                            </div>
                            <div className="modal-body">
                                <Forms.Form ref={(ref: Forms.Form) => this.form = ref} view={Forms.FormViews.Preview} />
                            </div>
                            <div ref={(ref: HTMLDivElement) => this.divButtons = ref} style={{ display: "block" }} className="modal-footer">
                                {this.renderButtons() }
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

    // forms TC
    interface IFormsTcProps {
        actionUrl: string;
        onFormSent: () => void;
        onAnswerDeleted: (pcUid: string) => void;
        onAllAnswersDeleted: (formId: string) => void;
    }
    interface IFormsTcState {
        connectedPCs: Array<string>;
    }

    class FormsTc extends React.Component<IFormsTcProps, IFormsTcState> {
        constructor(props: IFormsTcProps) {
            super(props);
            this.state = { connectedPCs: [] } as IFormsTcState;
        }

        public static getTitleByType(type: Forms.FormType): string {
            let title: string = "";
            switch (type) {
                case Forms.FormType.Survey: title = "Survey"; break;
                case Forms.FormType.Poll: title = "Poll"; break;
            }
            return title;
        }
    }

    // surveys TC
    export class SurveysTc extends FormsTc {
        private divFormsList: HTMLDivElement;
        private divAnswersList: HTMLDivElement;

        private formsList: FormsList;
        private answersList: AnswersList;
        private formBox: FormBox;

        public init(): void {
            this.divAnswersList.style.display = "none";
            this.divFormsList.style.display = "block";
            this.formsList.loadForms();
        }

        public connectedPCsChanged(connectedPCs: Array<string>): void {
            this.state.connectedPCs = connectedPCs;
            this.formBox.countOfPCsChanged(connectedPCs.length);
        }

        private onSendClick(item: IFormsListItem): void {
            this.formBox.openForm(item, this.state.connectedPCs.length);
        }
        private onViewClick(item: IFormsListItem): void {
            this.divFormsList.style.display = "none";
            this.divAnswersList.style.display = "block";
            this.answersList.init(item);
        }

        private onViewAnswerClick(item: IAnswersListItem): void {
            this.formBox.openAnswer(item);
        }

        private onSendFormClick(formId: string): void {
            // send
            $.ajax({
                cache: false,
                type: "POST",
                url: this.props.actionUrl + "/SendForm",
                data: JSON.stringify({ formUid: formId, connectedPCs: this.state.connectedPCs }),
                contentType: "application/json",
                success: (r: VC.Global.Data.IDataResponse<number>): void => {
                    this.formBox.hide();
                    if (r.status === VC.Global.Data.RESPONSE_SUCCESS) {
                        if (r.data) {
                            // success
                            this.props.onFormSent();
                            this.formsList.answerReceived(formId, Forms.FormAnswerStatus.Pending, r.data);
                        } else {
                            // not send
                            alert("Something went wrong: The survey has not been sent.");
                        }
                    } else {
                        // error
                        alert("ERROR: " + r.message);
                    }
                },
                error: (xhr: JQueryXHR, status: string, error: string): void => {
                    // error
                    alert("ERROR: " + error);
                    this.formBox.hide();
                }
            });
        }
        private onDeleteAnswerClick(answerId: string): void {
            // delete
            $.ajax({
                cache: false,
                type: "POST",
                url: this.props.actionUrl + "/DeleteAnswer",
                data: JSON.stringify({ answerUid: answerId }),
                contentType: "application/json",
                success: (r: VC.Global.Data.IDataResponse<string>): void => {
                    this.formBox.hide();
                    if (r.status === VC.Global.Data.RESPONSE_SUCCESS) {
                        if (r.data !== null) { // however, it will never be null
                            // success - update list
                            this.props.onAnswerDeleted(r.data);
                            this.answersList.deleteAnswer(answerId);
                        } else {
                            // not deleted
                            alert("Something went wrong: The survey answer has not been deleted.");
                        }
                    } else {
                        // error
                        alert("ERROR: " + r.message);
                    }
                },
                error: (xhr: JQueryXHR, status: string, error: string): void => {
                    // error
                    alert("ERROR: " + error);
                    this.formBox.hide();
                }
            });
        }
        private onDeleteAllClick(formId: string): void {
            // delete all answers
            $.ajax({
                cache: false,
                type: "POST",
                url: this.props.actionUrl + "/DeleteAllAnswers",
                data: JSON.stringify({ formUid: formId }),
                contentType: "application/json",
                success: (r: VC.Global.Data.IDataResponse<string>): void => {
                    this.formBox.hide();
                    if (r.status === VC.Global.Data.RESPONSE_SUCCESS) {
                        if (r.data !== null) { // however, it will never be null
                            // success - update list
                            this.props.onAllAnswersDeleted(r.data);
                            this.answersList.deleteAllAnswers();
                        } else {
                            // not deleted
                            alert("Something went wrong: The survey answers has not been deleted.");
                        }
                    } else {
                        // error
                        alert("ERROR: " + r.message);
                    }
                },
                error: (xhr: JQueryXHR, status: string, error: string): void => {
                    // error
                    alert("ERROR: " + error);
                    this.formBox.hide();
                }
            });
        }

        public answerReceived(formId: string, answerId: string, status: Forms.FormAnswerStatus): void {
            this.formsList.answerReceived(formId, status);
            this.answersList.answerReceived(answerId, status);
            this.formBox.answerReceived(answerId, status);
        }

        private onBackToListClick(): void {
            this.divAnswersList.style.display = "none";
            this.divFormsList.style.display = "block";
            this.formsList.loadForms();
        }

        render(): JSX.Element {
            return (
                <div>
                    <div ref={(ref: HTMLDivElement) => this.divFormsList = ref} style={{ display: "block" }}><FormsList ref={(ref: FormsList) => this.formsList = ref} type={Forms.FormType.Survey} actionUrl={this.props.actionUrl} onViewAnswerClick={(item: IFormsListItem) => this.onViewClick(item) } onSendFormClick={(item: IFormsListItem) => this.onSendClick(item) } /></div>
                    <div ref={(ref: HTMLDivElement) => this.divAnswersList = ref} style={{ display: "none" }}><AnswersList ref={(ref: AnswersList) => this.answersList = ref} type={Forms.FormType.Survey} actionUrl={this.props.actionUrl} onViewClick={(item: IAnswersListItem) => this.onViewAnswerClick(item) } onBackClick={() => this.onBackToListClick() } onDeleteAllClick={(formId: string) => this.onDeleteAllClick(formId) } /></div>
                    <FormBox ref={(ref: FormBox) => this.formBox = ref} onSendFormClick={(formId: string) => this.onSendFormClick(formId) } onDeleteAnswerClick={(answerId: string) => this.onDeleteAnswerClick(answerId) } />
                </div>
            );
        }
    }

    // polls TC
    export class PollsTc extends FormsTc {
        private divFormsList: HTMLDivElement;
        private divAnswersResult: HTMLDivElement;

        private formsList: FormsList;
        private answersResult: AnswersResult;
        private formBox: FormBox;

        public init(): void {
            this.divAnswersResult.style.display = "none";
            this.divFormsList.style.display = "block";
            this.formsList.loadForms();
        }

        public connectedPCsChanged(connectedPCs: Array<string>): void {
            this.state.connectedPCs = connectedPCs;
            this.formBox.countOfPCsChanged(connectedPCs.length);
        }

        private onSendClick(item: IFormsListItem): void {
            this.formBox.openForm(item, this.state.connectedPCs.length);
        }
        private onViewClick(item: IFormsListItem): void {
            this.divFormsList.style.display = "none";
            this.divAnswersResult.style.display = "block";
            this.answersResult.init(item);
        }

        private onSendFormClick(formId: string): void {
            // send
            $.ajax({
                cache: false,
                type: "POST",
                url: this.props.actionUrl + "/SendForm",
                data: JSON.stringify({ formUid: formId, connectedPCs: this.state.connectedPCs }),
                contentType: "application/json",
                success: (r: VC.Global.Data.IDataResponse<number>): void => {
                    this.formBox.hide();
                    if (r.status === VC.Global.Data.RESPONSE_SUCCESS) {
                        if (r.data) {
                            // success
                            this.props.onFormSent();
                            this.formsList.answerReceived(formId, Forms.FormAnswerStatus.Pending, r.data);
                        } else {
                            // not send
                            alert("Something went wrong: The poll has not been sent.");
                        }
                    } else {
                        // error
                        alert("ERROR: " + r.message);
                    }
                },
                error: (xhr: JQueryXHR, status: string, error: string): void => {
                    // error
                    alert("ERROR: " + error);
                    this.formBox.hide();
                }
            });
        }
        private onDeleteAnswerClick(answerId: string): void {
            // delete single answer, not used
        }
        private onDeleteAllClick(formId: string): void {
            // delete all answers
            $.ajax({
                cache: false,
                type: "POST",
                url: this.props.actionUrl + "/DeleteAllAnswers",
                data: JSON.stringify({ formUid: formId }),
                contentType: "application/json",
                success: (r: VC.Global.Data.IDataResponse<string>): void => {
                    this.formBox.hide();
                    if (r.status === VC.Global.Data.RESPONSE_SUCCESS) {
                        if (r.data !== null) { // however, it will never be null
                            // success - update list
                            this.props.onAllAnswersDeleted(r.data);
                            this.answersResult.deleteAllAnswers();
                        } else {
                            // not deleted
                            alert("Something went wrong: The poll answers has not been deleted.");
                        }
                    } else {
                        // error
                        alert("ERROR: " + r.message);
                    }
                },
                error: (xhr: JQueryXHR, status: string, error: string): void => {
                    // error
                    alert("ERROR: " + error);
                    this.formBox.hide();
                }
            });
        }

        public answerReceived(formId: string, answerId: string, status: Forms.FormAnswerStatus, resultData: string): void {
            this.formsList.answerReceived(formId, status);
            this.answersResult.answerReceived(formId, status, resultData);
        }

        private onBackToListClick(): void {
            this.divAnswersResult.style.display = "none";
            this.divFormsList.style.display = "block";
            this.formsList.loadForms();
        }

        render(): JSX.Element {
            return (
                <div>
                    <div ref={(ref: HTMLDivElement) => this.divFormsList = ref} style={{ display: "block" }}><FormsList ref={(ref: FormsList) => this.formsList = ref} type={Forms.FormType.Poll} actionUrl={this.props.actionUrl} onViewAnswerClick={(item: IFormsListItem) => this.onViewClick(item) } onSendFormClick={(item: IFormsListItem) => this.onSendClick(item) } /></div>
                    <div ref={(ref: HTMLDivElement) => this.divAnswersResult = ref} style={{ display: "none" }}><AnswersResult ref={(ref: AnswersResult) => this.answersResult = ref} actionUrl={this.props.actionUrl} onBackClick={() => this.onBackToListClick() } onDeleteAllClick={(formId: string) => this.onDeleteAllClick(formId) } /></div>
                    <FormBox ref={(ref: FormBox) => this.formBox = ref} onSendFormClick={(formId: string) => this.onSendFormClick(formId) } onDeleteAnswerClick={(answerId: string) => this.onDeleteAnswerClick(answerId) } />
                </div>
            );
        }
    }
}