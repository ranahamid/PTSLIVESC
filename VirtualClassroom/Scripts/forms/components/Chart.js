var VC;
(function (VC) {
    var Forms;
    (function (Forms) {
        var Components;
        (function (Components) {
            "use strict";
            class Chart extends React.Component {
                constructor(props) {
                    super(props);
                }
                show(dataPoints) {
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
                update(dataPoints) {
                    this.chart.options.data[0].dataPoints = dataPoints;
                    this.chart.render();
                    $(".canvasjs-chart-credit").hide();
                }
                render() {
                    return (React.createElement("div", {id: this.props.id, style: { width: this.props.width, height: this.props.height }}));
                }
            }
            Components.Chart = Chart;
        })(Components = Forms.Components || (Forms.Components = {}));
    })(Forms = VC.Forms || (VC.Forms = {}));
})(VC || (VC = {}));
//# sourceMappingURL=Chart.js.map