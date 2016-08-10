/* tslint:disable:max-line-length */
var VC;
(function (VC) {
    var Forms;
    (function (Forms) {
        "use strict";
        (function (FormViews) {
            FormViews[FormViews["Edit"] = 0] = "Edit";
            FormViews[FormViews["Preview"] = 1] = "Preview";
            FormViews[FormViews["View"] = 2] = "View";
            FormViews[FormViews["Answer"] = 3] = "Answer";
            FormViews[FormViews["Result"] = 4] = "Result";
        })(Forms.FormViews || (Forms.FormViews = {}));
        var FormViews = Forms.FormViews;
        (function (FormAnswerStatus) {
            FormAnswerStatus[FormAnswerStatus["Pending"] = 1] = "Pending";
            FormAnswerStatus[FormAnswerStatus["Answered"] = 2] = "Answered";
            FormAnswerStatus[FormAnswerStatus["Declined"] = 3] = "Declined";
        })(Forms.FormAnswerStatus || (Forms.FormAnswerStatus = {}));
        var FormAnswerStatus = Forms.FormAnswerStatus;
        (function (FormType) {
            FormType[FormType["Survey"] = 1] = "Survey";
            FormType[FormType["Poll"] = 2] = "Poll";
        })(Forms.FormType || (Forms.FormType = {}));
        var FormType = Forms.FormType;
        class FormApi {
            static Insert(data, onSuccess, onError) {
                $.ajax({
                    cache: false,
                    type: "POST",
                    url: "/api/Form/Insert",
                    contentType: "application/json",
                    data: JSON.stringify(data),
                    success: (r) => {
                        if (r.status === VC.Global.Data.RESPONSE_SUCCESS) {
                            // success
                            onSuccess(r.data);
                        }
                        else {
                            // error
                            onError(r.message);
                        }
                    },
                    error: (xhr, status, error) => {
                        // error
                        onError(error);
                    }
                });
            }
            static Update(data, onSuccess, onError) {
                $.ajax({
                    cache: false,
                    type: "POST",
                    url: "/api/Form/Update/",
                    data: JSON.stringify(data),
                    contentType: "application/json",
                    success: (r) => {
                        if (r.status === VC.Global.Data.RESPONSE_SUCCESS) {
                            if (r.data) {
                                // success
                                onSuccess();
                            }
                            else {
                                // not updated
                                onError("Something went wrong and the record is not updated.");
                            }
                        }
                        else {
                            // error
                            onError(r.message);
                        }
                    },
                    error: (xhr, status, error) => {
                        // error
                        onError(error);
                    }
                });
            }
            static Delete(id, onSuccess, onError) {
                $.ajax({
                    cache: false,
                    type: "POST",
                    url: "/api/Form/Delete/" + id,
                    contentType: "application/json",
                    data: null,
                    success: (r) => {
                        if (r.status === VC.Global.Data.RESPONSE_SUCCESS) {
                            if (r.data) {
                                // success
                                onSuccess();
                            }
                            else {
                                // not deleted
                                onError("Something went wrong and the record is not deleted.");
                            }
                        }
                        else {
                            // error
                            onError(r.message);
                        }
                    },
                    error: (xhr, status, error) => {
                        // error
                        onError(error);
                    }
                });
            }
            static UpdateAnswer(data, onSuccess, onError) {
                $.ajax({
                    cache: false,
                    type: "POST",
                    url: "/api/Form/UpdateAnswer/",
                    data: JSON.stringify(data),
                    contentType: "application/json",
                    success: (r) => {
                        if (r.status === VC.Global.Data.RESPONSE_SUCCESS) {
                            if (r.data) {
                                // success
                                onSuccess();
                            }
                            else {
                                // not updated
                                onError("Something went wrong and the record is not updated.");
                            }
                        }
                        else {
                            // error
                            onError(r.message);
                        }
                    },
                    error: (xhr, status, error) => {
                        // error
                        onError(error);
                    }
                });
            }
        }
        Forms.FormApi = FormApi;
        class Form extends React.Component {
            constructor(props) {
                super(props);
                this.state = { view: props.view, components: undefined };
            }
            componentDidMount() {
                // this.saveForm();
            }
            loading() {
                this.setState({
                    view: this.state.view,
                    formUid: undefined,
                    answerUid: undefined,
                    components: undefined
                });
            }
            init() {
                this.setState({
                    view: this.state.view,
                    formUid: undefined,
                    answerUid: undefined,
                    components: []
                });
            }
            initForm(formUid) {
                // clear & set loading
                this.setState({
                    view: this.state.view,
                    formUid: formUid,
                    answerUid: undefined,
                    components: undefined
                }, () => {
                    // load form on callback
                    $.ajax({
                        cache: false,
                        type: "GET",
                        url: "/api/Form/Get/" + formUid,
                        success: (r) => {
                            if (r.status === VC.Global.Data.RESPONSE_SUCCESS) {
                                // successfully loaded - init
                                this.init();
                                // parse & add components
                                let components = JSON.parse(r.data.formData);
                                for (let i = 0; i < components.length; i++) {
                                    this.addComponent(components[i].type, components[i].configData, null, null); // no answer or result
                                }
                            }
                            else {
                                // error
                                alert("ERROR: " + r.message);
                            }
                        },
                        error: (xhr, status, error) => {
                            // error
                            alert("ERROR: " + error);
                        }
                    });
                });
            }
            initAnswer(answerUid) {
                // clear & set loading
                this.setState({
                    view: this.state.view,
                    formUid: undefined,
                    answerUid: answerUid,
                    componets: undefined
                }, () => {
                    // load form answer on callback
                    $.ajax({
                        cache: false,
                        type: "GET",
                        url: "/api/Form/GetAnswer/" + answerUid,
                        success: (r) => {
                            if (r.status === VC.Global.Data.RESPONSE_SUCCESS) {
                                // successfully loaded - init
                                this.init();
                                // parse & add components
                                let components = JSON.parse(r.data.formData);
                                for (let i = 0; i < components.length; i++) {
                                    this.addComponent(components[i].type, components[i].configData, components[i].answerData, null); // answer
                                }
                            }
                            else {
                                // error
                                alert("ERROR: " + r.message);
                            }
                        },
                        error: (xhr, status, error) => {
                            // error
                            alert("ERROR: " + error);
                        }
                    });
                });
            }
            initResult(formUid) {
                // clear & set loading
                this.setState({
                    view: this.state.view,
                    formUid: formUid,
                    answerUid: undefined,
                    components: undefined
                }, () => {
                    // load form on callback
                    $.ajax({
                        cache: false,
                        type: "GET",
                        url: "/api/Form/GetResult/" + formUid,
                        success: (r) => {
                            if (r.status === VC.Global.Data.RESPONSE_SUCCESS) {
                                // successfully loaded - init
                                this.init();
                                // parse & add components
                                let components = JSON.parse(r.data.formData);
                                for (let i = 0; i < components.length; i++) {
                                    this.addComponent(components[i].type, components[i].configData, null, components[i].answerData); // result
                                }
                            }
                            else {
                                // error
                                alert("ERROR: " + r.message);
                            }
                        },
                        error: (xhr, status, error) => {
                            // error
                            alert("ERROR: " + error);
                        }
                    });
                });
            }
            updateResult(resultData) {
                if (this.state.components !== undefined) {
                    this.formBody.updateResult(resultData);
                }
            }
            getData(dataType) {
                return this.formBody.getData(dataType);
            }
            addComponent(type, configData, answerData, resultData) {
                let countOfComponents = this.formBody.addComponent(type, configData, answerData, resultData);
                this.formPanel.componentCount(countOfComponents);
            }
            removeComponent(id) {
                let countOfComponents = this.formBody.removeComponent(id);
                this.formPanel.componentCount(countOfComponents);
            }
            changeView(view) {
                // save
                this.setState({ view: view });
            }
            validate() {
                return this.formBody.validate();
            }
            renderLoading() {
                return (React.createElement("div", {className: "Forms"}, React.createElement("div", {className: "text-muted"}, "Loading...")));
            }
            renderForm() {
                return (React.createElement("div", {className: "Forms"}, React.createElement(Forms.FormBody, {ref: (ref) => this.formBody = ref, components: this.state.components, view: this.state.view}), React.createElement(Forms.FormPanel, {ref: (ref) => this.formPanel = ref, show: this.state.view === FormViews.Edit, type: this.props.type, onAddComponent: (type) => this.addComponent(type, null, null, null), onRemoveComponent: (id) => this.removeComponent(id)})));
            }
            render() {
                if (this.state.components === undefined) {
                    return this.renderLoading();
                }
                else {
                    return this.renderForm();
                }
            }
        }
        Forms.Form = Form;
    })(Forms = VC.Forms || (VC.Forms = {}));
})(VC || (VC = {}));
//# sourceMappingURL=Form.js.map