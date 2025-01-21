const gulp = require("gulp");
const webpackStream = require("webpack-stream");
const webpack = require('webpack');
const sass = require("gulp-sass")(require("sass"));

const dist = "C:/OSPanel/domains/ADMIN_PANEL_REACT_AND_PHP/admin";

gulp.task("copy-html", ()=> {
    return gulp.src("./app/src/index.html")
                .pipe(gulp.dest(dist))
});

gulp.task("build-js", (done) => {
  return gulp.src("./app/src/main.js")
              .pipe(webpackStream({
                  mode: 'development',
                  output: {
                      filename: 'script.js',
                  },
                  watch: false,
                  devtool: "eval-source-map",
                  module: {
                      rules: [
                          {
                              test: /\.(?:js|mjs|cjs)$/,
                              exclude: /node_modules/,
                              use: {
                                  loader: 'babel-loader',
                                  options: {
                                      targets: "defaults",
                                      presets: [
                                          ['@babel/preset-env', {
                                              debug: true,
                                              corejs: 3,
                                              useBuiltIns: "usage",
                                          }],
                                          "@babel/react"
                                      ]
                                  }
                              }
                          }
                      ]
                  }
              }, webpack))
              .pipe(gulp.dest(dist))
              .on('end', done); 
});

gulp.task("build-sass",()=>{
  return gulp.src("./app/scss/style.scss")
              .pipe(sass().on('error', sass.logError))
              .pipe(gulp.dest(dist))
});

gulp.task("copy-api",()=>{
  return gulp.src("./app/api/**/*.*")
      
              .pipe(gulp.dest(dist + "/api"))
});

gulp.task("copy-assets",()=>{
  return gulp.src("./app/assets/**/*.*")
              .pipe(gulp.dest(dist + "/assets"))
});


//автоматический таск ( следит за всеми изенениями) - перед началом работы запускаем gulp watch

gulp.task("watch", ()=>{
  gulp.watch("./app/src/index.html", gulp.parallel("copy-html"));
  gulp.watch("./app/src/**/*.*", gulp.parallel("build-js"));
  gulp.watch("./app/scss/**/*.scss", gulp.parallel("build-sass"));
  gulp.watch("./app/api/**/*.*", gulp.parallel("copy-api"));
  gulp.watch("./app/assets/**/*.*", gulp.parallel("copy-assets"));
})

//task для того, чтобы отслеживались изменения до запуска gulp watch

gulp.task("build", gulp.parallel("copy-html", "build-js", "build-sass", "copy-api", "copy-assets"));


//настройка, чтобы при команде gulp выполнялся gulp build
gulp.task("default", gulp.parallel("watch", "build"));