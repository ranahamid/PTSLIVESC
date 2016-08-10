/* tslint:disable:max-line-length */
var App;
(function (App) {
    var Surveys;
    (function (Surveys) {
        "use strict";
        class ComponentRadiobuttons extends Surveys.Component {
            defaultConfig() {
                let items = [
                    { id: 1, text: "Item 1" },
                    { id: 2, text: "Item 2" }
                ];
                return { items: items };
            }
            defaultAnswer() {
                return { selectedItem: 1 }; // nothing selected
            }
            onAdd_Click() {
                let items = this.config().items;
                let id = items.length + 1;
                items.push({ id: id, text: "Item " + id });
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
            }
            onSelectedItemChanged(id, e) {
                let selectedItem = id;
                this.saveAnswer({ selectedItem: selectedItem });
            }
            renderEdit() {
                let items = this.config().items;
                return (React.createElement("div", {key: "edit_" + this.props.component.id}, items.map((item) => {
                    return (React.createElement("div", {key: "edit_" + this.props.component.id + "_" + item.id}, React.createElement("label", null, React.createElement("table", null, React.createElement("tbody", null, React.createElement("tr", null, React.createElement("td", null, React.createElement("input", {type: "radio", disabled: "disabled"})), React.createElement("td", null, React.createElement("input", {className: "form-control", type: "textbox", defaultValue: item.text, onChange: (e) => this.onTextItemChanged(item.id, e)}))))))));
                }), React.createElement("div", {className: "buttons"}, React.createElement("table", null, React.createElement("tr", null, React.createElement("td", null, React.createElement("div", null, React.createElement("button", {onClick: () => this.onAdd_Click(), className: "btn btn-xs btn-success"}, React.createElement("span", {className: "glyphicon glyphicon-plus"})))), React.createElement("td", null, React.createElement("div", {style: { display: (items.length > 2 ? "block" : "none") }}, React.createElement("button", {onClick: () => this.onRemove_Click(), className: "btn btn-xs btn-danger"}, React.createElement("span", {className: "glyphicon glyphicon-minus"})))))))));
            }
            renderView() {
                let selectedItem = this.answer().selectedItem;
                return (React.createElement("div", {key: "view_" + this.props.component.id}, this.config().items.map((item) => {
                    return (React.createElement("div", {key: "view_" + this.props.component.id + "_" + item.id}, React.createElement("label", null, React.createElement("input", {type: "radio", name: "rbGroup_" + this.props.component.id, defaultChecked: item.id === selectedItem, onChange: (e) => this.onSelectedItemChanged(item.id, e)}), " ", item.text)));
                })));
            }
            renderAnswer() {
                let selectedItem = this.answer().selectedItem;
                return (React.createElement("div", {key: "answer_" + this.props.component.id}, this.config().items.map((item) => {
                    return (React.createElement("div", {key: "answer_" + this.props.component.id + "_" + item.id}, React.createElement("label", null, React.createElement("input", {type: "radio", name: "rbGroup_" + this.props.component.id, defaultChecked: item.id === selectedItem, disabled: "disabled"}), " ", item.text)));
                })));
            }
        }
        Surveys.ComponentRadiobuttons = ComponentRadiobuttons;
    })(Surveys = App.Surveys || (App.Surveys = {}));
})(App || (App = {}));
//# sourceMappingURL=Component.Radiobuttons.js.map