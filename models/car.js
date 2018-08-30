var mongoose = require("mongoose")

var crypto = require("crypto")

var CarSchema = mongoose.Schema({
    "carname": String,
    "class": String,
    "money": Number,
    "state": String
});
var Car = mongoose.model("car",CarSchema)

//获取所有车辆
exports.getAllCar = function (callback) {
    Car.find({}, function (err, data) {
        callback(err,data)
    });

}

//增加新车辆
exports.addNewCar = function (fields, callback) {
    Car.create({"carname":fields.carname,"class":fields.class,"money":fields.money,"state":"false"},function (err,data) {
        callback(err,data)
    })
}

//按表格添加数据
exports.addxlsx = function(arr,callback){

}
//查找是否车辆已经存在
exports.findOne = function (v,callback) {
    Car.find({"carname": v },function (err, data) {
        callback(err,data)
    })
}

//修改其中一项
exports.updataOne = function(carname,v,callback){
    Car.update({"carname":carname},{$set:{"state":v}},function (err, data) {
        callback(err,data)
    })
}
//修改价格
exports.updataMoney = function(fields,callback){
    Car.update({"carname":fields.carname},{$set:{"money":fields.money}},function (err, data) {
        callback(err,data)
    })
}


//查找一类别
exports.findK = function (v, callback) {
    Car.find({"class": v },function (err, data) {
        callback(err,data)
    })
}

//删除汽车
exports.Remove = function (v, callback) {
    Car.remove({"carname": v },function (err, data) {
        callback(err,data)
    })
}



