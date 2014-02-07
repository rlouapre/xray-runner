/* global it, describe */

'use strict';

var request = require('request');
var _ = require('lodash');
var url = require('url');
var grunt = require('grunt');

var verbose = (grunt.option('verbose') !== undefined) ? grunt.option('verbose') : false;
var urlBase = url.parse(process.env['xray.settings.url']);
var xqyFiles = (process.env['xray.settings.files'] !== undefined) ? process.env['xray.settings.files'].split(',') : [undefined];
var testDirectory = (process.env['xray.settings.testDir'] !== undefined) ? process.env['xray.settings.testDir'] : 'test';

function isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

function transformError(module, error) {
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
}

function transformModule(tests, module) {
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
    } else {
      result[key] = value;
    }
  });
  transformError(_module, module.error);
  tests.module.push(_module);
}

function transformModules(tests, modules) {
  tests.module = [];
  if (! Array.isArray(modules)) {
    modules = [modules];
  }
  _.each(modules, function(module) {
    transformModule(tests, module);
  });
}

function executeXqueryTests(module, success, error) {
  var tempUrl = urlBase;
  tempUrl.pathname = 'xray/index.xqy';
  tempUrl.query = (module !== undefined) ? { 'dir': testDirectory, 'modules': module, 'format': 'json' } : { 'dir': testDirectory, 'format': 'json' };
  var xrayUrl = url.format(tempUrl);
  grunt.log.writeln('Execute XRay unit test on url [' + xrayUrl + ']');
  var req = request.get(xrayUrl, function(err, response, body) {
    if (response.statusCode === 200) {
      body = JSON.parse(body);
      if (verbose) {
        grunt.verbose.writeln('tests \n\n' + JSON.stringify(body.tests, null, 2));
      }
      var tests = {
        dir: body.tests.dir,
        modulePattern: body.tests['module-pattern'],
        testPattern: body.tests['test-pattern'],
        xrayVersion: body.tests['xray-version']
      };

      transformModules(tests, body.tests.module);
      success(tests);
    } else {
      console.error('Error: ' + err + ' for url: ' + xrayUrl);
      error(err);
    }
  });
}

function checkTestFailed(module) {
  var message = 'Module ['+ module.path +'] - total [' + module.total + '] - passed [' + module.passed + '] - failed [' + module.failed + ']';
  if (Number(module.failed) === 0) {
    grunt.log.writeln(message);
    grunt.log.ok();
  } else {
    _.each(module.test, function (func) {
      message += '\n\tTest [' + func.name + '] - ' + func.result;
      if (Array.isArray(func.assert)) {
        _.each(func.assert, function(asser) {
          // message += '\n\t\t' + JSON.stringify(asser);
          message += '\n\t\tAssert actual [' + asser.actual + '] - expected [' + asser.expected + '] - message [' + asser.message +']';
        });
      } else {
        message += '\n\t\tAssert actual [' + func.assert.actual + '] - expected [' + func.assert.expected + '] - message [' + func.assert.message +']';
      }
    });
    throw new Error(message);
  }
}

function checkTestError(module) {
  if (verbose) {
    grunt.verbose.writeln('checkTestError \n\n' + JSON.stringify(module, null, 1));
  }

  if (module.error !== undefined) {
    var message = module.error.message;
    message += ' - file [' + module.error.stack.uri + '] - line [' + module.error.stack.line + '] - column [' + module.error.stack.column + ']';
    throw new Error(message);
  }
}

describe('Execute XQuery Unit Tests in XRay', function() {

  _.each(xqyFiles, function(test) {
    var message;
    if (test === undefined) {
      message = 'should run all modules';
    } else {
      message = 'should run module [' + test + ']' ;
    }
    it (message, function(done) {
      executeXqueryTests(test, 
        function(response) {
          try {
            _.each(response.module, function(module) {
              checkTestError(module);
              checkTestFailed(module);
            });
            done();
          } catch (err) {
            done();
            this.fail(err);
          }
        }.bind(this), 
        function(error) {
          console.error(error);
          done();
        });
    });
  });

});
