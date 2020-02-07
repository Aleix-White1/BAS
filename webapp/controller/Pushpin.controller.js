sap.ui.define(
	[
		"zdigitalticket/controller/BaseController",
		"zui5controlstmb/utils/Analytics",
		"sap/ui/model/json/JSONModel",
		"sap/ui/model/Filter",
		"sap/ui/model/FilterOperator",
		"zui5controlstmb/utils/CommonUtils"
	],
	function (BaseController, Analytics, JSONModel, Filter, FilterOperator, CommonUtils) {
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
				this.getView().setModel(new JSONModel({
					today: true,
					ServiceId: "AAM99999",
					EmployeeId: "09999",
					EmployeeName: "ROBERTO ALFREDO FERNANDEZ-RODRIGUEZ DE ZARATE", //JOAN MANEL BORRELL
					Line: "5",
					Shift: "1",
					Zone: "A",
					Date: new Date()
				}), "localBinding");
				this._updateData();
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
				this._updateData();
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

debugger;
				try {
					this._handleAnalyticsSendEvent(sFunctionName, Analytics.FUNCTION_TYPE.LIFECYCLE);
					oModelLocalBinding = this.getView().getModel("localBinding");
					oTrainInfo = oModelLocalBinding.getProperty(oEvent.getSource().getParent().getBindingContextPath());
					//sStopCode = "" + oTrainInfo.stopCode;
					var oParams = {
						"Line":  oTrainInfo.stopCode.substr(0, 1),
						"Station": oTrainInfo.stopCode,
						"Train": oTrainInfo.trainCode,
						"Track": oTrainInfo.track
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

			/* =========================================================== */
			/* private methods                                             */
			/* =========================================================== */
			_updateData: function() {
				var oModel = this.getOwnerComponent().getModel();
				var aFilters = [];

//TODO: Suprimeix aquest hack de les dades
//Codi d'empleat: 02010351    (GAMEZ BORREGO - (020)10351)
//Data: 2018/05/29
this.getView().getModel("localBinding").setProperty("/Date", new Date("2018/05/29"));
				//Add filter by date
				aFilters.push(
					new Filter(
						"Date",
						FilterOperator.EQ,
						CommonUtils.convertDateToUTC(this.getView().getModel("localBinding").getProperty("/Date"))
					)
				);
				//If I'm an admin, I can ask for other users than me
				if (false) { //TODO: Com miro si sóc admin?
					aFilters.push(
						new Filter(
							"EmployeeId",
							FilterOperator.EQ,
							this.getView().getModel("localBinding").getProperty("/EmployeeId")
						)
					);
				}
				this.handleBusy(true);
				oModel.read("/PieceSet", {
					filters: aFilters,
	                success: (function(that) {
	                	var oView;

	                	return function(oData, response) {
		                	try {
		                		oView = that.getView();
		                		oView.getModel("localBinding").setProperty("/PieceSet", oData.results);
		                	}
		                	catch (oError) {
		                		oView.getModel("localBinding").setProperty("/PieceSet", {});
		                	}
							that.handleBusy(false);
							
		                };
	                })(this),
	                error: (function(that) {
	                	return function(oData) {
	                		var sText = "";
	                		var oView;

							try {
								oView = that.getView();
								oView.getModel("localBinding").setProperty("/PieceSet", {});
								sText = JSON.parse(oData.responseText).error.message.value;
							}
							catch (oError) {
								sText = oView.getModel("i18n").getResourceBundle().getText("Calendar.message.calendarRequest.error");
							}
							that.showErrorMessageBox(sText);
							that.handleBusy(false);
		                };
	                })(this)
				});
			}
		});
	}
);
