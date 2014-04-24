/*
 * grunt-xray-runner
 * https://github.com/rlouapre/xray-runner
 *
 * Copyright (c) 2014 Richard Louapre
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  // Please see the Grunt documentation for more information regarding task
  // creation: http://gruntjs.com/creating-tasks

  grunt.registerMultiTask('xray_runner', 'Execute Xquery unit tests in Xray', function() {

    // TODO: Add support for argument in command line: grunt xray --files=fail.xqy
    var verbose = (grunt.option('verbose') !== undefined) ? grunt.option('verbose') : false;
    var async = require('async');
    var path = require('path');
    var _ = require('lodash');
    var request = require('request');
    var util = require('util');

    // Validate task settings    
    var settings = this.data.settings;
    
    if (! Array.isArray(settings.modules)) {
      settings.modules = [settings.modules];
    }
    if (settings === undefined) {
      grunt.fail.fatal('Invalid configuration [settings] should be:\n' + 
        JSON.stringify({settings:{url:'http://localhost:9000/xray', testDir: 'app/lib/test'}}, null, 2));
    }

    if (verbose) {
      grunt.verbose.writeln('name [' + this.name + '] - target [' + this.target + ']');
      grunt.verbose.writeln('data ' + JSON.stringify(settings, null, 1));
    }

    var done = this.async();
    var options = {verbose: verbose};
    var Runner = require('./lib/runner');
    var runner = new Runner(grunt, options, settings);

    var errorMessages = [];
    var failedMessages = [];
    var total = 0;
    var passed = 0;
    var ignored = 0;
    var failed = 0;

    function showReport(results) {
      total += results.total;
      passed += results.passed;
      ignored += results.ignored;
      failed += results.failed;
      _.each(results.reports, function(report) {
        errorMessages = errorMessages.concat(report.errorMessages);
        failedMessages = failedMessages.concat(report.failedMessages);
      });
    }
    
    function executeModuleTest(module, callback) {
      grunt.log.subhead('Execute XRay unit test for module [' + module + ']');
      var options = runner.getRequestOptions(module)
      request.post(options, function(error, response, body) {

        if (!error && response.statusCode === 200) {
          grunt.verbose.writeln(body);
          body = JSON.parse(body);
          if (verbose) {
            grunt.verbose.writeln('tests \n\n' + JSON.stringify(body.tests, null, 2));
          }
          runner.parseResponse(body.tests, showReport);
        } else {
          if (verbose) {
            grunt.verbose.writeln('Request failed \n\n' + JSON.stringify(response.body, null, 2));
          }
          grunt.fail.fatal('Request failed code status [' + response.statusCode + '] for module: ' + module);
        }
        callback();
      });
    }

    async.eachSeries(
      settings.modules, 
      executeModuleTest,
      function(err) {
        if (failedMessages.length > 0) {
          grunt.fail.fatal(failedMessages.join('\n'));
        }
        if (errorMessages.length > 0) {
          grunt.fail.fatal(errorMessages.join('\n'));
        }
        grunt.log.writeln('Total [' + total + '] - passed [' + passed + '] - ignored [' + ignored + '] - failed [' + failed + ']');
        grunt.log.ok();
        done();
      }
    );

  });

};
