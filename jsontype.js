/*
Module jsontype.js

*/

makeValidator = function(type) {
	var regex_result;

	// Input: string
	if(/^\s*string\s*$/.test(type)) {
		// type is string
		return function(value) {
			return typeof(value) == 'string';
		}
	}
	if(/^\s*number\s*$/.test(type)) {
		// type is number
		return function(value) {
			return typeof(value) == 'number';
		}
	}
	if(/^\s*\*\s*$/.test(type)) {
		// any-Match (everything but undefined)
		return function(value) {
			return value != undefined;
		}
	}
	if(regex_result = /^\s*\[(.+)\]\s*$/.exec(type)) {
		// array-of-match
		var subtype = makeValidator(regex_result[1]);
		return function(value) {
			if(typeof(value) != 'object') return false;
			if(value.constructor != Array) return false;
			for(var i in value) {
				if(!subtype(value[i])) return false;
			}
			return true;
		}
	}
	throw "Unknown type identifier: "+type;
}


exports.makeValidator = makeValidator;
