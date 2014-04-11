var conf = require('../../package');
var helpers = require('../helpers');
var models = require('../models.js');

exports.getMunicipios = function (req, res){
    helpers.perimitirCrossDomain('*',res);
    models.municipios.find(function (err, municipio){
      if (err) {
        res.send('error');
      }else{
        res.type('application/json');
        res.json({municipios:municipio});
      }
    });
}