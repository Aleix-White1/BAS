sap.ui.define(
	[
		"zdigitalticket/controller/BaseController",
		"zui5controlstmb/utils/Analytics",
		"sap/ui/model/json/JSONModel",
		"zui5controlstmb/utils/CommonUtils"
	],
	function (BaseController, Analytics, JSONModel, CommonUtils) {
		"use strict";

		return BaseController.extend("zdigitalticket.controller.App", {
			/* =========================================================== */
			/* lifecycle methods                                           */
			/* =========================================================== */

			/**
			 * Called when the controller is instantiated and its view controls (if any) are already created.
			 * Can be used to modify the view before it is displayed, to bind event handlers and do other one-time initialization.
			 * @override
			 */
			onInit: function () {
				var sFunctionName = "onInit";
				var oViewModel;
				var fnSetAppNotBusy;

				try {
					this._handleAnalyticsSendEvent(sFunctionName, Analytics.FUNCTION_TYPE.LIFECYCLE);
					BaseController.prototype.onInit.call(this);
					oViewModel = new JSONModel({
						busy: true,
						delay: 0,
						busyCounter: 0
					});
					this.getView().setModel(oViewModel, "appView");
//					this.getOwnerComponent().getModel("localBinding").setProperty("/employeeNumber", "");
//					this.getOwnerComponent().getModel("localBinding").setProperty("/selectedDateCalendar", new Date());
//this._checkParameters();
//this.resetDailyActivityViewConfiguration();
//this._getConfig();
					//Disable busy indication when the metadata is loaded and in case of errors
					this.getOwnerComponent().getModel().attachMetadataFailed(
						fnSetAppNotBusy = function() {
							this.handleBusy(false);
						},
						this
					);
					this.getOwnerComponent().getModel().metadataLoaded().then(
						(function(that) {
							return function() {
								fnSetAppNotBusy.call(that);
							};
						})(this)
					);
//this.getCalendarLegend();
					this.getOwnerComponent().getRouter().attachRouteMatched(this.onRouteMatched, this);
					this.getOwnerComponent().getRouter().attachBypassed(this.onRouteMatched, this);
				}
				catch (oError) {
					this._handleCatchException(oError, sFunctionName);
				}
			},

			/* =========================================================== */
			/* event handlers for all app                                  */
			/* =========================================================== */

			/**
			 * Event handler that is invoked when the user clicks any footer button
			 * @event
			 * @param {sap.ui.base.Event} oEvent Information about the event
			 */
			onPressToolbarButton: function(oEvent) {
				var sFunctionName = "onPressPushpinButton";
				var oParams = {};
				var sTarget;

				try {
					this._handleAnalyticsSendEvent(sFunctionName, Analytics.FUNCTION_TYPE.EVENT);
					switch (sTarget = CommonUtils.getPropertyValueCustomData(oEvent.getSource(), "buttonTarget")) {
						case "RoutePushpin1":
						case "RoutePushpin2":
							//Let's add some specific params for tab named "pushpin"
							break;
						case "RouteClock":
							//Let's add some specific params for tab named "clock"
							break;
						case "RouteStar":
							//Let's add some specific params for tab named "star"
							break;
					}
					this.getRouter().navTo(
						sTarget,
						oParams,
						false
					);
				}
				catch (oError) {
					this._handleCatchException(oError, sFunctionName);
				}
			},

			/**
			 * Event handler that is invoked when the user navigates to some known url
			 * @event
			 * @param {sap.ui.base.Event} oEvent Information about the event
			 */
			onRouteMatched: function(oEvent) {
				var sFunctionName = "onRouteMatched";
				var sRouteName;

				try {
					this._handleAnalyticsSendEvent(sFunctionName, Analytics.FUNCTION_TYPE.OTHER);
		            sRouteName = oEvent.getParameters().name;
					this.getView().byId("footerButtons").getContent().forEach(function(oButton) {
						if (CommonUtils.getPropertyValueCustomData(oButton, "buttonTarget") !== sRouteName) {
							oButton.setType("Default");
						}
						else {
							oButton.setType("Emphasized");
						}
					});
				}
				catch (oError) {
					this._handleCatchException(oError, sFunctionName);
				}
			}//,

			/* =========================================================== */
			/* private methods                                             */
			/* =========================================================== */
/*			resetDailyActivityViewConfiguration: function(){
				var sFunctionName = "resetDailyActivityViewConfiguration";

				try {
					this._handleAnalyticsSendEvent(sFunctionName, Analytics.FUNCTION_TYPE.OTHER);
					this.getView().getModel("localBinding").setProperty("/config", {
						"is_admin": false
					});
				}
				catch (oError) {
					this._handleCatchException(oError, sFunctionName);
				}
			} */
		});
	}
);
