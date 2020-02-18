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
			onInit: function() {
				var sFunctionName = "onInit";
				var oViewModel;
				var fnSetAppNotBusy;
				var oModelLocalBinding;
				var oParameters;
				var sEmployeeId;
				var sAssignationGroupId;

				try {
					this._handleAnalyticsSendEvent(sFunctionName, Analytics.FUNCTION_TYPE.LIFECYCLE);
					BaseController.prototype.onInit.call(this);
					oViewModel = new JSONModel();
					oViewModel.loadData(
						this.getOwnerComponent().getModel().sServiceUrl + "/GetUserInformation",
						undefined,
					    false, //Synchronous call
					    "GET"
					);
					oViewModel = new JSONModel({
						busy: true,
						busyCounter: 0,
						backButtonVisible: false,
						isAdmin: oViewModel.getProperty("/d/GetUserInformation/isAdmin")
					});
					this.getView().setModel(oViewModel, "appView");
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
					//Let's check for initial parameters
					oParameters = this.getOwnerComponent().getComponentData().startupParameters;
					if (oParameters && Array.isArray(oParameters.EmpId) && Array.isArray(oParameters.AssGrId) && this.getView().getModel("appView").getProperty("/isAdmin")) {
						sEmployeeId = oParameters.EmpId[0];
						if (!sEmployeeId) {
							sEmployeeId = "";
						}
						sAssignationGroupId = oParameters.AssGrId[0];
						if (!sAssignationGroupId) {
							sAssignationGroupId = "";
						}
					}
					else {
						sEmployeeId = "";
						sAssignationGroupId = "";
					}
					oModelLocalBinding = this.getView().getModel("localBinding");
					oModelLocalBinding.setProperty("/EmployeeId", sEmployeeId);
					oModelLocalBinding.setProperty("/AssignationGroupId", sAssignationGroupId);
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
			 * Event handler that is invoked when the user clicks any footer button (except back button)
			 * @event
			 * @param {sap.ui.base.Event} oEvent Information about the event
			 */
			onPressToolbarButton: function(oEvent) {
				var sFunctionName = "onPressToolbarButton";
				var sTarget;

				try {
					this._handleAnalyticsSendEvent(sFunctionName, Analytics.FUNCTION_TYPE.EVENT);
					sTarget = CommonUtils.getPropertyValueCustomData(oEvent.getSource(), "buttonTarget");
					this.getRouter().navTo(
						sTarget,
						{},
						false
					);
				}
				catch (oError) {
					this._handleCatchException(oError, sFunctionName);
				}
			},
			/**
			 * Event handler that is invoked when the user clicks back button in footer
			 * @event
			 * @param {sap.ui.base.Event} oEvent Information about the event
			 */
			onPressBackButton: function(oEvent) {
				var sFunctionName = "onPressBackButton";

				try {
					this._handleAnalyticsSendEvent(sFunctionName, Analytics.FUNCTION_TYPE.EVENT);
					this.onNavBack();
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
				var backButtonVisible = true;
				var sRouteName;

				try {
					this._handleAnalyticsSendEvent(sFunctionName, Analytics.FUNCTION_TYPE.EVENT);
		            sRouteName = oEvent.getParameters().name;
					this.getView().byId("footerButtons").getContent().forEach(function(oButton) {
						if (CommonUtils.getPropertyValueCustomData(oButton, "buttonTarget") !== sRouteName) {
							oButton.setType("Default");
						}
						else {
							oButton.setType("Emphasized");
							backButtonVisible = false;
						}
					});
					this.getView().getModel("appView").setProperty("/backButtonVisible", backButtonVisible);
				}
				catch (oError) {
					this._handleCatchException(oError, sFunctionName);
				}
			}
		});
	}
);
