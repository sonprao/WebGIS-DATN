<template>
  <div class="q-pa-md">
    <q-table
      class="tableLocationClass"
      v-bind="tableProps"
      title="Treats"
      v-model:rows="locationRows"
      :columns="locationColumns"
      v-model:pagination="locationPagination"
      :visible-columns="visibleLocationColumns"
      :filter="filter"
    >
      <template v-slot:top>
        <q-select
          v-model="visibleLocationColumns"
          :display-value="$t('Columns')"
          :options="locationColumns"
          dense
          multiple
          outlined
          emit-value
          map-options
          options-cover
          options-dense
          option-value="name"
          style="min-width: 150px"
        />
        <q-btn rounded color="primary" icon="add" style="margin-left: 10px">
          <q-tooltip anchor="center right" self="center start">{{
            $t("Add location")
          }}</q-tooltip>
          <PopupLocation
            v-model:row="newLocation"
            :location-rows="locationRows"
            :projections="projections"
          />
        </q-btn>
        <q-space />
        <q-input debounce="300" color="primary" v-model="filter">
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </template>
      <template v-slot:body="propsLocation">
        <q-tr :props="propsLocation">
          <q-td
            v-for="_key in ['id', 'name', 'description']"
            :key="_key"
            :props="propsLocation"
          >
            {{ propsLocation.row[_key] }}
          </q-td>
          <q-td
            v-for="_key in ['longitude', 'latitude']"
            :key="_key"
            :props="propsLocation"
          >
            {{ propsLocation.row?.view?.[_key] }}
          </q-td>
          <q-td key="workspace" :props="propsLocation">
            {{ propsLocation.row.workspace }}
          </q-td>
          <q-td key="projection" :props="propsLocation">
            {{ propsLocation.row.view?.projection?.name }}
          </q-td>
          <q-td key="layer" :props="propsLocation">
            <q-btn
              v-bind="actionButtonProps"
              @click="
                () => {
                  if (
                    !propsLocation.expand &&
                    !propsLocation.row.mapLayers?.length
                  ) {
                    getLayerRows({ locationId: propsLocation.row.id }).then(
                      (res) => {
                        propsLocation.row.mapLayers = res;
                        propsLocation.expand = !propsLocation.expand;
                      }
                    );
                  } else {
                    propsLocation.expand = !propsLocation.expand;
                  }
                }
              "
              :icon="propsLocation.expand ? 'expand_less' : 'expand_more'"
            />
          </q-td>
          <q-td key="action" :props="propsLocation">
            <q-btn
              v-bind="actionButtonProps"
              icon="edit"
              style="margin-right: 10px"
            >
              <!-- popup location edit -->
              <PopupLocation
                v-model:row="propsLocation.row"
                :location-rows="locationRows"
                :projections="projections"
              />
            </q-btn>
            <q-btn
              v-bind="{ ...actionButtonProps, color: 'red' }"
              icon="delete"
              @click="onDeleteLocation(propsLocation.row)"
            >
            </q-btn>
          </q-td>
        </q-tr>
        <q-tr v-show="propsLocation.expand" :props="propsLocation">
          <q-td colspan="100%" v-if="propsLocation.expand">
            <!-- layer table -->
            <q-table
              class="tableLayerClass"
              v-bind="{ ...tableProps, cardClass: 'bg-primary text-white' }"
              virtual-scroll
              style="max-height: 800px"
              :virtual-scroll-sticky-size-start="48"
              :columns="layerColumns"
              :rows="propsLocation?.row?.mapLayers"
              v-model:pagination="layerPagination"
            >
              <!-- layer header -->
              <template v-slot:top>
                <div class="text-h6 text-white">{{ $t("Layers") }}</div>
                <q-btn
                  class="bg-white text-primary"
                  rounded
                  icon="add"
                  style="margin-left: 10px"
                >
                  <q-tooltip anchor="center right" self="center start">{{
                    $t("Add layer")
                  }}</q-tooltip>
                  <popupLayer
                    v-model:row="newLayer"
                    :layer-rows="propsLocation?.row?.mapLayers"
                    :location="propsLocation.row"
                  />
                </q-btn>
                <q-space />
                <q-input debounce="300" class="bg-white" color="black">
                  <template v-slot:append>
                    <q-icon name="search" />
                  </template>
                </q-input>
              </template>

              <template v-slot:body="propsLayer">
                <q-tr :props="propsLayer">
                  <q-td
                    v-for="_key of ['id', 'name', 'description']"
                    :key="_key"
                    :props="propsLayer"
                  >
                    {{ propsLayer.row[_key] }}
                  </q-td>
                  <q-td key="type" :props="propsLayer">
                    <q-badge
                      v-if="propsLayer.row.type === LAYER_TYPE[0]"
                      class="bg-white text-green"
                    >
                      {{ propsLayer.row.type }}
                    </q-badge>
                    <q-badge v-else class="bg-white text-orange">
                      {{ propsLayer.row.type }}
                    </q-badge>
                  </q-td>
                  <q-td key="url" :props="propsLayer" auto-width>
                    <q-btn push color="white" text-color="primary" icon="link">
                      <q-popup-proxy
                        style="width: 500px; word-wrap: break-word"
                        :ref="`popupRef${propsLayer.row.id}`"
                        @show="showPopup(`popupRef${propsLayer.row.id}`)"
                        @hide="showPopup(null)"
                      >
                        <q-banner>
                          {{
                            geoServerUrl({
                              url: propsLayer.row.url,
                              workspace: propsLocation.row.workspace,
                            })
                          }}
                        </q-banner>
                      </q-popup-proxy>
                    </q-btn>
                  </q-td>
                  <q-td key="feature" :props="propsLayer">
                    <q-btn
                      size="sm"
                      class="bg-white text-primary"
                      round
                      dense
                      @click="
                        () => {
                          if (
                            !propsLayer.expand &&
                            !propsLayer.row.features?.length
                          ) {
                            getFeatureRows({ layerId: propsLayer.row.id }).then(
                              (res) => {
                                propsLayer.row.features = res;
                                propsLayer.expand = !propsLayer.expand;
                              }
                            );
                          } else {
                            propsLayer.expand = !propsLayer.expand;
                          }
                        }
                      "
                      :icon="propsLayer.expand ? 'expand_less' : 'expand_more'"
                    />
                  </q-td>
                  <q-td key="action" :props="propsLayer">
                    <q-btn
                      v-bind="{
                        ...actionButtonProps,
                        color: 'white',
                        textColor: 'primary',
                        icon: 'edit',
                      }"
                      style="margin-right: 10px"
                    >
                      <!-- popup layer edit -->
                      <popupLayer
                        v-model:row="propsLayer.row"
                        :layer-rows="propsLocation?.row?.mapLayers"
                      />
                    </q-btn>
                    <q-btn
                      v-bind="{
                        ...actionButtonProps,
                        color: 'white',
                        textColor: 'red',
                        icon: 'delete',
                      }"
                      @click="onDeleteLayer(propsLayer.row)"
                    >
                    </q-btn>
                  </q-td>
                </q-tr>
                <q-tr v-show="propsLayer.expand" :props="propsLayer">
                  <q-td colspan="100%" v-if="propsLayer.expand">
                    <!-- feature table -->
                    <q-table
                      class="tableFeatureClass"
                      v-bind="tableProps"
                      virtual-scroll
                      hide-pagination
                      style="max-height: 500px"
                      :virtual-scroll-sticky-size-start="48"
                      :columns="featureColumns"
                      :rows="propsLayer.row.features"
                      v-model:pagination="featurePagination"
                    >
                      <template v-slot:top>
                        <div class="text-h6">{{ $t("Features") }}</div>
                        <q-btn
                          class="bg-primary text-white"
                          rounded
                          icon="add"
                          style="margin-left: 10px"
                        >
                          <q-tooltip
                            anchor="center right"
                            self="center start"
                            >{{ $t("Add feature") }}</q-tooltip
                          >
                          <popupFeature
                            v-model:row="newFeature"
                            :feature-rows="propsLayer.row.features"
                            :layer="propsLayer.row"
                          />
                        </q-btn>
                        <q-space />
                        <q-input debounce="300" class="bg-white" color="black">
                          <template v-slot:append>
                            <q-icon name="search" />
                          </template>
                        </q-input>
                      </template>
                      <template v-slot:body="propsFeature">
                        <q-tr :props="propsFeature">
                          <q-td
                            v-for="_key of ['id', 'name']"
                            :key="_key"
                            :props="propsFeature"
                          >
                            {{ propsFeature.row[_key] }}
                          </q-td>
                          <q-td key="properties" :props="propsFeature">
                            {{ propsFeature.row.properties }}
                          </q-td>
                          <q-td key="action" :props="propsFeature">
                            <q-btn
                              v-bind="actionButtonProps"
                              icon="edit"
                              style="margin-right: 10px"
                            >
                              <!-- popup feature edit -->
                              <popupFeature
                                v-model:row="propsFeature.row"
                                :feature-rows="propsLayer.row.features"
                              />
                            </q-btn>
                            <q-btn
                              v-bind="{ ...actionButtonProps, color: 'red' }"
                              icon="delete"
                              @click="onDeleteLocation(props.row)"
                            >
                            </q-btn>
                          </q-td>
                        </q-tr>
                      </template>
                    </q-table>
                    <!-- feature pagination -->
                    <q-pagination
                      input
                      style="place-content: center"
                      v-model="featurePagination.page"
                      @update:model-value="
                        (val) => {
                          getFeatureRows({
                            val,
                            layerId: propsLayer.row.id,
                          }).then((res) => (propsLayer.row.features = res));
                        }
                      "
                      :max="featurePagination.rowsNumber"
                      boundary-numbers
                      direction-links
                      flat
                      color="grey"
                      active-color="primary"
                    />
                  </q-td>
                </q-tr>
              </template>
            </q-table>
            <!-- layer pagination -->
            <q-pagination
              input
              style="place-content: center"
              v-model="layerPagination.page"
              @update:model-value="
                getLayerRows({
                  val: $event,
                  locationId: propsLocation.row.id,
                }).then((response) => {
                  propsLocation.row.mapLayers = response;
                })
              "
              :max="layerPagination.rowsNumber"
              boundary-numbers
              direction-links
              flat
              color="grey"
              active-color="primary"
            />
          </q-td>
        </q-tr>
      </template>
    </q-table>
    <!-- location pagination -->
    <q-pagination
      input
      style="place-content: center"
      v-model="locationPagination.page"
      @update:model-value="getAll"
      :max="locationPagination.rowsNumber"
      boundary-numbers
      direction-links
      flat
      color="grey"
      active-color="primary"
    />
  </div>
