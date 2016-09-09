var VC;
(function (VC) {
    var Global;
    (function (Global) {
        var Components;
        (function (Components) {
            "use strict";
            class TabItem extends React.Component {
                constructor(props) {
                    super(props);
                }
                onClick() {
                    if (!this.props.active) {
                        this.props.onClick(this.props.id);
                    }
                }
                render() {
                    let className = this.props.active ? "active" : "";
                    let title = this.props.title;
                    let badge = (React.createElement("span", null));
                    if (this.props.badge !== null) {
                        badge = (React.createElement("span", {className: "badge", style: { backgroundColor: (this.props.badge > 0 ? "green" : "gray") }}, this.props.badge));
                    }
                    if (this.props.badge != null) {
                        title = title + " ";
                    }
                    return (React.createElement("li", {className: className, style: { display: (this.props.hidden ? "none" : "inline-block") }}, React.createElement("a", {className: "link", onClick: () => this.onClick()}, title, badge)));
                }
            }
            class Tabs extends React.Component {
                constructor(props) {
                    super(props);
                    this.setInitialState();
                }
                setInitialState() {
                    let a = [];
                    let b = [];
                    let h = [];
                    this.props.items.forEach((item) => { a.push(item.active); b.push(item.badge); h.push(false); });
                    this.state = { active: a, badges: b, hidden: h };
                }
                getSelectedItem() {
                    let selectedItem = null;
                    for (let i = 0; i < this.props.items.length && selectedItem === null; i++) {
                        if (this.state.active[i]) {
                            selectedItem = this.props.items[i].id;
                        }
                    }
                    return selectedItem;
                }
                selectItem(id) {
                    let a = [];
                    this.props.items.forEach((item) => { a.push(item.id === id); });
                    this.setState({ active: a, badges: this.state.badges });
                }
                updateBadge(id, badge) {
                    let b = [];
                    for (let i = 0; i < this.props.items.length; i++) {
                        if (this.props.items[i].id === id) {
                            b.push(badge);
                        }
                        else {
                            b.push(this.state.badges[i]);
                        }
                    }
                    this.setState({ active: this.state.active, badges: b });
                }
                changeBadge(id, by) {
                    let found = false;
                    for (var i = 0; i < this.props.items.length && !found; i++) {
                        if (this.props.items[i].id === id) {
                            let b = this.state.badges[i] + by;
                            this.updateBadge(id, b);
                            found = true;
                        }
                    }
                }
                increaseBadge(id) {
                    this.changeBadge(id, +1);
                }
                decreaseBadge(id) {
                    this.changeBadge(id, -1);
                }
                changeHiddenState(id, hidden) {
                    let found = false;
                    for (var i = 0; i < this.props.items.length && !found; i++) {
                        if (this.props.items[i].id === id) {
                            this.state.hidden[i] = hidden;
                            found = true;
                        }
                    }
                    this.setState(this.state);
                }
                hideTab(id) {
                    this.changeHiddenState(id, true);
                }
                showTab(id) {
                    this.changeHiddenState(id, false);
                }
                render() {
                    let items = [];
                    for (let i = 0; i < this.props.items.length; i++) {
                        items.push(React.createElement(TabItem, {key: this.props.items[i].id, id: this.props.items[i].id, title: this.props.items[i].title, onClick: this.props.items[i].onClick.bind(this), badge: this.state.badges[i], active: this.state.active[i], hidden: this.state.hidden[i]}));
                    }
                    return (React.createElement("div", {className: this.props.className}, React.createElement("ul", {className: "nav nav-tabs"}, items)));
                }
            }
            Components.Tabs = Tabs;
        })(Components = Global.Components || (Global.Components = {}));
    })(Global = VC.Global || (VC.Global = {}));
})(VC || (VC = {}));
//# sourceMappingURL=Tabs.js.map