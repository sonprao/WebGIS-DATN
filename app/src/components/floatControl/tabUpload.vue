<template>
  <div>
    <q-uploader
      label="Custom header"
      multiple
      color="teal"
      style="max-width: 300px"
      :filter="checkFileType"
      @added="addEvent"
      @removed="removeEvent"
      @rejected="onRejected"
    >
      <template v-slot:header="scope">
        <div class="row no-wrap items-center q-pa-sm q-gutter-xs">
          <q-btn
            v-if="scope.queuedFiles.length > 0"
            icon="clear_all"
            @click="scope.removeQueuedFiles"
            round
            dense
            flat
          >
            <q-tooltip>Clear All</q-tooltip>
          </q-btn>
          <q-btn
            v-if="scope.uploadedFiles.length > 0"
            icon="done_all"
            @click="scope.removeUploadedFiles"
            round
            dense
            flat
          >
            <q-tooltip>Remove Uploaded Files</q-tooltip>
          </q-btn>
          <q-spinner v-if="scope.isUploading" class="q-uploader__spinner" />
          <div class="col">
            <div class="q-uploader__title">Upload GeoJSON here</div>
            <div class="q-uploader__subtitle">
              {{ scope.uploadSizeLabel }} / {{ scope.uploadProgressLabel }}
            </div>
          </div>
          <q-btn
            v-if="scope.canAddFiles"
            type="a"
            icon="add_box"
            @click="scope.pickFiles"
            round
            dense
            flat
          >
            <q-uploader-add-trigger />
            <q-tooltip>Pick Files</q-tooltip>
          </q-btn>
          <q-btn
            v-if="scope.canUpload"
            icon="cloud_upload"
            @click="scope.upload"
            round
            dense
            flat
          >
            <q-tooltip>Upload Files</q-tooltip>
          </q-btn>

          <q-btn
            v-if="scope.isUploading"
            icon="clear"
            @click="scope.abort"
            round
            dense
            flat
          >
            <q-tooltip>Abort Upload</q-tooltip>
          </q-btn>
        </div>
      </template>
      <template v-slot:list="scope">
        <q-list separator>
          <q-item v-for="(file, index) of scope.files" :key="file.__key">
            <q-item-section>
              <q-item-label class="full-width ellipsis">
                {{ file.name }}
              </q-item-label>

              <q-item-label caption> Status: {{ file.__status }} </q-item-label>

              <q-item-label caption>
                {{ file.__sizeLabel }} / {{ file.__progressLabel }}
              </q-item-label>
            </q-item-section>

            <q-item-section v-if="file.__img" thumbnail class="gt-xs">
              <img :src="file.__img.src" />
            </q-item-section>

            <q-item-section top side>
              <q-btn
                class="gt-xs"
                size="12px"
                flat
                dense
                round
                icon="more_vert"
              >
                <q-menu>
                  <q-list dense>
                    <q-item clickable v-close-popup @click="detailFile(index)">
                      <q-item-section>{{ $t("Detail") }}</q-item-section>
                      <q-item-section avatar>
                        <q-icon name="info" />
                      </q-item-section>
                    </q-item>
                    <q-item
                      clickable
                      v-close-popup
                      @click="scope.removeFile(file)"
                    >
                      <q-item-section>{{ $t("Delete") }}</q-item-section>
                      <q-item-section avatar>
                        <q-icon name="delete" />
                      </q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </q-btn>
            </q-item-section>
          </q-item>
        </q-list>
      </template>
    </q-uploader>
  </div>
</template>

<script>
import {
  getCurrentInstance,
  defineComponent,
  ref,
  unref,
  computed,
  onMounted,
  onUnmounted,
  watch,
  provide,
  inject,
} from "vue";
import { i18n } from "boot/i18n.js";
import { Map, View } from "ol";
import proj4 from "proj4";
import { register } from "ol/proj/proj4";
import { Vector } from "ol/layer";
import Overlay from "ol/Overlay";
import VectorSource from "ol/source/Vector";
import GeoJSON from "ol/format/GeoJSON";
import { LineString, Polygon } from "ol/geom";

import { drawStyle, formatArea, formatLength } from "src/utils/measure";

import _difference from "lodash/difference";
import _isEmpty from "lodash/isEmpty";
import { MAP_LAYERS } from "src/constants/layer.js";
import {
  actionAddLayerGeoJSON,
  actionAddLayerWMS,
  transformProjection,
} from "src/utils/openLayers.js";
import { useQuasar } from "quasar";

