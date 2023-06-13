sap.ui.define(
	[
		"zui5controlstmb/BaseComponent",
		"zdigitalticket/model/models",
		"sap/base/Log",
		"sap/ui/fl/Utils",
		"sap/ui/Device"
	],
	function (BaseComponent, models, Log, Utils, Device) {	
		"use strict";
	
		return BaseComponent.extend("zdigitalticket.Component", {
			/**
			 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
			 * @public
			 * @override
			 */
			metadata: {
				manifest: "json"
			},
			/**
			 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once
			 * @public
			 * @override
			 */
			init: function (oEvent) {
				try {
					//Call the base component's init function
					BaseComponent.prototype.init.call(this, oEvent);
					//Enable routing
					this.getRouter().initialize();
					//Set the device model
					this.setModel(models.createDeviceModel(), "device");
				}
				catch (oError) {
					Log.error(oError.message);
				}
			}
		});
	}
);
