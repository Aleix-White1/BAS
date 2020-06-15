sap.ui.define(
	[
		"zdigitalticket/controller/BaseController",
		"zui5controlstmb/utils/Analytics",
		"zui5controlstmb/utils/CommonUtils",
		"sap/ui/model/Filter",
		"sap/ui/model/FilterOperator",
		"sap/m/MessageBox"
	],
	function (BaseController, Analytics, CommonUtils, Filter, FilterOperator, MessageBox) {
		"use strict";

		return BaseController.extend("zdigitalticket.controller.Clock", {
			/* =========================================================== */
			/* lifecycle methods                                           */
			/* =========================================================== */
			onInit: function() {
				var sFunctionName = "onInit";
				try {
					this._handleAnalyticsSendEvent(sFunctionName, Analytics.FUNCTION_TYPE.LIFECYCLE);
					BaseController.prototype.onInit.call(this);
					this.getRouter().getRoute("RouteClock").attachPatternMatched(this.onClockMatched, this);
				} catch (oError) {
					this._handleCatchException(oError, sFunctionName);
				}
			},
			
			/* =========================================================== */
			/* event handlers                       					   */
			/* =========================================================== */
			onPressConfirmActivity: function(oEvent){
				var that = this;
				var oView = this.getView();
				var oResourceBundle = oView.getModel("i18n").getResourceBundle();
				
				var date = oView.getModel("localBinding").getProperty("/Clock/Date");
				// var iMonth = ( date.getMonth() + 1 );
				// var sMonth = ( iMonth > 9 ) ? iMonth : "0" + iMonth;
				// var sDate =  date.getDate() + " / " + sMonth + " / " + date.getFullYear();
				var sDate =  date.getDate() + " " + oResourceBundle.getText("month." + date.getMonth()) + " " + oResourceBundle.getText("year.prefix") + " " + date.getFullYear();
				var sTitle = oResourceBundle.getText("Clock.title.confirmingActivity");
				var sMessage = oResourceBundle.getText("Clock.message.confirmActivity", [sDate]);
				
				MessageBox.show(
					sMessage, {
						icon: MessageBox.Icon.INFORMATION,
						title: sTitle,
						actions: [MessageBox.Action.YES, MessageBox.Action.NO],
						emphasizedAction: MessageBox.Action.YES,
						onClose: function(oAction) { 
							if(oAction === MessageBox.Action.YES){
								that.sendConfirmActivity();
							}
						}
					}
				);
			},
			
			sendConfirmActivity: function(oEvent){
				var that = this;
				var sFunctionName = "sendConfirmActivity";
				try {
					this._handleAnalyticsSendEvent(sFunctionName, Analytics.FUNCTION_TYPE.EVENT);
					this.sendHitEvent(sFunctionName, Analytics.FUNCTION_TYPE.EVENT);
					var oModelLocalBinding = this.getView().getModel("localBinding");
					var sEmpId = oModelLocalBinding.getProperty("/EmployeeId");	
					if(!sEmpId){
						sEmpId = sap.ushell.Container.getService("UserInfo").getId();
					}
					var oDate = oModelLocalBinding.getProperty("/Clock/Date");
					this.getView().getModel().callFunction("/SetActivityConfirmation", {
						method: "GET",
						urlParameters: {
							"EmployeeId": sEmpId,
							"Date": oDate
						},
						success: function (oResponse) {
							var sResponseMsg = oResponse.SetActivityConfirmation.res_message;
							var bIsConfirmed = oResponse.SetActivityConfirmation.is_confirmed;
							if(bIsConfirmed){
								that._changeBtnStatus(true);
							}
							if(sResponseMsg!=undefined && sResponseMsg.length>0){
								MessageBox.information(sResponseMsg);
							} 
						},
						error: function (oError) {
							var oView = that.getView();
							var sText = "";
							try{
								var objResponse = JSON.parse(oError.responseText);
								sText = objResponse.error.message.value;
							} catch(oErrInner){
								sText = oView.getModel("i18n").getResourceBundle().getText("Clock.button.errorConfirmingActivity");
							}
							that.showErrorMessageBox(sText);
						}
					});
				} catch (oError) {
					this._handleCatchException(oError, sFunctionName);
				}
			},
			
			onClockMatched: function(oEvent){
				var sFunctionName = "onClockMatched";
				var oView;
				var oModelLocalBinding;
				var fCallback = function() {
					setTimeout((function() {
						var aResults = oModelLocalBinding.getProperty("/Clock/ToActivities/results");

						if (Array.isArray(aResults) && aResults.length > 0) {
							oView.byId("activitiesTable").removeStyleClass("containerWithNoData");
							oView.byId("activitiesTable").setVisible(true);
						}
						
						oView.getParent().setVisible(true);
						this.handleBusy(false);
						oView.byId("headerData").removeStyleClass("containerWithNoData");
					}).bind(this), 0);
				};
				
				var fCallbackError = function() {
					oView.getController().onNavBack();	
				};

				try {
					this._handleAnalyticsSendEvent(sFunctionName, Analytics.FUNCTION_TYPE.EVENT);
					oView = this.getView();
					
					oView.byId("activitiesTable").addStyleClass("containerWithNoData");
					oView.byId("activitiesTable").setVisible(false);
					
					oView.byId("headerData").addStyleClass("containerWithNoData");
					//Inicializamos la propiedad raíz de la pantalla en el modelo localBinding.
					oModelLocalBinding = oView.getModel("localBinding");
					oModelLocalBinding.setProperty("/Clock", {
						Line: ""
					});
					this._getActivityTicketData(fCallback, fCallbackError);
				}
				catch (oError) {
					this._handleCatchException(oError, sFunctionName);
				}
			},

			/* =========================================================== */
			/* formatters and other public methods                         */
			/* =========================================================== */
			formtterConfirmActivity: function(oClock){
				var oView = this.getView();
				var oConfirmBtn = oView.byId("confirmActivityBtn");
				
				oConfirmBtn.setType(sap.m.ButtonType.Negative);
				var sText = oView.getModel("i18n").getResourceBundle().getText("Clock.button.confirmActivity");
				var isDriver = oView.getModel("appView").getProperty("/isDriver");
				oConfirmBtn.setEnabled(isDriver);
				
				var aActivity;
				try{
					aActivity = oClock.ToActivities.results;
				}catch(oError2){
					aActivity = [];
				}
				
				if(aActivity && aActivity.length>0 ){
					var bIsConfirmed = oClock.IsConfirmed;
					if(bIsConfirmed){
						sText = oView.getModel("i18n").getResourceBundle().getText("Clock.button.activityConfirmed");
						oConfirmBtn.setType(sap.m.ButtonType.Accept);
						oConfirmBtn.setEnabled(false);
					}
				}else{
					sText = oView.getModel("i18n").getResourceBundle().getText("Clock.button.activityNoData");	
					oConfirmBtn.setEnabled(false);
				}
				
				// var isAdmin = oView.getModel("appView").getProperty("/isAdmin");
				// if(isAdmin){
				// 	oConfirmBtn.setEnabled(false);
				// }
				
				return sText;
			},
			
			/* =========================================================== */
			/* private methods                                             */
			/* =========================================================== */
			//Función que ejecuta la llamada al oData para recuperar las actividades del empleado.
			_getActivityTicketData: function(fSuccessCallbackFnc, fErrorCallbackFnc) {
				var oModel = this.getView().getModel();
				var sEmployeeId;
				var sAssignationGroupId;
				var oModelLocalBinding;

				this.handleBusy(true);
				oModelLocalBinding = this.getView().getModel("localBinding");
				if (this.getView().getModel("appView").getProperty("/isAdmin")) {
					sEmployeeId = oModelLocalBinding.getProperty("/EmployeeId");
					sAssignationGroupId = oModelLocalBinding.getProperty("/AssignationGroupId");
				} else {
					sEmployeeId = sap.ushell.Container.getService("UserInfo").getId().substr(0, 10);
					sAssignationGroupId = "%20";
				}
				this.getView().byId("headerData").addStyleClass("containerWithNoData");
				oModel.read("/ActivityTicketSet(EmployeeId='" + sEmployeeId + "',AssignationGroupId='" + sAssignationGroupId + "')", {
					urlParameters: {
			        	"$expand": "ToActivities"
			    	},
	                success: (
	                	function(oData, response) {
	                		var oView;
		                	try {
		                		oView = this.getView();
		                		oView.getModel("localBinding").setProperty("/Clock", oData);
		                	} catch (oError) {
		                		oView.getModel("localBinding").setProperty("/PieceSet", {});
		                	}
		                	if (fSuccessCallbackFnc){
		                		fSuccessCallbackFnc.call(this);
		                	}
		                }).bind(this),
	                error: (
	                	function(oData) {
	                		var sText = "";
	                		var oView;
	
							try {
								oView = this.getView();
								oView.getModel("localBinding").setProperty("/PieceSet", {});
								sText = JSON.parse(oData.responseText).error.innererror.errordetails[0].message;
							}
							catch (oError) {
								sText = oView.getModel("i18n").getResourceBundle().getText("error.loading.data");
							}
							this.showErrorMessageBox(sText, undefined, fErrorCallbackFnc);
		                	// if (fErrorCallbackFnc){
		                	// 	fErrorCallbackFnc.call(this);
		                	// }
		                }).bind(this)
				});
			},

			_changeBtnStatus: function(bConfirm) {
				var sFunctionName = "_changeBtnStatus";
				var oView = this.getView();
				var sText, sType;
				var oConfirmBtn = oView.byId("confirmActivityBtn");
				try {
					if(bConfirm){
						sText = oView.getModel("i18n").getResourceBundle().getText("Clock.button.activityConfirmed");
					sType = "Accept";
						oConfirmBtn.setEnabled(false);
					}else{
						sText = oView.getModel("i18n").getResourceBundle().getText("Clock.button.confirmActivity");
						sType = "Negative";
					}
					oConfirmBtn.setText(sText);
					oConfirmBtn.setType(sType);
				} catch (oError) {
					this._handleCatchException(oError, sFunctionName);
				}
				return sText;
			},
			
			formatZone: function(sValue){
				return (sValue) ? this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("zone", sValue) : "";	
			},
			
			formatShift: function(sValue){
				return (sValue) ? this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("shift", sValue) : "";	
			}
				
		});
	}
);
