/* tslint:disable:max-line-length */

namespace VC.App.Components {
    "use strict";

    const REFRESH_TIME_MS: number = 10000;

    export interface IChatListItem {
        timestamp: Date;
        userUid: string;
        userName: string;
        userRole: Roles;
        message: string;
        me: boolean;
        handler: number;
    }

    interface IChatItemProps {
        item: IChatListItem;
    }
    interface IChatItemState {
    }

    class ChatItem extends React.Component<IChatItemProps, IChatItemState> {
        private divTime: HTMLDivElement;
        private divTime2: HTMLDivElement;
        constructor(props: IChatItemProps) {
            super(props);
        }

        updateTime(): void {
            this.divTime.innerHTML = this.getItemTimeString();
    
        }

        getItemTimeString(): string {
            var currentDate: Date = new Date();
            var ms: number = currentDate.getTime() - this.props.item.timestamp.getTime();
            return Global.Fce.toSimplifiedTimeString(ms);
        }
        getItemTimeString2(): string {
            var ms: string = this.props.item.timestamp.toUTCString();
            return ms;
        }
        render(): JSX.Element {
            return (
                <div>
                    <div className="row">

                        <div style={{ display: (this.props.item.userRole == Roles.Moderator ? "none" : "block") }} className="col-sm-6"><div className="itemName">{this.props.item.userName}</div></div>
                        <div style={{ display: (this.props.item.userRole != Roles.Moderator ? "none" : "block") }} className="col-sm-6"><div className="itemName"><span>[Moderator]&nbsp; </span>{this.props.item.userName}</div></div>                                     
                        
                        <div className="col-sm-6"><div ref={(ref: HTMLDivElement) => this.divTime = ref} className="itemTime">{this.getItemTimeString() }</div></div>
                        <div className="col-sm-6" style={{ display: 'none' }}><div ref={(ref: HTMLDivElement) => this.divTime2 = ref} className="itemTimechat">{this.getItemTimeString2() }</div></div>
                    </div>
                    <div className="row">
                        <div style={{ display: (this.props.item.userRole != Roles.Moderator ? "none" : "block") }}  className="col-sm-12"><div className="itemMessage blueText">{this.props.item.message}</div></div>
                        <div style={{ display: (this.props.item.userRole == Roles.Moderator ? "none" : "block") }}  className="col-sm-12"><div className="itemMessage">{this.props.item.message}</div></div>
                    </div>
                </div>
            );
        }
    }

    interface IChatListProps {
        fadingOut: boolean;
    }
    interface IChatListState {
        items: Array<IChatListItem>;
    }

    export class ChatList extends React.Component<IChatListProps, IChatListState> {
        private timeoutHdr: number = null;
        private list: HTMLDivElement;

        constructor(props: IChatListProps) {
            super(props);
            this.state = { items: [] } as IChatListState;
        }

        public addItem(item: IChatListItem): void {
            let items: Array<IChatListItem> = this.state.items;
            items.push(item);
            this.setState({ items: items } as IChatListState);
        }

        private renderItems(): Array<JSX.Element> {
            let elements: Array<JSX.Element> = [];
            let i: number = 0;
            this.state.items.forEach((item: IChatListItem) => {
                elements.push(
                    <div key={i} ref={"ListItem_" + (++i) } className="item">
                        <ChatItem ref={"Item_" + i} item={item} />
                    </div>
                );
            });
            return elements;
        }

        public setHeight(height: number): void {
            $(this.list).height(height);
        }

        private updateTimeOfItems(): void {
            for (let i: number = 0; i < this.state.items.length; i++) {
                let item: ChatItem = this.refs["Item_" + (i + 1)] as ChatItem;
                item.updateTime();
            }
        }

        componentDidMount(): void {
            if (!this.props.fadingOut) {
                this.timeoutHdr = window.setInterval(() => this.updateTimeOfItems(), REFRESH_TIME_MS);
            }
        }
        componentWillUnmount(): void {
            if (this.timeoutHdr !== null) {
                window.clearInterval(this.timeoutHdr);
                this.timeoutHdr = null;
            }
        }

