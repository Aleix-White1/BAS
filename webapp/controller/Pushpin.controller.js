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
				var oParams = {
					"Line":  "1",
					"Station": "140"
				};
				this.getRouter().navTo(
					"RouteStationInfo",
					oParams,
					false
				);
			},

			onTrainStationClicked: function(oEvent) {
				var oParams = {
					"Line":  "1",
					"Station": "140",
					"Train": "109",
					"Track": "1"
				};
				this.getRouter().navTo(
					"RouteTEInfo",
					oParams,
					false
				);
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

				//Add filter by date (yesterday or today)
var sTemp;
sTemp = prompt("Fecha fake (yyyy/mm/dd)");
if (sTemp) {
	this.getView().getModel("localBinding").setProperty("/Date", new Date(sTemp));
}/*
sTemp = undefined
sTemp = prompt("Usuario fake (código)");
if (sTemp) {
	this.getView().getModel("localBinding").setProperty("/EmployeeId", sTemp);
}*/
// var sTemp;
// sTemp = "2018/05/29";
// if (sTemp) {
// 	this.getView().getModel("localBinding").setProperty("/Date", new Date(sTemp));
// }
// sTemp = "02010351";
// if (sTemp) {
// 	this.getView().getModel("localBinding").setProperty("/EmployeeId", sTemp);
// }

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
				oModel.read("/PieceSet", {
					filters: aFilters,
	                success: (function(that) {
	                	return function(oData, response) {
	                		that.getView().getModel("localBinding").setProperty("/PieceSet", oData.results);
/*		                	try {
	                			that.getView().getModel("localBinding").setProperty("/PieceSet", oData.results);
		                	}
		                	catch (oError) {
		                		that.getView().getModel("localBinding").setProperty("/PieceSet", {});
		                	}*/
		                };
	                })(this),
	                error: (function(that) {
	                	return function(oError) {
	                		that.getView().getModel("localBinding").setProperty("/PieceSet", {});
/*							var sText = "";
							try{
								sText = JSON.parse(oData.responseText).error.message.value;
							} catch(oError){
								sText = oResourceBundle.getText("Calendar.message.calendarRequest.error");
							}
							that.showErrorMessageBox(sText);*/
		                };
	                })(this)
				});
			}
		});
	}
);
