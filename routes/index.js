var config = require('../package');
var models = require('./models');
var helpers = require('./helpers');
var moment = require('moment');

exports.index = function(req, res){
  if (helpers.isDefined(req.signedCookies.id_session)){
  	res.redirect('/dashboard');
  }else{
  	if(helpers.isDefined(req.session.id_session)){
  		res.redirect('/dashboard');
	  }else{
	  	res.render('homepage/index', {title:'Home'});
	  }
	}
};

//sin programar
exports.dashboard = function(req, res){
	if (helpers.isDefined(req.signedCookies.id_session)) {
		console.log('Logeado con cookies');
		models.admins.findOne({_id: req.signedCookies.id_session}, function (err, admin){
			if (err) {
				res.send('Error', err);
			}else{
				res.render('dashboard/dashboard', {session_id: admin.usuario, title:'Dashboard'});
			}
		});
	}else{
		if (helpers.isDefined(req.session.id_session)) {
			console.log('Logeado con sessiones');
			models.admins.findOne({_id: req.session.id_session}, function (err, admin){
				if (err) {
					res.send('Error', err);
				}else{
					res.render('dashboard/dashboard', {session_id: admin.usuario, title:'Dashboard'});
				}
			});
		}else{
			res.redirect('/');
		}
	}
}

exports.addMedico = function (req, res){
	if (helpers.isDefined(req.signedCookies.id_session) || helpers.isDefined(req.session.id_session)) {
		console.log('Logeado con cookies');
			models.universidades.find(function (err, universidad){
				if (err){
					res.send(err);
				}else{
					models.municipios.find(function (err, ciudad){
						if (err){
							res.send(err);
						}else{
							models.tipoProfesional.find(function (err, tProfesional){
								if (err){
										res.send(err);
									}else{
										res.render('dashboard/addMedico', {
											title: 'Agregar Medico',
											universidades: universidad,
											municipios: ciudad,
											tipoProf : tProfesional
										});
								}
							});
						}
					});
				}
			});
	}else{
		res.redirect('/');
	}
}

exports.registerAdmin = function(req, res){
	res.render('homepage/registerAdmin', {title: 'register'});
}

exports.busqueda = function (req, res){
	console.log('####### busqueda ####');
	if (helpers.isDefined(req.signedCookies.id_session) || helpers.isDefined(req.session.id_session)) {
		res.render('dashboard/search', {title: 'Search', error:req.query.error});
	 }else{
	 	res.redirect('/');
	}
}

//Error al registrarse
exports.sessionError = function (req, res){
	var type = req.query.type;
	res.render('homepage/sessionError', {title:'error', type:type});
}

exports.listaMedicosEstudio =  function (req, res){
	if (helpers.isDefined(req.signedCookies.id_session) || helpers.isDefined(req.session.id_session)) {
		models.medicos.find()
		.select('identificacion nombres apellidos.primero apellidos.segundo fechaRegistro')
		.where('estadoRegistro').equals('estudio')
		.sort('fechaRegistro fechaRegistro')
		.exec(function(err, medico){
				if (err) {
					res.send(err);
				}else{
					console.log(medico);
					res.render('dashboard/medicosEstudio', {
						title:'Lista medicos en estudio',
						medicos:medico,
						moment:moment
					});
				}
			});
	 }else{
	 	res.redirect('/');
	}
}

exports.renderDenunciaMedico=function(req, res){
	console.log('####### renderDenunciaMedico ####');
	if (helpers.isDefined(req.signedCookies.id_session) || helpers.isDefined(req.session.id_session)) {
		models.reportes.find()
		.select('_id denunciante.identificacion denunciante.nombres denunciante.apellidos.primero denunciante.apellidos.segundo descripcion fechaDenuncia')
		.sort('fechaDenuncia fechaDenuncia')
		.exec(function(err, denuncia){
				if (err) {
					res.send(err);
				}else{
					console.log(denuncia);
					res.render('dashboard/denuncias', {
						title:'Denuncias',
						denuncia:denuncia,
						moment:moment
					});
				}
			});
	}else{
		res.redirect('/');
	}
}

exports.renderGetByIdDenunciaMedico=function(req, res){
	console.log('####### renderGetByIdDenunciaMedico ####');
	if (helpers.isDefined(req.signedCookies.id_session) || helpers.isDefined(req.session.id_session)) {
		models.reportes.findOne({_id:req.params.id}, function(err, reporte){
			if(err){
				console.log(err);
				res.send({error:500});
			}else{
				if(reporte){
					res.render('dashboard/reporteDenuncia', {title:'reporte', reporte:reporte, moment:moment});
				}else{
					res.render('404/404');
				}
			}
		});
	}else{
		res.redirect('/');
	}
}

