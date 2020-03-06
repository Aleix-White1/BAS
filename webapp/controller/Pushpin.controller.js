sap.ui.define(
	[
		"zdigitalticket/controller/BaseController",
		"zui5controlstmb/utils/Analytics",
		"sap/ui/model/json/JSONModel",
		"sap/ui/model/Filter",
		"zui5controlstmb/utils/CommonUtils",
		"sap/ui/model/FilterOperator"
	],
	function (BaseController, Analytics, JSONModel, Filter, CommonUtils, FilterOperator) {
		"use strict";

		return BaseController.extend("zdigitalticket.controller.Pushpin", {
			/* =========================================================== */
			/* lifecycle methods                                           */
			/* =========================================================== */
			onInit: function() {
				var sFunctionName = "onInit";

				try {
					this._handleAnalyticsSendEvent(sFunctionName, Analytics.FUNCTION_TYPE.LIFECYCLE);
					this.getRouter().getRoute("RoutePushpin").attachPatternMatched(this.onPushpinMatched, this);
				}
				catch (oError) {
					this._handleCatchException(oError, sFunctionName);
				}
			},

			/* =========================================================== */
			/* event handlers                       					   */
			/* =========================================================== */
			onPushpinMatched: function(oEvent) {
				var sFunctionName = "onPushpinMatched";
				var oModelLocalBinding;

				try {
					this._handleAnalyticsSendEvent(sFunctionName, Analytics.FUNCTION_TYPE.EVENT);
					oModelLocalBinding = this.getView().getModel("localBinding");
					oModelLocalBinding.setProperty("/", {
						today: true,
						ServiceId: "",
						EmployeeId: oModelLocalBinding.getProperty("/EmployeeId"), //This was set by App.controller
						AssignationGroupId: oModelLocalBinding.getProperty("/AssignationGroupId"), //This was set by App.controller
						EmployeeName: "",
						Line: "",
						Shift: "",
						Zone: "",
						Date: new Date()
					});
					this._getTicketData();
				}
				catch (oError) {
					this._handleCatchException(oError, sFunctionName);
				}
			},

			onChangeDay: function(oEvent) {
				var sFunctionName = "onChangeDay";
				var oModel;
				var bToday;
				var oDate;

				try {
					this._handleAnalyticsSendEvent(sFunctionName, Analytics.FUNCTION_TYPE.EVENT);
					oModel = this.getView().getModel("localBinding");
					bToday = !this.getView().getModel("localBinding").getProperty("/today");
					oDate = new Date();
					oModel.setProperty("/today", bToday);
					if (!bToday) {
						oDate.setDate(oDate.getDate() - 1);
					}
					oModel.setProperty("/Date", oDate);
					this._getTicketData();
				}
				catch (oError) {
					this._handleCatchException(oError, sFunctionName);
				}
			},

			onDownloadTicket: function(oEvent) {
				var sFunctionName = "onDownloadTicket";
				var sURL;

				try {
					this._handleAnalyticsSendEvent(sFunctionName, Analytics.FUNCTION_TYPE.EVENT);
					if (!this.getView().getModel("appView").getProperty("/isAdmin")) {
						sURL = this.getOwnerComponent().getModel().sServiceUrl;
						sap.m.URLHelper.redirect(
							sURL + "/TicketSet(EmployeeId='" + sap.ushell.Container.getService("UserInfo").getId().substr(0, 10) + "',AssignationGroupId='%20',Today=true)/$value",
							true
						);
					}
				}
				catch (oError) {
					this._handleCatchException(oError, sFunctionName);
				}
			},

			onStartStationClicked: function(oEvent) {
				var sFunctionName = "onStartStationClicked";
				var oModelLocalBinding;
				var oTrainInfo;

				try {
					this._handleAnalyticsSendEvent(sFunctionName, Analytics.FUNCTION_TYPE.EVENT);
					oModelLocalBinding = this.getView().getModel("localBinding");
					oTrainInfo = oModelLocalBinding.getProperty(oEvent.getSource().getParent().getParent().getBindingContextPath());
					this.getRouter().navTo(
						"RouteStationInfo",
						{
							"Line": oModelLocalBinding.getProperty("/Line"),
							"Station": oTrainInfo.StartStation
						},
						false
					);
				}
				catch (oError) {
					this._handleCatchException(oError, sFunctionName);
				}
			},

			onTrainStationClicked: function(oEvent) {
				var sFunctionName = "onTrainStationClicked";
				var oModelLocalBinding;
				var oTrainInfo;

				try {
					this._handleAnalyticsSendEvent(sFunctionName, Analytics.FUNCTION_TYPE.EVENT);
					oModelLocalBinding = this.getView().getModel("localBinding");
					oTrainInfo = oModelLocalBinding.getProperty(oEvent.getSource().getParent().getParent().getBindingContextPath());
					var oParams = {
						"Line": oModelLocalBinding.getProperty("/Line"),
						"Station": oTrainInfo.StartStation,
						"Train": oTrainInfo.TrainStation,
						"Track": oTrainInfo.StartTrack
					};
					this.getRouter().navTo(
						"RouteTEInfo",
						oParams,
						false
					);
				}
				catch (oError) {
					this._handleCatchException(oError, sFunctionName);
				}
			},

			/* =========================================================== */
			/* formatters and other public methods                         */
			/* =========================================================== */
			
			formatEmployeeId: function(value) {
				var sFunctionName = "formatEmployeeId";

				try {
					this._handleAnalyticsSendEvent(sFunctionName, Analytics.FUNCTION_TYPE.FORMATTER);
					if (typeof value === "string" && value.length > 5) {
						return value.substring(value.length - 5);
					}
					else {
						return value;
					}
				}
				catch (oError) {
					this._handleCatchException(oError, sFunctionName);
				}
			}
		});
	}
);
