/* tslint:disable:max-line-length */

namespace VC.App.Components {
    "use strict";

    interface IVolumeProps {
        volume: number;
        display: boolean;
        onVolumeChanged: (volume: number) => void;
    }
    interface IVolumeState {
        volume: number;
    }

    export class Volume extends React.Component<IVolumeProps, IVolumeState> {
        private progressBar: HTMLDivElement;

        constructor(props: IVolumeProps) {
            super(props);
            this.state = { volume: this.props.volume } as IVolumeState;
        }

        private setVolume(volume: number): void {
            if (this.state.volume !== volume) {
                this.setState({ volume: volume } as IVolumeState);
                this.props.onVolumeChanged(volume);
            }
        }

        public resetVolume(volume: number): void {
            // same as set Volume, just without callback
            if (this.state.volume !== volume) {
                this.setState({ volume: volume } as IVolumeState);
            }
        }

        private increaseVolume(): void {
            let v: number = this.state.volume;
            if (v < 100) {
                v += 10;
            }
            if (v > 100) {
                v = 100;
            }
            this.setVolume(v);
        }
        private decreaseVolume(): void {
            let v: number = this.state.volume;
            if (v > 0) {
                v -= 10;
            }
            if (v < 0) {
                v = 0;
            }
            this.setVolume(v);
        }
        private barClick(event: MouseEvent): void {
            let e: any = event || window.event;
            if (window.event !== null && e.button === 1 || e.button === 0) {
                let clickX: number = e.clientX - $(this.progressBar).offset().left;
                let pbW: number = $(this.progressBar).width();
                let volume: number = 0;
                if (clickX > 0) {
                    volume = Math.round(clickX / (pbW / 10)) * 10;
                }
                if (volume > 100) {
                    volume = 100;
                }
                this.setVolume(volume);
            }
        }

        render(): JSX.Element {
            return (
                <div className="cVolume" style={{ display: this.props.display ? "block" : "none" }}>
                    <table>
                        <tbody>
                            <tr>
                                <td className="tbBtn" style={{ borderTop: "0px" }}><button type="button" disabled={this.state.volume === 0} className={this.state.volume > 0 ? "btn btn-xs btn-info" : "btn btn-xs btn-danger"} onClick={() => this.decreaseVolume() }><span className={this.state.volume > 0 ? "glyphicon glyphicon-volume-down" : "glyphicon glyphicon-volume-off"}></span></button></td>
                                <td className="tbVol" style={{ borderTop: "0px" }}>
                                    <div ref={(ref: HTMLDivElement) => this.progressBar = ref} className="progress progressBar" onClick={(e: MouseEvent) => this.barClick(e) }>
                                        <div className="progress-bar progress-bar-success progressBarInner" role="progressbar" style={{ width: this.state.volume + "%" }}>{this.state.volume}%</div>
                                    </div>
                                </td >
                                <td className="tbBtn" style={{ borderTop: "0px" }}>
                                    <button type="button" disabled={this.state.volume === 100} className={this.state.volume < 100 ? "btn btn-xs btn-info" : "btn btn-xs btn-success"} onClick={() => this.increaseVolume() }><span className="glyphicon glyphicon-volume-up"></span></button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            );
        }
    }
}