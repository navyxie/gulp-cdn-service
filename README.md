# gulp-cdn-service

## usage

```js
var cnd = require('gulp-cdn-service');
var gulp = require('gulp');
var path = require('path');
gulp.task('demo',function(){
  return gulp.src('images/**/*.*')
    .pipe(cnd({
      name: 'qiniu',
      config: {
        ACCESS_KEY: "xxxxx",
        SECRET_KEY: "xxxxx",
        bucket: "koala-program-upload"
      },
      debug: true, //default: true
      processPath: process.cwd(), //default: process.cwd()
      removePrefix: 'images'
    }))
})
gulp.task('default',['demo']);
```