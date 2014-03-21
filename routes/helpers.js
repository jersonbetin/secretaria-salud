exports.isDefined = function (variable){
	if(typeof variable === 'undefined' || variable === null){
		return false;
	}
	return true;
}