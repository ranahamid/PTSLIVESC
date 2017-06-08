/* tslint:disable:max-line-length */

namespace VC.App {
    "use strict";

    class FC extends XC {
        private status: Components.Status;
        private boxSubscribers: Array<Components.Box> = new Array<Components.Box>(8);
        private label: Array<Components.BoxLabel> = new Array<Components.BoxLabel>(8);
        private divFloatingChat: Array<HTMLDivElement> = new Array<HTMLDivElement>(8);
        private floatingChat: Array<Components.ChatList> = new Array<Components.ChatList>(8);
        private divStatus: HTMLDivElement;
        private divUI: HTMLDivElement;
        private connectedStudents: Array<boolean> = [false, false, false, false, false, false, false, false];
        private raisedHands: Array<boolean> = [false, false, false, false, false, false, false, false];

        constructor(props: IProps) {
            super(props, Roles.FC);
        }

        // abstract methods
        setStatusText(text: string, style: Components.StatusStyle): void {
            this.setStatusVisibility(true);
            this.status.setText(text, style);
        }

        didMount(): void {
            $(window).resize(() => window.setTimeout(() => this.fitLayout(), 0));
        }
        connected(connection: any): void {
            let tokenData: Global.TokenData = Global.Fce.toTokenData(connection.data);
            if (this.dataResponse.Uid === tokenData.Uid) {
                // me
                this.setStatusVisibility(false);
                this.setUiVisibility(true);
            } else if (this.isInMyGroup(tokenData.Uid)) {
                // my group
                // my group
                if (tokenData.Role === Roles.PC) {
                    // student
                    let groupComputer: Global.GroupComputer = this.getGroupComputer(tokenData.Uid);
                    let addressData: string;
                    addressData = "";


                    if (tokenData.Country != null) {
                        addressData = addressData + ", " + tokenData.Country;
                    }
                    else if (tokenData.City != null) {
                        addressData = addressData + ", " + tokenData.City;
                    }
                    else if (tokenData.State != null) {
                        addressData = addressData + ", " + tokenData.State;
                    }
                    else if (tokenData.Address1 != null) {
                        addressData = tokenData.Address1;
                    }

                    //if (tokenData.ZipCode != null) {
                    //    addressData = addressData + "-" + tokenData.ZipCode;
                    //}


                    if (addressData != "")
                        this.label[groupComputer.Position - 1].setText(tokenData.Name + ", " + addressData + " connected.", (this.raisedHands[groupComputer.Position - 1] ? Components.BoxLabelStyle.HandRaised : Components.BoxLabelStyle.Connected));
                    else
                        this.label[groupComputer.Position - 1].setText(tokenData.Name + " connected.", (this.raisedHands[groupComputer.Position - 1] ? Components.BoxLabelStyle.HandRaised : Components.BoxLabelStyle.Connected));

                    //add
                    if (this.raisedHands[groupComputer.Position - 1]) {
                        this.boxSubscribers[groupComputer.Position - 1].setStyle(Components.BoxStyle.HandRaised)
                    }
                    else {
                        this.boxSubscribers[groupComputer.Position - 1].setStyle(Components.BoxStyle.Connected)
                    }

                    this.connectedStudents[groupComputer.Position - 1] = true;
                    this.fitLayout();
                }
            }
            else if (tokenData.Role === Roles.AC) {
                // admin computer
                Global.Signaling.sendSignal<Global.ISignalConnectedData>(this.session,
                    this.getAcConnection(),
                    Global.SignalTypes.Connected,
                    {
                    } as Global.ISignalConnectedData
                );
            }
        }
        disconnected(connection: any): void {
            let tokenData: Global.TokenData = Global.Fce.toTokenData(connection.data);
            if (this.dataResponse.Uid === tokenData.Uid) {
                // me
                this.setUiVisibility(false);
                this.setStatusText("Disconnected from the session.", Components.StatusStyle.Error);
            } else if (this.isInMyGroup(tokenData.Uid)) {
                // my group
                if (tokenData.Role === Roles.PC) {
                    // student
                    let groupComputer: Global.GroupComputer = this.getGroupComputer(tokenData.Uid);
                    this.label[groupComputer.Position - 1].setText("Student PC not connected.", Components.BoxLabelStyle.NotConnected);
                    this.connectedStudents[groupComputer.Position - 1] = false;
                    this.raisedHands[groupComputer.Position - 1] = false;
                    this.fitLayout();
                }
            }
        }
        sessionConnected(event: any): void {
            // nothing to do
        }
        sessionDisconnected(event: any): void {
            this.setUiVisibility(false);
            this.setStatusVisibility(true);
        }
        streamCreated(connection: any, stream: any): void {
            let tokenData: Global.TokenData = Global.Fce.toTokenData(connection.data);
            if (this.dataResponse.Uid === tokenData.Uid) {
                // me .. there is not fired this event for publisher
            } else if (this.isInMyGroup(tokenData.Uid)) {
                // my group
                let groupComputer: Global.GroupComputer = this.getGroupComputer(tokenData.Uid);
                // student
                this.boxSubscribers[groupComputer.Position - 1].subscribeVideo(this.session, stream);
            }
        }
        streamDestroyed(connection: any, stream: any): void {
            let tokenData: Global.TokenData = Global.Fce.toTokenData(connection.data);
            if (this.dataResponse.Uid === tokenData.Uid) {
                // me .. there is not fired this event for publisher
            } else if (this.isInMyGroup(tokenData.Uid)) {
                // my group
                let groupComputer: Global.GroupComputer = this.getGroupComputer(tokenData.Uid);
                // student
                this.boxSubscribers[groupComputer.Position - 1].unsubscribe(this.session);
            }
        }
        streamPropertyChanged(event: any): void {
            // nothing to do
        }

