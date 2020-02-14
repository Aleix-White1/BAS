sap.ui.define(
	[
		"zdigitalticket/controller/BaseController",
		"zui5controlstmb/utils/Analytics",
		"sap/ui/model/json/JSONModel",
		"sap/ui/model/Filter",
		"sap/ui/model/FilterOperator"
	],
	function (BaseController, Analytics, JSONModel, Filter, FilterOperator) {
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
				var sFunctionName = "onRouteMatched";
				var oModelLocalBinding;

				try {
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
				var oModel = this.getView().getModel("localBinding");
				var bToday = !this.getView().getModel("localBinding").getProperty("/today");
				var oDate = new Date();

				oModel.setProperty("/today", bToday);
				if (!bToday) {
					oDate.setDate(oDate.getDate() - 1);
				}
				oModel.setProperty("/Date", oDate);
				this._getTicketData();
			},

			onDownloadTicket: function(oEvent) {
debugger;
				//TODO: Descarregar el pdf
			},

			onStartStationClicked: function(oEvent) {
				var sFunctionName = "onStartStationClicked";
				var oModelLocalBinding;
				var oTrainInfo;

				try {
					this._handleAnalyticsSendEvent(sFunctionName, Analytics.FUNCTION_TYPE.LIFECYCLE);
					oModelLocalBinding = this.getView().getModel("localBinding");
					oTrainInfo = oModelLocalBinding.getProperty(oEvent.getSource().getParent().getParent().getBindingContextPath());
					this.getRouter().navTo(
						"RouteStationInfo",
						{
							// "Line": oTrainInfo.LineNumber, 
							"Line": oModelLocalBinding.getProperty("/Line").replace("L", ""),
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
					this._handleAnalyticsSendEvent(sFunctionName, Analytics.FUNCTION_TYPE.LIFECYCLE);
					oModelLocalBinding = this.getView().getModel("localBinding");
					oTrainInfo = oModelLocalBinding.getProperty(oEvent.getSource().getParent().getParent().getBindingContextPath());
					var oParams = {
						"Line": oModelLocalBinding.getProperty("/Line").replace("L", ""),
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
debugger;
				if (typeof value === "string" && value.length > 5) {
					return value.substring(value.length - 5);
				}
				else {
					return value;
				}
			}
		});
	}
);
