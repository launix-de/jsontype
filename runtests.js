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

test(makeValidator('{}')({}));
test(makeValidator('{}')({a: 'b'}));
test(makeValidator('{*:undefined}')({}));
test(!makeValidator('{*:undefined}')({a: 3}));

test(makeValidator('{a: number, b: string}')({b: 'd', a: 5.7}));
var complexvalidator = makeValidator('{a: {x: number, y: number}, b: {*: undefined}}');
test(complexvalidator({a: {x: 3, y: 6}, b: {}}));
test(!complexvalidator({a: {x: 3, z: 6}, b: {}}));
test(!complexvalidator({a: {x: 3, y: 6}, b: {b: 6}}));

var optionalvalidator = makeValidator('{muss: number, kann?: number}');
test(optionalvalidator({muss: 1, kann: 4}));
test(optionalvalidator({muss: 1}));
test(!optionalvalidator({kann: 4}));
test(!optionalvalidator({}));
test(!optionalvalidator(2));
test(!optionalvalidator([1, 2, 3]));


console.log('Tests: '+testPositive+'/'+testSum);
