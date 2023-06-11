import {Fill, Stroke, Style, Circle as CircleStyle} from "ol/style";
import VectorSource from "ol/source/Vector";
import {Vector as VectorLayer} from "ol/layer";
// geolocation
import Geolocation from "ol/Geolocation";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";


export class LayerController {
  constructor(option = {}) {
    /**
     *
     * @type {{VectorLayer}}
     */
    this.layers = {};
  }

  /**
   * @param layerId
   * @param layer {VectorLayer}
   */
  addLayer(layerId, layer) {
    if (!this.layers[layerId]) {
        this.layers[layerId] = layer;
    }
  }

  /**
   *
   * @param id
   * @returns {VectorLayer}
   */
  getLayer(id) {
    return this.layers[id];
  }

  removeLayer(id) {
    this.layers[id] = null;
  }

  clearAll() {
    this.layers = {};
  }
}

export default LayerController
