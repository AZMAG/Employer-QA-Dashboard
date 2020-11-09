async function getDataByGroupField(field) {
  let url = `https://geo.azmag.gov/services/EmployerDashboard/Data/GetDataByGroupField?field=${field}`;
  let res = await fetch(url);
  let data = await res.json();
  return groupDataByOneField(data, 'field', 'groupValue');
}

async function getDataByEmpName(empName) {
  let url = `https://geo.azmag.gov/services/EmployerDashboard/Data/GetEmpNameSummary?str=${empName}`;
  let res = await fetch(url);
  let data = await res.json();
  return data;
}

function groupDataByOneField(data, fieldName, groupName) {
  let rtnData = [];
  let rtnGroupings = {};

  data.forEach((row) => {
    const groupValue = row[groupName];
    const field = row[fieldName];

    rtnGroupings[groupValue] = rtnGroupings[groupValue] || {};
    rtnGroupings[groupValue]['BusSum' + row.year] = row.BusSum;
    rtnGroupings[groupValue]['EmpSum' + row.year] = row.EmpSum;
  });

  Object.keys(rtnGroupings).forEach((grouping) => {
    rtnData.push({
      groupValue: grouping,
      ...rtnGroupings[grouping],
    });
  });
  return rtnData.filter((x) => x[groupName] !== 'null');
}

function groupDataByTwoFields(
  data,
  fieldName1,
  fieldName2,
  groupName1,
  groupName2
) {
  console.log(data);
  // let rtnData = [];
  // let rtnGroupings = {};
  // data.forEach((row) => {
  //   const groupValue = row[groupName];
  //   const field = row[fieldName];
  //   rtnGroupings[groupValue] = rtnGroupings[groupValue] || {};
  //   rtnGroupings[groupValue]['BusSum' + row.year] = row.BusSum;
  //   rtnGroupings[groupValue]['EmpSum' + row.year] = row.EmpSum;
  // });
  // Object.keys(rtnGroupings).forEach((grouping) => {
  //   rtnData.push({
  //     groupValue: grouping,
  //     ...rtnGroupings[grouping],
  //   });
  // });
  // return rtnData.filter((x) => x[groupName] !== 'null');
}

async function getEmpSummaryBySize(groupField) {
  let url = `https://geo.azmag.gov/services/EmployerDashboard/Data/GetEmpSummaryBySize?groupField=${groupField}`;
  let res = await fetch(url);
  let data = await res.json();

  return data;
}

async function getDataByGroupFields(field1, field2) {
  let url = `https://geo.azmag.gov/services/EmployerDashboard/Data/GetDataByGroupFields?field1=${field1}&field2=${field2}`;
  let res = await fetch(url);
  let data = await res.json();

  let topLevelGridData = groupDataByOneField(data, 'field1', 'groupValue1');
  let detailRowData = groupDataByOneField(data, 'field2', 'groupValue2').slice(
    0,
    5
  );

  return { topLevelGridData, detailRowData };
}

async function getEmpNameSuggestions(str) {
  let url = `https://geo.azmag.gov/services/EmployerDashboard/Data/GetEmpNameSuggestions?str=${str}`;
  let res = await fetch(url);
  let data = await res.json();

  return data;
}
