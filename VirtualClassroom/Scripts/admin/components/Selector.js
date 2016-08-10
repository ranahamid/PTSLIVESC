/* tslint:disable:max-line-length */
var VC;
(function (VC) {
    var Admin;
    (function (Admin) {
        var Components;
        (function (Components) {
            "use strict";
            class SelectorItem extends React.Component {
                constructor(props) {
                    super(props);
                }
                render() {
                    return (React.createElement("option", {value: this.props.item.id}, this.props.item.name));
                }
            }
            var SelectorStatus;
            (function (SelectorStatus) {
                SelectorStatus[SelectorStatus["Loading"] = 0] = "Loading";
                SelectorStatus[SelectorStatus["Success"] = 1] = "Success";
                SelectorStatus[SelectorStatus["Error"] = 2] = "Error";
            })(SelectorStatus || (SelectorStatus = {}));
            class Selector extends React.Component {
                constructor(props) {
                    super(props);
                    this.state = { status: SelectorStatus.Loading, errorMessage: "", items: [], selectedValue: null, validationError: "" };
                }
                init(selectedValue, includeId) {
                    this.setState({ status: SelectorStatus.Loading, errorMessage: "", items: [], selectedValue: null, validationError: "" });
                    $.ajax({
                        cache: false,
                        type: "GET",
                        url: "/api/Classroom/" + this.props.classroomId + "/" + this.props.loadAction + (includeId != null ? "/" + includeId : ""),
                        contentType: "application/json",
                        success: (r) => {
                            if (r.status === VC.Global.Data.RESPONSE_SUCCESS) {
                                this.setState({ status: SelectorStatus.Success, errorMessage: "", items: r.data, selectedValue: selectedValue, validationError: "" });
                                this.select.value = (selectedValue === null ? "" : selectedValue);
                            }
                            else {
                                this.setErrorMessage(r.message);
                            }
                        },
                        error: (xhr, status, error) => {
                            this.setErrorMessage("XHR Error - " + xhr.statusText);
                        }
                    });
                }
                setErrorMessage(msg) {
                    this.setState({ status: SelectorStatus.Error, errorMessage: msg, items: this.state.items, selectedValue: this.state.selectedValue, validationError: "" });
                }
                getSelectedValue() {
                    return this.select.value;
                }
                getSelectedText() {
                    let text = "";
                    let selectedValue = this.getSelectedValue();
                    for (let i = 0; i < this.state.items.length && text === ""; i++) {
                        if (this.state.items[i].id === selectedValue) {
                            text = this.state.items[i].name;
                        }
                    }
                    return text;
                }
                onSelectedItemChanged() {
                    let selectedValue = this.getSelectedValue();
                    this.state.selectedValue = selectedValue;
                    this.props.onSelectedItemChanged();
                }
                focus() {
                    this.select.focus();
                }
                renderLoading() {
                    return (React.createElement("select", {ref: (ref) => this.select = ref, disabled: "true", className: this.props.className, style: { color: "orange" }}, React.createElement("option", null, "Loading ...")));
                }
                renderError() {
                    return (React.createElement("select", {ref: (ref) => this.select = ref, disabled: "true", className: this.props.className, style: { color: "red" }}, React.createElement("option", null, "ERROR:" + this.state.errorMessage)));
                }
                renderSelectorItems() {
                    let items = [];
                    for (let i = 0; i < this.state.items.length; i++) {
                        items.push(React.createElement(SelectorItem, {key: this.state.items[i].id, item: this.state.items[i], selected: this.state.items[i].id === this.state.selectedValue}));
                    }
                    return items;
                }
                renderSelector() {
                    let items = this.renderSelectorItems();
                    return (React.createElement("select", {ref: (ref) => this.select = ref, className: this.props.className, onChange: this.onSelectedItemChanged.bind(this)}, React.createElement("option", {value: "", style: { color: "gray" }, selected: this.state.selectedValue === null}, "== ", this.props.defaultName, " =="), items));
                }
                render() {
                    if (this.state.status === SelectorStatus.Loading) {
                        return this.renderLoading();
                    }
                    else if (this.state.status === SelectorStatus.Error) {
                        return this.renderError();
                    }
                    else {
                        return this.renderSelector();
                    }
                }
            }
            Components.Selector = Selector;
        })(Components = Admin.Components || (Admin.Components = {}));
    })(Admin = VC.Admin || (VC.Admin = {}));
})(VC || (VC = {}));
//# sourceMappingURL=Selector.js.map