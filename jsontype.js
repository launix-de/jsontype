/*
Module jsontype.js

*/

// {type: string, additionaltypes: {*: function}
var makeValidator = function(type, additionaltypes) {
	var regex_result;

	// Input: string
	if(/^\s*string\s*$/.test(type)) {
		// type is string
		return function(value) {
			return typeof(value) === 'string';
		};
	}
	if(/^\s*mail\s*$/.test(type)) {
		// type is email
		return function(value) {
			return typeof(value) === 'string' && /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(value);
		};
	}
	if(/^\s*number\s*$/.test(type)) {
		// type is number
		return function(value) {
			return typeof(value) === 'number';
		};
	}
	if(/^\s*boolean\s*$/.test(type)) {
		// type is boolean
		return function(value) {
			return typeof(value) == 'boolean';
		}
	}
	if(/^\s*function\s*$/.test(type)) {
		// type is boolean
		return function(value) {
			return typeof(value) == 'function';
		}
	}
	if(/^\s*undefined\s*$/.test(type)) {
		// check for undefined
		return function(value) {
			return typeof(value) === 'undefined';
		};
	}
	if(/^\s*\*\s*$/.test(type)) {
		// any-Match (everything but undefined)
		return function(value) {
			return value !== undefined;
		};
	}
	if(additionaltypes) {
		// Match von nutzerdefinierten Namen
		regex_result = /^\s*(.*?)\s*$/.exec(type);
		if(regex_result && additionaltypes.hasOwnProperty(regex_result[1])) {
			var fn = additionaltypes[regex_result[1]];
			return function(value) {
				try {
					return fn(value);
				} catch(x) {
					return false;
				}
			};
		}
	}

	if((regex_result = /^\s*"(.*)"\s*$/.exec(type)) || (regex_result = /^\s*"(.*)"\s*$/.exec(type))) {
		// match constant string
		var xstring = regex_result[1];
		return function(value) {
			return value === xstring;
		};
	}
	if((regex_result = /^\s*\[(.+)\]\s*$/.exec(type))) {
		// array-of-match
		var subtype = makeValidator(regex_result[1], additionaltypes);
		return function(value) {
			if(typeof(value) !== 'object') return false;
			if(value.constructor !== Array) return false;
			for(var i in value) {
				if(!subtype(value[i])) return false;
			}
			return true;
		};
	}
	if((regex_result = /^\s*\{(.*)\}\s*$/.exec(type))) {
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
			while(i < rest.length && (rest.charAt(i) !== ',' || brstack.length > 0)) {
				switch(rest.charAt(i)) {
					case "{": brstack.push('}'); break;
					case "(": brstack.push(')'); break;
					case "[": brstack.push(']'); break;
					case '}': case ')': case ']':
					if(brstack.length === 0) throw('closing bracket without opening in: '+rest);
					var last = brstack.pop();
					if(rest.charAt(i) !== last)
						throw "Expected "+last+' but found '+rest.charAt(i)+' in: '+rest;
					break;
					// TODO: also test for fixed strings?
				}
				i++;
			}
			var fn = makeValidator(rest.slice(0, i), additionaltypes);
			if(optional) (function(fn){
				// also check optional fields
				types[ident] = function(value) {
					if(value === undefined) return true;
					return fn(value); // type must either be correct or undefined
				};
			})(fn);
			else types[ident] = fn;
			content = rest.slice(i+1); // everything behind the comma
		}
		return function(value) {
			if(!value) return false;
			// validate complex object structures
			if(typeof(value) !== 'object') return false;
			// for all definitions:
			for(var i in types) {
				if(i === '*') {
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
		};
	}
	// TODO: check for OR
	throw "Unknown type identifier: "+type;
};


exports.makeValidator = makeValidator;
exports.makeThrowValidator = function(type, additionaltypes) {
	var vali = makeValidator(type, additionaltypes);
	return function(value) {
		if(!vali(value)) throw "data format not matched";
	};
};
