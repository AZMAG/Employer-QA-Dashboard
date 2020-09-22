const years = ['2010', '2012', '2015', '2016', '2017', '2018', '2019'];

async function startUp() {
  setupDropdowns();
  setupKendoGrid();
  updateKendoGrid('County', '2019');
}

async function updateKendoGrid(field) {
  window.kendo.ui.progress($('#grid'), true);
  const data = await getDataByGroupField(field);
  console.log(data);
  const dataSource = new kendo.data.DataSource({
    data,
    sort: {
      field: 'EmpSum',
      dir: 'desc',
    },
  });
  const grid = $('#grid').data('kendoGrid');
  grid.setDataSource(dataSource);
  window.kendo.ui.progress($('#grid'), false);
}

function getYearSumFields() {
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

function dropdownChanged() {
  const field = $('#field').data('kendoDropDownList').value();
  updateKendoGrid(field, '2019');
}

function setupDropdowns() {
  $('#field').kendoDropDownList({ change: dropdownChanged });
}

$(document).ready(() => startUp());
