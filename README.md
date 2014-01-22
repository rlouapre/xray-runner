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
Default value: `test`

Unit test files to execute (support matching globbing pattern).

### Usage Examples

#### Default Options
In this example, the default options are used to do something with whatever. So if the `testing` file has the content `Testing` and the `123` file had the content `1 2 3`, the generated result would be `Testing, 1 2 3.`

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

#### Custom Options
In this example, custom options are used to do something else with whatever else. So if the `testing` file has the content `Testing` and the `123` file had the content `1 2 3`, the generated result in this case would be `Testing: 1 2 3 !!!`

```js
grunt.initConfig({
  xray_runner: {
    options: {
      separator: ': ',
      punctuation: ' !!!',
    },
    files: {
      'dest/default_options': ['src/testing', 'src/123'],
    },
  },
});
```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
_(Nothing yet)_
