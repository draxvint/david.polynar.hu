var gulp        = require('gulp');
var browserSync = require('browser-sync');
var sass        = require('gulp-sass');
var prefix      = require('gulp-autoprefixer');
var cp          = require('child_process');
var cleanCSS = require('gulp-clean-css');
var concat = require('gulp-concat');

var messages = {
    jekyllBuild: '<span style="color: grey">Running:</span> $ jekyll build'
};

/**
 * Build the Jekyll Site
 */
gulp.task('jekyll-build', function (done) {
    browserSync.notify(messages.jekyllBuild);
    return cp.spawn('jekyll', ['build'], {stdio: 'inherit'})
        .on('close', done);
});

gulp.task('jekyll-build-drafts', function (done) {
    browserSync.notify(messages.jekyllBuild);
    return cp.spawn('jekyll', ['build', '--drafts'], {stdio: 'inherit'})
        .on('close', done);
});

/**
 * Rebuild Jekyll & do page reload
 */
gulp.task('jekyll-rebuild', gulp.series('jekyll-build', function (done) {
    browserSync.reload();
    done();
}));
gulp.task('jekyll-rebuild-drafts', gulp.series('jekyll-build-drafts', function (done) {
    browserSync.reload();
    done();
}));
/**
 * Compile files from _scss into both _site/css (for live injecting) and site (for future jekyll builds)
 */
gulp.task('sass', function (done) {
    return gulp.src('_sass/**/*.scss')
        .pipe(sass({
            includePaths: ['css'],
            onError: browserSync.notify
        }))
        .pipe(cleanCSS())
        .pipe(prefix(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true }))
        //.pipe(concat('style.min.css'))
        .pipe(gulp.dest('_site/css'))
        .pipe(browserSync.reload({stream:true}))
        .pipe(gulp.dest('css'));
    done();

});

/**
 * Wait for jekyll-build, then launch the Server
 */
gulp.task('browser-sync', gulp.series('sass', 'jekyll-build', function(done) {
    browserSync.init({
        server: {
            baseDir: '_site/'
        }
    });
    done();
}));

gulp.task('browser-sync-drafts', gulp.series('sass', 'jekyll-build-drafts', function (done) {
    browserSync.init({
        server: {
            baseDir: '_site/'
        }
    });
    done();
}));

/**
 * Watch scss files for changes & recompile
 * Watch html/md files, run jekyll & reload BrowserSync
 */
gulp.task('watch', function () {
    gulp.watch('_sass/**/*.scss', gulp.series('sass'));
    gulp.watch(['*.html', '_layouts/**/*.html', 'collections/**/*'], gulp.series('jekyll-rebuild'));
    gulp.watch(['*.js', 'js/*.js'], gulp.series('jekyll-rebuild'));
    gulp.watch(['_config.yml'], gulp.series('jekyll-rebuild'));
});

gulp.task('watch-drafts', function () {
    gulp.watch('_sass/**/*.scss', gulp.series('sass'));
    gulp.watch(['*.html', '_layouts/**/*.html', 'collections/**/*', '_drafts/*'], gulp.series('jekyll-rebuild-drafts'));
    gulp.watch(['*.js', 'js/*.js'], gulp.series('jekyll-rebuild-drafts'));
    gulp.watch(['_config.yml'], gulp.series('jekyll-rebuild-drafts'));
});

/**
 * Default task, running just `gulp` will compile the sass,
 * compile the jekyll site, launch BrowserSync & watch files.
 */
gulp.task('default', gulp.parallel('browser-sync', 'watch'));

gulp.task('drafts', gulp.parallel('browser-sync-drafts', 'watch-drafts'));
