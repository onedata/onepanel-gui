/**
 * Plugin for Chartist which displays values sum above bars in bar charts.
 *
 * @module utils/chartist/bar-sum-labels
 * @author Michal Borzecki
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

export default function () {
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
}
