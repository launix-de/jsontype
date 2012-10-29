Overview
========

jsontype allows data layout assertions for JSON datastructures.

Syntax
======

|jsontype | Valide, wenn |
| ------  | -------------|
|string | typeof(x) == 'string' |

Using jsontype
==============

```javascript
	var validator = generateValidation('{username: string, password: string}', true);
	if(validator({username: 'peter', password: '123'})) {
		// do something
	}
```

