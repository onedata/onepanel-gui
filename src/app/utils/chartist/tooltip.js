const TOOLTIP_HTML =
  `
  <div class="chart-tooltip">
    <div class="chart-tooltip-title"></div>
    <ul class="ct-legend">
    </ul>
    <div class="chart-tooltip-arrow"></div>
  </div>
`;

export default function (options) {
  let defaultOptions = {
    chartType: 'bar',
    rangeInTitle: false,
    renderAboveBarDescription: false,
  };
  options = Chartist.extend({}, defaultOptions, options);

  return (chart) => {
    let tooltipNode,
      container = $(chart.container);

    chart.on('created', () => {
      tooltipNode = container.find('.chart-tooltip');
      if (tooltipNode.length === 0) {
        tooltipNode = $($.parseHTML(TOOLTIP_HTML));
        container.append(tooltipNode);
      } else {
        tooltipNode.removeClass('active');
      }
    });

    chart.on('draw', function (data) {
      if (data.type === 'bar' && options.chartType === 'bar') {
        let groupNode = $(data.group._node),
          barNode = $(data.element._node);
        let tooltipData = chart.data.series.map(s => ({
          className: s.className,
          name: s.name,
          value: s.data[data.index],
        }));
        barNode.mouseover(() => {
          let lastGroupNode = groupNode.parent().children().last();
          let lastGroupBar = $(lastGroupNode.children('line')[data.index]);

          // top position
          if (options.renderAboveBarDescription) {
            let sumLabel = $(lastGroupNode.children('text')[data.index]);
            tooltipNode.css('top', (sumLabel.offset().top - container.offset().top) +
              'px');
          } else {
            tooltipNode.css('top', (lastGroupBar.offset().top - container.offset()
              .top) + 'px');
          }
          // left position
          let rect = lastGroupBar[0].getBoundingClientRect();
          tooltipNode.css('left', (rect.left + rect.width / 2 - container.offset()
            .left) + 'px');

          // title
          let title = tooltipNode.find('.chart-tooltip-title');
          title.empty();
          title.append(chart.data.labels[data.index]);
          if (options.rangeInTitle) {
            if (chart.data.labels[data.index + 1]) {
              title.append(' - ' + chart.data.labels[data.index + 1]);
            }
            else if (chart.data.lastLabel) {
              title.append(' - ' + chart.data.lastLabel);
            }
          }

          // data series and values
          let ul = tooltipNode.find('.ct-legend');
          ul.empty();
          tooltipData.forEach(d => {
            ul.append(`<li class="${d.className}">${d.name}: ${d.value}</li>`);
          });

          tooltipNode.addClass('active');
        }).mouseout(() => {
          tooltipNode.removeClass('active');
        });
      }
    });
  };
}
