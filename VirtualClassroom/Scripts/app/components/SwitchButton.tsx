/* tslint:disable:max-line-length */

namespace VC.App.Components {
    "use strict";

    export enum SwitchButtonStatus {
        Start = 0,
        Stop = 1,
        Hidden = 2
    }

    interface ISwitchButtonProps {
        status: SwitchButtonStatus;
        textOn: string;
        classOn: string;
        iconOn: string;
        textOff: string;
        classOff: string;
        iconOff: string;
        onOn: () => void;
        onOff: () => void;
        className: string;
    }
    interface ISwitchButtonState {
        status: SwitchButtonStatus;
    }

    export class SwitchButton extends React.Component<ISwitchButtonProps, ISwitchButtonState> {
        constructor(props: ISwitchButtonProps) {
            super(props);
            this.state = { status: props.status };
        }

        private getButtonValue(status: SwitchButtonStatus): string {
            let btnValue: string = "";
            switch (status) {
                case SwitchButtonStatus.Start:
                    btnValue = this.props.textOn;
                    break;
                case SwitchButtonStatus.Stop:
                    btnValue = this.props.textOff;
                    break;
            }
            return btnValue;
        }
        private getButtonClassName(status: SwitchButtonStatus): string {
            let btnClassName: string = "";
            switch (status) {
                case SwitchButtonStatus.Start:
                    btnClassName = this.props.classOn;
                    break;
                case SwitchButtonStatus.Stop:
                    btnClassName = this.props.classOff;
                    break;
            }
            return btnClassName;
        }
        private getIconClassName(status: SwitchButtonStatus): string {
            let iconClassName: string = "";
            switch (status) {
                case SwitchButtonStatus.Start:
                    iconClassName = this.props.iconOn;
                    break;
                case SwitchButtonStatus.Stop:
                    iconClassName = this.props.iconOff;
                    break;
            }
            return iconClassName;
        }
        private onClick(): void {
            if (this.state.status === SwitchButtonStatus.Start) {
                this.setState({ status: SwitchButtonStatus.Stop } as ISwitchButtonState, this.props.onOn);
            } else if (this.state.status === SwitchButtonStatus.Stop) {
                this.setState({ status: SwitchButtonStatus.Start } as ISwitchButtonState, this.props.onOff);
            }
        }
        public setStatus(status: SwitchButtonStatus): void {
            this.setState({ status: status } as ISwitchButtonState);
        }
        public getStatus(): SwitchButtonStatus {
            return this.state.status;
        }

        render(): JSX.Element {
            let btnValue: string = this.getButtonValue(this.state.status);
            let btnClassName: string = this.getButtonClassName(this.state.status);
            let iconClassName: string = this.getIconClassName(this.state.status);
            if (iconClassName !== "" && btnValue !== "") {
                btnValue = " " + btnValue;
            }

            return (
                <div style={{ display: (this.state.status === SwitchButtonStatus.Hidden ? "none" : "block") }} className={this.props.className}>
                    <button type="button" className={btnClassName} onClick={() => this.onClick() }><span className={iconClassName}></span>{btnValue}</button>
                </div>
            );
        }
    }
}