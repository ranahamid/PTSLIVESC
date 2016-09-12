/* tslint:disable:max-line-length */
var VC;
(function (VC) {
    var App;
    (function (App) {
        var Components;
        (function (Components) {
            "use strict";
            const REFRESH_TIME_MS = 10000;
            class ChatItem extends React.Component {
                constructor(props) {
                    super(props);
                }
                updateTime() {
                    this.divTime.innerHTML = this.getItemTimeString();
                }
                getItemTimeString() {
                    var currentDate = new Date();
                    var ms = currentDate.getTime() - this.props.item.timestamp.getTime();
                    return App.Global.Fce.toSimplifiedTimeString(ms);
                }
                render() {
                    return (React.createElement("div", null, React.createElement("div", {className: "row"}, React.createElement("div", {className: "col-sm-6"}, React.createElement("div", {className: "itemName"}, this.props.item.userName)), React.createElement("div", {className: "col-sm-6"}, React.createElement("div", {ref: (ref) => this.divTime = ref, className: "itemTime"}, this.getItemTimeString()))), React.createElement("div", {className: "row"}, React.createElement("div", {className: "col-sm-12"}, React.createElement("div", {className: "itemMessage"}, this.props.item.message)))));
                }
            }
            class ChatList extends React.Component {
                constructor(props) {
                    super(props);
                    this.timeoutHdr = null;
                    this.state = { items: [] };
                }
                addItem(item) {
                    let items = this.state.items;
                    items.push(item);
                    this.setState({ items: items });
                }
                renderItems() {
                    let elements = [];
                    let i = 0;
                    this.state.items.forEach((item) => {
                        elements.push(React.createElement("div", {key: i, ref: "ListItem_" + (++i), className: "item"}, React.createElement(ChatItem, {ref: "Item_" + i, item: item})));
                    });
                    return elements;
                }
                updateTimeOfItems() {
                    for (let i = 0; i < this.state.items.length; i++) {
                        let item = this.refs["Item_" + (i + 1)];
                        item.updateTime();
                    }
                }
                componentDidMount() {
                    if (!this.props.fadingOut) {
                        this.timeoutHdr = window.setInterval(() => this.updateTimeOfItems(), REFRESH_TIME_MS);
                    }
                }
                componentWillUnmount() {
                    if (this.timeoutHdr != null) {
                        window.clearInterval(this.timeoutHdr);
                        this.timeoutHdr = null;
                    }
                }
                componentDidUpdate(prevProps, prevState) {
                    if (this.props.fadingOut && this.state.items.length > 0) {
                        let lastListItem = "ListItem_" + this.state.items.length;
                        let listItem = this.refs[lastListItem];
                        window.setTimeout(() => $(listItem).fadeOut(3000), 10000);
                    }
                    this.scrollToBottom();
                }
                scrollToBottom() {
                    $(this.list).scrollTop(this.list.scrollHeight);
                }
                render() {
                    return (React.createElement("div", {ref: (ref) => this.list = ref, className: "list"}, this.renderItems()));
                }
            }
            Components.ChatList = ChatList;
            class ChatBox extends React.Component {
                constructor(props) {
                    super(props);
                    this.maxLength = 500;
                }
                fitTbHeight() {
                    if (!this.props.fixedHeight) {
                        this.tb.style.height = "0px";
                        this.tb.style.height = (this.tb.scrollHeight + (this.tb.offsetHeight - this.tb.clientHeight)) + "px";
                    }
                }
                onKeyDown(e) {
                    // if enter
                    let message = this.tb.value;
                    if (e.which === 13) {
                        e.preventDefault();
                        if (!(message.length === 0 || !message.trim())) {
                            this.props.onSubmit(message);
                            this.tb.value = "";
                        }
                    }
                    else {
                        let message = this.tb.value;
                        if (message.length >= this.maxLength) {
                            // allow: backspace, delete, tab, escape, and enter
                            if (e.keyCode === 46 || e.keyCode === 8 || e.keyCode === 9 || e.keyCode === 27 || e.keyCode === 13 ||
                                // allow: Ctrl+A
                                (e.keyCode === 65 && e.ctrlKey === true) ||
                                // allow: home, end, left, right, top, bottom
                                (e.keyCode >= 35 && e.keyCode <= 40)) {
                            }
                            else {
                                e.preventDefault();
                            }
                            let caret = this.tb.selectionStart;
                            $(this.tb).val($(this.tb).val().substr(0, this.maxLength));
                            this.tb.selectionStart = caret;
                        }
                    }
                    this.fitTbHeight();
                }
                onPaste(e) {
                    // paste disabled
                    e.preventDefault();
                }
                focus() {
                    this.tb.focus();
                }
                componentDidMount() {
                    if (!this.props.fixedHeight) {
                        $(window).resize((e) => this.fitTbHeight());
                        this.fitTbHeight();
                    }
                }
                render() {
                    return (React.createElement("div", {className: "box"}, React.createElement("textarea", {ref: (ref) => this.tb = ref, className: "form-control", placeholder: "Enter your message", onKeyDown: (e) => this.onKeyDown(e), onPaste: (e) => this.onPaste(e)})));
                }
            }
            class Chat extends React.Component {
                constructor(props) {
                    super(props);
                    this.state = { uid: "", name: "", role: null };
                }
                setChatUser(state) {
                    this.state = state;
                    this.chatBox.fitTbHeight();
                }
                onSubmit(message) {
                    let item = {
                        timestamp: new Date(),
                        userUid: this.state.uid,
                        userName: this.state.name,
                        userRole: this.state.role,
                        message: message,
                        me: true
                    };
                    this.addItem(item);
                    this.props.onItemSubmitted(item);
                }
                setFocus() {
                    this.chatBox.focus();
                }
                addItem(item) {
                    // avoid double item from signaling
                    if (item.me || item.userUid !== this.state.uid) {
                        this.chatList.addItem(item);
                    }
                }
                fitTbHeight() {
                    this.chatBox.fitTbHeight();
                }
                renderHeading() {
                    if (this.props.onChatClosed === null) {
                        return (React.createElement("div", {className: "panel-heading"}, React.createElement("h4", null, this.props.title)));
                    }
                    else {
                        return (React.createElement("div", {className: "panel-heading"}, React.createElement("button", {type: "button", className: "close", onClick: () => this.props.onChatClosed()}, "× "), React.createElement("h4", null, this.props.title)));
                    }
                }
                render() {
                    return (React.createElement("div", {className: "panel-group chat"}, React.createElement("div", {className: "panel panel-default", onMouseEnter: () => this.setFocus()}, this.renderHeading(), React.createElement("div", {className: "panel-body"}, React.createElement(ChatList, {ref: (ref) => this.chatList = ref, fadingOut: false})), React.createElement("div", {className: "panel-footer"}, React.createElement(ChatBox, {ref: (ref) => this.chatBox = ref, fixedHeight: this.props.fixedHeight, onSubmit: (message) => this.onSubmit(message)})))));
                }
            }
            Components.Chat = Chat;
        })(Components = App.Components || (App.Components = {}));
    })(App = VC.App || (VC.App = {}));
})(VC || (VC = {}));
//# sourceMappingURL=Chat.js.map