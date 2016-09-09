var VC;
(function (VC) {
    var Forms;
    (function (Forms) {
        var Components;
        (function (Components) {
            "use strict";
            const REF_ITEM_DIV = "ItemDiv";
            const REF_ITEM_TB = "ItemTb";
            class ComponentRadiobuttons extends Components.Component {
                constructor(...args) {
                    super(...args);
                    this.autoValidate = false;
                }
                defaultConfig() {
                    let items = [
                        { id: 1, text: "" },
                        { id: 2, text: "" }
                    ];
                    return { items: items };
                }
                defaultAnswer() {
                    return { selectedItem: 1 };
                }
                onAdd_Click() {
                    let items = this.config().items;
                    let id = items.length + 1;
                    items.push({ id: id, text: "" });
                    this.saveConfig({ items: items }, true);
                }
                onRemove_Click() {
                    let items = this.config().items;
                    if (items.length > 2) {
                        let _items = [];
                        for (let i = 0; i < items.length - 1; i++) {
                            _items.push(items[i]);
                        }
                        this.saveConfig({ items: _items }, true);
                    }
                }
                onTextItemChanged(id, e) {
                    let items = this.config().items;
                    items[id - 1].text = e.target.value;
                    this.saveConfig({ items: items });
                    if (this.autoValidate) {
                        this.validate();
                    }
                }
                onSelectedItemChanged(id, e) {
                    let selectedItem = id;
                    this.saveAnswer({ selectedItem: selectedItem });
                }
                validate() {
                    let valid = true;
                    if (this.props.view === Forms.FormViews.Edit) {
                        let items = this.config().items;
                        for (let i = 0; i < items.length; i++) {
                            let validItem = true;
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
                setValidationStatus(id, valid) {
                    let tooltip = "Label cannot be empty.";
                    let div = this.refs[REF_ITEM_DIV + id];
                    let tb = this.refs[REF_ITEM_TB + id];
                    if (valid) {
                        div.className = "form-group has-success";
                        $(tb).removeAttr("data-toggle");
                        $(tb).removeAttr("data-placement");
                        $(tb).removeAttr("title");
                        $(tb).tooltip("destroy");
                    }
                    else {
                        div.className = "form-group has-error";
                        $(tb).attr("data-toggle", "tooltip");
                        $(tb).attr("data-placement", "bottom");
                        $(tb).attr("title", tooltip);
                        $(tb).tooltip();
                    }
                }
                buildDataPoints(result) {
                    let dataPoints = [];
                    let config = this.config();
                    let totalCount = result[result.length - 1];
                    let resultCount = 0;
                    for (let i = 0; i < config.items.length; i++) {
                        resultCount += result[i];
                    }
                    if (totalCount === 0 || resultCount === 0) {
                        let percent = 100 / config.items.length;
                        percent = Math.round(percent * 10) / 10;
                        for (let i = 0; i < config.items.length; i++) {
                            dataPoints.push({ label: config.items[i].text, y: percent, cnt: 0 });
                        }
                    }
                    else {
                        for (let i = 0; i < config.items.length; i++) {
                            let percent = 0;
                            if (result[i] > 0) {
                                percent = (result[i] / (totalCount / 100));
                                percent = Math.round(percent * 10) / 10;
                            }
                            dataPoints.push({ label: config.items[i].text, y: percent, cnt: result[i] });
                        }
                    }
                    return dataPoints;
                }
                updateResultData(result, resultData) {
                    result[resultData.selectedItem - 1]++;
                    result[result.length - 1]++;
                    this.chart.update(this.buildDataPoints(result));
                    return result;
                }
                componentDidMount() {
                    let result = this.result();
                    if (this.props.view === Forms.FormViews.Result && result !== null) {
                        this.chart.show(this.buildDataPoints(result));
                    }
                }
                renderEdit() {
                    let items = this.config().items;
                    return (React.createElement("div", {key: "edit_" + this.props.component.id}, items.map((item) => {
                        return (React.createElement("div", {ref: REF_ITEM_DIV + item.id, key: "edit_" + this.props.component.id + "_" + item.id, className: "form-group"}, React.createElement("table", null, React.createElement("tbody", null, React.createElement("tr", null, React.createElement("td", null, React.createElement("input", {type: "radio", disabled: "disabled"})), React.createElement("td", null, React.createElement("input", {ref: REF_ITEM_TB + item.id, className: "form-control", type: "textbox", defaultValue: item.text, placeholder: "Radio button " + item.id, onChange: (e) => this.onTextItemChanged(item.id, e)})))))));
                    }), React.createElement("div", {className: "form-group buttons"}, React.createElement("table", null, React.createElement("tr", null, React.createElement("td", null, React.createElement("div", null, React.createElement("button", {type: "button", onClick: () => this.onAdd_Click(), className: "btn btn-xs btn-success"}, React.createElement("span", {className: "glyphicon glyphicon-plus"})))), React.createElement("td", null, React.createElement("div", {style: { display: (items.length > 2 ? "block" : "none") }}, React.createElement("button", {type: "button", onClick: () => this.onRemove_Click(), className: "btn btn-xs btn-danger"}, React.createElement("span", {className: "glyphicon glyphicon-minus"})))))))));
                }
                renderPreview() {
                    return (React.createElement("div", {key: "preview_" + this.props.component.id}, this.config().items.map((item) => {
                        return (React.createElement("div", {key: "preview_" + this.props.component.id + "_" + item.id, className: "form-group"}, React.createElement("label", null, React.createElement("input", {type: "radio", name: "rbGroup_" + this.props.component.id, disabled: "true"}), " ", item.text)));
                    })));
                }
                renderView() {
                    let selectedItem = this.answer().selectedItem;
                    return (React.createElement("div", {key: "view_" + this.props.component.id}, this.config().items.map((item) => {
                        return (React.createElement("div", {key: "view_" + this.props.component.id + "_" + item.id, className: "form-group"}, React.createElement("label", null, React.createElement("input", {type: "radio", name: "rbGroup_" + this.props.component.id, defaultChecked: item.id === selectedItem, onChange: (e) => this.onSelectedItemChanged(item.id, e)}), " ", item.text)));
                    })));
                }
                renderAnswer() {
                    let selectedItem = this.answer().selectedItem;
                    return (React.createElement("div", {key: "answer_" + this.props.component.id}, this.config().items.map((item) => {
                        return (React.createElement("div", {key: "answer_" + this.props.component.id + "_" + item.id, className: "form-group"}, React.createElement("label", null, React.createElement("input", {type: "radio", name: "rbGroup_" + this.props.component.id, defaultChecked: item.id === selectedItem, disabled: "disabled"}), " ", item.text)));
                    })));
                }
                renderResult() {
                    return (React.createElement("div", {key: "result_" + this.props.component.id}, React.createElement(Components.Chart, {ref: (ref) => this.chart = ref, id: "chartContainer_" + this.props.component.id, width: "500px", height: "300px"})));
                }
            }
            Components.ComponentRadiobuttons = ComponentRadiobuttons;
        })(Components = Forms.Components || (Forms.Components = {}));
    })(Forms = VC.Forms || (VC.Forms = {}));
})(VC || (VC = {}));
//# sourceMappingURL=Component.Radiobuttons.js.map