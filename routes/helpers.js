exports.isDefined = function (variable){
	if(typeof variable === 'undefined' || variable === null){
		return false;
	}
	return true;
}

exports.perimitirCrossDomain=function (origenes, res) {
  //en vez de * se puede definir SÓLO los orígenes que permitimos
  res.header('Access-Control-Allow-Origin', "'"+origenes+"'");
  //metodos http permitidos para CORS
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
}