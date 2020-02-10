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
					ServiceId: "",
					EmployeeId: "",
					EmployeeName: "",
					Line: "",
					Shift: "",
					Zone: "",
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
				var oModel = this.getView().getModel();
				var aFilters = [];
				var sDateTime;

//TODO: Suprimeix aquest hack de les dades
this.getView().getModel("localBinding").setProperty("/Date", new Date("2018/05/29"));
//fTODO
				sDateTime = CommonUtils.convertDateToUTC(this.getView().getModel("localBinding").getProperty("/Date")).toISOString();
				sDateTime = sDateTime.replace("Z", "").replace(/\x3A/g, "%3A");
				this.handleBusy(true);
				oModel.read("/TicketSet(EmployeeId='02010351',Date=datetime'" + sDateTime + "')", {
					urlParameters: {
			        	"$expand": "ToPieces"
			    	},
	                success: (function(that) {
	                	var oView;

	                	return function(oData, response) {
		                	try {
		                		oView = that.getView();
		                		oView.getModel("localBinding").setProperty("/ServiceId", oData.ServiceId);
		                		oView.getModel("localBinding").setProperty("/EmployeeId", oData.EmployeeId);
		                		oView.getModel("localBinding").setProperty("/EmployeeName", oData.EmployeeName);
		                		oView.getModel("localBinding").setProperty("/Line", oData.Line.replace("L", ""));  //TODO: Caldria treure a SAP aquesta L
								oView.getModel("localBinding").setProperty("/Shift", oData.ShiftNumber);
								oView.getModel("localBinding").setProperty("/Zone", oData.ZoneId);
		                		oView.getModel("localBinding").setProperty("/PieceSet", oData.ToPieces.results);
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
								sText = oView.getModel("i18n").getResourceBundle().getText("error.loading.data");
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
