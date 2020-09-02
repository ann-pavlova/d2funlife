/**
 * Usage
 *
 * Build project:
 * $ gulp
 * or
 * $ gulp build
 *
 * Watch for sass changes
 * $ gulp watch
 */

'use strict';

const gulp          = require('gulp');
const uglify        = require('gulp-uglify');
const rename        = require('gulp-rename');
const plumber       = require('gulp-plumber');
const handlebars    = require('gulp-handlebars');
const defineModule  = require('gulp-define-module');
const sass          = require('gulp-sass');
const map           = require('map-stream');
const chmod         = require('gulp-chmod');
const notify        = require('gulp-notify');
const tap           = require('gulp-tap');
const notifier      = require('node-notifier');
const changed       = require('gulp-changed');
const jade          = require('gulp-jade');
const jadeInh       = require('gulp-jade-inheritance');
const gulpif        = require('gulp-if');
const spritesmith   = require('gulp.spritesmith');
const prettify      = require('gulp-prettify');
const typograf      = require('gulp-typograf');
const babel         = require('gulp-babel');
const svgSprite     = require('gulp-svg-sprite');
const svgo          = require('gulp-svgo');
const browserSync   = require('browser-sync').create();
const eslint        = require('gulp-eslint');
const argv          = require('yargs').argv;
// postcss plugins
const postcss       = require('gulp-postcss');
const autoprefixer  = require('autoprefixer');
const flexbugsfixes = require('postcss-flexbugs-fixes');
const styleLint     = require('gulp-stylelint');
//uglify
const cssnano       = require('gulp-cssnano');
const uglifyjs      = require('gulp-uglify');
const sourcemaps    = require('gulp-sourcemaps');

/**
 * Error function for plumber
 * @param  {Object} error
 */
var onError = notify.onError('Ошибка в <%= error.plugin %>');

/**
 * Configuring paths
 * @type {Object}
 */

var paths = {};

paths.srcBase         = 'src';
paths.src             = {};
paths.src.scriptsBase = paths.srcBase + '/scripts';
paths.src.scripts     = paths.src.scriptsBase + '/**/*.js';
paths.src.stylesBase  = paths.srcBase + '/styles';
paths.src.styles      = paths.src.stylesBase + '/**/*.scss';
paths.src.tpl         = paths.src.scriptsBase + '/**/*.hbs';
paths.src.jadeBase    = paths.srcBase + '/jade';
paths.src.jade        = paths.src.jadeBase + '/**/*.jade';
paths.src.spriteSvg   = paths.srcBase + '/sprites/svg/**/*.svg';

paths.buildBase          = 'www';
paths.build              = {};
paths.build.scripts      = paths.buildBase + '/scripts';
paths.build.scriptsFiles = [paths.buildBase + '/scripts/**/*.js', '!www/scripts/lib/**/*'];
paths.build.styles       = paths.buildBase + '/styles';
paths.build.stylesFiles  = paths.buildBase + '/styles/**/*.css';
paths.build.tpl          = paths.build.scripts;
paths.build.jade         = paths.buildBase + '/html';
paths.build.spriteSvg    = paths.buildBase + '/img/sprite';

paths.html = paths.buildBase + '/**/*.html';

var buildCss = function() {
    return gulp.src(paths.src.styles)
        .pipe(sass())
        .on('error', notify.onError({
            message: 'Line: <%= error.lineNumber %>:' +
            ' <%= error.message %>' +
            '\n<%= error.fileName %>',
            title  : '<%= error.plugin %>'
        }))
        .on('error', function() {
            this.emit('end');
        })
        .pipe(postcss([
            autoprefixer({
                browsers: ['last 3 versions'],
                cascade : false
            }),
            flexbugsfixes()
        ]))
        .pipe(gulp.dest(paths.build.styles))
        .pipe(browserSync.stream());
};

gulp.task('svg-sprite', function() {
    return gulp.src(paths.src.spriteSvg)
        .pipe(svgSprite({
            mode: {
                symbol: {
                    prefix    : '.b-icon__',
                    dest      : '',
                    dimensions: '',
                    sprite    : 'sprite.svg',
                    example   : false
                }
            },
            svg : {
                xmlDeclaration     : false,
                doctypeDeclaration : false,
                rootAttributes     : {
                    class: 'b-icons__svg'
                },
                namespaceClassnames: false
            }
        }))
        .pipe(gulp.dest(paths.build.spriteSvg));
});

