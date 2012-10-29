/*
Unit test for jsontype.js
*/

var makeValidator = require('./jsontype.js').makeValidator;

var testSum = 0, testPositive = 0;
function test(x) {
	testSum++;
	if(x) testPositive++;
	else console.trace('Test failed');
}

var stringvalidator = makeValidator(' string');
test(stringvalidator('abc'));
test(!stringvalidator(123));
test(!stringvalidator({}));

var numbervalidator = makeValidator('number   	');
test(numbervalidator(3));
test(!numbervalidator('4'));
test(!numbervalidator(function(){}));

var anyvalidator = makeValidator('*');
test(anyvalidator(6));
test(anyvalidator(''));
test(anyvalidator(0));
test(anyvalidator({}));
test(!anyvalidator());

var numberarrayvalidator = makeValidator('[number]');
test(numberarrayvalidator([]));
test(!numberarrayvalidator());
test(!numberarrayvalidator([1, '2']));
test(numberarrayvalidator([1, 2, 3]));
test(!numberarrayvalidator([1, 2, {}]));

var anyarrayvalidator = makeValidator('[*]');
test(anyarrayvalidator([]));
test(anyarrayvalidator([1, '3', {}]));
test(!anyarrayvalidator({}));



console.log('Tests: '+testPositive+'/'+testSum);
