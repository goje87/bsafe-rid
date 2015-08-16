module.exports = function(app){

var express        = require("express");
var router         = express.Router();
var mongoose       = require("mongoose");
var bodyParser     = require("body-parser");
var methodOverride = require("method-override");


router.use(bodyParser.urlencoded({ extended: true }));

router.use(methodOverride(function(req, res){
      if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        // look in urlencoded POST bodies and delete it
        var method = req.body._method
        delete req.body._method
        return method
      }
}));

router.get('/new', function(req, res) {



});


router.route('/')


    //POST a new blob
    .post(function(req, res) {
        
    });
};
