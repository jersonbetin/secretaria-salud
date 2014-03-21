var conf = require('../../package');
var helpers = require('../helpers');
var models = require('../models');

exports.getUniversidades = function (req, res){
  models.universidades.find(function (err, universidad){
    if (err) {
      res.send('error');
    }else{
      res.send({universidades:universidad});
    }
  });
}