<template>
  <q-card class="bg-secondary shadow-2 popupCardClass">
    <q-card-section class="row items-center q-gutter-xl">
      <div class="text-h6 text-white">Add new feature</div>
    </q-card-section>
    <q-card-section>
      <q-select class="searchClass" ref="locationSearchRef" v-model="searchLocation" outlined bg-color="white"
        color="teal" use-input hide-dropdown-icon input-debounce="400" label="Select location" option-label="name"
        option-value="name" :options="options" @filter="filterFn" @update:model-value="setModel">
        <template v-slot:append>
          <q-icon name="search" color="teal" />
        </template>
        <template v-slot:no-option>
          <q-item>
            <q-item-section class="text-grey">
              {{ $t("No results") }}
            </q-item-section>
          </q-item>
        </template>
      </q-select>
    </q-card-section>
    <q-card-section class="bg-white" horizontal>
      <q-card-section style="width: 100%;">
        <q-virtual-scroll :items="dataLayers" separator v-slot="{ item, index }" class="layerClass">
          <q-item :key="item.id + index">
            <q-item-section avatar>
              <q-radio v-model="layerCheckbox" :val="item" color="secondary" @update:model-value="(val) => {
                  layerCheckbox = val
                  fetchFeatures()
                }" />
            </q-item-section>
            <q-item-section>
              <q-item-label>
                <span v-html="item.name"></span>
              </q-item-label>
              <q-item-label caption>
                {{ item.description }}
              </q-item-label>
            </q-item-section>
            <q-separator />
          </q-item>
        </q-virtual-scroll>
      </q-card-section>
      <q-separator v-if="layerCheckbox" vertical />
      <q-card-section v-if="layerCheckbox" style="padding: 0  0 0 0;">
        <q-table 
          flat
          bordered
          wrap-cells
          hide-pagination
          row-key="name"
          class="tableClass"
          :title="$t('Feature')"
          :rows="rows"
          :columns="columns"
          :virtual-scroll-sticky-size-start="48"
          v-model:pagination="pagination"
          @update:selected="setPagination"
        >
          <template v-slot:body="props">
            <q-tr :props="props">
              <q-td key="id" :props="props">
                {{ props.row.id }}
              </q-td>
              <q-td key="name" :props="props">
                {{ props.row.name }}
              </q-td>
              <q-td key="action" :props="props">
              <q-btn
                  size="sm"
                  color="secondary"
                  round
                  dense
                  @click="props.expand = !props.expand"
                  :icon="props.expand ? 'expand_less' : 'expand_more'"
                />
              </q-td>
            </q-tr>
            <q-tr v-show="props.expand" :props="props">
          <q-td colspan="100%" v-if="props.expand">
            hello
          </q-td>
        </q-tr>
          </template>
        </q-table>
        <q-pagination input style="place-content: center;" v-model="pagination.page" @update:model-value="fetchFeatures" :max="pagination.rowsNumber" boundary-numbers direction-links flat color="grey"
          active-color="primary" />
      </q-card-section>
    </q-card-section>
    <q-separator />
    <q-card-section class="row items-start justify-center q-gutter-sm">
      <q-btn label="Save" text-color="secondary" color="white" />
      <q-btn v-close-popup label="Close" text-color="secondary" color="white" />
    </q-card-section>
  </q-card>
</template>

<script>
import {
  ref,
  unref,
  onMounted,
  onUnmounted,
  defineComponent,
  getCurrentInstance,
  computed,
  createApp,
  h,
  inject,
  watch,
} from "vue";
import _isEqual from 'lodash/isEqual'
import _debounce from 'lodash/debounce'
import { useQuasar } from "quasar";
import { i18n } from "boot/i18n.js";
import { useUserStore } from 'src/stores/user';
import { getAllLocation, getLocation } from "src/api/location";
import { getFeaturesByLayer } from "src/api/feature";

