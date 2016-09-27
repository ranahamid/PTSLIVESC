/* tslint:disable:max-line-length */

namespace VC.App.AC {
    "use strict";

    const REF_FORM_DIV: string = "div";
    const REF_FORM_TB: string = "tb";

    const FORM_STUDENT1: string = "Student1";
    const FORM_STUDENT2: string = "Student2";
    const FORM_STUDENT3: string = "Student3";
    const FORM_STUDENT4: string = "Student4";
    const FORM_STUDENT5: string = "Student5";
    const FORM_STUDENT6: string = "Student6";
    const FORM_STUDENT7: string = "Student7";
    const FORM_STUDENT8: string = "Student8";

    enum BoxStatus {
        Loading,
        Processing,
        View
    }
    enum BoxValidationStatus {
        None,
        Success,
        Error
    }

    export interface IStudentItem {
        uid: string;
        id: string;
        name: string;
        position: number;
    }
    interface IFeaturedItem {
        uid: string;
        id: string;
        name: string;
        students: Array<IStudentItem>;
    }


    interface IFeaturedBoxProps {
        classroomId: string;
        onFeaturedUpdated: (uid: string, layout: number, students: Array<IStudentItem>) => void;
    }
    interface IFeaturedBoxState {
        uid: string;
        name: string;
        status: BoxStatus;
        item: IFeaturedItem;
    }

    export class FeaturedBox extends React.Component<IFeaturedBoxProps, IFeaturedBoxState> {
        private divBox: HTMLDivElement;
        private divButtons: HTMLDivElement;
        private divProcessing: HTMLDivElement;

