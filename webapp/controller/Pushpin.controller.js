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
					//TODO: Reconsidera l'ús d'una altra estructura per a l'id d'usuari
					this.getRouter().getRoute("RoutePushpin1").attachPatternMatched(this.onPushpinMatched, this);
					this.getRouter().getRoute("RoutePushpin2").attachPatternMatched(this.onPushpinMatched, this);
				}
				catch (oError) {
					this._handleCatchException(oError, sFunctionName);
				}
			},

			/* =========================================================== */
			/* event handlers                       					   */
			/* =========================================================== */
			onPushpinMatched: function(oEvent) {
				var oModelLocalBinding = this.getView().getModel("localBinding");
				oModelLocalBinding.setProperty("/",{
					today: true,
					ServiceId: "",
					EmployeeId: "",
					EmployeeName: "",
					Line: "",
					Shift: "",
					Zone: "",
					Date: new Date()
				});
				this._getTicketDataData();
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
				this._getTicketDataData();
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
					//sStopCode = "" + oTrainInfo.stopCode;
					var oParams = {
						// "Line":  oTrainInfo.LineNumber,
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

			
		});
	}
);
