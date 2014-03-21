var models = require('../models');

exports.municipios = function (req, res){
	var municipios = ["Ayapel", "Buenavista", "Canalete", "Cereté", "Chimá", "Chinú", "Ciénaga de Oro", "Cotorra", "La Apartada", "Los Córdobas", "Momil", "Moñitos", "Montelíbano", "Montería", "Planeta Rica", "Pueblo Nuevo", "Puerto Escondido", "Puerto Libertador", "Purísima", "Sahagún", "San Andrés de Sotavento", "San Antero", "San Bernardo del Viento"," San Carlos", "San José de Uré", "San Pelayo", "Santa Cruz de Lorica", "Tierralta", "Tuchín", "Valencia"];
	for (var i=0; i < municipios.length; i++){
		var municipio = new models.municipios({
			nombre:municipios[i]
		});
		municipio.save(function(err){
			if(err){
				res.send(err);
			}
		});
		console.log(municipio._id);
	}
	res.send(200);
}

exports.universidades = function (req, res){
	var universidades = [['Colegio Mayor de Nuestra Señora del Rosario', 'Cundinamarca', 'Bogota'],['Corporación Universitaria Remington', 'Antioquia', 'Medellín'], [' Escuela de Medicina “Juan N. Corpas”', 'Cundinamarca', 'Bogota'], ['Fundación Universitaria de Boyaca, Facultad de Medicina','Boyaca', 'Tunja'], ['Universidad Antioquia', 'Antioquia', 'Medellín' ], ['Universidad Antonio Nariño', 'Cundinamarca', 'Bogota'], ['Universidad Autónoma de Bucaramanga',' Santander', 'Bucaramanga'], ['Universidad Cooperativa de Colombia', 'Antioquia', 'Antioquia'],['Universidad de Cartagena', 'Bolivar', 'Cartagena'],['Universidad Nacional de Colombia', 'Cundinamarca', 'Bogota'], ['Universidad Metropolitana', 'Atlantico', 'Barranquilla']];
		for (var i = 0;  i < universidades.length; i++) {
			var universidad = new models.universidades({
				nombre : universidades[i][0],
				departamento : universidades[i][1],
				ciudad : universidades[i][2]
			});
			universidad.save(function(err){
				if(err){
					res.send(err);
				}
			});
			console.log(universidad._id);
		};
	res.send(200);
}

exports.tipoProfesional = function (req, res){
	var tPofre = ["Medicina", "Enfermería", "Odontología", "Nutrición y dietética", "Fonoaudiología", "Fisioterapia", "Instrumentación quirúrgica", "Microbiología", "Cosmetología y estética corporal"];
		for(var i = 0; i < tPofre.length; i++){
			var profesional = new models.tipoProfesional({
				tipo: tPofre[i]
			});
			profesional.save(function(err){
				if (err) {
					res.send(err);
				}
			});
			console.log(profesional._id);
		}
	res.send(200);
}

exports.addLugarTrabajo = function (req, res){
	var lugar = new models.lugarTrabajo({
		nit:'sin definir',
		nombreClinica: 'sin definir',
		ubicacion:{
			_municipio: '53023e1320a96f8faa64d949',
			direccion: 'sin definir'
		},
		telefono:{
			celular : '',
			fijo: 'sin definir'
		}
	});
	lugar.save();
	res.send(200);
}