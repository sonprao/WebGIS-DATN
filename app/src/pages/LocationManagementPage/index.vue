<template>
  <div class="q-pa-md">
    <q-table
      class="tableLocationClass"
      v-bind="tableProps"
      title="Treats"
      v-model:rows="locationRows"
      :columns="locationColumns"
      row-key="name"
      v-model:pagination="pagination"
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
        <q-btn rounded icon="add" style="margin-left: 10px">
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
              @click="propsLocation.expand = !propsLocation.expand"
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
              hide-pagination
              row-key="name"
              style="max-height: 600px"
              :virtual-scroll-sticky-size-start="48"
              title="Layers"
              :columns="layerColumns"
              :rows="propsLocation?.row?.mapLayers"
              v-model:pagination="pagination"
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
                    <q-badge class="bg-white text-green">
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
                          {{ propsLayer.row.url }}
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
                          propsLayer.expand = !propsLayer.expand;
                          if (propsLayer.expand) {
                            getFeatureRows(propsLayer.row.id).then(
                              (res) => (propsLayer.row.features = res)
                            );
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
                      row-key="name"
                      style="max-height: 450px"
                      :virtual-scroll-sticky-size-start="48"
                      title="Features"
                      :columns="featureColumns"
                      :rows="propsLayer.row.features"
                      v-model:pagination="pagination"
                    >
                      <template v-slot:body="props">
                        <q-tr :props="props">
                          <q-td
                            v-for="_key of ['id', 'name']"
                            :key="_key"
                            :props="props"
                          >
                            {{ props.row[_key] }}
                          </q-td>
                          <q-td key="properties" :props="props">
                            {{ props.row.properties }}
                          </q-td>
                          <q-td key="action" :props="props">
                            <q-btn
                              v-bind="actionButtonProps"
                              icon="edit"
                              style="margin-right: 10px"
                            >
                              <!-- popup feature edit -->
                              <q-popup-edit
                                class="popupEdit shadow-10"
                                v-model="props.row"
                                :title="`${$t('Update feature')}: ${
                                  props.row.name
                                }`"
                                buttons
                                :label-set="$t('Save')"
                                :label-cancel="$t('Cancel')"
                                @save="saveEdit"
                                v-slot="scope"
                              >
                                <q-input
                                  v-model="scope.value.name"
                                  dense
                                  autofocus
                                  :label="$t('Name')"
                                />
                                <q-input
                                  v-model="scope.value.properties"
                                  dense
                                  autofocus
                                  :label="$t('Properties')"
                                />
                              </q-popup-edit>
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
                  </q-td>
                </q-tr>
              </template>
            </q-table>
          </q-td>
        </q-tr>
      </template>
    </q-table>
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
import {
  deleteLocation,
  getAllLocation,
  updateLocation,
  addLocaction,
} from "src/api/location";
import { getFeaturesByLayer } from "src/api/feature";
import { getAllProjection } from "src/api/projection";
import PopupLocation from "src/pages/locationManagementPage/popupLocation.vue";
import PopupLayer from "src/pages/locationManagementPage/popupLayer.vue";
export default defineComponent({
  name: "LocationManagementPage",
  components: {
    PopupLocation,
    PopupLayer,
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
        style: "min-width: 100px; width: 100px",
        label: $t("Description"),
        field: "description",
        sortable: true,
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
        sortable: true,
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
        sortable: true,
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
    const featurePagination = ref({
      page: 1,
      rowsPerPage: 10,
      rowsNumber: 0,
    });
    const getFeatureRows = async (layerId) => {
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
    const formatLongLat = (center) => {
      const _center = JSON.parse(center ?? "{}");
      return _center;
    };
    const onDeleteLocation = async (row) => {
      const resolve = async () => {
        locationRows.value = await getAll();
      }
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

    const getAll = async () => {
      const query = {
        page: 1,
        per_page: 10,
        // search: 'namm'.replace(/[^a-zA-Z0-9\s]/g, ''),
      };
      const response = await getAllLocation(query);
      return response;
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
    const locationRows = ref([]);
    const projections = ref([]);
    const pagination = ref({
      rowsPerPage: 0,
    });
    onMounted(async () => {
      const allLocation = await getAll();
      getAllProjection()
        .then((response) => {
          projections.value = response;
        })
        .catch(() => {
          projections.value = [];
        });
      locationRows.value = allLocation;
    });

    return {
      tableProps,
      actionButtonProps,
      filter,
      visibleLocationColumns,
      locationColumns,
      layerColumns,
      featureColumns,
      getFeatureRows,
      locationRows,
      newLocation,
      pagination,
      formatLongLat,
      onDeleteLocation,
      onDeleteLayer,
      onDeleteFeature,
      currentPopupRef,
      showPopup,
      projections,
    };
  },
});
</script>
<style lang="scss">
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

.q-card__section.q-card__section--vert.q-dialog__title {
  color: orange;

  &::before {
    content: "\26A0";
  }
}

.popupEdit {
  color: #1976d2;
  width: 50%;
  right: 200px;
  left: 25% !important;
}
</style>