export default defineComponent({
  name: "TabUpload",
  components: {},
  setup() {
    const vm = getCurrentInstance().proxy;
    const $q = useQuasar();
    const $t = i18n.global.t;
    const map = inject("map", {});

    const uploadSource = ref(null);
    const uploadVector = ref(null);

    const uploadList = ref([]);

    const checkFileType = (files) => {
      return files.filter(file => file.type === 'application/json')
    }

    const parseJsonFile = async (file) => {
      return new Promise((resolve, reject) => {
        const fileReader = new FileReader();
        fileReader.onload = (event) => resolve(JSON.parse(event.target.result));
        fileReader.onerror = (error) => reject(error);
        fileReader.readAsText(file);
      });
    };

    const addEvent = async (files) => {
      files.forEach(async (file) => {
        const obj = await parseJsonFile(file);
        if (obj) {
          if (!unref(uploadVector)) {
            if (!unref(uploadSource)) {
              uploadSource.value = new VectorSource({ wrapX: false });
            }
            uploadVector.value = new Vector({
              source: unref(uploadSource),
              style: {
                "fill-color": "rgba(45, 85, 255, 0.4)",
                "stroke-color": "#3366ff",
                "stroke-width": 2,
                "circle-radius": 7,
                "circle-fill-color": "#3366ff",
              },
            });
            unref(map).addLayer(unref(uploadVector));
          }
          measureTooltipElement.value = null;
          createMeasureTooltip();
          const geojsonFormat = new GeoJSON().readFeature(obj, {
            dataProjection: "EPSG:4326",
            featureProjection: unref(map).getView().getProjection().getCode(),
          });
          const time = new Date().toLocaleString();
          geojsonFormat.setId(time);
          uploadList.value.push({
            id: time,
            file: file,
          });
          unref(uploadSource).addFeature(geojsonFormat);
          const geom = geojsonFormat.getGeometry();
          let output;
          let tooltipCoord;
          if (geom instanceof Polygon) {
            output = formatArea(geom);
            tooltipCoord = geom.getInteriorPoint().getCoordinates();
          } else if (geom instanceof LineString) {
            output = formatLength(geom);
            tooltipCoord = geom.getLastCoordinate();
          }
          measureTooltipElement.value.innerHTML = output;
          unref(measureTooltip).setPosition(tooltipCoord);
        }
      });
    };

    const removeEvent = async (files) => {
      if (files.length === unref(uploadList).length) {
        unref(uploadSource).clear();
        uploadList.value = [];
        document.querySelectorAll("div.ol-tooltip.ol-tooltip-upload").forEach((d) => {
          d.remove();
        })
        return;
      }
      files.forEach(async (file) => {
        const featureIndex = unref(uploadList).findIndex(
          (u) => u.file === file
        );
        const feature = unref(uploadSource).getFeatureById(
          unref(uploadList)[featureIndex].id
        );
        if (feature) {
          unref(uploadSource).removeFeature(feature);
          uploadList.value.splice(featureIndex, 1);
          document.querySelectorAll("div.ol-tooltip.ol-tooltip-upload")[featureIndex].remove();
        }
      });
    };

    // measureToolTip
    const measureTooltipElement = ref(null);
    const measureTooltip = ref(null);

    const createMeasureTooltip = () => {
      if (unref(measureTooltipElement)) {
        unref(measureTooltipElement)?.parentNode?.removeChild?.(
          unref(measureTooltipElement)
        );
      }
      measureTooltipElement.value = document.createElement("div");
      measureTooltipElement.value.className = "ol-tooltip ol-tooltip-upload";
      measureTooltipElement.value.setAttribute(
        "data-html2canvas-ignore",
        "true"
      );
      measureTooltip.value = new Overlay({
        element: unref(measureTooltipElement),
        offset: [0, -15],
        positioning: "bottom-center",
        stopEvent: false,
        insertFirst: false,
      });
      unref(map).addOverlay(unref(measureTooltip));
    };

    const onRejected = (rejectedEntries) => {
      // Notify plugin needs to be installed
      // https://quasar.dev/quasar-plugins/notify#Installation
      $q.notify({
        type: 'negative',
        message: '*.json file only!'
      })
    }

    const detailFile = async (index) => {
      const feature = unref(uploadSource).getFeatureById(
        unref(uploadList)[index].id
      );
      if (feature) {
        const extent = feature.getGeometry().getExtent()
        unref(map).getView().fit(extent, {
            padding: [100, 100, 100, 100],
            duration: 1000,
          });
      }
    };

    return {
      map,
      location,
      checkFileType,
      addEvent,
      removeEvent,
      onRejected,
      detailFile,
    };
  },
});
</script>
<style lang="scss" scoped>
.circle {
  border-radius: 50% !important;
}

.ol-tooltip {
  position: relative;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 4px;
  color: white;
  padding: 4px 8px;
  opacity: 0.7;
  white-space: nowrap;
  font-size: 12px;
  cursor: default;
  user-select: none;
}

.ol-tooltip-upload {
  opacity: 1;
  font-weight: bold;
}

.ol-tooltip-static {
  background-color: #3366ff;
  color: black;
  border: 1px solid white;
}

.ol-tooltip-upload:before,
.ol-tooltip-static:before {
  border-top: 6px solid rgba(0, 0, 0, 0.5);
  border-right: 6px solid transparent;
  border-left: 6px solid transparent;
  content: "";
  position: absolute;
  bottom: -6px;
  margin-left: -7px;
  left: 50%;
}

.ol-tooltip-static:before {
  border-top-color: #3366ff;
}

.drawListClass {
  max-height: 60vh;
  max-width: 300px;

  .q-scrollarea__content.absolute {
    display: flex;
    flex-direction: column-reverse;
  }
}
.q-item__section--avatar {
  min-width: 30px;
}
</style>
