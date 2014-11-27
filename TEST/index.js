<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>QUnit - Hashjs</title>
<link rel="stylesheet" href="./qunitjs/qunit/qunit.css">
</head>
<body>
<div id="qunit"></div>
<div id="qunit-fixture"></div>
<script type="text/javascript" src="../dist/hash.js"></script>
<script type="text/javascript" src="./qunitjs/qunit/qunit.js"></script>
<script>

	var getObject = function(key) {
		if (key === 1) {
			return new Object({
				"One": [{
					"val": "first"
				},{
					"Two": {
						"val": "second",
						"Three": [{
							"val": "third"
						},{
							"val": "third"
						}]
					}
				}]
			});
		}
	}

	module('Expand');

	test('simple, string-key nested', function() {
		var flat = {
			'One.Two.val'					: 'nested2',
			'One.Two.Three.val'				: 'nested3',
			'One.Two.Three.Four.val'		: 'nested4',
			'One.Two.Three.Four.Five.val'	: 'nested5'
		};

		deepEqual(Hash.expand(flat), {
			One: {
				Two: {
					val: 'nested2',
					Three: {
						val: 'nested3',
						Four: {
							val: 'nested4',
							Five: {
								val: 'nested5'
							}
						}
					}
				}
			}
		}, 'Expands flattened object with only string keys.');

	});

	test('string-key and array nested', function() {
		var flat = {
			'One.0.val'					: 'first',
			'One.1.Two.val'				: 'second',
			'One.1.Two.Three.0.val'		: 'third',
			'One.1.Two.Three.1.val'		: 'third'
		};

		deepEqual(Hash.expand(flat), getObject(1), 'Expands flatened object with numberic keys. Should result in arrays.');

	});

	module('Extract');

	test('Token numberic wildcard extraction', function() {
		var data = getObject(1);

		deepEqual(Hash.extract(data, 'One.1.Two.Three.{n}.val'), [
			'third',
			'third'
		], 'Gets an array of "third" and "third", the values at the path One.1.Two.Three.{any numberic key}.val');

	});

	test('Token string wildcard extraction', function() {
		var data = getObject(1);

		deepEqual(Hash.extract(data, 'One.1.Two.{s}'), [
			'second',
			[{
				val: 'third'
			},{
				val: 'third'
			}]
		], 'Extract path One.1.{s}, gets the values at One.1.{any string key}');
	});

	module('get');

	test('simple get path', function() {
		var data = getObject(1);

		equal(Hash.get(data, 'One.1.Two.Three.1.val'), 'third', 'Got value at path');
	});

	module('insert');

	test('insert at simple path', function() {
		var data = getObject(1);

		Hash.insert(data, 'One.1.Two.valsibling', 'two');

		deepEqual(data, {
				One: [{
					val: "first"
				},{
					Two: {
						Three: [{
							val: 'third'
						},{
							val: 'third'
						}],
						val: "second",
						valsibling: 'two'
					}
				}]
			}, 'Should insert sibling key "valsibling" in "Two" object with value "two"');
	});

	test('insert at simple path 2 - Array insert', function() {
		var data = getObject(1);

		Hash.insert(data, 'One.1.Two.Three.2', {val: 'third'});

		deepEqual(data, {
				One: [{
					val: "first"
				},{
					Two: {
						Three: [{
							val: 'third'
						},{
							val: 'third'
						},{
							val: 'third'
						}],
						val: "second"
					}
				}]
			}, 'Should insert object val: third into "Three" array at index 2');
	});

	test('insert at complex path', function() {
		var data = getObject(1);

		Hash.insert(data, 'One.1.Two.{s}', 'replaced');

		deepEqual(data, {
				One: [{
					val: "first"
				},{
					Two: {
						Three: 'replaced',
						val: 'replaced'
					}
				}]
			}, 'Should replace all values in "Two" object that have string keys with "replaced" ');
	});

	module('remove');

	test('remove at simple path', function() {
		var data = getObject(1);

		Hash.remove(data, 'One.1.Two.Three.1');

		deepEqual(data, {
				"One": [{
					"val": "first"
				},{
					"Two": {
						"val": "second",
						"Three": [{
							"val": "third"
						}]
					}
				}]
			}, 'should have removed an object from the "Three" array of objects')
	});


	test('remove at complex path', function() {
		var data = getObject(1);

		Hash.remove(data, 'One.1.Two.Three.{n}');

		deepEqual(data, {
				One: [{
					val: "first"
				},{
					Two: {
						val: "second"
					}
				}]
			}, 'should have removed an object from the "Three" array of objects, path: One.1.Two.Three.{n}')
	});

	module('flatten');

	test('deep object', function() {

		var date = new Date(),
			div = document.createElement('div'),
			regex = new RegExp();

		var deepObject = {
			One: {
				Two: {
					val: 'string',
					Three: {
						Four: 1,
						Five: 2
					}
				}
			},
			Two: {
				Two: {
					Three: {
						val: date
					},
					Four: {
						val: regex,
						val2: div
					}
				}
			}
		};

		var flattened = Hash.flatten(deepObject);

		deepEqual(flattened, {
			'One.Two.val'			: 'string',
			'One.Two.Three.Four'	: 1,
			'One.Two.Three.Five'	: 2,
			'Two.Two.Three.val'		: date,
			'Two.Two.Four.val'		: regex,
			'Two.Two.Four.val2'		: div
		}, 'flatten a deep object with native javascript objects inside');
	});

	test('simple flat', function() {

		var shallowObject = {
			one: 'val',
			two: 'val',
			three: 'val'
		};

		var flattened = Hash.flatten(shallowObject);

		deepEqual(flattened, {
			one: 'val',
			two: 'val',
			three: 'val'
		}, 'flatten a shallow object');
	});


</script>
</body>
</html>