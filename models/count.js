var mongoose = require('mongoose');
var countSchema = mongoose.Schema({
    "data":{
        "class":String,
        "many": Number,
        "money":Number
    }
});
var count = mongoose.model('count', countSchema)


//获取所有数据
exports.findAll = function(callback){
    count.find({},function (err,data) {
        callback(err,data)
    })
}


//统计金额和租赁次数
exports.addCount = function (leibie,many,money,callback) {
    count.create({"data":{"class":leibie,"many":many,"money":money}},function (err,data) {
        callback(err,data)
    })
}

//查找是否租赁过此类别汽车
exports.findOneClass = function (leibie,callback) {
    count.find({"data.class":leibie},function (err,data) {
            callback(data)
    })
}

//统计一类汽车的租赁次数
exports.updataRenturn = function (leibie,many,money,callback) {
    count.update({"data.class":leibie},{$set:{"data.many":many,"data.money":money}},function (err, data) {
        callback(err,data)
    })
}