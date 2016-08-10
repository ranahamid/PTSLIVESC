/* tslint:disable:max-line-length */

namespace VC.App.Components {
    "use strict";

    export enum StatusStyle {
        Connecting = 0,
        Connected = 1,
        Error = 2,
    }

    interface IStatusProps {
        text: string;
        style: StatusStyle;
        className: string;
        statusClasses: Array<string>;
    }
    interface IStatusState {
        text: string;
        style: StatusStyle;
    }

    export class Status extends React.Component<IStatusProps, IStatusState> {
        constructor(props: IStatusProps) {
            super(props);
            this.state = { text: props.text, style: props.style } as IStatusState;
        }

        public setText(text: string, style: StatusStyle): void {
            this.setState({ text: text, style: style } as IStatusState);
        }

        private getIconByStyle(style: StatusStyle): string {
            let icon: string = "";
            switch (style) {
                case StatusStyle.Connecting:
                    icon = "glyphicon glyphicon-transfer";
                    break;
                case StatusStyle.Connected:
                    icon = "glyphicon glyphicon-link";
                    break;
                case StatusStyle.Error:
                    icon = "glyphicon glyphicon-warning-sign";
                    break;
            }
            return icon;
        }

        render(): JSX.Element {
            let className: string = this.props.statusClasses[this.state.style];
            let text: string = this.state.text;
            let icon: string = this.getIconByStyle(this.state.style);
            if (icon !== "") {
                text = " " + text;
            }
            return (
                <div className={this.props.className}>
                    <div className={className}><span className={icon}></span>{text}</div>
                </div>
            );
        }
    }
}