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
	if(/^\s*undefined\s*$/.test(type)) {
		// check for undefined
		return function(value) {
			return typeof(value) == 'undefined';
		}
	}
	if(/^\s*\*\s*$/.test(type)) {
		// any-Match (everything but undefined)
		return function(value) {
			return value != undefined;
		}
	}
	if((regex_result = /^\s*"(.*)"\s*$/.exec(type)) || (regex_result = /^\s*"(.*)"\s*$/.exec(type))) {
		var xstring = regex_result[1];
		return function(value) {
			return value == xstring;
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
	if(regex_result = /^\s*\{(.*)\}\s*$/.exec(type)) {
		// objects
		var content = regex_result[1];
		var types = {}; // associative list of type restrictions
		while(!/^\s*$/.test(content)) {
			var optional = false;
			var r = /^\s*(\w+)\?\s*:(.*)$/.exec(content);
			if(!r) r = /^\s*"(.+?)"\?\s*:(.*)$/.exec(content);
			if(!r) r = /^\s*'(.+?)'\?\s*:(.*)$/.exec(content);
			if(r) optional = true;
			else {
				if(!r) r = /^\s*"(.+?)"\s*:(.*)$/.exec(content);
				if(!r) r = /^\s*'(.+?)'\s*:(.*)$/.exec(content);
				// TODO: do better parsing of " escape
				if(!r) r = /^\s*(\w+|\*)\s*:(.*)$/.exec(content);
			}
			if(!r) throw "Error in object type syntax near: "+content;
			var ident = r[1]; // Identifier of the property
			var rest = r[2]; // type, optional comma and rest
			var brstack = []; // stack to count brackets
			var i = 0;
			while(i < rest.length && (rest.charAt(i) != ',' || brstack.length > 0)) {
				switch(rest.charAt(i)) {
					case "{": brstack.push('}'); break;
					case "(": brstack.push(')'); break;
					case "[": brstack.push(']'); break;
					case '}': case ')': case ']':
					if(brstack.length == 0) throw('closing bracket without opening in: '+rest);
					var last = brstack.pop();
					if(rest.charAt(i) != last)
						throw "Expected "+last+' but found '+rest.charAt(i)+' in: '+rest;
					break;
					// TODO: also test for fixed strings?
				}
				i++
			}
			var fn = makeValidator(rest.slice(0, i));
			if(optional) (function(fn){
				// also check optional fields
				types[ident] = function(value) {
					if(value == undefined) return true;
					return fn(value); // type must either be correct or undefined
				}
			})(fn);
			else types[ident] = fn;
			content = rest.slice(i+1); // everything behind the comma
		}
		return function(value) {
			// validate complex object structures
			if(typeof(value) != 'object') return false;
			// for all definitions:
			for(var i in types) {
				if(i == '*') {
					// whitelist-check
					for(var j in value) {
						// a unknown property which does not fit the wanted *-type
						if((!types[j]) && (!types['*'](value[j]))) return false;
					}
				} else {
					if(!types[i](value[i])) return false;
				}
			}
			return true;
		}
	}
	// TODO: check for OR
	throw "Unknown type identifier: "+type;
}


exports.makeValidator = makeValidator;
exports.makeThrowValidator = function(type) {
	var vali = makeValidator(type);
	return function(value) {
		if(!vali(value)) throw "data format not matched";
	}
}
