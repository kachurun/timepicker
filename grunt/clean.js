module.exports = function(grunt) {
    grunt.config('clean',{
        all: 'clean:prod',
        prod: [
        '**/*.map'
        ],
    });
    grunt.loadNpmTasks('grunt-contrib-clean');
};