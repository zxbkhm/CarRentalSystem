var express = require("express")
var app = express()
var mongoose = require("mongoose")
var formidable = require("formidable")
var crypto = require("crypto")

var IDValidator  = require("id-validator")
var idCard = require('idcard');
var Validator = new IDValidator();
mongoose.connect("mongodb://localhost/zuche")

var admin = require("./models/admin.js")
var user = require("./models/user.js")
var car = require("./models/car.js")
var rent=require('./models/rentOut.js')
var count = require("./models/count.js")
var session = require('express-session')
app.use(session({
    secret: 'kaola',
    resave: false,
    saveUninitialized: true
}));

//静态资源
app.set("view engine","ejs")
app.use(express.static("public"))

//显示首页（登录）
app.get("/",function (req, res) {
    var login = req.session.login == true ? true : false;
    var admin = req.session.admin == true ? true : false;
    if (login) {
        res.redirect("/showIndex")
    }else {
        res.render("login",{
            admin:admin
        })
    }

})
//注册管理员
app.get("/adminReg",function (req, res) {
    res.render("adminReg")
    req.session.admin = true;
})
//验证重复
app.get("/adminReg/:name",function (req, res) {
    var yonghuming = req.params.name;
    admin.getAmdinName(yonghuming,function (err, data) {
        if(data){
            res.json({"result":-2})
        }else{
            res.json({"result":1})
            res.redirect("/")
        }
    })
})
//确定注册
app.post("/doadminReg",function (req, res) {
    var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields) {
        var  yonghuming=fields.yonghuming;
        var  mima=fields.mima;
        admin.addAdmin(yonghuming,mima,function (err) {
            if(err){
                res.json({"result":-1});

            }else{
                res.json({"result":1});
            }

        })
    });
})
//显示登录页，并判断登录
app.post("/login",function (req, res) {
    var form = new formidable.IncomingForm()
    form.parse(req,function (err, fields) {
        admin.guanli(fields,function (err,data) {
            if(err){
                res.send({"result":-1});
                return
            }
            if(data.length==0){
                res.send({"result":-2});
                return
            }
            var jiamiMiMa= crypto.createHmac('SHA256',fields.mima).digest('hex');
            if(jiamiMiMa==data[0].password){
                req.session.login = true;
                res.send({"result":1});
            }
            else{
                res.send({"result":-3});
            }
        })
    })
})
//登陆后显示首页
app.get("/showIndex",function (req, res) {
    res.render("index")
})



//关于客户档案的接口
app.get("/customer",function (req, res) {
    if(req.session.login == true){
        res.render("customer")
    }else{
        res.send("请先登录<a href=/>返回首页</a>")
    }

})
//获取所有客户渲染
app.get("/alluser",function (req, res) {
    user.getAll(function (err, data) {
        if (err) {
            res.json({"result":-1})
        }else{
            var arr=[];
            var xinxi=null;
            var sex = null
            for(var i=0;i<data.length;i++){
                xinxi = idCard.info(data[i].shenfenzheng);

                if(xinxi.gender=="M"){
                    sex = "男"
                }else{
                    sex = "女"
                }
                var app={
                    "name":data[i].yonghuming,
                    "shenfenzheng":data[i].shenfenzheng,
                    "shoujihao":data[i].shoujihao,
                    "dizhi":data[i].dizhi,
                    "xingzuo":xinxi.constellation,
                    "sex":sex,
                };
                arr.push(app);
            }
            res.json({"results":arr});
        }
    })

})
//注册客户
app.get("/reg",function (req, res) {
    res.render("reg")
})
//判断客户名是否重复
app.get("/repeat/:name",function (req, res) {
    var yonghuming = req.params.name;
    user.getUserName(yonghuming,function (err, data) {
        if(data){
            res.json({"result":-2})
        }else{
            res.json({"result":1})
        }
    })
})
//验证身份证号是否正确
app.get("/id/:id",function (req, res) {
    var id = req.params.id;
    var xinxi = idCard.info(id);
    if(Validator.getInfo( id )){
        res.json({"result":1})
    }else{
        res.json({"result":-1})
    }
})
//确定注册
app.post("/doreg",function (req, res) {
    var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields) {
        var  yonghuming=fields.yonghuming;
        var  shenfenzheng=fields.shenfenzheng;
        var  shoujihao=fields.shoujihao;
        var  mima=fields.mima;
        var xinxi = idCard.info(shenfenzheng);
        var dizhi=xinxi.address;
        user.addUser(yonghuming,shenfenzheng,shoujihao,mima,dizhi,function (err) {
            if(err){
                res.json({"result":-1});

            }else{
                res.json({"result":1});
            }

        })
    });
})
//修改信息
app.post("/keep",function (req, res) {
    var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields) {
        user.updateOne(fields,function(err){
            if (err) {
                res.json({"result":-1})
            }else{
                res.json({"result":1})
            }
        });
    });
})
//删除用户
app.get("/userDel/:name",function (req, res) {
    var obj = req.params.name
    var arr = obj.split(",")
    for (var i = 0; i < arr.length; i++) {
        user.Remove(arr[i],function (err, data) {
            if (err) {
                res.send("出错")
            }else{
                res.json({"result":1})
            }
        })
    }
})


