<template>
  <q-page-sticky
    ref="stickyRef"
    class="sticky"
    position="top-right"
    :offset="fabPos"
  >
    <q-btn-dropdown class="glossy" color="purple" :label="$t('layers')">
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
  <!-- <q-page-sticky position="bottom-right" :offset="fabPos">
    <q-fab
      icon="add"
      direction="up"
      color="accent"
      :disable="draggingFab"
      v-touch-pan.prevent.mouse="moveFab"
    >
      <q-fab-action @click="onClick" color="primary" icon="person_add" :disable="draggingFab" />
      <q-fab-action @click="onClick" color="primary" icon="mail" :disable="draggingFab" />
    </q-fab>
  </q-page-sticky> -->
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
    // layers: {
    //   type: Array,
    //   default: () => [],
    // },
  },
  setup(props) {
    // const itext = i18n.global.t('common.user')
    const vm = getCurrentInstance().proxy;
    const $q = useQuasar();
    const $t = i18n.global.t;
    const draggingFab = ref(false);
    const stickyRef = ref(null);
    const fabPos = ref([10, 10]);
    const onClick = () => {
    };
    // const parentHeight = computed(() =>vm.$parent.$el?.offsetHeight)
    // const parentWidth= computed(()=> vm.$parent.$el?.offsetWidth)
    const moveFab = (ev) => {
      // console.log(unref(parentWidth))
      // draggingFab.value = ev.isFirst !== true && ev.isFinal !== true
      // const coX = fabPos.value[0] + ev.delta.x
      // const coY = fabPos.value[1] - ev.delta.y
      // if (!(coX < 0 || coY < 0 || coX > unref(parentWidth) || coY > unref(parentHeight))) {
      //   fabPos.value = [coX, coY]
      // }
    };
    const groupSearch = ref('');
    const groupOptions = ref(props.filterOptions);
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
      moveFab,
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
