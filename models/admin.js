var mongoose=require("mongoose")
var crypto = require("crypto")
var adminSchema = mongoose.Schema({
    "username": String,
    "password": String,

});
var Admin = mongoose.model("guanli",adminSchema);

exports.guanli = function(fields,callback){
    console.log(fields.yonhuming)
    Admin.find({"username":fields.yonhuming},function (err,data) {
        callback(err,data)
    })
};
//添加管理员
exports.addAdmin = function (name,mima, callback) {
    var jiamimima= crypto.createHmac('SHA256',mima).digest('hex');
    Admin.create({"username":name,"password":jiamimima},function (err,data) {
        callback(err,data)
    })
}
//验证重复
exports.getAmdinName = function(yonghuming,callback){
    Admin.findOne({"username":yonghuming},function (err, data) {
        callback(err,data)
    })
}

