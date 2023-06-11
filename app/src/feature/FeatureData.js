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
  }

  /**
   *
   * @param feature {Feature}
   */
  setData(feature) {
  }

  getDisplayHtml() {
    const $t = i18n.global.t;
    return null;
  }
}

export class ForestLandDataFeature extends BaseDataFeature {
  constructor() {
    super();
  }

  /**
   *
   * @param feature {Feature}
   */
  setData(feature) {
  }

  getDisplayHtml() {
    const $t = i18n.global.t;
    return null;
  }
}

export class RiverDataFeature extends BaseDataFeature {

}

const convertToCorrectFormat = function (string) {
  return decodeURIComponent(escape(string));
}


