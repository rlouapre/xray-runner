/*
 * grunt-xray-runner
 * https://github.com/rlouapre/xray-runner
 *
 * Copyright (c) 2014 Richard Louapre
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    jshint: {
      all: [
        'Gruntfile.js',
        'tasks/*.js'
      ],
      options: {
        jshintrc: '.jshintrc',
      },
    },

    // Before generating any new files, remove any previously-created files.
    clean: {
      tests: ['tmp'],
    },

    // Configuration to be run (and then tested).
    xray_runner: {
      custom_options: {
        // template: 'tasks/lib/xray-runner.js',
        options: {
        },
        settings: {
          url: 'http://localhost:9015/xray',
          testDir: 'app/lib/test',
          // files: 'test-import-lib.xqy'
          // modules: ['test-import-lib.xqy', 'test-validate-template.xqy']
          modules: 'test-validate-template.xqy'
        },
      },
    },

    // Unit tests.
    mochaTest: {
      test: {
        options: {
          reporter: 'spec'
        },
        src: ['test/**/*.js']
      }
    }

  });

  // Actually load this plugin's task(s).
  grunt.loadTasks('tasks');

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-mocha-test');

  grunt.registerTask('integration-test', ['clean', 'xray_runner'/*, 'mochaTest'*/]);

  // Whenever the "test" task is run, first clean the "tmp" dir, then run this
  // plugin's task(s), then test the result.
  grunt.registerTask('test', ['clean', 'mochaTest']);

  // By default, lint and run all tests.
  grunt.registerTask('default', ['jshint', 'test']);

};
