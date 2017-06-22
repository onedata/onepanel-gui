export default function (options) {
  return (chart) => {
    let defaultOptions = {
      height: 6,
    };
    options = Chartist.extend({}, defaultOptions, options);

    chart.on('created', () => {
      let gridLines = $(chart.container).find('.ct-grid.ct-horizontal');
      let oldY2 = parseFloat(gridLines.first().attr('y2'));
      gridLines.each((index, element) => {
        $(element).attr('y1', oldY2 - options.height / 2);
        $(element).attr('y2', oldY2 + options.height / 2);
      });
    });
  };
}
