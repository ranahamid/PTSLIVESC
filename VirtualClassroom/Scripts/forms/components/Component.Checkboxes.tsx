/* tslint:disable:max-line-length */

namespace VC.Forms.Components {
    "use strict";

    interface ICheckBox {
        id: number;
        text: string;
    }

    interface IConfig {
        items: Array<ICheckBox>;
    }
    interface IAnswer {
        checkedItems: Array<number>;
    }

    const REF_ITEM_DIV: string = "ItemDiv";
    const REF_ITEM_TB: string = "ItemTb";

    export class ComponentCheckboxes extends Component<IConfig, IAnswer> {
        private autoValidate: boolean = false;
        private chart: Chart;

        defaultConfig(): IConfig {
            let items: Array<ICheckBox> = [
                { id: 1, text: "" } as ICheckBox,
                { id: 2, text: "" } as ICheckBox
            ] as Array<ICheckBox>;
            return { items: items } as IConfig;
        }
        defaultAnswer(): IAnswer {
            return { checkedItems: [] } as IAnswer;
        }

        private onAdd_Click(): void {
            let items: Array<ICheckBox> = this.config().items;
            let id: number = items.length + 1;
            items.push({ id: id, text: "" } as ICheckBox);
            this.saveConfig({ items: items } as IConfig, true);
        }
        private onRemove_Click(): void {
            let items: Array<ICheckBox> = this.config().items;
            if (items.length > 1) {
                let _items: Array<ICheckBox> = [];
                for (let i: number = 0; i < items.length - 1; i++) {
                    _items.push(items[i]);
                }
                this.saveConfig({ items: _items } as IConfig, true);
            }
        }

        private isChecked(id: number): boolean {
            let checked: boolean = false;
            let checkedItems: Array<number> = this.answer().checkedItems;
            for (let i: number = 0; i < checkedItems.length && !checked; i++) {
                if (checkedItems[i] === id) {
                    checked = true;
                }
            }
            return checked;
        }

        private onTextItemChanged(id: number, e: React.FormEvent): void {
            let items: Array<ICheckBox> = this.config().items;
            items[id - 1].text = (e.target as HTMLInputElement).value;
            this.saveConfig({ items: items } as IConfig);

            if (this.autoValidate) {
                this.validate();
            }
        }
        private onCheckedItemChanged(id: number, e: React.FormEvent): void {
            let checkedItems: Array<number> = this.answer().checkedItems;
            if (!((e.target as HTMLInputElement).checked) && this.isChecked(id)) {
                // remove from list
                let _checkedItems: Array<number> = [];
                for (let i: number = 0; i < checkedItems.length; i++) {
                    if (checkedItems[i] !== id) {
                        _checkedItems.push(checkedItems[i]);
                    }
                }
                this.saveAnswer({ checkedItems: _checkedItems } as IAnswer);
            } else if ((e.target as HTMLInputElement).checked && !this.isChecked(id)) {
                // add to list
                checkedItems.push(id);
                this.saveAnswer({ checkedItems: checkedItems } as IAnswer);
            }
        }

        public validate(): boolean {
            let valid: boolean = true;

            if (this.props.view === FormViews.Edit) {
                let items: Array<ICheckBox> = this.config().items;
                for (let i: number = 0; i < items.length; i++) {
                    let validItem: boolean = true;
                    validItem = items[i].text.trim().length > 0;
                    if (valid && !validItem) {
                        valid = false;
                    }
                    this.setValidationStatus(items[i].id, validItem);
                }
                if (!valid) {
                    this.autoValidate = true;
                }
            }

            return valid;
        }

        private setValidationStatus(id: number, valid: boolean): void {
            let tooltip: string = "Label cannot be empty.";

            let div: HTMLDivElement = this.refs[REF_ITEM_DIV + id] as HTMLDivElement;
            let tb: HTMLInputElement = this.refs[REF_ITEM_TB + id] as HTMLInputElement;

            if (valid) {
                div.className = "form-group has-success";
                $(tb).removeAttr("data-toggle");
                $(tb).removeAttr("data-placement");
                $(tb).removeAttr("title");
                $(tb).tooltip("destroy");
            } else {
                div.className = "form-group has-error";
                $(tb).attr("data-toggle", "tooltip");
                $(tb).attr("data-placement", "bottom");
                $(tb).attr("title", tooltip);
                $(tb).tooltip();
            }
        }

