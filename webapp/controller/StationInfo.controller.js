sap.ui.define(
	[
		"zdigitalticket/controller/BaseController",
		"zui5controlstmb/utils/Analytics"
	],
	function (BaseController, Analytics) {
		"use strict";
	
		return BaseController.extend("zdigitalticket.controller.StationInfo", {
			/* =========================================================== */
			/* lifecycle methods                                           */
			/* =========================================================== */
			onInit: function() {
				var sFunctionName = "onInit";

				try {
					this._handleAnalyticsSendEvent(sFunctionName, Analytics.FUNCTION_TYPE.LIFECYCLE);
					BaseController.prototype.onInit.call(this);
				}
				catch (oError) {
					this._handleCatchException(oError, sFunctionName);
				}
			}

			/* =========================================================== */
			/* event handlers                       					   */
			/* =========================================================== */

			/* =========================================================== */
			/* formatters and other public methods                         */
			/* =========================================================== */

			/* =========================================================== */
			/* formatters and other public methods                         */
			/* =========================================================== */
		});
	}
);
