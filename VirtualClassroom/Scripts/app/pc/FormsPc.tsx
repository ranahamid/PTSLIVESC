/* tslint:disable:max-line-length */

namespace VC.App.PC {
    "use strict";

    enum ListStatus {
        Loading,
        Success,
        Error,
    }

    // answers List
    interface IFormsListItem {
        id: string;
        title: string;
        type: Forms.FormType;
        pendingCount: number;
        answeredCount: number;
        declinedCount: number;
    }

    interface IAnswersListItem {
        id: string;
        title: string;
        name: string;
        status: Forms.FormAnswerStatus;
        form: IFormsListItem;
    }

    interface IAnswersListProps {
        actionUrl: string;
        onPendingAnswersChanged: (count: number) => void;
        onViewClick: (item: IAnswersListItem) => void;
    }
    interface IAnswersListState {
        status: ListStatus;
        errorMessage: string;
        items: Array<IAnswersListItem>;
    }

    class AnswersList extends React.Component<IAnswersListProps, IAnswersListState> {
        constructor(props: IAnswersListProps) {
            super(props);
            this.state = { formId: "", formTitle: "", status: ListStatus.Loading, errorMessage: "", items: null } as IAnswersListState;
            this.loadData();
        }

        private loadData(): void {
            $.ajax({
                cache: false,
                type: "GET",
                url: this.props.actionUrl + "/LoadAnswers",
                success: (r: VC.Global.Data.IDataResponse<Array<IAnswersListItem>>): void => {
                    if (r.status === VC.Global.Data.RESPONSE_SUCCESS) {
                        // success
                        this.setState({ status: ListStatus.Success, errorMessage: "", items: r.data },
                            // callback
                            () => {
                                this.props.onPendingAnswersChanged(this.getPendingAnswersCount());
                            }
                        );
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

        private getPendingAnswersCount(): number {
            let count: number = 0;
            this.state.items.forEach((item: IAnswersListItem) => {
                if (item.status === Forms.FormAnswerStatus.Pending) {
                    count++;
                }
            });
            return count;
        }

        public updateList(): void {
            this.loadData();
        }
        public updateAnswerStatus(answerId: string, status: Forms.FormAnswerStatus): void {
            this.state.items.forEach((item: IAnswersListItem) => {
                if (item.id === answerId) {
                    item.status = status;
                }
            });
            this.setState({ items: this.state.items } as IAnswersListState,
                // callback
                () => {
                    this.props.onPendingAnswersChanged(this.getPendingAnswersCount());
                }
            );
        }

        public removeFormAnswer(formId: string): void {
            let removed: boolean = false;
            let items: Array<IAnswersListItem> = this.state.items;
            let _items: Array<IAnswersListItem> = [];
            for (let i: number = 0; i < items.length; i++) {
                if (items[i].form.id === formId) {
                    removed = true;
                } else {
                    _items.push(items[i]);
                }
            }
            if (removed) {
                this.setState({ items: _items } as IAnswersListState,
                    // callback
                    () => {
                        this.props.onPendingAnswersChanged(this.getPendingAnswersCount());
                    }
                );
            }
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
                <div className="text-muted">No survey or poll found.</div>
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

        renderItemStatus(item: IAnswersListItem): JSX.Element {
            if (item.status === Forms.FormAnswerStatus.Pending) {
                // pending
                return (<span className="label label-warning">Pending {FormsPc.getTitleByType(item.form.type) }</span>);
            } else if (item.status === Forms.FormAnswerStatus.Answered) {
                // answered
                return (<span className="label label-success">{FormsPc.getTitleByType(item.form.type) } Submitted</span>);
            } else {
                // declined
                return (<span className="label label-danger">{FormsPc.getTitleByType(item.form.type) } Declined</span>);
            }
        }
        renderItemButton(item: IAnswersListItem): JSX.Element {
            if (item.status === Forms.FormAnswerStatus.Pending) {
                // pending
                return (<button type="button" className="btn btn-sm btn-success" onClick={() => this.props.onViewClick(item) }><span className="glyphicon glyphicon-play-circle"></span> Start {FormsPc.getTitleByType(item.form.type) }</button>);
            } else if (item.status === Forms.FormAnswerStatus.Answered) {
                // answered
                return (<button type="button" className="btn btn-sm btn-default" onClick={() => this.props.onViewClick(item) }><span className="glyphicon glyphicon-eye-open"></span> View</button>);
            } else {
                // declined
                return (<button type="button" className="btn btn-sm btn-default" onClick={() => this.props.onViewClick(item) }><span className="glyphicon glyphicon-eye-open"></span> View</button>);
            }
        }
        renderItem(item: IAnswersListItem): JSX.Element {
            return (
                <tr key={item.id}>
                    <td>{item.title}</td>
                    <td style={{ textAlign: "center" }}>{this.renderItemStatus(item) }</td>
                    <td style={{ textAlign: "right" }}>{this.renderItemButton(item) }</td>
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
                            <th>Title</th>
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
                            <h4>Received Surveys & Polls</h4>
                        </div>
                        {this.renderBody() }
                    </div>
                </div>
            );
        }
    }

    // form box
    interface IFormBoxProps {
        onAnswerSubmitted: (answerId: string, formId: string, type: Forms.FormType, resultData: string) => void;
        onAnswerDeclined: (answerId: string, formId: string, type: Forms.FormType) => void;
    }
    interface IFormBoxState {
        formId: string;
        answerId: string;
        title: string;
        type: Forms.FormType;
        status: Forms.FormAnswerStatus;
    }

    class FormBox extends React.Component<IFormBoxProps, IFormBoxState> {
        private showBox: boolean = false;
        private divBox: HTMLDivElement;
        private divButtons: HTMLDivElement;
        private divProcessing: HTMLDivElement;
        private form: Forms.Form;

        constructor(props: IFormBoxProps) {
            super(props);
            this.state = { formId: "", answerId: "", title: "", type: null, status: null } as IFormBoxState;
        }

        componentDidMount(): void {
            $(this.divBox).on("shown.bs.modal", () => this.boxDidShow());
            $(this.divBox).on("hidden.bs.modal", () => this.boxDidHide());
        }
        componentDidUpdate(prevProps: IFormBoxProps, prevState: IFormBoxState): void {
            if (this.showBox) {
                this.showBox = false;
                // show
                $(this.divBox).modal("show");

                this.boxWillShow();
            }
        }

        private boxWillShow(): void {
            this.divButtons.style.display = "block";
            this.divProcessing.style.display = "none";
        }
        private boxDidShow(): void {
            this.form.initAnswer(this.state.answerId);
        }
        private boxDidHide(): void {
            this.form.loading();
        }

        public open(item: IAnswersListItem): void {
            this.showBox = true;

            // form view
            if (item.status === Forms.FormAnswerStatus.Pending) {
                this.form.changeView(Forms.FormViews.View);
            } else if (item.status === Forms.FormAnswerStatus.Answered) {
                this.form.changeView(Forms.FormViews.Answer);
            } else {
                this.form.changeView(Forms.FormViews.Preview);
            }

            this.setState({ formId: item.form.id, answerId: item.id, title: item.title, type: item.form.type, status: item.status } as IFormBoxState);
        }
        public hide(): void {
            $(this.divBox).modal("hide");
        }

        private submitAnswer(): void {

            if (this.form.validate()) {
                this.divButtons.style.display = "none";
                this.divProcessing.style.display = "block";

                let answerData: string = this.form.getData(Forms.DataType.Answer);

                Forms.FormApi.UpdateAnswer(
                    { uid: this.state.answerId, formData: answerData, status: Forms.FormAnswerStatus.Answered } as Forms.IFormAnswerData,
                    () => {
                        // success
                        let resultData: string = this.form.getData(Forms.DataType.Result);

                        this.hide();
                        this.props.onAnswerSubmitted(this.state.answerId, this.state.formId, this.state.type, resultData);
                    },
                    (error: string) => {
                        // error
                        alert(error);
                        this.hide();
                    }
                );
            }
        }
        private declineAnswer(): void {
            this.divButtons.style.display = "none";
            this.divProcessing.style.display = "block";

            Forms.FormApi.UpdateAnswer(
                { uid: this.state.answerId, status: Forms.FormAnswerStatus.Declined } as Forms.IFormAnswerData,
                () => {
                    // success
                    this.hide();
                    this.props.onAnswerDeclined(this.state.answerId, this.state.formId, this.state.type);
                },
                (error: string) => {
                    // error
                    alert(error);
                    this.hide();
                }
            );
        }

        renderBoxStatus(status: Forms.FormAnswerStatus): JSX.Element {
            if (status === Forms.FormAnswerStatus.Answered) {
                // answered
                return (<span className="label label-success">Submitted</span>);
            } else if (status === Forms.FormAnswerStatus.Declined) {
                // declined
                return (<span className="label label-danger">Declined</span>);
            } else {
                return (<span></span>);
            }
        }
        renderBoxButtons(status: Forms.FormAnswerStatus): JSX.Element {
            if (status === Forms.FormAnswerStatus.Pending) {
                return (
                    <div>
                        <button type="button" className="btn btn-success" onClick={() => this.submitAnswer() }><span className="glyphicon glyphicon-envelope"></span> Submit</button>
                        <button type="button" className="btn btn-danger" onClick={() => this.declineAnswer() }><span className="glyphicon glyphicon-remove"></span> Decline</button>
                        <button type="button" className="btn btn-default" data-dismiss="modal">Close</button>
                    </div>
                );
            } else {
                return (
                    <div>
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
                            </div>
                            <div className="modal-body">
                                <Forms.Form ref={(ref: Forms.Form) => this.form = ref} view={Forms.FormViews.Preview} />
                            </div>
                            <div ref={(ref: HTMLDivElement) => this.divButtons = ref} style={{ display: "block" }} className="modal-footer">
                                {this.renderBoxButtons(this.state.status) }
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

    // forms PC
    interface IFormsPcProps {
        actionUrl: string;
        onPendingAnswersChanged: (count: number) => void;
        onAnswerStatusChanged: (formId: string, answerId: string, type: Forms.FormType, status: Forms.FormAnswerStatus, resultData: string) => void;
    }
    interface IFormsPcState {
    }

    export class FormsPc extends React.Component<IFormsPcProps, IFormsPcState> {
        private divAnswersList: HTMLDivElement;

        private answersList: AnswersList;
        private formBox: FormBox;

        constructor(props: IFormsPcProps) {
            super(props);
        }

        public static getTitleByType(type: Forms.FormType): string {
            let title: string = "";
            switch (type) {
                case Forms.FormType.Survey: title = "Survey"; break;
                case Forms.FormType.Poll: title = "Poll"; break;
            }
            return title;
        }

        private onViewClick(item: IAnswersListItem): void {
            this.formBox.open(item);
        }
        private onAnswerSubmitted(answerId: string, formId: string, type: Forms.FormType, resultData: string): void {
            this.answersList.updateAnswerStatus(answerId, Forms.FormAnswerStatus.Answered);
            this.props.onAnswerStatusChanged(formId, answerId, type, Forms.FormAnswerStatus.Answered, resultData);
        }
        private onAnswerDeclined(answerId: string, formId: string, type: Forms.FormType): void {
            this.answersList.updateAnswerStatus(answerId, Forms.FormAnswerStatus.Declined);
            this.props.onAnswerStatusChanged(formId, answerId, type, Forms.FormAnswerStatus.Declined, null);
        }

        public formReceived(): void {
            this.answersList.updateList();
        }
        public formAnswerRemoved(formId: string): void {
            this.answersList.removeFormAnswer(formId);
        }

        render(): JSX.Element {
            return (
                <div>
                    <div ref={(ref: HTMLDivElement) => this.divAnswersList = ref}><AnswersList ref={(ref: AnswersList) => this.answersList = ref} onViewClick={(item: IAnswersListItem) => this.onViewClick(item) } onPendingAnswersChanged={(count: number) => this.props.onPendingAnswersChanged(count) } actionUrl={this.props.actionUrl} /></div>
                    <FormBox ref={(ref: FormBox) => this.formBox = ref} onAnswerSubmitted={(answerId: string, formUid: string, type: Forms.FormType, resultData: string) => this.onAnswerSubmitted(answerId, formUid, type, resultData) } onAnswerDeclined={(answerId: string, formUid: string, type: Forms.FormType) => this.onAnswerDeclined(answerId, formUid, type) } />
                </div>
            );
        }
    }
}