sap.ui.define(
	[
		"zdigitalticket/controller/BaseController",
		"zui5controlstmb/utils/Analytics"
	],
	function (BaseController, Analytics) {
		"use strict";

		return BaseController.extend("zdigitalticket.controller.Star", {
			/* =========================================================== */
			/* lifecycle methods                                           */
			/* =========================================================== */
			onInit: function() {
				var sFunctionName = "onInit";

				try {
					this._handleAnalyticsSendEvent(sFunctionName, Analytics.FUNCTION_TYPE.LIFECYCLE);
					BaseController.prototype.onInit.call(this);
					this.getRouter().getRoute("RouteStar").attachPatternMatched(this.onRouteMatched, this);
				}
				catch (oError) {
					this._handleCatchException(oError, sFunctionName);
				}
			},

			/* =========================================================== */
			/* event handlers                       					   */
			/* =========================================================== */
			onRouteMatched: function(oEvent) {
				this.getView().getParent().setVisible(true);
			}

			/* =========================================================== */
			/* formatters and other public methods                         */
			/* =========================================================== */

			/* =========================================================== */
			/* private methods                                             */
			/* =========================================================== */
		});
	}
);
