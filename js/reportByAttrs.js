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
                <br />
                <div class="row">
                    <div class="col-12" id="chartContainer">
                        <button id='btnRemoveChart' class='btn btn-sm btn-primary'>Remove Chart</button>
                        <br />
                        <br />
                        <div id="chart"></div>
                    </div>
                    <div id="gridContainer">
                        <h6 id="gridTitle">Click on any of the rows below to show line chart</h6>
                        <br />
                        <div id="grid"></div>
                    </div>
              </div>
              </div>
        </div>
    </div>
  
  `);
  setupDropdowns();
  setupKendoGrid();
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
  { value: 'REGION90', label: 'Region' },
  { value: 'SUBREGION', label: 'Sub Region' },
];

const attributeOptions = [
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
    width: '1200px',
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
        locked: true,
        // lockable: false,
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
  // console.log(detailData);
  // console.log(e.detailCell);
  // console.log(e.data);
  // e.detailCell

  let filteredData = detailData.filter(
    (row) => row.parent === e.data.groupValue
  );
  console.log(detailData);
  $('<div/>')
    .appendTo(e.detailCell)
    .kendoGrid({
      dataSource: detailData,
      scrollable: false,
      sortable: true,
      pageable: true,
      columns: [{ field: 'groupValue', width: '110px' }, ...getYearSumFields()],
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
  years.forEach((year) => {
    if (!filteredYears.includes(year)) {
      fields.push({
        field: 'BusSum' + year,
        title: 'Business ' + year,
        format: '{0:N0}',
        width: 150,
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
        width: 150,
        attributes: {
          style: 'font-weight: 600; border: 1px solid gray;',
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

$('#btnRemoveChart').click(resetChart);
