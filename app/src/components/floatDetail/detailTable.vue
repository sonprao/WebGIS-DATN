<template>
  <div v-if="role === 'ADMIN'" class="adminClass">
    <q-btn v-if="isEditting" class="gt-xs" size="12px" flat dense round icon="done" @click="saveEdit">
      <q-tooltip anchor="top middle" self="center middle">{{ $t("Save") }}</q-tooltip>
    </q-btn>
    <q-btn v-else class="gt-xs" size="12px" flat dense round icon="edit" @click="isEditting = !isEditting">
      <q-tooltip anchor="top middle" self="center middle">{{ $t("Edit") }}</q-tooltip>
    </q-btn>
    <q-btn class="gt-xs" size="12px" flat dense round icon="add">
      <q-tooltip anchor="top left" self="center middle">{{ $t("Add field") }}</q-tooltip>
    </q-btn>
  </div>
  <q-scroll-area class="panelClass" :thumb-style="thumbStyle" :bar-style="barStyle">
    <q-table class="tableClass" :rows="rows" :columns="columns" separator="cell" row-key="name" virtual-scroll hide-header
      hide-bottom flat bordered wrap-cells :rows-per-page-options="[0]">
      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td key="name" :props="props" class="captionClass" style="padding: 0">
            <q-input v-if="isEditting" filled autogrow color="secondary" v-model="props.row.name" />
            <span v-else>
              {{ props.row.name }}
            </span>
          </q-td>
          <q-td key="value" :props="props" style="padding: 0">
            <q-input v-if="isEditting" filled autogrow color="secondary" v-model="props.row.value" />
            <span v-else>
              {{ props.row.value }}
            </span>
          </q-td>
          <!-- <q-td key="action" :props="props">
            <q-btn v-if="!props.expand" class="gt-xs" size="12px" flat dense round icon="more_vert" @click.stop="">
              <q-menu>
                <q-list dense>
                  <q-item clickable v-close-popup @click="props.expand = !props.expand">
                    <q-item-section>{{ $t("Edit") }}</q-item-section>
                    <q-item-section avatar>
                      <q-icon name="edit" />
                    </q-item-section>
                  </q-item>
                  <q-item clickable v-close-popup @click.stop="deleteDraw(index)">
                    <q-item-section>{{ $t("Delete") }}</q-item-section>
                    <q-item-section avatar>
                      <q-icon name="delete" />
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
            <q-btn v-else class="gt-xs" size="12px" flat dense round icon="done" @click="saveEdit(props)" />
          </q-td> -->
        </q-tr>
      </template>
    </q-table>
  </q-scroll-area>
</template>

<script>
import {
  ref,
  unref,
  onMounted,
  defineComponent,
  getCurrentInstance,
  computed,
  createApp,
  h,
  inject,
  watch,
} from "vue";
import _isEqual from 'lodash/isEqual'
import { useQuasar } from "quasar";
import { i18n } from "boot/i18n.js";
import { useUserStore } from 'src/stores/user';

export default defineComponent({
  name: "detailTable",
  props: {
    content: Object,
  },
  setup(props, { emit }) {
    const vm = getCurrentInstance().proxy;
    const $q = useQuasar();
    const $t = i18n.global.t;
    const userStore = useUserStore();
    const { role } = userStore.getUser

    const isEditting = ref(false);
    const rows = ref(
      Object.entries(props.content).map((i) => {
        let type = 'string'
        let value = ''
        if (i[1]) {
          if (typeof i[1] === 'string') {
            value = i[1]
          } else {
            value = JSON.stringify(i[1])
            type = 'object'
          }
        }
        return {
          name: i[0],
          value,
          type,
        }
      })
    );
    const columns = [
      {
        name: "name",
        align: "center",
        label: "Name",
        field: "name",
        style: "min-width: 90px; width: 90px",
      },
      {
        name: "value",
        align: "center",
        label: "Value",
        field: "value",
        style: 'min-width: 300px; width: 300px',
      },
      // {
      //   name: "action",
      //   align: "center",
      //   label: $t("Action"),
      //   sortable: true,
      // },
    ];
    const saveEdit = () => {
      isEditting.value = false
      const content = unref(rows).reduce((acc, item) => {
        acc[item.name] = item.type === 'string' ? item.value : JSON.parse(item.value)
        return acc;
      }, {});
      emit("update:model-content", content);
    };
    const hehe = (props) => {
      console.log(props);
    };

    watch(
      () => unref(props.content),
      (newVal, oldVal) => {
        if (!_isEqual(newVal, oldVal)) {
          rows.value =
            Object.entries(props.content).map((i) => {
              let type = 'string'
              let value = ''
              if (i[1]) {
                if (typeof i[1] === 'string') {
                  value = i[1]
                } else {
                  value = JSON.stringify(i[1])
                  type = 'object'
                }
              }
              return {
                name: i[0],
                value,
                type,
              }
            })
        }
      }
    );
    return {
      vm,
      role,
      isEditting,
      rows,
      columns,
      saveEdit,
      hehe,
      thumbStyle: {
        right: "4px",
        borderRadius: "5px",
        backgroundColor: "teal",
        width: "5px",
        opacity: 0.75,
      },
      barStyle: {
        right: "2px",
        borderRadius: "9px",
        backgroundColor: "teal",
        width: "9px",
        opacity: 0.2,
      },
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

.panelClass {
  max-height: 200px;
  height: 200px;
  max-width: 398px;

  // .q-table__middle .scroll {
  //   overflow-x: hidden;
  // }
}

.tableClass {
  // width: 390px;
  // max-width: 390px;
  // width: 98%;
  // max-width: 98%;
}


.captionClass {
  font-weight: 600;
}
</style>
