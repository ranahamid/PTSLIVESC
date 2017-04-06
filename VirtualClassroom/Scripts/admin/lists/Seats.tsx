/* tslint:disable:max-line-length */

namespace VC.Admin.Lists {
    "use strict";

    const FORM_ID: string = "Id";
    const FORM_NAME: string = "Name";
    const FORM_STUDENT1: string = "Student1";
    const FORM_STUDENT2: string = "Student2";
    const FORM_STUDENT3: string = "Student3";
    const FORM_STUDENT4: string = "Student4";
    const FORM_STUDENT5: string = "Student5";
    const FORM_STUDENT6: string = "Student6";
    const FORM_STUDENT7: string = "Student7";
    const FORM_STUDENT8: string = "Student8";

    interface ISeatsListItem extends IDataItem<string> {
        uid: string;
        name: string;
        students: Array<IStudentsListItem>;
    }

    export class Seats extends Base<string, ISeatsListItem, SeatsList, SeatsBox, SeatsImportBox> {
        private list: SeatsList;
        private box: SeatsBox;
        private boxImport: SeatsImportBox;

        public getList(): SeatsList {
            return this.list;
        }
        public getBox(): SeatsBox {
            return this.box;
        }
        public getImportBox(): SeatsImportBox {
            return this.boxImport;
        }

        render(): JSX.Element {
            return (
                <div>
                    <SeatsList ref={(ref: SeatsList) => this.list = ref} title="Seat computer" actionUrl={this.props.actionUrl} classroomId={this.props.classroomId} loadMethod="LoadSeats" showBoxImport={() => this.showBoxImport() } showBoxNew={this.showBoxNew.bind(this) }  disableClass={this.disableClass.bind(this) } showBoxEdit={this.showBoxEdit.bind(this) } showBoxDelete={this.showBoxDelete.bind(this) } />
                    <SeatsBox ref={(ref: SeatsBox) => this.box = ref} title="Seat computer" actionUrl={this.props.actionUrl} classroomId={this.props.classroomId} getListItems={this.getListItems.bind(this) } setListItems={this.setListItems.bind(this) } />
                    <SeatsImportBox ref={(ref: SeatsImportBox) => this.boxImport = ref} title="Import Seat computers" classroomId={this.props.classroomId} getListItems={this.getListItems.bind(this) } setListItems={this.setListItems.bind(this) }></SeatsImportBox>
                </div>
            );
        }
    }

    interface ISeatsListProps extends IListProps<string> { }
    interface ISeatsListState extends IListState<ISeatsListItem> { }

    class SeatsList extends List<string, ISeatsListItem, ISeatsListProps, ISeatsListState> {

        renderItemCols(d: ISeatsListItem): JSX.Element[] {
            let names: string = "";
            if (d.students.length === 0) {
                names = "-";
            } else {
                let j: number = 0;
                for (let i: number = 0; i < d.students.length; i++) {
                    if (d.students[i] !== null) {
                        if (j > 0) {
                            names += ", ";
                        }
                        names += d.students[i].name;
                        j++;
                    }
                }
            }

            var l: Array<JSX.Element> = [];
            l.push(<td key={"tdId_" + d.id}>{d.id}</td>);
            l.push(<td key={"tdName_" + d.id}>{d.name}</td>);
            l.push(<td key={"tdStudents_" + d.id}>{names}</td>);
            return l;
        }
        renderTableHeaderCols(): JSX.Element[] {
            var l: Array<JSX.Element> = [];
            l.push(<th key={"thId"}>ID</th>);
            l.push(<th key={"thSeat"}>Seat computer</th>);
            l.push(<th key={"thStudents"}>Students</th>);
            return l;
        }
    }

    interface ISeatsBoxProps extends IBoxProps<ISeatsListItem> { }
    interface ISeatsBoxState extends IBoxState<ISeatsListItem> { }

    class SeatsBox extends Box<string, ISeatsListItem, ISeatsBoxProps, ISeatsBoxState> {

        constructor(props: ISeatsBoxProps) {
            super({ id: "", name: "", students: null } as ISeatsListItem,
                props);
        }

