(function () {
  'use strict';

  var chalk = require('chalk'),
    elementNameValidator = require('validate-element-name'),
    yeoman = require('yeoman-generator'),
    yosay = require('yosay');

  module.exports = yeoman.generators.Base.extend({
    constructor: function () {
      yeoman.generators.Base.apply(this, arguments);

      this.argument('element-name', {
        desc: 'Tag name of the element and directory to generate.',
        required: true
      });

      this.option('skip-install', {
        desc: 'Whether bower dependencies should be installed',
        defaults: false
      });

      this.option('skip-install-message', {
        desc: 'Whether commands run should be shown',
        defaults: false
      });
    },

    validate: function () {
      this.name = this['element-name'];
      var result = elementNameValidator(this.name);

      if (!result.isValid) {
        this.emit('error', new Error(chalk.red(result.message)));
      }

      if (result.message) {
        console.warn(chalk.yellow(result.message + '\n'));
      }

      return true;
    },

    greet: function () {
      this.log(yosay(
        'Welcome to Non-official Polymer generator!' +
        'Now with Sass and Coffee'
      ));
    },

    askFor: function () {
      var done = this.async();

      var prompts = [
        {
          default: 'An element providing a solution to no problem in particular.',
          name: 'description',
          message: 'Description',
          type: 'input'
        },
        {
          message: 'Would you like to enable CoffeeScript?',
          name: 'coffee',
          type: 'confirm'
        }
      ];

      this.prompt(prompts, function (answers) {
        this.coffeescript = answers.coffee;
        this.description = answers.description;
        this.sass = answers.sass;

        done();
      }.bind(this));
    },

    writing: function () {
      var replaceInformation = function (file) {
        file = file.toString();

        file = file.replace(/\$\$DESCRIPTION\$\$/g, this.description);
        file = file.replace(/\$\$NAME\$\$/g, this.name);

        return file;
      }.bind(this);

      this.fs.copy(
        [
          this.templatePath() + '/**',
          this.templatePath() + '/**/.*',
          '!**/{element.coffee,element.html,element.js,.git}/**'
        ],
        this.destinationPath(),
        {process: replaceInformation}
      );

      this.fs.copy(
        this.templatePath('element.html'),
        this.destinationPath(this.name + '.html'),
        {process: replaceInformation}
      );

      this.fs.copy(
        this.templatePath('element.' + (this.coffeescript ? 'coffee' : 'js')),
        this.destinationPath(this.name + '.' + (this.coffeescript ? 'coffee' : 'js')),
        {process: replaceInformation}
      );
    },

    install: function () {
      this.installDependencies({
        npm: false,
        skipInstall: this.options['skip-install'],
        skipMessage: this.options['skip-install-message']
      });
    }
  });
}).call(this);
