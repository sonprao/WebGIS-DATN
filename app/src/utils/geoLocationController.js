import _debounce from "lodash/debounce";

import { Fill, Stroke, Style, Circle as CircleStyle } from "ol/style";
import VectorSource from "ol/source/Vector";
import { Vector as VectorLayer } from "ol/layer";
// geolocation
import Geolocation from "ol/Geolocation";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import { transform } from "ol/proj";
import { transformProjection } from "src/utils/openLayers.js";
import { useLocationStore } from "stores/location";
class GeoLocationController {
  constructor(option = {}) {
    this.map = option.map;
    this.view = option.view;
    this.zoomToLocation = _debounce((coordinates) => {
      const currentExtent = this.positionFeature.getGeometry().getExtent()
      this.view.fit(currentExtent, {
        padding: [250, 250, 250, 250],
        duration: 1000,
        maxZoom: 15,
      });
    }, 200);
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
    this.position = this.geolocation.getPosition();
    this.accuracyFeature = accuracyFeature;
    this.positionFeature = positionFeature;
    this.vectorLayer = null;
    // Add a change event listener to the map view's resolution
    this.view.on("change:resolution", this.updateGeolocation.bind(this));

    // Add a change event listener to the map view's center
    this.view.on("change:center", this.updateGeolocation.bind(this));
  }

  updateGeolocation() {
    this.geolocation.setProjection(this.map.getView().getProjection());
  }

  getCurrentLocation() {
    const geolocation = this.geolocation;
    const accuracyFeature = this.accuracyFeature;
    const positionFeature = this.positionFeature;
    this.view = this.map.getView();
    if (!geolocation?.getPosition()) {
      geolocation.setTracking(true);
      geolocation.on("change:accuracyGeometry", function () {
        accuracyFeature.setGeometry(geolocation.getAccuracyGeometry());
      });
      geolocation.on(
        "change:position",
        function () {
          const coordinates = geolocation.getPosition();
          positionFeature.setGeometry(
            coordinates ? new Point(coordinates) : null
          );
          const locationStore = useLocationStore();
          locationStore.setLocation(this.geolocation.getPosition());
        }.bind(this)
      );
      this.vectorLayer = new VectorLayer({
        map: this.map,
        source: new VectorSource({
          features: [this.accuracyFeature, this.positionFeature],
        }),
      });
    } else if (this.vectorLayer) {
      this.vectorLayer.set("visible", true, false);
      this.vectorLayer.changed();
      this.zoomToLocation(this.geolocation.getPosition());
    }
    this.updateGeolocation();
    this.zoomToLocation(this.geolocation.getPosition());
  }

  removeCurrentLocation() {
    if (this.vectorLayer) {
      this.vectorLayer.set("visible", false, false);
      this.vectorLayer.changed();
    }
  }

  isShowCurrentLocation() {
    return this.vectorLayer?.get("visible") ?? false;
  }
}

export default GeoLocationController;
