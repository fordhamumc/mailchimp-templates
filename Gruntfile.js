module.exports = function(grunt) {
  'use strict';

  // List all files in the app directory.
  var templates = grunt.file.expand({
    filter: 'isFile',
    cwd: 'app'
  }, ['**/*.jade', '!_*/**/*.jade']);

  // Make actual choices out of them that grunt-prompt can use.
  var choices = templates.map(function(t) {
    return {
      name: t.substr(t.indexOf('/') + 1).replace('.jade', ''),
      value: t.replace('.jade', '')
    };
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
      directory: templates[0].substr(0, templates[0].indexOf('/')),
      file: templates[0].substr(templates[0].indexOf('/') + 1).replace('.jade', ''),
      tmp: '.tmp',
      dist: 'dist',
      distDomain: '',
      sender: {
    		service: 'gmail',
    		user: '',
        pass: ' '
      },
      recipients: {
        name: '',
        email: '',
        subject: ''
      }
    },

    /**
     * Copy Tasks
     * ===============================
     */
    copy: {
      images: {
        files: [{
          expand: true,
          cwd: '<%= paths.src %>',
          src: ['<%= paths.directory %>/<%= paths.images %>/**/*.{png,jpg,jpeg,gif}', '_components/**/*.{png,jpg,jpeg,gif}'],
          dest: '<%= paths.tmp %>/<%= paths.directory %>/<%= paths.images %>',
          flatten: true
        }]
      },
      styles: {
        files: [{
          expand: true,
          cwd: '<%= paths.src %>',
          src: '{<%= paths.directory %>,_layouts,_components}/**/*.{scss,sass}',
          dest: '<%= paths.tmp %>/<%= paths.directory %>/styles',
          flatten: true
        }]
      }
    },

    /**
     * CSS Tasks
     * ===============================
     */
    sass: {
      dev: {
        options: {
          lineNumbers: true
        },
        files: [{
          expand: true,
          cwd: '<%= paths.tmp %>',
          src: '<%= paths.directory %>/styles/**/*.{scss,sass}',
          dest: '<%= paths.tmp %>',
          ext: '.css'
        }]
      },
      dist: {
        options: {
          sourcemap: 'none',
          style: 'expanded'
        },
        files: [{
          expand: true,
          cwd: '<%= paths.tmp %>',
          src: '<%= paths.directory %>/styles/**/*.{scss,sass}',
          dest: '<%= paths.tmp %>',
          ext: '.css'
        }]
      }
    },
    uncss: {
      dist: {
        options: {
          ignoreSheets : [/fonts.googleapis/],
        },
        files: [{
          src: '<%= paths.tmp %>/<%= paths.directory %>/<%= paths.file %>.html',
          dest: '<%= paths.tmp %>/<%= paths.directory %>/styles/styles.css'
        }]
      }
    },
    cmq: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= paths.tmp %>',
          src: '<%= paths.directory %>/styles/**/*.css',
          dest: '<%= paths.tmp %>'
        }]
      }
    },
    processhtml: {
      dist: {
        files: [{
           src: '<%= paths.tmp %>/<%= paths.directory %>/<%= paths.file %>.html',
           dest: '<%= paths.dist %>/<%= paths.directory %>/index.html'
        }]
      },
    },

    /**
     * Jade Compilation Tasks
     * ===============================
     */
    jade: {
      dev: {
        options: {
          pretty: true,
          data: function(dest, src) {
            return require('./' + src[0].replace(/(?=[\w-]+\.jade$).+/i,'') + 'data-dev.json');
          }
        },
        files: [{
          expand: true,
          cwd: '<%= paths.src %>',
          src: ['<%= paths.directory %>/*.jade'],
          dest: '<%= paths.tmp %>',
          ext: '.html'
        }]
      },
      dist: {
        options: {
          pretty: true,
          data: function(dest, src) {
            // Return an object of data to pass to templates
            return require('./' + src[0].replace(/(?=[\w-]+\.jade$).+/i,'') + 'data-prod.json');
          }
        },
        files: [{
          expand: true,
          cwd: '<%= paths.src %>',
          src: ['<%= paths.directory %>/*.jade'],
          dest: '<%= paths.tmp %>',
          ext: '.html'
        }]
      }
    },

    /**
     * Watch Task
     * ===============================
     */
    watch: {
      options: {
        spawn: false
      },
      sass: {
        files: ['<%= paths.src %>/{<%= paths.directory %>,_layouts,_components}/**/*.{scss,sass}'],
        tasks: ['copy:styles','sass:dev']
      },
      jade: {
        files: [
          '<%= paths.src %>/<%= paths.directory %>/*.json',
          '<%= paths.src %>/<%= paths.directory %>/<%= paths.file %>.jade',
          '<%= paths.src %>/{_layouts,_components}/**/*.jade'
        ],
        tasks: ['jade:dev']
      },
      image: {
        files: [
          '<%= paths.src %>/<%= paths.directory %>/<%= paths.images %>/**/*.{png,jpg,jpeg,gif}', 
          '<%= paths.src %>/_components/**/*.{png,jpg,jpeg,gif}'
        ],
        tasks: ['copy:images']
      }
    },

    /**
     * Server Tasks
     * ===============================
     */
    
    browserSync: {
      dev: {
        bsFiles: {
          src: [
            '<%= paths.tmp %>/<%= paths.directory %>/<%= paths.file %>.html',
            '<%= paths.tmp %>/<%= paths.directory %>/styles/{,*/}*.css',
            '<%= paths.tmp %>/<%= paths.directory %>/<%= paths.images %>/{,*/}*.{png,jpg,jpeg,gif}'
          ]
        },
        options: {
          server: {
            baseDir: [
              '<%= paths.tmp %>/<%= paths.directory %>'
            ],
            index: "<%= paths.file %>.html"
          },
          port: 3000,
          watchTask: true
        }
      },
      dist: {
        options: {
          server: {
            baseDir: '<%= paths.dist %>/<%= paths.directory %>'
          }
        }
      }
    },

    /**
     * Cleanup Tasks
     * ===============================
     */
    clean: {
      dev: ['<%= paths.tmp %>'],
      dist: ['<%= paths.tmp %>', '<%= paths.dist %>/<%= paths.directory %>']
    },
    mkdir: {
      dist: {
        options: {
          create: ['<%= paths.tmp %>']
        },
      },
    },

    /**
     * Images Optimization Tasks
     * ===============================
     */
    imagemin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= paths.tmp %>',
          src: '<%= paths.directory %>/<%= paths.images %>/{,*/}*.{png,jpg,jpeg,gif}',
          dest: '<%= paths.dist %>'
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
        recipients: [{
          name: '<%= paths.recipients.name  %>',
          email: '<%= paths.recipients.email %>'
        }]
      },
      dist: {
        src: ['<%= paths.dist %>/<%= paths.directory %>/index.html']
      }
    },

    prompt: {
      chooseFile: {
        options: {
          questions: [{
            config: 'paths.file',
            type: 'list',
            message: 'Which email should we build?',
            choices: choices,
            filter: function(answer) {
              grunt.config('paths.directory', answer.substr(0, answer.indexOf('/')));
              return answer.substr(answer.indexOf('/') + 1)
            }
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
          }, {
            config: 'paths.recipients.email',
            type: 'input',
            message: 'Who should we send this to (email)?',
            default: '<%= paths.recipients.email  %>'
          }, {
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

  grunt.registerTask('serve', function(target) {

    if (target === 'dist') {
      return grunt.task.run(['build', 'browserSync:dist']);
    }

    grunt.task.run([
      'chooseFile',
      'clean:dev',
      'copy',
      'sass:dev',
      'jade:dev',
      'browserSync:dev',
      'watch'
    ]);
  });


  grunt.registerTask('chooseFile', function(target) {

    if (templates.length > 1) {
      return grunt.task.run(['prompt:chooseFile']);
    }
  });

  grunt.registerTask('build', [
    'chooseFile',
    'clean:dist',
    'copy',
    'sass:dist',
    'jade:dist',
    'imagemin',
    //'uncss',
    'cmq',
    'processhtml',
  ]);

  grunt.registerTask('send', [
    'build',
    'prompt:target',
    'nodemailer'
  ]);

};