        private buildDataPoints(result: Array<number>): Array<IChartDataPoint> {
            let dataPoints: Array<IChartDataPoint> = [];

            let config: IConfig = this.config();

            let totalCount: number = result[result.length - 1];

            let resultCount: number = 0;
            for (let i: number = 0; i < config.items.length; i++) {
                resultCount += result[i];
            }

            if (totalCount === 0 || resultCount === 0) {
                let percent: number = 100 / config.items.length;
                percent = Math.round(percent * 10) / 10;
                for (let i: number = 0; i < config.items.length; i++) {
                    dataPoints.push({ label: config.items[i].text, y: percent, cnt: 0 } as IChartDataPoint);
                }
            } else {
                for (let i: number = 0; i < config.items.length; i++) {
                    let percent: number = 0;
                    if (result[i] > 0) {
                        percent = (result[i] / (totalCount / 100));
                        percent = Math.round(percent * 10) / 10;
                    }
                    dataPoints.push({ label: config.items[i].text, y: percent, cnt: result[i] } as IChartDataPoint);
                }
            }

            return dataPoints;
        }

        public updateResultData(result: Array<number>, resultData: IAnswer): Array<number> {
            for (let i: number = 0; i < resultData.checkedItems.length; i++) {
                result[resultData.checkedItems[i] - 1]++;
            }
            result[result.length - 1]++; // total count

            // update chart
            this.chart.update(this.buildDataPoints(result));

            return result;
        }

        componentDidMount(): void {
            let result: Array<number> = this.result();
            if (this.props.view === FormViews.Result && result !== null) {
                // show chart
                this.chart.show(this.buildDataPoints(result));
            }
        }

        renderEdit(): JSX.Element {
            let items: Array<ICheckBox> = this.config().items;
            return (
                <div key={"edit_" + this.props.component.id}>
                    {items.map((item: ICheckBox) => {
                        return (
                            <div ref={REF_ITEM_DIV + item.id} key={"edit_" + this.props.component.id + "_" + item.id} className="form-group">
                                <table>
                                    <tbody>
                                        <tr>
                                            <td><input type="checkbox" disabled="disabled" /></td>
                                            <td><input ref={REF_ITEM_TB + item.id} className="form-control" type="textbox" defaultValue={item.text} placeholder={"Check box " + item.id} onChange={(e: React.FormEvent) => this.onTextItemChanged(item.id, e) } /></td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        );
                    }) }

                    <div className="form-group buttons">
                        <table>
                            <tr>
                                <td><div><button type="button" onClick={() => this.onAdd_Click() } className="btn btn-xs btn-success"><span className="glyphicon glyphicon-plus"></span></button></div></td>
                                <td><div style={{ display: (items.length > 1 ? "block" : "none") }}><button type="button" onClick={() => this.onRemove_Click() } className="btn btn-xs btn-danger"><span className="glyphicon glyphicon-minus"></span></button></div></td>
                            </tr>
                        </table>
                    </div>
                </div>
            );
        }
        renderPreview(): JSX.Element {
            return (
                <div key={"view_" + this.props.component.id}>
                    {this.config().items.map((item: ICheckBox) => {
                        return (
                            <div key={"preview_" + this.props.component.id + "_" + item.id} className="form-group">
                                <label><input type="checkbox" disabled="true" /> {item.text}</label>
                            </div>
                        );
                    }) }
                </div>
            );
        }
        renderView(): JSX.Element {
            return (
                <div key={"view_" + this.props.component.id}>
                    {this.config().items.map((item: ICheckBox) => {
                        return (
                            <div key={"view_" + this.props.component.id + "_" + item.id} className="form-group">
                                <label><input type="checkbox" defaultChecked={this.isChecked(item.id) } onChange={(e: React.FormEvent) => this.onCheckedItemChanged(item.id, e) } /> {item.text}</label>
                            </div>
                        );
                    }) }
                </div>
            );
        }
        renderAnswer(): JSX.Element {
            return (
                <div key={"answer_" + this.props.component.id}>
                    {this.config().items.map((item: ICheckBox) => {
                        return (
                            <div key={"answer_" + this.props.component.id + "_" + item.id} className="form-group">
                                <label><input type="checkbox" defaultChecked={this.isChecked(item.id) } disabled="disabled" /> {item.text}</label>
                            </div>
                        );
                    }) }
                </div>
            );
        }
        renderResult(): JSX.Element {
            return (
                <div key={"result_" + this.props.component.id}>
                    <Chart ref={(ref: Chart) => this.chart = ref} id={"chartContainer_" + this.props.component.id} width="500px" height="300px" />
                </div>
                );
        }
    }

}