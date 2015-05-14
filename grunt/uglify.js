module.exports = function(grunt) {
    grunt.config('uglify',{
        all: {
            files: [{
                expand: true,
                cwd: 'src/scripts',
                src: '**/*.js',
                dest: 'js',
                ext: '.min.js'
            }]
        }
    });
grunt.loadNpmTasks('grunt-contrib-uglify');
};