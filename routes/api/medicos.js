var conf = require('../../package');
var helpers = require('../helpers');
var models = require('../models');
var fs = require('fs');
var moment = require('moment');
var mongoose = require('mongoose');



function agregar_medico(res, file, TipoIdent,  ident,  nombre, pAp, sAp, NTarjeta, sexo, fechaNac, muncResid, direccion, cel, tel, nacionalidad, tipoProfe, Lugar, labora, titulos,email){
	debugger;
	//************ Guardar archivo pdf **********************
		   var tmp_path = file.path;//ruta del archivo
              var random = Math.floor((Math.random()*9999)+1);//Variable aleatoria
              var filename = random+"."+file.name;//nombre del archivo mas variable aleatoria
              
              var mongo = require('mongodb');
              var Grid = require('gridfs-stream');
              var fs  = require("fs");

              // create or use an existing mongodb-native db instance.
              // for this example we'll just create one:
              var MongoClient = mongo.MongoClient;
              MongoClient.connect('mongodb://secretaria:1q2w3e4r@ds033569.mongolab.com:33569/ss-cordoba', function (err, db) {
                
                if (err){
                  console.log("############ err #################");
                  console.log(err);
                  console.log("############ err #################");
                }

                var gfs = Grid(db, mongo);
                var writestream = gfs.createWriteStream({
                  filename: filename
                });
                fs.createReadStream(tmp_path).pipe(writestream);
                console.log("Se guardo ("+filename+")");
                // all set!
              });

		//************ Guardar medico **********************
		models.medicos.create({tipoIdent : TipoIdent, identificacion : ident, correo:email, nombres : nombre,
			apellidos : {primero : pAp, segundo : sAp}, NtarjetaProf: NTarjeta,
			sexo: sexo, fehaNaimiento: fechaNac, residencia : {municipio: muncResid,
			direccion: direccion},telefono:{celular : cel, fijo: tel}, nacionalidad: nacionalidad,
			estadoRegistro:'estudio', _tipoProfesional:tipoProfe,  _lugarTrabajo: Lugar, labora: labora, fechaRegistro:new Date() , evidencias: filename
		}, function (err, medico){
			if(err){
				if(err.code=="11000"){
					res.send('repeat');
				}else{
					console.log(err);
					res.send(err);
				}
			}else{

				//************ Guardar todos los titulos optenidos **********************
				var titulo = JSON.parse(titulos);
				for (var i = 0; i < titulo.inf.length; i++) {
					models.misTitulos.create({
						_medico : medico._id,
						titulo : titulo.inf[i].nombre,
						descripcion : titulo.inf[i].descripcion,
						_universidad : titulo.inf[i].idUniv,
						fechaObtenion : titulo.inf[i].fecha,
					}, function (err){
						if (err) {
							console.log('aqui esta el problema');
							res.send(err);
						}
					});
				};
				console.log('no hay problema');
				res.send(200);
			}
		});
}

