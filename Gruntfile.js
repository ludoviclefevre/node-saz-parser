'use strict';
module.exports = function (grunt) {
    // Show elapsed time at the end
    require('time-grunt')(grunt);
    // Load all grunt tasks
    require('load-grunt-tasks')(grunt);

    grunt.initConfig({
        jshint: {
            options: {
                jshintrc: '.jshintrc',
                reporter: require('jshint-stylish')
            },
            gruntfile: {
                src: ['Gruntfile.js']
            },
            js: {
                src: [
                    'index.js',
                    'lib/*.js'
                ]
            },
            test: {
                src: ['test/*.js']
            }
        },
        jscs: {
            src: [
                '<%= jshint.js.src %>',
                '<%= jshint.test.src %>',
                '<%= jshint.gruntfile.src %>'
            ]
        },
        mochacov: {
            unit: {
                options: {
                    reporter: 'spec'
                }
            },
            coverage: {
                options: {
                    reporter: 'mocha-term-cov-reporter',
                    coverage: true
                }
            },
            coveralls: {
                options: {
                    coveralls: {
                        serviceName: 'travis-ci'
                    }
                }
            },
            options: {
                files: 'test/*.js',
                ui: 'bdd',
                colors: true
            }
        },
        watch: {
            gruntfile: {
                files: '<%= jshint.gruntfile.src %>',
                tasks: ['jshint:gruntfile']
            },
            js: {
                files: '<%= jshint.js.src %>',
                tasks: ['jshint:js', 'mochacli']
            },
            test: {
                files: '<%= jshint.test.src %>',
                tasks: ['jshint:test', 'mochacli']
            }
        }
    });

    grunt.registerTask('test', ['jshint', 'jscs', 'mochacov:unit', 'mochacov:coverage']);
    grunt.registerTask('travis', ['jshint', 'jscs', 'mochacov:unit', 'mochacov:coverage', 'mochacov:coveralls']);
    grunt.registerTask('default', 'test');
};
