<template>
  <q-page-sticky class="sticky" position="top-left" :offset="[10, 10]">
    <q-card class="my-card" flat bordered style="width: 250px">
      <q-tabs v-model="tab" class="text-primary">
        <q-tab
          label="Tab one"
          name="one"
          @click="
            () => {
              expanded = true;
            }
          "
        />
        <q-tab
          label="Tab two"
          name="two"
          @click="
            () => {
              expanded = true;
            }
          "
        />
        <q-btn
          flat
          dense
          color="grey"
          :icon="expanded ? 'keyboard_arrow_up' : 'keyboard_arrow_down'"
          style="height: 100%"
          @click="expanded = !expanded"
        />
      </q-tabs>
      <q-separator />
      <q-slide-transition>
        <div v-show="expanded">
          <q-tab-panels v-model="tab" animated>
            <q-tab-panel name="one" style="padding: 0; display: grid">
              <q-btn-toggle
                class="toogleClass"
                style="margin: 10px; place-self: center"
                no-caps
                clearable
                color="white"
                text-color="#666666"
                toggle-color="primary"
                v-model="buttonModel"
                :options="options"
                @update:model-value="selectControl"
                @clear="clearControl"
              >
                <template v-slot:one>
                  <q-badge
                    v-if="lineStringCount > 0"
                    color="yellow"
                    text-color="white"
                    floating
                  >
                    {{ lineStringCount }}
                  </q-badge>
                  <q-tooltip>{{ $t("Distance") }}</q-tooltip>
                </template>

                <template v-slot:two>
                  <q-icon name="img:icons/area.png" />
                  <q-tooltip>{{ $t("Area") }}</q-tooltip>
                  <q-badge
                    v-if="polygonCount > 0"
                    color="yellow"
                    text-color="white"
                    floating
                    dense
                  >
                    {{ polygonCount }}
                  </q-badge>
                </template>

                <template v-slot:three>
                  <q-tooltip>{{ $t("Current location") }}</q-tooltip>
                </template>
              </q-btn-toggle>
              <q-separator />
              <q-list overlay v-if="drawList.length > 0">
                <q-scroll-area
                  class="drawListClass"
                  :style="`height: ${drawList.length * 65}px;`"
                >
                  <q-item
                    v-for="(item, index) of drawList"
                    :key="index"
                    clickable
                    @click="zoomToDraw(item.position)"
                  >
                    <q-item-section avatar>
                      <q-icon :name="item.icon" />
                    </q-item-section>

                    <q-item-section>
                      <q-item-label>
                        <span v-html="item.text"></span>
                      </q-item-label>
                      <q-item-label caption>
                        {{ item.time }}
                      </q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <div class="text-grey-8 q-gutter-xs">
                        <q-btn
                          class="gt-xs"
                          size="12px"
                          color="red"
                          flat
                          dense
                          round
                          icon="delete"
                          @click.stop="deleteDraw(index)"
                        />
                      </div>
                    </q-item-section>
                    <q-separator />
                  </q-item>
                </q-scroll-area>
                <q-separator />
                <q-btn
                  flat
                  dense
                  color="grey"
                  icon="delete"
                  style="float: right"
                  @click="deleteDraw()"
                />
              </q-list>
            </q-tab-panel>

            <q-tab-panel name="two">
              With so much content to display at once, and often so little
              screen real-estate, Cards have fast become the design pattern of
              choice for many companies, including the likes of Google and
              Twitter.
            </q-tab-panel>
          </q-tab-panels>
        </div>
      </q-slide-transition>
    </q-card>
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
  setup(props, { emit }) {
    const vm = getCurrentInstance().proxy;
    const $q = useQuasar();
    const $t = i18n.global.t;
    const continueLineMsg = computed(() =>
      $t("Click to continue drawing the line")
    );
    const continuePolygonMsg = computed(() =>
      $t("Click to continue drawing the polygon")
    );

    const tab = ref("one");
    const buttonModel = ref();
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
    const drawList = ref([]);
    const lineStringCount = computed(
      () => unref(drawList).filter((draw) => draw.type === "LineString").length
    );
    const polygonCount = computed(
      () => unref(drawList).filter((draw) => draw.type === "Polygon").length
    );
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
      let helpMsg = $t("Click to start drawing");
      if (unref(sketch)) {
        const geom = unref(sketch).getGeometry();
        if (geom instanceof Polygon) {
          helpMsg = unref(continuePolygonMsg);
        } else if (geom instanceof LineString) {
          helpMsg = unref(continueLineMsg);
        }
      }
      helpTooltipElement.value.innerHTML = helpMsg;
      unref(helpTooltip).setPosition(evt.coordinate);
      unref(helpTooltipElement).classList.remove("hidden");
    };

    const selectControl = (val) => {
      if (!val) {
        emit("closePopup", false);
        $bus.emit('close-popup', false);
        unref(geoLocation).removeCurrentLocation();
        return;
      }
      if (val !== "place") {
        emit("closePopup", true);
        $bus.emit('close-popup', true);
        addInteraction(val);
        unref(geoLocation).removeCurrentLocation();
      } else {
        emit("closePopup", true);
        $bus.emit('close-popup', true);
        unref(geoLocation).getCurrentLocation();
      }
    };
    const clearControl = () => {
      // unbind event movePointer
      unByKey(unref(movePointer));
      // clear tooltip-static
      // document.querySelectorAll("div.ol-tooltip-static").forEach((d) => {
      //   d.remove();
      // });
      // sketch clear
      sketch.value = null;
      unref(props.map).removeInteraction(unref(draw));
      unref(props.map).removeInteraction(unref(snap));
      // unref(props.map).removeLayer(unref(vector));
      draw.value = null;
      snap.value = null;
      // source.value = new VectorSource({ wrapX: false });
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
            let type;
            if (geom instanceof Polygon) {
              type = "Polygon";
              output = formatArea(geom);
              tooltipCoord = geom.getInteriorPoint().getCoordinates();
            } else if (geom instanceof LineString) {
              output = formatLength(geom);
              type = "LineString";
              tooltipCoord = geom.getLastCoordinate();
            }
            measureTooltipElement.value.innerHTML = output;
            unref(measureTooltip).setPosition(tooltipCoord);
          });
      });
      drawEnd.value = unref(draw).on("drawend", function (evt) {
        const time = new Date().toLocaleString();
        evt.feature.setId(time);
        const currentDocument = document.querySelectorAll(
          "div.ol-tooltip-static"
        );
        measureTooltipElement.value.className = `ol-tooltip ol-tooltip-static ${currentDocument.length}`;
        const geometryType = unref(sketch).getGeometry();
        // if (geometryType instanceof LineString) {
        //   lineStringCount.value = unref(lineStringCount) + 1;
        // } else if (geometryType instanceof Polygon) {
        //   polygonCount.value = unref(polygonCount) + 1;
        // }
        drawList.value[unref(drawList).length] = {
          text: measureTooltipElement.value.innerHTML,
          type: geometryType instanceof LineString ? "LineString" : "Polygon",
          icon:
            geometryType instanceof LineString
              ? "straighten"
              : "img:icons/area.png",
          time,
          id: time,
          position: evt.feature.getGeometry().getExtent(),
        };
        unref(measureTooltip).setOffset([0, -7]);
        // unset sketch
        sketch.value = null;
        // unset tooltip so that a new one can be created
        measureTooltipElement.value = null;
        createMeasureTooltip();
        unByKey(unref(listener));
        // drawCount.value = document.querySelectorAll(
        //   "div.ol-tooltip-static"
        // ).length;
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
    const zoomToDraw = (position) => {
      props.map.getView().fit(position, {
        padding: [100, 100, 100, 100],
        duration: 1000,
      });
    };
    const deleteDraw = (index = -1) => {
      if (index !== -1) {
        const feature = unref(source).getFeatureById(unref(drawList)[index].id);
        if (feature) {
          unref(source).removeFeature(feature);
        }
        drawList.value.splice(index, 1);
        document.querySelectorAll("div.ol-tooltip-static")[index].remove();
      } else {
        unref(source).clear();
        document
          .querySelectorAll("div.ol-tooltip-static")
          .forEach((d, idex) => {
            d.remove();
          });
        drawList.value = [];
      }
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
          view: unref(props.view),
        });
      });
    });
    return {
      vm,
      tab,
      buttonModel,
      options,
      drawList,
      expanded: ref(false),
      lineStringCount,
      polygonCount,
      selectControl,
      clearControl,
      zoomToDraw,
      deleteDraw,
    };
  },
});
</script>
<style lang="scss">
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

.drawListClass {
  // max-height: 262px;
  max-height: 400px;
  max-width: 300px;

  .q-scrollarea__content.absolute {
    display: flex;
    flex-direction: column-reverse;
  }
}
</style>
