<template>
  <div>
    <q-uploader
      url="http://localhost:4444/upload"
      label="Custom header"
      multiple
      style="max-width: 300px;"
    >
      <template v-slot:header="scope">
        <div class="row no-wrap items-center q-pa-sm q-gutter-xs">
          <q-btn v-if="scope.queuedFiles.length > 0" icon="clear_all" @click="scope.removeQueuedFiles" round dense flat >
            <q-tooltip>Clear All</q-tooltip>
          </q-btn>
          <q-btn v-if="scope.uploadedFiles.length > 0" icon="done_all" @click="scope.removeUploadedFiles" round dense flat >
            <q-tooltip>Remove Uploaded Files</q-tooltip>
          </q-btn>
          <q-spinner v-if="scope.isUploading" class="q-uploader__spinner" />
          <div class="col">
            <div class="q-uploader__title">Upload your files</div>
            <div class="q-uploader__subtitle">{{ scope.uploadSizeLabel }} / {{ scope.uploadProgressLabel }}</div>
          </div>
          <q-btn v-if="scope.canAddFiles" type="a" icon="add_box" @click="scope.pickFiles" round dense flat>
            <q-uploader-add-trigger />
            <q-tooltip>Pick Files</q-tooltip>
          </q-btn>
          <q-btn v-if="scope.canUpload" icon="cloud_upload" @click="scope.upload" round dense flat >
            <q-tooltip>Upload Files</q-tooltip>
          </q-btn>

          <q-btn v-if="scope.isUploading" icon="clear" @click="scope.abort" round dense flat >
            <q-tooltip>Abort Upload</q-tooltip>
          </q-btn>
        </div>
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
import { useRoute, useRouter } from "vue-router";
import { i18n } from "boot/i18n.js";
import { useMapStore } from "stores/map";

import { Map, View } from "ol";
import proj4 from "proj4";
import { register } from "ol/proj/proj4";

import _difference from "lodash/difference";
import _isEmpty from "lodash/isEmpty";
import { MAP_LAYERS } from "src/constants/layer.js";
import {
  actionAddLayerGeoJSON,
  actionAddLayerWMS,
  transformProjection,
} from "src/utils/openLayers.js";
export default defineComponent({
  name: "TabUpload",
  components: {},
  setup() {
    const vm = getCurrentInstance().proxy;
    const $t = i18n.global.t;
    const mapStore = useMapStore();
    const map = inject("map", {});
    const searchLayer = ref('');
    
    return {
      map,
      location,
    };
  },
});
</script>
<style lang="scss" scoped>
</style>
