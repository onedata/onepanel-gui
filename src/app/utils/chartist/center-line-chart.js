export default function () {
  return (chart) => {
    chart.on('created', function () {
      let series = $(chart.svg._node).find('.ct-series');
      let points = series.first().find('.ct-point');
      let deltaX = $(points[1]).attr('x1') - points.first().attr('x1');
      series.attr('transform', `translate(${deltaX / 2})`);
    });
  };
}
