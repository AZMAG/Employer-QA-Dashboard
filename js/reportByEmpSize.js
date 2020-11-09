function setupEmpSizeAnalysis() {
  async function setupUI() {
    $('#analysisArea').html(
      `
        <div style="text-align: center;">
            <div class="col-12">
              <div class="col-12 attributeSelectors">
                  <label for="field">Group by area field:</label>
                  <br />
                  <select style="width:400px;" id="field1"></select>
              </div>
          </div>
        </div>
        <br />
        <div class="reportOutsideContainer">
            <div id="loadingSpinner" style="display: none;" class="spinner-border" role="status">
                <span class="sr-only">Loading...</span>
            </div>
            <div id="empSizeResultsContainer" style="display:none;">
                <div class="reportBoxContainer">
                <div class="card reportBox" id="chartContainer">
                    <div class="card-header">
                    </div>
                    <div class="card-body">
                      <div class="chart-container" >
                          <div id="empSizeChart"></div>
                          <button id='btnRemoveChart' style="display: block;" class='btn btn-sm btn-primary'>Remove Chart</button>
                      </div>
                    </div>
                  </div>
                  <div class="card reportBox">
                    <div class="card-header">
                    </div>
                    <div class="card-body">
                      <div class="chart-container">
                          <form id='empSizeCheckboxForm'></form>
                          
                          <div id="empSizeGrid"></div>
                      </div>
                    </div>
                    <div class="card-footer">
                    </div>
                  </div>
                </div>
            </div>
        </div>
      `
    );
    //<span class="note">*Note: Click any of the above rows to see line chart.</span>
    setupDropdown();
    $('#loadingSpinner').show();
    let data = await getEmpSummaryBySize();
    let yearSummary = getYearSummaryData(data);
    setupChart(data, yearSummary);
    $('#empSizeResultsContainer').show();
    $('#loadingSpinner').hide();
    setupDataGrid(data);

    $('#btnClear').click(() => {
      setupUI();
      setupAutoComplete();
    });
  }

  function getYearSummaryData(rawData) {
    let yearSummary = {};

    rawData.forEach((row) => {
      yearSummary[row.year] = yearSummary[row.year] || {
        year: row.year,
        EmpSum: 0,
        BusSum: 0,
      };
      yearSummary[row.year].EmpSum += row.Sum_Jobs_BUS_5to19_Jobs;
      yearSummary[row.year].EmpSum += row.Sum_Jobs_BUS_20to99_Jobs;
      yearSummary[row.year].EmpSum += row.Sum_Jobs_BUS_100to249_Jobs;
      yearSummary[row.year].EmpSum += row.Sum_Jobs_BUS_250p_Jobs;
      yearSummary[row.year].BusSum += row.Num_BUS_5to19_Jobs;
      yearSummary[row.year].BusSum += row.Num_BUS_20to99_Jobs;
      yearSummary[row.year].BusSum += row.Num_BUS_100to249_Jobs;
      yearSummary[row.year].BusSum += row.Num_BUS_250p_Jobs;
    });
    return yearSummary;
  }

  function setupChart(rawYears, yearSummary) {
    console.log(rawYears);
    let busData = Object.keys(yearSummary).map(
      (key) => yearSummary[key].BusSum
    );
    let empData = Object.keys(yearSummary).map(
      (key) => yearSummary[key].EmpSum
    );
    let busMax = Math.max(...busData.filter((num) => num));
    let empMax = Math.max(...empData.filter((num) => num));

    const chartConfig = {
      selector: '#empSizeChart',
      // title: 'EmpName Summary Counts',
      chartYears: ['2010', '2012', '2015', '2016', '2017', '2018', '2019'],
      empMax,
      busMax,
      empData,
      busData,
    };
    console.log(chartConfig);

    setupKendoLineChart(chartConfig);
  }

  function setupDataGrid(data) {
    data.sort((a, b) => {
      return a.groupValue - b.groupValue;
    });

    let allColumns = [
      { field: 'groupField', title: 'groupField', width: 200 },
      { field: 'groupValue', title: 'groupValue', width: 200 },
      { field: 'year', title: 'Year', width: 90 },
      {
        field: 'Num_BUS_5to19_Jobs',
        title: '5 to 19 Locations',
        width: 190,
        format: '{0:N0}',
      },
      {
        field: 'Sum_Jobs_BUS_5to19_Jobs',
        title: '5 to 19 Jobs',
        width: 190,
        format: '{0:N0}',
      },
      {
        field: 'Num_BUS_20to99_Jobs',
        title: '20 to 99 Locations',
        width: 190,
        format: '{0:N0}',
      },
      {
        field: 'Sum_Jobs_BUS_20to99_Jobs',
        title: '20 to 99 Jobs',
        width: 190,
        format: '{0:N0}',
      },
      {
        field: 'Num_BUS_100to249_Jobs',
        title: '100 to 249 Locations',
        width: 190,
        format: '{0:N0}',
      },
      {
        field: 'Sum_Jobs_BUS_100to249_Jobs',
        title: '100 to 249 Jobs',
        width: 210,
        format: '{0:N0}',
      },
      {
        field: 'Num_BUS_250p_Jobs',
        title: '250+ Locations',
        width: 190,
        format: '{0:N0}',
      },

      {
        field: 'Sum_Jobs_BUS_250p_Jobs',
        title: '250+ Jobs',
        width: 150,
        format: '{0:N0}',
      },
    ];
    let columns = allColumns.slice();

    if (data[0].groupField === 'undefined') {
      columns.shift();
      columns.shift();
    }

    if ($('#empSizeGrid').data('kendoGrid')) {
      $('#empSizeGrid').data('kendoGrid').destroy();
      $('#empSizeGrid').empty();
    }

    $('#empSizeGrid').kendoGrid({
      height: '450px',
      scrollable: true,
      dataSource: data,
      selectable: true,
      sortable: true,
      navigatable: true,
      resizable: true,
      reorderable: true,
      filterable: true,
      toolbar: ['search', 'excel'],
      columns,
    });
  }

  const areaOptions = [
    { value: 'County', label: 'County' },
    { value: 'Jurisdiction', label: 'Jurisdiction' },
    { value: 'Zip', label: 'Zip Code' },
    { value: 'REGION90', label: 'Region' },
    { value: 'SUBREGION', label: 'Sub Region' },
  ];

  async function dropdownChanged() {
    const field1 = $('#field1').data('kendoDropDownList').value();
    $('#loadingSpinner').show();
    $('#empSizeResultsContainer').hide();
    let data = await getEmpSummaryBySize(field1);
    let yearSummary = getYearSummaryData(data);
    let rawYears = Object.keys(yearSummary).sort();

    setupYearCheckboxes(rawYears, '#empNameCheckboxForm', () => {
      console.log('change');
    });
    $('#empSizeResultsContainer').show();
    $('#loadingSpinner').hide();
    setupDataGrid(data);
    // setupChart(rawYears, yearSummary);
    // setupRawDataGrid(rawData);
  }

  function setupDropdown() {
    $('#field1').kendoDropDownList({
      dataSource: areaOptions,
      optionLabel: 'Select a summary area field',
      change: dropdownChanged,
      dataTextField: 'label',
      dataValueField: 'value',
    });
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

  // function setupYearCheckboxes(years, selector, changeEvent) {
  //   let yearList = years.map((year) => {
  //     return `
  //     <div class="form-check form-check-inline">
  //       <input class="form-check-input yearCbox" data-year="${year}" type="checkbox" id="yearCbox${year}" checked>
  //       <label class="form-check-label" for="yearCbox${year}">${year}</label>
  //     </div>
  //   `;
  //   });
  //   $(selector).html(yearList.join(''));
  //   $(selector).find('.yearCbox').change(changeEvent);
  // }

  setupUI();
  function resetChart() {
    try {
      $('#empSizeChart').data('kendoChart').destroy();
      $('#empSizeChart').empty();
      $('#empSizeChart').removeClass('k-chart');
      $('#btnRemoveChart').hide();
      $('#chartContainer').hide();
      const grid = $('#empSizeGrid').data('kendoGrid');
      grid.resize();
    } catch (error) {}
  }
  $('body').on('click', '#btnRemoveChart', resetChart);
}
