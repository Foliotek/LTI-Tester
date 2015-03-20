module.exports = function (grunt) {

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		connect: {
			dev: {
				options: {
					port: 8000,
					base: './'
				}
			},
			dist: {
				options: {
					port: 8000,
					base: './dist/',
					keepalive: true
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
			},
			dist: {
				options: {
					cleancss: true
				},
				files: {
					'./dist/css/all.min.css': ['./css/main.less']
				}
			}
		},

		copy: {
			dist: {
				files: [
					{ expand: true, flatten: true, src:'*.html', dest:'./dist/', filter: 'isFile' },
					{ expand: true, flatten: true, src: 'bower_components/font-awesome/fonts/*.*', dest: './dist/fonts/', filter: 'isFile' },
					{ expand: true, flatten: true, src: 'img/*.*', dest: './dist/img/', filter: 'isFile' }
				]
			}
		},

		useminPrepare: {
			html: 'dist/**/*.html',
			options: {
				dest: 'dist',
				root: './'
			}
		},
		usemin: {
			html: ['dist/{,*/}*.html'],
			// css: ['dist/css/{,*/}*.css'],
			options: {
				dirs: ['dist']
			}
		},

		watch: {
			evrthing: {
				files: ['./css/*.less'], //, './js/*.js'],
				tasks: ['less:development']
			},
		}, 
		clean: {
			all: ['dist']
		}
	});

	grunt.loadNpmTasks('grunt-contrib-connect');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-usemin');
	grunt.loadNpmTasks('grunt-newer');

	/* grunt tasks */
	grunt.registerTask('default', [
		'less:development', 
		'connect:dev', 
		'watch'
	]);

	var prodWatch = grunt.option('nowatch');
	var prodTasks = [
		'clean',
		'copy',
		'useminPrepare', 
		'concat:generated',
		'uglify:generated',
		'less:dist',
		'cssmin:generated',
		'usemin'
	];
	if (!prodWatch) {
		prodTasks.push('connect:dist');
	}
	grunt.registerTask('prod', prodTasks);
};