        signalReceived(event: any): void {
            let signalType: Global.SignalTypes = Global.Signaling.getSignalType(event.type);
            switch (signalType) {
                case Global.SignalTypes.TurnOff:
                    this.turnOffSignalReceived(event);
                    break;
                case Global.SignalTypes.RaiseHand:
                    this.raiseHandSignalReceived(event);
                    break;
                case Global.SignalTypes.Chat:
                    this.chatSignalReceived(event);
                    break;
                case Global.SignalTypes.FeaturedChanged:
                    this.featuredChangedSignalReceived(event);
                    break;
            }
        }
        private turnOffSignalReceived(event: any): void {
            let data: Global.ISignalTurnOffData = JSON.parse(event.data) as Global.ISignalTurnOffData;
            if (data.role === undefined || data.role === Roles.FC) {
                this.disconnect();
            }
        }
        private raiseHandSignalReceived(event: any): void
        {
            let tokenData: Global.TokenData = Global.Fce.toTokenData(event.from.data);
            let groupComputer: Global.GroupComputer = this.getGroupComputer(tokenData.Uid);
            let data: Global.ISignalRaiseHandData = JSON.parse(event.data) as Global.ISignalRaiseHandData;

            if (tokenData.Role === Roles.AC)
            {
                // all
                for (let i: number = 0; i < 8; i++) {
                    if (this.connectedStudents[i])
                    {
                        this.raisedHands[i] = data.raised;
                        this.label[i].setStyle(data.raised ? Components.BoxLabelStyle.HandRaised : Components.BoxLabelStyle.Connected);
                        //test
                        this.boxSubscribers[i].setStyle(data.raised ? Components.BoxStyle.HandRaised : Components.BoxStyle.Connected);

                        //add
                        if (data.raised) {
                            this.boxSubscribers[i].setStyle(Components.BoxStyle.HandRaised)
                        }
                        else {
                            this.boxSubscribers[i].setStyle(Components.BoxStyle.Connected)
                        }
                    }
                }
            }
            else
            {
                // single student
                this.raisedHands[groupComputer.Position - 1] = data.raised;
                this.label[groupComputer.Position - 1].setStyle(data.raised ? Components.BoxLabelStyle.HandRaised : Components.BoxLabelStyle.Connected);
                this.boxSubscribers[groupComputer.Position - 1].setStyle(data.raised ? Components.BoxStyle.HandRaised : Components.BoxStyle.Connected);

                if (data.raised) {
                    this.boxSubscribers[groupComputer.Position - 1].setStyle(Components.BoxStyle.HandRaised)
                }
                else {
                    this.boxSubscribers[groupComputer.Position - 1].setStyle(Components.BoxStyle.Connected)
                }
            }
        }
        private chatSignalReceived(event: any): void {
            let data: Global.ISignalChatData = JSON.parse(event.data) as Global.ISignalChatData;
            if (data.type === Global.ChatType.Public) {
                // try to find this student
                let groupComputer: Global.GroupComputer = this.getGroupComputer(data.userUid);
                if (groupComputer !== null) {
                    this.floatingChat[groupComputer.Position - 1].addItem({
                        userUid: data.userUid,
                        userRole: data.userRole,

                        userName: data.userName,
                        message: data.message,
                        timestamp: new Date(),
                        me: false
                    } as Components.IChatListItem);
                }
            }
        }

