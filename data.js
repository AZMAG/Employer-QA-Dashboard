async function getData() {
  const res = await arcgisRest.queryFeatures({
    url:
      'http://magdevarcgis:6080/arcgis/rest/services/Test/empKendoTest/MapServer/1',
    // where: "Arizona_Total<>0",
    returnGeometry: false,
    outFields: ['*'],
  });

  var features = res.features;
  return features.map(function (feature) {
    return feature.attributes;
  });
}

async function getDataByGroupField(field) {
  let url = `https://geo.azmag.gov/services/EmployerDashboard/Data/GetDataByGroupField?field=${field}&year=2019`;
  let res = await fetch(url);
  let data = await res.json();
  let rtnData = [];
  let rtnGroupings = {};

  data.forEach(({ BusSum, EmpSum, field, groupValue, year }) => {
    rtnGroupings[groupValue] = rtnGroupings[groupValue] || {};
    rtnGroupings[groupValue]['BusSum' + year] = BusSum;
    rtnGroupings[groupValue]['EmpSum' + year] = EmpSum;
  });

  Object.keys(rtnGroupings).forEach((grouping) => {
    rtnData.push({
      groupValue: grouping,
      ...rtnGroupings[grouping],
    });
  });
  return rtnData;
}
