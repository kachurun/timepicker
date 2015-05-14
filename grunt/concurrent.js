module.exports = function(grunt) {
    grunt.config('concurrent',{
    
        options: {
            limit: 3
        },

        devFirst: [
            'clean',
            'jshint'
        ],
        devSecond: [
            'sass:dev',
            'uglify',
        ],
        devThird: [
            'postcss'
        ],

        prodFirst: [
            'clean',
            'jshint'
        ],
        prodSecond: [
            'sass:prod',
            'uglify'
        ],
        prodThird: [
            'postcss'
        ]
    
    });
    grunt.loadNpmTasks('grunt-concurrent');
};