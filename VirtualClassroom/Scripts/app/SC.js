/* tslint:disable:max-line-length */
var VC;
(function (VC) {
    var App;
    (function (App) {
        "use strict";
        class SC extends App.XC {
            constructor(props) {
                super(props, App.Roles.SC);
                this.boxSubscribers = new Array(8);
                this.label = new Array(8);
                this.divFloatingChat = new Array(8);
                this.floatingChat = new Array(8);
                this.connectedStudents = [false, false, false, false, false, false, false, false];
                this.raisedHands = [false, false, false, false, false, false, false, false];
            }
            // abstract methods
            setStatusText(text, style) {
                this.setStatusVisibility(true);
                this.status.setText(text, style);
            }
            didMount() {
                $(window).resize(() => window.setTimeout(() => this.fitLayout(), 0));
            }
            connected(connection) {
                let tokenData = App.Global.Fce.toTokenData(connection.data);
                if (this.dataResponse.Uid === tokenData.Uid) {
                    // me
                    this.setStatusVisibility(false);
                    this.setUiVisibility(true);
                }
                else if (this.isInMyGroup(tokenData.Uid)) {
                    // my group
                    if (tokenData.Role === App.Roles.PC) {
                        // student
                        let groupComputer = this.getGroupComputer(tokenData.Uid);
                        //
                        let addressData;
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
                            this.label[groupComputer.Position - 1].setText(tokenData.Name + ", " + addressData + " connected.", (this.raisedHands[groupComputer.Position - 1] ? App.Components.BoxLabelStyle.HandRaised : App.Components.BoxLabelStyle.Connected));
                        else
                            this.label[groupComputer.Position - 1].setText(tokenData.Name + " connected.", (this.raisedHands[groupComputer.Position - 1] ? App.Components.BoxLabelStyle.HandRaised : App.Components.BoxLabelStyle.Connected));
                        //  this.label[groupComputer.Position - 1].setText(tokenData.Name + " connected.", (this.raisedHands[groupComputer.Position - 1] ? Components.BoxLabelStyle.HandRaised : Components.BoxLabelStyle.Connected));
                        this.connectedStudents[groupComputer.Position - 1] = true;
                        //add
                        if (this.raisedHands[groupComputer.Position - 1]) {
                            this.boxSubscribers[groupComputer.Position - 1].setStyle(App.Components.BoxStyle.HandRaised);
                        }
                        else {
                            this.boxSubscribers[groupComputer.Position - 1].setStyle(App.Components.BoxStyle.Connected);
                        }
                        this.fitLayout();
                    }
                }
                else if (tokenData.Role === App.Roles.AC) {
                    // admin computer
                    App.Global.Signaling.sendSignal(this.session, this.getAcConnection(), App.Global.SignalTypes.Connected, {});
                }
            }
            disconnected(connection) {
                let tokenData = App.Global.Fce.toTokenData(connection.data);
                if (this.dataResponse.Uid === tokenData.Uid) {
                    // me
                    this.boxPublisher.unpublish(this.session);
                    this.setUiVisibility(false);
                    this.setStatusText("Disconnected from the session.", App.Components.StatusStyle.Error);
                }
                else if (this.isInMyGroup(tokenData.Uid)) {
                    // my group
                    if (tokenData.Role === App.Roles.PC) {
                        // student
                        let groupComputer = this.getGroupComputer(tokenData.Uid);
                        this.label[groupComputer.Position - 1].setText("Student PC not connected.", App.Components.BoxLabelStyle.NotConnected);
                        this.connectedStudents[groupComputer.Position - 1] = false;
                        this.raisedHands[groupComputer.Position - 1] = false;
                        this.fitLayout();
                    }
                }
            }
            sessionConnected(event) {
                // nothing to do
            }
            sessionDisconnected(event) {
                this.setUiVisibility(false);
                this.setStatusVisibility(true);
            }
            streamCreated(connection, stream) {
                let tokenData = App.Global.Fce.toTokenData(connection.data);
                if (this.dataResponse.Uid === tokenData.Uid) {
                }
                else if (this.isInMyGroup(tokenData.Uid)) {
                    // my group
                    let groupComputer = this.getGroupComputer(tokenData.Uid);
                    // student
                    this.boxSubscribers[groupComputer.Position - 1].subscribeVideo(this.session, stream);
                }
            }
            streamDestroyed(connection, stream) {
                let tokenData = App.Global.Fce.toTokenData(connection.data);
                if (this.dataResponse.Uid === tokenData.Uid) {
                }
                else if (this.isInMyGroup(tokenData.Uid)) {
                    // my group
                    let groupComputer = this.getGroupComputer(tokenData.Uid);
                    // student
                    this.boxSubscribers[groupComputer.Position - 1].unsubscribe(this.session);
                }
            }
            streamPropertyChanged(event) {
                // nothing to do
            }
            signalReceived(event) {
                let signalType = App.Global.Signaling.getSignalType(event.type);
                switch (signalType) {
                    case App.Global.SignalTypes.TurnOff:
                        this.turnOffSignalReceived(event);
                        break;
                    case App.Global.SignalTypes.Chat:
                        this.chatSignalReceived(event);
                        break;
                    case App.Global.SignalTypes.RaiseHand:
                        this.raiseHandSignalReceived(event);
                        break;
                }
            }
            turnOffSignalReceived(event) {
                let data = JSON.parse(event.data);
                if (data.role === undefined || data.role === App.Roles.SC) {
                    this.disconnect();
                }
            }
            raiseHandSignalReceived(event) {
                let tokenData = App.Global.Fce.toTokenData(event.from.data);
                let groupComputer = this.getGroupComputer(tokenData.Uid);
                let data = JSON.parse(event.data);
                if (tokenData.Role === App.Roles.AC) {
                    // all
                    for (let i = 0; i < 8; i++) {
                        if (this.connectedStudents[i]) {
                            this.raisedHands[i] = data.raised;
                            this.label[i].setStyle(data.raised ? App.Components.BoxLabelStyle.HandRaised : App.Components.BoxLabelStyle.Connected);
                            //test
                            this.boxSubscribers[i].setStyle(data.raised ? App.Components.BoxStyle.HandRaised : App.Components.BoxStyle.Connected);
                            //add
                            if (data.raised) {
                                this.boxSubscribers[i].setStyle(App.Components.BoxStyle.HandRaised);
                            }
                            else {
                                this.boxSubscribers[i].setStyle(App.Components.BoxStyle.Connected);
                            }
                        }
                    }
                }
                else {
                    // single student
                    this.raisedHands[groupComputer.Position - 1] = data.raised;
                    this.label[groupComputer.Position - 1].setStyle(data.raised ? App.Components.BoxLabelStyle.HandRaised : App.Components.BoxLabelStyle.Connected);
                    //add
                    this.boxSubscribers[groupComputer.Position - 1].setStyle(data.raised ? App.Components.BoxStyle.HandRaised : App.Components.BoxStyle.Connected);
                    if (data.raised) {
                        this.boxSubscribers[groupComputer.Position - 1].setStyle(App.Components.BoxStyle.HandRaised);
                    }
                    else {
                        this.boxSubscribers[groupComputer.Position - 1].setStyle(App.Components.BoxStyle.Connected);
                    }
                }
            }
            chatSignalReceived(event) {
                let data = JSON.parse(event.data);
                if (data.type === App.Global.ChatType.Public) {
                    // try to find this student
                    let groupComputer = this.getGroupComputer(data.userUid);
                    if (groupComputer !== null) {
                        this.floatingChat[groupComputer.Position - 1].addItem({
                            userUid: data.userUid,
                            userRole: data.userRole,
                            userName: data.userName,
                            message: data.message,
                            timestamp: new Date(),
                            me: false
                        });
                    }
                }
            }
            setStatusVisibility(visible) {
                this.divStatus.style.display = visible ? "block" : "none";
            }
            setLayoutVisibility(visible) {
                // Body1 style
                let body1 = document.getElementById("Body1");
                //  body1.className = visible ? "lightBody" : "darkBody";
                // divBody1 class
                let divBody1 = document.getElementById("DivBody1");
                divBody1.className = visible ? "divBody" : "";
                // header1
                let header1 = document.getElementById("Header1");
                // header1.style.display = visible ? "block" : "none";
                // footer1
                let footer1 = document.getElementById("Footer1");
                footer1.style.display = visible ? "block" : "none";
            }
            setUiVisibility(visible) {
                this.setLayoutVisibility(!visible);
                this.divUI.style.display = visible ? "block" : "none";
                if (visible) {
                    this.fitLayout();
                }
            }
            getCountOfConnectedStudents() {
                let connectedStudentsCount = 0;
                this.connectedStudents.forEach((connected) => {
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
            fitLayout() {
                let windowHeight = $(window).innerHeight();
                let windowWidth = $(window).innerWidth();
                this.fitLayerSizes(windowWidth, windowHeight);
            }
            fitLayerSizes(windowWidth, windowHeight) {
                let connectedStudentsCount = this.getCountOfConnectedStudents();
                // let layout: number = this.getLayoutSize();
                let countOfVisibleBoxes = 0;
                // visibility of boxes + labels + floating chat divs
                for (let i = 0; i < 8; i++) {
                    if (this.connectedStudents[i]) {
                        this.boxSubscribers[i].setVisibility(true);
                        this.label[i].setVisibility(true);
                        //animated
                        $(this.label[i].getParentDiv()).addClass(" animated rollIn ");
                        if (this.divFloatingChat[i].style.display === "none") {
                            this.divFloatingChat[i].style.display = "block";
                        }
                        countOfVisibleBoxes++;
                    }
                    else {
                        this.boxSubscribers[i].setVisibility(false);
                        //animated
                        $(this.label[i].getParentDiv()).removeClass(" animated rollOut ");
                        this.label[i].setVisibility(false);
                        if (this.divFloatingChat[i].style.display === "block") {
                            this.divFloatingChat[i].style.display = "none";
                        }
                    }
                }
                // show boxes left
                //for (let i: number = 7; i >= 0 && countOfVisibleBoxes < layout; i++) {
                //    if (!this.connectedStudents[i]) {
                //        this.boxSubscribers[i].setVisibility(true);
                //        this.label[i].setVisibility(true);
                //        if (this.divFloatingChat[i].style.display === "none") {
                //            this.divFloatingChat[i].style.display = "block";
                //        }
                //        countOfVisibleBoxes++;
                //    }
                //}
                // sizes and position of boxes + labels + floating chat divs
                //if (layout > 6) {
                //    for (let i: number = 0; i < 8; i++) {
                //        $(this.boxSubscribers[i].getBox())
                //            .css("width", "25%")
                //            .css("height", windowHeight / 2 + "px"); // 8
                //        $(this.label[i].getParentDiv()).css("width", "25%");
                //        $(this.divFloatingChat[i]).css("width", "25%");
                //    }
                //} else if (layout > 4) {
                //    for (let i: number = 0; i < 8; i++) {
                //        $(this.boxSubscribers[i].getBox())
                //            .css("width", "33.33%")
                //            .css("height", windowHeight / 2 + "px"); // 6
                //        $(this.label[i].getParentDiv()).css("width", "33.33%");
                //        $(this.divFloatingChat[i]).css("width", "33.33%");
                //    }
                //} else if (layout > 2) {
                //    for (let i: number = 0; i < 8; i++) {
                //        $(this.boxSubscribers[i].getBox())
                //            .css("width", "50%")
                //            .css("height", windowHeight / 2 + "px"); // 4
                //        $(this.label[i].getParentDiv()).css("width", "50%");
                //        $(this.divFloatingChat[i]).css("width", "50%");
                //    }
                //} else if (layout > 1) {
                //    for (let i: number = 0; i < 8; i++) {
                //        $(this.boxSubscribers[i].getBox())
                //            .css("width", "50%")
                //            .css("height", windowHeight + "px"); // 2
                //        $(this.label[i].getParentDiv()).css("width", "50%");
                //        $(this.divFloatingChat[i]).css("width", "50%");
                //    }
                //} else {
                //    for (let i: number = 0; i < 8; i++) {
                //        $(this.boxSubscribers[i].getBox())
                //            .css("width", "100%")
                //            .css("height", windowHeight + "px"); // 1
                //        $(this.label[i].getParentDiv()).css("width", "100%");
                //        $(this.divFloatingChat[i]).css("width", "100%");
                //    }
                //}
                // sizes and position of boxes + labels + floating chat divs
                //0
                if (connectedStudentsCount == 0) {
                    for (let i = 0; i < 8; i++) {
                        if (!this.connectedStudents[i]) {
                            this.boxSubscribers[i].setVisibility(true);
                            this.label[i].setVisibility(true);
                            if (this.divFloatingChat[i].style.display === "none") {
                                this.divFloatingChat[i].style.display = "block";
                            }
                            $(this.boxSubscribers[i].getBox())
                                .css("width", "100%")
                                .css("height", windowHeight + "px"); //1
                            $(this.label[i].getParentDiv()).css("width", "100%");
                            $(this.divFloatingChat[i]).css("width", "100%");
                            break;
                        }
                    }
                }
                //1
                if (connectedStudentsCount == 1) {
                    for (let i = 0; i < 8; i++) {
                        $(this.boxSubscribers[i].getBox())
                            .css("width", "100%")
                            .css("height", windowHeight + "px"); // 1
                        $(this.label[i].getParentDiv()).css("width", "100%");
                        $(this.divFloatingChat[i]).css("width", "100%");
                    }
                }
                else if (connectedStudentsCount == 2) {
                    for (let i = 0; i < 8; i++) {
                        $(this.boxSubscribers[i].getBox())
                            .css("width", "50%")
                            .css("height", windowHeight + "px"); // 2
                        $(this.label[i].getParentDiv()).css("width", "50%");
                        $(this.divFloatingChat[i]).css("width", "50%");
                    }
                }
                else if (connectedStudentsCount == 3) {
                    for (let i = 0; i < 8; i++) {
                        $(this.boxSubscribers[i].getBox())
                            .css("width", "33.33%")
                            .css("height", windowHeight + "px"); // 2
                        $(this.label[i].getParentDiv()).css("width", "33.33%");
                        $(this.divFloatingChat[i]).css("width", "33.33%");
                    }
                }
                else if (connectedStudentsCount == 4) {
                    for (let i = 0; i < 8; i++) {
                        $(this.boxSubscribers[i].getBox())
                            .css("width", "25%")
                            .css("height", windowHeight + "px"); // 4
                        $(this.label[i].getParentDiv()).css("width", "25%");
                        $(this.divFloatingChat[i]).css("width", "25%");
                    }
                }
                else if (connectedStudentsCount == 5) {
                    for (let i = 0; i < 8; i++) {
                        $(this.boxSubscribers[i].getBox())
                            .css("width", "20%")
                            .css("height", windowHeight + "px"); // 4
                        $(this.label[i].getParentDiv()).css("width", "20%");
                        $(this.divFloatingChat[i]).css("width", "20%");
                    }
                }
                else if (connectedStudentsCount == 6) {
                    for (let i = 0; i < 8; i++) {
                        $(this.boxSubscribers[i].getBox())
                            .css("width", "33.33%")
                            .css("height", windowHeight / 2 + "px"); // 6
                        $(this.label[i].getParentDiv()).css("width", "33.33%");
                        $(this.divFloatingChat[i]).css("width", "33.33%");
                    }
                }
                else if (connectedStudentsCount == 7) {
                    let countConnectStudent = 0;
                    for (let i = 0; i < 8; i++) {
                        if (this.connectedStudents[i]) {
                            countConnectStudent++;
                            if (countConnectStudent <= 4) {
                                $(this.boxSubscribers[i].getBox())
                                    .css("width", "25%")
                                    .css("height", windowHeight / 2 + "px");
                                $(this.label[i].getParentDiv()).css("width", "25%");
                                $(this.divFloatingChat[i]).css("width", "25%");
                            }
                            else {
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
                if (connectedStudentsCount >= 8) {
                    for (let i = 0; i < 8; i++) {
                        $(this.boxSubscribers[i].getBox())
                            .css("width", "25%")
                            .css("height", windowHeight / 2 + "px"); // 8
                        $(this.label[i].getParentDiv()).css("width", "25%");
                        $(this.divFloatingChat[i]).css("width", "25%");
                    }
                }
                // labels
                for (let i = 0; i < 8; i++) {
                    $(this.label[i].getParentDiv())
                        .css("left", $(this.boxSubscribers[i].getBox()).position().left + "px")
                        .css("top", ($(this.boxSubscribers[i].getBox()).position().top + $(this.boxSubscribers[i].getBox()).height() - $(this.label[i].getParentDiv()).height()) + "px");
                }
                // floating chat
                for (let i = 0; i < 8; i++) {
                    $(this.divFloatingChat[i])
                        .css("left", $(this.boxSubscribers[i].getBox()).position().left + "px")
                        .css("top", ($(this.boxSubscribers[i].getBox()).position().top + $(this.label[i].getParentDiv()).height() + 10) + "px")
                        .css("height", ($(this.boxSubscribers[i].getBox()).height() - $(this.label[i].getParentDiv()).height() - 10) + "px");
                }
            }
            render() {
                let statusClasses = [
                    "alert alert-warning",
                    "alert alert-success",
                    "alert alert-danger" // error
                ];
                let labelClasses = [
                    "notConnected",
                    "connected",
                    "handRaised" // handRaised
                ];
                let BoxClasses = [
                    "notConnectedBox",
                    "connectedBox",
                    "handRaisedBox" // handRaised
                ];
                return (React.createElement("div", {className: "scContainer"}, React.createElement("div", {ref: (ref) => this.divStatus = ref}, React.createElement(App.Components.Status, {ref: (ref) => this.status = ref, text: "Connecting ...", style: App.Components.StatusStyle.Connecting, className: "cStatus", statusClasses: statusClasses})), React.createElement("div", {ref: (ref) => this.divUI = ref, style: { display: "none" }}, React.createElement(App.Components.Box, {ref: (ref) => this.boxPublisher = ref, id: this.props.targetId + "_Publisher1", streamProps: this.publishProps, className: "", visible: false, style: App.Components.BoxStyle.NotConnected, BoxClasses: labelClasses}), React.createElement(App.Components.Box, {ref: (ref) => this.boxSubscribers[0] = ref, id: this.props.targetId + "_Subscriber1", streamProps: this.subscribeProps, className: "cBox", visible: false, style: App.Components.BoxStyle.NotConnected, BoxClasses: labelClasses}), React.createElement(App.Components.Box, {ref: (ref) => this.boxSubscribers[1] = ref, id: this.props.targetId + "_Subscriber2", streamProps: this.subscribeProps, className: "cBox", visible: false, style: App.Components.BoxStyle.NotConnected, BoxClasses: labelClasses}), React.createElement(App.Components.Box, {ref: (ref) => this.boxSubscribers[2] = ref, id: this.props.targetId + "_Subscriber3", streamProps: this.subscribeProps, className: "cBox", visible: false, style: App.Components.BoxStyle.NotConnected, BoxClasses: labelClasses}), React.createElement(App.Components.Box, {ref: (ref) => this.boxSubscribers[3] = ref, id: this.props.targetId + "_Subscriber4", streamProps: this.subscribeProps, className: "cBox", visible: false, style: App.Components.BoxStyle.NotConnected, BoxClasses: labelClasses}), React.createElement(App.Components.Box, {ref: (ref) => this.boxSubscribers[4] = ref, id: this.props.targetId + "_Subscriber5", streamProps: this.subscribeProps, className: "cBox", visible: false, style: App.Components.BoxStyle.NotConnected, BoxClasses: labelClasses}), React.createElement(App.Components.Box, {ref: (ref) => this.boxSubscribers[5] = ref, id: this.props.targetId + "_Subscriber6", streamProps: this.subscribeProps, className: "cBox", visible: false, style: App.Components.BoxStyle.NotConnected, BoxClasses: labelClasses}), React.createElement(App.Components.Box, {ref: (ref) => this.boxSubscribers[6] = ref, id: this.props.targetId + "_Subscriber7", streamProps: this.subscribeProps, className: "cBox", visible: false, style: App.Components.BoxStyle.NotConnected, BoxClasses: labelClasses}), React.createElement(App.Components.Box, {ref: (ref) => this.boxSubscribers[7] = ref, id: this.props.targetId + "_Subscriber8", streamProps: this.subscribeProps, className: "cBox", visible: false, style: App.Components.BoxStyle.NotConnected, BoxClasses: labelClasses}), React.createElement(App.Components.BoxLabel, {ref: (ref) => this.label[0] = ref, text: "Student not connected...", style: App.Components.BoxLabelStyle.NotConnected, className: "cBoxLabel", labelClasses: labelClasses, visible: false}), React.createElement(App.Components.BoxLabel, {ref: (ref) => this.label[1] = ref, text: "Student not connected...", style: App.Components.BoxLabelStyle.NotConnected, className: "cBoxLabel", labelClasses: labelClasses, visible: false}), React.createElement(App.Components.BoxLabel, {ref: (ref) => this.label[2] = ref, text: "Student not connected...", style: App.Components.BoxLabelStyle.NotConnected, className: "cBoxLabel", labelClasses: labelClasses, visible: false}), React.createElement(App.Components.BoxLabel, {ref: (ref) => this.label[3] = ref, text: "Student not connected...", style: App.Components.BoxLabelStyle.NotConnected, className: "cBoxLabel", labelClasses: labelClasses, visible: false}), React.createElement(App.Components.BoxLabel, {ref: (ref) => this.label[4] = ref, text: "Student not connected...", style: App.Components.BoxLabelStyle.NotConnected, className: "cBoxLabel", labelClasses: labelClasses, visible: false}), React.createElement(App.Components.BoxLabel, {ref: (ref) => this.label[5] = ref, text: "Student not connected...", style: App.Components.BoxLabelStyle.NotConnected, className: "cBoxLabel", labelClasses: labelClasses, visible: false}), React.createElement(App.Components.BoxLabel, {ref: (ref) => this.label[6] = ref, text: "Student not connected...", style: App.Components.BoxLabelStyle.NotConnected, className: "cBoxLabel", labelClasses: labelClasses, visible: false}), React.createElement(App.Components.BoxLabel, {ref: (ref) => this.label[7] = ref, text: "Student not connected...", style: App.Components.BoxLabelStyle.NotConnected, className: "cBoxLabel", labelClasses: labelClasses, visible: false}), React.createElement("div", {ref: (ref) => this.divFloatingChat[0] = ref, className: "floatingChat", style: { display: "none" }}, React.createElement(App.Components.ChatList, {ref: (ref) => this.floatingChat[0] = ref, fadingOut: true})), React.createElement("div", {ref: (ref) => this.divFloatingChat[1] = ref, className: "floatingChat", style: { display: "none" }}, React.createElement(App.Components.ChatList, {ref: (ref) => this.floatingChat[1] = ref, fadingOut: true})), React.createElement("div", {ref: (ref) => this.divFloatingChat[2] = ref, className: "floatingChat", style: { display: "none" }}, React.createElement(App.Components.ChatList, {ref: (ref) => this.floatingChat[2] = ref, fadingOut: true})), React.createElement("div", {ref: (ref) => this.divFloatingChat[3] = ref, className: "floatingChat", style: { display: "none" }}, React.createElement(App.Components.ChatList, {ref: (ref) => this.floatingChat[3] = ref, fadingOut: true})), React.createElement("div", {ref: (ref) => this.divFloatingChat[4] = ref, className: "floatingChat", style: { display: "none" }}, React.createElement(App.Components.ChatList, {ref: (ref) => this.floatingChat[4] = ref, fadingOut: true})), React.createElement("div", {ref: (ref) => this.divFloatingChat[5] = ref, className: "floatingChat", style: { display: "none" }}, React.createElement(App.Components.ChatList, {ref: (ref) => this.floatingChat[5] = ref, fadingOut: true})), React.createElement("div", {ref: (ref) => this.divFloatingChat[6] = ref, className: "floatingChat", style: { display: "none" }}, React.createElement(App.Components.ChatList, {ref: (ref) => this.floatingChat[6] = ref, fadingOut: true})), React.createElement("div", {ref: (ref) => this.divFloatingChat[7] = ref, className: "floatingChat", style: { display: "none" }}, React.createElement(App.Components.ChatList, {ref: (ref) => this.floatingChat[7] = ref, fadingOut: true})))));
            }
        }
        class InitSC {
            constructor(targetId, classroomId, actionUrl) {
                ReactDOM.render(React.createElement("div", null, React.createElement(SC, {targetId: targetId, classroomId: classroomId, actionUrl: actionUrl})), document.getElementById(targetId));
            }
        }
        App.InitSC = InitSC;
    })(App = VC.App || (VC.App = {}));
})(VC || (VC = {}));
//# sourceMappingURL=SC.js.map