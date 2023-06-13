sap.ui.define(
	[
		"sap/ui/model/json/JSONModel",
		"sap/ui/Device",
		"zui5controlstmb/utils/CommonUtils"
	],
	function (JSONModel, Device, CommonUtils) {
		"use strict";

		return {
			createDeviceModel: function () {
				var oDevice = JSON.parse(JSON.stringify(Device));
				var oModel;

				oDevice.system.tablet = CommonUtils.isTablet();
				oDevice.system.phone = CommonUtils.isPhone();
				oDevice.system.desktop = CommonUtils.isDesktop();
				oModel = new JSONModel(oDevice);
				oModel.setDefaultBindingMode("OneWay");
				return oModel;
			}
		};
	}
);
