var csv2json = require('csvtojson');
var json2csv = require('json2csv');


var Converter=require("csvtojson").core.Converter;
var fs=require("fs");

var csvFileName="./curated.csv";
var fileStream=fs.createReadStream(csvFileName);
//new converter instance
var csvConverter=new Converter({constructResult:true});

var days = {};
csvConverter.on("end_parsed", function(jsonObj){
  //console.log(jsonObj.length); //here is your result json object
  jsonObj.forEach(function (item) {
    //console.log(item)
    var city_state = (item.city + '_' + item.state).replace(/ /g, '-');
    if (!days[city_state]) {
      days[city_state] = 1;
    }
    else {
      days[city_state]++;
    }
  })
  //jsonObj.forEach(function (item) {
  for ((i = jsonObj.length - 1); i !== 0; i--) {
    var city_state = (jsonObj[i]['city'] + '_' + jsonObj[i]['state']).replace(/ /g, '-');
    jsonObj[i].day = days[city_state];
    days[city_state]--;
  };

  //console.log(jsonObj)
// year  month day monthday  link  city  state Concert Keep days
// ['year', 'month', 'day', 'monthday', 'link', 'city', 'state', 'Concert', 'Keep', 'days']
  json2csv({data: jsonObj, fields: ['year', 'month', 'day', 'monthday', 'link', 'city', 'state', 'Concert', 'Keep', 'day'] }, function(err, csv) {
    if (err) console.log(err);
    fs.writeFile('days_file.csv', csv, function(err) {
      if (err) throw err;
      console.log('file saved');
    });
  });
});
//
//   //read from file
fileStream.pipe(csvConverter);