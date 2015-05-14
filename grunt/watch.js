module.exports = function(grunt) {
    grunt.config('watch',{
        options: {
            spawn: false,
            livereload: true
        },

        scripts: {
            files: [
                'src/scripts/*.js'
            ],
            tasks: [
                'jshint',
                'uglify'
            ]
        },

        styles: {
            files: [
                'src/styles/*.scss'
            ],
            tasks: [
                'sass:dev',
                'postcss'
            ]
        },
    });
    
    grunt.loadNpmTasks('grunt-contrib-watch');
};