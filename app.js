var config = require('./package');
var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');
var adminSession = require('./routes/adminSession');
var medicos = require('./routes/api/medicos');
var univ = require('./routes/api/universidades');
var profesional = require('./routes/api/tipoProfesional');
var test = require('./routes/test/test1');
var models = require('./routes/models');

var app = express();

function perimitirCrossDomain(req, res) {
  //en vez de * se puede definir SÓLO los orígenes que permitimos
  res.header('Access-Control-Allow-Origin', 'http://localhost:8282');
  //metodos http permitidos para CORS
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
}

app.configure(function(){
	app.set('port', process.env.PORT || 3000);
	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
	app.set("jsonp callback", true);
	app.use(express.favicon());
	app.use(express.logger('dev'));
	app.use(express.bodyParser());
	app.use(express.bodyParser({uploadDir:'./public/uploads'}));
	app.use(express.cookieParser('1q2w3e4r'));
	app.use(express.session({secret:'1q2w3e4r'}));
	//app.use(perimitirCrossDomain);
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

app.get('/prueba', function (req, res){
    perimitirCrossDomain(req, res);
    //if(req.query.token == "12345"){
     models.municipios.find(function (err, lugar){
        
     if(err){
            res.send(err);
          }else{  
           res.type('application/json');
           // res.end(JSON.stringify(lugar));} //
           res.json(lugar);}
      });
    //}else{
     // res.send(401);
   // }
});

app.get('/session/admin/error', routes.sessionError);
app.post('/session/admin', adminSession.NewSession);
app.delete('/session/admin', adminSession.destroySession);


app.get('/medicos/busqueda', routes.busqueda);
app.post('/medicos/busqueda', medicos.searchMedicoByIdent);

app.get('/medicos', routes.addMedico);
app.post('/medicos', medicos.createMedico);
app.get('/medicos/:id', medicos.getMedicoByIdent);

app.patch('/medicos/inf-personal', medicos.updateInfPersonal);
app.patch('/medicos/inf-titulos', medicos.updateInfTitulos);
app.patch('/medicos/inf-otros', medicos.updateInfOtros);

app.get('/municipios', test.municipios);
app.get('/universidades', univ.getUniversidades);
app.get('/tipoProfesional', profesional.getProfesionales);
app.post('/user/admin', adminSession.CreateAdmin);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