        private featuredChangedSignalReceived(event: any): void {
            // let data: Global.ISignalFeaturedChangedData = JSON.parse(event.data) as Global.ISignalFeaturedChangedData;
            $.ajax({
                cache: false,
                type: "GET",
                url: this.props.actionUrl + "/GetData",
                success: (r: VC.Global.Data.IDataResponse<Global.IComputerData>): void => {
                    if (r.status === VC.Global.Data.RESPONSE_SUCCESS) {
                        this.featuredStudentsChanged(r.data);
                    } else {
                        // error
                        alert(r.message);
                    }
                },
                error: (xhr: JQueryXHR, status: string, error: string): void => {
                    // error
                    alert("XHR Error: " + xhr.statusText);
                }
            });
        }
        private featuredStudentsChanged(data: Global.IComputerData): void
        {
            // go thru current layout and unsubscribe from students that doesn't match their position anymore
            for (let i: number = 0; i < 8; i++)
            {
                if (this.connectedStudents[i])
                {
                    let newStudent: Global.GroupComputer = this.getGroupStudentComputerByPosition(i + 1, data);
                    let currentStudent: Global.GroupComputer = this.getGroupStudentComputerByPosition(i + 1, this.dataResponse);
                    if (!this.compareGroupComputers(newStudent, currentStudent)) {
                        let connection: any = this.getConnectionByUid(currentStudent.Uid);
                        if (connection !== null)
                        {
                            // unsubscribe
                            if (this.boxSubscribers[i].isConnected)
                            {
                                this.boxSubscribers[i].unsubscribe(this.session);
                            }
                            this.label[i].setText("Student PC not connected.", Components.BoxLabelStyle.NotConnected);
                            this.floatingChat[i].clearChat();
                            // send signal to remove from group
                            Global.Signaling.sendSignal<Global.ISignalGroupChanged>(this.session, connection, Global.SignalTypes.GroupChanged, { addUids: [], removeUids: [this.dataResponse.Uid] } as Global.ISignalGroupChanged);
                            // disconnected status
                            this.connectedStudents[i] = false;
                        }
                    }
                }
            }

            // subscribe to new students
            for (let i: number = 0; i < 8; i++)
            {
                if (!this.connectedStudents[i])
                {
                    let newStudent: Global.GroupComputer = this.getGroupStudentComputerByPosition(i + 1, data);
                    if (newStudent !== null)
                    {
                        // label
                        let newStudentConnection: any = this.getConnectionByUid(newStudent.Uid);
                        if (newStudentConnection !== null)
                        {
                            // try to get stream
                            let stream: any = this.getStream(newStudent.Uid);
                            if (stream !== null) {
                                // subscribe
                                this.boxSubscribers[i].subscribeVideo(this.session, stream);
                            }
                            let tokenData: Global.TokenData = Global.Fce.toTokenData(newStudentConnection.data);
                            let addressData: string;
                            addressData = "";


                            if (tokenData.Country != null) {
                                addressData = addressData + ", " + tokenData.Country;
                            }
                            else if (tokenData.City != null) {
                                    addressData = addressData + ", " + tokenData.City;
                            }
                            else if (tokenData.State != null) {
                                        addressData = addressData + ", " + tokenData.State;
                            }
                            else if (tokenData.Address1 != null) {
                                            addressData = tokenData.Address1;
                            }


                            //if (tokenData.ZipCode != null) {
                            //    addressData = addressData + "-" + tokenData.ZipCode;
                            //}

                            if (addressData != "")
                                this.label[i].setText(tokenData.Name + ", " + addressData + " connected.", Components.BoxLabelStyle.Connected);
                            else
                                this.label[i].setText(tokenData.Name + " connected.", Components.BoxLabelStyle.Connected);

                            // send signal to add to group
                            Global.Signaling.sendSignal<Global.ISignalGroupChanged>(this.session, newStudentConnection, Global.SignalTypes.GroupChanged, { addUids: [this.dataResponse.Uid], removeUids: [] } as Global.ISignalGroupChanged);
                            // set connected status
                            this.connectedStudents[i] = true;
                        }
                    }
                }
            }

            // update data response
            this.dataResponse = data;
            this.fitLayout();
        }