        private getStudentByPosition(position: number): IStudentsListItem {
            let student: IStudentsListItem = null;
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

        boxWillShow(): void {
            let tbId: HTMLInputElement = this.refs[REF_FORM_TB + FORM_ID] as HTMLInputElement;
            let tbName: HTMLInputElement = this.refs[REF_FORM_TB + FORM_NAME] as HTMLInputElement;
            $(tbId).val(this.state.item.id);
            $(tbName).val(this.state.item.name);

            this.setValidationStatus(FORM_ID, BoxValidationStatus.None, "");
            this.setValidationStatus(FORM_NAME, BoxValidationStatus.None, "");

            let tbStudent1: Global.Components.Selector = this.refs[REF_FORM_TB + FORM_STUDENT1] as Global.Components.Selector;
            let tbStudent2: Global.Components.Selector = this.refs[REF_FORM_TB + FORM_STUDENT2] as Global.Components.Selector;
            let tbStudent3: Global.Components.Selector = this.refs[REF_FORM_TB + FORM_STUDENT3] as Global.Components.Selector;
            let tbStudent4: Global.Components.Selector = this.refs[REF_FORM_TB + FORM_STUDENT4] as Global.Components.Selector;
            let tbStudent5: Global.Components.Selector = this.refs[REF_FORM_TB + FORM_STUDENT5] as Global.Components.Selector;
            let tbStudent6: Global.Components.Selector = this.refs[REF_FORM_TB + FORM_STUDENT6] as Global.Components.Selector;
            let tbStudent7: Global.Components.Selector = this.refs[REF_FORM_TB + FORM_STUDENT7] as Global.Components.Selector;
            let tbStudent8: Global.Components.Selector = this.refs[REF_FORM_TB + FORM_STUDENT8] as Global.Components.Selector;

            let student1: IStudentsListItem = this.getStudentByPosition(1);
            let student2: IStudentsListItem = this.getStudentByPosition(2);
            let student3: IStudentsListItem = this.getStudentByPosition(3);
            let student4: IStudentsListItem = this.getStudentByPosition(4);
            let student5: IStudentsListItem = this.getStudentByPosition(5);
            let student6: IStudentsListItem = this.getStudentByPosition(6);
            let student7: IStudentsListItem = this.getStudentByPosition(7);
            let student8: IStudentsListItem = this.getStudentByPosition(8);

            tbStudent1.init(student1 !== null ? student1.id : null, this.state.item.id);
            tbStudent2.init(student2 !== null ? student2.id : null, this.state.item.id);
            tbStudent3.init(student3 !== null ? student3.id : null, this.state.item.id);
            tbStudent4.init(student4 !== null ? student4.id : null, this.state.item.id);
            tbStudent5.init(student5 !== null ? student5.id : null, this.state.item.id);
            tbStudent6.init(student6 !== null ? student6.id : null, this.state.item.id);
            tbStudent7.init(student7 !== null ? student7.id : null, this.state.item.id);
            tbStudent8.init(student8 !== null ? student8.id : null, this.state.item.id);
        }
        boxDidShow(): void {
            if (this.state.type === BoxTypes.Create) {
                var tbId: HTMLInputElement = this.refs[REF_FORM_TB + FORM_ID] as HTMLInputElement;
                $(tbId).focus();
            } else if (this.state.type === BoxTypes.Edit) {
                var tbName: HTMLInputElement = this.refs[REF_FORM_TB + FORM_NAME] as HTMLInputElement;
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
                    this.setValidationStatus(FORM_ID, BoxValidationStatus.Error, "Seat computer Id cannot be empty. It must be unique and contains only alphanumeric characters.");
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
                    this.setValidationStatus(FORM_NAME, BoxValidationStatus.Error, "Seat computer name cannot be empty.");
                    if (focusOnError) {
                        $(tbName).focus();
                    }
                    valid = false;
                }
            }

            return valid;
        }
        validateStudents(focusOnError: boolean): boolean {
            let tbStudent1: Global.Components.Selector = this.refs[REF_FORM_TB + FORM_STUDENT1] as Global.Components.Selector;
            let tbStudent2: Global.Components.Selector = this.refs[REF_FORM_TB + FORM_STUDENT2] as Global.Components.Selector;
            let tbStudent3: Global.Components.Selector = this.refs[REF_FORM_TB + FORM_STUDENT3] as Global.Components.Selector;
            let tbStudent4: Global.Components.Selector = this.refs[REF_FORM_TB + FORM_STUDENT4] as Global.Components.Selector;
            let tbStudent5: Global.Components.Selector = this.refs[REF_FORM_TB + FORM_STUDENT5] as Global.Components.Selector;
            let tbStudent6: Global.Components.Selector = this.refs[REF_FORM_TB + FORM_STUDENT6] as Global.Components.Selector;
            let tbStudent7: Global.Components.Selector = this.refs[REF_FORM_TB + FORM_STUDENT7] as Global.Components.Selector;
            let tbStudent8: Global.Components.Selector = this.refs[REF_FORM_TB + FORM_STUDENT8] as Global.Components.Selector;

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
        validateForm(focusOnError: boolean): boolean {
            let valid: boolean = true;

            if (!this.validateStudents(focusOnError)) {
                valid = false;
            }
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
                url: "/api/Classroom/" + this.props.classroomId + "/IsSeatExists/" + id,
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

                this.setValidationStatus(FORM_ID, BoxValidationStatus.Error, "Seat Id already exists.");
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

            let student1: IStudentsListItem = null;
            let tbStudent1: Global.Components.Selector = this.refs[REF_FORM_TB + FORM_STUDENT1] as Global.Components.Selector;
            let selectedStudent1: string = tbStudent1.getSelectedValue();
            if (selectedStudent1 !== "") {
                student1 = { id: selectedStudent1, name: tbStudent1.getSelectedText(), position: 1 } as IStudentsListItem;
            }

            let student2: IStudentsListItem = null;
            let tbStudent2: Global.Components.Selector = this.refs[REF_FORM_TB + FORM_STUDENT2] as Global.Components.Selector;
            let selectedStudent2: string = tbStudent2.getSelectedValue();
            if (selectedStudent2 !== "") {
                student2 = { id: selectedStudent2, name: tbStudent2.getSelectedText(), position: 2 } as IStudentsListItem;
            }

            let student3: IStudentsListItem = null;
            let tbStudent3: Global.Components.Selector = this.refs[REF_FORM_TB + FORM_STUDENT3] as Global.Components.Selector;
            let selectedStudent3: string = tbStudent3.getSelectedValue();
            if (selectedStudent3 !== "") {
                student3 = { id: selectedStudent3, name: tbStudent3.getSelectedText(), position: 3 } as IStudentsListItem;
            }

            let student4: IStudentsListItem = null;
            let tbStudent4: Global.Components.Selector = this.refs[REF_FORM_TB + FORM_STUDENT4] as Global.Components.Selector;
            let selectedStudent4: string = tbStudent4.getSelectedValue();
            if (selectedStudent4 !== "") {
                student4 = { id: selectedStudent4, name: tbStudent4.getSelectedText(), position: 4 } as IStudentsListItem;
            }

            let student5: IStudentsListItem = null;
            let tbStudent5: Global.Components.Selector = this.refs[REF_FORM_TB + FORM_STUDENT5] as Global.Components.Selector;
            let selectedStudent5: string = tbStudent5.getSelectedValue();
            if (selectedStudent5 !== "") {
                student5 = { id: selectedStudent5, name: tbStudent5.getSelectedText(), position: 5 } as IStudentsListItem;
            }

            let student6: IStudentsListItem = null;
            let tbStudent6: Global.Components.Selector = this.refs[REF_FORM_TB + FORM_STUDENT6] as Global.Components.Selector;
            let selectedStudent6: string = tbStudent6.getSelectedValue();
            if (selectedStudent6 !== "") {
                student6 = { id: selectedStudent6, name: tbStudent6.getSelectedText(), position: 6 } as IStudentsListItem;
            }

            let student7: IStudentsListItem = null;
            let tbStudent7: Global.Components.Selector = this.refs[REF_FORM_TB + FORM_STUDENT7] as Global.Components.Selector;
            let selectedStudent7: string = tbStudent7.getSelectedValue();
            if (selectedStudent7 !== "") {
                student7 = { id: selectedStudent7, name: tbStudent7.getSelectedText(), position: 7 } as IStudentsListItem;
            }

            let student8: IStudentsListItem = null;
            let tbStudent8: Global.Components.Selector = this.refs[REF_FORM_TB + FORM_STUDENT8] as Global.Components.Selector;
            let selectedStudent8: string = tbStudent8.getSelectedValue();
            if (selectedStudent8 !== "") {
                student8 = { id: selectedStudent8, name: tbStudent8.getSelectedText(), position: 8 } as IStudentsListItem;
            }

            let students: Array<IStudentsListItem> = [student1, student2, student3, student4, student5, student6, student7, student8];

            $.ajax({
                cache: false,
                type: "POST",
                url: "/api/Classroom/" + this.props.classroomId + "/CreateSeat/",
                data: JSON.stringify({ id: idVal, name: nameVal, students: students } as ISeatsListItem),
                contentType: "application/json",
                success: (r: Global.Data.IDataResponse<ISeatsListItem>): void => {
                    this.close();
                    if (r.status === Global.Data.RESPONSE_SUCCESS) {
                        // add to list
                        let d: Array<ISeatsListItem> = this.props.getListItems();
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

            let student1: IStudentsListItem = null;
            let tbStudent1: Global.Components.Selector = this.refs[REF_FORM_TB + FORM_STUDENT1] as Global.Components.Selector;
            let selectedStudent1: string = tbStudent1.getSelectedValue();
            if (selectedStudent1 !== "") {
                student1 = { id: selectedStudent1, name: tbStudent1.getSelectedText(), position: 1 } as IStudentsListItem;
            }

            let student2: IStudentsListItem = null;
            let tbStudent2: Global.Components.Selector = this.refs[REF_FORM_TB + FORM_STUDENT2] as Global.Components.Selector;
            let selectedStudent2: string = tbStudent2.getSelectedValue();
            if (selectedStudent2 !== "") {
                student2 = { id: selectedStudent2, name: tbStudent2.getSelectedText(), position: 2 } as IStudentsListItem;
            }

            let student3: IStudentsListItem = null;
            let tbStudent3: Global.Components.Selector = this.refs[REF_FORM_TB + FORM_STUDENT3] as Global.Components.Selector;
            let selectedStudent3: string = tbStudent3.getSelectedValue();
            if (selectedStudent3 !== "") {
                student3 = { id: selectedStudent3, name: tbStudent3.getSelectedText(), position: 3 } as IStudentsListItem;
            }

            let student4: IStudentsListItem = null;
            let tbStudent4: Global.Components.Selector = this.refs[REF_FORM_TB + FORM_STUDENT4] as Global.Components.Selector;
            let selectedStudent4: string = tbStudent4.getSelectedValue();
            if (selectedStudent4 !== "") {
                student4 = { id: selectedStudent4, name: tbStudent4.getSelectedText(), position: 4 } as IStudentsListItem;
            }

            let student5: IStudentsListItem = null;
            let tbStudent5: Global.Components.Selector = this.refs[REF_FORM_TB + FORM_STUDENT5] as Global.Components.Selector;
            let selectedStudent5: string = tbStudent5.getSelectedValue();
            if (selectedStudent5 !== "") {
                student5 = { id: selectedStudent5, name: tbStudent5.getSelectedText(), position: 5 } as IStudentsListItem;
            }

            let student6: IStudentsListItem = null;
            let tbStudent6: Global.Components.Selector = this.refs[REF_FORM_TB + FORM_STUDENT6] as Global.Components.Selector;
            let selectedStudent6: string = tbStudent6.getSelectedValue();
            if (selectedStudent6 !== "") {
                student6 = { id: selectedStudent6, name: tbStudent6.getSelectedText(), position: 6 } as IStudentsListItem;
            }

            let student7: IStudentsListItem = null;
            let tbStudent7: Global.Components.Selector = this.refs[REF_FORM_TB + FORM_STUDENT7] as Global.Components.Selector;
            let selectedStudent7: string = tbStudent7.getSelectedValue();
            if (selectedStudent7 !== "") {
                student7 = { id: selectedStudent7, name: tbStudent7.getSelectedText(), position: 7 } as IStudentsListItem;
            }

            let student8: IStudentsListItem = null;
            let tbStudent8: Global.Components.Selector = this.refs[REF_FORM_TB + FORM_STUDENT8] as Global.Components.Selector;
            let selectedStudent8: string = tbStudent8.getSelectedValue();
            if (selectedStudent8 !== "") {
                student8 = { id: selectedStudent8, name: tbStudent8.getSelectedText(), position: 8 } as IStudentsListItem;
            }

            let students: Array<IStudentsListItem> = [student1, student2, student3, student4, student5, student6, student7, student8];

            $.ajax({
                cache: false,
                type: "POST",
                url: "/api/Classroom/" + this.props.classroomId + "/UpdateSeat/",
                data: JSON.stringify({ id: idVal, name: nameVal, students: students } as ISeatsListItem),
                contentType: "application/json",
                success: (r: Global.Data.IDataResponse<ISeatsListItem>): void => {
                    this.close();
                    if (r.status === Global.Data.RESPONSE_SUCCESS) {
                        // update list
                        let d: Array<ISeatsListItem> = this.props.getListItems();
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
                url: "/api/Classroom/" + this.props.classroomId + "/DeleteSeat/",
                data: JSON.stringify(this.state.item.id),
                contentType: "application/json",
                success: (r: Global.Data.IDataResponse<string>): void => {
                    this.close();
                    if (r.status === Global.Data.RESPONSE_SUCCESS) {
                        // remove from list
                        let d: Array<ISeatsListItem> = this.props.getListItems();
                        let _d: Array<ISeatsListItem> = [];
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

        private onSelectedStudentChanged(): void {
            this.validateStudents(false);
        }

        renderForm(): JSX.Element {
            return (
                <form className="form-horizontal" role="form">
                    <div ref={REF_FORM_DIV + FORM_ID} className="form-group">
                        <label className="col-sm-2" htmlFor={REF_FORM_TB + FORM_ID}>Id: </label>
                        <div className="col-sm-10">
                            <input ref={REF_FORM_TB + FORM_ID} type="text" className="form-control" disabled={this.state.type !== BoxTypes.Create} placeholder="Seat computer Id" maxLength="25" onPaste={() => this.validateId(false) } onCut={() => this.validateId(false) } onKeyUp={(e: KeyboardEvent) => this.onKeyPressId(e) } />
                            <span ref={REF_FORM_ICON + FORM_ID} style={{ display: "none" }}></span>
                        </div>
                    </div>
                    <div ref={REF_FORM_DIV + FORM_NAME} className="form-group">
                        <label className="col-sm-2" htmlFor={REF_FORM_TB + FORM_NAME}>Name: </label>
                        <div className="col-sm-10">
                            <input ref={REF_FORM_TB + FORM_NAME} type="text" className="form-control" disabled={this.state.type === BoxTypes.Delete} placeholder="Seat computer name" maxLength="150" onPaste={() => this.validateName(false) } onCut={() => this.validateName(false) } onKeyUp={(e: KeyboardEvent) => this.onKeyPressName(e) } />
                            <span ref={REF_FORM_ICON + FORM_NAME} style={{ display: "none" }}></span>
                        </div>
                    </div>
                    <div ref={REF_FORM_DIV + FORM_STUDENT1} className="form-group">
                        <label className="col-sm-2" htmlFor={REF_FORM_TB + FORM_STUDENT1}>Student 1: </label>
                        <div className="col-sm-10">
                            <Global.Components.Selector ref={REF_FORM_TB + FORM_STUDENT1} classroomId={this.props.classroomId} loadAction="GetAvailableSeatStudents" defaultName="Select Student computer" onSelectedItemChanged={() => this.onSelectedStudentChanged() } className="form-control" />
                            <span ref={REF_FORM_ICON + FORM_STUDENT1} style={{ display: "none" }}></span>
                        </div>
                    </div>
                    <div ref={REF_FORM_DIV + FORM_STUDENT2} className="form-group">
                        <label className="col-sm-2" htmlFor={REF_FORM_TB + FORM_STUDENT2}>Student 2: </label>
                        <div className="col-sm-10">
                            <Global.Components.Selector ref={REF_FORM_TB + FORM_STUDENT2} classroomId={this.props.classroomId} loadAction="GetAvailableSeatStudents" defaultName="Select Student computer" onSelectedItemChanged={() => this.onSelectedStudentChanged() } className="form-control" />
                            <span ref={REF_FORM_ICON + FORM_STUDENT2} style={{ display: "none" }}></span>
                        </div>
                    </div>
                    <div ref={REF_FORM_DIV + FORM_STUDENT3} className="form-group">
                        <label className="col-sm-2" htmlFor={REF_FORM_TB + FORM_STUDENT3}>Student 3: </label>
                        <div className="col-sm-10">
                            <Global.Components.Selector ref={REF_FORM_TB + FORM_STUDENT3} classroomId={this.props.classroomId} loadAction="GetAvailableSeatStudents" defaultName="Select Student computer" onSelectedItemChanged={() => this.onSelectedStudentChanged() } className="form-control" />
                            <span ref={REF_FORM_ICON + FORM_STUDENT3} style={{ display: "none" }}></span>
                        </div>
                    </div>
                    <div ref={REF_FORM_DIV + FORM_STUDENT4} className="form-group">
                        <label className="col-sm-2" htmlFor={REF_FORM_TB + FORM_STUDENT4}>Student 4: </label>
                        <div className="col-sm-10">
                            <Global.Components.Selector ref={REF_FORM_TB + FORM_STUDENT4} classroomId={this.props.classroomId} loadAction="GetAvailableSeatStudents" defaultName="Select Student computer" onSelectedItemChanged={() => this.onSelectedStudentChanged() } className="form-control" />
                            <span ref={REF_FORM_ICON + FORM_STUDENT4} style={{ display: "none" }}></span>
                        </div>
                    </div>
                    <div ref={REF_FORM_DIV + FORM_STUDENT5} className="form-group">
                        <label className="col-sm-2" htmlFor={REF_FORM_TB + FORM_STUDENT5}>Student 5: </label>
                        <div className="col-sm-10">
                            <Global.Components.Selector ref={REF_FORM_TB + FORM_STUDENT5} classroomId={this.props.classroomId} loadAction="GetAvailableSeatStudents" defaultName="Select Student computer" onSelectedItemChanged={() => this.onSelectedStudentChanged() } className="form-control" />
                            <span ref={REF_FORM_ICON + FORM_STUDENT5} style={{ display: "none" }}></span>
                        </div>
                    </div>
                    <div ref={REF_FORM_DIV + FORM_STUDENT6} className="form-group">
                        <label className="col-sm-2" htmlFor={REF_FORM_TB + FORM_STUDENT6}>Student&nbsp; 6: </label>
                        <div className="col-sm-10">
                            <Global.Components.Selector ref={REF_FORM_TB + FORM_STUDENT6} classroomId={this.props.classroomId} loadAction="GetAvailableSeatStudents" defaultName="Select Student computer" onSelectedItemChanged={() => this.onSelectedStudentChanged() } className="form-control" />
                            <span ref={REF_FORM_ICON + FORM_STUDENT6} style={{ display: "none" }}></span>
                        </div>
                    </div>
                    <div ref={REF_FORM_DIV + FORM_STUDENT7} className="form-group">
                        <label className="col-sm-2" htmlFor={REF_FORM_TB + FORM_STUDENT7}>Student 7: </label>
                        <div className="col-sm-10">
                            <Global.Components.Selector ref={REF_FORM_TB + FORM_STUDENT7} classroomId={this.props.classroomId} loadAction="GetAvailableSeatStudents" defaultName="Select Student computer" onSelectedItemChanged={() => this.onSelectedStudentChanged() } className="form-control" />
                            <span ref={REF_FORM_ICON + FORM_STUDENT7} style={{ display: "none" }}></span>
                        </div>
                    </div>
                    <div ref={REF_FORM_DIV + FORM_STUDENT8} className="form-group">
                        <label className="col-sm-2" htmlFor={REF_FORM_TB + FORM_STUDENT8}>Student 8: </label>
                        <div className="col-sm-10">
                            <Global.Components.Selector ref={REF_FORM_TB + FORM_STUDENT8} classroomId={this.props.classroomId} loadAction="GetAvailableSeatStudents" defaultName="Select Student computer" onSelectedItemChanged={() => this.onSelectedStudentChanged() } className="form-control" />
                            <span ref={REF_FORM_ICON + FORM_STUDENT8} style={{ display: "none" }}></span>
                        </div>
                    </div>
                </form>
            );
        }
    }

    interface ISeatsImportBoxProps extends IImportBoxProps<ISeatsListItem> { }
    interface ISeatsImportBoxState extends IImportBoxState<ISeatsListItem> { }

    class SeatsImportBox extends ImportBox<string, ISeatsListItem, ISeatsImportBoxProps, ISeatsImportBoxState> {
        constructor(props: ISeatsImportBoxProps) {
            super(props);
        }

        renderHelp(): JSX.Element {
            return (
                <div className="text-muted">
                    EXAMPLE: <br />
                    ID1, "Seat Name"<br />
                    ID2, "Seat Name"<br />
                    ID3, "Seat Name"<br />
                </div>
            );
        }

        placeholder(): string {
            return "ID1, \"Seat Name\"\nID2, \"Seat Name\"\nID3, \"Seat Name\"";
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
                    url: "/api/Classroom/" + this.props.classroomId + "/ImportSeats",
                    data: JSON.stringify(data),
                    contentType: "application/json",
                    success: (r: Global.Data.IDataResponse<Array<ISeatsListItem>>): void => {
                        if (r.status === Global.Data.RESPONSE_SUCCESS) {
                            this.tb.value = "";
                            this.close();
                            // add to list
                            let d: Array<ISeatsListItem> = this.props.getListItems();
                            r.data.forEach((item: ISeatsListItem) => {
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