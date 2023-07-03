<template>
  <div>
    <q-uploader ref="uploaderRef" label="Custom header" multiple color="teal" style="max-width: 300px"
      :filter="checkFileType" max-file-size="50000000" accept=".json" @added="addEvent" @removed="removeEvent"
      @rejected="onRejected">
      <template v-slot:header="scope">
        <div class="row no-wrap items-center q-pa-sm q-gutter-xs">
          <q-btn v-if="scope.queuedFiles.length > 0" icon="clear_all" @click="scope.removeQueuedFiles" round dense flat>
            <q-tooltip>Clear All</q-tooltip>
          </q-btn>
          <q-btn v-if="scope.uploadedFiles.length > 0" icon="done_all" @click="scope.removeUploadedFiles" round dense
            flat>
            <q-tooltip>Remove Uploaded Files</q-tooltip>
          </q-btn>
          <q-spinner v-if="scope.isUploading" class="q-uploader__spinner" />
          <div class="col">
            <div class="q-uploader__title">Upload GeoJSON here</div>
            <div class="q-uploader__subtitle">
              {{ scope.uploadSizeLabel }} / {{ scope.uploadProgressLabel }}
            </div>
          </div>
          <q-btn v-if="scope.canAddFiles" type="a" icon="add_box" @click="scope.pickFiles" round dense flat>
            <q-uploader-add-trigger />
            <q-tooltip>Pick Files</q-tooltip>
          </q-btn>
          <q-btn v-if="scope.isUploading" icon="clear" @click="scope.abort" round dense flat>
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
              <q-btn class="gt-xs" size="12px" flat dense round icon="more_vert">
                <q-menu>
                  <q-list dense>
                    <q-item clickable v-close-popup @click="detailFile(index)">
                      <q-item-section>{{ $t("Detail") }}</q-item-section>
                      <q-item-section avatar>
                        <q-icon name="info" />
                      </q-item-section>
                    </q-item>
                    <q-item clickable v-close-popup @click="scope.removeFile(file)">
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
import _debounce from "lodash/debounce";
import _difference from "lodash/difference";
import _isEmpty from "lodash/isEmpty";
import { i18n } from "boot/i18n.js";
import { $bus } from "boot/bus.js";
import { Map, View } from "ol";
import { containsExtent } from "ol/extent";
import { transform } from "ol/proj";
import {
  Fill as sFill,
  Stroke as sStroke,
  Style as sStyle,
  RegularShape as sRegularShape,
  Circle as sCircle,
  Text as sText,
} from "ol/style";

import { toStringHDMS } from "ol/coordinate";

import proj4 from "proj4";
import { register } from "ol/proj/proj4";
import { Vector } from "ol/layer";
import {
  Vector as VectorLayer,
  VectorImage as VectorImageLayer,
} from "ol/layer";
import Overlay from "ol/Overlay";
import VectorSource from "ol/source/Vector";
import GeoJSON from "ol/format/GeoJSON";
import { LineString, Polygon, Point, MultiPolygon } from "ol/geom";
import { fromExtent } from "ol/geom/Polygon";

import { writeGeoJSON } from "src/utils/openLayers";
import { captureScreenshot } from "src/utils/html2Canvas";
import { drawStyle, formatArea, formatLength } from "src/utils/measure";
import { MAP_LAYERS } from "src/constants/layer.js";
import {
  actionAddLayerGeoJSON,
  actionAddLayerWMS,
  transformProjection,
} from "src/utils/openLayers.js";
import { LAYER_TYPE } from "src/constants/enum";

import { useMapStore } from "stores/map";
import { useQuasar } from "quasar";

