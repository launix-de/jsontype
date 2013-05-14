Overview
========

JSONtype is a markup language that describes JSON data layout and allows you to validate random JavaScript values. This prevents you from writing lots of try-catch blocks or to get undefined results when processing malformed user input.

Syntax
======

`*` - accepts everything but undefined values<br/>
`string` - only accepts string<br/>
`mail` - only accepts strings that are formed like an email<br/>
`"abc"` - only accepts string with exactly this content<br/>
`number` - only accepts numbers<br/>
`boolean` - only accepts true or false<br/>
`function` - only accepts a function<br/>
`undefined` - only accepts undefined (a object entry must not be defined)<br/>

`[*]` - accepts any array<br/>
`[type]` - accepts only arrays of that specified subtype<br/>

`{name: type, name: type}` - accepts only objects that have these properties with exactly these types<br/>
`{name: type, * : undefined}` - accepts only objects that have no other properties than the named ones<br/>
`{*: type}` - accepts only objects where all properties have the specified subtype<br/>
`{name?: type}` - accepts only objects that dont have this named property or the property has the specified type<br/>
`{"name": type}` - accepts only objects which have this named property with exactly this type (be careful, the parser is not perfect)<br/>

Caution: Do not accept validation schemas from the user because they could harm you.

Using jsontype
==============

```javascript
	var validator = makeValidator('{username: string, password: string}');
	if(validator({username: 'peter', password: '123'})) {
		// do something
	}
```

You can also define your own types as regexp or function like

```javascript
	function validatePassword(value) {
		// Password criteria
		return typeof(value) === 'string' && value.length >= 8;
	}
	// we define two additional validators
	// identifier forces strings via regexp to begin with a alphanumerical character
	// pwstring forces strings via function to be at least 8 characters strong
	var validator = makeValidator('{username: identifier, password: pwstring}', {
		identifier: /^[a-zA-Z_][a-zA-Z_0-9]*$/,
		pwstring: validatePassword
	});
	if(!validator({username: 'peter', password: '123'})) {
		console.log('Check if your password fits the criteria');
	}
```
This especially makes sense if you want to compose validators to more complex situations.

`makeValidator` creates a Function which you can call with one parameter - the value to validate.
The function returns `true` if the value validates successfully.
It is good practise to create all validators at startup and then just call the generated functions.
If you want to have an exception thrown instead of a boolean return value, use `makeThrowValidator`.
It will create functions that exit with `undefined` or throw an exception.

More Examples
=============

Look into runtests.js which provides a lot of test cases that cover all features of jsontype.
