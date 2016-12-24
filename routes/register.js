var express = require('express');
var q = require('q')
var router = express.Router();
var Util = require('./Util');
var ObjectID = require("mongodb").ObjectID
//var popup = require('window-popup').windowPopup;
//var popupS = require('popups');
var paramsProvided = {}
var validateReturnData;

router.get('/', function (req, res) {
    var db = req.app.locals.db
    return Util.getRequestParams(req).then(function (params) {
        paramsProvided = params;
        if (params.hasOwnProperty('username') && params.hasOwnProperty('password') && params.hasOwnProperty('email')) {
            return validateUser(params, db)
        }
    }).then(function (data) {
        validateReturnData = data
        if ( data && data.error) {
            res.send(data);
        }
        else if(data && !data.error) {
            return saveUserConnection(paramsProvided, res, db)
        }
        else{
            res.send({
                "error": 1,
                "error_msg": "Unknown error occurred in registration!"
            });
        }
    }).then(function(token){
        if( validateReturnData && !(validateReturnData.error)){
            res.cookie("token", token, { maxAge: 10*60*1000 });
            return finduserDetails(paramsProvided,db)

        }
    }).then(function(userData){
        if(userData && userData._id){
            //req.path = '/home'
            //res.redirect('/home')
            res.send(userData)
        }
    })
})


function validateUser(params, db) {
    if (params && params.username && params.password && params.email) {
        return findAlreadySignUpUser(params, db).then(function (data) {
            if (data && data._id) {
                return {
                    "success": 0,
                    "error": true,
                    "error_msg": "User already existed with " + data.email
                };

            }
            else {
                return insertNewUserDeatils(params, db).then(function (doc) {
                    return { "error": false, user:doc, "updated_at": null }
                })

            }
        })
    }

}

function findAlreadySignUpUser(params, db) {
    var d = q.defer()
    db.collection('pl.users').findOne({name: params.username,email: params.email}, function (err, doc) {
        d.resolve(doc)
    })
    return d.promise;
}
function insertNewUserDeatils(params, db) {
    var d = q.defer()
    db.collection('pl.users').insertOne({name: params.username, password: params.password, email: params.email,created_at:new Date(),updated_at:""}, function (err, doc) {
        d.resolve(doc)
    })
    return d.promise;
}


function saveUserConnection(params, res, db) {
    var token = genrateToken()
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
function finduserDetails(params, db) {
    console.log(">>>>>>>", params)
    var d = q.defer();
    db.collection('pl.users').findOne({
        name: params.username,
        email: params.email
    }, function (err, doc) {
        if (err) {
            d.reject(err);
        } else {
            d.resolve(doc);
        }
    });
    return d.promise;
}
function genrateToken() {
    return require("crypto").createHash('sha1').update(ObjectID().toString()).digest("hex")
}
module.exports = router;


