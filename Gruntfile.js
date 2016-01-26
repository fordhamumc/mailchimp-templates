module.exports = function (grunt) {
    'use strict';
    
    // List all files in the app directory.
    var templates = grunt.file.expand({filter: 'isFile', cwd: 'app'},
                                      ['*.html']);

    // Make actual choices out of them that grunt-prompt can use.
    var choices = templates.map(function (t) {
        return { name: t.replace('.html','')};
    });
    
    // Show elapsed time after tasks run
    require('time-grunt')(grunt);
    
    // Load all Grunt tasks
    require('load-grunt-tasks')(grunt);
    
    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        /**
         * Project Paths Configuration
         * ===============================
         */
        paths: {
            images: 'img',
            src: 'app',
            email: templates[0].replace('.html', ''),
            dist: 'dist',
            distDomain: '', 
        		sender: {
          		service: '',
          		user: '',
              pass: ''
        		},
        		recipients: {
          		name: '',
          		email: '',
          		subject: ''
        		}
        },

        /**
         * SCSS Compilation Tasks
         * ===============================
         */
        compass: {
            options: {
                sassDir: '<%= paths.src %>/scss',
                outputStyle: 'expanded',
                httpImagesPath: '/img/'
            },
            dev: {
                options: {
                    cssDir: '<%= paths.src %>/css',
                    imagesDir: '<%= paths.src %>/<%= paths.images %>',
                    noLineComments: false
                }
            },
            dist: {
                options: {
                    force: true,
                    cssDir: '<%= paths.dist %>/<%= paths.email %>/css',
                    imagesDir: '<%= paths.dist %>/<%= paths.email %>/<%= paths.images %>',
                    noLineComments: true,
                    assetCacheBuster: false,
                    outputStyle: "compact"
                }
            }
        },

        /**
         * Watch Task
         * ===============================
         */
        watch: {
            compass: {
                files: ['<%= paths.src %>/scss/**/*.scss'],
                tasks: ['compass:dev']
            },
            livereload: {
                options: {
                    livereload: '<%= connect.options.livereload %>'
                },
                files: [
                    '<%= paths.src %>/<%= paths.email %>.html',
                    '<%= paths.src %>/css/{,*/}*.css',
                    '<%= paths.src %>/<%= paths.images %>/{,*/}*.{png,jpg,jpeg,gif}'
                ]
            }
        },

        /**
         * Server Tasks
         * ===============================
         */
        connect: {
            options: {
                open: true,
                hostname: 'localhost',
                port: 8000,
                livereload: 35729
            },
            dev: {
                options: {
                    base: '<%= paths.src %>',
                    open: {
                      target: 'http://<%= connect.options.hostname %>:<%= connect.options.port %>/<%= paths.email %>.html'
                    }
                }
            },
            dist: {
                options: {
                    keepalive: true,
                    livereload: false,
                    base: '<%= paths.dist %>/<%= paths.email %>'
                }
            }
        },

        /**
         * Cleanup Tasks
         * ===============================
         */
        clean: {
            dist: ['.tmp', '<%= paths.dist %>/<%= paths.email %>']
        },
        mkdir: {
          dist: {
            options: {
              create: ['.tmp']
            },
          },
        },

        /**
         * Images Optimization Tasks
         * ===============================
         */
        img_find_and_copy: {
          dist: {
            options: {
              cwd: '<%= paths.src %>'
            },
            files: {
              '.tmp': ['<%= paths.src %>/css/**/*.css', '<%= paths.src %>/<%= paths.email %>.html']
            }
          }
        }, 
        
        imagemin: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '.tmp/<%= paths.src %>',
                    src: '<%= paths.images %>/{,*/}*.{png,jpg,jpeg,gif}',
                    dest: '<%= paths.dist %>/<%= paths.email %>'
                }]
            }
        },

        /**
         * Premailer Parser Tasks
         * ===============================
         */
        premailer: {
            options: {
                baseUrl: '<%= paths.distDomain %>'
            },
            plain: {
                options: {
                    mode: 'txt'
                },
                src: '<%= paths.src %>/<%= paths.email %>.html',
                dest: '<%= paths.dist %>/<%= paths.email %>/index.txt'
            },
            dist: {
                src: '<%= paths.src %>/<%= paths.email %>.html',
                dest: '<%= paths.dist %>/<%= paths.email %>/index.html'
            }
        },
        
         /**
         * Replacement Tasks
         * ===============================
         */
        replace: {
          imageDir: {
            src: '<%= paths.dist %>/<%= paths.email %>/index.html',
            dest: '<%= paths.dist %>/<%= paths.email %>/index.html', 
            replacements: [{
              from: '/img/', 
              to: '/'
            },
            {
              from: 'margin', 
              to: 'Margin'
            }]
          }
        },

        /**
         * Test Mailer Tasks
         * ===============================
         */
        nodemailer: {
            options: {
                transport: {
                    type: 'SMTP',
                    options: {
                        service: '<%= paths.sender.service  %>',
                        auth: {
                            user: '<%= paths.sender.user  %>',
                            pass: '<%= paths.sender.pass  %>'
                        }
                    }
                },
                message: {
                  subject: '<%= paths.recipients.subject  %>'
                },
                recipients: [
              		{
                		name: '<%= paths.recipients.name  %>',
                		email: '<%= paths.recipients.email %>'
              		}
            		]
            },
            dist: {
                src: ['<%= paths.dist %>/<%= paths.email %>/index.html']
            }
        },
        
        prompt: {
            chooseFile: {
              options: {
                questions: [{
                  config: 'paths.email',
                  type: 'list',
                  message: 'Which email should we build?',
                  choices: choices
                }]
              }
            },
            target: {
                options: {
                    questions: [{
                        config: 'paths.recipients.name',
                        type: 'input',
                        message: 'Who should we send this to (name)?',
                        default: '<%= paths.recipients.name  %>'
                    },
                    {
                        config: 'paths.recipients.email',
                        type: 'input',
                        message: 'Who should we send this to (email)?',
                        default: '<%= paths.recipients.email  %>'
                    },
                    {
                        config: 'paths.recipients.subject',
                        type: 'input',
                        message: 'What is the subject?',
                        default: '<%= paths.recipients.subject  %>'
                    }]
                }
            }
        }

    });

    grunt.registerTask('default', 'serve');

    grunt.registerTask('serve', function (target) {
        
      if (target === 'dist') {
        return grunt.task.run(['build', 'connect:dist']);
      }
  
      grunt.task.run([
        'chooseFile',
        'compass:dev',
        'connect:dev',
        'watch'
      ]);
    });
    
    
    grunt.registerTask('chooseFile', function (target) {
        
      if (templates.length > 1) {
        return grunt.task.run(['prompt:chooseFile']);
      }
    });
    
    grunt.registerTask('build', [
        'chooseFile',
        'clean',
        'mkdir',
        'img_find_and_copy',
        'imagemin',
        'compass:dist',
        'premailer:dist',
        'premailer:plain',
        'replace'
    ]);

    grunt.registerTask('send', [
        'build',
        'prompt:target',
        'nodemailer'
    ]);

};
