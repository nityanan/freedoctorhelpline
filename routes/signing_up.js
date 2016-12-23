var express = require('express');
var q = require('q')
var router = express.Router();
var Util = require('./Util');
var ObjectID = require("mongodb").ObjectID
//var popup = require('window-popup').windowPopup;
//var popupS = require('popups');
var paramsProvided = {}
var validateReturnData;

router.post('/', function (req, res) {
    var db = req.app.locals.db
    return Util.getRequestParams(req).then(function (params) {
        paramsProvided = params;
        if (params.hasOwnProperty('username') && params.hasOwnProperty('password')) {
            return validateUser(params, db)
        }
    }).then(function (data) {
        validateReturnData = data
        if (data) {
            //req.path = "/signing_up/home"
            return saveUserConnection(paramsProvided, res, db)
        }
        else {
            res.render('already_exist');
        }
    }).then(function(token){
        if(validateReturnData){
            res.cookie("token", token, { maxAge: 10*60*1000 });
            req.path = '/home'
            res.redirect('/home')
        }
    })
})


function validateUser(params, db) {
    if (params && params.username && params.password) {
        return findAlreadySignUpUser(params, db).then(function (data) {
            console.log("data.result >> >>> >>> " + JSON.stringify(data))
            if (data && data._id) {
                return false;

            }
            else {
                return insertNewUserDeatils(params, db).then(function (doc) {
                    return true
                })

            }
        })
    }

}

function findAlreadySignUpUser(params, db) {
    var d = q.defer()
    db.collection('pl.users').findOne({name: params.username}, function (err, doc) {
        d.resolve(doc)
    })
    return d.promise;
}
function insertNewUserDeatils(params, db) {
    var d = q.defer()
    db.collection('pl.users').insertOne({name: params.username, password: params.password}, function (err, doc) {
        d.resolve(doc)
    })
    return d.promise;
}


function saveUserConnection(params, res, db) {
    var token = genrateToken()
    console.log(">>>>>>>", token)
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
module.exports = router;


