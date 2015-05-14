module.exports = function(grunt) {
    var autoprefixer = require('autoprefixer-core'),
    csswring = require('csswring');
    
    grunt.config('postcss',{
        all: {
            options: {
                processors: [
                  autoprefixer({ browsers: ['last 2 versions', 'ie 8', 'ie 9'] }).postcss,
                  csswring().postcss
                ]
            },
            src: 'css/*.css'
        },
    });
    grunt.loadNpmTasks('grunt-postcss');
};