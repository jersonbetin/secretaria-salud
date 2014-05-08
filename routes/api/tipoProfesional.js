var conf = require('../../package');
var helpers = require('../helpers');
var models = require('../models');

exports.getProfesionales = function (req, res){
  models.tipoProfesional.find(function (err, profesional){
    if (err) {
      res.send('error');
    }else{
      res.send({profesionales:profesional});
    }
  });
}

exports.getProfesionalById = function (req, res){
  models.tipoProfesional.findOne({_id:req.params.code},function (err, profesional){
    if (err) {
      res.send('error');
    }else{
      res.send({profesionales:profesional});
    }
  });
}