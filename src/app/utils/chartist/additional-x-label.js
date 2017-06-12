export default function () {
  return (chart) => {
    chart.on('created', () => {
      let labelsNode = $(chart.svg._node).find('.ct-labels');
      let lastLabelNode = labelsNode.find('.ct-label.ct-horizontal.ct-end').last().parent();
      let widthSourceNode = lastLabelNode.prev().length ? lastLabelNode.prev() : lastLabelNode;
      lastLabelNode = lastLabelNode.clone();
      lastLabelNode.attr('x',
        parseFloat(lastLabelNode.attr('x')) + parseFloat(widthSourceNode.attr('width'))
      );
      lastLabelNode.find('span').text(chart.data.lastLabel);
      labelsNode.append(lastLabelNode);
    });
  };
}
