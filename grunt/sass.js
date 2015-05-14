module.exports = function(grunt) {
    grunt.config('sass', {
    // Development settings
    dev: {
        options: {
            outputStyle: 'nested',
            sourceMap: true,
        },
        files: [{
            expand: true,
            cwd: 'src/styles',
            src: ['*.scss'],
            dest: 'css',
            ext: '.css'
        }],
    },
    // Production settings
    prod: {
        options: {
            outputStyle: 'nested',
            sourceMap: false,
        },
        files: [{
            expand: true,
            cwd: 'src/styles',
            src: ['*.scss'],
            dest: 'css',
            ext: '.css'
        }],
    }
    });
    grunt.loadNpmTasks('grunt-sass');
};