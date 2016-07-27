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

## gulp-cdn-service 结合 gulp-custom-css-urls 使用例子

```js
var gulp = require('gulp');
var customCssUrls = require('gulp-custom-css-urls');
var cdnService = require('gulp-cdn-service');
var clean = require('gulp-clean');
var path = require('path');

//提取替换css中的图片
gulp.task('customCSSUrl',function(){
  return gulp.src('assets/**/*.css')
    .pipe(customCssUrls({
      //静态文件相对于站点根目录的路径
      staticfile_relative_website_rootpath: 'assets/', 
      //是否输出CSS中匹配的图片
      outputImage: true, 
      //输出的图片路径，默认是“./.gulp_dist_output_images”
      outputImage_path: './.gulp_dist_output_images',
      //对图片路径进行处理
      modify: function (imageRelativePath, cssFilePath, imageRelativeWebsiteRootPath, imgInfo) {
        // 让CSS中图片的地址转化为相对于站点的地址，比如：/images/demo/custom_1782_530.3503865059.png
        return path.join(imageRelativeWebsiteRootPath, path.basename(imageRelativePath));
      },
      //为图片地址添加前缀，通常为CDN根目录地址
      prepend: 'http://oaytcec7g.bkt.clouddn.com',
    }))
    .pipe(gulp.dest('dist/'));//替换图片地址后CSS的输出路径
});

//将task customCSSUrl 导出的图片上传至CDN
gulp.task('uploadToCdn', ['customCSSUrl'], function () {
  return gulp.src('./.gulp_dist_output_images/**/*')
    .pipe(cdnService({
      //CDN名字
      name: 'qiniu',
      //CDN的配置信息
      config: {
        ACCESS_KEY: "*****",//七牛ACCESS_KEY
        SECRET_KEY: "*****",//七牛SECRET_KEY
        bucket: "koala-program-upload"//七牛的bucket名字
      },
      //是否开启图片上传至CDN的log
      debug: true, //default: true
      //需要去掉的图片地址前缀
      removePrefix: './.gulp_dist_output_images'
    }))
});

//清除task customCSSUrl 导出的图片
gulp.task('clean', ['uploadToCdn'], function () {
  return gulp.src('./.gulp_dist_output_images')
    .pipe(clean())
});

//构建任务
gulp.task('default',['customCSSUrl', 'uploadToCdn', 'clean']);
```