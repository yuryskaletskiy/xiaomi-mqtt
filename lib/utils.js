'use strict';

var path = require('path');
var fs = require('fs');
var os = require('os');
const prefix = require('loglevel-plugin-prefix');
const chalk = require('chalk');

var package_json = "../package.json";
var package_version, github_version, npm_version;

module.exports = {
  Utils: Utils
}

function Utils() {
}

Utils.loadConfig = function(config_name) {
  
  var config_path = path.join(os.homedir(), ".xiaomi-mqtt");
  config_path = path.join(config_path, config_name);
  
  if (config_name !== "config.json") {
    config_path = config_name;
  }
   console.log("Using config.json location: ", config_path);


  // Complain and exit if config_name doesn't exist yet
  if (!fs.existsSync(config_path)) {
      console.log("Couldn't find a %s file at %s.", config_name, config_path);
      process.exit(1);
  }
  
  // Load up the configuration file
  var config;
  try {
    //console.log("Utils.loadConfig");
    config = JSON.parse(fs.readFileSync(config_path));
  }
  catch (err) {
    console.log("There was a problem reading your %s file.", config_name);
    console.log("Please try pasting your %s file here to validate it: http://jsonlint.com", config_name);
    console.log("");
    throw err;
  }
  return config;
}

Utils.rgb_buf = function (rgb) {
  var bri = parseInt("0x"+rgb.substr(0,2));
  var r = parseInt("0x"+rgb.substr(2,2));
  var g = parseInt("0x"+rgb.substr(4,2));
  var b = parseInt("0x"+rgb.substr(6,2));
                  
  var buf = Buffer.alloc(4);
  buf.writeUInt8(bri, 0);
  buf.writeUInt8(r, 1);
  buf.writeUInt8(g, 2);
  buf.writeUInt8(b, 3);

  return buf.readUInt32BE(0);
}

Utils.setlogPrefix = function(log) {
  const colors = {
    TRACE: chalk.magentaBright,
    DEBUG: chalk.cyanBright,
    INFO: chalk.whiteBright,
    WARN: chalk.yellowBright,
    ERROR: chalk.redBright,
  };

  prefix.reg(log);
  
  prefix.apply(log, {
    format(level, name, timestamp) {
      //return `${chalk.white(`[${timestamp}]`)} ${colors[level.toUpperCase()](level)} ${chalk.green(`${name}`)}`;
      return `${chalk.white(`[${timestamp}]`)} ${colors[level.toUpperCase()](level)}`;
    },
  });
}

Utils.log = function(msg) {
  var date = new Date();
  var msg = "[" + date.toLocaleString() + "]" + " " + msg;
  
  console.log(msg);
}

Utils.get_npmVersion = function(pkg) {
  // Update version for the next call
  this.read_npmVersion(pkg, function(version) {
    npm_version = version;
  });
  return npm_version;
}

Utils.read_packageVersion = function() {
  
  var packageJSONPath = path.join(__dirname, package_json);
  var packageJSON = JSON.parse(fs.readFileSync(packageJSONPath));
  package_version = packageJSON.version;
  return package_version;
}

Utils.read_packageName = function() {
  
  var packageJSONPath = path.join(__dirname, package_json);
  var packageJSON = JSON.parse(fs.readFileSync(packageJSONPath));
  return packageJSON.name;
}

Utils.read_npmVersion = function(pck, callback) {
  var exec = require('child_process').exec;
  var cmd = 'npm view '+pck+' version';
  exec(cmd, function(error, stdout, stderr) {
    npm_version = stdout.trim();
    //npm_version = stdout.replace(/(\r\n|\n|\r)/gm,"");
    callback(npm_version);
    //console.log("npm_version %s", npm_version);
 });
}
