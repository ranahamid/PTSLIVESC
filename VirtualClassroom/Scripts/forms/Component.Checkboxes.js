/* tslint:disable:max-line-length */
var App;
(function (App) {
    var Surveys;
    (function (Surveys) {
        "use strict";
        class ComponentCheckboxes extends Surveys.Component {
            defaultConfig() {
                let items = [
                    { id: 1, text: "Item 1" },
                    { id: 2, text: "Item 2" }
                ];
                return { items: items };
            }
            defaultAnswer() {
                return { checkedItems: [] };
            }
            onAdd_Click() {
                let items = this.config().items;
                let id = items.length + 1;
                items.push({ id: id, text: "Item " + id });
                this.saveConfig({ items: items }, true);
            }
            onRemove_Click() {
                let items = this.config().items;
                if (items.length > 1) {
                    let _items = [];
                    for (let i = 0; i < items.length - 1; i++) {
                        _items.push(items[i]);
                    }
                    this.saveConfig({ items: _items }, true);
                }
            }
            isChecked(id) {
                let checked = false;
                let checkedItems = this.answer().checkedItems;
                for (let i = 0; i < checkedItems.length && !checked; i++) {
                    if (checkedItems[i] === id) {
                        checked = true;
                    }
                }
                return checked;
            }
            onTextItemChanged(id, e) {
                let items = this.config().items;
                items[id - 1].text = e.target.value;
                this.saveConfig({ items: items });
            }
            onCheckedItemChanged(id, e) {
                let checkedItems = this.answer().checkedItems;
                if (!e.target.checked && this.isChecked(id)) {
                    // remove from list
                    let _checkedItems = [];
                    for (let i = 0; i < checkedItems.length; i++) {
                        if (checkedItems[i] !== id) {
                            _checkedItems.push(checkedItems[i]);
                        }
                    }
                    this.saveAnswer({ checkedItems: _checkedItems });
                }
                else if (e.target.checked && !this.isChecked(id)) {
                    // add to list
                    checkedItems.push(id);
                    this.saveAnswer({ checkedItems: checkedItems });
                }
            }
            renderEdit() {
                let items = this.config().items;
                return (React.createElement("div", {key: "edit_" + this.props.component.id}, items.map((item) => {
                    return (React.createElement("div", {key: "edit_" + this.props.component.id + "_" + item.id}, React.createElement("label", null, React.createElement("table", null, React.createElement("tbody", null, React.createElement("tr", null, React.createElement("td", null, React.createElement("input", {type: "checkbox", disabled: "disabled"})), React.createElement("td", null, React.createElement("input", {className: "form-control", type: "textbox", defaultValue: item.text, onChange: (e) => this.onTextItemChanged(item.id, e)}))))))));
                }), React.createElement("div", {className: "buttons"}, React.createElement("table", null, React.createElement("tr", null, React.createElement("td", null, React.createElement("div", null, React.createElement("button", {onClick: () => this.onAdd_Click(), className: "btn btn-xs btn-success"}, React.createElement("span", {className: "glyphicon glyphicon-plus"})))), React.createElement("td", null, React.createElement("div", {style: { display: (items.length > 1 ? "block" : "none") }}, React.createElement("button", {onClick: () => this.onRemove_Click(), className: "btn btn-xs btn-danger"}, React.createElement("span", {className: "glyphicon glyphicon-minus"})))))))));
            }
            renderView() {
                return (React.createElement("div", {key: "view_" + this.props.component.id}, this.config().items.map((item) => {
                    return (React.createElement("div", {key: "view_" + this.props.component.id + "_" + item.id}, React.createElement("label", null, React.createElement("input", {type: "checkbox", defaultChecked: this.isChecked(item.id), onChange: (e) => this.onCheckedItemChanged(item.id, e)}), " ", item.text)));
                })));
            }
            renderAnswer() {
                return (React.createElement("div", {key: "answer_" + this.props.component.id}, this.config().items.map((item) => {
                    return (React.createElement("div", {key: "answer_" + this.props.component.id + "_" + item.id}, React.createElement("label", null, React.createElement("input", {type: "checkbox", defaultChecked: this.isChecked(item.id), disabled: "disabled"}), " ", item.text)));
                })));
            }
        }
        Surveys.ComponentCheckboxes = ComponentCheckboxes;
    })(Surveys = App.Surveys || (App.Surveys = {}));
})(App || (App = {}));
//# sourceMappingURL=Component.Checkboxes.js.map