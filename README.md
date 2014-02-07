# grunt-xray-runner

> This plugin uses XRay to automate testing of XQuery in Marklogic

## Getting Started
This plugin requires Grunt `~0.4.2`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-xray-runner --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-xray-runner');
```

## The "xray_runner" task

### Overview
In your project's Gruntfile, add a section named `xray_runner` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  xray_runner: {
    all: {
      settings: {
        url: 'http://localhost:9999',
        testDir: 'test',
        files: ['test/**/*.xqy']
      }
    }
  }
});
```

### Settings

#### settings.url
Type: `String`

Base url of ML application server (XRay must be installed and available in ```{settings.url}/xray``` directory).

#### settings.testDir
Type: `String`
Default value: `test`

Directory name where unit test are located.

#### settings.files
Type: `String Array`

Unit test files to execute (support matching globbing pattern).

### Usage Examples

#### Default Options
In this example, the plugin will execute all XRay tests located on server `http://localhost:9999/test`.

```js
grunt.task.loadTasks('xray-runner/tasks')

grunt.initConfig({
  xray_runner: {
    all: {
      settings: {
        url: 'http://localhost:9999',
        testDir: 'test'
      }
    }
  }
});
```

#### Custom Options
In this example, the plugin will execute only XRay tests located in `test/test1.xqy` on server `http://localhost:9999/test`.

```js
grunt.task.loadTasks('xray-runner/tasks')

grunt.initConfig({
  xray_runner: {
    all: {
      settings: {
        url: 'http://localhost:9999',
        testDir: 'test',
        files: ['test/test1.xqy']
      }
    }
  }
});
```

In this example, the plugin is combined with watch so the tests are executed whenever XQuery files are changed.

```js
grunt.loadNpmTasks('grunt-contrib-watch');
grunt.task.loadTasks('xray-runner/tasks')

grunt.initConfig({
  // Watch xqy files and execute xray-runner when they are modified
  watch: {
    options: {
      spawn: false,
    },
    files: ['modules/**/*.xqy', 'test/**/*.xqy'],
    tasks: ['xray_runner']
  },
  xray_runner: {
    all: {
      settings: {
        url: 'http://localhost:9999',
        testDir: 'test',
        files: ['test/**/*.xqy']
      }
    }
  }
});
```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
_(Nothing yet)_
