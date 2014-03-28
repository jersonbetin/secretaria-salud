var config = require('../package');
var models = require('./models');
var helpers = require('./helpers');
var crypto = require('crypto');

exports.NewSession = function(req, res){
	console.info(req.body);
	if (helpers.isDefined(req.cookies.id_session)){
		res.redirect('/dashboard');
	}else{
		if(helpers.isDefined(req.session.id_session)){
			res.redirect('/dashboard');
		}else{
			var hash = crypto.createHash('sha1'),
					user = req.body.user,
					pass = req.body.pass;
			hash.update(pass);
			models.admins.findOne({'usuario':user,'pass': hash.digest('hex')}, function (err, admin){
				if(err){
					res.send("Error", err);
				}else{
					if (!admin) {
						res.redirect('session/admin/error?type=1');
					}else{
						if (req.body.remember_me === 'on') {
							res.cookie('id_session', admin._id,{ expires: new Date(Date.now() + 9000000), httpOnly: true, signed: true });
						}else{
							req.session.id_session=admin._id;
						}
						res.redirect('/dashboard');
					}
				}
			});
		}
	}
}

//creamos un nuevo administrador
exports.CreateAdmin = function (req, res){
	console.info(req.body);
	var hash = crypto.createHash('sha1'),
		password = req.body.pass;
		hash.update(password);
	var admin = new models.admins({
		usuario: req.body.user,
		pass: hash.digest('hex')
	});

	admin.save(function(err){
		if (err) {
			res.send(err);
		}else{
			res.send('administrador creado');
		}
	});
}

exports.destroySession = function(req, res){
	if(helpers.isDefined(req.signedCookies.id_session)){
		res.clearCookie('id_session');
		res.send(200);
	}else{
		if(helpers.isDefined(req.session.id_session)){
			req.session.id_session=null;
			res.send(200);
		}else{
			res.send(200);
		}
	}
}
