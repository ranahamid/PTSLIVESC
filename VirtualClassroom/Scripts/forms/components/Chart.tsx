namespace VC.Forms.Components {
    "use strict";

    export interface IChartDataPoint {
        label: string;
        y: number;
        cnt: number;
    }

    interface IChartProps {
        id: string;
        width: string;
        height: string;
    }
    interface IChartState {
        dataPoints: Array<IChartDataPoint>;
    }

    export class Chart extends React.Component<IChartProps, IChartState> {
        private chart: CanvasJS.Chart;

        constructor(props: IChartProps) {
            super(props);
        }

        public show(dataPoints: Array<IChartDataPoint>): void {
            this.chart = new CanvasJS.Chart(this.props.id, {
                title: {
                    text: ""
                },
                legend: {
                    verticalAlign: "bottom",
                    horizontalAlign: "center"
                },
                exportEnabled: false,
                animationEnabled: false,
                data: [
                    {
                        type: "pie",
                        showInLegend: false,
                        indexLabel: "{label} {y}% ({cnt})",
                        toolTipContent: "{label}: <strong>{y}%</strong> ({cnt})",
                        dataPoints: dataPoints
                    }
                ]
            });
            this.chart.render();
            $(".canvasjs-chart-credit").hide();
        }
        public update(dataPoints: Array<IChartDataPoint>): void {
            this.chart.options.data[0].dataPoints = dataPoints;
            this.chart.render();
            $(".canvasjs-chart-credit").hide();
        }

        render(): JSX.Element {
            return (
                <div id={this.props.id} style={{ width: this.props.width, height: this.props.height }}></div>
            );
        }
    }
}