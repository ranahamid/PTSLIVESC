/* tslint:disable:max-line-length */

namespace VC.App.Components {
    "use strict";

    export enum BoxLabelStyle {
        NotConnected = 0,
        Connected = 1,
        HandRaised = 2
    }

    interface IBoxLabelProps {
        text: string;
        style: BoxLabelStyle;
        className: string;
        labelClasses: Array<string>;
        visible: boolean;
    }
    interface IBoxTitleState {
        text: string;
        style: BoxLabelStyle;
    }

    export class BoxLabel extends React.Component<IBoxLabelProps, IBoxTitleState> {
        private div: HTMLDivElement;

        constructor(props: IBoxLabelProps) {
            super(props);
            this.state = { text: props.text, style: props.style };
        }

        public setText(text: string, style: BoxLabelStyle): void {
            this.setState({ text: text, style: style });
        }

        public setStyle(style: BoxLabelStyle): void {
            this.setState({ text: this.state.text, style: style });
        }
        private getIconByStyle(style: BoxLabelStyle): string {
            let icon: string = "";
            switch (style) {
                case BoxLabelStyle.Connected:
                    icon = "glyphicon glyphicon-link";
                    break;
                case BoxLabelStyle.NotConnected:
                    icon = "glyphicon glyphicon-exclamation-sign";
                    break;
                case BoxLabelStyle.HandRaised:
                    icon = "glyphicon glyphicon-hand-up";
                    break;
            }
            return icon;
        }

        public getParentDiv(): HTMLDivElement {
            return this.div;
        }

        render(): JSX.Element {
            let className: string = this.props.labelClasses[this.state.style];
            let text: string = this.state.text;
            let icon: string = this.getIconByStyle(this.state.style);
            if (icon !== "") {
                text = " " + text;
            }
            return (
                <div className={this.props.className} ref={(ref: HTMLDivElement) => this.div = ref} style={{ display: (this.props.visible ? "block" : "none") }}>
                    <div className={className}><span className={icon}></span>{text}</div>
                </div>
            );
        }
    }
}