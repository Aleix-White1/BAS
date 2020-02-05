sap.ui.define(
	[
		"zdigitalticket/controller/BaseController",
		"zui5controlstmb/utils/Analytics",
		"sap/ui/core/format/DateFormat",
		"sap/m/MessageBox"
	],
	function (BaseController, Analytics, DateFormat, MessageBox) {
		"use strict";
	
		return BaseController.extend("zdigitalticket.controller.StationInfo", {
			
			/* =========================================================== */
			/* lifecycle methods                                           */
			/* =========================================================== */
			onInit: function() {
				var sFunctionName = "onInit";
				try {
					this._handleAnalyticsSendEvent(sFunctionName, Analytics.FUNCTION_TYPE.LIFECYCLE);
					BaseController.prototype.onInit.call(this);
					this.getRouter().getRoute("RouteStationInfo").attachPatternMatched(this.onStationInfoMatched, this);
				} catch (oError) {
					this._handleCatchException(oError, sFunctionName);
				}
			},

			/* =========================================================== */
			/* event handlers                       					   */
			/* =========================================================== */
			onChangeTrack: function(oEvent){
				var sFunctionName = "onChangeTrack";
				try {
					var oView = this.getView();
					var oModelLocalBinding = oView.getModel("localBinding");
					var sTrackNumber = oModelLocalBinding.getProperty("/StationInfo/selectedTrack");
					this.loadTrainsPositions(sTrackNumber);
				} catch (oError) {
					this._handleCatchException(oError, sFunctionName);
				}
			},
			
			loadTrainsPositions: function(sTrackNumer){
				var sFunctionName = "loadTrainsPositions";
				try {
					var oView = this.getView();
					var oModelMiralin = oView.getModel("miralinModel");	
					var oModelLocalBinding = oView.getModel("localBinding");
					var sPath = "/arrivals/tracks/" + ( sTrackNumer - 1 ) + "/trainsPositions"; //VMC: ESTO ES IMPORTANTE REVISARLO!!!!!
					var aTrainPosition = oModelMiralin.getProperty(sPath);
					oModelLocalBinding.setProperty("/StationInfo/StationInfoTrainSet", aTrainPosition);
				} catch (oError) {
					this._handleCatchException(oError, sFunctionName);
				}
			},
			
			loadStationTracks: function(){
				var sFunctionName = "loadStationTracks";
				try {
					var aTracksTmp = [];
					var oView = this.getView();
					var	oResourceBundle = oView.getModel("i18n").getResourceBundle();
					var oModelLocalBinding = oView.getModel("localBinding");
					var oModelMiralin = oView.getModel("miralinModel");	
					var aTracks = oModelMiralin.getProperty("/arrivals/tracks");
					aTracks.forEach(function(oItem){
						var oTrack = {
							"trackNum": oItem.track,
							"trackName": oResourceBundle.getText("stationInfo.trackNumber", [oItem.track])
						};
						aTracksTmp.push(oTrack);
					});
					if(aTracksTmp.length > 0){
						oModelLocalBinding.setProperty("/StationInfo/selectedTrack", aTracksTmp[0].trackNum);
						var oSelect = oView.byId("selectTrackCombo");
						oSelect.fireEvent("change");
					}
					oModelLocalBinding.setProperty("/StationInfo/lines", aTracksTmp);	
				} catch (oError) {
					this._handleCatchException(oError, sFunctionName);
				}
			},
			
			updateStationDataInLocalBindingModel: function(sLine, sStation){
				var sFunctionName = "updateStationDataInLocalBindingModel";
				try {
					var oView = this.getView();
					var _sStation = sStation;
					
					var oMiralinModel = oView.getModel("miralinModel");					
					var oModelLocalBinding = oView.getModel("localBinding"); 
					
					var aStops = oMiralinModel.getProperty("/stops/" + sLine);
					if(aStops){
						aStops.forEach(function(oItem){ 
							var oProperties = oItem.properties;
							if(oProperties["CODI_ESTACIO"] == _sStation){
								oModelLocalBinding.setProperty("/StationInfo/Name", oProperties["NOM_ESTACIO"]);
								return false;
							}
						});
					}
					oModelLocalBinding.setProperty("/StationInfo/Date", new Date());
					oModelLocalBinding.setProperty("/StationInfo/Line", sLine);
					oModelLocalBinding.setProperty("/StationInfo/CurrTime", this.formatTime());
					
				} catch (oError) {
					this._handleCatchException(oError, sFunctionName);
				}
			},
			
			// loadStationData: function(sLine, sStation){
			// 	var sFunctionName = "loadStationData";
			// 	try {
			// 		var that = this; 
			// 		var oView = this.getView();
			// 		var _sLine = sLine;
			// 		var _sStation = sStation;
			// 		var oMiralinModel = oView.getModel("miralinModel");
					
			// 		var oLineData = oMiralinModel.getProperty("/stops/" + _sLine);
			// 		if(!oLineData){
			// 			//Si entramos en este punto es que no tenemos la información correspondiente a las paradas de la línea
			// 			$.ajax({
			// 				type: "GET",
			// 				async: true,
			// 				url: "/miralin?line=" + _sLine + "&service=stops",
			// 				success: function(result) {
			//                     oMiralinModel.setProperty("/stops/" + _sLine, result.data.features);
			//                     that.updateStationDataInLocalBindingModel(_sLine, _sStation);
			//                 },
			//                 error: function(result) {
			// 					oMiralinModel.setProperty("/stops", {});
			// 					var bCompact = oView.$().closest(".sapUiSizeCompact").length;
			// 					MessageBox.error(
			// 						"No se ha podido recuperar la información de las paradas",
			// 						{
			// 							styleClass: bCompact ? "sapUiSizeCompact" : ""
			// 						}
			// 					);
								
			//                 }
			// 			});
			// 		}else{
			// 			//En este caso, si que tenemos la información correspondiente a las paradas de la línea y solo hemos de actualizarla
			// 			that.updateStationDataInLocalBindingModel(_sLine, _sStation);
			// 		}
					
					
			// 		$.ajax({
			// 			type: "GET",
			// 			async: true,
			// 			url: "/miralin?line=" + sLine + "&station=" + sStation + "&service=arrivals",
			// 			success: function(result) {
		 //                   oMiralinModel.setProperty("/arrivals", result.data.arrivals);
			// 				that.loadStationTracks();	
		 //               },
		 //               error: function(result) {
		 //               	oMiralinModel.setProperty("/arrivals", {});
			// 				var bCompact = oView.$().closest(".sapUiSizeCompact").length;
			// 				MessageBox.error(
			// 					"No se ha podido recuperar la informacion de las llegadas",
			// 					{
			// 						styleClass: bCompact ? "sapUiSizeCompact" : ""
			// 					}
			// 				);
							
		 //               }
			// 		});
			// 	} catch (oError) {
			// 		this._handleCatchException(oError, sFunctionName);
			// 	}
			// },
			
			loadCurrDateAndTime: function(oEvent){
				var sFunctionName = "loadCurrDateAndTime";
				try {
					var oView = this.getView();
					var oModelLocalBinding = oView.getModel("localBinding"); 
					var oCurrDate = new Date();
					//La fecha se formatea en la configuración del campo en la StationInfo.view.xml
					oModelLocalBinding.setProperty("/StationInfo/Date", oCurrDate); 
					var sHours = oCurrDate.getHours();
					var sMinutes = oCurrDate.getMinutes();
					//Para evitar hacer uso de un formatter, extraemos la hora y los minutos para setearlos en la propiedad
					var iHours   = parseInt(sHours, 10);
				    var iMinutes = parseInt(sMinutes, 10);
				    if (iHours   < 10) { iHours   = "0" + iHours; }
				    if (iMinutes < 10) { iMinutes = "0" + iMinutes; }
					oModelLocalBinding.setProperty( "/StationInfo/CurrTime", iHours + ":" + iMinutes ); 
				} catch (oError) {
					this._handleCatchException(oError, sFunctionName);
				}
			},
			
			onStationInfoMatched: function(oEvent){
				var sFunctionName = "onStationInfoMatched";
				var oView = this.getView();
				var oModelLocalBinding = oView.getModel("localBinding");
				// var oMiralinModel = oView.getModel("miralinModel");
				var oArguments, sLine, sTation;
				try {
					this._handleAnalyticsSendEvent(sFunctionName, Analytics.FUNCTION_TYPE.EVENT);
					oView = this.getView();
					oModelLocalBinding = oView.getModel("localBinding");
					oModelLocalBinding.setProperty("/StationInfo", {});
					
					// if(!oMiralinModel.getProperty("/stops")){
					// 	oMiralinModel.setProperty("/stops", {});
					// }
					
					oArguments = oEvent.getParameter("arguments");
					if (oArguments.Line) {
						sLine = oArguments.Line;
						oModelLocalBinding.setProperty("/StationInfo/Line", sLine);
					}
					if (oArguments.Station) {
						sTation = oArguments.Station;
						oModelLocalBinding.setProperty("/StationInfo/Station", sTation);
					}
					// this.loadStationData(sLine, sTation);
					
					this.getMiralinInfo(
						sLine,
						sTation,
						undefined,
						this.updateStationDataInLocalBindingModel,
						this.loadStationTracks
					);
					
					this.loadCurrDateAndTime();
				} catch (oError) {
					this._handleCatchException(oError, sFunctionName);
				}
			},
			
			/* =========================================================== */
			/* formatters and other public methods                         */
			/* =========================================================== */
			formatTime: function(sTime){
				var sFunctionName = "formatTime";
				var dateFormatted;
				try {
					var dateObject;
					if(sTime){
						dateObject = new Date(sTime);
					}else{
						dateObject = new Date();
					}
					var dateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({pattern : "HH:mm" }); // SAPUI5 date formatter
					dateFormatted = dateFormat.format(dateObject); // Format the date
				} catch (oError) {
					this._handleCatchException(oError, sFunctionName);
				}
				return dateFormatted;
			},
			
			formatDAntTime: function(sTime){
				var sFunctionName = "formatDAntTime";
				var sDAntFormated;
				try {
				    var iSecNnum = parseInt(sTime, 10); // don't forget the second param
				    var iHours   = Math.floor(iSecNnum / 3600);
				    var iMinutes = Math.floor((iSecNnum - (iHours * 3600)) / 60);
				    var iSeconds = iSecNnum - (iHours * 3600) - (iMinutes * 60);
				
				    if (iHours   < 10) { iHours   = "0" + iHours; }
				    if (iMinutes < 10) { iMinutes = "0" + iMinutes; }
				    if (iSeconds < 10) { iSeconds = "0" + iSeconds; }
				    
				    // return hours+':'+minutes+':'+iSeconds;
				    sDAntFormated = iMinutes + ":" + iSeconds;
				} catch (oError) {
					this._handleCatchException(oError, sFunctionName);
				}
				return sDAntFormated;
			}
			
			/* =========================================================== */
			/* formatters and other public methods                         */
			/* =========================================================== */
		});
	}
);
