function setupAttrAnalysis() {
  $('#analysisArea').html(`
    <div style="text-align: center;">
        <div class="row" style="text-align: center;">
            <div style="display: none;" class="col-12 autoCompleteContainer">
                <h6><label for="autoComplete">Start typing an employer name:</label></h6>
                <input type="text" id="autoComplete" style="width: 100%;" />
            </div>
            <div class="col-6 attributeSelectors">
                <label for="field">Group by area field:</label>
                <br />
                <select id="field1"></select>
            </div>
            <div class="col-6 attributeSelectors">
                <label for="field2">Group by secondary attribute field:</label>
                <br />
                <select id="field2"></select>
            </div>
        </div>
        <br />
        <div class="reportOutsideContainer">
            <div id="loadingSpinner" style="display: none;" class="spinner-border" role="status">
                <span class="sr-only">Loading...</span>
            </div>
            <div id="empAttrResultsContainer" style="display:none;">
            <div class="row" style="text-align: center;">
                <div class="col-12">
                    <label for="yearCheckboxForm">Employer DB Years to include in analysis: </label>
                    <form id='yearCheckboxForm'></form>
                </div>
            </div>
            <div class="reportBoxContainer">
                  <div class="card reportBox" id="chartContainer" style="display: none;">
                    <div id="chart"></div>
                    <button id='btnRemoveChart' class='btn btn-sm btn-primary'>Remove Chart</button>
                  </div>
                  <div class="card reportBox">
                    <div class="card-header">
                    </div>
                    <div class="card-body">
                      <div class="chart-container">
                          <form id='empSizeCheckboxForm'></form>
                          <div id="empSizeChart"></div>
                        <div id="grid"></div>
                      </div>
                    </div>
                    <div class="card-footer">
                      <span class="note">*Note: Click any of the above rows to see line chart.</span> <br />
                      <span class="note">*Note2: Pinal County data started in 2016</span>
                    </div>
                  </div>
                </div>
              </div>
        </div>
    </div>
  
  `);
  setupDropdowns();
  setupKendoGrid();
  setupYearCheckboxes();
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
const areaOptions = [
  { value: 'County', label: 'County' },
  { value: 'Jurisdiction', label: 'Jurisdiction' },
  { value: 'Zip', label: 'Zip Code' },
  { value: 'Region', label: 'Region' },
  { value: 'SUBREGION', label: 'Sub Region' },
];

const attributeOptions = [
  { value: 'Naics2', label: 'Naics2' },
  { value: 'Naics6', label: 'Naics6' },
  { value: 'Cluster', label: 'Cluster' },
  { value: 'SubCluster', label: 'SubCluster' },
];

function dropdownChanged() {
  const field1 = $('#field1').data('kendoDropDownList').value();
  const field2 = $('#field2').data('kendoDropDownList').value();
  if (field1 && field1 !== '') {
    $('#empAttrResultsContainer').show();
  } else {
    $('#empAttrResultsContainer').hide();
  }
  updateKendoGrid(field1, field2);
}

function setupDropdowns() {
  $('#field1').kendoDropDownList({
    dataSource: areaOptions,
    optionLabel: 'Select a primary field',
    change: dropdownChanged,
    dataTextField: 'label',
    dataValueField: 'value',
  });
  $('#field2').kendoDropDownList({
    dataSource: attributeOptions,
    optionLabel: 'Select a second field',
    change: dropdownChanged,
    dataTextField: 'label',
    dataValueField: 'value',
  });
}

function setupKendoGrid() {
  window.kendo.ui.progress($('#grid'), true);
  let yearFields = getYearSumFields();
  $('#grid').kendoGrid({
    // width: '1200px',
    height: '500px',

    scrollable: {
      virtual: true,
    },
    change: kendoGridChange,
    selectable: true,
    sortable: true,
    filterable: true,
    searchable: true,
    columns: [
      {
        field: 'groupValue',
        title: 'Grouped Value',
        filterable: true,
        width: 150,
        lockable: false,
        headerAttributes: {
          style: 'font-weight: 600;',
        },
      },
      ...getYearSumFields(),
    ],
  });
}
function clearGridSelection() {
  const grid = $('#grid').data('kendoGrid');
  grid.clearSelection();
}

function kendoGridChange() {
  const grid = $('#grid').data('kendoGrid');
  const data = grid.dataItem(grid.select());

  if (data) {
    $('#chartContainer').show();
    $('#btnRemoveChart').show();
    grid.resize();
    const title = `${$('#field1').data('kendoDropDownList').value()} - ${
      data.groupValue
    }`;

    let busData = [2010, 2012, 2015, 2016, 2017, 2018, 2019].map(
      (year) => data['BusSum' + year]
    );
    let empData = [2010, 2012, 2015, 2016, 2017, 2018, 2019].map(
      (year) => data['EmpSum' + year]
    );
    let busMax = Math.max(...busData.filter((num) => num));
    let empMax = Math.max(...empData.filter((num) => num));

    setupKendoLineChart({
      selector: '#chart',
      empMax,
      busMax,
      empData,
      busData,
      title,
      chartYears: [2010, 2012, 2015, 2016, 2017, 2018, 2019],
    });
  }
}
function resetChart() {
  try {
    $('#chart').data('kendoChart').destroy();
    $('#chart').empty();
    $('#chart').removeClass('k-chart');
    $('#btnRemoveChart').hide();
    $('#chartContainer').hide();
    const grid = $('#grid').data('kendoGrid');
    grid.resize();
    clearGridSelection();
  } catch (error) {}
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
        // locked: true,
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
let detailData;

function detailInit(e) {
  let filteredData = detailData.filter(
    (row) => row.groupValue1 === e.data.groupValue
  );
  $('<div/>')
    .appendTo(e.detailCell)
    .kendoGrid({
      dataSource: filteredData,
      scrollable: true,
      height: '400px',
      sortable: true,
      pageable: false,
      columns: [
        { field: 'groupValue2', width: '310px' },
        ...getYearSumFields(),
      ],
    });
}

function addPctChangeFields(data) {
  return data.map((row) => {
    let keys = Object.keys(row)
      .filter((key) => key.includes('EmpSum'))
      .map((key) => key.slice(-4))
      .sort();
    keys.forEach((key, i) => {
      if (i !== 0) {
        let previousEmps = row['EmpSum' + keys[i - 1]];
        let previousBus = row['BusSum' + keys[i - 1]];
        let currentEmps = row['EmpSum' + key];
        let currentBus = row['BusSum' + key];
        let empDifference = currentEmps - previousEmps;
        let busDifference = currentBus - previousBus;
        let empPctChange = empDifference / previousEmps;
        let busPctChange = busDifference / previousBus;

        // console.log({
        //   year: key,
        //   keys,
        //   row,
        //   previousEmps,
        //   previousBus,
        //   currentEmps,
        //   currentBus,
        //   empDifference,
        //   busDifference,
        //   empPctChange,
        //   busPctChange,
        // });

        row['EmpPctChange' + key] = empPctChange;
        row['BusPctChange' + key] = busPctChange;
      }
    });
    return row;
  });
}

async function updateKendoGrid(field1, field2) {
  resetChart();
  kendo.ui.progress($('#grid'), true);
  let data;
  const grid = $('#grid').data('kendoGrid');

  if (field2 && field2 !== '') {
    let { topLevelGridData, detailRowData } = await getDataByGroupFields(
      field1,
      field2
    );
    data = topLevelGridData;
    detailData = detailRowData;

    grid.setOptions({
      detailInit,
    });
  } else {
    data = await getDataByGroupField(field1);
    data = addPctChangeFields(data);
    grid.setOptions({
      detailInit: null,
    });
  }

  const dataSource = new kendo.data.DataSource({
    data,
    sort: {
      field: 'EmpSum',
      dir: 'desc',
    },
  });

  grid.setDataSource(dataSource);

  updateColumns(grid);
  kendo.ui.progress($('#grid'), false);
}

function getYearSumFields(type) {
  let fields = [];
  years.forEach((year, i) => {
    if (!filteredYears.includes(year)) {
      fields.push({
        field: 'BusSum' + year,
        title: 'Business ' + year,
        format: '{0:N0}',
        width: 200,
        attributes: {
          style: 'font-weight: 600; border: 1px solid gray;',
        },
        headerAttributes: {
          style: 'font-weight: 600;',
        },
      });
      fields.push({
        field: 'EmpSum' + year,
        title: 'Employees ' + year,
        format: '{0:N0}',
        width: 200,
        attributes: {
          style: 'font-weight: 600; border: 1px solid gray;',
        },
        headerAttributes: {
          style: 'font-weight: 600;',
        },
      });
      if (i !== 0) {
        fields.push({
          field: 'EmpPctChange' + year,
          title: 'Emp % Change ' + year,
          format: '{0:P1}',
          width: 200,
          attributes: {
            style: 'font-weight: 600; border: 1px solid gray;',
          },
          headerAttributes: {
            style: 'font-weight: 600;',
          },
        });
        fields.push({
          field: 'BusPctChange' + year,
          title: 'Bus % Change ' + year,
          format: '{0:P1}',
          width: 200,
          attributes: {
            style: 'font-weight: 600; border: 1px solid gray;',
          },
          headerAttributes: {
            style: 'font-weight: 600;',
          },
        });
      }
    }
  });
  if (type) {
    return fields.filter((row) => row.field.includes(type));
  }
  return fields;
}
$('body').on('click', '#btnRemoveChart', resetChart);
// $('#btnRemoveChart').click(resetChart);