exports.createMedico = function (req, res){
	console.log(req.body);
	if(req.body.tIdent!='' && req.body.identif!='' && req.body.nombre!='' && req.body.pApell!=''
		&& req.body.sApell!='' && req.body.sexo!='' && req.body.muncResid!='' && req.body.tel!=''
		&& req.body.cel!='' && req.body.nacionalidad!='' && req.body.titulos!=undefined && req.body.nTarj!=''
		&& req.body.fechaNac!='' && req.body.direccion!='' && req.body.tipoProfe!=''){

		if(req.body.labora=='si'){
			if(req.body.nit!='' && req.body.NombEmpresa!='' && req.body.municTrab!='' && req.body.dirEmpr!=''
					&& req.body.telTrab!=''){
				models.lugarTrabajo.create({nit: req.body.nit, nombreClinica: req.body.nombEmpres, ubicacion:{_municipio: req.body.municTrab, direccion: req.body.dirEmpr},
					telefono:{celular : req.body.celTrab, fijo: req.body.telTrab}}, function (err, lugTrab){
						if (err) {
							if(err.code=="11000"){
								 models.lugarTrabajo.findOne({nit:req.body.nit}, function (err, lugarT){
								 	console.log('pasa por aqui'); ///aqui se cae
									 agregar_medico(res, req.files.archivo, req.body.tIdent,   req.body.identif,  req.body.nombre, req.body.pApell, req.body.sApell, req.body.nTarj, req.body.sexo, req.body.fechaNac, req.body.muncResid, req.body.direccion, req.body.cel, req.body.tel, req.body.nacionalidad, req.body.tipoProfe, lugarT, req.body.labora, req.body.titulos, req.body.correo);
								 });
							}else{
								console.log(err);
								res.send('ERROR: '+ err);
							}
						}else{
							agregar_medico(res, req.files.archivo, req.body.tIdent,   req.body.identif,  req.body.nombre, req.body.pApell, req.body.sApell, req.body.nTarj, req.body.sexo, req.body.fechaNac, req.body.muncResid, req.body.direccion, req.body.cel, req.body.tel, req.body.nacionalidad, req.body.tipoProfe, lugTrab._id, req.body.labora, req.body.titulos, req.body.correo);
						}
					});
			}else{
				res.send('No OK');
			}
		}else{
			if (req.body.labora=='no') {
				var idLugar='5366a4f673815808118470ce';
				agregar_medico(res, req.files.archivo, req.body.tIdent,   req.body.identif,  req.body.nombre, req.body.pApell, req.body.sApell, req.body.nTarj, req.body.sexo, req.body.fechaNac, req.body.muncResid, req.body.direccion, req.body.cel, req.body.tel, req.body.nacionalidad, req.body.tipoProfe, idLugar, req.body.labora, req.body.titulos, req.body.correo);
			}else{
				res.send('no OK');
			}
		}
	}else{
		res.send('No OK');
	}
}

exports.verifivarIdBynum = function (req, res){
	models.medicos.findOne({identificacion:req.query.ident}, function (err, ident){
		if (err) {
			res.send(err);
		}else{
			if(!ident){
				res.send(200);
			}else{
				res.send('existe');
			}
		}
	});
}

exports.verifivarTarjetaBynum=function(req, res){
	models.medicos.findOne({NtarjetaProf:req.query.tarjeta}, function (err, tarjeta){
		if (err) {
			res.send(err);
		}else{
			if(!tarjeta){
				res.send(200);
			}else{
				res.send('existe');
			}
		}
	});
}

exports.getNitBynum = function (req, res){
	models.lugarTrabajo.findOne({nit:req.query.nit}).populate('ubicacion._municipio').exec(function (err, Lugar){
		if (err) {
			console.log(err);
			res.send(err);
		}else{
			if(!Lugar){
				res.send('no OK');
			}else{
				res.send({lugar: Lugar});
			}
		}
	});
}

exports.searchMedicoByIdent=function (req, res){
	res.redirect('/medicos/'+req.body.identificacion);
}

exports.getMedicoByIdent=function (req, res){
	if (helpers.isDefined(req.signedCookies.id_session) || helpers.isDefined(req.session.id_session)) {
		var ident = req.params.id;
		models.medicos.findOne({identificacion:ident}).populate('_tipoProfesional _lugarTrabajo').exec(function(err, medico){
			if (err) {
				res.send(err);
			}else{
				if(medico){
					console.log(medico);
						models.municipios.findOne({_id:medico._lugarTrabajo.ubicacion._municipio}, function (err, lugar){
							models.misTitulos.find({_medico:medico._id}).populate('_universidad ').exec(function (err, titulos){
								var datos = {"medico":medico, "CiudadTrabajo":lugar, "titulos":titulos};
								//console.log(datos);
								res.render('dashboard/medico', {title:ident,datos:datos, moment:moment});
							});
						});
				}else{
					res.redirect('medicos/busqueda?error=1');
				}
			}
		});
	}else{
	 	res.redirect('/');
	}
}