</template>

<script>
import {
  defineComponent,
  ref,
  unref,
  getCurrentInstance,
  onMounted,
  computed,
} from "vue";
import { useQuasar } from "quasar";
import { i18n } from "boot/i18n.js";
import { LAYER_TYPE } from "src/constants/enum";
import {
  deleteLocation,
  getAllLocation,
  updateLocation,
  addLocaction,
} from "src/api/location";
import { getLayerByLocation } from "src/api/mapLayer";
import { getFeaturesByLayer } from "src/api/feature";
import { getAllProjection } from "src/api/projection";
import PopupLocation from "src/components/managementPage/popupLocation.vue";
import PopupLayer from "src/components/managementPage/popupLayer.vue";
import PopupFeature from "src/components/managementPage/popupFeature.vue";
export default defineComponent({
  name: "LocationManagementPage",
  components: {
    PopupLocation,
    PopupLayer,
    PopupFeature,
  },
  setup() {
    const vm = getCurrentInstance().proxy;
    const $q = useQuasar();
    const $t = i18n.global.t;
    const actionButtonProps = {
      size: "sm",
      color: "primary",
      round: true,
      dense: true,
    };
    const tableProps = {
      flat: true,
      bordered: true,
      "wrap-cells": true,
      "hide-pagination": true,
      "row-key": "name",
    };
    const filter = ref("");
    const visibleLocationColumns = ref([
      "name",
      "description",
      "longitude",
      "latitude",
      "workspace",
      "projection",
      "layer",
      "action",
    ]);
    const locationColumns = computed(() => [
      {
        name: "id",
        required: true,
        label: "Id",
        align: "left",
        field: "id",
        style: "min-width: 90px; width: 90px",
      },
      {
        name: "name",
        align: "center",
        label: $t("Name"),
        field: "name",
        sortable: true,
      },
      {
        name: "description",
        align: "center",
        label: $t("Description"),
        field: "description",
      },
      {
        name: "longitude",
        align: "center",
        label: $t("Longitude"),
        field: "longitude",
        sortable: true,
      },
      {
        name: "latitude",
        align: "center",
        label: $t("Latitude"),
        field: "latitude",
        sortable: true,
      },
      {
        name: "workspace",
        align: "center",
        label: $t("Workspace"),
        field: "workspace",
      },
      {
        name: "projection",
        align: "center",
        label: $t("Projection"),
        field: "projection",
        sortable: true,
      },
      {
        name: "layer",
        align: "center",
        label: $t("Layers"),
        field: "mapLayers",
        style: "min-width: 90px; width: 90px",
      },
      {
        name: "action",
        align: "center",
        label: $t("Action"),
        sortable: true,
      },
    ]);
    const layerColumns = computed(() => [
      {
        name: "id",
        required: true,
        label: "Id",
        align: "left",
        field: (row) => row.id,
        format: (val) => `${val}`,
      },
      {
        name: "name",
        align: "center",
        label: $t("Name"),
        field: "name",
        sortable: true,
      },
      {
        name: "description",
        align: "center",
        label: $t("Description"),
        field: "description",
        sortable: true,
      },
      {
        name: "type",
        align: "center",
        label: $t("Layer type"),
        field: "type",
        sortable: true,
      },
      {
        name: "url",
        align: "center",
        style: "min-width: 160px; width: 160px",
        label: $t("Url"),
        field: "url",
      },
      {
        name: "feature",
        align: "center",
        label: $t("Features"),
      },
      {
        name: "action",
        align: "center",
        label: $t("Action"),
      },
    ]);
    const featureColumns = computed(() => [
      {
        required: true,
        name: "id",
        label: "Id",
        field: "id",
        align: "center",
        style: "min-width: 90px; width: 90px;",
      },
      {
        name: "name",
        align: "center",
        label: $t("Feature name"),
        field: "name",
      },
      { name: "properties", align: "center", label: $t("Properties") },
      { name: "action", align: "center", label: $t("Action") },
    ]);
    const locationPagination = ref({
      page: 1,
      rowsPerPage: 10,
      rowsNumber: 0,
    });
    const layerPagination = ref({
      page: 1,
      rowsPerPage: 10,
      rowsNumber: 0,
    });
    const featurePagination = ref({
      page: 1,
      rowsPerPage: 10,
      rowsNumber: 0,
    });
    const getLayerRows = async ({ val, locationId }) => {
      const response = await getLayerByLocation({
        locationId,
        per_page: unref(layerPagination).rowsPerPage,
        page: unref(layerPagination).page,
      });
      if (response) {
        layerPagination.value.rowsNumber = parseInt(
          Math.ceil(response.count / response.per_page)
        );
        layerPagination.value.page = response.page;
        layerPagination.value.rowsPerPage = response.per_page;

        return response.data;
      } else return [];
    };
    const getFeatureRows = async ({ val = 1, layerId }) => {
      const response = await getFeaturesByLayer({
        layerId: layerId,
        per_page: unref(featurePagination).rowsPerPage,
        page: unref(featurePagination).page,
      });
      if (response) {
        featurePagination.value.rowsNumber = parseInt(
          Math.ceil(response.count / response.per_page)
        );
        featurePagination.value.page = response.page;
        featurePagination.value.rowsPerPage = response.per_page;
        return response.data;
      } else return [];
    };
    const geoServerUrl = ({ url, workspace }) => {
      return `${process.env.GEO_SERVER_URL}/${workspace}/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=${url}&maxFeatures=52000&outputFormat=application%2Fjson`;
    };
    const onDeleteLocation = async (row) => {
      const resolve = async () => {
        await getAll();
      };
      const res = await deleteLocation(row, resolve);
    };
    const onDeleteLayer = async (row) => {};
    const onDeleteFeature = async (row) => {};
    const scrollTable = ref(null);
    const currentPopupRef = ref(null);
    const showPopup = (ref) => {
      currentPopupRef.value = ref;
      if (unref(scrollTable)) {
        scrollTable.value.removeEventListener("scroll", () => {
          if (unref(currentPopupRef)) vm.$refs[unref(currentPopupRef)].hide();
        });
      }
      scrollTable.value = document.querySelector(
        "div.q-table__middle.q-virtual-scroll"
      );
      scrollTable.value.addEventListener("scroll", () => {
        if (unref(currentPopupRef)) vm.$refs[unref(currentPopupRef)].hide();
      });
    };

    const getAll = async (val) => {
      const query = {
        page: val ? val : unref(locationPagination).page,
        per_page: unref(locationPagination).rowsPerPage,
        search: "",
      };
      const response = await getAllLocation(query);
      locationRows.value = response.data;
      locationPagination.value.page = response.page;
      locationPagination.value.rowsPerPage = response.per_page;
      locationPagination.value.rowsNumber = parseInt(
        Math.ceil(response.count / response.per_page)
      );
    };
    const newLocation = ref({
      name: null,
      description: null,
      view: {
        longitude: null,
        latitude: null,
        projection: {
          name: null,
        },
      },
    });
    const newLayer = ref({
      name: null,
      description: null,
      type: null,
      url: null,
      locationId: null,
    });
    const newFeature = ref({
      name: null,
      properties: null,
    });
    const locationRows = ref([]);
    const projections = ref([]);
    onMounted(async () => {
      await getAll();
      getAllProjection()
        .then((response) => {
          projections.value = response.data;
        })
        .catch(() => {
          projections.value = [];
        });
    });

    return {
      tableProps,
      actionButtonProps,
      filter,
      getAll,
      visibleLocationColumns,
      locationColumns,
      layerColumns,
      featureColumns,
      getLayerRows,
      getFeatureRows,
      locationRows,
      locationPagination,
      layerPagination,
      featurePagination,
      geoServerUrl,
      newLocation,
      newLayer,
      newFeature,
      onDeleteLocation,
      onDeleteLayer,
      onDeleteFeature,
      currentPopupRef,
      showPopup,
      projections,
      LAYER_TYPE: LAYER_TYPE,
    };
  },
});
</script>
<style lang="scss" scoped>
.tableLocationClass {
  ::-webkit-scrollbar {
    height: 12px;
    width: 14px;
    background: rgb(25, 118, 210, 0.25);
    z-index: 12;
    overflow: visible;
  }

  ::-webkit-scrollbar-thumb {
    width: 10px;
    background-color: $primary;
    border-radius: 10px;
    z-index: 12;
    border: 4px solid rgba(0, 0, 0, 0);
    background-clip: padding-box;
    transition: background-color 0.32s ease-in-out;
    margin: 4px;
    min-height: 32px;
    min-width: 32px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: $primary;
  }
}

