/* tslint:disable:max-line-length */

namespace VC.App.Components {
    "use strict";

    export enum BoxLabelStyle {
        NotConnected = 0,
        Connected = 1,
        HandRaised = 2,
        NoIcon=3
    }

    interface IBoxLabelProps {
        text: string;
        style: BoxLabelStyle;
        className: string;
        labelClasses: Array<string>;
        visible: boolean;
    }
    interface IBoxLabelState {
        text: string;
        style: BoxLabelStyle;
        visible: boolean;
    }

    export class BoxLabel extends React.Component<IBoxLabelProps, IBoxLabelState> {
        private div: HTMLDivElement;

        constructor(props: IBoxLabelProps) {
            super(props);
            this.state = { text: props.text, style: props.style, visible: props.visible };
        }

        public setText(text: string, style: BoxLabelStyle): void {
            this.setState({ text: text, style: style } as IBoxLabelState);
        }

        public setStyle(style: BoxLabelStyle): void {
            this.setState({ text: this.state.text, style: style } as IBoxLabelState);
        }

        public setVisibility(visible: boolean): void {
            if (visible) {
                if (this.div.style.display === "none") {
                    this.div.style.display = "block";
                    this.state.visible = true;
                }
            } else {
                if (this.div.style.display === "block") {
                    this.div.style.display = "none";
                    this.state.visible = false;
                }
            }
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
                case BoxLabelStyle.NoIcon:
                    icon= "";
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
                <div className={this.props.className} ref={(ref: HTMLDivElement) => this.div = ref} style={{ display: (this.state.visible ? "block" : "none") }}>
                    <div className={className}><span className={icon}></span>{text}</div>
                </div>
            );
        }
    }
}