exports.updateInfPersonal =function (req, res){
	if( req.body.nombres!='' && req.body.PApellido!='' && req.body.SApellido!='' 
		&& req.body.sexo!='' && req.body.municipio!='' && req.body.telefono!=''&& req.body.Celular!=''
		 && req.body.nacionalidad!=''	&& req.body.fecNacim!='' && req.body.direccion!='' ){
		var conditions = {identificacion: req.body.ident};
		var	update = {$set:{
				nombres : req.body.nombres,
				apellidos : {
					primero : req.body.PApellido,
					segundo : req.body.SApellido
				},
				sexo: req.body.sexo,
				fehaNaimiento: req.body.fecNacim,
				residencia : {
					municipio: req.body.municipio,
					direccion: req.body.direccion
				},
				telefono:{
					celular : req.body.Celular,
					fijo: req.body.telefono
				},
				nacionalidad:req.body.nacionalidad
			}};
		var options = {upsert:false};
		models.medicos.update(conditions, update, options, function (err){
			if(err){
				res.send('error:'+err);
			}else{
				res.send(200);
			}
		});
	}
}

exports.updateInfTitulos = function (req, res){
	if(req.body.titulo!='' && req.body.fechaObtencion!='' && req.body.universidad!='' ){
		var conditions = {_id:req.body.idTitulo};
		var	update = {$set:{
						titulo:req.body.titulo,
						fechaObtenion : req.body.fechaObtencion,
						_universidad  : req.body.universidad
					}};
		var options = {upsert:false};
		models.misTitulos.update(conditions, update, options, function (err){
			if(err){
				res.send('error');
			}else{
				res.send(200);
			}
		});
	}else{
		res.send('error');
	}
}

exports.updateInfOtros = function (req, res){
	if(req.body.tipoprof!='' && req.body.ident!=''){
		var conditions = {identificacion:req.body.ident};
		var	update = {$set:{
						correo: req.body.correoedit,
						_tipoProfesional  : req.body.tipoprof
					}};
		var options = {upsert:false};
		models.medicos.update(conditions, update, options, function (err){
			if(err){
				res.send('error');
			}else{
				res.send(200);
			}
		});
	}else{
		res.send('error');
	}
}

