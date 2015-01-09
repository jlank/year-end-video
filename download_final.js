var csv2json = require('csvtojson');
var json2csv = require('json2csv');
var request = require('request');
var async = require('async');
var fs = require('fs');

var Converter=require("csvtojson").core.Converter;
var fs=require("fs");

var csvFileName="./final.csv";
var fileStream=fs.createReadStream(csvFileName);

var csvConverter=new Converter({constructResult:true});

csvConverter.on("end_parsed", function(jsonObj){

  jsonObj.forEach(function (video) {
    //console.log(video.link);
    q.push({ link: video.link, name: video.Day });
  });
});


var q = async.queue(function (task, callback) {
  if (task.name === 68)  return callback();

  var vid = fs.createWriteStream('./videos/' + task.name + '.mov');
  request.get(task.link).pipe(vid);

  vid.on('close', function () {
    console.log('downloaded vid');
    callback();
  });

}, 2);

fileStream.pipe(csvConverter);