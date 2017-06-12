export default function () {
  return (chart) => {
    chart.on('draw', (data) => {
      if (data.type === 'bar') {
        data.element.attr({
          style: `stroke-width: ${100 / (chart.data.series[0].data.length + 1)}%`,
        });
      }
    });
  };
}
