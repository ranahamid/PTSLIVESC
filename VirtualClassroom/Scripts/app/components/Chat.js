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
                getItemTimeString2() {
                    var ms = this.props.item.timestamp.toUTCString();
                    return ms;
                }
                render() {
                    let userNameMessage;
                    if (this.props.item.userRole == App.Roles.Moderator) {
                        userNameMessage = (React.createElement("div", {className: "col-sm-6"}, React.createElement("div", {className: "itemName"}, React.createElement("span", null, "[Moderator]  "), this.props.item.userName)));
                    }
                    else {
                        userNameMessage = (React.createElement("div", {className: "col-sm-6"}, React.createElement("div", {className: "itemName"}, this.props.item.userName)));
                    }
                    let itemMessage;
                    if (this.props.item.userRole == App.Roles.Moderator) {
                        itemMessage = (React.createElement("div", {className: "col-sm-12"}, React.createElement("div", {className: "itemMessage blueText"}, this.props.item.message)));
                    }
                    else if (this.props.item.userRole == App.Roles.ModeratorWarning) {
                        itemMessage = (React.createElement("div", {className: "col-sm-12"}, React.createElement("div", {className: "itemMessage RedText"}, this.props.item.message)));
                    }
                    else {
                        itemMessage = (React.createElement("div", {className: "col-sm-12"}, React.createElement("div", {className: "itemMessage"}, this.props.item.message)));
                    }
                    return (React.createElement("div", null, React.createElement("div", {className: "row"}, userNameMessage, React.createElement("div", {className: "col-sm-6"}, React.createElement("div", {ref: (ref) => this.divTime = ref, className: "itemTime"}, this.getItemTimeString())), React.createElement("div", {className: "col-sm-6", style: { display: 'none' }}, React.createElement("div", {ref: (ref) => this.divTime2 = ref, className: "itemTimechat"}, this.getItemTimeString2()))), React.createElement("div", {className: "row"}, itemMessage)));
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
                setHeight(height) {
                    $(this.list).height(height);
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
                    if (this.timeoutHdr !== null) {
                        window.clearInterval(this.timeoutHdr);
                        this.timeoutHdr = null;
                    }
                }
                componentDidUpdate(prevProps, prevState) {
                    if (this.props.fadingOut && this.state.items.length > 0) {
                        let lastListItem = "ListItem_" + this.state.items.length;
                        let listItem = this.refs[lastListItem];
                        let id = this.state.items.length - 1;
                        this.state.items[id].handler = window.setTimeout(() => $(listItem).fadeOut(3000, () => {
                            this.state.items[id].handler = null;
                        }), 10000);
                    }
                    this.scrollToBottom();
                }
                clearChat() {
                    this.state.items.forEach((item) => {
                        if (item.handler !== null) {
                            window.clearTimeout(item.handler);
                            item.handler = null;
                        }
                    });
                    this.setState({ items: [] });
                }
                scrollToBottom() {
                    $(this.list).scrollTop(this.list.scrollHeight);
                }
                render() {
                    return (React.createElement("div", {ref: (ref) => this.list = ref, className: "list"}, this.renderItems()));
                }
            }
            Components.ChatList = ChatList;
            class TimeBox extends React.Component {
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
                sendRepeatWarning(fullMsg) {
                    this.props.onSubmit2(fullMsg);
                }
                SendTimebyButton() {
                    // Send by button
                    let message = this.tb.value;
                    let remainingMin;
                    let countDownMin;
                    let countdown;
                    let fullMsg;
                    if (!(message.length === 0 || !message.trim())) {
                        remainingMin = parseInt(message, 10);
                        countDownMin = 1;
                        if (remainingMin > 0) {
                            fullMsg = remainingMin + " minutes remaining on break.";
                            this.props.onSubmit2(fullMsg);
                            countdown = remainingMin;
                            if (remainingMin >= 2) {
                                for (var i = remainingMin - 1; i >= 1; i--) {
                                    setTimeout(() => {
                                        countdown = countdown - 1;
                                        fullMsg = countdown + " minutes remaining on break.";
                                        console.log(fullMsg);
                                        this.sendRepeatWarning(fullMsg);
                                    }, countDownMin * 60000);
                                    countDownMin = countDownMin + 1;
                                }
                            }
                        }
                        else {
                        }
                        this.tb.value = "";
                    }
                    this.fitTbHeight();
                }
                onKeyDown(e) {
                    // if enter
                    let message = this.tb.value;
                    let remainingMin;
                    let countDownMin;
                    let countdown;
                    let fullMsg;
                    if (e.which === 13) {
                        e.preventDefault();
                        if (!(message.length === 0 || !message.trim())) {
                            remainingMin = parseInt(message, 10);
                            countDownMin = 1;
                            if (remainingMin > 0) {
                                fullMsg = remainingMin + " minutes remaining on break.";
                                this.props.onSubmit2(fullMsg);
                                countdown = remainingMin;
                                if (remainingMin >= 2) {
                                    for (var i = remainingMin - 1; i >= 1; i--) {
                                        setTimeout(() => {
                                            countdown = countdown - 1;
                                            fullMsg = countdown + " minutes remaining on break.";
                                            console.log(fullMsg);
                                            this.sendRepeatWarning(fullMsg);
                                        }, countDownMin * 60000);
                                        countDownMin = countDownMin + 1;
                                    }
                                }
                            }
                            else {
                            }
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
                    return (React.createElement("div", {className: "col-md-12 padding-zero ModeratorTimeAlert", style: { display: 'none' }}, React.createElement("div", {className: "row"}, React.createElement("div", {className: "col-md-9  padding-zero"}, React.createElement("div", {className: "box"}, React.createElement("textarea", {rows: "1", ref: (ref) => this.tb = ref, className: "form-control border-textarea", placeholder: "Remaining minute...", onKeyDown: (e) => this.onKeyDown(e), onPaste: (e) => this.onPaste(e)}))), React.createElement("div", {className: "col-md-3 chat-button-box"}, React.createElement("button", {id: 'enterTime', onClick: () => this.SendTimebyButton()}, "Enter")))));
                }
            }
            //chatbox
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
                SendChatbyButton() {
                    // send button clicked
                    let message = this.tb.value;
                    if (!(message.length === 0 || !message.trim())) {
                        if (message.length <= this.maxLength) {
                            // not empty or white spaces
                            this.props.onSubmit(message);
                            this.tb.value = "";
                        }
                        else {
                            let caret = this.tb.selectionStart;
                            $(this.tb).val($(this.tb).val().substr(0, this.maxLength));
                            this.tb.selectionStart = caret;
                        }
                        this.fitTbHeight();
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
                    return (React.createElement("div", {className: "col-md-12 padding-zero"}, React.createElement("div", {className: "row"}, React.createElement("div", {className: "col-md-9  padding-zero"}, React.createElement("div", {className: "box"}, React.createElement("textarea", {ref: (ref) => this.tb = ref, className: "form-control border-textarea", placeholder: "Enter your message", onKeyDown: (e) => this.onKeyDown(e), onPaste: (e) => this.onPaste(e)}))), React.createElement("div", {className: "col-md-3 chat-button-box"}, React.createElement("button", {id: 'enterChat', onClick: () => this.SendChatbyButton()}, "Enter"), React.createElement("button", {id: 'exportchat'}, "Export")))));
                }
            }
            class Chat extends React.Component {
                constructor(props) {
                    super(props);
                    this.state = { uid: "", name: "", role: null, height: null, };
                }
                setChatUser(state) {
                    this.state = state;
                    this.chatBox.fitTbHeight();
                    this.timeBox.fitTbHeight();
                }
                setHeight(height) {
                    // solution with fixed padding
                    /*
                    let headerHeight: number = $(this.divHeader).height();
                    let footerHeight: number = $(this.divFooter).height();
        
                    let listHeight: number = height - (headerHeight + footerHeight + 72); // 72 .. padding
                    if (listHeight < 0) {
                        listHeight = 0;
                    }
                    */
                    // solution with setting height on fly
                    let listHeight = 0;
                    this.chatList.setHeight(listHeight);
                    let chatHeight = $(this.divChat).height();
                    if (chatHeight < height) {
                        listHeight = height - chatHeight;
                    }
                    this.chatList.setHeight(listHeight);
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
                onSubmit2(message) {
                    let item = {
                        timestamp: new Date(),
                        userUid: this.state.uid,
                        userName: this.state.name,
                        //userRole: this.state.role,
                        userRole: App.Roles.ModeratorWarning,
                        message: message,
                        me: true
                    };
                    this.addItem2(item);
                    this.props.onItemSubmitted(item);
                }
                addItem2(item) {
                    // avoid double item from signaling
                    if (item.me || item.userUid !== this.state.uid) {
                        this.chatList.addItem(item);
                    }
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
                clearChat() {
                    this.chatList.clearChat();
                }
                fitTbHeight() {
                    this.chatBox.fitTbHeight();
                    this.timeBox.fitTbHeight();
                }
                //private onButtonClicked(): void {
                //    let message: string;
                //    message = "9 minutes remaining on break";
                //    this.fitTbHeight();
                //}
                renderHeading() {
                    if (this.props.onChatClosed === undefined) {
                        return (React.createElement("div", {style: { display: 'none' }, className: "panel-heading", ref: (ref) => this.divHeader = ref}, React.createElement("h4", null, this.props.title)));
                    }
                    else {
                        return (React.createElement("div", {style: { display: 'none' }, className: "panel-heading", ref: (ref) => this.divHeader = ref}, React.createElement("button", {type: "button", className: "close", onClick: () => this.props.onChatClosed()}, "× "), React.createElement("h4", null, this.props.title)));
                    }
                }
                render() {
                    return (React.createElement("div", {ref: (ref) => this.divChat = ref, className: "panel-group chat"}, React.createElement("div", {className: "panel panel-default", onMouseEnter: () => this.setFocus()}, React.createElement("div", {className: 'header-button'}, React.createElement("span", {id: "chat-text"}, "Chat"), React.createElement("button", {id: 'minimizechat'}, React.createElement("i", {class: "fa fa-window-minimize", "aria-hidden": "true"}))), this.renderHeading(), React.createElement("div", {className: "panel-body"}, React.createElement(ChatList, {ref: (ref) => this.chatList = ref, fadingOut: false})), React.createElement("div", {className: "panel-footer", ref: (ref) => this.divFooter = ref}, React.createElement("div", {className: "chat-input-box"}, React.createElement(ChatBox, {ref: (ref) => this.chatBox = ref, fixedHeight: this.props.fixedHeight, onSubmit: (message) => this.onSubmit(message)})), React.createElement("div", {className: "panel-time"}, React.createElement(TimeBox, {ref: (ref) => this.timeBox = ref, fixedHeight: this.props.fixedHeight, onSubmit2: (message) => this.onSubmit2(message)}))))));
                }
            }
            Components.Chat = Chat;
        })(Components = App.Components || (App.Components = {}));
    })(App = VC.App || (VC.App = {}));
})(VC || (VC = {}));
//# sourceMappingURL=Chat.js.map