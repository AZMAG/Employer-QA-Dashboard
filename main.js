const years = ['2010', '2012', '2015', '2016', '2017', '2018', '2019'];

async function startUp() {
  setupDropdowns();
  setupKendoGrid();
  updateKendoGrid('County', '2019');
}

async function updateKendoGrid(field) {
  resetChart();
  kendo.ui.progress($('#grid'), true);
  const data = await getDataByGroupField(field);
  const dataSource = new kendo.data.DataSource({
    data,
    sort: {
      field: 'EmpSum',
      dir: 'desc',
    },
  });
  const grid = $('#grid').data('kendoGrid');
  grid.setDataSource(dataSource);
  kendo.ui.progress($('#grid'), false);
}
function resetChart() {
  try {
    $('#chart').data('kendoChart').destroy();
    $('#chart').empty();
    $('#chart').removeClass('k-chart');
    $('#btnRemoveChart').hide();
  } catch (error) {}
}

$('#btnRemoveChart').click(resetChart);

function getYearSumFields(type) {
  let fields = [];
  years.forEach((year) => {
    fields.push({
      field: 'BusSum' + year,
      title: 'Business ' + year,
      format: '{0:N0}',
      width: 150,
    });
    fields.push({
      field: 'EmpSum' + year,
      title: 'Employees ' + year,
      format: '{0:N0}',
      width: 150,
    });
  });
  if (type) {
    return fields.filter((row) => row.field.includes(type));
  }
  return fields;
}

function setupKendoGrid() {
  window.kendo.ui.progress($('#grid'), true);
  let yearFields = getYearSumFields();
  $('#grid').kendoGrid({
    height: 550,
    width: 1200,
    scrollable: {
      virtual: true,
    },
    change: function (e) {
      const [row] = this.select();
      const data = this.dataItem(row);
      const title = `${$('#field').data('kendoDropDownList').value()} - ${
        data.groupValue
      }`;
      setupKendoChart(data, title);
    },
    selectable: true,
    sortable: true,
    columns: [
      {
        field: 'groupValue',
        title: 'Grouped Value',
        width: 150,
        locked: true,
        lockable: false,
      },
      ...getYearSumFields(),
    ],
  });
}

function setupKendoChart(data, title) {
  $('#btnRemoveChart').show();
  let busData = years.map((year) => data['BusSum' + year]);
  let empData = years.map((year) => data['EmpSum' + year]);
  let bufferAxis = 0.1;
  let busMax = Math.max(...busData.filter((num) => num));
  let empMax = Math.max(...empData.filter((num) => num));
  console.log(busMax, empMax);

  let labels = $('#chart').kendoChart({
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
    series: [
      {
        name: 'Employees',
        data: empData,
        axis: 'emp',
        color: 'blue',
      },
      {
        name: 'Businesses',
        data: busData,
        axis: 'bus',
        color: 'red',
      },
    ],
    valueAxes: [
      {
        name: 'bus',
        color: 'blue',
        min: 0,
        max: busMax + busMax * bufferAxis,
        labels: {
          format: '{0:n0}',
        },
      },
      {
        name: 'emp',
        color: 'red',
        min: 0,
        max: empMax + empMax * bufferAxis,
        labels: {
          format: '{0:n0}',
        },
      },
    ],
    tooltip: {
      visible: true,
      shared: true,
      format: 'N0',
    },
    categoryAxis: {
      categories: years,
      majorGridLines: {
        visible: false,
      },
      labels: {
        rotation: 'auto',
      },
    },
  });
}

function dropdownChanged() {
  const field = $('#field').data('kendoDropDownList').value();
  updateKendoGrid(field, '2019');
}

function setupDropdowns() {
  $('#field').kendoDropDownList({ change: dropdownChanged });
}

$(document).ready(() => startUp());