        private getGroupStudentComputerByPosition(position: number, data: Global.IComputerData): Global.GroupComputer {
            let iUser: Global.GroupComputer = null;
            for (let i: number = 0; i < data.Group.length && iUser === null; i++)
            {
                //if (data.Group[i].Role === VC.App.Roles.PC && data.Group[i].Position === position) {
                if (data.Group[i].Role === VC.App.Roles.PC)
                {
                    iUser = data.Group[i];
                }
            }
            return iUser;
        }

        private setStatusVisibility(visible: boolean): void {
            this.divStatus.style.display = visible ? "block" : "none";
        }
        private setLayoutVisibility(visible: boolean): void {
            // body1 style
            let body1: HTMLBodyElement = document.getElementById("Body1") as HTMLBodyElement;
            body1.className = visible ? "lightBody" : "darkBody";

            // divBody1 class
            let divBody1: HTMLElement = document.getElementById("DivBody1");
            divBody1.className = visible ? "divBody" : "";

            // header1
            let header1: HTMLElement = document.getElementById("Header1");
            header1.style.display = visible ? "block" : "none";

            // footer1
            let footer1: HTMLElement = document.getElementById("Footer1");
            footer1.style.display = visible ? "block" : "none";
        }
        private setUiVisibility(visible: boolean): void {
            this.setLayoutVisibility(!visible);
            this.divUI.style.display = visible ? "block" : "none";
            if (visible) {
                this.fitLayout();
            }
        }

        private getCountOfConnectedStudents(): number {
            let connectedStudentsCount: number = 0;
            this.connectedStudents.forEach((connected: boolean) => {
                if (connected) {
                    connectedStudentsCount++;
                }
            });
            return connectedStudentsCount;
        }

        //private getLayoutSize(): number {
        //    let layout: number = 1;

        //    let connectedStudentsCount: number = this.getCountOfConnectedStudents();

        //    if (connectedStudentsCount > 6) {
        //        layout = 8;
        //    } else if (connectedStudentsCount > 4) {
        //        layout = 6;
        //    } else if (connectedStudentsCount > 2) {
        //        layout = 4;
        //    } else if (connectedStudentsCount > 1) {
        //        layout = 2;
        //    }

