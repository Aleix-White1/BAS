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

			showErrorMessageBox: function(sText, pTitle, pFncOnClose){
				var sFunctionName = "showErrorMessageBox";
				var that = this;
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
									if(pFncOnClose){
										pFncOnClose.call(that);
									}
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
				} else {
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
					
					this._loadStationData(sLine, sStation, sTrain, oGetStopsCallbackFnc, oGetArrivalsCallbackFnc);

				} catch (oError) {
					this._handleCatchException(oError, sFunctionName);
				}
			},

			_loadStationData: function(sLine, sStation, sTrain, oGetStopsCallbackFnc, oGetArrivalsCallbackFnc){
				var sFunctionName = "_loadStationData";

				try {
					var oView = this.getView();
					var _sLine = sLine;
					var _sStation = sStation;
					var _oGetStopsCallbackFnc = oGetStopsCallbackFnc;
					var _oGetArrivalsCallbackFnc = oGetArrivalsCallbackFnc;
					var oMiralinModel = oView.getModel("miralinModel");
					
					var oLineData = oMiralinModel.getProperty("/stops/" + _sLine);
					if(!oLineData){
						//Si entramos en este punto es que no tenemos la información correspondiente a las paradas de la línea
						this.handleBusy(true);
						$.ajax({
							type: "GET",
							async: true,
							context: this,
							url: "/miralin?line=" + _sLine + "&service=stops",
							success: (function(that) {
								return function(result) {
				                    oMiralinModel.setProperty("/stops/" + _sLine, result.data.features);
				                    _oGetStopsCallbackFnc.call(this, _sLine, _sStation);
				                    that.handleBusy(false);
				                };
							})(this),
			                error: (function(that) {
								return function(result) {
									oMiralinModel.setProperty("/stops", {});
									var bCompact = oView.$().closest(".sapUiSizeCompact").length;
									MessageBox.error(
										"No se ha podido recuperar la información de las paradas",
										{
											styleClass: bCompact ? "sapUiSizeCompact" : ""
										}
									);
									that.handleBusy(false);
				                };
			                })(this)
						});
					}else{
						//En este caso, si que tenemos la información correspondiente a las paradas de la línea y solo hemos de actualizarla
						// that.updateStationDataInLocalBindingModel(_sLine, _sStation);
						_oGetStopsCallbackFnc.call(this, _sLine, _sStation);
					}
					
					this.handleBusy(true);
					$.ajax({
						type: "GET",
						async: true,
						url: "/miralin?line=" + sLine + "&station=" + sStation + "&service=arrivals",
						context: this,
						success: (function(that) {
							return function(result) {
			                    oMiralinModel.setProperty("/arrivals", result.data.arrivals);
								_oGetArrivalsCallbackFnc.call(this);
								that.handleBusy(false);
			                };
						})(this),
		                error: (function(that) {
		                	return function(result) {
			                	oMiralinModel.setProperty("/arrivals", {});
								var bCompact = oView.$().closest(".sapUiSizeCompact").length;
								MessageBox.error(
									"No se ha podido recuperar la informacion de las llegadas",
									{
										styleClass: bCompact ? "sapUiSizeCompact" : ""
									}
								);
								that.handleBusy(false);
			                };
		                })(this)
					});
				} catch (oError) {
					this._handleCatchException(oError, sFunctionName);
				}
			},

			_getTicketData: function(fSuccessCallbackFnc, fErrorCallbackFnc) {
				var oModel = this.getView().getModel();
				var sEmployeeId;
				var sAssignationGroupId;
				var oModelLocalBinding;

				this.handleBusy(true);
				oModelLocalBinding = this.getView().getModel("localBinding");
				if (this.getView().getModel("appView").getProperty("/isAdmin")) {
					sEmployeeId = oModelLocalBinding.getProperty("/EmployeeId");
					sAssignationGroupId = oModelLocalBinding.getProperty("/AssignationGroupId");
				}
				else {
					sEmployeeId = sap.ushell.Container.getService("UserInfo").getId().substr(0, 10);
					sAssignationGroupId = "%20";
				}
				oModel.read("/TicketSet(EmployeeId='" + sEmployeeId + "',AssignationGroupId='" + sAssignationGroupId + "',Today=" + oModelLocalBinding.getProperty("/today") + ")", {
					urlParameters: {
			        	"$expand": "ToPieces"
			    	},
	                success: (
	                	function(oData, response) {
	                		var oView;
	                		var oDate;
	
		                	try {
		                		oView = this.getView();
		                		oView.getModel("localBinding").setProperty("/ServiceId", oData.ServiceId);
		                		oView.getModel("localBinding").setProperty("/EmployeeId", oData.EmployeeId);
		                		oView.getModel("localBinding").setProperty("/EmployeeName", oData.EmployeeName);
		                		oView.getModel("localBinding").setProperty("/Line", oData.Line);
								oView.getModel("localBinding").setProperty("/Shift", oData.ShiftNumber);
								oView.getModel("localBinding").setProperty("/Zone", oData.ZoneId);
								oDate = this._convertDateFromUTC(oData.Date);
								oView.getModel("localBinding").setProperty("/Date", oDate);
								oView.getModel("localBinding").setProperty("/PieceSet", {}); //If we set property "/PieceSet" without clearing it before, previous and new data are mixed
		                		oView.getModel("localBinding").setProperty("/PieceSet", oData.ToPieces.results);
		                	}
		                	catch (oError) {
		                		oView.getModel("localBinding").setProperty("/PieceSet", {});
		                	}
		                	if (fSuccessCallbackFnc){
		                		fSuccessCallbackFnc.call(this);
		                	}
							this.handleBusy(false);
		                }
		            ).bind(this),
	                error: (
	                	function(oData) {
	                		var sText = "";
	                		var oView;
	
							try {
								oView = this.getView();
								oView.getModel("localBinding").setProperty("/PieceSet", {});
								sText = JSON.parse(oData.responseText).error.message.value;
							}
							catch (oError) {
								sText = oView.getModel("i18n").getResourceBundle().getText("error.loading.data");
							}
							this.showErrorMessageBox(sText);
		                	if (fErrorCallbackFnc){
		                		fErrorCallbackFnc.call(this);
		                	}
							this.handleBusy(false);
		                }
		            ).bind(this)
				});
			},

			_convertDateFromUTC: function(oDate) {
				return new Date(oDate.getFullYear(), oDate.getMonth(), oDate.getDate());
			}
		});
	}
);
