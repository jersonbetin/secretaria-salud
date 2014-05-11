var config = require('./package');
var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');
var adminSession = require('./routes/adminSession');
var medicos = require('./routes/api/medicos');
var univ = require('./routes/api/universidades');
var munic = require('./routes/api/municipios');
var profesional = require('./routes/api/tipoProfesional');
var test = require('./routes/test/test1');
var models = require('./routes/models');

var app = express();

var allowCrossDomain = function (req, res, next) {
    res.header ('Access-Control-Allow-Origin', '*');
    res.header ('Access-Control-Allow-Methods', 'GET');
    res.header ('Access-Control-Allow-Headers', 'Content-Type');
    next();
}


app.configure(function(){
	app.set('port', process.env.PORT || 4000);
	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
	app.set("jsonp callback", true);
	app.use(express.favicon());
	app.use(express.logger('dev'));
	app.use(express.bodyParser());
	app.use(express.bodyParser({uploadDir:'./public/uploads'}));
	app.use(express.cookieParser('1q2w3e4r'));
	app.use(express.session({secret:'1q2w3e4r'}));
	app.use(allowCrossDomain);
	app.use(express.methodOverride());
	app.use(app.router);
	//app.use(require('less-middleware')({ src: __dirname + '/public' }));
	app.use(express.static(path.join(__dirname, 'public')));
	app.use(function (req, res, next){
		res.render('404/404.jade', {title: config.name, pag:req.params});
	});
});

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

// Carga de template o wiews
app.get('/', routes.index);
app.get('/dashboard', routes.dashboard);
app.get('/admin', routes.registerAdmin);

// Peticion de autentificacion de datos
app.get('/api/medicos/identificacion', medicos.verifivarIdBynum);
app.get('/api/medicos/tarjeta', medicos.verifivarTarjetaBynum);
app.get('/api/lugarTrabajo/nit', medicos.getNitBynum);
app.get('/SWMedicos/:ide', medicos.servicioMedico);
app.get('/medicos/idoneidad', medicos.consultaDeIdoneidad);
app.put('/medicos/:id/estado', medicos.cambiarExtado);


app.get('/session/admin/error', routes.sessionError);
app.post('/session/admin', adminSession.NewSession);
app.delete('/session/admin', adminSession.destroySession);


app.get('/medicos/busqueda', routes.busqueda);
app.post('/medicos/busqueda', medicos.searchMedicoByIdent);

app.get('/medicos', routes.addMedico);
app.post('/medicos', medicos.createMedico);
app.get('/medicos/:id', medicos.getMedicoByIdent);

app.get('/medicos/listado/estados', routes.listaMedicosEstudio);

app.patch('/medicos/inf-personal', medicos.updateInfPersonal);
app.patch('/medicos/inf-titulos', medicos.updateInfTitulos);
app.patch('/medicos/inf-otros', medicos.updateInfOtros);
app.patch('/medicos/info-laboral', medicos.updateInfLaboral);
app.patch('/medicos/estados', medicos.updateEstadoRegistro);

// app.get('/municipios', test.municipios);
// app.get('/universidad', test.universidades);
// app.get('/profesional', test.tipoProfesional);
app.get('/lugarTrabajo', test.addLugarTrabajo);
app.get('/municipios', munic.getMunicipios);
app.get('/universidades', univ.getUniversidades);
app.get('/tipoProfesional', profesional.getProfesionales);
app.get('/tipoProfesional/:code', profesional.getProfesionalById);
app.post('/user/admin', adminSession.CreateAdmin);

// recibir por el directorio

app.post('/doctor/directorio', medicos.createMedicoDirectorio);

// app.get('/3', function(req ,res){
//      console.log('-----------jjjjj------------');
//     var fs = require('fs');
//     var http = require('http');
//     var data = "";
//     http.get("http://localhost:3000/doctors/PDFs/7847.registro extendido.pdf", function (response) {
//       console.log("dentro de get");
//       response.setEncoding('binary')
//       response.on('data', function (d) {
//         data+=d;
//       });
//       response.on('end', function() {
//         // data = JSON.parse(data);
//         fs.writeFile("prueba.pdf", data, 'binary', function(err){
//           if (err){
//             throw err;
//             console.log(err);
//           } else{
//             console.log('File saved.')
//             res.send("FIle Saved");
//           }
//         })
//       });
//       response.on('error', function(e) {
//         res.send(e);
//       });
//     });
// })

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
