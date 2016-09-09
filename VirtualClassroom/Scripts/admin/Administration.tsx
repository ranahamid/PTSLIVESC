/* tslint:disable:max-line-length */

namespace VC.Admin {
    "use strict";

    enum Menu {
        Seats = 0,
        Students = 1,
        Teachers = 2,
        Featureds = 3,
        Surveys = 4,
        Polls = 5
    }

    interface IProps {
        actionUrl: string;
        classroomId?: string;
    }
    interface IState {
    }

    class Administration extends React.Component<IProps, IState> {
        constructor(props: IProps) {
            super(props);
        }

        render(): JSX.Element {
            return (
                <div>
                    <Lists.Classrooms actionUrl={this.props.actionUrl} />
                </div>
                );
        }
    }

    class Classrooms extends React.Component<IProps, IState> {
        private tabs: Global.Components.Tabs;
        private divSeats: HTMLDivElement;
        private divStudents: HTMLDivElement;
        private divTeachers: HTMLDivElement;
        private divFeatureds: HTMLDivElement;
        private divSurveys: HTMLDivElement;
        private divPolls: HTMLDivElement;
        private seats: Lists.Seats;
        private students: Lists.Students;
        private teachers: Lists.Teachers;
        private featureds: Lists.Featureds;
        private surveys: Lists.Surveys;
        private polls: Lists.Polls;

        constructor(props: IProps) {
            super(props);
        }

        private tabOnClick(id: number): void {
            this.tabs.selectItem(id);

            if (id === -1) {
                // back to Classrooms
                top.location = "/Admin/" as any;
            } else {
                // tabs
                this.divSeats.style.display = "none";
                this.divStudents.style.display = "none";
                this.divTeachers.style.display = "none";
                this.divFeatureds.style.display = "none";
                this.divSurveys.style.display = "none";
                this.divPolls.style.display = "none";

                switch (id) {
                    case Menu.Seats:
                        this.seats.init();
                        this.divSeats.style.display = "block";
                        break;
                    case Menu.Students:
                        this.students.init();
                        this.divStudents.style.display = "block";
                        break;
                    case Menu.Teachers:
                        this.teachers.init();
                        this.divTeachers.style.display = "block";
                        break;
                    case Menu.Featureds:
                        this.featureds.init();
                        this.divFeatureds.style.display = "block";
                        break;
                    case Menu.Surveys:
                        this.surveys.init();
                        this.divSurveys.style.display = "block";
                        break;
                    case Menu.Polls:
                        this.polls.init();
                        this.divPolls.style.display = "block";
                        break;
                }
            }
        }

        componentDidMount(): void {
            // init active tab
            this.seats.init();
        }

        render(): JSX.Element {
            let tabItems: Array<Global.Components.ITabItemProps> = [
                { id: -1, title: "Classrooms", onClick: this.tabOnClick.bind(this), active: false },
                { id: Menu.Seats, title: "Seat computers", onClick: this.tabOnClick.bind(this), active: true },
                { id: Menu.Students, title: "Student computers", onClick: this.tabOnClick.bind(this), active: false },
                { id: Menu.Teachers, title: "Teacher computers", onClick: this.tabOnClick.bind(this), active: false },
                { id: Menu.Featureds, title: "Featured computers", onClick: this.tabOnClick.bind(this), active: false },
                { id: Menu.Surveys, title: "Surveys", onClick: this.tabOnClick.bind(this), active: false },
                { id: Menu.Polls, title: "Polls", onClick: this.tabOnClick.bind(this), active: false }
            ];

            return (
                <div>
                    <div>
                        <Global.Components.Tabs ref={(ref: Global.Components.Tabs) => this.tabs = ref} items={tabItems} className="cTabs" />
                    </div>
                    <div ref={(ref: HTMLDivElement) => this.divSeats = ref} style={{ display: "block" }}>
                        <Lists.Seats ref={(ref: Lists.Seats) => this.seats = ref} actionUrl={this.props.actionUrl} classroomId={this.props.classroomId} />
                    </div>
                    <div ref={(ref: HTMLDivElement) => this.divStudents = ref} style={{ display: "none" }}>
                        <Lists.Students ref={(ref: Lists.Students) => this.students = ref} actionUrl={this.props.actionUrl} classroomId={this.props.classroomId} />
                    </div>
                    <div ref={(ref: HTMLDivElement) => this.divTeachers = ref} style={{ display: "none" }}>
                        <Lists.Teachers ref={(ref: Lists.Teachers) => this.teachers = ref} actionUrl={this.props.actionUrl} classroomId={this.props.classroomId} />
                    </div>
                    <div ref={(ref: HTMLDivElement) => this.divFeatureds = ref} style={{ display: "none" }}>
                        <Lists.Featureds ref={(ref: Lists.Featureds) => this.featureds = ref} actionUrl={this.props.actionUrl} classroomId={this.props.classroomId} />
                    </div>
                    <div ref={(ref: HTMLDivElement) => this.divSurveys = ref} style={{ display: "none" }}>
                        <Lists.Surveys ref={(ref: Lists.Surveys) => this.surveys = ref} actionUrl={this.props.actionUrl} classroomId={this.props.classroomId} />
                    </div>
                    <div ref={(ref: HTMLDivElement) => this.divPolls = ref} style={{ display: "none" }}>
                        <Lists.Polls ref={(ref: Lists.Polls) => this.polls = ref} actionUrl={this.props.actionUrl} classroomId={this.props.classroomId} />
                    </div>
                </div>
            );
        }
    }

    export class InitAdministration {
        constructor(targetId: string, actionUrl: string) {
            ReactDOM.render(<div><Administration actionUrl={actionUrl} /></div>, document.getElementById(targetId));
        }
    }

    export class InitClassrooms {
        constructor(targetId: string, classroomId: string, actionUrl: string) {
            ReactDOM.render(<div><Classrooms classroomId={classroomId} actionUrl={actionUrl} /></div>, document.getElementById(targetId));
        }
    }
}