//关于所有汽车的接口
//显示汽车档案
app.get("/car",function (req, res) {
    if(req.session.login == true){
        res.render("car")
    }else{
        res.send("请先登录<a href=/>返回首页</a>")
    }
})
//获取所有汽车
app.get("/allcar",function (req, res) {
    car.getAllCar(function (err, data) {
        if (err) {
            res.send("服务器错误")
        }else{

            var arr=[];
            var zu = null;
            for(var i=0;i<data.length;i++){
                if(data[i].state =="false"){
                    zu = "未出租"
                }else{
                    zu = "已出租"
                }
                var app={
                    "carname":data[i].carname,
                    "class":data[i].class,
                    "money":data[i].money,
                    "chuzu":zu,
                };
                arr.push(app);

            }
            res.json({"results":arr});
        }
    })
})
//增加汽车
app.get("/addCar",function (req, res) {
    var arr = []
    car.getAllCar(function (err, data) {
        if(err){
            res.send("出错了")
        }else{
            for(var i = 0; i < data.length; i++){
                for(var j = i + 1; j < data.length; j++){
                    if(data[i].class === data[j].class){
                        j = ++i;
                    }
                }
                arr.push(data[i].class);
            }
        }
        res.render("addCar",{
            arr:arr
        })

    })
})
//验证汽车是否存在
app.get("/findCar/:carname",function (req, res) {
    var carname = req.params.carname;
    car.findOne(carname,function (err, data) {
        if(data.length==0){
            res.json({"result":1})
        }else{
            res.json({"result":-2})
        }
    })
})
//确认添加
app.post("/doadd",function (req, res) {
    var form = new formidable.IncomingForm()
    form.parse(req,function (err, fields) {

        car.addNewCar(fields,function (err, data) {
            if (err) {
                res.json({"result":-1})
            }else{
                res.json({"result":1})
            }
        })
    })
})
//修改信息
app.post("/keepCar",function (req, res) {
    var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields) {
        car.updataMoney(fields,function(err){
            if (err) {
                res.json({"result":-1})
            }else{
                res.json({"result":1})
            }
        });
    });
})
//删除汽车
app.get("/del/:name",function (req, res) {
    var obj = req.params.name
    var arr = obj.split(",")

    for (var i = 0; i < arr.length; i++) {
        car.Remove(arr[i],function (err, data) {
            if (err) {
                res.send("出错")
            }else{
                res.json({"result":1})
            }
        })
    }
})



//显示类别档案
app.get("/class",function (req, res) {
    var arr = []
    car.getAllCar(function (err, data) {
        if(err){
            res.send("出错了")
        }else{
            for(var i = 0; i < data.length; i++){
                for(var j = i + 1; j < data.length; j++){
                    if(data[i].class === data[j].class){
                        j = ++i;
                    }
                }
                arr.push(data[i].class);
            }
        }

        if(req.session.login == true){
            res.render("class",{
                arr:arr
            })
        }else{
            res.send("请先登录<a href=/>返回首页</a>")
        }


    })

})
//显示每个类别汽车
app.get("/getClassCar/:name",function (req, res) {
    var classname = req.params.name;
    car.findK(classname,function (err, data) {

        if (err) {
            res.send("出错了")
        }else{
            var arr=[];
            var zu = null;
            for(var i=0;i<data.length;i++){
                if(data[i].state =="false"){
                    zu = "未出租"
                }else{
                    zu = "已出租"
                }
                var app={
                    "carname":data[i].carname,
                    "money":data[i].money,
                    "chuzu":zu,
                };
                arr.push(app);

            }

            res.json({"result":arr});
        }
    })
})