        //    return layout;
        //}
        private fitLayout(): void
        {
            let windowHeight: number = $(window).innerHeight();
            let windowWidth: number = $(window).innerWidth();

            this.fitLayerSizes(windowWidth, windowHeight);
        }

        private fitLayerSizes(windowWidth: number, windowHeight: number): void
        {
            let connectedStudentsCount: number = this.getCountOfConnectedStudents();
          //  let layout: number = this.getLayoutSize();
            let countOfVisibleBoxes: number = 0;

            // visibility of boxes + labels + floating chat divs
            for (let i: number = 0; i < 8; i++) {
                if (this.connectedStudents[i])
                {

                    this.boxSubscribers[i].setVisibility(true);

                    //animated
                   //   $(this.boxSubscribers[i]).addClass(" animated rollIn ");
                    
                    this.label[i].setVisibility(true);
                    //animated
                    $(this.label[i].getParentDiv()).addClass(" animated rollIn ");

                    if (this.divFloatingChat[i].style.display === "none")
                    {
                        this.divFloatingChat[i].style.display = "block";  
                        //animated
                        //floatingChat  
                        //this.divFloatingChat[i].className = "floatingChat animated rollIn";
                       // $(this.divFloatingChat[i]).removeClass(" animated rollIn ");
                    }
                    countOfVisibleBoxes++;
                }
                else {
                    this.boxSubscribers[i].setVisibility(false);
                    //animated
                   // $(this.boxSubscribers[i]).removeClass(" animated rollOut ");


                    this.label[i].setVisibility(false);
                    //animated
                    $(this.label[i].getParentDiv()).removeClass(" animated rollOut ");
                    if (this.divFloatingChat[i].style.display === "block")
                    {
                        this.divFloatingChat[i].style.display = "none";
                        //animated
                       // this.divFloatingChat[i].className = "floatingChat animated rollIn";
                        // $(this.divFloatingChat[i]).removeClass(" animated rollIn ");
                    }
                }
            }
            // show boxes left
            //for (let i: number = 7; i >= 0 && countOfVisibleBoxes < layout; i++) {
            //    if (!this.connectedStudents[i])
            //    {
            //        this.boxSubscribers[i].setVisibility(true);
            //        this.label[i].setVisibility(true);
            //        if (this.divFloatingChat[i].style.display === "none") {
            //            this.divFloatingChat[i].style.display = "block";
            //        }
            //        countOfVisibleBoxes++;
            //    }
            //}

           // console.log(connectedStudentsCount);

            // sizes and position of boxes + labels + floating chat divs
            //0
            if (connectedStudentsCount == 0)
            {               
                for (let i: number = 0; i < 8; i++)
                {
                    if (!this.connectedStudents[i])
                    {
                        this.boxSubscribers[i].setVisibility(true);
                        this.label[i].setVisibility(true);
                        if (this.divFloatingChat[i].style.display === "none")
                        {
                            this.divFloatingChat[i].style.display = "block";
                        }     
                        $(this.boxSubscribers[i].getBox())
                            .css("width", "100%")
                            .css("height", windowHeight + "px");  //1
                        $(this.label[i].getParentDiv()).css("width", "100%");
                        $(this.divFloatingChat[i]).css("width", "100%");                  

                        break;
                    }
                }
            }


            //1
            if ( connectedStudentsCount == 1) {
                for (let i: number = 0; i < 8; i++) {
                    $(this.boxSubscribers[i].getBox())
                        .css("width", "100%")
                        .css("height", windowHeight + "px"); // 1
                    $(this.label[i].getParentDiv()).css("width", "100%");
                    $(this.divFloatingChat[i]).css("width", "100%");
                }
            }
            //2
            else if (connectedStudentsCount ==2) {
                for (let i: number = 0; i < 8; i++) {
                    $(this.boxSubscribers[i].getBox())
                        .css("width", "50%")
                        .css("height", windowHeight + "px"); // 2
                    $(this.label[i].getParentDiv()).css("width", "50%");
                    $(this.divFloatingChat[i]).css("width", "50%");
                }
            } 
            //3
            else if (connectedStudentsCount == 3) {
                for (let i: number = 0; i < 8; i++) {
                    $(this.boxSubscribers[i].getBox())
                        .css("width", "33.33%")
                        .css("height", windowHeight + "px"); // 2
                    $(this.label[i].getParentDiv()).css("width", "33.33%");
                    $(this.divFloatingChat[i]).css("width", "33.33%");
                }
            } 

            //4
            else if (connectedStudentsCount ==4) {
                for (let i: number = 0; i < 8; i++) {
                    $(this.boxSubscribers[i].getBox())
                        .css("width", "25%")
                        .css("height", windowHeight + "px"); // 4
                    $(this.label[i].getParentDiv()).css("width", "25%");
                    $(this.divFloatingChat[i]).css("width", "25%");
                }
            }

            //5
            else if (connectedStudentsCount == 5) {
                for (let i: number = 0; i < 8; i++) {
                    $(this.boxSubscribers[i].getBox())
                        .css("width", "20%")
                        .css("height", windowHeight + "px"); // 4
                    $(this.label[i].getParentDiv()).css("width", "20%");
                    $(this.divFloatingChat[i]).css("width", "20%");
                }
            }

            //6
            else if (connectedStudentsCount ==6) {
                for (let i: number = 0; i < 8; i++)
                {
                    $(this.boxSubscribers[i].getBox())
                        .css("width", "33.33%")
                        .css("height", windowHeight / 2 + "px"); // 6
                    $(this.label[i].getParentDiv()).css("width", "33.33%");
                    $(this.divFloatingChat[i]).css("width", "33.33%");
                }
            }

            //7
            else if (connectedStudentsCount == 7)
            {
                let countConnectStudent: number = 0;
                for (let i: number = 0; i < 8; i++)
                {
                    if (this.connectedStudents[i])
                    {
                        countConnectStudent++;
                        if (countConnectStudent <= 4)
                        {
                            $(this.boxSubscribers[i].getBox())
                                .css("width", "25%")
                                .css("height", windowHeight / 2 + "px"); 
                            $(this.label[i].getParentDiv()).css("width", "25%");
                            $(this.divFloatingChat[i]).css("width", "25%");
                        }
                        else
                        {
                            $(this.boxSubscribers[i].getBox())
                                .css("width", "33.33%")
                                .css("height", windowHeight / 2 + "px"); 
                            $(this.label[i].getParentDiv()).css("width", "33.33%");
                            $(this.divFloatingChat[i]).css("width", "33.33%");
                        }

                    }
                   
                }
            }

            //8
            if (connectedStudentsCount >=8) {
                for (let i: number = 0; i < 8; i++) {
                    $(this.boxSubscribers[i].getBox())
                        .css("width", "25%")
                        .css("height", windowHeight / 2 + "px"); // 8
                    $(this.label[i].getParentDiv()).css("width", "25%");
                    $(this.divFloatingChat[i]).css("width", "25%");
                }
            }

            // labels
            for (let i: number = 0; i < 8; i++) {
                $(this.label[i].getParentDiv())
                    .css("left", $(this.boxSubscribers[i].getBox()).position().left + "px")
                    .css("top", ($(this.boxSubscribers[i].getBox()).position().top + $(this.boxSubscribers[i].getBox()).height() - $(this.label[i].getParentDiv()).height()) + "px");
            }
            // floating chat
            for (let i: number = 0; i < 8; i++) {
                $(this.divFloatingChat[i])
                    .css("left", $(this.boxSubscribers[i].getBox()).position().left + "px")
                    .css("top", ($(this.boxSubscribers[i].getBox()).position().top + $(this.label[i].getParentDiv()).height() + 10) + "px")
                    .css("height", ($(this.boxSubscribers[i].getBox()).height() - $(this.label[i].getParentDiv()).height() - 10) + "px");
            }
        }

