export default function () {
  return (chart) => {
    chart.on('data', () => {
      let legendNodes = $(chart.container).find('.ct-legend li');
      $(legendNodes[0]).click().click();
    });
  };
}
