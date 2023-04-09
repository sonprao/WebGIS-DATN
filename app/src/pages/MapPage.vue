<template>
  <div ref="map-root" class="mapView"></div>
</template>

<script>
import View from 'ol/View'
import Map from 'ol/Map'
import TileLayer from 'ol/layer/Tile'
import OSM from 'ol/source/OSM'

// importing the OpenLayers stylesheet is required for having
// good looking buttons!
import 'ol/ol.css'
import VectorSource from 'ol/source/Vector'
import GeoJSON from 'ol/format/GeoJSON'
import VectorLayer from 'ol/layer/Vector'
// import customjson from '../constants/danang.json'

import { defineComponent, ref, unref, onMounted, getCurrentInstance } from 'vue'
import { useQuasar } from 'quasar'
import { i18n } from 'boot/i18n.js'
export default defineComponent({
  name: 'MapContainer',
  components: {},
  props: {},
  setup(props) {
    // const itext = i18n.global.t('common.user')
    const vm = getCurrentInstance().proxy 
    const $q = useQuasar()
    const $t = i18n.global.t
    const textSample = $t('success')
    $q.lang.getLocale()
    const container = ref(null)
    // const feature = new GeoJSON().readFeatures(customjson, {
    //   // this is required since GeoJSON uses latitude/longitude,
    //   // but the map is rendered using “Web Mercator”
    //   dataProjection: 'EPSG:3857',
    //   featureProjection: 'EPSG:3857'
    // });

    // // a new vector layer is created with the feature
    // const vectorLayer = new VectorLayer({
    //   source: new VectorSource({
    //     features: [feature],
    //   }),
    // })
    const vectorLayer = new VectorLayer({
      source: new VectorSource({
        format: new GeoJSON(),
        url: 'danang.json'
      }),
    })

    onMounted(() => {
      // this is where we create the OpenLayers map
      const map = new Map({
        // the map will be created using the 'map-root' ref
        target: vm.$refs['map-root'],
        layers: [
          // adding a background tiled layer
          new TileLayer({
            source: new OSM() // tiles are served by OpenStreetMap
          }),
        ],
        // the map view will initially show the whole world
        view: new View({
          zoom: 0,
          center: [0, 0],
          constrainResolution: true
        }),
      })
      map.addLayer(vectorLayer)
    })
    return {
      vectorLayer,
    }

  }
})
</script>
<style scoped>
html,
body {
  width: 100%;
  height: 100%;
}

.mapView {
  height: 1000px;
  width: 100%;
  min-height: inherit;
}
</style>