export default defineComponent({
  name: "TabUpload",
  components: {},
  setup() {
    const vm = getCurrentInstance().proxy;
    const $q = useQuasar();
    const $t = i18n.global.t;
    const uploaderRef = ref(null);
    const map = inject("map", {});
    const mapStore = useMapStore();
    const location = computed(() => mapStore.getLocation);

    const uploadSource = ref(null);
    const uploadVector = ref(null);

    const uploadList = ref([]);

    const checkFileType = (files) => {
      return files.filter((file) => file.type === "application/json");
    };

    const parseJsonFile = async (file) => {
      return new Promise((resolve, reject) => {
        const fileReader = new FileReader();
        fileReader.onload = (event) => resolve(JSON.parse(event.target.result || null));
        fileReader.onerror = (error) => reject(error);
        fileReader.readAsText(file);
      });
    };

    const preAddEvent = async ({ scope, event }) => {
      return await $q.dialog({
        icon: 'delete',
        class: 'deleteWarningClass',
        title: $t('Warning'),
        message: `${$t('Select projection')}?`,
        ok: {
          push: true
        },
        cancel: {
          push: true,
          color: 'negative'
        },
        persistent: true
      }).onOk(async () => {
        debugger
        console.log(scope)
        console.log(event)
      }).onCancel(() => {
        files.forEach((file) => {
          unref(uploaderRef)?.removeFile(file);
        })
      }).onDismiss(() => {
      })
    }

    const addEvent = async (files) => {
      const mapProjection = unref(map).getView().getProjection().getCode();
      const mapExtent = JSON.parse(unref(location)?.view?.extent || null) || unref(map).getView().calculateExtent();
      files.forEach(async (file) => {
        const defaultProjection = unref(map).getView().getProjection().getCode()
        const obj = await parseJsonFile(file);
        if (obj) {
          const crsName = obj?.crs?.properties?.name?.replace?.("::", ":") || null
          let dataProjection = "EPSG:3857"
          if (crsName) {
            dataProjection = crsName.match(/EPSG:\d+/)[0] || "EPSG:3857"
            proj4.defs(dataProjection, "+proj=tmerc +lat_0=0 +lon_0=107.75 +k=0.9999 +x_0=500000 +y_0=0 +ellps=WGS84 +towgs84=-191.904,-39.303,-111.450,0.00928836,0.01975479,-0.00427372,0.25290627854559 +units=m +no_defs")
            register(proj4)
          } 
          const listGeojsonFormat = new GeoJSON().readFeatures(obj)
          // check if feature in bound extent of the map
          for (const geojsonFormat of listGeojsonFormat) {
            if (!geojsonFormat.getGeometry()) {
              $q.notify({
                type: "negative",
                message: "This file is not a valid data!",
              });
              return;
            }
            geojsonFormat.getGeometry().transform(dataProjection, defaultProjection)
            const geomExtent = geojsonFormat?.getGeometry?.()?.getExtent?.();
            if (geomExtent) {
              if (!containsExtent(mapExtent, geomExtent)) {
                unref(uploaderRef)?.removeFile(file);
                $q.notify({
                  type: "negative",
                  message: "This feature not in bound of current view!",
                });
                return;
              }
            }
          }

          const time = new Date().toLocaleString();
          uploadList.value.push({
            id: time,
            file: file,
          });
          if (!unref(uploadVector)) {
            if (!unref(uploadSource)) {
              uploadSource.value = new VectorSource({ wrapX: false, zIndex: 10 });
            }
            uploadVector.value = new VectorImageLayer({
              id: time,
              source: unref(uploadSource),
              style: featureStyleFunction,
            });
            unref(map).addLayer(unref(uploadVector));
          }
          unref(uploadSource).addFeatures(listGeojsonFormat);
          uploadSource.value = null;
          uploadVector.value = null;
        }
      });
    };
    
    const featureStyleFunction = (feature, resolution) => {
      if (resolution < 20) return zoomedStyle20
      else if (resolution >= 20 && resolution < 150) return zoomedStyle150
      else return zoomedOutStyle
    }

    const styleDefault = {
      fill: new sFill({
        color: 'rgb(0,128,128, 0.4)'
      }),
      stroke: new sStroke({
        color: '#008080',
        width: 2,
      }),
    }
    const zoomedStyle20 = new sStyle({
      ...styleDefault
    });

    const zoomedStyle150 = new sStyle({
      ...styleDefault,
      image: new sCircle({
        radius: 7,
        fill: new sFill({
          color: '#008080'
        }),
      }),
      geometry: function (feature) {
        const type = feature.getGeometry().getType()
        if (type === "Polygon") return feature.getGeometry();
        else if(type === "MultiPolygon") return feature.getGeometry().getInteriorPoints();
        else if (type === "MultiPoint") return feature.getGeometry().getPoint(0);
        else if (type === "Point") return feature.getGeometry();
      }
    });

    const zoomedOutStyle = new sStyle({
      ...styleDefault,
      image: new sCircle({
        radius: 7,
        fill: new sFill({
          color: '#008080'
        }),
      }),
      geometry: function (feature) {
        const type = feature.getGeometry().getType()
        if (type === "Polygon") return feature.getGeometry();
        else if(type === "MultiPolygon") return feature.getGeometry().getInteriorPoints().getPoint(0);
        else if (type === "MultiPoint") return feature.getGeometry().getPoint(0);
        else if (type === "Point") return feature.getGeometry();
      }
    });

    const removeEvent = async (files) => {
      if (files.length === unref(uploadList).length) {
        unref(uploadSource).clear();
        uploadList.value = [];
        document
          .querySelectorAll("div.ol-tooltip.ol-tooltip-upload")
          .forEach((d) => {
            d.remove();
          });
        return;
      }
      files.forEach(async (file) => {
        const featureIndex = unref(uploadList).findIndex(
          (u) => u.file === file
        );
        const feature = unref(uploadSource)?.getFeatureById(
          unref(uploadList)[featureIndex].id
        );
        if (feature) {
          unref(uploadSource).removeFeature(feature);
          uploadList.value.splice(featureIndex, 1);
          document
            .querySelectorAll("div.ol-tooltip.ol-tooltip-upload")
          [featureIndex].remove();
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
      switch (rejectedEntries[0].failedPropValidation) {
        case "duplicate":
          $q.notify({
            type: "negative",
            message: "This file already imported!",
          });
          break;
        case "accept":
          $q.notify({
            type: "negative",
            message: "*.json file only!",
          });
          break;
        default:
          break;
      }
    };

    const detailFile = async (index) => {
      const layer = unref(map).getLayers().getArray().find((l) => {
        if (l instanceof VectorImageLayer && l.get('id') === unref(uploadList)[index].id)
          return l
      })
      if (layer) {
        unref(map).getView().fit(layer.getSource().getExtent(), {
          duration: 500,
          padding: [100, 100, 100, 100]
        })
      }
      // const feature = unref(uploadSource).getFeatureById(
      //   unref(uploadList)[index].id
      // );
      // if (feature) {
      //   const coordinate = feature.getGeometry().getLastCoordinate();
      //   const extent = feature.getGeometry().getExtent();
      //   const geoJsonData = await writeGeoJSON({ feature, map: unref(map) });
      //   unref(map)
      //     .getView()
      //     .fit(extent, {
      //       padding: [100, 100, 200, 300],
      //       duration: 100,
      //     });
      //   setTimeout(() => {
      //     const coordinateText = toStringHDMS(
      //       transform(
      //         coordinate,
      //         unref(map).getView().getProjection().getCode(),
      //         "EPSG:3857"
      //       )
      //     );
      //     captureScreenshot().then((response) => {
      //       $bus.emit("on-show-detail", {
      //         title: unref(uploadList)[index].file.name,
      //         type: LAYER_TYPE[1],
      //         content: geoJsonData,
      //         image: response,
      //         coordinate: coordinateText,
      //       });
      //       unref(map)
      //         .getView()
      //         .fit(extent, {
      //           padding: [100, 100, 100, 100],
      //           duration: 500,
      //         });
      //     });
      //     $bus.emit("on-show-detail", { content: geoJsonData });
      //   }, 150);
      // }
    };

    return {
      uploaderRef,
      map,
      location,
      checkFileType,
      preAddEvent,
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
</style>
