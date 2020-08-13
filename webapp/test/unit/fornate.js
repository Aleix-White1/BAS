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
	
	beforeEach: QUnit.test("testeando format date", function (assert) {
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
