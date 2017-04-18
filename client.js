'use strict';

var path = require('path');
var argv = process.argv.slice(2);

// exiting with parent process
process.on('disconnect', function () {
  console.log('exiting with parent process');
  process.exit(0);
});

var readConfig = function(confPath) {
  var cfg = require(confPath);

  if (!cfg.server ||
    !cfg.appid ||
    !cfg.secret ||
    !cfg.logdir ||
    !cfg.heartbeatInterval ||
    !cfg.reconnectDelay ||
    !cfg.reportInterval) {
    console.log('配置文件:');
    console.log(JSON.stringify(cfg, null, 2));
    console.log('请检查配置文件, 确保以下参数配置：');
    console.log('  server, appid, secret, logdir, heartbeatInterval, reconnectDelay, reportInterval');
    process.send({type: 'suicide'});
    process.exit(1);
  }

  return cfg;
};

process.on('uncaughtException', function (err) {
  console.log(new Date());
  console.log(err.message);
  console.log(err.stack);
  process.exit(-1);
});

var Agent = require('./lib/agent');
var confPath = path.resolve(argv[0]);
var agent = new Agent(readConfig(confPath));
agent.run();
