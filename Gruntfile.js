module.exports = function (grunt) {

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		connect: {
			dev: {
				options: {
					port: 8000,
					base: './'
				}
			}
		},

		less: {
			development: {
				options: {
					cleancss: true
				},
				files: {
					'./css/all.min.css': ['./css/main.less']
				}
			}
		},

		watch: {
			evrthing: {
				files: ['./css/*.less'] //, './js/*.js'],
				tasks: ['less']
			},
		}, 

	});

	grunt.loadNpmTasks('grunt-contrib-connect');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-newer');

	/* grunt tasks */
	grunt.registerTask('default', [
		'less', 
		'connect', 
		'watch']);
};