function testDatosLaborales(datosLaboral, next){
	var data = [];
	var testAprobado = true;
	if(helpers.isDefined(datosLaboral)){
		if(helpers.isDefined(datosLaboral.ident)){
			data.push({
				'datosLaboral.ident':{
					"status":"ok",
					"value":datosLaboral.ident
				}
			});
		}else{
			data.push({
				'datosLaboral.ident':{
					"status":"error",
					"info":"Usted debe informacion para este campo"
				}
			});
			testAprobado=false;
		}

		if(helpers.isDefined(datosLaboral.labora)){
			data.push({
				"datosLaboral.labora":{
					"status":"ok",
					"value":datosLaboral.labora
				}
			});
		}else{
			data.push({
				"datosLaboral.labora":{
					"status":"error",
					"info":"Usted debe informacion para este campo"
				}
			});
			testAprobado=false;
		}

		//si labora  
		if(datosLaboral.labora=='si'){
			if(helpers.isDefined(datosLaboral.nit_edit)){
				data.push({
					"datosLaboral.nit_edit":{
						"status":"ok",
						"value":datosLaboral.nit_edit
					}
				});
			}else{
				data.push({
					"datosLaboral.nit_edit":{
						"status":"error",
						"info":"Usted debe informacion para este campo"
					}
				});
				testAprobado=false;
			}

			if(helpers.isDefined(datosLaboral.NombEmpres_edit)){
				data.push({
					"datosLaboral.NombEmpres_edit":{
						"status":"ok",
						"value":datosLaboral.NombEmpres_edit
					}
				});
			}else{
				data.push({
					"datosLaboral.NombEmpres_edit":{
						"status":"error",
						"info":"Usted debe informacion para este campo"
					}
				});
				testAprobado=false;
			}

			if(helpers.isDefined(datosLaboral.municTrabajo_edit)){
				data.push({
					"datosLaboral.municTrabajo_edit":{
						"status":"ok",
						"value":datosLaboral.municTrabajo_edit
					}
				});
			}else{
				data.push({
					"datosLaboral.municTrabajo_edit":{
						"status":"error",
						"info":"Usted debe informacion para este campo"
					}
				});
				testAprobado=false;
			}

			if(helpers.isDefined(datosLaboral.dirEmpresa_edit)){
				data.push({
					"datosLaboral.dirEmpresa_edit":{
						"status":"ok",
						"value":datosLaboral.dirEmpresa_edit
					}
				});
			}else{
				data.push({
					"datosLaboral.dirEmpresa_edit":{
						"status":"error",
						"info":"Usted debe informacion para este campo"
					}
				});
				testAprobado=false;
			}

			if(helpers.isDefined(datosLaboral.dirEmpresa_edit)){
				data.push({
					"datosLaboral.dirEmpresa_edit":{
						"status":"ok",
						"value":datosLaboral.dirEmpresa_edit
					}
				});
			}else{
				data.push({
					"datosLaboral.dirEmpresa_edit":{
						"status":"error",
						"info":"Usted debe informacion para este campo"
					}
				});
				testAprobado=false;
			}

			if(helpers.isDefined(datosLaboral.celTrabajo_edit)){
				data.push({
					"datosLaboral.celTrabajo_edit":{
						"status":"ok",
						"value":datosLaboral.celTrabajo_edit
					}
				});
			}else{
				data.push({
					"datosLaboral.celTrabajo_edit":{
						"status":"error",
						"info":"Usted debe informacion para este campo"
					}
				});
				testAprobado=false;
			}

			data.push({
				"datosLaboral.tellTrabajo_edit":{
					"status":"ok",
					"value":datosLaboral.celTrabajo_edit
				}
			});
		}
	}else{
		data.push({
			"datosLaborales":{
				"status":"error",
				"info":"Usted debe enviar un objeto datosLaborales"
			}
		});
		testAprobado=false;
	}
	next(testAprobado, data);
}

exports.updateInfLaboral = function (req, res){
	debugger;
	testDatosLaborales(req.body, function (test, datos){
		 // res.json({"data":datos, 'test':test});
		if(test!=false){
			if (req.body.labora=='si') {
				models.lugarTrabajo.create({nit: req.body.nit_edit, nombreClinica: req.body.NombEmpres_edit, 
					ubicacion:{_municipio: req.body.municTrabajo_edit, direccion: req.body.dirEmpresa_edit},
					telefono:{celular : req.body.celTrabajo_edit, fijo: req.body.telTrabajo_edit}}, function (err, lugar){
						if (err) {
							if (err.code=="11000") {
								models.lugarTrabajo.findOne({nit: req.body.nit_edit}, function (err, lugarExite){
									if (err) {
										res.send(err);
									}else{
										var conditions = {identificacion:req.body.ident};
										var	update = {$set:{
														labora:'si',
														_lugarTrabajo  : lugarExite._id
													}};
										var options = {upsert:false};
										models.medicos.update(conditions, update, options, function (err){
											if(err){
												res.send(err);
											}else{
												res.send(200);
											}
										});
									}
								});
							}else{
								res.send(err);
							}
						}else{
							var conditions = {identificacion:info.req.body.ident};
							var	update = {$set:{
											labora:'si',
											_lugarTrabajo  : lugar._id
										}};
							var options = {upsert:false};
							models.medicos.update(conditions, update, options, function (err){
								if(err){
									res.send(err);
								}else{
									res.send(200);
								}
							});
						}
					});
			}else{
				var conditions = {identificacion:req.body.ident};
				var	update = {$set:{
								labora:'no',
								_lugarTrabajo  : '53036c9c6b4857b014000001'
							}};
				var options = {upsert:false};
				models.medicos.update(conditions, update, options, function (err){
					if(err){
						res.send(err);
					}else{
						res.send(200);
					}
				});
			}
			// var conditions = {identificacion:info.datosLaboral.ident.value};
			// var	update = {$set:{
			// 				correo:info.datosLaboral.labora.value,
			// 				_tipoProfesional  : info.datosLaboral.ident.value
			// 			}};
			// var options = {upsert:false};
		}else{
			res.send(500);
		}
	});
	// console.log(req.body);
	// res.send(200);
}

