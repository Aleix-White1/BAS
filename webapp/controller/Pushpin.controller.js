sap.ui.define(
	[
		"zdigitalticket/controller/BaseController",
		"zui5controlstmb/utils/Analytics",
		"sap/ui/model/json/JSONModel",
		"sap/ui/model/Filter",
		"zui5controlstmb/utils/CommonUtils",
		"sap/ui/model/FilterOperator",
		"sap/m/MessageBox",
		"sap/ui/core/util/File"
	],
	function (BaseController, Analytics, JSONModel, Filter, CommonUtils, FilterOperator, MessageBox, File) {
		"use strict";
		/* global LocalFileSystem */
		/* global device */

/*
		//VMC: Posible solución pero parece que funciona mejor le PDFViewer.donwloadPDF();
		var _downloadFile = function(sUrl) {
			var oAjaxRequest = new XMLHttpRequest();

			oAjaxRequest.open("GET", sUrl, true);
			oAjaxRequest.responseType = "blob";
			oAjaxRequest.onload = function (e) {
				var sFileName = "Ticket_AAC";
				var sFileContent = oAjaxRequest.response;
				var sFileType = "pdf";
				var sMime = "application/pdf"; 
				File.save(sFileContent, sFileName, sFileType, sMime, null);
			};
			oAjaxRequest.send();
		};
*/

		var _downloadFile = function(sUrl, fOnSuccess, fOnError, oScope) {
			var oAjaxRequest = new XMLHttpRequest();

			oAjaxRequest.open("GET", sUrl, true);
			oAjaxRequest.responseType = "blob";
			oAjaxRequest.onload = function (e) {
				window.requestFileSystem(
					LocalFileSystem.PERSISTENT,
					0,
					function() {
						var sPath;
						
						if (typeof device !== "undefined" && device.platform && device.platform.toLowerCase() === "ios") {
							sPath = cordova.file.documentsDirectory;
						}
						else {
							sPath = cordova.file.externalDataDirectory;
						}
						window.resolveLocalFileSystemURL(
							sPath,
							function(oFolder) {
								var sFileName = "Ticket_AAC.pdf";

								oFolder.getFile(
									sFileName, {
										create: true,
										exclusive: false
									},
									function(oFile) {
										oFile.createWriter(
											function(oFileWriter) {
												oFileWriter.onwriteend = function(oInfo) {
													if (typeof fOnSuccess === "function") {
														fOnSuccess.call(oScope, sFileName);
													}
												};
												oFileWriter.onerror = function(oError) {
													if (typeof fOnError === "function") {
														fOnError.call(oScope, oError);
													}
												};
												oFileWriter.write(oAjaxRequest.response);
											},
											function(oError) {
												if (typeof fOnError === "function") {
													fOnError.call(oScope, oError);
												}
											}
										);
									},
									function(oError) {
										if (typeof fOnError === "function") {
											fOnError.call(oScope, oError);
										}
									}
								);
							},
							function(oError) {
								if (typeof fOnError === "function") {
									fOnError.call(oScope, oError);
								}
							}
						);
					},
					function(oError) {
						if (typeof fOnError === "function") {
							fOnError.call(oScope, oError);
						}
					}
				);
			};
			oAjaxRequest.send();
		};

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
				var sFunctionName = "onPushpinMatched";
				var oView;
				var oModelLocalBinding;

				try {
					this._handleAnalyticsSendEvent(sFunctionName, Analytics.FUNCTION_TYPE.EVENT);
					oView = this.getView();
					oModelLocalBinding = oView.getModel("localBinding");
					oModelLocalBinding.setProperty("/", {
						today: oModelLocalBinding.getProperty("/today"), //This was set by App.controller
						ServiceId: "",
						EmployeeId: oModelLocalBinding.getProperty("/EmployeeId"), //This was set by App.controller
						AssignationGroupId: oModelLocalBinding.getProperty("/AssignationGroupId"), //This was set by App.controller
						EmployeeName: "",
						Line: " ",
						Shift: "",
						Zone: "",
						Date: "",
						downloadable: false
					});
					oView.byId("dataTable").addStyleClass("tableWithNoData");
					oView.byId("headerData").addStyleClass("containerWithNoData");
					oView.byId("viewDescription").addStyleClass("containerWithNoData");
					oView.byId("employeeId").addStyleClass("containerWithNoData");
					this._getTicketData(
						function() {
							if (oView.getModel("appView").getProperty("/isDriver")) {
								oView.getModel().callFunction("/SetTicketAsRead", {
									method: "GET",
									urlParameters: {
									},
									success: this._showTable.bind(this),
									error: this._showTable.bind(this)
								});
							}
							else {
								this._showTable();
							}
						},
						this._showTable
					);
				}
				catch (oError) {
					this._handleCatchException(oError, sFunctionName);
				}
			},

			onChangeDay: function(oEvent) {
				var sFunctionName = "onChangeDay";
				var oView;
				var oModel;

				try {
					this._handleAnalyticsSendEvent(sFunctionName, Analytics.FUNCTION_TYPE.EVENT);
					oView = this.getView();
					oModel = oView.getModel("localBinding");
					oModel.setProperty("/today", !oModel.getProperty("/today"));
					this._hideTable();
					this._getTicketData(this._showTable, this._showTable);
				}
				catch (oError) {
					this._handleCatchException(oError, sFunctionName);
				}
			},

			onDownloadTicket: function(oEvent) {
				var sFunctionName = "onDownloadTicket";
				var sUrl;

				try {
					this._handleAnalyticsSendEvent(sFunctionName, Analytics.FUNCTION_TYPE.EVENT);
					if (this.getView().getModel("appView").getProperty("/isDriver")) {
						sUrl = this.getOwnerComponent().getModel().sServiceUrl + "/TicketSet(EmployeeId='',AssignationGroupId='%20',Today=true)/$value";
						if (window.requestFileSystem) {
							//We are running inside the app
							_downloadFile(
								sUrl,
								function(sFileName) {
									var oResourceBundle = this.getView().getModel("i18n").getResourceBundle();

									MessageBox.show(
										oResourceBundle.getText("info.pdf.descarregat", [sFileName]), {
											title: oResourceBundle.getText("info.title"),
											styleClass: this.getOwnerComponent().getContentDensityClass(),
											actions: [MessageBox.Action.CLOSE]
										}
									);
								},
								undefined,
								this
							);
						}
						else {
							//We are running in a browser
							sap.m.URLHelper.redirect(
								sUrl,
								true
							);
						}
					}
				}
				catch (oError) {
					this._handleCatchException(oError, sFunctionName);
				}
			},

			onStartStationClicked: function(oEvent) {
				var sFunctionName = "onStartStationClicked";
				var oModelLocalBinding;
				var oTrainInfo;

				try {
					this._handleAnalyticsSendEvent(sFunctionName, Analytics.FUNCTION_TYPE.EVENT);
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

				try {
					this._handleAnalyticsSendEvent(sFunctionName, Analytics.FUNCTION_TYPE.EVENT);
					oModelLocalBinding = this.getView().getModel("localBinding");
					oTrainInfo = oModelLocalBinding.getProperty(oEvent.getSource().getParent().getParent().getBindingContextPath());
					
					var sLine = oModelLocalBinding.getProperty("/Line");
					var sStation = oTrainInfo.StartStation;
					var sTrain = oTrainInfo.TrainStation;
					var sTrack = oTrainInfo.StartTrack;
					
					if( sTrack == undefined || sTrack.length == 0){
						sTrack = "-";
					}  
					
					var oParams = {
						"Line": sLine,
						"Station": sStation,
						"Train": sTrain,
						"Track": sTrack
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
			_hideTable: function() {
				var sFunctionName = "_hideTable";
				var oView;
				var oModel;

				try {
					this._handleAnalyticsSendEvent(sFunctionName, Analytics.FUNCTION_TYPE.OTHER);
					oView = this.getView();
					oView.byId("dataTable").addStyleClass("tableWithNoData");
					oModel = oView.getModel("localBinding");
					oModel.setProperty("/downloadable", false);
					oModel.setProperty("/Date", "");
					oModel.setProperty("/ServiceId", "");
				}
				catch (oError) {
					this._handleCatchException(oError, sFunctionName);
				}
			},

			_showTable: function() {
				setTimeout((function() {
					var sFunctionName = "_showTable";
					var oView;
					var oModel;
	
					try {
						this._handleAnalyticsSendEvent(sFunctionName, Analytics.FUNCTION_TYPE.OTHER);
						oModel = (oView = this.getView()).getModel("localBinding");
						oView.getParent().setVisible(true);
						oView.byId("dataTable").removeStyleClass("tableWithNoData");
						oView.byId("headerData").removeStyleClass("containerWithNoData");
						oView.byId("viewDescription").removeStyleClass("containerWithNoData");
						oView.byId("employeeId").removeStyleClass("containerWithNoData");
						oModel.setProperty("/downloadable", oModel.getProperty("/today") && oView.getModel("appView").getProperty("/isDriver") && oModel.getProperty("/PieceSet").length > 0);
					}
					catch (oError) {
						this._handleCatchException(oError, sFunctionName);
					}
				}).bind(this), 0);
			}
		});
	}
);