/**
 * Build tasks
 */

// Main build task
let buildTasks = [];

if (argv.prod) {
    buildTasks = [
        'hooks',
        'styles',
        'buildScripts',
        'jade',
        'svg-sprite',
        'minify'
    ];
} else {
    buildTasks = [
        'hooks',
        'styles',
        'buildScripts',
        'jade',
        'svg-sprite'
    ];
}

gulp.task('build', buildTasks);

gulp.task('styles', function() {
    return buildCss();
});

gulp.task('css', function() {
    return buildCss();
});

gulp.task('buildScripts', function jsTask() {
    return gulp.src(paths.src.scripts, {
        base: paths.src.scriptsBase
    })
        .pipe(changed(paths.build.scripts))
        .pipe(plumber({
            errorHandler: notify.onError({
                message: 'Line: <%= error.lineNumber %>:' +
                ' <%= error.message %>' +
                '\n<%= error.fileName %>',
                title  : '<%= error.plugin %>'
            })
        }))
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(plumber.stop())
        .pipe(gulp.dest(paths.build.scripts))
        .pipe(browserSync.stream());
});

gulp.task('jade', function() {
    return gulp.src(paths.src.jade)
        .pipe(changed(paths.build.jade, {extension: '.html'}))
        .pipe(jadeInh({basedir: paths.src.jadeBase}))
        .pipe(jade({
            pretty: true
        }))
        .on('error', function(e) {
            console.log(`Filename: ${e.filename}`);
            console.log(`Message: ${e.msg}`);
            console.log(`Path: ${e.message}`);
        })
        .on('error', function() {
            this.emit('end');
        })
        .pipe(typograf({
            lang   : 'ru',
            disable: ['ru/nbsp/centuries', 'common/number/fraction']
        }))
        .pipe(prettify({
            indent_size: 4
        }))
        .pipe(gulp.dest(paths.build.jade))
        .pipe(browserSync.stream());
});


/**
 * Lint tasks
 */

// Main lint task
gulp.task('lint', ['eslint', 'style-lint']);

gulp.task('style-lint', function sassLintTask() {
    return gulp.src(paths.src.styles)
        .pipe(styleLint({
            configFile    : '.stylelintrc',
            failAfterError: false,
            debug         : true,
            syntax        : 'scss',
            reporters     : [
                {formatter: 'string', console: true}
            ]
        }));
});

gulp.task('eslint', function() {
    return gulp.src(paths.src.scripts)
        .pipe(eslint({
            configFile: '.eslintrc.json'
        }))
        .pipe(eslint.format())
        // To have the process exit with an error code (1) on
        // lint error, return the stream and pipe to failAfterError last.
        .pipe(eslint.failAfterError());

});

/**
 * Hook tasks
 */

gulp.task('hooks', function() {
    gulp.src('hooks/*')
        .pipe(chmod({
            execute: true
        }))
        .pipe(gulp.dest('.git/hooks/'));
});

/**
 * Notify task
 s */
gulp.task('pre-commit-notify', function() {
    notifier.notify({
        message: 'Fix errors first',
        title  : 'Commit failed'
    });
});

/**
 * Server
 */
gulp.task('browser-sync', function() {
    browserSync.init({
        server: {
            baseDir: 'www',
        },
        port  : 8080,
        open: false
    })
});

/**
 * UGLIFY
 */
gulp.task('npm installify', ['css-nano', 'uglifyJS']);

gulp.task('css-nano', ['styles'], function() {
    return gulp.src(paths.build.stylesFiles)
        .pipe(sourcemaps.init())
        .pipe(cssnano())
        .pipe(sourcemaps.write('sourcemaps'))
        .pipe(gulp.dest(paths.build.styles));
});

gulp.task('uglifyJS', ['buildScripts'], function() {
    gulp.src(paths.build.scriptsFiles)
        .pipe(sourcemaps.init())
        .pipe(uglify())
        .pipe(sourcemaps.write('sourcemaps'))
        .pipe(gulp.dest(paths.build.scripts));
});

/**
 * Watch task
 */
gulp.task('watch', ['build', 'browser-sync'], function watch() {
    gulp.watch(paths.src.styles, ['css']);
    gulp.watch(paths.src.scripts, ['buildScripts']);
    gulp.watch(paths.src.jade, ['jade']);
    gulp.watch(paths.src.spriteSvg, ['svg-sprite']);
});

// Run
gulp.task('default', ['build']);
