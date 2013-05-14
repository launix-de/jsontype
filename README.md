Overview
========

jsontype allows data layout assertions for JSON datastructures.

Syntax
======

<pre>
string - only accepts string
mail - only accepts strings that are formed like an email
"abc" - only accepts string with exactly this content
number - only accepts numbers
boolean - only accepts true or false
function - only accepts a function
undefined - only accepts undefined (a object entry must not be defined)
* - accepts everything but undefined values
[type] - accepts only arrays of that specified subtype
{name: type, name: type} - accepts only objects that have these properties with exactly these types
{name: type, * : undefined} - accepts only objects that have no other properties than the named ones
{name?: type} - accepts only objects that dont have this named property or the property has the specified type
{"name": type} - accepts only objects which have this named property with exactly this type
</pre>
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

makeValidator creates a Function which you can call with one parameter - the value to validate.
The function returns true if the value validates okay.
It is good practise to create all validators at startup and then just call the generated functions.
If you want to have an exception thrown instead of a boolean return value, use makeThrowValidator.
It will create functions that exit with undefined or throw an exception.

More Examples
=============

Look into runtests.js which provides a lot of test cases that cover all features of jsontype.
