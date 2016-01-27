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
     * Copy Tasks
     * ===============================
     */
    copy: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= paths.src %>',
          src: ['<%= paths.directory %>/<%= paths.images %>/**/*.{png,jpg,jpeg,gif}', '_components/**/*.{png,jpg,jpeg,gif}'],
          dest: '<%= paths.tmp %>/<%= paths.directory %>/<%= paths.images %>',
          flatten: true
        }]
      }
    },

    /**
     * SCSS Compilation Tasks
     * ===============================
     */
    compass: {
      options: {
        sassDir: '<%= paths.src %>/<%= paths.directory %>',
        httpImagesPath: '<%= paths.src %>/<%= paths.images %>'
      },
      dev: {
        options: {
          cssDir: '<%= paths.tmp %>/<%= paths.directory %>/css',
          imagesDir: '<%= paths.tmp %>/<%= paths.directory %>/<%= paths.images %>',
          outputStyle: 'expanded',
          noLineComments: false
        }
      },
      dist: {
        options: {
          force: true,
          cssDir: '<%= paths.dist %>/<%= paths.directory %>/css',
          imagesDir: '<%= paths.dist %>/<%= paths.directory %>/<%= paths.images %>',
          noLineComments: true,
          assetCacheBuster: false,
          outputStyle: "compact"
        }
      }
    },

    /**
     * Jade Compilation Tasks
     * ===============================
     */
    jade: {
      dist: {
        options: {
          pretty: true
        },
        files: [{
          expand: true,
          cwd: '<%= paths.src %>',
          src: ['<%= paths.directory %>/**/*.jade'],
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
      compass: {
        files: ['<%= paths.src %>/scss/**/*.scss'],
        tasks: ['compass:dev']
      },
      jade: {
        options: {
          spawn: false,
          livereload: true
        },
        files: [
          '<%= paths.src %>/<%= paths.directory %>/<%= paths.file %>.jade',
          '<%= paths.src %>/{_layouts,_components}/**/*.jade'
        ],
        tasks: ['jade']
      },
      livereload: {
        options: {
          livereload: '<%= connect.options.livereload %>',
        },
        files: [
          '<%= paths.tmp %>/<%= paths.directory %>/<%= paths.file %>.html',
          '<%= paths.tmp %>/<%= paths.directory %>/css/{,*/}*.css',
          '<%= paths.tmp %>/<%= paths.directory %>/<%= paths.images %>/{,*/}*.{png,jpg,jpeg,gif}'
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
          base: '<%= paths.tmp %>/<%= paths.directory %>',
          open: {
            target: 'http://<%= connect.options.hostname %>:<%= connect.options.port %>/<%= paths.file %>.html'
          }
        }
      },
      dist: {
        options: {
          keepalive: true,
          livereload: false,
          base: '<%= paths.dist %>/<%= paths.directory %>'
        }
      }
    },

    /**
     * Cleanup Tasks
     * ===============================
     */
    clean: {
      dev: ['<%= paths.tmp %>'],
      dist: ['<%= paths.dist %>/<%= paths.directory %>']
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
        src: '<%= paths.tmp %>/<%= paths.directory %>/<%= paths.file %>.html',
        dest: '<%= paths.dist %>/<%= paths.directory %>/index.txt'
      },
      dist: {
        src: '<%= paths.tmp %>/<%= paths.directory %>/<%= paths.file %>.html',
        dest: '<%= paths.dist %>/<%= paths.directory %>/index.html'
      }
    },

    /**
     * Replacement Tasks
     * ===============================
     */
    replace: {
      imageDir: {
        src: '<%= paths.dist %>/<%= paths.directory %>/index.html',
        dest: '<%= paths.dist %>/<%= paths.directory %>/index.html',
        replacements: [{
          from: '/<%= paths.images %>/',
          to: '/'
        }, {
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
      return grunt.task.run(['build', 'connect:dist']);
    }

    grunt.task.run([
      'chooseFile',
      'clean:dev',
      'copy',
      'compass:dev',
      'jade',
      'connect:dev',
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
    'mkdir',
    'img_find_and_copy',
    'compass:dist',
    'jade',
    'imagemin',
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
