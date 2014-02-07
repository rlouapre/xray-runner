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
    // console.log('files: ' + grunt.option('files'));
    var template = (this.data.template !== undefined) ? this.data.template: 'xray-runner/tasks/lib/xray-runner.js';
    var verbose = (grunt.option('verbose') !== undefined) ? grunt.option('verbose') : false;
    var path = require('path');
    var _ = require('lodash');
    var jasmine = require('jasmine-node');
    var util = require('util');

    if (! grunt.file.exists(path.resolve(template))) {
      throw new Error('Cannot find template ' + template);
    }

    if (verbose) {
      grunt.verbose.writeln('name [' + this.name + '] - target [' + this.target + ']');
      grunt.verbose.writeln('data ' + JSON.stringify(this.data.settings, null, 1));
    }

    var files = [];

    if (this.data.settings.files !== undefined) {
      _.each(grunt.file.expand(this.data.settings.files), function(file) {
        files.push(file);
      });
    }

    if (files.length > 0) {
      this.data.settings.files = files;
    }

    grunt.verbose.writeln('files ' + this.data.settings.files);
    grunt.verbose.writeln('testDir ' + this.data.settings.testDir);
    var testDir = this.data.settings.testDir;
    var isModule = (_.find(this.data.settings.files, function(file) {
      return file.indexOf(testDir) === 0;
    }) === undefined);

    if (isModule) {
      this.data.settings.files = undefined;
    } else {
      files = [];
      _.each(this.data.settings.files, function (file) {
        files.push(path.basename(file));
      });
      this.data.settings.files = files;
    }

    if (Array.isArray(this.data.settings.files)) {
      this.data.settings.files = this.data.settings.files.join(',');
    }

    // Provide all settings to xray-runner
    _.each(this.data.settings, function(value, key) {
      if (value !== undefined) {
        process.env['xray.settings.' + key] = value;
      } else {
        delete process.env['xray.settings.' + key];
      }
    });

    var done = this.async();
    var forceExit = false;

    var onComplete = function(runner, log) {
      var exitCode;
      util.print('\n');
      if (runner.results().failedCount === 0) {
        exitCode = 0;
      } else {
        exitCode = 1;

        if (forceExit) {
          process.exit(exitCode);
        }
      }
      jasmine.getGlobal().jasmine.currentEnv_ = undefined;
      done();
    };

    var options = {
      specFolders:     [template],
      isVerbose:       verbose,
      showColors:      true,
      teamcity:        false,
      useRequireJs:    true,
      coffee:          false,
      onComplete:      onComplete,
      jUnit: {
        report: false,
        savePath : './build/reports/jasmine/',
        useDotNotation: true,
        consolidate: true
      }
    };

    try {
      // since jasmine-node@1.0.28 an options object need to be passed
      jasmine.executeSpecsInFolder(options);
      grunt.verbose.ok();
    } catch (e) {
      grunt.error('Failed to execute "jasmine.executeSpecsInFolder": ' + e.stack);
    }

  });

};
