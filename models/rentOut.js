var mongoose = require('mongoose');
// mongoose.connect('mongodb://localhost/rentcars');
var Schema = mongoose.Schema;
var crypto = require("crypto");
var dbsc = new Schema({
    renttime : Number,
    name:  String,
    carname:  String,
    money:  Number,
    allmoney:  Number,
    paymoney:  Number,
    nowtime:String,
    returntime:String,
    stat:Boolean
});
var rout = mongoose.model('rent', dbsc)

//租赁汽车
exports.add = function (fields,bool, callback) {
    // console.log(fields)
    var time = new Date()
    var times = time.getTime()
    var nowTimes = times/1000+86400*fields.renttime
    console.log(times,Math.floor(nowTimes))
    rout.create({"renttime":fields.renttime,"name":fields.name,"carname":fields.carname,"money":fields.money,"allmoney":fields.allmoney,"paymoney":fields.paymoney,"nowtime":fields.nowTime,"returntime":fields.returnTime,"stat":bool},function (err,data) {
        callback(err,data)
    })
}

//获取所有的租赁信息
exports.getAllrent = function(callback){
    rout.find({},function (err, data) {
        callback(err,data)
    })
}

//统计租赁车数
exports.counts = function(name,callback){
    rout.find({"name":name},function (err, data) {
        rout.count({"stat": true}, function (err, count_a) {
            callback(count_a)
        })
    })

}

//删除表格中已经归还的车辆
exports.removeCar = function (carname, callback) {
    rout.remove({"carname":carname},function (err, data) {
        callback(err,data)
    })
}

//更改stat不显示已经归还车辆
exports.updataOne = function (carname, callback) {
    rout.update({"carname":carname},{$set:{"stat":false}},function (err, data) {
        callback(err,data)
    })
}

