import {i18n} from "boot/i18n.js";
import {toLonLat} from "ol/proj";
import {toStringHDMS} from "ol/coordinate";

export class BaseDataFeature {
  constructor() {
  }

  /**
   *
   * @param feature
   */
  setData(feature) {
    //Override me
  }

  getDisplayHtml() {
    return "";
    //Override me
  }

  setLocation(location) {
    this.location = location;
  }

}

export class CityLandDataFeature extends BaseDataFeature {
  constructor() {
    super();
    this.name = null;
    this.ownerName = null;
    this.progress = null;
    this.area = null;
    this.location = null;
    this.soilType = null;
    this.soilTypeId = null;
  }

  /**
   *
   * @param feature {Feature}
   */
  setData(feature) {
    this.name = feature.get("RefName");
    this.progress = feature.get("Progress");
    this.ownerName = feature.get("Owner");
    this.soilType = feature.get("SoilType");
    this.area = feature.getGeometry().getArea();
  }

  getDisplayHtml() {
    const $t = i18n.global.t;
    const hdms = toStringHDMS(toLonLat(this.location));
    let str = "<p>" + (this.name) + "</p>" +
      "<p>" + $t('Location') + " : " + hdms + "</p>" +
      "<p>" + $t('Area') + " : " + Math.round(this.area) + " m2 " + "</p>" +
      "<p>" + $t('Owner') + " : " + (this.ownerName) + "</p>" +
      "<p>" + $t('SoilType') + " : " + (this.soilType) + "</p>" +
      "<p>" + $t('Status') + " : " + (this.progress) + "</p>";
    return str;
  }
}

export class RoadDataFeature extends BaseDataFeature {
  constructor() {
    super();
    this.osm_id = null;
    this.code = null;
    this.fclass = null;
    this.name = null;
    this.ref = null;
    this.oneWay = null;
    this.maxSpeed = null;
    this.bridge = null;
    this.tunnel = null;
  }

  /**
   *
   * @param feature {Feature}
   */
  setData(feature) {
    this.osm_id = feature.get("osm_id");
    this.code = feature.get("code");
    this.fclass = feature.get("fclass");
    this.name = feature.get("name");
    this.oneWay = feature.get("oneway");
    this.maxSpeed = feature.get("maxSpeed");
    this.bridge = feature.get("bridge");
    this.tunnel = feature.get("tunnel");
    this.length = feature.getGeometry().getLength();

  }

  getDisplayHtml() {
    const $t = i18n.global.t;
    const hdms = toStringHDMS(toLonLat(this.location));
    let str = "<p>" + convertToCorrectFormat(this.name) + "</p>" +
      "<p>" + $t('code') + " : " + hdms + "</p>" +
      "<p>" + $t('fclass') + " : " + $t(this.fclass) + "</p>" +
      "<p>" + $t('oneWay') + " : " + (this.oneWay) + "</p>" +
      "<p>" + $t('maxSpeed') + " : " + (this.maxSpeed) + "</p>" +
      "<p>" + $t('Length') + " : " + (this.length) + "</p>";
    return str;
  }

}

export class ForestLandDataFeature extends BaseDataFeature {
  constructor() {
    super();
    this.area = null;
  }
  /**
   *
   * @param feature {Feature}
   */
  setData(feature) {
    this.name = feature.get("name");
    this.area = feature.getGeometry().getArea();
    this.soilType = feature.get("SoilType");
  }

  getDisplayHtml() {
    const $t = i18n.global.t;
    const hdms = toStringHDMS(toLonLat(this.location));
    let str = "<p>" + (this.name) + "</p>" +
      "<p>" + $t('Location') + " : " + hdms + "</p>" +
      "<p>" + $t('Area') + " : " + Math.round(this.area) + " m2 " + "</p>" +
      "<p>" + $t('SoilType') + " : " + (this.soilType) + "</p>";
    return str;
  }
}

export class RiverDataFeature extends BaseDataFeature {
  constructor() {
    super();
  }
  setData(feature) {
    this.area = feature.getArea();
    this.name = feature.get("Name");
  }

  getDisplayHtml() {
    const $t = i18n.global.t;
    const hdms = toStringHDMS(toLonLat(this.location));
    let str = "<p>" + (this.name) + "</p>" +
      "<p>" + $t("location") + (hdms) + "</p>" +
      "<p>" + $t("area") + (this.area) + "</p>";
    return str;
  }
}

const convertToCorrectFormat = function (string) {
  return decodeURIComponent(escape(string));
}

// SoilTypeID:
// Dat rung: 1
// Dat don vi o : 0
//

export const SOIL_TYPE_ID = {
  DAT_RUNG : 0,
  DAT_DON_VI_O : 1,
}


