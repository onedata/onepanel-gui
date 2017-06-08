import Ember from 'ember';

export default Ember.Component.extend({
  /**
   * To inject.
   * @type {ProviderSpaceSyncStats}
   */
  syncStats: null,

  chartData: null,

  chartOptions: null,

  init() {
    this._super(...arguments);
    let syncStats = this.get('syncStats');
    let labels = ['Insert', 'Update', 'Delete'];
    this.set('chartData', {
      labels: Array.apply(null, {length: 25}).map(Number.call, Number).map(n => `${n}:00`),
      series: syncStats.stats.slice(1).map((stat, index) => {
        return { 
          name: labels[index],
          data: stat.values,
          className: `ct-series-${index}`
        };
      })
    });

    let cPlugin = function () {
      return function ctPointLabels(chart) {
          let tooltipNode;
          let container = $(chart.container);
          chart.on('created', function() {
            tooltipNode = container.find('.chart-tooltip');
            if (tooltipNode.length === 0) {
              let tooltipHtml = `
                <div class="chart-tooltip">
                  <ul class="ct-legend">
                  </ul>
                  <div class="chart-tooltip-arrow"></div>
                </div>
              `;
              tooltipNode = $($.parseHTML(tooltipHtml));
              $(chart.container).append(tooltipNode);
            }
            else {
              tooltipNode.removeClass('active');
            }

            let svgNode = $(chart.svg._node);
            let axisLabelsGroup = chart.svg.elem('g', {}, 'ct-axis-labels');
            axisLabelsGroup.elem('text', {
              x: -svgNode.innerHeight() / 2 + 15,
              y: 20,
              style: 'text-anchor: middle; transform: rotate(-90deg)'
            }, 'ct-axis-y-label').text("operations/s");
            axisLabelsGroup.elem('text', {
              x: svgNode.innerWidth() / 2,
              y: svgNode.innerHeight() - 5,
              style: 'text-anchor: middle'
            }, 'ct-axis-x-label').text("time");
          });
          
          chart.on('draw', function(data) {
            if(data.type === 'bar') {
              data.element.attr({
                style: `stroke-width: ${100 / syncStats.stats[1].values.length}%`
              });
              if (data.seriesIndex === chart.data.series.length - 1) {
                let sum = chart.data.series.map(series => series.data[data.index]).reduce((p, n) => p + n, 0);
                data.group.elem('text', {
                  x: data.x1,
                  y: data.y2,
                  style: 'text-anchor: middle'
                }, 'ct-bar-sum').text(sum);
                
              }
              let groupNode = $(data.group._node);
              let element = $(data.element._node);
              element.mouseover(() => {
                let lastGroupNode = groupNode.parent().children().last();
                let lastGroupBar = $(lastGroupNode.children('line')[data.index]);
                let sumLabel = $(lastGroupNode.children('text')[data.index]);
                tooltipNode.css('top', (sumLabel.offset().top - container.offset().top) + 'px');
                tooltipNode.css('left', (lastGroupBar.offset().left - container.offset().left) + 'px');
                tooltipNode.addClass('active');
                let ul = tooltipNode.find('ul');
                ul.empty();
                chart.data.series.forEach(s => {
                  tooltipNode.find('ul').append(`<li class="${s.className}">${s.name}: ${s.data[data.index]}</li>`);
                });
              });
              element.mouseout(() => {
                tooltipNode.removeClass('active');
              });
            }
          });
      };
    };

    this.set('chartOptions', {
      stackBars: true,
      chartPadding: 15,
      plugins: [
        cPlugin(),
        Chartist.plugins.legend()
      ]
    });
  },

});
