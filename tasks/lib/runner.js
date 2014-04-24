/* global it, describe */

'use strict';

var _ = require('lodash');

function isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

function Runner(grunt, options) {
  var verbose = (options.verbose !== undefined) ? options.verbose : false;
  this.grunt = grunt;
  this.options = options;
  
  var transformError = function(module, error) {
    if (isNumber(error)) {
      return;
    }
    module.error = {
      code: error.code,
      name: error.name,
      message: error['format-string'],
      xqueryVersion: error['xquery-version']
    };
    var stack = error.stack;
    if (stack !== undefined && Array.isArray(stack.frame)) {
      module.error.stack = {
        uri: stack.frame[0].uri,
        line: stack.frame[0].line,
        column: stack.frame[0].column,
        operation: stack.frame[0].operation
      };
    }
  };

  var transformModule = function(tests, module) {
    if (verbose) {
      grunt.verbose.writeln('transformModule \n\n' + JSON.stringify(module, null, 1));
    }
    var _module = {};
    _module = _.transform(module, function (result, value, key) {
      if (key === 'test') {
        var test;
        if (Array.isArray(value)) {
          test = value;
        } else {
          test = [];
          test.push(value);
        }
        test = _.map(test, function(_test) {
          if (! Array.isArray(_test.assert)) {
            _test.assert = [_test.assert];
          }
          return _test;
        });
        result[key] = test;
      } else if (key === 'error') {
      } else if (key === 'total' || key === 'passed' || key === 'ignored' || key === 'failed') {
        result[key] = Number(value);
      } else {
        result[key] = value;
      }
    });
    transformError(_module, module.error);
    tests.modules.push(_module);
  };

  var transformModules = function(tests, modules) {
    tests.modules = [];
    if (! Array.isArray(modules)) {
      modules = [modules];
    }
    _.each(modules, function(module) {
      transformModule(tests, module);
    });
  };

  var parseModule = function(module) {
    var report = {
      total: Number(module.total),
      passed: Number(module.passed),
      ignored: Number(module.ignored),
      failed: Number(module.failed),
      message: 'Module ['+ module.path +'] - total [' + module.total + '] - passed [' + module.passed + '] - failed [' + module.failed + ']',
      errorMessages: [],
      failedMessages: []
    };
    if (module.error !== undefined) {
      // console.log(JSON.stringify(module, null, 2));
      var message = module.error.message;
      if (module.error.stack !== undefined) {
        message += ' - file [' + module.error.stack.uri + '] - line [' + module.error.stack.line + '] - column [' + module.error.stack.column + ']';
      }
      report.errorMessages.push(message);
      // throw new Error(message);
    }
    // console.log(JSON.stringify(results, null, 1));
    // var message = 'Module ['+ module.path +'] - total [' + module.total + '] - passed [' + module.passed + '] - failed [' + module.failed + ']';
    if (Number(module.failed) === 0) {
      // this.grunt.log.writeln(message);
      grunt.log.ok();
    } else {
      _.each(module.test, function (func) {
        var message = '\n\tTest [' + func.name + '] - ' + func.result;
        if (Array.isArray(func.assert)) {
          _.each(func.assert, function(asser) {
            // message += '\n\t\t' + JSON.stringify(asser);
            message += '\n\t\tAssert actual [' + asser.actual + '] - expected [' + asser.expected + '] - message [' + asser.message +']';
          });
        } else {
          message += '\n\t\tAssert actual [' + func.assert.actual + '] - expected [' + func.assert.expected + '] - message [' + func.assert.message +']';
        }
        report.failedMessages.push(message);
      });
      // throw new Error(message);
    }
    return report;
  };

  this.parseResponse = function(results, callback) {
    var response = {
      total: 0,
      passed: 0,
      ignored: 0,
      failed: 0,
      reports: []
    };
    try {
      var tests = {
        dir: results.dir,
        modulePattern: results['module-pattern'],
        testPattern: results['test-pattern'],
        xrayVersion: results['xray-version']
      };

      transformModules(tests, results.module);

      _.each(results.module, function(module) {
        console.log('Module [' + module.path + ']');
        var report = parseModule(module);
        response.reports.push(report);
        response.total += report.total;
        response.ignored += report.ignored;
        response.passed += report.passed;
        response.failed += report.failed;
      });


    } catch (err) {
      this.grunt.fail.fatal(err);
    }
    callback(response);
  };

  this.getUrl = function(urlBase, dir, module) {
    var url = require('url');
    var tempUrl = url.parse(urlBase);
    tempUrl.query = (module !== undefined) ? { 'dir': dir, 'modules': module, 'format': 'json' } : { 'dir': dir, 'format': 'json' };
    return url.format(tempUrl);
  };

}

module.exports = Runner;