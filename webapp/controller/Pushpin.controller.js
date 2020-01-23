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
				this.getView().setModel(new JSONModel({
					today: true,
					ServiceId: "AAM15232",
					EmployeeId: "07196",
					EmployeeName: "RIVERA RIOS",
					Line: "5",
					Shift: "1",
					Date: new Date()
				}), "localBinding");
				this._updateData();
				//TODO: Si l'usuari no és admin, s'hauria de començar a descarregar el famós pdf
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

			/* =========================================================== */
			/* formatters and other public methods                          */
			/* =========================================================== */
			formatDate: function(date) {
				var oTranslator;

				if (date) {
					oTranslator = this.getView().getModel("i18n").getResourceBundle();
					return oTranslator.getText("week.day." + date.getDay()) + " " + date.getDate() + " " + oTranslator.getText("month." + date.getMonth()) + " " + oTranslator.getText("year.prefix") + " " + date.getFullYear();
				}
				else {
					return "";
				}
			},

			/* =========================================================== */
			/* private methods                                             */
			/* =========================================================== */
			_updateData: function() {
				var oModel = this.getOwnerComponent().getModel();
				var aFilters = [];

				//Add filter by date (yesterday or today)
				aFilters.push(
					new Filter(
						"Date",
						FilterOperator.EQ,
						CommonUtils.convertDateToUTC(this.getView().getModel("localBinding").getProperty("/Date"))
					)
				);
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