function testDatosEstado(datosEstado, next){
	var data = [];
	var testAprobado = true;
	if(helpers.isDefined(datosEstado)){
		if(helpers.isDefined(datosEstado.ident)){
			data.push({
				'datosEstado.ident':{
					"status":"ok",
					"value":datosEstado.ident
				}
			});
		}else{
			data.push({
				'datosEstado.ident':{
					"status":"error",
					"info":"Usted debe informacion para este campo"
				}
			});
			testAprobado=false;
		}

		if(helpers.isDefined(datosEstado.estadoReg)){
			data.push({
				'datosEstado.estadoReg':{
					"status":"ok",
					"value":datosEstado.estadoReg
				}
			});
		}else{
			data.push({
				'datosEstado.estadoReg':{
					"status":"error",
					"info":"Usted debe informacion para este campo"
				}
			});
			testAprobado=false;
		}
	}else{
		data.push({
			"datosEstado":{
				"status":"error",
				"info":"Usted debe enviar un objeto datosEstado"
			}
		});
		testAprobado=false;
	}
	next(data, testAprobado);
}
exports.updateEstadoRegistro = function (req, res){
	testDatosEstado(req.body, function (datos, test){
		if (test==true) {
			var conditions = {identificacion:req.body.ident};
					var	update = {$set:{
									estadoRegistro  :req.body.estadoReg,
									observacionEstado:req.body.observaciones
								}};
					var options = {upsert:false};
					models.medicos.update(conditions, update, options, function (err){
						if(err){
							res.send(err);
						}else{
							var datos={
								cedula:req.body.ident,
								obs:req.body.observaciones
							}
							if(req.body.estadoReg=='aprobado'){
								datos.estado=2;
								enviarDirectorio(datos, res);
							}else if(req.body.estadoReg=='desaprobado'){
								datos.estado=3;
								enviarDirectorio(datos, res);
							}else if(req.body.estadoReg=='estudio'){
								res.send(200);
							}else{
								res.send({error:500});
							}
						}
					});
		}else{
			res.send({error:500});
		}
	});
}

