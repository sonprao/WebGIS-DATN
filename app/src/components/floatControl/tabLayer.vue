<template>
  <div>
    With so much content to display at once, and often so little
    screen real-estate, Cards have fast become the design pattern of
    choice for many companies, including the likes of Google and
    Twitter.
  </div>
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

export default defineComponent({
  name: "TabLayer",
  components: {},
  setup(props, { emit }) {
    const vm = getCurrentInstance().proxy;
    const $q = useQuasar();
    const $t = i18n.global.t;
  
    return {
      vm,
    };
  },
});
</script>
<style lang="scss">
</style>
