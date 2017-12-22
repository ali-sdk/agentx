'use strict';

var os = require('os');
var fs = require('fs');
var crypto = require('crypto');
var execFile = require('child_process').execFile;
var util = require('util');

exports.sha1 = function (str, key) {
  return crypto.createHmac('sha1', key).update(str).digest('hex');
};

exports.execCommand = function (file, args, opts, callback) {
  execFile(file, args, opts, callback);
};

exports.execFile = function (command, args, callback) {
  if (typeof args === 'function') {
    callback = args;
    args = [];
  }

  fs.access(command, fs.X_OK, function (err) {
    if (err) {
      return callback(err);
    }
    execFile(command, args, callback);
  });
};

var uid = 1000;
exports.uid = function () {
  return uid++;
};

exports.random = function (min, max) {
  return Math.floor(min + Math.random() * (max - min));
};

exports.pad2 = function (num) {
  if (num < 10) {
    return '0' + num;
  }
  return '' + num;
};

exports.pad3 = function (num) {
  if (num < 10) {
    return '00' + num;
  } else if (num < 100) {
    return '0' + num;
  }
  return '' + num;
};

exports.getYYYYMMDD = function (date) {
  var YYYY = date.getFullYear();
  var MM = exports.pad2(date.getMonth() + 1);
  var DD = exports.pad2(date.getDate());
  return '' + YYYY + MM + DD;
};

exports.formatError = function (err) {
  var now = new Date();
  var YYYY = now.getFullYear();
  var MM = exports.pad2(now.getMonth() + 1);
  var DD = exports.pad2(now.getDate());
  var hh = exports.pad2(now.getHours());
  var mm = exports.pad2(now.getMinutes());
  var ss = exports.pad2(now.getSeconds());
  var sss = exports.pad3(now.getMilliseconds());
  var time = util.format('%s-%s-%s %s:%s:%s.%s', YYYY, MM, DD, hh, mm, ss, sss);
  var format = ['%s %s: %s', 'pid: %s', 'host: %s', '%s'].join(os.EOL) + os.EOL;
  return util.format(format, time, err.name, err.stack, process.pid, os.hostname(), time);
};

exports.resolveYYYYMMDDHH = function (str) {
  var now = new Date();
  return str.replace('#YYYY#', now.getFullYear())
    .replace('#MM#', exports.pad2(now.getMonth() + 1))
    .replace('#DD#', exports.pad2(now.getDate()))
    .replace('#HH#', exports.pad2(now.getHours()));
};

exports.isDockerEnv = (function () {
  try {
    var raw = fs.readFileSync('/proc/self/cgroup', 'utf8').trim().split('\n');
    for (var i = 0; i < raw.length; i++) {
      if (raw[i].indexOf('device') >= 0 || raw[i].indexOf('cpu') >= 0) {
        var one = raw[i].split(':');
        if (one[2].indexOf('/docker/') === 0) {
          return true;
        }
      }
    }
    return false;
  } catch (err) {
    return false;
  }
})();
