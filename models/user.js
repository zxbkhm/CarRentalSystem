var mongoose = require("mongoose")

var crypto = require("crypto")

var UserSchema = mongoose.Schema({
    "yonghuming": String,
    "shenfenzheng": String,
    "shoujihao": String,
    "mima": String,
    "dizhi":String
});
var User = mongoose.model("user",UserSchema)


//获取所有
exports.getAll = function (callback) {
    User.find({},function (err,data) {
        console.log(data)
        callback(err,data);
    })
}

//通过用户名查找是否重复
exports.getUserName = function(yonghuming,callback){
    User.findOne({"yonghuming":yonghuming},function (err, data) {
        callback(err,data)
    })
}

//获取其中一项属性
exports.getOne = function (yonghuming, k, callback) {
    User.findOne({"yonghuming": yonghuming}, function (err, doc) {
        callback(err, doc[k]);
    });
}

//添加用户
exports.addUser = function (yonghuming,shenfenzheng,shoujihao,mima,dizhi,callback) {
    var jiamimima= crypto.createHmac('SHA256',mima).digest('hex');
    User.create({"yonghuming":yonghuming,"shenfenzheng":shenfenzheng,"shoujihao":shoujihao,"mima":jiamimima,"dizhi":dizhi},function (err,data) {
        callback(err,data)
    })
}

//用户信息修改
exports.updateOne = function (fields, callback) {
    User.update({"shenfenzheng":fields.shenfenzheng},{$set:{"shoujihao":fields.shoujihao,"dizhi":fields.dizhi}},function (err) {
       callback(err)
    })
}
//删除用户
exports.Remove = function (v, callback) {
    User.remove({"yonghuming": v },function (err, data) {
        callback(err,data)
    })
}