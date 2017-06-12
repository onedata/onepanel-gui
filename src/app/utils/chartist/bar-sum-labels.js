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
