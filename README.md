Overview
========

jsontype allows data layout assertions for JSON datastructures.

Syntax
======

<pre>
string - only accepts string
"abc" - only accepts string with exactly this content
number - only accepts numbers
undefined - only accepts undefined (a object entry must not be defined)
* - accepts everything but undefined values
[type] - accepts only arrays of that specified subtype
{name: type, name: type} - accepts only objects that have these properties with exactly these types
{name: type, * : undefined} - accepts only objects that have no other properties than the named ones
{name?: type} - accepts only objects that dont have this named property or the property has the specified type
{"name": type} - accepts only objects which have this named property with exactly this type
</pre>

Using jsontype
==============

```javascript
	var validator = generateValidation('{username: string, password: string}', true);
	if(validator({username: 'peter', password: '123'})) {
		// do something
	}
```

