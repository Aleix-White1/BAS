sap.ui.define(
	[
		"zdigitalticket/controller/BaseController",
		"zui5controlstmb/utils/Analytics",
		"sap/ui/model/json/JSONModel"
	],
	function (BaseController, Analytics, JSONModel) {
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
					Date: this._formatDate(new Date())
				}), "localBinding");
				this._updateTableData();
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
				oModel.setProperty("/Date", this._formatDate(oDate));
				this._updateTableData();
			},

			/* =========================================================== */
			/* formatters and other public methods                          */
			/* =========================================================== */

			/* =========================================================== */
			/* private methods                                             */
			/* =========================================================== */
			_updateTableData: function() {
				var aFilters = [];

				if (this.getView().getModel("localBinding").getProperty("/today")) {
					//Today
debugger;
				}
				else {
					//Yesterday
debugger;
				}
				//Afegir filtre par data (ahir, avuir)
				/* aFilters.push(
					new Filter(
						"ServiceGuid",
						FilterOperator.EQ,
						this.getView().byId("piece").getBindingContext().getProperty("ServiceGuid")
					)
				);*/
				this.getView().byId("dataTable").getBinding("items").filter(aFilters);
			},
			_formatDate: function(date) {
				var oTranslator = this.getView().getModel("i18n").getResourceBundle();

				return oTranslator.getText("week.day." + date.getDay()) + " " + date.getDate() + " " + oTranslator.getText("month." + date.getMonth()) + " " + oTranslator.getText("year.prefix") + " " + date.getFullYear();
				//return "Dimarts 21 de maig de 2019";
			}
		});
	}
);
