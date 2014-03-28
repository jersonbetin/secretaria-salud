var conf = require('../../package');
var helpers = require('../helpers');
var models = require('../models');
var fs = require('fs');
var moment = require('moment');


function agregar_medico(res, file, TipoIdent,  ident,  nombre, pAp, sAp, NTarjeta, sexo, fechaNac, muncResid, direccion, cel, tel, nacionalidad, tipoProfe, Lugar, labora, titulos,email){
	//************ Guardar archivo pdf **********************
		var tmp_path=file.path;//ruta del archivo
		var tipo=file.type;//tipo del archivo
		if(tipo=='application/pdf'){
				//Si es de tipo pdf
				var aleatorio=Math.floor((Math.random()*9999)+1);//Variable aleatoria
				var nombrearchivo=aleatorio+""+file.name;//nombre del archivo mas variable aleatoria

				var target_path='./public/uploads/'+nombrearchivo;// hacia donde subiremos nuestro archivo dentro de nuestro servidor
				fs.rename(tmp_path,target_path,function (err) {//Escribimos el archivo
					fs.unlink(tmp_path,function (err) {//borramos el archivo tmp
					});
				});

		}else{
			console.log('Tipo de archivo no soportado');
			res.send('Tipo de archivo no soportado');
		}

		//************ Guardar medico **********************
		models.medicos.create({tipoIdent : TipoIdent, identificacion : ident, correo:email, nombres : nombre,
			apellidos : {primero : pAp, segundo : sAp}, NtarjetaProf: NTarjeta,
			sexo: sexo, fehaNaimiento: fechaNac, residencia : {municipio: muncResid,
			direccion: direccion},telefono:{celular : cel, fijo: tel}, nacionalidad: nacionalidad,
			estadoRegistro:'estudio', _tipoProfesional:tipoProfe,  _lugarTrabajo: Lugar, labora: labora, fechaRegistro:new Date() , evidencias: nombrearchivo
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
	debugger;
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
				var idLugar='53036c9c6b4857b014000001';
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
					models.municipios.findOne({_id:medico._lugarTrabajo.ubicacion._municipio}, function (err, lugar){
						models.misTitulos.find({_medico:medico._id}).populate('_universidad ').exec(function (err, titulos){
							var datos = {"medico":medico, "CiudadTrabajo":lugar, "titulos":titulos};
							console.log(datos);
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
	if( req.body.nombres!='' && req.body.PApellido!='' && req.body.PApellido!='' 
		&& req.body.sexo!='' && req.body.municipio!='' && req.body.telefono!=''&& req.body.Celular!=''
		 && req.body.nacionalidad!=''	&& req.body.fecNacim!='' && req.body.direccion!='' ){
		var conditions = {identificacion: req.body.ident};
		var	update = {$set:{
				nombres : req.body.nombres,
				apellidos : {
					primero : req.body.PApellido,
					segundo : req.body.PApellido
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
				res.send('error');
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
								"medico":{
									nombre:medico.nombres,
									"apellido.primero":medico.apellidos.primero,
									"apellido.segundo":medico.apellidos.segundo,
									fechaNac:moment(medico.fehaNaimiento).format('DD-MM-YYYY'),
									sexo:medico.sexo,
									correo: medico.correo,
									"tipoProfesional": medico._tipoProfesional.tipo,
								 	"ciudadTrabajo":lugar.nombre
									},
								 "titulos":titulos
								};
							res.jsonp(datos);
						});
					});
				}else{
					res.js(200);
				}
			}
		});
}
