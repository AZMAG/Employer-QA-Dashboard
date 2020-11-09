const years = ['2010', '2012', '2015', '2016', '2017', '2018', '2019'];
let filteredYears = [];

function setupAnalysisTypeDropdown() {
  const analysisOptions = [
    {
      label: 'NAICS Codes and Cluster / Sub Cluster',
      value: 'attr',
      setupFunction: setupAttrAnalysis,
    },
    {
      label: 'Employers By Size',
      value: 'empSize',
      setupFunction: setupEmpSizeAnalysis,
    },
    {
      label: 'Employer Name',
      value: 'empName',
      setupFunction: setupEmpNameAnalysis,
    },
  ];

  $('#analysisType').kendoDropDownList({
    dataSource: analysisOptions,
    optionLabel: '-- Choose Analysis --',
    width: 500,
    change: function (e) {
      const val = this.value();
      const [analysisOption] = analysisOptions.filter(
        (opt) => opt.value === val
      );
      analysisOption.setupFunction();
    },
    dataTextField: 'label',
    dataValueField: 'value',
  });
}

function startUp() {
  // setupDropdowns();
  // setupAutoComplete();
  // setupYearCheckboxes();
  // setupKendoGrid();
  // updateKendoGrid('County');
}

// $('.topOption').click((e) => {
//   $('.topOption').parents().removeClass('active');
//   $(e.currentTarget).parents().addClass('active');
//   let val = $(e.currentTarget).data('val');
//   if (val === 'attr') {
//     $('.autoCompleteContainer').hide();
//     $('.attributeSelectors').show();
//     kendo.ui.progress($('#grid'), false);
//     $('#gridContainer').hide();
//   } else {
//     $('.autoCompleteContainer').show();
//     $('.attributeSelectors').hide();
//     $('#gridContainer').hide();
//     kendo.ui.progress($('#grid'), true);
//   }
// });

$(document).ready(() => setupAnalysisTypeDropdown());
