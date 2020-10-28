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
            <input type="text" id="autoComplete" style="width: 80%;" />
        </div>
        <br />
        <div>
            <div id="loadingSpinner" style="display: none;" class="spinner-border" role="status">
                <span class="sr-only">Loading...</span>
            </div>
            <div id="empNameResultsContainer" style="display:none;">
                <div class="row">
                  <div class="col-12">
                      <div class="chart-container">
                        <h4>EmpName Summary Counts</h4>
                        <form id='empNameCheckboxForm'></form>
                        <div id="empNameChart"></div>
                        <div id="empNameGrid"></div>
                      </div>
                  </div>
                </div>
            </div>
        </div>
      `
    );
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

  async function empNameSelected(val) {
    $('#loadingSpinner').show();
    let rawData = await getDataByEmpName(val);
    let yearSummary = getYearSummaryData(rawData);
    let rawYears = Object.keys(yearSummary).sort();

    setupYearCheckboxes(rawYears, '#empNameCheckboxForm', () => {
      console.log('change');
    });
    setupChart(rawYears, yearSummary);
    $('#loadingSpinner').hide();
    $('#empNameResultsContainer').show();

    // console.log(yearSummary);
    // $('#empNameResultsContainer').show();
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
