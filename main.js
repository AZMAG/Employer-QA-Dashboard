const years = ['2010', '2012', '2015', '2016', '2017', '2018', '2019'];
let filteredYears = [];

async function startUp() {
  setupDropdowns();
  setupYearCheckboxes();
  setupKendoGrid();
  updateKendoGrid('County', '2019');
}
function updateColumns() {
  const grid = $('#grid').data('kendoGrid');
  const select = grid.dataItem(grid.select());
  grid.setOptions({
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
  if (select) {
    let selectRow = grid.tbody.find("tr[data-uid='" + select.uid + "']");
    grid.select(selectRow);
  }
  kendoGridChange();
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
  updateColumns(grid);
  //update selected row

  kendo.ui.progress($('#grid'), false);
}

function resetChart() {
  try {
    $('#chart').data('kendoChart').destroy();
    $('#chart').empty();
    $('#chart').removeClass('k-chart');
    $('#btnRemoveChart').hide();
    clearGridSelection();
  } catch (error) {}
}

$('#btnRemoveChart').click(resetChart);

function getYearSumFields(type) {
  let fields = [];
  years.forEach((year) => {
    if (!filteredYears.includes(year)) {
      fields.push({
        field: 'BusSum' + year,
        title: 'Business ' + year,
        format: '{0:N0}',
        width: 150,
        attributes: {
          style:
            'background-color: rgb(173, 204, 230); font-weight: 600; border: 1px solide black;',
        },
        headerAttributes: {
          style: 'font-weight: 600;',
        },
      });
      fields.push({
        field: 'EmpSum' + year,
        title: 'Employees ' + year,
        format: '{0:N0}',
        width: 150,
        attributes: {
          style: 'background-color: rgb(255,204,204); font-weight: 600;',
        },
        headerAttributes: {
          style: 'font-weight: 600;',
        },
      });
    }
  });
  if (type) {
    return fields.filter((row) => row.field.includes(type));
  }
  return fields;
}

function clearGridSelection() {
  const grid = $('#grid').data('kendoGrid');
  grid.clearSelection();
}

function kendoGridChange() {
  const grid = $('#grid').data('kendoGrid');
  const data = grid.dataItem(grid.select());

  if (data) {
    const title = `${$('#field').data('kendoDropDownList').value()} - ${
      data.groupValue
    }`;

    setupKendoChart(data, title);
  }
}

function setupKendoGrid() {
  window.kendo.ui.progress($('#grid'), true);
  let yearFields = getYearSumFields();
  $('#grid').kendoGrid({
    width: 1200,
    maxHeight: 500,
    scrollable: {
      virtual: true,
    },
    change: kendoGridChange,
    selectable: true,
    sortable: true,
    columns: [
      {
        field: 'groupValue',
        title: 'Grouped Value',
        width: 150,
        locked: true,
        lockable: false,
        headerAttributes: {
          style: 'font-weight: 600;',
        },
      },
      ...getYearSumFields(),
    ],
  });
}

function setupKendoChart(data, title) {
  $('#btnRemoveChart').show();
  let chartYears = years.filter((year) => !filteredYears.includes(year));
  let busData = chartYears.map((year) => data['BusSum' + year]);
  let empData = chartYears.map((year) => data['EmpSum' + year]);
  let bufferAxis = 0.1;
  let busMax = Math.max(...busData.filter((num) => num));
  let empMax = Math.max(...empData.filter((num) => num));

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

function dropdownChanged() {
  const field = $('#field').data('kendoDropDownList').value();
  updateKendoGrid(field, '2019');
}

function setupDropdowns() {
  $('#field').kendoDropDownList({ change: dropdownChanged });
}

function checkboxChanged(e) {
  let checked = $(e.currentTarget).is(':checked');
  let val = $(e.currentTarget).data('year') + '';
  if (!checked) {
    filteredYears.push(val);
  } else {
    filteredYears = filteredYears.filter((year) => year !== val);
  }
  updateColumns();
}

function setupYearCheckboxes() {
  let yearList = years.map((year) => {
    return `
      <div class="form-check form-check-inline">
        <input class="form-check-input yearCbox" data-year="${year}" type="checkbox" id="yearCbox${year}" checked>
        <label class="form-check-label" for="yearCbox${year}">${year}</label>
      </div>
    `;
  });
  $('#yearCheckboxForm').html(yearList.join(''));
  $('.yearCbox').change(checkboxChanged);
}

$(document).ready(() => startUp());
