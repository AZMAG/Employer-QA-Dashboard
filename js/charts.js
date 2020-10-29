function setupKendoLineChart({
  selector,
  empMax,
  busMax,
  empData,
  busData,
  title,
  chartYears,
}) {
  let bufferAxis = 0.1;

  let series = [
    {
      name: 'Employees',
      data: empData,
      axis: 'emp',
      color: 'red',
    },
    {
      name: 'Number of Locations',
      data: busData,
      axis: 'bus',
      color: 'blue',
    },
  ];

  let valueAxes = [
    {
      name: 'emp',
      color: 'red',
      min: 0,
      max: empMax + empMax * bufferAxis,
      labels: {
        format: '{0:n0}',
      },
    },
    {
      name: 'bus',
      color: 'blue',
      min: 0,
      max: busMax + busMax * bufferAxis,
      labels: {
        format: '{0:n0}',
      },
    },
  ];

  if (busMax <= 1) {
    series.pop();
    valueAxes.pop();
  }

  let labels = $(selector).kendoChart({
    title: {
      text: title,
    },
    legend: {
      position: 'bottom',
    },
    chartArea: {
      background: '',
    },
    seriesDefaults: {
      type: 'line',
      style: 'smooth',
      missingValues: 'gap',
    },
    series,
    valueAxes,
    tooltip: {
      visible: true,
      shared: true,
      format: 'N0',
    },
    categoryAxis: {
      categories: chartYears,
      majorGridLines: {
        visible: false,
      },
      labels: {
        rotation: 'auto',
      },
    },
  });
}
