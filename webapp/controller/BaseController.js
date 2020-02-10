sap.ui.define(
	[
		"zui5controlstmb/controller/BaseController",
		"zui5controlstmb/utils/Analytics",
		"sap/m/MessageBox",
		"zui5controlstmb/utils/CommonUtils"
	],
	function (BaseController, Analytics, MessageBox, CommonUtils) {
		"use strict";

		return BaseController.extend("zdigitalticket.controller.BaseController", {
			/* =========================================================== */
			/* lifecycle methods                                           */
			/* =========================================================== */

			/* =========================================================== */
			/* event handlers for all app                                  */
			/* =========================================================== */

			/* ============================================================ */
			/* formatters and other public methods                          */
			/* ============================================================ */
			handleBusy: function(bShowBusy) {
				var oAppViewModel = this.getView().getModel("appView");
				var iBusyCounter = parseInt(oAppViewModel.getProperty("/busyCounter"), 10);

				if (bShowBusy) {
					oAppViewModel.setProperty("/busyCounter", ++iBusyCounter);
					oAppViewModel.setProperty("/busy", true);
				}
				else {
					oAppViewModel.setProperty("/busyCounter", --iBusyCounter);
					if (iBusyCounter <= 0) {
						oAppViewModel.setProperty("/busy", false);
						oAppViewModel.setProperty("/busyCounter", 0);
					}
				}
			},

			getRouter: function() {
				var sFunctionName = "getRouter";

				try {
					this._handleAnalyticsSendEvent(sFunctionName, Analytics.FUNCTION_TYPE.OTHER);
					return sap.ui.core.UIComponent.getRouterFor(this);
				}
				catch (oError) {
					this._handleCatchException(oError, sFunctionName);
				}
				return undefined;
			},

			showErrorMessageBox: function(sText, pTitle){
				var sFunctionName = "showErrorMessageBox";

				try {
					this._handleAnalyticsSendEvent(sFunctionName, Analytics.FUNCTION_TYPE.OTHER);
					var oView = this.getView();
					var oModelLocalBinding = oView.getModel("localBinding");
					var oResourceBundle = oView.getModel("i18n").getResourceBundle();
					if (oModelLocalBinding.getProperty("/errorMessage") === undefined) {
						oModelLocalBinding.setProperty("/errorMessage", sText);
						var sTitle = pTitle;
						if (sTitle === undefined){
							sTitle = oResourceBundle.getText("error.title");
						}
						MessageBox.show(
							sText, {
								title: sTitle,
								styleClass: this.getOwnerComponent().getContentDensityClass(),
								actions: [MessageBox.Action.CLOSE],
								onClose: function(oAction) { 
									oModelLocalBinding.setProperty("/errorMessage", undefined);
								}
							}
						);
					}
				}
				catch (oError) {
					this._handleCatchException(oError, sFunctionName);
				}	
			},
			
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
			
			getMiralinInfo: function(sLine, sStation, sTrain, oGetStopsCallbackFnc, oGetArrivalsCallbackFnc){
				var sFunctionName = "onDailyActivityMatched";
				var oView = this.getView();
				// var oModelLocalBinding = oView.getModel("localBinding");
				var oMiralinModel = oView.getModel("miralinModel");
				try {
					this._handleAnalyticsSendEvent(sFunctionName, Analytics.FUNCTION_TYPE.EVENT);
					oView = this.getView();
					// oModelLocalBinding = oView.getModel("localBinding");
					// oModelLocalBinding.setProperty("/StationInfo", {});
					
					if(!oMiralinModel.getProperty("/stops")){
						oMiralinModel.setProperty("/stops", {});
					}
					
					this.loadStationData(sLine, sStation, sTrain, oGetStopsCallbackFnc, oGetArrivalsCallbackFnc);

				} catch (oError) {
					this._handleCatchException(oError, sFunctionName);
				}
			},
			
			loadStationData: function(sLine, sStation, sTrain, oGetStopsCallbackFnc, oGetArrivalsCallbackFnc){
				var sFunctionName = "loadStationData";
				try {
					var that = this; 
					var oView = this.getView();
					var _sLine = sLine;
					var _sStation = sStation;
					var _oGetStopsCallbackFnc = oGetStopsCallbackFnc;
					var _oGetArrivalsCallbackFnc = oGetArrivalsCallbackFnc;
					var oMiralinModel = oView.getModel("miralinModel");
					
					var oLineData = oMiralinModel.getProperty("/stops/" + _sLine);
					if(!oLineData){
						//Si entramos en este punto es que no tenemos la información correspondiente a las paradas de la línea
						$.ajax({
							type: "GET",
							async: true,
							context: this,
							url: "/miralin?line=" + _sLine + "&service=stops",
							success: function(result) {
			                    oMiralinModel.setProperty("/stops/" + _sLine, result.data.features);
			                    _oGetStopsCallbackFnc.call(this, _sLine, _sStation);
			                },
			                error: function(result) {
								oMiralinModel.setProperty("/stops", {});
								var bCompact = oView.$().closest(".sapUiSizeCompact").length;
								MessageBox.error(
									"No se ha podido recuperar la información de las paradas",
									{
										styleClass: bCompact ? "sapUiSizeCompact" : ""
									}
								);
								
			                }
						});
					}else{
						//En este caso, si que tenemos la información correspondiente a las paradas de la línea y solo hemos de actualizarla
						// that.updateStationDataInLocalBindingModel(_sLine, _sStation);
						_oGetStopsCallbackFnc.call(this, _sLine, _sStation);
					}
					
					
					$.ajax({
						type: "GET",
						async: true,
						url: "/miralin?line=" + sLine + "&station=" + sStation + "&service=arrivals",
						context: this,
						success: function(result) {
		                    oMiralinModel.setProperty("/arrivals", result.data.arrivals);
							_oGetArrivalsCallbackFnc.call(this);
		                },
		                error: function(result) {
		                	oMiralinModel.setProperty("/arrivals", {});
							var bCompact = oView.$().closest(".sapUiSizeCompact").length;
							MessageBox.error(
								"No se ha podido recuperar la informacion de las llegadas",
								{
									styleClass: bCompact ? "sapUiSizeCompact" : ""
								}
							);
							
		                }
					});
				} catch (oError) {
					this._handleCatchException(oError, sFunctionName);
				}
			},
			
			_getTicketDataData: function(oSuccessCallbackFnc) {
				var oModel = this.getView().getModel();
				var sDateTime;
				var _oSuccessCallbackFnc = oSuccessCallbackFnc;
//TODO: Suprimeix aquest hack de les dades
this.getView().getModel("localBinding").setProperty("/Date", new Date("2018/05/29"));
//fTODO
				sDateTime = CommonUtils.convertDateToUTC(this.getView().getModel("localBinding").getProperty("/Date")).toISOString();
				sDateTime = sDateTime.replace("Z", "").replace(/\x3A/g, "%3A");
				this.handleBusy(true);
//TODO: Quan NO sóc un usuari, aquí podria enviar un DE00052 (sap.ushell.Container.getService("UserInfo").getId())
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
		                	if(_oSuccessCallbackFnc){
		                		_oSuccessCallbackFnc.call(that);
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
