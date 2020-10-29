function setupEmpNameAnalysis() {
  function setupAutoComplete() {
    autocomplete(document.getElementById('autoComplete'), empNameSelected);
  }

  function setupUI() {
    $('#analysisArea').html(
      `
        <div style="text-align: center;">
            <div class="col-12 autoCompleteContainer">
            <label for="autoComplete">Start by typing an employer name:</label>
            <br />
            <input type="text" id="autoComplete" style="width: 400px;" />
            <button id="btnClear" class="btn btn-success">Clear</button>
        </div>
        <br />
        <div class="reportOutsideContainer">
            <div id="loadingSpinner" style="display: none;" class="spinner-border" role="status">
                <span class="sr-only">Loading...</span>
            </div>
            <div id="empNameResultsContainer" style="display:none;">
                <div class="reportBoxContainer">
                  <div class="card reportBox">
                    <div class="card-header">
                      <h6><span class="empNameReplace"></span> Summary Counts</h6>
                    </div>
                    <div class="card-body">
                      <div class="chart-container">
                          <form id='empNameCheckboxForm'></form>
                          <div id="empNameChart"></div>
                          <div id="empNameGrid"></div>
                      </div>
                    </div>
                    <div class="card-footer">
                      <span class="note">*Note: Number of Locations will not show if there is only one location</span>
                    </div>
                  </div>
                  <div class="card reportBox">
                    <div class="card-header">
                      <h6>All raw data for <span class="empNameReplace"></span></h6>
                    </div>
                    <div class="card-body">
                      <div class="chart-container">
                          <div id="empNameRawGrid"></div>
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
    $('#btnClear').click(() => {
      console.log('clear');
      setupUI();
      setupAutoComplete();
    });
  }

  //<button id='btnRemoveChart' class='btn btn-sm btn-primary'>Remove Chart</button>
  function getYearSummaryData(rawData) {
    let yearSummary = {};

    rawData.forEach((row) => {
      yearSummary[row.year] = yearSummary[row.year] || {
        year: row.year,
        EmpSum: 0,
        BusSum: 0,
      };

      yearSummary[row.year].EmpSum += row.Employees;
      yearSummary[row.year].BusSum++;
    });
    return yearSummary;
  }

  function setupChart(rawYears, yearSummary) {
    let busData = Object.keys(yearSummary).map(
      (key) => yearSummary[key].BusSum
    );
    let empData = Object.keys(yearSummary).map(
      (key) => yearSummary[key].EmpSum
    );
    let busMax = Math.max(...busData.filter((num) => num));
    let empMax = Math.max(...empData.filter((num) => num));

    const chartConfig = {
      selector: '#empNameChart',
      // title: 'EmpName Summary Counts',
      chartYears: rawYears,
      empMax,
      busMax,
      empData,
      busData,
    };

    setupKendoLineChart(chartConfig);
  }

  function setupRawDataGrid(data) {
    data.sort((a, b) => {
      return a.MagId - b.MagId;
    });

    $('#empNameRawGrid').kendoGrid({
      height: '450px',
      scrollable: true,
      dataSource: data,
      sortable: true,
      navigatable: true,
      resizable: true,
      reorderable: true,
      filterable: true,
      toolbar: ['search', 'excel'],
      columns: [
        { field: 'MagId', title: 'MagId', width: 100 },
        { field: 'year', title: 'Year', width: 80 },
        { field: 'Address', title: 'Address', width: 250 },
        { field: 'Naics6', title: 'Naics6', width: 100 },
        { field: 'Employees', title: 'Employees', width: 140 },
        { field: 'Cluster', title: 'Cluster', width: 250 },
        { field: 'County', title: 'County', width: 250 },
        { field: 'EmpName', title: 'EmpName', width: 250 },
        { field: 'Jurisdiction', title: 'Jurisdiction', width: 250 },
        { field: 'NAICS6_DES', title: 'NAICS6_DES', width: 250 },
        { field: 'REGION90', title: 'REGION90', width: 250 },
        { field: 'SUBREGION', title: 'SUBREGION', width: 250 },
        { field: 'SubCluster', title: 'SubCluster', width: 250 },
        { field: 'Zip', title: 'Zip', width: 250 },
      ],
    });
  }

  async function empNameSelected(val) {
    $('#loadingSpinner').show();
    $('.empNameReplace').html(val);
    let rawData = await getDataByEmpName(val);
    let yearSummary = getYearSummaryData(rawData);
    let rawYears = Object.keys(yearSummary).sort();

    setupYearCheckboxes(rawYears, '#empNameCheckboxForm', () => {
      console.log('change');
    });
    setupChart(rawYears, yearSummary);
    $('#loadingSpinner').hide();
    $('#empNameResultsContainer').show();
    setupRawDataGrid(rawData);
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

  function setupYearCheckboxes(years, selector, changeEvent) {
    let yearList = years.map((year) => {
      return `
      <div class="form-check form-check-inline">
        <input class="form-check-input yearCbox" data-year="${year}" type="checkbox" id="yearCbox${year}" checked>
        <label class="form-check-label" for="yearCbox${year}">${year}</label>
      </div>
    `;
    });
    $(selector).html(yearList.join(''));
    $(selector).find('.yearCbox').change(changeEvent);
  }

  setupUI();
  setupAutoComplete();
}
