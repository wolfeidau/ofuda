module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg:'<json:package.json>',
        test:{
            files:['test/**/*_test.js']
        },
        lint:{
            files:['grunt.js', 'lib/**/*.js', 'test/**/*.js', 'spec/**/*_test.js']
        },
        watch:{
            files:'<config:lint.files>',
            tasks:'default'
        },
        jshint:{
            options:{
                curly:true,
                eqeqeq:true,
                immed:true,
                latedef:true,
                newcap:true,
                noarg:true,
                sub:true,
                undef:true,
                boss:true,
                eqnull:true,
                node:true,
                mocha:true
            },
            globals:{
                exports:true
            }
        },
        simplemocha: {
            all: {
                src: 'test/**/*.js',
                options: {
                    globals: ['should'],
                    timeout: 3000,
                    ignoreLeaks: false,
                    ui: 'bdd',
                    reporter: 'spec'
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-simple-mocha');

    // Default task.
    grunt.registerTask('default', 'simplemocha');

    // override the default test target
    grunt.registerTask('test', 'simplemocha');
};