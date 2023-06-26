<template>
  <div class="q-pa-md">
    <q-table
      flat
      bordered
      wrap-cells
      title="Treats"
      v-model:rows="locationRows"
      :columns="locationColumns"
      row-key="name"
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
        <q-space />
        <q-input debounce="300" color="primary" v-model="filter">
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </template>
      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td key="id" :props="props">
            {{ props.row.id }}
          </q-td>
          <q-td key="name" :props="props">
            {{ props.row.name }}
          </q-td>
          <q-td key="description" :props="props">
            {{ props.row.description }}
          </q-td>
          <q-td key="longitude" :props="props">
            {{ props.row?.view?.longitude }}
          </q-td>
          <q-td key="latitude" :props="props">
            {{ props.row?.view?.latitude }}
          </q-td>
          <q-td key="workspace" :props="props">
            {{ props.row.workspace }}
          </q-td>
          <q-td key="layer" :props="props">
            <q-btn
              v-if="props.row.mapLayers.length > 0"
              size="sm"
              color="primary"
              round
              dense
              @click="props.expand = !props.expand"
              :icon="props.expand ? 'expand_less' : 'expand_more'"
            />
          </q-td>
          <q-td key="action" :props="props">
            <q-btn
              size="sm"
              color="primary"
              round
              dense
              icon="edit"
              style="margin-right: 10px;"
            >
            <q-popup-edit
                class="popupEdit"
                v-model="props.row"
                :title="`${$t('Update')} ${props.row.name}`"
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
                  v-model="scope.value.description"
                  dense
                  autofocus
                  :label="$t('Description')"
                />
                <q-input
                  v-model="scope.value.view.longitude"
                  type="number"
                  dense
                  autofocus
                  :label="$t('Longitude')"
                />
                <q-input
                  v-model="scope.value.view.latitude"
                  type="number"
                  dense
                  autofocus
                  :label="$t('Latitude')"
                />
                <q-input
                  v-model="scope.value.workspace"
                  dense
                  autofocus
                  :label="$t('Workspace')"
                />
            </q-popup-edit>
            </q-btn>
            <q-btn
              size="sm"
              color="red"
              round
              dense
              icon="delete"
              @click="deleteLocation(props.row)">
            </q-btn>
          </q-td>
        </q-tr>
        <q-tr v-show="props.expand" :props="props">
          <q-td colspan="100%" v-if="props.expand">
            <q-table
              flat
              bordered
              wrap-cells
              virtual-scroll
              hide-pagination
              row-key="name"
              card-class="bg-primary text-white"
              style="height: 300px;"
              :virtual-scroll-sticky-size-start="48"
              title="Layers"
              :columns="mapColumns"
              :rows="props?.row?.mapLayers"
              v-model:pagination="pagination"
            >
              <template v-slot:body="props">
                <q-tr :props="props">
                  <q-td key="id" :props="props">
                    {{ props.row.id }}
                  </q-td>
                  <q-td key="name" :props="props">
                    {{ props.row.name }}
                  </q-td>
                  <q-td key="description" :props="props">
                    {{ props.row.description }}
                  </q-td>
                  <q-td key="url" :props="props" auto-width>
                    <q-btn push color="white" text-color="primary" icon="link">
                      <q-popup-proxy
                        style="width: 500px; word-wrap: break-word"
                        :ref="`popupRef${props.row.id}`"
                        @show="showPopup(`popupRef${props.row.id}`)"
                        @hide="showPopup(null)"
                      >
                        <q-banner>
                          {{ props.row.url }}
                        </q-banner>
                      </q-popup-proxy>
                    </q-btn>
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
import { getAllLocation, updateLocation } from "src/api/location";
import { transformProjection } from "src/utils/openLayers.js";
export default defineComponent({
  name: "LocationManagementPage",
  setup() {
    const vm = getCurrentInstance().proxy;
    const $q = useQuasar();
    const $t = i18n.global.t;

    const filter = ref("");
    const visibleLocationColumns = ref([
      "name",
      "description",
      "longitude",
      "latitude",
      "workspace",
      "layer",
      "action",
    ]);
    const visibleMapColumns = ref(["name", "description", "url"]);
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
        style: 'min-width: 100px; width: 100px',
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
    const mapColumns = computed(() => [
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
        name: "url",
        align: "center",
        style: 'min-width: 160px; width: 160px',
        label: $t("Url"),
        field: "url",
      },
    ]);
    const formatLongLat = (center) => {
      const _center = JSON.parse(center?? '{}')
      return _center
    }
    const saveEdit = async (value, props) => {
      const updateParams = {
        id: value.id,
      };
      if (value.name !== props.name) updateParams.name = value.name;
      if (value.description !== props.description)
        updateParams.description = value.description;
      if (value.workspace !== props.workspace)
        updateParams.workspace = value.workspace;
      if (value.view?.latitude !== props.view.latitude) {
        Object.assign(updateParams, {
          ...updateParams,
          view: {
            ...updateParams.view,
            latitude: value.view?.latitude,
          }
        })
      }
          updateParams.view.latitude = value.view.latitude;
      if (value.view?.longitude !== props.view.longitude) {
        Object.assign(updateParams, {
          ...updateParams,
          view: {
            ...updateParams.view,
            longitude: value.view?.longitude,
          }
        })
      }
      const longLat = transformProjection({
        to: props.view?.projection?.name || 'EPSG:4326',
        definition: props.view?.projection?.definition || '',
        coordinates: [
          parseFloat(value.view?.longitude || props.view.longitude),
          parseFloat(value.view?.latitude || props.view.latitude)
        ]
      })
      Object.assign(updateParams, {
        ...updateParams,
        view: {
          ...updateParams.view,
          extent: JSON.stringify([
            longLat[0] - 54000, // min lat
            longLat[1] - 30000, // min long
            longLat[0] + 50000, // max lat
            longLat[1] + 30000, // min long
          ])
        }
      })
      const response = await updateLocation(updateParams);
      const currentRow = locationRows.value.find(
        (row) => row.id === response.id
      );
      Object.assign(currentRow, { ...response });
    };
    const deleteLocation = async(row) => {
      $q.dialog({
        icon: 'delete',
        title: $t('Warning'),
         message: `${$t('Delete location')}  ${row.name}?`,
        ok: {
          push: true
        },
        cancel: {
          push: true,
          color: 'negative'
        },
        persistent: true
      }).onOk(async() => {
      }).onCancel(() => {
      }).onDismiss(() => {
      })
    };
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
      }
      const response = await getAllLocation(query);
      return response;
    };
    const locationRows = ref([]);
    const pagination = ref({
      rowsPerPage: 0,
    });
    onMounted(async () => {
      const allLocation = await getAll();
      locationRows.value = allLocation;
    });

    return {
      filter,
      visibleLocationColumns,
      visibleMapColumns,
      locationColumns,
      mapColumns,
      locationRows,
      pagination,
      formatLongLat,
      saveEdit,
      deleteLocation,
      currentPopupRef,
      showPopup,
    };
  },
});
</script>
<style lang="scss">
::-webkit-scrollbar {
  height: 12px;
  width: 14px;
  background: transparent;
  z-index: 12;
  overflow: visible;
}

::-webkit-scrollbar-thumb {
  width: 10px;
  background-color: #fff;
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
  background: #fff;
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
