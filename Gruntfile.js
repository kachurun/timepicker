module.exports = function(grunt) {
    require('time-grunt')(grunt);
    grunt.initConfig({
        pkg: require('./package.json'),
    });
    
    // Load per-task config from separate files.
    grunt.loadTasks('grunt');
    
    grunt.registerTask('default', 'dev');
    grunt.registerTask('dev', ['concurrent:devFirst','concurrent:devSecond','concurrent:devThird']);
    grunt.registerTask('prod', ['concurrent:prodFirst','concurrent:prodSecond','concurrent:prodThird']);
    grunt.registerTask('watchdog', ['watch']);
};