        componentDidUpdate(prevProps: IChatListProps, prevState: IChatListState): void {
            if (this.props.fadingOut && this.state.items.length > 0) {
                let lastListItem: string = "ListItem_" + this.state.items.length;
                let listItem: HTMLDivElement = this.refs[lastListItem] as HTMLDivElement;
                let id: number = this.state.items.length - 1;
                this.state.items[id].handler = window.setTimeout(() =>
                    $(listItem).fadeOut(3000, () => {
                        this.state.items[id].handler = null;
                    }), 10000);
            }

            this.scrollToBottom();
        }

        public clearChat(): void {
            this.state.items.forEach((item: IChatListItem) => {
                if (item.handler !== null) {
                    window.clearTimeout(item.handler);
                    item.handler = null;
                }
            });
            this.setState({ items: [] } as IChatListState);
        }

        private scrollToBottom(): void {
            $(this.list).scrollTop(this.list.scrollHeight);

        }

        render(): JSX.Element {
            return (
                <div ref={(ref: HTMLDivElement) => this.list = ref} className="list">{this.renderItems() }</div>
            );
        }
    }

    interface IChatBoxProps {
        onSubmit: (text: string) => void;
        fixedHeight: boolean;
   
    }
    interface IChatBoxState {
    }
    
   
    class ChatBox extends React.Component<IChatBoxProps, IChatBoxState> {
        private maxLength: number = 500;
        private tb: HTMLTextAreaElement;

        constructor(props: IChatBoxProps) {
            super(props);
            
        }

        public fitTbHeight(): void {
            if (!this.props.fixedHeight) {
                    
                this.tb.style.height = "0px";
                this.tb.style.height = (this.tb.scrollHeight + (this.tb.offsetHeight - this.tb.clientHeight)) + "px";
            }
        }
        private onKeyDown(e: KeyboardEvent): void {
            // if enter
            let message: string = this.tb.value;

            if (e.which === 13) {
                e.preventDefault();
                if (!(message.length === 0 || !message.trim())) { // not empty or white spaces
                    this.props.onSubmit(message);
                    this.tb.value = "";
                }
            } else {
                let message: string = this.tb.value;
                if (message.length >= this.maxLength) { // max message length
                    // allow: backspace, delete, tab, escape, and enter
                    if (e.keyCode === 46 || e.keyCode === 8 || e.keyCode === 9 || e.keyCode === 27 || e.keyCode === 13 ||
                        // allow: Ctrl+A
                        (e.keyCode === 65 && e.ctrlKey === true) ||
                        // allow: home, end, left, right, top, bottom
                        (e.keyCode >= 35 && e.keyCode <= 40)) {
                        // let it happen, don"t do anything
                    } else {
                        e.preventDefault();
                    }
                    let caret: number = this.tb.selectionStart;
                    $(this.tb).val($(this.tb).val().substr(0, this.maxLength));
                    this.tb.selectionStart = caret;
                }
            }
            this.fitTbHeight();
        }
        private onPaste(e: ClipboardEvent): void {
            // paste disabled
            e.preventDefault();
        }

        public focus(): void {
            this.tb.focus();
        }

        componentDidMount(): void {
            if (!this.props.fixedHeight) {
                $(window).resize((e: JQueryEventObject) => this.fitTbHeight());
                this.fitTbHeight();
            }
        }

        render(): JSX.Element {
            return (
                <div className="box">
                    <textarea ref={(ref: HTMLTextAreaElement) => this.tb = ref} className="form-control" placeholder="Enter your message" onKeyDown={(e: KeyboardEvent) => this.onKeyDown(e) } onPaste={(e: ClipboardEvent) => this.onPaste(e) }></textarea>                  
                </div>
            );
        }
    }


    interface IChatProps {
        title: string;
        onItemSubmitted: (item: IChatListItem) => void;
        fixedHeight: boolean;
    