        constructor(props: IFeaturedBoxProps) {
            super(props);
            this.state = { uid: "", name: "", status: BoxStatus.Loading, item: null } as IFeaturedBoxState;
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
        private boxWillShow(): void {
            this.loadFeatured();
        }
        private boxDidShow(): void {
        }

        public hide(): void {
            $(this.divBox).modal("hide");
        }
        public boxDidHide(): void {
            this.divButtons.style.display = "block";
            this.divProcessing.style.display = "none";
        }

        public open(uid: string, name: string): void {
            this.setState({ uid: uid, name: name, status: BoxStatus.Loading, item: null } as IFeaturedBoxState,
                () => {
                    this.show();
                });
        }

        private loadFeatured() {
            $.ajax({
                cache: false,
                type: "GET",
                url: "/api/Classroom/" + this.props.classroomId + "/LoadFeatured/" + this.state.uid,
                contentType: "application/json",
                success: (r: VC.Global.Data.IDataResponse<IFeaturedItem>): void => {
                    if (r.status === VC.Global.Data.RESPONSE_SUCCESS) {
                        // loaded
                        this.setState({ item: r.data, status: BoxStatus.View } as IFeaturedBoxState,
                            () => {
                                this.loaded();
                            });
                    } else {
                        // error
                        alert(r.message);
                    }
                },
                error: (xhr: JQueryXHR, status: string, error: string): void => {
                    // xhr error
                    alert("XHR Error - " + xhr.statusText);
                }
            });
        }
        private loaded() {
            let tbStudent1: VC.Global.Components.Selector = this.refs[REF_FORM_TB + FORM_STUDENT1] as VC.Global.Components.Selector;
            let tbStudent2: VC.Global.Components.Selector = this.refs[REF_FORM_TB + FORM_STUDENT2] as VC.Global.Components.Selector;
            let tbStudent3: VC.Global.Components.Selector = this.refs[REF_FORM_TB + FORM_STUDENT3] as VC.Global.Components.Selector;
            let tbStudent4: VC.Global.Components.Selector = this.refs[REF_FORM_TB + FORM_STUDENT4] as VC.Global.Components.Selector;
            let tbStudent5: VC.Global.Components.Selector = this.refs[REF_FORM_TB + FORM_STUDENT5] as VC.Global.Components.Selector;
            let tbStudent6: VC.Global.Components.Selector = this.refs[REF_FORM_TB + FORM_STUDENT6] as VC.Global.Components.Selector;
            let tbStudent7: VC.Global.Components.Selector = this.refs[REF_FORM_TB + FORM_STUDENT7] as VC.Global.Components.Selector;
            let tbStudent8: VC.Global.Components.Selector = this.refs[REF_FORM_TB + FORM_STUDENT8] as VC.Global.Components.Selector;

            let student1: IStudentItem = this.getStudentByPosition(1);
            let student2: IStudentItem = this.getStudentByPosition(2);
            let student3: IStudentItem = this.getStudentByPosition(3);
            let student4: IStudentItem = this.getStudentByPosition(4);
            let student5: IStudentItem = this.getStudentByPosition(5);
            let student6: IStudentItem = this.getStudentByPosition(6);
            let student7: IStudentItem = this.getStudentByPosition(7);
            let student8: IStudentItem = this.getStudentByPosition(8);

            tbStudent1.init(student1 !== null ? student1.id : null);
            tbStudent2.init(student2 !== null ? student2.id : null);
            tbStudent3.init(student3 !== null ? student3.id : null);
            tbStudent4.init(student4 !== null ? student4.id : null);
            tbStudent5.init(student5 !== null ? student5.id : null);
            tbStudent6.init(student6 !== null ? student6.id : null);
            tbStudent7.init(student7 !== null ? student7.id : null);
            tbStudent8.init(student8 !== null ? student8.id : null);
        }

        private getStudentByPosition(position: number): IStudentItem {
            let student: IStudentItem = null;
            if (this.state.item.students !== null) {
                for (let i: number = 0; i < this.state.item.students.length && student === null; i++) {
                    if (this.state.item.students[i] !== null) {
                        if (this.state.item.students[i].position === position) {
                            student = this.state.item.students[i];
                        }
                    }
                }
            }
            return student;
        }

        private onSelectedStudentChanged(): void {
            this.validateStudents(false);
        }

        private setValidationStatus(ref: string, status: BoxValidationStatus, tooltip: string): void {
            let div: HTMLDivElement = this.refs[REF_FORM_DIV + ref] as HTMLDivElement;
            let tb: Element = this.refs[REF_FORM_TB + ref] as Element;

            switch (status) {
                case BoxValidationStatus.None:
                    div.className = "form-group";
                    break;
                case BoxValidationStatus.Success:
                    div.className = "form-group has-success has-feedback";
                    break;
                case BoxValidationStatus.Error:
                    div.className = "form-group has-error has-feedback";
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

        private validateStudents(focusOnError: boolean): boolean {
            let tbStudent1: VC.Global.Components.Selector = this.refs[REF_FORM_TB + FORM_STUDENT1] as VC.Global.Components.Selector;
            let tbStudent2: VC.Global.Components.Selector = this.refs[REF_FORM_TB + FORM_STUDENT2] as VC.Global.Components.Selector;
            let tbStudent3: VC.Global.Components.Selector = this.refs[REF_FORM_TB + FORM_STUDENT3] as VC.Global.Components.Selector;
            let tbStudent4: VC.Global.Components.Selector = this.refs[REF_FORM_TB + FORM_STUDENT4] as VC.Global.Components.Selector;
            let tbStudent5: VC.Global.Components.Selector = this.refs[REF_FORM_TB + FORM_STUDENT5] as VC.Global.Components.Selector;
            let tbStudent6: VC.Global.Components.Selector = this.refs[REF_FORM_TB + FORM_STUDENT6] as VC.Global.Components.Selector;
            let tbStudent7: VC.Global.Components.Selector = this.refs[REF_FORM_TB + FORM_STUDENT7] as VC.Global.Components.Selector;
            let tbStudent8: VC.Global.Components.Selector = this.refs[REF_FORM_TB + FORM_STUDENT8] as VC.Global.Components.Selector;

            let valStudent1: string = tbStudent1.getSelectedValue();
            let valStudent2: string = tbStudent2.getSelectedValue();
            let valStudent3: string = tbStudent3.getSelectedValue();
            let valStudent4: string = tbStudent4.getSelectedValue();
            let valStudent5: string = tbStudent5.getSelectedValue();
            let valStudent6: string = tbStudent6.getSelectedValue();
            let valStudent7: string = tbStudent7.getSelectedValue();
            let valStudent8: string = tbStudent8.getSelectedValue();

            let valid: boolean = true;

            if (valStudent1 !== ""
                && (
                    valStudent1 === valStudent2
                    || valStudent1 === valStudent3
                    || valStudent1 === valStudent4
                    || valStudent1 === valStudent5
                    || valStudent1 === valStudent6
                    || valStudent1 === valStudent7
                    || valStudent1 === valStudent8
                )
            ) {
                valid = false;
                this.setValidationStatus(FORM_STUDENT1, BoxValidationStatus.Error, "Duplicit Student computer selected.");
            } else {
                this.setValidationStatus(FORM_STUDENT1, BoxValidationStatus.None, "");
            }

            if (valStudent2 !== ""
                && (
                    valStudent2 === valStudent1
                    || valStudent2 === valStudent3
                    || valStudent2 === valStudent4
                    || valStudent2 === valStudent5
                    || valStudent2 === valStudent6
                    || valStudent2 === valStudent7
                    || valStudent2 === valStudent8
                )
            ) {
                valid = false;
                this.setValidationStatus(FORM_STUDENT2, BoxValidationStatus.Error, "Duplicit Student computer selected.");
            } else {
                this.setValidationStatus(FORM_STUDENT2, BoxValidationStatus.None, "");
            }

            if (valStudent3 !== ""
                && (
                    valStudent3 === valStudent1
                    || valStudent3 === valStudent2
                    || valStudent3 === valStudent4
                    || valStudent3 === valStudent5
                    || valStudent3 === valStudent6
                    || valStudent3 === valStudent7
                    || valStudent3 === valStudent8
                )
            ) {
                valid = false;
                this.setValidationStatus(FORM_STUDENT3, BoxValidationStatus.Error, "Duplicit Student computer selected.");
            } else {
                this.setValidationStatus(FORM_STUDENT3, BoxValidationStatus.None, "");
            }

            if (valStudent4 !== ""
                && (
                    valStudent4 === valStudent1
                    || valStudent4 === valStudent2
                    || valStudent4 === valStudent3
                    || valStudent4 === valStudent5
                    || valStudent4 === valStudent6
                    || valStudent4 === valStudent7
                    || valStudent4 === valStudent8
                )
            ) {
                valid = false;
                this.setValidationStatus(FORM_STUDENT4, BoxValidationStatus.Error, "Duplicit Student computer selected.");
            } else {
                this.setValidationStatus(FORM_STUDENT4, BoxValidationStatus.None, "");
            }

            if (valStudent5 !== ""
                && (
                    valStudent5 === valStudent1
                    || valStudent5 === valStudent2
                    || valStudent5 === valStudent3
                    || valStudent5 === valStudent4
                    || valStudent5 === valStudent6
                    || valStudent5 === valStudent7
                    || valStudent5 === valStudent8
                )
            ) {
                valid = false;
                this.setValidationStatus(FORM_STUDENT5, BoxValidationStatus.Error, "Duplicit Student computer selected.");
            } else {
                this.setValidationStatus(FORM_STUDENT5, BoxValidationStatus.None, "");
            }

            if (valStudent6 !== ""
                && (
                    valStudent6 === valStudent1
                    || valStudent6 === valStudent2
                    || valStudent6 === valStudent3
                    || valStudent6 === valStudent4
                    || valStudent6 === valStudent5
                    || valStudent6 === valStudent7
                    || valStudent6 === valStudent8
                )
            ) {
                valid = false;
                this.setValidationStatus(FORM_STUDENT6, BoxValidationStatus.Error, "Duplicit Student computer selected.");
            } else {
                this.setValidationStatus(FORM_STUDENT6, BoxValidationStatus.None, "");
            }

            if (valStudent7 !== ""
                && (
                    valStudent7 === valStudent1
                    || valStudent7 === valStudent2
                    || valStudent7 === valStudent3
                    || valStudent7 === valStudent4
                    || valStudent7 === valStudent5
                    || valStudent7 === valStudent6
                    || valStudent7 === valStudent8
                )
            ) {
                valid = false;
                this.setValidationStatus(FORM_STUDENT7, BoxValidationStatus.Error, "Duplicit Student computer selected.");
            } else {
                this.setValidationStatus(FORM_STUDENT7, BoxValidationStatus.None, "");
            }

            if (valStudent8 !== ""
                && (
                    valStudent8 === valStudent1
                    || valStudent8 === valStudent2
                    || valStudent8 === valStudent3
                    || valStudent8 === valStudent4
                    || valStudent8 === valStudent5
                    || valStudent8 === valStudent6
                    || valStudent8 === valStudent7
                )
            ) {
                valid = false;
                this.setValidationStatus(FORM_STUDENT8, BoxValidationStatus.Error, "Duplicit Student computer selected.");
            } else {
                this.setValidationStatus(FORM_STUDENT8, BoxValidationStatus.None, "");
            }

            return valid;
        }

        private validateForm(focusOnError: boolean): boolean {
            let valid: boolean = true;

            if (!this.validateStudents(focusOnError)) {
                valid = false;
            }

            return valid;
        }

        private updateFeatured(): void {
            let isFormValid: boolean = this.validateForm(true);

            if (isFormValid) {
                this.setState({ status: BoxStatus.Processing } as IFeaturedBoxState);
                // update
                this.doUpdate();
            }
        }

        private doUpdate(): void {
            let student1: IStudentItem = null;
            let tbStudent1: VC.Global.Components.Selector = this.refs[REF_FORM_TB + FORM_STUDENT1] as VC.Global.Components.Selector;
            let selectedStudent1: string = tbStudent1.getSelectedValue();
            if (selectedStudent1 !== "") {
                student1 = { id: selectedStudent1, name: tbStudent1.getSelectedText(), position: 1 } as IStudentItem;
            }

            let student2: IStudentItem = null;
            let tbStudent2: VC.Global.Components.Selector = this.refs[REF_FORM_TB + FORM_STUDENT2] as VC.Global.Components.Selector;
            let selectedStudent2: string = tbStudent2.getSelectedValue();
            if (selectedStudent2 !== "") {
                student2 = { id: selectedStudent2, name: tbStudent2.getSelectedText(), position: 2 } as IStudentItem;
            }

            let student3: IStudentItem = null;
            let tbStudent3: VC.Global.Components.Selector = this.refs[REF_FORM_TB + FORM_STUDENT3] as VC.Global.Components.Selector;
            let selectedStudent3: string = tbStudent3.getSelectedValue();
            if (selectedStudent3 !== "") {
                student3 = { id: selectedStudent3, name: tbStudent3.getSelectedText(), position: 3 } as IStudentItem;
            }

            let student4: IStudentItem = null;
            let tbStudent4: VC.Global.Components.Selector = this.refs[REF_FORM_TB + FORM_STUDENT4] as VC.Global.Components.Selector;
            let selectedStudent4: string = tbStudent4.getSelectedValue();
            if (selectedStudent4 !== "") {
                student4 = { id: selectedStudent4, name: tbStudent4.getSelectedText(), position: 4 } as IStudentItem;
            }

            let student5: IStudentItem = null;
            let tbStudent5: VC.Global.Components.Selector = this.refs[REF_FORM_TB + FORM_STUDENT5] as VC.Global.Components.Selector;
            let selectedStudent5: string = tbStudent5.getSelectedValue();
            if (selectedStudent5 !== "") {
                student5 = { id: selectedStudent5, name: tbStudent5.getSelectedText(), position: 5 } as IStudentItem;
            }

            let student6: IStudentItem = null;
            let tbStudent6: VC.Global.Components.Selector = this.refs[REF_FORM_TB + FORM_STUDENT6] as VC.Global.Components.Selector;
            let selectedStudent6: string = tbStudent6.getSelectedValue();
            if (selectedStudent6 !== "") {
                student6 = { id: selectedStudent6, name: tbStudent6.getSelectedText(), position: 6 } as IStudentItem;
            }

            let student7: IStudentItem = null;
            let tbStudent7: VC.Global.Components.Selector = this.refs[REF_FORM_TB + FORM_STUDENT7] as VC.Global.Components.Selector;
            let selectedStudent7: string = tbStudent7.getSelectedValue();
            if (selectedStudent7 !== "") {
                student7 = { id: selectedStudent7, name: tbStudent7.getSelectedText(), position: 7 } as IStudentItem;
            }

            let student8: IStudentItem = null;
            let tbStudent8: VC.Global.Components.Selector = this.refs[REF_FORM_TB + FORM_STUDENT8] as VC.Global.Components.Selector;
            let selectedStudent8: string = tbStudent8.getSelectedValue();
            if (selectedStudent8 !== "") {
                student8 = { id: selectedStudent8, name: tbStudent8.getSelectedText(), position: 8 } as IStudentItem;
            }

            let students: Array<IStudentItem> = [student1, student2, student3, student4, student5, student6, student7, student8];

            let layout: number = 1;
            if (student8 || student7) {
                layout = 8;
            } else if (student6 || student5) {
                layout = 6;
            } else if (student4 || student3) {
                layout = 4;
            } else if (student2) {
                layout = 2;
            }

            $.ajax({
                cache: false,
                type: "POST",
                url: "/api/Classroom/" + this.props.classroomId + "/UpdateFeatured/",
                data: JSON.stringify({ id: this.state.item.id, name: this.state.item.name, students: students } as IFeaturedItem),
                contentType: "application/json",
                success: (r: VC.Global.Data.IDataResponse<IFeaturedItem>): void => {
                    this.hide();
                    if (r.status === VC.Global.Data.RESPONSE_SUCCESS) {
                        // update list
                        this.props.onFeaturedUpdated(this.state.uid, layout, students);
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
                    <div ref={REF_FORM_DIV + FORM_STUDENT1} className="form-group">
                        <label className="col-sm-2" htmlFor={REF_FORM_TB + FORM_STUDENT1}>Student 1: </label>
                        <div className="col-sm-10">
                            <VC.Global.Components.Selector ref={REF_FORM_TB + FORM_STUDENT1} classroomId={this.props.classroomId} loadAction="GetAvailableFeaturedStudents" defaultName="Select Student computer" onSelectedItemChanged={() => this.onSelectedStudentChanged() } className="form-control" />
                        </div>
                    </div>
                    <div ref={REF_FORM_DIV + FORM_STUDENT2} className="form-group">
                        <label className="col-sm-2" htmlFor={REF_FORM_TB + FORM_STUDENT2}>Student 2: </label>
                        <div className="col-sm-10">
                            <VC.Global.Components.Selector ref={REF_FORM_TB + FORM_STUDENT2} classroomId={this.props.classroomId} loadAction="GetAvailableFeaturedStudents" defaultName="Select Student computer" onSelectedItemChanged={() => this.onSelectedStudentChanged() } className="form-control" />
                        </div>
                    </div>
                    <div ref={REF_FORM_DIV + FORM_STUDENT3} className="form-group">
                        <label className="col-sm-2" htmlFor={REF_FORM_TB + FORM_STUDENT3}>Student 3: </label>
                        <div className="col-sm-10">
                            <VC.Global.Components.Selector ref={REF_FORM_TB + FORM_STUDENT3} classroomId={this.props.classroomId} loadAction="GetAvailableFeaturedStudents" defaultName="Select Student computer" onSelectedItemChanged={() => this.onSelectedStudentChanged() } className="form-control" />
                        </div>
                    </div>
                    <div ref={REF_FORM_DIV + FORM_STUDENT4} className="form-group">
                        <label className="col-sm-2" htmlFor={REF_FORM_TB + FORM_STUDENT4}>Student 4: </label>
                        <div className="col-sm-10">
                            <VC.Global.Components.Selector ref={REF_FORM_TB + FORM_STUDENT4} classroomId={this.props.classroomId} loadAction="GetAvailableFeaturedStudents" defaultName="Select Student computer" onSelectedItemChanged={() => this.onSelectedStudentChanged() } className="form-control" />
                        </div>
                    </div>
                    <div ref={REF_FORM_DIV + FORM_STUDENT5} className="form-group">
                        <label className="col-sm-2" htmlFor={REF_FORM_TB + FORM_STUDENT5}>Student 5: </label>
                        <div className="col-sm-10">
                            <VC.Global.Components.Selector ref={REF_FORM_TB + FORM_STUDENT5} classroomId={this.props.classroomId} loadAction="GetAvailableFeaturedStudents" defaultName="Select Student computer" onSelectedItemChanged={() => this.onSelectedStudentChanged() } className="form-control" />
                        </div>
                    </div>
                    <div ref={REF_FORM_DIV + FORM_STUDENT6} className="form-group">
                        <label className="col-sm-2" htmlFor={REF_FORM_TB + FORM_STUDENT6}>Student&nbsp; 6: </label>
                        <div className="col-sm-10">
                            <VC.Global.Components.Selector ref={REF_FORM_TB + FORM_STUDENT6} classroomId={this.props.classroomId} loadAction="GetAvailableFeaturedStudents" defaultName="Select Student computer" onSelectedItemChanged={() => this.onSelectedStudentChanged() } className="form-control" />
                        </div>
                    </div>
                    <div ref={REF_FORM_DIV + FORM_STUDENT7} className="form-group">
                        <label className="col-sm-2" htmlFor={REF_FORM_TB + FORM_STUDENT7}>Student 7: </label>
                        <div className="col-sm-10">
                            <VC.Global.Components.Selector ref={REF_FORM_TB + FORM_STUDENT7} classroomId={this.props.classroomId} loadAction="GetAvailableFeaturedStudents" defaultName="Select Student computer" onSelectedItemChanged={() => this.onSelectedStudentChanged() } className="form-control" />
                        </div>
                    </div>
                    <div ref={REF_FORM_DIV + FORM_STUDENT8} className="form-group">
                        <label className="col-sm-2" htmlFor={REF_FORM_TB + FORM_STUDENT8}>Student 8: </label>
                        <div className="col-sm-10">
                            <VC.Global.Components.Selector ref={REF_FORM_TB + FORM_STUDENT8} classroomId={this.props.classroomId} loadAction="GetAvailableFeaturedStudents" defaultName="Select Student computer" onSelectedItemChanged={() => this.onSelectedStudentChanged() } className="form-control" />
                        </div>
                    </div>
                </form>
            );
        }

        render(): JSX.Element {
            return (
                <div ref={(ref: HTMLDivElement) => this.divBox = ref} className="modal fade" role="dialog">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <button type="button" className="close" data-dismiss="modal">&times; </button>
                                <h4 className="modal-title">{this.state.name}</h4>
                            </div>
                            <div className="model-body" style={{ display: (this.state.status === BoxStatus.Loading ? "block" : "none") }}>
                                <span>Loading ...</span>
                            </div>
                            <div className="modal-body" style={{ display: (this.state.status !== BoxStatus.Loading ? "block" : "none") }}>
                                {this.renderForm() }
                            </div>
                            <div ref={(ref: HTMLDivElement) => this.divButtons = ref} className="modal-footer" style={{ display: (this.state.status === BoxStatus.View  ? "block" : "none") }}>
                                <button type="button" className="btn btn-success" onClick={() => this.updateFeatured() }><span className="glyphicon glyphicon-plus"></span> Update</button>
                                <button type="button" className="btn btn-default" data-dismiss="modal">Close</button>
                            </div>
                            <div ref={(ref: HTMLDivElement) => this.divProcessing = ref} className="modal-footer" style={{ display: (this.state.status === BoxStatus.Processing ? "block" : "none") }}>
                                <span>Processing ...</span>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
    }
}