<template>
  <q-page-sticky
    ref="stickyRef"
    class="sticky"
    position="top-right"
    :offset="fabPos"
  >
    <q-btn-dropdown class="glossy" color="purple" :label="$t('layers')" persistent>
      <q-scroll-area style="height: 200px; min-width: 200px">
        <q-input
          square
          standout
          outlined
          placeholder="Place holder"
          v-model="groupSearch"
          @update:model-value="filterGroup"
        >
          <template v-slot:prepend>
            <q-icon name="place" />
          </template>
          <template v-slot:append>
            <q-icon name="close" @click="groupSearch = ''; groupOptions = filterOptions" class="cursor-pointer" />
          </template>
        </q-input>
        <div class="row no-wrap q-pa-md">
          <div class="column items-center">
            <q-option-group
              v-model="group"
              :options="groupOptions"
              color="blue"
              type="checkbox"
              @update:model-value="
                (val) => {
                  $emit('changeLayers', val);
                }
              "
            >
              <template v-slot:label="opt">
                <div class="row items-center">
                  <span>{{ opt.label }}</span>
                  <q-icon
                    :name="opt.icon"
                    style="color: #00ffff"
                    size="1.5em"
                    class="q-ml-sm"
                  ></q-icon>
                </div>
              </template>
            </q-option-group>
          </div>
        </div>
      </q-scroll-area>
    </q-btn-dropdown>
  </q-page-sticky>
</template>

<script>
import {
  defineComponent,
  ref,
  unref,
  getCurrentInstance,
computed,
} from "vue";
import { useQuasar } from "quasar";
import { i18n } from "boot/i18n.js";
export default defineComponent({
  name: "FloatAction",
  components: {},
  props: {
    filterOptions: {
      type: Array,
      default: () => [],
    },
  },
  setup(props) {
    const vm = getCurrentInstance().proxy;
    const $q = useQuasar();
    const $t = i18n.global.t;
    const draggingFab = ref(false);
    const stickyRef = ref(null);
    const fabPos = ref([10, 10]);
    const onClick = () => {
    };
    const groupSearch = ref('');
    const groupOptions = computed(() => props.filterOptions);
    const group = ref([]);
    const filterGroup = (value) => {
      const _value = value.toLowerCase()
      groupOptions.value = props.filterOptions.filter((option) => {
        return option.label.toLowerCase().includes(_value)
      })
    }
    return {
      vm,
      stickyRef,
      fabPos,
      draggingFab,
      onClick,
      group,
      groupOptions,
      groupSearch,
      filterGroup,
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
</style>
