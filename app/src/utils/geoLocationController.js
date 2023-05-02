import { Fill, Stroke, Style, Circle as CircleStyle } from "ol/style";
import VectorSource from "ol/source/Vector";
import { Vector as VectorLayer } from "ol/layer";
// geolocation
import Geolocation from "ol/Geolocation";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";


class GeoLocationController {
  constructor(option = {}) {
    this.map = option.map;
    this.view = option.view;
    const geolocation = new Geolocation({
      // enableHighAccuracy must be set to true to have the heading value.
      trackingOptions: {
        enableHighAccuracy: false,
      },
      projection: this.view.getProjection(),
    });
    const accuracyFeature = new Feature();
    const positionFeature = new Feature();

    positionFeature.setStyle(
      new Style({
        image: new CircleStyle({
          radius: 6,
          fill: new Fill({
            color: "#3399CC",
          }),
          stroke: new Stroke({
            color: "#fff",
            width: 2,
          }),
        }),
      })
    );
    this.geolocation = geolocation;
    this.accuracyFeature = accuracyFeature;
    this.positionFeature = positionFeature;
    this.vectorLayer = null;
  }
  getCurrentLocation() {
    const geolocation = this.geolocation;
    const accuracyFeature = this.accuracyFeature;
    const positionFeature = this.positionFeature;
    if (!geolocation?.getPosition()) {
      geolocation.setTracking(true);
      geolocation.on("change:accuracyGeometry", function () {
        accuracyFeature.setGeometry(geolocation.getAccuracyGeometry());
      });
      geolocation.on("change:position", function () {
        const coordinates = geolocation.getPosition();
        positionFeature.setGeometry(coordinates ? new Point(coordinates) : null);
      });
      this.vectorLayer = new VectorLayer({
        map: this.map,
        source: new VectorSource({
          features: [this.accuracyFeature, this.positionFeature],
        }),
      });
    }
    else if (this.vectorLayer) {
      this.vectorLayer.set('visible', true, false)
      this.vectorLayer.changed()
    }
  }

  removeCurrentLocation() {
    if (this.vectorLayer) {
      this.vectorLayer.set('visible', false, false)
      this.vectorLayer.changed()
    }
  }

  isShowCurrentLocation() {
    return this.vectorLayer?.get('visible') ?? false
  }
}

export default GeoLocationController