//显示租赁页
app.get("/rent",function (req, res) {
    car.getAllCar(function (err, data) {
        if(err){
            res.send("出错了")
        }else{
            var arr = []
            for(var i = 0; i < data.length; i++){
                for(var j = i + 1; j < data.length; j++){
                    if(data[i].class === data[j].class){
                        j = ++i;
                    }
                }
                arr.push(data[i].class);
            }
        }
        if(req.session.login == true){
            res.render("rent",{
                arr:arr
            })
        }else{
            res.send("请先登录<a href=/>返回首页</a>")
        }


    })
})
//不显示已租出车辆
app.get("/getClassCars/:name",function (req, res) {
    var classname = req.params.name;
    car.findK(classname,function (err, data) {

        if (err) {
            res.send("出错了")
        }else{
            var arr=[];
            var zu = null;
            for(var i=0;i<data.length;i++){
                if(data[i].state =="false"){
                    zu = "未出租"
                }else{
                    zu = "已出租"
                }
                var app={
                    "carname":data[i].carname,
                    "money":data[i].money,
                    "chuzu":zu,
                };
                arr.push(app);

            }

            res.json({"result":arr});
        }
    })
})
//判断租赁车数
app.get("/countuser/:name",function (req, res) {
    var name = req.params.name
    rent.counts(name,function (data) {
       res.json({"result":data})
    })
})
//计算金额
app.post("/suan",function (req, res) {
    var form = new formidable.IncomingForm()
    form.parse(req,function (err,fields) {
        car.findOne(fields.carname,function (err, data) {
            var a = fields.renttime*data[0].money
            res.json({"result": a})
        })
    })
})
//确定租出
app.post('/rentOut',function (req,res) {
    var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files) {

        rent.add(fields,true,function (err, data) {
            if (err) {
                res.json({"result":-1})
            }else{
                car.updataOne(fields.carname,true,function (err, data) {
                    if (err) {
                        res,json({"result":-2})
                    }else{
                        res.json({"result":1})
                    }
                })

            }
        })

    });
})



//归还登记页面
app.get("/returns",function (req, res) {
    if(req.session.login == true){
        res.render("returns")
    }else{
        res.send("请先登录<a href=/>返回首页</a>")
    }
})
//查看所有租赁信息
app.get("/lookrent",function (req, res) {
    rent.getAllrent(function (err, data) {
        res.json({"result":data})
    })
})
//确定归还
app.post("/doreturn",function (req, res) {
    var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files) {
        var leibie = null
        var many = 0
        var money = 0
       car.findOne(fields.carname,function (err,data) {
           leibie = data[0].class
           carname = data[0].carname
           console.log(leibie)
           count.findOneClass(leibie,function (data) {
               console.log(data)
              if(data.length==0){
                  count.addCount(leibie,1,fields.yingfu,function (err, data) {
                        if(err){
                            res.json({"result":-1})
                        }else{
                            rent.removeCar(carname,function (err, data) {
                                if(err){
                                    res.json({"result":-1})
                                }else{
                                    car.updataOne(carname,false,function (err, data) {
                                        if(err){
                                            res.json({"result":-1})
                                        }else{
                                            res.json({"result":1})
                                        }
                                    })
                                }
                            })
                        }
                  })
              }else{
                  many = data[0].data.many
                  money = data[0].data.money
                  many+=1
                  var a = Number(fields.yingfu)
                  money = money + a
                  console.log(money)
                  count.updataRenturn(leibie,many,money,function (err, data) {
                      if (err){
                          res.json({"result":-1})
                      }else{
                          rent.removeCar(carname,function (err, data) {
                              if(err){
                                  res.json({"result":-1})
                              }else{
                                  car.updataOne(carname,false,function (err, data) {
                                      if(err){
                                          res.json({"result":-1})
                                      }else{
                                          res.json({"result":1})
                                      }
                                  })
                              }
                          })
                      }
                  })
              }
           })
       })
    })
})


//统计
app.get("/statistics",function (req, res) {
    if(req.session.login == true){
        res.render("statistics")
    }else{
        res.send("请先登录<a href=/>返回首页</a>")
    }

})
//渲染图
app.get("/tu",function (req, res) {
    var arr = []
    count.findAll(function (err, data) {
        console.log(data)
        res.json({"result":data})
    })


})
//获取所有类别
app.get("/all",function (req, res) {
    var arr = []
    car.getAllCar(function (err, data) {
        if(err){
            res.send("出错了")
        }else{
            for(var i = 0; i < data.length; i++){
                for(var j = i + 1; j < data.length; j++){
                    if(data[i].class === data[j].class){
                        j = ++i;
                    }
                }
                arr.push(data[i].class);
            }
        }
        res.json({
            "arr":arr
        })

    })
})



//退出登录
app.get("/del",function (req, res) {
    req.session.login=""
    res.redirect("/")
})


app.listen(3001)