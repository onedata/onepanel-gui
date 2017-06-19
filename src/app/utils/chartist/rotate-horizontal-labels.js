export default function () {
  return (chart) => {
    chart.on('created', () => {
      let labels = $(chart.container).find('.ct-labels .ct-label.ct-horizontal.ct-end').parent();
      labels.each((index, element) => {
        let label = $(element);
        let width = parseFloat(label.attr('width'));
        let rotateX = parseFloat(label.attr('x')) + width;
        let rotateParams = `-45 ${rotateX} ${label.attr('y')}`;
        let translateParams = `-${width / Math.SQRT2} -${width / Math.SQRT2}`;
        label.attr('transform', `rotate(${rotateParams}) translate(${translateParams})`);
      });
    });
  };
}
