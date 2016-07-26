var _ = require('lodash');
var path = require('path');
var through2 = require('through2');
var pluginList = {
    'qiniu': require('./qiniu')
};
module.exports = function (options) {
    if (!_.isObject(options)) {
        throw Error('gulp-cdn-service param options must be object')
    }
    if (!pluginList[options.name]) {
        throw Error("gulp-cdn-service don't haved cdn : " + options.name)
    }
    var processPath = options.processPath || process.cwd();
    var removePrefix = options.removePrefix || '';
    var cdn = new (pluginList[options.name])(options);
    return through2.obj(function(file, enc, cb) {
      var that = this;
      if (file.isNull()) {
        return cb(null, file);
      }
      var filepath = file.path;
      var key = path.relative(path.join(processPath,removePrefix), filepath);
      cdn.uploadNotExists(options.config.bucket,key, filepath, function (err, data) {
        cb(err, file);
      });
    });
}