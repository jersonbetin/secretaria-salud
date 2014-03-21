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