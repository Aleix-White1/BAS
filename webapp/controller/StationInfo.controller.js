sap.ui.define(
	[
		"zdigitalticket/controller/BaseController",
		"sap/base/Log",
		"sap/ui/core/format/DateFormat",
		"sap/m/MessageBox"
	],
	function (BaseController, Log, DateFormat, MessageBox) {
		"use strict";
	
		return BaseController.extend("zdigitalticket.controller.StationInfo", {
			NUM_TRAINS_IN_LIST : 5,
			/* =========================================================== */
			/* lifecycle methods                                           */
			/* =========================================================== */
			onInit: function() {
				try {
					BaseController.prototype.onInit.call(this);
					this.getRouter().getRoute("RouteStationInfo").attachPatternMatched(this.onStationInfoMatched, this);
				}
				catch (oError) {
					Log.error(oError.message);
				}
			},

			/* =========================================================== */
			/* event handlers                       					   */
			/* =========================================================== */

			/**
			 * Evento que se lanza cuando se modifica el valor del SelectCombo de la vía seleccionada, recogiendo el valor de este
			 * y ejecutando la función para cargar los trenes para esa vía.
			 */
			onChangeTrack: function(oEvent){
				try {
					var oView = this.getView();
					var oModelLocalBinding = oView.getModel("localBinding");
					var sTrackNumber = oModelLocalBinding.getProperty("/StationInfo/selectedTrack");
					this.loadTrainsPositions(sTrackNumber);
				}
				catch (oError) {
					Log.error(oError.message);
				}
			},
			
			/*
				Recibe por parámetro el indicador de la vía de la que se desean consultar los trenes y recarga la información en la tabla 
				moviendo los datos del "miralinModel" al modelo contra el que está biendeada la tabla.
			*/
			loadTrainsPositions: function(sTrackNumer) {
				try {
					var that = this;
					var oView = this.getView();
					var oModelMiralin = oView.getModel("miralinModel");	
					var oModelLocalBinding = oView.getModel("localBinding");
					var _sTrackNumber = sTrackNumer;
					var aTracks = oModelMiralin.getProperty("/arrivals/tracks");
					aTracks.forEach(function(oItemTrack){
						if(oItemTrack.track == _sTrackNumber){
							var aTrainsPositions = oItemTrack.trainsPositions.slice(0, that.NUM_TRAINS_IN_LIST);
							oModelLocalBinding.setProperty("/StationInfo/StationInfoTrainSet", aTrainsPositions);
						}
					});
				}
				catch (oError) {
					Log.error(oError.message);
				}
			},
			
			/*
				loadStationTracks: Se ejecuta una vez se recibe la información de los trenes para la estación. 
				Con esta información recibida se carga el desplegable del vías y se fuerza el evento change del desplegable para que se recargue la información de los trenes para esa vía.
			*/
			loadStationTracks: function(){
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
					oView.getParent().setVisible(true);
					setTimeout((function() {
						oView.byId("dataTable").removeStyleClass("tableWithNoData");
					}).bind(this), 0);
				}
				catch (oError) {
					Log.error(oError.message);
				}
			},

			/*
				Función que recoge la información referente a las estaciones de una línea y
				recarga la información necesaria en el modelo "localBinding" contra el que están mapeados los campos de la pantalla.
			*/
			updateStationDataInLocalBindingModel: function(sLine, sStation){
				try {
					var oView = this.getView();
					var _sStation = sStation;
					var oMiralinModel = oView.getModel("miralinModel");					
					var oModelLocalBinding = oView.getModel("localBinding"); 
					var aStops = oMiralinModel.getProperty("/stops/" + sLine);

					if (aStops) {
						aStops.forEach(function(oItem){ 
							var oProperties = oItem.properties;
							if (oProperties.CODI_ESTACIO == _sStation) {
								oModelLocalBinding.setProperty("/StationInfo/Name", oProperties.NOM_ESTACIO);
								return false;
							}
						});
					}
					oModelLocalBinding.setProperty("/StationInfo/Date", new Date());
					oModelLocalBinding.setProperty("/StationInfo/Line", sLine);
					oModelLocalBinding.setProperty("/StationInfo/CurrTime", this.formatTime());
					oView.getParent().setVisible(true);
				}
				catch (oError) {
					Log.error(oError.message);
				}
			},

			//Función para actualizar los campos que aparecen en la pantalla con la fechas y hora actual.
			loadCurrDateAndTime: function() {
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
				}
				catch (oError) {
					Log.error(oError.message);
				}
			},

			/*
				Función encargada de lanzar la llamada contra los servicios  de miralin.
				Se realizan dos llamadas a los servicios de Miralín:
				
					1- Obtener la información de las paradas de la línea. Los resultados se almacenarán en el modelo de datos "miralinModel"
					   en la propiedad "/stops/" + numLinia. Así se evita solicitar información duplicada al miralin dado que la información de la parada
					   (nombre, ubicación, etc) es estática y no se actualiza en tiempo real.
					   
					2- Obtener la información de los trenes de la parada
					
				Nota: la función del BaseController "getMiralinInfo" se utiliza tanto en este controlador como en el TEInfo. Para poder realizar su 
				reutilización se han pasado dos funciones callback para las peticiones al miralín:
					1- loadStationTracks: Se ejecuta una vez se recibe la información de los trenes para la estación. Con esta información recibida se carga el desplegable del vías
					y al modificar el valor de este, carga la información de los trenes para esa vía.
					2- updateStationDataInLocalBindingModel: Actualiza la información estática referente a la estación.
			*/
			onStationInfoMatched: function(oEvent) {
				var oView = this.getView();
				var oModelLocalBinding = oView.getModel("localBinding");
				var oArguments, sLine, sTation;

				try {
					(oView = this.getView()).byId("dataTable").addStyleClass("tableWithNoData");
					oModelLocalBinding = oView.getModel("localBinding");
					oModelLocalBinding.setProperty("/StationInfo", {});
					oArguments = oEvent.getParameter("arguments");
					if (oArguments.Line) {
						sLine = oArguments.Line;
						oModelLocalBinding.setProperty("/StationInfo/Line", sLine);
					}
					if (oArguments.Station) {
						sTation = oArguments.Station;
						oModelLocalBinding.setProperty("/StationInfo/Station", sTation);
					}
					this.getMiralinInfo(
						sLine,
						sTation,
						undefined,
						this.updateStationDataInLocalBindingModel,
						this.loadStationTracks
					);
					this.loadCurrDateAndTime();
				}
				catch (oError) {
					Log.error(oError.message);
				}
			},

			/* =========================================================== */
			/* formatters and other public methods                         */
			/* =========================================================== */
			formatTime: function(sTime){
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
				}
				catch (oError) {
					Log.error(oError.message);
				}
				return dateFormatted;
			},

			formatDAntTime: function(sTime){
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
				}
				catch (oError) {
					Log.error(oError.message);
				}
				return sDAntFormated;
			}

			/* =========================================================== */
			/* private methods                                             */
			/* =========================================================== */
		});
	}
);