.tableLayerClass {
  ::-webkit-scrollbar {
    height: 12px;
    width: 14px;
    background: rgba(255, 255, 255, 0.25);
    z-index: 12;
    overflow: visible;
  }

  ::-webkit-scrollbar-thumb {
    width: 10px;
    background-color: white;
    border-radius: 10px;
    z-index: 12;
    border: 4px solid rgba(0, 0, 0, 0);
    background-clip: padding-box;
    transition: background-color 0.32s ease-in-out;
    margin: 4px;
    min-height: 32px;
    min-width: 32px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: white;
  }
}

.tableFeatureClass {
  ::-webkit-scrollbar {
    height: 12px;
    width: 14px;
    background: rgb(25, 118, 210, 0.25);

    z-index: 12;
    overflow: visible;
  }

  ::-webkit-scrollbar-thumb {
    width: 10px;
    background-color: $primary;
    border-radius: 10px;
    z-index: 12;
    border: 4px solid rgba(0, 0, 0, 0);
    background-clip: padding-box;
    transition: background-color 0.32s ease-in-out;
    margin: 4px;
    min-height: 32px;
    min-width: 32px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: $primary;
  }
}
.deleteWarningClass {
  .q-card__section.q-card__section--vert.q-dialog__title {
    color: orange !important;

    &::before {
      content: "\26A0" !important;
    }
  }
}

.popupEdit {
  color: #1976d2;
  width: 50%;
  right: 200px;
  left: 25% !important;
}
</style>
