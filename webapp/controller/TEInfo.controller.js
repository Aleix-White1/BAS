sap.ui.define(
	[
		"zdigitalticket/controller/BaseController",
		"zui5controlstmb/utils/Analytics"
	],
	function (BaseController, Analytics) {
		"use strict";
	
		return BaseController.extend("zdigitalticket.controller.TEInfo", {
			/* =========================================================== */
			/* lifecycle methods                                           */
			/* =========================================================== */
			onInit: function() {
				var sFunctionName = "onInit";
				try {
					this._handleAnalyticsSendEvent(sFunctionName, Analytics.FUNCTION_TYPE.LIFECYCLE);
					BaseController.prototype.onInit.call(this);
					this.getRouter().getRoute("RouteTEInfo").attachPatternMatched(this.onTEInfoMatched, this);
				} catch (oError) {
					this._handleCatchException(oError, sFunctionName);
				}
			},

			/* =========================================================== */
			/* event handlers                       					   */
			/* =========================================================== */
			
			//Función que sirve para recuperar el nombre de la estación. Se llama tanto en el callback de la consulta de las estaciones de la linea
			//como en el callback de recuperar los trenes de una parada.
			onLoadLineStationData: function(sLine, sStation){
				var sFunctionName = "onLoadLineStationData";
				var oView = this.getView();
				var oModelLocalBinding = oView.getModel("localBinding");
				try {
					this._handleAnalyticsSendEvent(sFunctionName, Analytics.FUNCTION_TYPE.EVENT);
					var _sLine = oModelLocalBinding.getProperty("/TEInfo/Line");
					
					var sCurrStationCode = oModelLocalBinding.getProperty("/TEInfo/currStationCode");
					var sCurrStationName = this.getStationName(_sLine, sCurrStationCode);
					oModelLocalBinding.setProperty("/TEInfo/currStationName", sCurrStationName);
					var sCurrTime = this.formatTime(new Date());
					oModelLocalBinding.setProperty("/TEInfo/currTime", sCurrTime);
					
					var sDepartStationCode = oModelLocalBinding.getProperty("/TEInfo/departureStationCode");
					var sDepartStationName = this.getStationName(_sLine, sDepartStationCode);
					oModelLocalBinding.setProperty("/TEInfo/departureStationName", sDepartStationName);
					oView.getParent().setVisible(true);
				} catch (oError) {
					this._handleCatchException(oError, sFunctionName);
				}
			},
			
			getStationName: function(sLine, sStation){
				var sFunctionName = "getStationName";
				var sStationName;
				try {
					var oView = this.getView();
					var _sStation = sStation;
					var oMiralinModel = oView.getModel("miralinModel");					
					var aStops = oMiralinModel.getProperty("/stops/" + sLine);
					if(aStops){
						aStops.forEach(function(oItem){ 
							var oProperties = oItem.properties;
							if(oProperties.CODI_ESTACIO == _sStation){
								sStationName = oProperties.NOM_ESTACIO;
							}
						});
					}
				} catch (oError) {
					this._handleCatchException(oError, sFunctionName);
				}
				return sStationName;
			},
			
			onLoadStationArrivals: function(){
				var sFunctionName = "loadStationTracks";
				try {
					var that = this;
					var oView = this.getView();
					var	oResourceBundle = oView.getModel("i18n").getResourceBundle();
					var oModelLocalBinding = oView.getModel("localBinding");
					var oModelMiralin = oView.getModel("miralinModel");
					
					var sTrain = oModelLocalBinding.getProperty("/TEInfo/Train");
					var sLine = oModelLocalBinding.getProperty("/TEInfo/Line");
					var sLineTrain = this.getTrainNumber(sLine, sTrain);
					var aTracks = oModelMiralin.getProperty("/arrivals/tracks");
					aTracks.forEach(function(oItemTrack){
						var aTrainsPosition = oItemTrack.trainsPositions;
						aTrainsPosition.forEach(function(oItemTrain){
							if(oItemTrain.trainCode == sLineTrain){
								oModelLocalBinding.setProperty("/TEInfo/currStationCode", oItemTrain.stopCode);
								oModelLocalBinding.setProperty("/TEInfo/currTrack",  oResourceBundle.getText("stationInfo.trackNumber", [oItemTrain.track]));
								var sDepartureTime = that.formatTime(oItemTrain.arrivalTime);
								oModelLocalBinding.setProperty("/TEInfo/departureTime", sDepartureTime);
							}
						});
					});
					this.onLoadLineStationData();
				} catch (oError) {
					this._handleCatchException(oError, sFunctionName);
				}
			},
			
			loadCurrDate: function(oEvent){
				var sFunctionName = "loadCurrDate";
				try {
					var oView = this.getView();
					var oModelLocalBinding = oView.getModel("localBinding"); 
					var oCurrDate = new Date();
					//La fecha se formatea en la configuración del campo en la TEInfo.view.xml
					oModelLocalBinding.setProperty("/TEInfo/Date", oCurrDate); 
				} catch (oError) {
					this._handleCatchException(oError, sFunctionName);
				}
			},
			
			onTEInfoMatched: function(oEvent){
				var sFunctionName = "onTEInfoMatched";
				var oView = this.getView();
				var oModelLocalBinding = oView.getModel("localBinding");
				var	oResourceBundle = oView.getModel("i18n").getResourceBundle();
				var oArguments, sLine, sStation, sTrain, sTrack;
				try {
					this._handleAnalyticsSendEvent(sFunctionName, Analytics.FUNCTION_TYPE.EVENT);
					oView = this.getView();
					oModelLocalBinding = oView.getModel("localBinding");
					oModelLocalBinding.setProperty("/TEInfo", {});
					oArguments = oEvent.getParameter("arguments");
					if (oArguments.Line) {
						sLine = oArguments.Line;
						oModelLocalBinding.setProperty("/TEInfo/Line", sLine);
					}
					if (oArguments.Station) {
						sStation = oArguments.Station;
						oModelLocalBinding.setProperty("/TEInfo/Station", sStation);
					}
					if (oArguments.Train) {
						sTrain = oArguments.Train;
						oModelLocalBinding.setProperty("/TEInfo/Train", sTrain);
					}
					if (oArguments.Track) {
						sTrack = oArguments.Track;
						oModelLocalBinding.setProperty("/TEInfo/Track", sTrack);
					}
					
					oModelLocalBinding.setProperty("/TEInfo/departureTime", "");
					oModelLocalBinding.setProperty("/TEInfo/departureStationCode", sStation);
					oModelLocalBinding.setProperty("/TEInfo/departureStationName", "");
					oModelLocalBinding.setProperty("/TEInfo/departureTrack", oResourceBundle.getText("stationInfo.trackNumber", [sTrack]) );
					
					oModelLocalBinding.setProperty("/TEInfo/currTime", "");
					oModelLocalBinding.setProperty("/TEInfo/currStationCode", "");
					oModelLocalBinding.setProperty("/TEInfo/currStationName", "");
					oModelLocalBinding.setProperty("/TEInfo/currTrack", "");
					
					this.getMiralinInfo(
						sLine,
						sStation,
						sTrain,
						this.onLoadLineStationData,
						this.onLoadStationArrivals
					);
					this.loadCurrDate();
				} catch (oError) {
					this._handleCatchException(oError, sFunctionName);
				}
			},
			
			getTrainNumber: function(sLine, sTrain){
				var sFunctionName = "getTrainNumber";
				var sTrainResult;
				try {
					sTrainResult = sLine;
					var iTrain = parseInt(sTrain, 10);
					sTrainResult += (iTrain < 10) ? "0" + iTrain : iTrain;
				} catch (oError) {
					this._handleCatchException(oError, sFunctionName);
				}
				return sTrainResult;	
			},
			
			/* =========================================================== */
			/* formatters and other public methods                         */
			/* =========================================================== */
			formatTime: function(sTime){
				var sFunctionName = "formatTime";
				var dateFormatted;
				try {
					var dateObject = new Date(sTime);
					var dateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({pattern : "HH:mm" }); // SAPUI5 date formatter
					dateFormatted = dateFormat.format(dateObject); // Format the date
				} catch (oError) {
					this._handleCatchException(oError, sFunctionName);
				}
				return dateFormatted;
			}
		});
	}
);
