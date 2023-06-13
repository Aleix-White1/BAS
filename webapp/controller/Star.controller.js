sap.ui.define(
	[
		"zdigitalticket/controller/BaseController",
		"sap/base/Log"
	],
	function (BaseController, Log) {
		"use strict";

		return BaseController.extend("zdigitalticket.controller.Star", {
			/* =========================================================== */
			/* lifecycle methods                                           */
			/* =========================================================== */
			onInit: function() {
				try {
					BaseController.prototype.onInit.call(this);
					this.getRouter().getRoute("RouteStar").attachPatternMatched(this.onRouteMatched, this);
				}
				catch (oError) {
					Log.error(oError.message);
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
