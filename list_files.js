var finder    = require('findit')(process.argv[2] || '.');
var path      = require('path');
var moment    = require('moment');
var exif      = require('exiftool');
var fs        = require('fs');
var gps_util  = require('gps-util');
var request   = require('request');
var async     = require('async');

var convert_gps = function (gps) {
  if (!gps) return 0;

  gps = gps.replace(/deg /g,'')
            .replace(/'/g,'')
            .replace(/"/g,'')
            .split(' ')

  // if its W we have a newgtive #
  if (gps[3] === "W") gps[0] = Number(gps[0] * -1);

  return gps_util.toDD(Number(gps[0]), Number(gps[1]), Number(gps[2]));
}

//var get_info = function (file) {
var q = async.queue(function (file, callback) {

  fs.readFile(file, function (err, data) {
    if (err) return callback(err);

    exif.metadata(data, function (err, metadata) {
      if (err) return callback(err);

        var row = '';

        var d = metadata.createDate.split(' ')[0].split(':');

        var date_string = d[0] + '-' + d[1] + '-' + d[2];

        var m = moment(date_string, 'YYYY-MM-DD');

        row += d[0] + '\t' + d[1] + '\t' + d[2] + '\t' + m.format('MMM D') + '\t';

        var lat = convert_gps(metadata.gpsLatitude);

        var lon = convert_gps(metadata.gpsLongitude);

        var f = file.split('Masters')[1];

        row += 'http://localhost:8000' + f + '\t';

        if (lat !== 0 && lon !== 0) {
          request.get('http://localhost:4000/gps/' + lat + '/' + lon, function (e, r, b) {

            b = JSON.parse(b);

            row += b.city + '\t';

            row += b.state + '\n';

            process.stdout.write(row);

            return callback();
          });
        }
        else {

          row += 'Washington\t';

          row += 'District of Columbia\n';

          process.stdout.write(row);

          return callback();

        }
    }); // end exif
  }); // end readFile
}, 10);

finder.on('file', function (file, stat) {

  var re = /(?:\.([^.]+))?$/; // get extension with regex

  var extension = re.exec(file.toLowerCase())[0];

  if (extension === '.mov' || extension === 'mp4') {

    var m = moment(Date.parse(stat.mtime))

    var date_string = m.format('YYYY-MM-DD');

    // if it falls in 2014 or one day on either end, push it in the queue to get the data we want (date and gps)
    if (date_string === '2013-12-31' || date_string === '2015-01-01' || m.format('YYYY') === '2014') {

      q.push(file);
      //console.log(date_string);
    }
  }
});

finder.on('error', function (error) {
  console.log(error)
  finder.stop();
});