function agregar_medicoDirectorio(res, evidencia, TipoIdent,  ident,  nombre, pAp, sAp, NTarjeta, sexo, fechaNac, muncResid, direccion, cel, tel, nacionalidad, tipoProfe, Lugar, labora, titulos,email){
	console.log('-----------jjjjj------------');
		console.log("aqui 2");
		var mongo = require('mongodb');
		var Grid = require('gridfs-stream');

		// create or use an existing mongodb-native db instance
		var MongoClient = mongo.MongoClient;
           MongoClient.connect('mongodb://secretaria:1q2w3e4r@ds033569.mongolab.com:33569/ss-cordoba', function (err, db) {
			if (err){
			     console.log(err);
			 }else{
			 	console.log("conectado a prueba");
			 	var gfs = Grid(db, mongo);
			    	var http = require('http');
			    	console.log("aqui 1");
			    	var file = gfs.createWriteStream(evidencia);
			    	http.get("http://consulting-cordoba.herokuapp.com/pdfs/"+evidencia, function (response) {
			        	response.on('data', function (d) {
				          	console.log("Se recibio algo");
				          	file.write(d);
			      	});
			     		response.on('end', function() {
					     console.log("se acabo");
					     file.end();

						//************ Guardar medico **********************
						models.medicos.create({tipoIdent : TipoIdent, identificacion : ident, correo:email, nombres : nombre,
							apellidos : {primero : pAp, segundo : sAp}, NtarjetaProf: NTarjeta,
							sexo: sexo, fehaNaimiento: fechaNac, residencia : {municipio: muncResid,
							direccion: direccion},telefono:{celular : cel, fijo: tel}, nacionalidad: nacionalidad,
							estadoRegistro:'estudio', _tipoProfesional:tipoProfe,  _lugarTrabajo: Lugar, labora: labora, fechaRegistro:new Date() , evidencias: evidencia
						}, function (err, medico){
							if(err){
								if(err.code=="11000"){
									var conditions = {identificacion:ident};
									var	update = {
											$set:{
												correo:email,
												nombres : nombre,
												apellidos : {
													primero : pAp,
													segundo : sAp
												},
												NtarjetaProf: NTarjeta,
												sexo: sexo,
												fehaNaimiento: fechaNac,
												residencia : {
													municipio: muncResid,
													direccion: direccion
												},
												telefono:{
													celular : cel,
													fijo: tel
												},
												nacionalidad: nacionalidad,
												estadoRegistro:'estudio',
												_tipoProfesional:tipoProfe,
												_lugarTrabajo: Lugar,
												labora: labora,
												fechaRegistro:new Date() ,
												evidencias: evidencia
											}
										}
									var options = {upsert:false};
									models.medicos.update(conditions, update, options, function (err){
										if(err){
											res.send({
												code:500,
												error:'actualizacionFallida',
												info:'paso algun error al actualizar'
											});
										}else{
											models.medicos.findOne({identificacion:ident},function(err, doctorID){
												if(err){
													res.send({
														code:500,
														error:'actualizacionFallida',
														info:'paso algun error al buscar el doctor'
													});
												}else{
													models.misTitulos.remove({_medico:doctorID._id}, function(err){
														if(err){
															res.send({
																code:500,
																error:'actualizacionFallida',
																info:'paso algun error al borrarlos titulos del doctor'
															});
														}else{
															var titulo = titulos;
															console.log(titulo);
															for (var i = 0; i < titulo.length; i++) {
																models.misTitulos.create({
																	_medico : doctorID._id,
																	titulo : titulo[i].title,
																	descripcion : titulo[i].description,
																	_universidad : titulo[i].idUniversity,
																	fechaObtenion : titulo[i].graduationDate,
																}, function (err){
																	if (err) {
																		console.log('aqui esta el problema');
																		res.send(err);
																	}
																});
															};
															console.log('no hay problema');
															res.send(200);
														}
													});
												}
											});
										}
									});
								}else{
									console.log(err);
									res.send(err);
								}
							}else{

								//************ Guardar todos los titulos optenidos **********************
								var titulo = titulos;
								console.log(titulo);
								for (var i = 0; i < titulo.length; i++) {
									models.misTitulos.create({
										_medico : medico._id,
										titulo : titulo[i].title,
										descripcion : titulo[i].description,
										_universidad : titulo[i].idUniversity,
										fechaObtenion : titulo[i].graduationDate,
									}, function (err){
										if (err) {
											console.log('aqui esta el problema');
											res.send(err);
										}
									});
								};
								console.log('no hay problema');
								res.send(200);
							}
						});
					});
				      response.on('error', function(e) {
				        res.send(e);
				      });
	        		});
	     		}
	});
}

