sap.ui.define([
		"sap/ui/test/Opa5",
		"sap/ui/test/actions/Press"
	], function(Opa5, Press) {
		"use strict";

		var sViewName = "ViewName";

		Opa5.createPageObjects({
			onMyPageUnderTest: {
				actions: {
					iDoMyAction: function() {
						return this.waitFor({
							id: "controlId",
							viewName: sViewName,
							actions: new Press(),
							errorMessage: "Was not able to find the control with the id controlId"
						});
					}
				},
				assertions: {
					iDoMyAssertion: function() {
						return this.waitFor({
							id: "controlId2",
							viewName: sViewName,
							success: function() {
								Opa5.assert.ok(false, "Implement me");
							},
							errorMessage: "Was not able to find the control with the id controlId2"
						});
					}
				}
			}
		});
	}
);