export default defineComponent({
  name: "detailPopupSave",
  props: {
    content: Object,
  },
  setup(props, { emit }) {
    const vm = getCurrentInstance().proxy;
    const $q = useQuasar();
    const $t = i18n.global.t;
    const userStore = useUserStore();
    const { role } = userStore.getUser
    const locationSearchRef = ref(null);
    const searchLocation = ref("");
    const options = ref([]);
    const defaultOptions = ref([]);
    const filterFn = (val, update, abort) => {
      if (val.length < 2) {
        // abort();
        update(async () => {
          options.value = unref(defaultOptions);
        });
      } else {
        update(async () => {
          const query = {
            search: val.replace(/[^a-zA-Z0-9\s]/g, ""),
          };
          const response = await getAllLocation(query);
          options.value = response.data;
        });
      }
    };
    const location = ref(null);
    const onClearSearch = () => {
    };
    const setModel = async (val) => {
      if (val) {
        location.value = await getLocation({ id: val.id });
        dataLayers.value = unref(location)?.mapLayers || [];
        layerCheckbox.value = null;
      }
      unref(locationSearchRef).blur();
    };

    const dataLayers = ref([]);
    const layerCheckbox = ref(null);
    const fetchFeatures = _debounce(async (val = 1) => {
      const response = await getFeaturesByLayer({
        layerId: unref(layerCheckbox).id,
        per_page: unref(pagination).rowsPerPage,
        page: val
      })
      if (response) {
        rows.value = response.data;
        pagination.value.rowsNumber = parseInt(Math.ceil(response.count / response.per_page));
        pagination.value.page = response.page;
        pagination.value.rowsPerPage = response.per_page;
      }
    }, 10)
    onMounted(() => {
      const query = {}
      getAllLocation(query).then((response) => {
        defaultOptions.value = response.data;
      });
    });
    // table
    const columns = computed(() => [
      {
        required: true,
        name: 'id',
        label: 'Id',
        field: 'id',
        align: "center",
        style: "min-width: 90px; width: 90px;",
      },
      { name: 'name', align: 'center', label: $t('Feature name'), field: 'name' },
      { name: 'action', align: 'center', label: $t('') },
    ])
    const rows = ref([])
    const pagination = ref({
      page: 1,
      rowsPerPage: 10,
      rowsNumber: 0,
    })
    const setPagination = (val) => {
      console.log(val)
    }
 
    // table
    return {
      vm,
      role,
      locationSearchRef,
      searchLocation,
      options,
      filterFn,
      setModel,
      dataLayers,
      layerCheckbox,
      fetchFeatures,
      //table
      columns,
      rows,
      pagination,
      setPagination,
      //table
    };
  },
});
</script>
<style lang="scss" scoped>
html,
body {
  width: 100%;
  height: 100%;
}

.adminClass {
  display: flex;
  justify-self: right;
}

.popupCardClass {
  min-width: 50vh;
  max-width: fit-content;
  // max-height: 90vh;
}


.tableClass {
  max-height: 55vh;
  // width: 390px;
  // max-width: 390px;
  // width: 98%;
  // max-width: 98%;
}


.captionClass {
  font-weight: 600;
}


.layerClass {
  border-top-left-radius: 1px;
  border-top-right-radius: 1px;
  height: 100vh;
  max-height: 60vh;
  max-width: 400px;

  .q-scrollarea__content.absolute {
    // display: flex;
    // flex-direction: column-reverse;
  }
}

::-webkit-scrollbar {
  border-radius: 5px;
  height: 12px;
  width: 14px;
  background: rgba(0, 128, 128, 0.25);
  z-index: 12;
  overflow: visible;
  cursor: pointer !important;
}

::-webkit-scrollbar-thumb {
  width: 10px;
  background-color: $secondary;
  border-radius: 10px;
  z-index: 12;
  border: 4px solid rgba(0, 0, 0, 0);
  background-clip: padding-box;
  transition: background-color 0.32s ease-in-out;
  margin: 4px;
  min-height: 32px;
  min-width: 32px;
  cursor: pointer !important;
}

::-webkit-scrollbar-thumb:hover {
  background: $secondary;
  cursor: pointer !important;
}

.q-card__section .q-card__section--vert {
  padding: 0;
}
</style>
