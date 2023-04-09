<!-- <template>
  <q-page class="flex flex-center">
   <div style="height:600px; width:800px">
    <l-map ref="map" v-model:zoom="zoom" :center="[47.41322, -1.219482]">
      <l-tile-layer
        url="https://tile.openstreetmap.org/0/0/0.png"
        layer-type="base"
        name="OpenStreetMap"
      ></l-tile-layer>
    </l-map>
  </div>
  </q-page>
</template> -->
<template>
  <q-page class="flex flex-center">
    <div ref="container" class="mapView"></div>
  </q-page>
</template>
<script>
import { defineComponent, ref, unref, onMounted } from 'vue'
// import "leaflet/dist/leaflet.css"
// import { LMap, LTileLayer } from "@vue-leaflet/vue-leaflet"
import ArcGISMap from '@arcgis/core/WebMap'
import MapView from '@arcgis/core/views/MapView'

export default defineComponent({
  name: 'MapPage',
  components: {
    // LMap,
    // LTileLayer,
  },
  props: {
    msg: {
      type: String,
      default: '06ca49d0ddb447e7817cfc343ca30df9',
    }
  },
  setup(props) {
    const container = ref(null)
    
    onMounted(() => {
      const map = new ArcGISMap({
        portalItem: {
          id: props.msg,
        }
      })
      const view = new MapView({
        map,
        container: unref(container)
      })
      view.when(() => {
        console.log('ready')
      })
      
    })

    return {
      container,
      zoom: 2,
    }
  }
})
</script>
<style scoped>
@import url("https://js.arcgis.com/4.26/esri/themes/light/main.css");

html, body {
  width: 100%;
  height: 100%;
}

.mapView {
  height: 100%;
  width: 100%;
  min-height: inherit;
}
</style>