exports.createMedicoDirectorio = function (req, res){
	console.log(req.body);
	if(req.body.tIdent!='' && req.body.identif!='' && req.body.nombre!='' && req.body.pApell!=''
		&& req.body.sApell!='' && req.body.sexo!='' && req.body.muncResid!='' && req.body.tel!=''
		&& req.body.cel!='' && req.body.nacionalidad!='' && req.body.titulos!=undefined && req.body.nTarj!=''
		&& req.body.fechaNac!='' && req.body.direccion!='' && req.body.tipoProfe!=''){

		if(req.body.labora=='si'){
			if(req.body.nit!='' && req.body.NombEmpresa!='' && req.body.municTrab!='' && req.body.dirEmpr!=''
					&& req.body.telTrab!=''){
				models.lugarTrabajo.create({nit: req.body.nit, nombreClinica: req.body.nombEmpres, ubicacion:{_municipio: req.body.municTrab, direccion: req.body.dirEmpr},
					telefono:{celular : req.body.celTrab, fijo: req.body.telTrab}}, function (err, lugTrab){
						if (err) {
							if(err.code=="11000"){
								 models.lugarTrabajo.findOne({nit:req.body.nit}, function (err, lugarT){
								 	console.log('pasa por aqui');
									 agregar_medicoDirectorio(res, req.body.evidencias, req.body.tIdent,   req.body.identif,  req.body.nombre, req.body.pApell, req.body.sApell, req.body.nTarj, req.body.sexo, req.body.fechaNac, req.body.muncResid, req.body.direccion, req.body.cel, req.body.tel, req.body.nacionalidad, req.body.tipoProfe, lugarT, req.body.labora, req.body.titulos, req.body.correo);
								 });
							}else{
								console.log(err);
								res.send('ERROR: '+ err);
							}
						}else{
							agregar_medicoDirectorio(res, req.body.evidencias, req.body.tIdent,   req.body.identif,  req.body.nombre, req.body.pApell, req.body.sApell, req.body.nTarj, req.body.sexo, req.body.fechaNac, req.body.muncResid, req.body.direccion, req.body.cel, req.body.tel, req.body.nacionalidad, req.body.tipoProfe, lugTrab._id, req.body.labora, req.body.titulos, req.body.correo);
						}
					});
			}else{
				res.send('No OK');
			}
		}else{
			if (req.body.labora=='no') {
				var idLugar='5366a4f673815808118470ce';
				agregar_medicoDirectorio(res, req.body.evidencias, req.body.tIdent,   req.body.identif,  req.body.nombre, req.body.pApell, req.body.sApell, req.body.nTarj, req.body.sexo, req.body.fechaNac, req.body.muncResid, req.body.direccion, req.body.cel, req.body.tel, req.body.nacionalidad, req.body.tipoProfe, idLugar, req.body.labora, req.body.titulos, req.body.correo);
			}else{
				res.send('no OK');
			}
		}
	}else{
		res.send('No OK');
	}
}

exports.servicioMedico = function (req, res){
	var ident=req.params.ide;
	models.medicos.findOne({identificacion:ident}).populate('_tipoProfesional _lugarTrabajo').exec(function(err, medico){
			if (err) {
				res.send(err);
			}else{
				if(medico){
					models.municipios.findOne({_id:medico._lugarTrabajo.ubicacion._municipio}, function (err, lugar){
						models.misTitulos.find({_medico:medico._id}).populate('_universidad ').exec(function (err, titulos){
							var datos = {
									"registrado":"si",
									"infoPersonal":{
										"nombre":medico.nombres,
										"apellido":{
											'primero':medico.apellidos.primero,
											"segundo":medico.apellidos.segundo
										},
										"fechaNac":medico.fehaNaimiento,
										"sexo":medico.sexo,
										"correo": medico.correo,
										"tipoProfesional": medico._tipoProfesional._id,
										"NombreTipoProfesional":medico._tipoProfesional.tipo,
									 	"tarjetaPofesional":medico.NtarjetaProf
										},
									"infoTitulos":{
									 "titulos":titulos
									},
									"infoEstado":{
									 	"estadoRegistro":medico.estadoRegistro
									}
								};
							res.jsonp(datos);
						});
					});
				}else{
					res.json({'registrado':'no'});
				}
			}
		});
}

