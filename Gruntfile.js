/*global module */
/*global require */
module.exports = function (grunt) {
    'use strict';

    grunt.loadNpmTasks('grunt-release');

    grunt.registerTask('default', [
        'grunt-release'
    ]);
};
