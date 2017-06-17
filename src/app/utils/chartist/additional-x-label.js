export default function (options) {
  let defaultOptions = {
    xOffsetMultiply: 1,
  };
  options = Chartist.extend({}, defaultOptions, options);
  return (chart) => {
    chart.on('created', () => {
      let labelsNode = $(chart.svg._node).find('.ct-labels');
      let labels = labelsNode.find('.ct-label.ct-horizontal.ct-end');
      let lastLabelNode = labelsNode.find('.ct-label.ct-horizontal.ct-end').last().parent();
      let sourceLabelNode = lastLabelNode;
      if (labels.length > 1) {
        sourceLabelNode = $(labels[labels.length - 2]).parent();
      }

      let newLabelNode = sourceLabelNode.clone();
      newLabelNode.attr('x',
        parseFloat(lastLabelNode.attr('x')) + options.xOffsetMultiply * parseFloat(
          sourceLabelNode.attr('width'))
      );
      newLabelNode.find('span').text(chart.data.lastLabel);
      labelsNode.append(newLabelNode);
    });
  };
}
