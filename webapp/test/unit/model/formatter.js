sap.ui.define([
	"zdigitalticket/model/formatter",
	"zdigitalticket/controller/BaseController"
], function (formatter, BaseController) {
	"use strict";
	QUnit.module("Number unit");
	function  formatZone (assert, sValue, fExpectedNumber){
				var fNumber = BaseController.formatZone(sValue);
	
	assert.strictEqual(fNumber, fExpectedNumber, "The rounding was correct");
			}
			
	function formatShift (assert, sValue, fExpectedNumber){
		
	var fNumber = BaseController.prototype.formatShift(this,sValue);
	
	assert.strictEqual(fNumber, fExpectedNumber, "The rounding was correct");
		
	}
	function numberUnitValueTestCase(assert, sValue, fExpectedNumber) {
		// Act
		var fNumber = formatter.numberUnit(sValue);

		// Assert
		assert.strictEqual(fNumber, fExpectedNumber, "The rounding was correct");
	}

	function formatDate (assert, sValue, date) {
		// Act
		var oTranslator =  BaseController.oTranslator(date);

		// Assert
		assert.strictEqual(oTranslator, "Formateo correcto!!!");
	}
	
	QUnit.test("testeando format date", function (assert) {
		formatDate.call(this, assert, "", "");
	});
	
	QUnit.test("testeando format shift", function (assert) {
		formatShift.call(this, assert, "3455", "3.89");
	});
	
	QUnit.test("testeando format zone", function (assert) {
		formatZone.call(this, assert, "3455", "3.89");
	});
	
	QUnit.test("testeando format zone", function (assert) {
		formatZone.call(this, assert, "3455", "3.89");
	});
	
	QUnit.test("Should round down a 3 digit number", function (assert) {
		numberUnitValueTestCase.call(this, assert, "3.123", "3.12");
	});

	QUnit.test("Should round up a 3 digit number", function (assert) {
		numberUnitValueTestCase.call(this, assert, "3.128", "3.13");
	});

	QUnit.test("Should round a negative number", function (assert) {
		numberUnitValueTestCase.call(this, assert, "-3", "-3.00");
	});

	QUnit.test("Should round an empty string", function (assert) {
		numberUnitValueTestCase.call(this, assert, "", "");
	});

	QUnit.test("Should round a zero", function (assert) {
		numberUnitValueTestCase.call(this, assert, "0", "0.00");
	});


	
	
/*	QUnit.module("Price State");

	function priceStateTestCase(oOptions) {
		// Act
		var sState = formatter.priceState(oOptions.price);

		// Assert
		oOptions.assert.strictEqual(sState, oOptions.expected, "The price state was correct");
	}

	QUnit.test("Should format the products with a price lower than 50 to Success", function (assert) {
		priceStateTestCase.call(this, {
			assert: assert,
			price: 42,
			expected: "Success"
		});
	});

	QUnit.test("Should format the products with a price of 50 to Normal", function (assert) {
		priceStateTestCase.call(this, {
			assert: assert,
			price: 50,
			expected: "None"
		});
	});

	QUnit.test("Should format the products with a price between 50 and 250 to Normal", function (assert) {
		priceStateTestCase.call(this, {
			assert: assert,
			price: 112,
			expected: "None"
		});
	});

	QUnit.test("Should format the products with a price between 250 and 2000 to Warning", function (assert) {
		priceStateTestCase.call(this, {
			assert: assert,
			price: 798,
			expected: "Warning"
		});
	});

	QUnit.test("Should format the products with a price higher than 2000 to Error", function (assert) {
		priceStateTestCase.call(this, {
			assert: assert,
			price: 2001,
			expected: "Error"
		});
	}); */
});