exports.consultaDeIdoneidad=function(req, res){
	console.log('------- Consultar idoneidad del medico-----------');
	console.log(req.query);
	var criterio={};
	if(req.query.identificacion){
		criterio.identificacion=req.query.identificacion;
	}
	if(req.query.apellido){
		criterio['apellidos.primero']=req.query.apellido;
	}
	models.medicos.find(criterio).where({"estadoRegistro":"aprobado"}).populate('_tipoProfesional').exec(function(error, medicos){
		if (error) {
			res.send(error);
		}else{
			var medicosAprobados=[];
			for (var i = 0; i < medicos.length; i++) {
				medicosAprobados.push({
					'identificacion':medicos[i].identificacion,
					'nombre':medicos[i].nombres,
					'apellido':{
						'primero':medicos[i].apellidos.primero,
						'segundo':medicos[i].apellidos.segundo
					},
					'tipoProfesional':medicos[i]._tipoProfesional.tipo
				});
			};
			res.send({medicos:medicosAprobados});
		}
	});
}

exports.cambiarExtado=function(req, res){
	console.log(req.body);
	if(helpers.isDefined(req.params.id)){
		models.medicos.findOne({identificacion:req.params.id}, function(err, medico){
			if(err){
				res.send({
					code:500,
					error:'consultarFallida',
					info:'paso algun error al consultar'
				});
			}else{
				if(!medico){
					res.send({
						code:400,
						error:'medicoNoexite',
						info:'no existe el medico'
					});
				}else{
					if(helpers.isDefined(req.body.estado)){
						if(req.body.estado=='si'){
							var conditions = {identificacion:req.params.id};
							var	update = {
									$set:{
										estadoRegistro : 'desaprobado',
										observacionEstado : req.body.observaciones
									}
								};
							var options = {upsert:false};
							models.medicos.update(conditions, update, options, function (err){
								if(err){
									res.send({
										code:500,
										error:'actualizacionFallida',
										info:'paso algun error al actualizar'
									});
								}else{
									var datos={
										cedula:req.params.id,
										estado:3,
										obs:req.body.observaciones
									}
									enviarDirectorio(datos, res);
								}
							});
						}else{
							var conditions = {identificacion:req.params.id};
							var	update = {
									$set:{
										estadoRegistro : 'aprobado',
										//observacionEstado : req.body.observaciones
									}
								};
							var options = {upsert:false};
							models.medicos.update(conditions, update, options, function (err){
								if(err){
									res.send({
										code:500,
										error:'actualizacionFallida',
										info:'paso algun error al actualizar'
									});
								}else{
									var datos={
										cedula:req.params.id,
										estado:2,
										obs:req.body.observaciones
									}
									enviarDirectorio(datos, res);
								}
							});
						}
					}else{
						res.send({
							code:400,
							error:'estadoUndefined',
							info:'paso los datos vacios'
						});
					}
				}
			}
		});

	}else{
		res.send({
			code:400,
			error:'medicoUndefined',
			info:'paso los datos vacios'
		});
	}
}

function enviarDirectorio(datos, res){
	console.log('se llega a la funcion');
	var data = JSON.stringify({
    'registerState':datos.estado,
    'observation':datos.obs
  });
	console.log(data);
  var options = {
        host: 'consulting-cordoba.herokuapp.com',
        path: '/api/v1/doctors/'+datos.cedula+'/account_information/register_state',
        method: 'PUT',
        headers : {
          'Content-Type': 'application/json; charset=utf-8',
          'secretaryToken':'healthSecretrySecretToken'
        }
      };
      var http = require("http");
      var httpreq = http.request(options, function (response) {
      	console.log('todo bien');
        response.on('data', function (chunk) {
          console.log("body: " + chunk);
        });
        response.on('end', function(e) {
          console.log(e);
          res.send(200);
        });
        response.on('error', function(e) {
          console.log("Ha ocurrido un error");
          console.log(e);
          res.send({error:e});
        });
      });
      httpreq.write(data);
      httpreq.end();
}

exports.denunciasMedico= function(req, res){
	console.log('######## denuncia medico #####');
	console.log(req.body);
	models.reportes.create(req.body.reporte, function (err, denuncia){
		if(err){
			console.log(err);
			res.send({error:500});
		}else{
			res.send({error:null});
		}
	});
}