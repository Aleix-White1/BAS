sap.ui.define(
	[
		"zui5controlstmb/controller/BaseController",
		"zui5controlstmb/utils/Analytics",
		"sap/m/MessageBox"
	],
	function (BaseController, Analytics, MessageBox) {
		"use strict";

		return BaseController.extend("zdigitalticket.controller.BaseController", {
			/* =========================================================== */
			/* lifecycle methods                                           */
			/* =========================================================== */

			/* =========================================================== */
			/* event handlers for all app                                  */
			/* =========================================================== */

			/* ============================================================ */
			/* formatters and other public methods                          */
			/* ============================================================ */
			handleBusy: function(bShowBusy) {
				var oAppViewModel = this.getView().getModel("appView");
				var sBusyCounter = oAppViewModel.getProperty("/busyCounter");
				var iBusyCounter = parseInt(sBusyCounter, 10);

				if (bShowBusy) {
					oAppViewModel.setProperty("/busyCounter", ++iBusyCounter);
					oAppViewModel.setProperty("/busy", true);
				}
				else {
					oAppViewModel.setProperty("/busyCounter", --iBusyCounter);
					if (iBusyCounter <= 0) {
						oAppViewModel.setProperty("/busy", false);
						oAppViewModel.setProperty("/busyCounter", 0);
					}
				}
			},

			getRouter: function() {
				var sFunctionName = "getRouter";

				try {
					this._handleAnalyticsSendEvent(sFunctionName, Analytics.FUNCTION_TYPE.OTHER);
					return sap.ui.core.UIComponent.getRouterFor(this);
				}
				catch (oError) {
					this._handleCatchException(oError, sFunctionName);
				}
				return undefined;
			},

			showErrorMessageBox: function(sText, pTitle){
				var sFunctionName = "showErrorMessageBox";

				try {
					this._handleAnalyticsSendEvent(sFunctionName, Analytics.FUNCTION_TYPE.OTHER);
					var oView = this.getView();
					var oModelLocalBinding = oView.getModel("localBinding");
					var oResourceBundle = oView.getModel("i18n").getResourceBundle();
					if (oModelLocalBinding.getProperty("/errorMessage") === undefined) {
						oModelLocalBinding.setProperty("/errorMessage", sText);
						var sTitle = pTitle;
						if (sTitle === undefined){
							sTitle = oResourceBundle.getText("commons.title.error");
						}
						MessageBox.show(
							sText, {
								title: sTitle,
								styleClass: this.getOwnerComponent().getContentDensityClass(),
								actions: [MessageBox.Action.CLOSE],
								onClose: function(oAction) { 
									oModelLocalBinding.setProperty("/errorMessage", undefined);
								}
							}
						);
					}
				}
				catch (oError) {
					this._handleCatchException(oError, sFunctionName);
				}	
			}

			/* =========================================================== */
			/* private methods                                             */
			/* =========================================================== */
		});
	}
);
