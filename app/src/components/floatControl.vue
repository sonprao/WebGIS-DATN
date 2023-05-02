<template>
  <q-page-sticky
    ref="stickyRef"
    class="sticky"
    position="top-left"
    :offset="[10, 10]"
  >
    <q-btn-group outline color="white" style="flex-direction: column; gap: 2px">
      <q-btn
        color="white"
        text-color="black"
        round
        icon="add"
        class="circle"
        @click="zoom('in')"
      >
        <q-tooltip>{{ $t("Zoom in") }}</q-tooltip>
      </q-btn>
      <q-space />
      <q-btn
        color="white"
        text-color="black"
        round
        icon="remove"
        class="circle"
        @click="zoom('out')"
      >
        <q-tooltip>{{ $t("Zoom out") }}</q-tooltip>
      </q-btn>
    </q-btn-group>
  </q-page-sticky>
  <q-page-sticky
    ref="stickyRef"
    class="sticky"
    position="top-left"
    :offset="[80, 10]"
  >
    <q-btn-toggle
      class="toogleClass"
      rounded
      no-caps
      clearable
      unelevated
      color="white"
      text-color="#666666"
      toggle-color="primary"
      v-model="model"
      :options="options"
      @update:model-value="selectControl"
      @clear="clearControl"
    >
    <template v-slot:one>
        <q-badge v-if="drawCount > 0 && geomType === 'LineString'" color="white" text-color="blue" floating>
          {{drawCount}}
        </q-badge>
        <q-tooltip>{{ $t("Distance") }}</q-tooltip>
      </template>

      <template v-slot:two>
        <q-icon name="img:icons/area.png" />
        <q-tooltip>{{ $t("Area") }}</q-tooltip>
        <q-badge v-if="drawCount > 0 && geomType === 'Polygon'" color="white" text-color="blue" floating>
          {{drawCount}}
        </q-badge>
      </template>

      <template v-slot:three>
        <q-tooltip>{{ $t("Current location") }}</q-tooltip>
      </template>
    </q-btn-toggle>

    <q-icon size="md" name="help_outline" style="cursor: pointer">
      <q-popup-proxy>
        <q-banner>
          <template v-slot:avatar>
            <!-- <q-icon name="straighten" /> -->
          </template>
          Double click on draw to set the sketch static.
        </q-banner>
        <q-banner>
          <template v-slot:avatar>
            <!-- <q-icon name="img:icons/area.png" /> -->
          </template>
          While draw, hold shift to draw more flexible.
        </q-banner>
      </q-popup-proxy>
      <q-tooltip>{{ $t("Help") }}</q-tooltip>
    </q-icon>
  </q-page-sticky>
</template>

<script>
import {
  ref,
  unref,
  onMounted,
  defineComponent,
  getCurrentInstance,
  computed,
} from "vue";
import { useQuasar } from "quasar";
import { i18n } from "boot/i18n.js";
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import Overlay from "ol/Overlay";
import { LineString, Polygon } from "ol/geom";
import { Draw } from "ol/interaction";
import { unByKey } from "ol/Observable";

import GeoLocationController from "src/utils/geoLocationController";
import { drawStyle, formatArea, formatLength } from "src/utils/measure";
const continueLineMsg = "Click to continue drawing the line";
const continuePolygonMsg = "Click to continue drawing the polygon";