        render(): JSX.Element {
            let statusClasses: Array<string> = [
                "alert alert-warning", // connecting
                "alert alert-success", // connected
                "alert alert-danger"  // error
            ];

            let labelClasses: Array<string> = [
                "notConnected", // notConnected
                "connected",    // connected
                "handRaised"    // handRaised
            ];

            let BoxClasses: Array<string> = [
                "notConnectedBox", // notConnected
                "connectedBox",    // connected
                "handRaisedBox"    // handRaised
            ];


            return (
                <div className="scContainer">
                    <div ref={(ref: HTMLDivElement) => this.divStatus = ref}>
                        <Components.Status ref={(ref: Components.Status) => this.status = ref} text="Connecting ..." style={Components.StatusStyle.Connecting} className="cStatus" statusClasses={statusClasses} />
                    </div>
                    <div ref={(ref: HTMLDivElement) => this.divUI = ref} style={{ display: "none" }}>

                        <Components.Box ref={(ref: Components.Box) => this.boxSubscribers[0] = ref} id={this.props.targetId + "_Subscriber1"} streamProps={this.subscribeProps}  className="cBox" visible={false} style={Components.BoxStyle.NotConnected} BoxClasses={BoxClasses} />
                        <Components.Box ref={(ref: Components.Box) => this.boxSubscribers[1] = ref} id={this.props.targetId + "_Subscriber2"} streamProps={this.subscribeProps} className="cBox" visible={false} style={Components.BoxStyle.NotConnected} BoxClasses={BoxClasses}/>
                        <Components.Box ref={(ref: Components.Box) => this.boxSubscribers[2] = ref} id={this.props.targetId + "_Subscriber3"} streamProps={this.subscribeProps} className="cBox" visible={false} style={Components.BoxStyle.NotConnected} BoxClasses={BoxClasses}/>
                        <Components.Box ref={(ref: Components.Box) => this.boxSubscribers[3] = ref} id={this.props.targetId + "_Subscriber4"} streamProps={this.subscribeProps} className="cBox" visible={false} style={Components.BoxStyle.NotConnected} BoxClasses={BoxClasses}/>
                        <Components.Box ref={(ref: Components.Box) => this.boxSubscribers[4] = ref} id={this.props.targetId + "_Subscriber5"} streamProps={this.subscribeProps} className="cBox" visible={false} style={Components.BoxStyle.NotConnected} BoxClasses={BoxClasses}/>
                        <Components.Box ref={(ref: Components.Box) => this.boxSubscribers[5] = ref} id={this.props.targetId + "_Subscriber6"} streamProps={this.subscribeProps} className="cBox" visible={false} style={Components.BoxStyle.NotConnected} BoxClasses={BoxClasses}/>
                        <Components.Box ref={(ref: Components.Box) => this.boxSubscribers[6] = ref} id={this.props.targetId + "_Subscriber7"} streamProps={this.subscribeProps} className="cBox" visible={false} style={Components.BoxStyle.NotConnected} BoxClasses={BoxClasses}/>
                        <Components.Box ref={(ref: Components.Box) => this.boxSubscribers[7] = ref} id={this.props.targetId + "_Subscriber8"} streamProps={this.subscribeProps} className="cBox" visible={false} style={Components.BoxStyle.NotConnected} BoxClasses={BoxClasses}/>

                        <Components.BoxLabel ref={(ref: Components.BoxLabel) => this.label[0] = ref} text="Student not connected..." style={Components.BoxLabelStyle.NotConnected} className="cBoxLabel" labelClasses={labelClasses} visible={false} />
                        <Components.BoxLabel ref={(ref: Components.BoxLabel) => this.label[1] = ref} text="Student not connected..." style={Components.BoxLabelStyle.NotConnected} className="cBoxLabel" labelClasses={labelClasses} visible={false} />
                        <Components.BoxLabel ref={(ref: Components.BoxLabel) => this.label[2] = ref} text="Student not connected..." style={Components.BoxLabelStyle.NotConnected} className="cBoxLabel" labelClasses={labelClasses} visible={false} />
                        <Components.BoxLabel ref={(ref: Components.BoxLabel) => this.label[3] = ref} text="Student not connected..." style={Components.BoxLabelStyle.NotConnected} className="cBoxLabel" labelClasses={labelClasses} visible={false} />
                        <Components.BoxLabel ref={(ref: Components.BoxLabel) => this.label[4] = ref} text="Student not connected..." style={Components.BoxLabelStyle.NotConnected} className="cBoxLabel" labelClasses={labelClasses} visible={false} />
                        <Components.BoxLabel ref={(ref: Components.BoxLabel) => this.label[5] = ref} text="Student not connected..." style={Components.BoxLabelStyle.NotConnected} className="cBoxLabel" labelClasses={labelClasses} visible={false} />
                        <Components.BoxLabel ref={(ref: Components.BoxLabel) => this.label[6] = ref} text="Student not connected..." style={Components.BoxLabelStyle.NotConnected} className="cBoxLabel" labelClasses={labelClasses} visible={false} />
                        <Components.BoxLabel ref={(ref: Components.BoxLabel) => this.label[7] = ref} text="Student not connected..." style={Components.BoxLabelStyle.NotConnected} className="cBoxLabel" labelClasses={labelClasses} visible={false} />

                        <div ref={(ref: HTMLDivElement) => this.divFloatingChat[0] = ref} className="floatingChat" style={{ display: "none" }}><Components.ChatList ref={(ref: Components.ChatList) => this.floatingChat[0] = ref} fadingOut={true} /></div>
                        <div ref={(ref: HTMLDivElement) => this.divFloatingChat[1] = ref} className="floatingChat" style={{ display: "none" }}><Components.ChatList ref={(ref: Components.ChatList) => this.floatingChat[1] = ref} fadingOut={true} /></div>
                        <div ref={(ref: HTMLDivElement) => this.divFloatingChat[2] = ref} className="floatingChat" style={{ display: "none" }}><Components.ChatList ref={(ref: Components.ChatList) => this.floatingChat[2] = ref} fadingOut={true} /></div>
                        <div ref={(ref: HTMLDivElement) => this.divFloatingChat[3] = ref} className="floatingChat" style={{ display: "none" }}><Components.ChatList ref={(ref: Components.ChatList) => this.floatingChat[3] = ref} fadingOut={true} /></div>
                        <div ref={(ref: HTMLDivElement) => this.divFloatingChat[4] = ref} className="floatingChat" style={{ display: "none" }}><Components.ChatList ref={(ref: Components.ChatList) => this.floatingChat[4] = ref} fadingOut={true} /></div>
                        <div ref={(ref: HTMLDivElement) => this.divFloatingChat[5] = ref} className="floatingChat" style={{ display: "none" }}><Components.ChatList ref={(ref: Components.ChatList) => this.floatingChat[5] = ref} fadingOut={true} /></div>
                        <div ref={(ref: HTMLDivElement) => this.divFloatingChat[6] = ref} className="floatingChat" style={{ display: "none" }}><Components.ChatList ref={(ref: Components.ChatList) => this.floatingChat[6] = ref} fadingOut={true} /></div>
                        <div ref={(ref: HTMLDivElement) => this.divFloatingChat[7] = ref} className="floatingChat" style={{ display: "none" }}><Components.ChatList ref={(ref: Components.ChatList) => this.floatingChat[7] = ref} fadingOut={true} /></div>
                    </div>
                </div>
            );
        }
    }

    export class InitFC {
        constructor(targetId: string, classroomId: string, actionUrl: string) {
            ReactDOM.render(<div><FC targetId={targetId} classroomId={classroomId} actionUrl={actionUrl} /></div>, document.getElementById(targetId));
        }
    }
}