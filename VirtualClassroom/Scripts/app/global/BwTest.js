var App;
(function (App) {
    var Global;
    (function (Global) {
        var BwTest = (function () {
            function BwTest(sessionId, key, token) {
                this.sessionId = sessionId;
                this.key = key;
                this.token = token;
            }
            BwTest.prototype.startTest = function () {
                var _this = this;
                this.session = OT.initSession(this.key, this.sessionId);
                this.session.on({
                    connectionCreated: function (event) {
                        var tokenData = Global.Fce.toTokenData(event.connection.data);
                        // if its me
                        if (_this.session.connection.connectionId == event.connection.connectionId) {
                            // connected .. init publisher
                            _this.initPublisher();
                        }
                    }
                });
                this.session.connect(this.token, function (err) {
                    if (err) {
                        // error
                        console.log('Error connecting: ' + err.message);
                    }
                    else {
                    }
                });
            };
            BwTest.prototype.initPublisher = function () {
                var _this = this;
                this.divPublisher = document.createElement('div');
                OT.initPublisher(this.divPublisher, {}, function (err) {
                    if (err) {
                        console.log('Something went wrong [Init]: ' + err.message);
                    }
                    else {
                        // publisher initied
                        _this.session.publish(_this.publisher, function (err) {
                            if (err) {
                                console.log('Something went wrong [Publish]: ' + err.message);
                            }
                            else {
                                // publishing .. init subscriber
                                _this.initSubscriber();
                            }
                        });
                    }
                });
            };
            BwTest.prototype.initSubscriber = function () {
                this.divSubscriber = document.createElement('div');
                this.subscriber = this.session.subscribe(this.publisher.stream, this.divSubscriber, { audioVolume: 0, testNetwork: true }, function (err) {
                    if (err) {
                        console.log('Something went wrong [Subscribe]: ' + err.message);
                    }
                    else {
                    }
                });
            };
            return BwTest;
        }());
        Global.BwTest = BwTest;
    })(Global = App.Global || (App.Global = {}));
})(App || (App = {}));
//# sourceMappingURL=BwTest.js.map