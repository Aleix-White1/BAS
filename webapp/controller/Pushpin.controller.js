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
			onPushpinMatched: function (oEvent) {
				var oView = this.getView(); 

				oView.setModel(new JSONModel({
					ServiceId: "AAM15232",
					EmployeeId: "07196",
					EmployeeName: "RIVERA RIOS",
					Line: "Línea 5-C",
					Shift: "1",
					Date: "Dimarts 21 de maig de 2019",
					PieceList: [{
						hi: "05:00",
						ei: "509",
						vi: "",
						te: "",
						hf: "05:11",
						ef: "509",
						vf: ""
					}, {
						hi: "05:11",
						ei: "509",
						vi: "SAL",
						te: "7",
						hf: "06:35",
						ef: "515",
						vf: "2"
					}, {
						hi: "06:35",
						ei: "515",
						vi: "",
						te: "TRA",
						hf: "06:49",
						ef: "517",
						vf: ""
					}, {
						hi: "06:49",
						ei: "517",
						vi: "",
						te: "",
						hf: "07:10",
						ef: "517",
						vf: ""
					}, {
						hi: "07:10",
						ei: "517",
						vi: "2",
						te: "20",
						hf: "08:40",
						ef: "517",
						vf: "2"
					}, {
						hi: "08:40",
						ei: "517",
						vi: "",
						te: "TRA",
						hf: "08:53",
						ef: "509",
						vf: ""
					}, {
						hi: "08:53",
						ei: "509",
						vi: "",
						te: "",
						hf: "09:30",
						ef: "509",
						vf: ""
					}, {
						hi: "09:30",
						ei: "509",
						vi: "",
						te: "C2",
						hf: "10:30",
						ef: "509",
						vf: ""
					}, {
						hi: "10:30",
						ei: "509",
						vi: "",
						te: "TRA",
						hf: "10:34",
						ef: "509",
						vf: ""
					}, {
						hi: "10:34",
						ei: "509",
						vi: "",
						te: "",
						hf: "12:10",
						ef: "509",
						vf: ""
					}]
				}), "localBinding");
				//TODO: Si l'usuari no és admin, s'hauria de començar a descarregar el famós pdf
			}
		});
	}
);
