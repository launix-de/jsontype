
// {type: string, additionaltypes: {*: function}
var makeValidator = function(type, varname) {
	var regex_result;

	// Input: string
	if(/^\s*string\s*$/.test(type)) {
		// type is string
		return 'isset(' + varname + ') && is_string(' + varname + ')';
	}
	if(/^\s*mail\s*$/.test(type)) {
		// type is email
		return 'isset(' + varname + ') && is_string(' + varname + ') && filter_var(' + varname + ', FILTER_VALIDATE_EMAIL)'; 
	}
	if(/^\s*number\s*$/.test(type)) {
		// type is number
		return 'isset(' + varname + ') && is_numeric(' + varname + ')';
	}
	if(/^\s*boolean\s*$/.test(type)) {
		// type is boolean
		return 'isset(' + varname + ') && is_bool(' + varname + ')';
	}
	if(/^\s*undefined\s*$/.test(type)) {
		// check for undefined
		return '!isset(' + varname + ')';
	}
	if(/^\s*\*\s*$/.test(type)) {
		// any-Match (everything but undefined)
		return 'isset(' + varname + ')';
	}

	if((regex_result = /^\s*"(.*)"\s*$/.exec(type)) || (regex_result = /^\s*"(.*)"\s*$/.exec(type))) {
		// match constant string
		var xstring = regex_result[1];
		return 'isset(' + varname + ') && ' + varname + ' == "' + xstring + '"';
	}
	if((regex_result = /^\s*\[(.+)\]\s*$/.exec(type))) {
		// array-of-match
		var subtype = makeValidator(regex_result[1], '$item');
		return 'isset(' + varname + ') && is_array(' + varname + ') && array_reduce(' + varname + ', function ($carry, $item) {return $carry && ' + subtype + ';}, true)';
	}
	if((regex_result = /^\s*\{(.*)\}\s*$/.exec(type))) {
		// objects
		var content = regex_result[1];
		var types = []; // associative list of type restrictions
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
			if(!r) throw new Error("Error in object type syntax near: " + content);
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
			if (ident != '*') {
				var fn = makeValidator(rest.slice(0, i), varname + '[\'' + ident + '\']');
				if(optional) fn = '(!isset(' + varname + '[\'' + ident + '\']) || (' + fn + '))'
				types.push(fn);
			} else {
				// TODO validate everything but the collected types
				var subtype = makeValidator(rest, '$item');
				types.push('array_reduce(' + varname + ', function ($carry, $item) {return $carry && ' + subtype + ';}, true)');
			}
			content = rest.slice(i+1); // everything behind the comma
		}
		return 'isset(' + varname + ') && is_array(' + varname + ') && ' + types.join(' && ');
	}
	// TODO: check for OR
	throw new Error("Unknown type identifier: " + type);
};

if (process.argv[2] && process.argv[2][0] == '$') {
	// Variablenname benannt
	var str = process.argv.splice(3).join(' ');
	console.log('// created from ' + str);
	console.log(makeValidator(str, process.argv[2]));
} else {
	// Funktion kapseln
	var str = process.argv.splice(2).join(' ');
	console.log('function validate($x) {');
	console.log('  // created from ' + str);
	console.log('  return ' + makeValidator(str, '$x') + ';');
	console.log('}');
}
