var express = require('express');
var router = express.Router();
var Util = require('./Util')
var GridStore = require("mongodb").GridStore
var ObjectID = require("mongodb").ObjectID
var assert = require('assert');
var Binary = require('mongodb').Binary
var q = require('q')
var paramsProvided = {};

router.all('/', function(req, res, next) {
  res.render('index');
    next()
});
router.all('/login',function(req,res){
    var db = req.app.locals.db
    return Util.getRequestParams(req).then(function (params) {
        paramsProvided = params;
        if (params.hasOwnProperty('username') && params.hasOwnProperty('password')) {
            return validateUser(params, db)
        }
    }).then(function (data) {
        if(data && data._id){
            res.send({
                "error": false,
                "user": {
                    _id:data._id,
                    name:data.name,
                    created_at:new Date()
                }
            })
            //req.path = "/home"
            //res.redirect('/home')
        }
        else if(data && data.error_msg){
            res.send(data)
        }
        else{
            res.send({
                "error": 1,
                "error_msg": "Unknown error occurred in login!"
            })
        }
    })
})

router.all('/search',function(req,res){
    var db = req.app.locals.db
    return Util.getRequestParams(req).then(function (params) {
        paramsProvided = params;
        return searchDoctor(params,db)
    }).then(function (data) {
        if(data._id){
            console.log("inside if ")
            res.send(data)
        }
        else{
            console.log("inside else ")
            res.send("something wrong ")
        }
    })
})

router.all('/home', function (req, res) {
    var db = req.app.locals.db
    return validatingUserToken(req,db).then(function(data){
        printValue("40",data)
        if(data && data._id){
            res.render('freedoctorhelpline');
        }
        else{
            res.render('index');
        }
    })
});

router.all('/uploadFile', function(req,res) {
    var db = req.app.locals.db
    var gridStore = new GridStore(db, new ObjectID().toString(), "test_gs_getc_file", "w")
    gridStore.open(function(err, gridStore) {
        gridStore.write(new Buffer("hello, world!", "utf8"), function(err, gridStore) {
            gridStore.close(function(err, fileData) {
                console.log(" 3 >>>>>",fileData)
                console.log(" err >>>>>",err)
                assert.equal(null, err);
                gridStore = new GridStore(db, new ObjectID(), "test_gs_getc_file", "w");
                gridStore.open(function(err, gridStore) {
                    // Write some content to the file
                    gridStore.write(new Buffer("hello, world!", "utf8"), function(err, gridStore) {
                        // Flush the file to GridFS
                        gridStore.close(function(err, fileData) {
                            assert.equal(null, err);

                            // Open the file in read mode using the filename
                            var gridStore2 = new GridStore(db, "test_gs_getc_file", "r");
                            gridStore2.open(function(err, gridStore) {

                                // Read first character and verify
                                gridStore.getc(function(err, chr) {
                                    console.log(">>>>>>",chr.toString())
                                    assert.equal('h', chr);

                                    // Open the file using an object id
                                    gridStore2 = new GridStore(db, "test_gs_getc_file", "r");
                                    gridStore2.open(function(err, gridStore) {

                                        // Read first character and verify
                                        gridStore.getc(function(err, chr) {
                                            assert.equal('h', chr);

                                        })
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });

    res.send("called uploading file ")
})
router.all('/location',function(req,res){
    console.log("inside /location")
})


router.all('/forget_password', function (req, res) {
            res.render('forgetPassword');
});
router.all('/reset', function (req, res) {
    var db = req.app.locals.db
    return Util.getRequestParams(req).then(function (params) {
        paramsProvided = params;
        if (params.username.length > 0 && params.password.length > 0) {
            return validateUserWhileReset(params, db)
        }
        else{
            req.path = "/"
            res.redirect('/')
        }
    }).then(function (data) {
        if(data){
            return updatePassword(paramsProvided, db)
        }
        else{
            res.send("Either username or password is Wrong !!")
        }
    }).then(function(updated){
        printValue("updated",updated)
        if(updated){
            return resetTokenGEnerator(paramsProvided,db)

        }
    }).then(function(token) {
        if(token){
            res.cookie("token", token, { maxAge: 10*60*1000 });
            req.path = '/home'
            res.redirect('/home')
        }
    })
});




function validateUser(params, db) {
    if (params && params.username && params.password) {
        return findAlreadySignUpUser(params, db).then(function (data) {
            if (data && data._id) {
                return data;
            }
            else {
                    return {
                        "tag": "login",
                        "success": 0,
                        "error": 1,
                        "error_msg" :"Either username or password is Wrong !!"
                    }
            }
        })
    }
}


function resetTokenGEnerator(params,  db) {
    var token = genrateToken()
    printValue(">>>>>>>", token)
    var d = q.defer();
    db.collection('pl.connections').insertOne({
        token: token,
        username: params.username,
        "login_time": new Date()
    }, function (err, doc) {
        if (err) {
            d.reject(err);
        } else {
            d.resolve(token);
        }
    });
    return d.promise;
}
function genrateToken() {
    return require("crypto").createHash('sha1').update(ObjectID().toString()).digest("hex")
}
function validateUserWhileReset(params, db) {
    if (params && params.username) {
        return findUserForReset(params, db).then(function (data) {
            if (data && data._id) {
                return true;
            }
            else {
                    return false
            }
        })
    }
}
function updatePassword(params, db) {
    if (params && params.username) {
        return updateReset(params, db).then(function (data) {
            if (data && data.result && data.result["ok"]) {
                return true;
            }
            else {
                    return false
            }
        })
    }
}

function findAlreadySignUpUser(params, db) {
    var d = q.defer()
    console.log("<>><<<<<<<<<<<<"+JSON.stringify(params))
    db.collection('pl.users').findOne({name: params.username ,password: params.password}, function (err, doc) {
        console.log("220 >>>>>>>>>>>",doc)
        d.resolve(doc)
    })
    return d.promise;
}
function updateReset(params, db) {
    var d = q.defer()
    db.collection('pl.users').updateOne({name: params.username },{$set:{"password":params.password}}, function (err, doc) {
        d.resolve(doc)
    })
    return d.promise;
}

function findUserForReset(params, db) {
    var d = q.defer()
    db.collection('pl.users').findOne({name: params.username}, function (err, doc) {
        d.resolve(doc)
    })
    return d.promise;
}
function validatingUserToken(req, db) {
    var d = q.defer()
    if(req && req.cookies && req.cookies.token){
        db.collection('pl.connections').findOne({token: req.cookies.token}, function (err, doc) {
            d.resolve(doc)
        })
    }
    else{
        d.resolve()
    }
    return d.promise;
}
function searchDoctor(params,db){
    var d = q.defer()
    params = {city:params.city,location:params.location,doctor:params.doctor}
    db.collection('pl.search').findOne(params, function (err,doc) {
        if(!err){
            d.resolve(doc)
        }
        else{
            d.resolve(err)
        }
    })
    return d.promise
}

function printValue(string,data){
    console.log(string +" >>>>>>>>>>" +((data) ? JSON.stringify(data):""))
}


module.exports = router;