        onChatClosed?: () => void;
    }
    export interface IChatState {
        uid: string;
        name: string;
        role: Roles;
      
        height: number;
    }

    export class Chat extends React.Component<IChatProps, IChatState> {
        private chatList: ChatList;
        private chatBox: ChatBox;
        private divChat: HTMLDivElement;
        private divFooter: HTMLDivElement;
        private divHeader: HTMLDivElement;

        constructor(props: IChatProps) {
            super(props);
            this.state = { uid: "", name: "", role: null, height: null, } as IChatState;
        }

        public setChatUser(state: IChatState): void {
            this.state = state;
            this.chatBox.fitTbHeight();
            
        }

        public setHeight(height: number): void {
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
            let listHeight: number = 0;
            this.chatList.setHeight(listHeight);
            let chatHeight: number = $(this.divChat).height();
            if (chatHeight < height) {
                listHeight = height - chatHeight;
            }

            this.chatList.setHeight(listHeight);
        }

        private onSubmit(message: string): void {
            let item: IChatListItem = {
                timestamp: new Date(),
                userUid: this.state.uid,
                userName: this.state.name,
                userRole: this.state.role,
                message: message,
           
                me: true
            } as IChatListItem;

            this.addItem(item);
            
            this.props.onItemSubmitted(item);
        }

        public setFocus(): void {
            this.chatBox.focus();
        }

        public addItem(item: IChatListItem): void {
            // avoid double item from signaling
            if (item.me || item.userUid !== this.state.uid) {
                this.chatList.addItem(item);
            }
        }

        public clearChat(): void {
            this.chatList.clearChat();
        }

        public fitTbHeight(): void {
            this.chatBox.fitTbHeight();
        }

        private onButtonClicked(): void {
            //1
        //    let message: string ="9 minutes remaining on break";
         //   this.onSubmit(message);
         //   this.fitTbHeight();
        }

        renderHeading(): JSX.Element {
            if (this.props.onChatClosed === undefined) {
                return (
                    <div className="panel-heading" ref={(ref: HTMLDivElement) => this.divHeader = ref}>
                        <h4>{this.props.title}</h4>
                        
                    </div>
                );
            } else {
                return (
                    <div className="panel-heading" ref={(ref: HTMLDivElement) => this.divHeader = ref}>
                        <button type="button" className="close" onClick={() => this.props.onChatClosed() }>&times; </button>
                        <h4>{this.props.title}</h4>
                    </div>
                );
            }
        }

        render(): JSX.Element {
            return (
                <div ref={(ref: HTMLDivElement) => this.divChat = ref} className="panel-group chat">
                    <div className="panel panel-default" onMouseEnter={() => this.setFocus()}>
                        <div className='header-button'>
                            <button id='exportchat' >Export</button>
                            <button id='minimizechat'>
                                <i class="fa fa-window-minimize" aria-hidden="true"></i>
                            </button>
                        </div>
                        
                        {this.renderHeading()}
                        <div className="panel-body">
                            <ChatList ref={(ref: ChatList) => this.chatList = ref} fadingOut={false} />
                        </div>

                        <div className="panel-footer" ref={(ref: HTMLDivElement) => this.divFooter = ref}>
                            <ChatBox ref={(ref: ChatBox) => this.chatBox = ref} fixedHeight={this.props.fixedHeight} onSubmit={(message: string) => this.onSubmit(message) } />


                            <div class="col-md-12"  style={{ display: 'none'}} className="ModeratorTimeAlert" >
                                <div class="input-group">
                                    <input type="text"  style={{ width: '85%' }} id="remainingMinutetxt" class="form-control" placeholder="remaining minute..." />
                                    <span class="input-group-btn">
                                        <button class="btn btn-secondary" onClick={this.onButtonClicked}  id="remainingMinutebtn" type="button">Go!</button>
                                    </span>
                                </div>
                            </div>                            
                        </div>
                        
                    </div>
                </div>
            );
        }
    }
}