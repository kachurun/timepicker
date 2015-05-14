module.exports = function(grunt) {
    grunt.config('jshint',{
        
        options: {
            reporter: require('jshint-stylish')
        },

        main: [
            'src/scripts/*.js'
        ]
    });
    grunt.loadNpmTasks('grunt-contrib-jshint');
};