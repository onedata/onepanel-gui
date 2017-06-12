import Ember from 'ember';

const {
  computed,
} = Ember;

export default Ember.Component.extend({
  /**
   * To inject.
   * @type {Array.Onepanel.TimeStats}
   */
  timeStats: null,

  chartOptions: null,

  chartLabels: ['Insert', 'Update', 'Delete'],

  chartData: computed('timeStats.@each.values.[]', 'chartLabels', function () {
    let {
      timeStats,
      chartLabels,
    } = this.getProperties('timeStats', 'chartLabels');
    if (timeStats) {
      return {
        labels: Array.apply(null, { length: timeStats[1].values.length + 1 })
          .map(Number.call, Number).map(n => `${n}:00`),
        series: timeStats.slice(1).map((stat, index) => {
          return {
            name: chartLabels[index],
            data: stat.values,
            className: `ct-series-${index}`
          };
        })
      };
    } else {
      return [];
    }
  }),

  init() {
    this._super(...arguments);

    let maximizeBarWidth = () => {
      return (chart) => {
        chart.on('draw', (data) => {
          if (data.type === 'bar') {
            data.element.attr({
              style: `stroke-width: ${100 / chart.data.series[0].data.length}%`,
            });
          }
        });
      };
    };

    let barSumLabels = () => {
      return (chart) => {
        chart.on('draw', (data) => {
          if (data.type === 'bar') {
            if (data.seriesIndex === chart.data.series.length - 1) {
              let sum = chart.data.series.map(s => s.data[data.index])
                .reduce((prev, next) => prev + next, 0);
              data.group.elem('text', {
                x: data.x1,
                y: data.y2,
              }, 'ct-bar-sum').text(sum);
            }
          }
        });
      };
    };

    let refreshLegendFilter = () => {
      let ignoreCounter = 0;
      return (chart) => {
        chart.on('data', () => {
          let legendNodes = $(chart.container).find('.ct-legend li');
          ignoreCounter = 10;
          $(legendNodes[0]).click();
          $(legendNodes[0]).click();
        });
      };
    };

    let tooltip = (options) => {
      let tooltipHtml =
        `
        <div class="chart-tooltip">
          <div class="chart-tooltip-title"></div>
          <ul class="ct-legend">
          </ul>
          <div class="chart-tooltip-arrow"></div>
        </div>
      `;
      let defaultOptions = {
        chartType: 'bar',
        rangeInTitle: false,
        aboveDescription: false,
      };
      options = Chartist.extend({}, defaultOptions, options);

      return (chart) => {
        let tooltipNode,
          container = $(chart.container);

        chart.on('created', () => {
          tooltipNode = container.find('.chart-tooltip');
          if (tooltipNode.length === 0) {
            tooltipNode = $($.parseHTML(tooltipHtml));
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
              if (options.aboveDescription) {
                let sumLabel = $(lastGroupNode.children('text')[data.index]);
                tooltipNode.css('top', (sumLabel.offset().top - container.offset()
                  .top) + 'px');
              } else {
                tooltipNode.css('top', (lastGroupBar.offset().top -
                  container.offset().top) + 'px');
              }
              // left position
              let rect = lastGroupBar[0].getBoundingClientRect();
              tooltipNode.css('left', (rect.left + rect.width / 2 -
                container.offset().left) + 'px');

              // title
              let title = tooltipNode.find('.chart-tooltip-title');
              title.empty();
              title.append(chart.data.labels[data.index]);
              if (options.rangeInTitle) {
                title.append(' - ' + chart.data.labels[data.index + 1]);
              }

              // data series and values
              let ul = tooltipNode.find('.ct-legend');
              ul.empty();
              tooltipData.forEach(d => {
                ul.append(
                  `<li class="${d.className}">${d.name}: ${d.value}</li>`
                );
              });

              tooltipNode.addClass('active');
            }).mouseout(() => {
              tooltipNode.removeClass('active');
            });
          }
        });
      };
    };

    let axisLabels = (options) => {
      let defaultOptions = {
        xLabel: '',
        yLabel: '',
      };
      options = Chartist.extend({}, defaultOptions, options);

      return (chart) => {
        chart.on('created', function () {
          let svgNode = $(chart.svg._node);
          let axisLabelsGroup = chart.svg.elem('g', {}, 'ct-axis-labels');
          axisLabelsGroup.elem('text', {
            x: -svgNode.innerHeight() / 2 + 15,
            y: 20,
          }, 'ct-axis-y-label').text(options.yLabel);
          axisLabelsGroup.elem('text', {
            x: svgNode.innerWidth() / 2,
            y: svgNode.innerHeight() - 5,
          }, 'ct-axis-x-label').text(options.xLabel);
        });
      };
    };

    this.set('chartOptions', {
      stackBars: true,
      chartPadding: 15,
      plugins: [
        maximizeBarWidth(),
        barSumLabels(),
        tooltip({
          chartType: 'bar',
          rangeInTitle: true,
          aboveDescription: true,
        }),
        axisLabels({
          xLabel: 'time',
          yLabel: 'operations/s',
        }),
        Chartist.plugins.legend(),
        refreshLegendFilter()
      ]
    });
  },
});
