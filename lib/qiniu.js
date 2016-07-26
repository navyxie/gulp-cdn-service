var qiniu = require('qiniu');
var _ = require('lodash');
var chalk = require('chalk');
function log (msg, color) {
    if (!chalk[color]) {
        color = 'green';
    }
    console.log(chalk[color](msg));
}
function Qiniu (config) {
    if (!_.isObject(config)) {
        throw Error('qiniu config param error, param must be object');
    }
    if (!_.isObject(config.config)) {
        throw Error('qiniu config param error, param must be object, and has a key config, which is object');
    }
    if (!config.config.ACCESS_KEY || !config.config.SECRET_KEY) {
        throw Error('qiniu config param missing ACCESS_KEY or SECRET_KEY')
    }
    this.config = config;
    this._init();
    return this;
}

Qiniu.prototype._init = function () {
    qiniu.conf.ACCESS_KEY = this.config.config.ACCESS_KEY;
    qiniu.conf.SECRET_KEY = this.config.config.SECRET_KEY;
}
Qiniu.prototype._log = function (msg, color) {
    if (this.config.debug) {
        log(msg, color);
    }
}
Qiniu.prototype._uptoken = function (bucket, key) {
    if (!bucket) {
        bucket = this.config.config.bucket;
    }
    if (arguments.length === 1) {
        key = bucket;
        bucket = this.config.config.bucket;
    }
    if (!bucket) {
        throw Error('qiniu uptoken error, missing param bucket');
    }
    return  new qiniu.rs.PutPolicy(bucket + ":" + key).token();
}
Qiniu.prototype.stat = function (bucket, key, cb) {
    var client = new qiniu.rs.Client();
    //获取文件信息
    client.stat(bucket, key, function(err, ret) {
        if (!err) {
            cb(err, {code: 0, data: ret})
        } else {
            cb(err);
        }
    });
}
Qiniu.prototype.exists = function (bucket, key, cb) {
    var that = this;
    that._log('qiniu exists action exec start -> bucket : ' + bucket + ', key : ' + key +' ...');
    this.stat(bucket, key, function (err, data) {
        if (err) {
            if (_.isObject(err)) {
                if (err.code === 612) {
                    that._log('qiniu exists action exec end -> bucket : ' + bucket + ', key : ' + key +' not exists.', 'blue');
                    cb(null, false)
                } else {    
                    that._log('qiniu exists action exec end -> bucket : ' + bucket + ', key : ' + key +' is err : ' + JSON.stringify(err), 'red');
                    cb(err);
                }
            } else {
                that._log('qiniu exists action exec end -> bucket : ' + bucket + ', key : ' + key +' is err : ' + JSON.stringify(err), 'red');
                cb(err);
            }
        } else {
            that._log('qiniu exists action exec end -> bucket : ' + bucket + ', key : ' + key +' is exists.', 'blue');
            cb(null, true, data);
        }
    })
}
Qiniu.prototype.upload = function (bucket, key, localFile, cb) {
    var that = this;
    var extra = new qiniu.io.PutExtra();
    var uptoken = this._uptoken(bucket, key);
    that._log('qiniu upload action exec start -> bucket : ' + bucket + ', key : ' + key + ', localFile : ' + localFile + ' ...');
    qiniu.io.putFile(uptoken, key, localFile, extra, function(err, ret) {
        if (!err) {
            // 上传成功， 处理返回值
            that._log('qiniu upload action exec end -> bucket : ' + bucket + ', key : ' + key +', localFile : ' + localFile + ' upload success.', 'blue');
            cb(err, {code: 0, data: ret});
        } else {
            // 上传失败， 处理返回代码
            that._log('qiniu upload action exec end -> bucket : ' + bucket + ', key : ' + key +', localFile : ' + localFile + ' upload error : ' + JSON.stringify(err), 'red');
            cb(err);
        }
    });
}
Qiniu.prototype.uploadNotExists = function (bucket, key, localFile, cb) {
    var that = this;
    this.exists(bucket, key, function (err, exists, data) {
        if (err) {
            cb(err);
        } else {
            if (exists) {
                data.data.key = key;
                cb(null, data);
            } else {
                that.upload(bucket, key, localFile, cb);
            }
        }
    })
}
module.exports = Qiniu;