export default defineComponent({
  name: "FloatControl",
  components: {},
  props: {
    map: {
      type: Object,
      default: () => ({}),
    },
    view: {
      type: Object,
      default: () => ({}),
    },
  },
  emits: ["closePopup"],
  setup(props, {emit}) {
    const vm = getCurrentInstance().proxy;
    const $q = useQuasar();
    const $t = i18n.global.t;
    const zoom = (direction) => {
      unref(props.map).getView().animate({
        zoom: unref(props.map).getView().getZoom() + (direction === 'in' ? 0.5 : -0.5),
        duration: 250,
      });
    };
    const model = ref();
    const options = [
      { icon: "straighten", value: "LineString", slot: "one" },
      { value: "Polygon", slot: "two" },
      { icon: "place", value: "place", slot: "three" },
    ];
    // geolocation
    const geoLocation = ref(null);
    // geolocation

    // measureToolTip
    const measureTooltipElement = ref(null);
    const measureTooltip = ref(null);
    const listener = ref(null);
    const helpTooltip = ref(null);
    const helpTooltipElement = ref(null);
    // measureToolTip

    // draw type
    const source = ref(new VectorSource({ wrapX: false }));
    const vector = ref(
      new VectorLayer({
        source: unref(source),
        style: {
          "fill-color": "rgba(255, 255, 255, 0.2)",
          "stroke-color": "#ffcc33",
          "stroke-width": 2,
          "circle-radius": 7,
          "circle-fill-color": "#ffcc33",
        },
      })
    );
    const sketch = ref(null);
    const draw = ref(null);
    const snap = ref(null);
    const drawCount = ref(0);
    const geomType = computed(() => unref(model))
    // draw type

    // draw event
    const drawStart = ref(null);
    const drawEnd = ref(null);
    const movePointer = ref(null);
    // draw event
    const pointerMoveHandler = function (evt) {
      if (evt.dragging) {
        return;
      }
      let helpMsg = "Click to start drawing";
      if (unref(sketch)) {
        const geom = unref(sketch).getGeometry();
        if (geom instanceof Polygon) {
          helpMsg = continuePolygonMsg;
        } else if (geom instanceof LineString) {
          helpMsg = continueLineMsg;
        }
      }
      helpTooltipElement.value.innerHTML = helpMsg;
      unref(helpTooltip).setPosition(evt.coordinate);
      unref(helpTooltipElement).classList.remove("hidden");
    };

    const selectControl = (val) => {
      if (!val) {
        emit('closePopup', false)
        unref(geoLocation).removeCurrentLocation()
        return
      }
      if (val !== 'place') {
        emit('closePopup', true)
        addInteraction(val);
        unref(geoLocation).removeCurrentLocation()
      }
      else {
        emit('closePopup', true)
        unref(geoLocation).getCurrentLocation()
      }
    };
    const clearControl = () => {
      // unbind event movePointer
      unByKey(unref(movePointer));
      // clear tooltip-static
      drawCount.value = 0;
      document.querySelectorAll("div.ol-tooltip-static").forEach((d) => {
        d.remove();
      });
      // sketch clear
      sketch.value = null;
      unref(props.map).removeInteraction(unref(draw));
      unref(props.map).removeInteraction(unref(snap));
      unref(props.map).removeLayer(unref(vector));
      draw.value = null;
      snap.value = null;
      source.value = new VectorSource({ wrapX: false });
      vector.value = new VectorLayer({
        source: unref(source),
        style: {
          "fill-color": "rgba(255, 255, 255, 0.2)",
          "stroke-color": "#ffcc33",
          "stroke-width": 2,
          "circle-radius": 7,
          "circle-fill-color": "#ffcc33",
        },
      });
    };
    const addInteraction = (type) => {
      if (unref(draw)) {
        clearControl();
      }
      if (!unref(props.map).getLayers().getArray().includes(unref(vector))) {
        unref(props.map).addLayer(unref(vector));
      }
      draw.value = new Draw({
        source: unref(source),
        type,
        style: drawStyle(),
      });
      drawStart.value = unref(draw).on("drawstart", function (evt) {
        // set sketch
        sketch.value = evt.feature;
        let tooltipCoord = evt.coordinate;
        listener.value = unref(sketch)
          .getGeometry()
          .on("change", function (evt) {
            const geom = evt.target;
            let output;
            if (geom instanceof Polygon) {
              output = formatArea(geom);
              tooltipCoord = geom.getInteriorPoint().getCoordinates();
            } else if (geom instanceof LineString) {
              output = formatLength(geom);
              tooltipCoord = geom.getLastCoordinate();
            }
            measureTooltipElement.value.innerHTML = output;
            unref(measureTooltip).setPosition(tooltipCoord);
          });
      });
      drawEnd.value = unref(draw).on("drawend", function () {
        const currentDocument = document.querySelectorAll("div.ol-tooltip-static")
        measureTooltipElement.value.className = `ol-tooltip ol-tooltip-static ${currentDocument.length}`;
        unref(measureTooltip).setOffset([0, -7]);
        // unset sketch
        sketch.value = null;
        // unset tooltip so that a new one can be created
        measureTooltipElement.value = null;
        createMeasureTooltip();
        unByKey(unref(listener));
        drawCount.value = document.querySelectorAll("div.ol-tooltip-static").length; 
      });

      unref(props.map).addInteraction(unref(draw));
      createMeasureTooltip();
      createHelpTooltip();
      movePointer.value = unref(props.map).on(
        "pointermove",
        pointerMoveHandler
      );
      unref(props.map)
        .getViewport()
        .addEventListener("mouseout", function () {
          unref(helpTooltipElement).classList.add("hidden");
        });

      // snap.value = new Snap({ source: source });
      // unref(props.map).addInteraction(unref(snap));
    };
    const createMeasureTooltip = () => {
      if (unref(measureTooltipElement)) {
        unref(measureTooltipElement)?.parentNode?.removeChild?.(
          unref(measureTooltipElement)
        );
      }
      measureTooltipElement.value = document.createElement("div");
      measureTooltipElement.value.className = "ol-tooltip ol-tooltip-measure";
      measureTooltip.value = new Overlay({
        element: unref(measureTooltipElement),
        offset: [0, -15],
        positioning: "bottom-center",
        stopEvent: false,
        insertFirst: false,
      });
      unref(props.map).addOverlay(unref(measureTooltip));
    };
    const createHelpTooltip = () => {
      if (unref(helpTooltipElement)) {
        unref(helpTooltipElement)?.parentNode?.removeChild?.(
          unref(helpTooltipElement)
        );
      }
      helpTooltipElement.value = document.createElement("div");
      helpTooltipElement.value.className = "ol-tooltip hidden";
      helpTooltip.value = new Overlay({
        element: unref(helpTooltipElement),
        offset: [15, 0],
        positioning: "center-left",
      }); //
      unref(props.map).addOverlay(unref(helpTooltip));
    };

    onMounted(() => {
      vm.$nextTick(() => {
        geoLocation.value = new GeoLocationController({
          map: unref(props.map),
          view: unref(props.view)
        })
      });
    });
    return {
      vm,
      zoom,
      model,
      options,
      drawCount,
      geomType,
      selectControl,
      clearControl,
    };
  },
});
</script>
<style scoped>
html,
body {
  width: 100%;
  height: 100%;
}

.sticky {
  z-index: 1;
}

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

.ol-tooltip-measure {
  opacity: 1;
  font-weight: bold;
}

.ol-tooltip-static {
  background-color: #ffcc33;
  color: black;
  border: 1px solid white;
}

.ol-tooltip-measure:before,
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
  border-top-color: #ffcc33;
}
</style>
