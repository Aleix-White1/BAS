/* global QUnit */

QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function() {
	"use strict";

	sap.ui.require([
		"zdigitalticket/test/integration/AllJourneys"
	], function() {
		QUnit.start();
	});
});
