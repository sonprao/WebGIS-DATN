<template>
  <div class="q-pa-md">
    <q-table
      flat bordered
      title="Treats"
      :rows="rows"
      :columns="columns"
      row-key="name"
      :visible-columns="visibleColumns"
      :filter="filter"
      :rows-per-page-options="[0]"
    >
      <template v-slot:top>
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
            <q-badge color="green">
              {{ props.row.id }}
            </q-badge>
          </q-td>
          <q-td key="name" :props="props">
            <q-badge color="primary">
              {{ props.row.name }}
            </q-badge>
          </q-td>
          <q-td key="definition" :props="props" style="white-space: pre-wrap">
            {{ props.row.definition }}
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
                :title="`${$t('Update Projection')}: ${
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
                  v-model="scope.value.definition"
                  dense
                  autofocus
                  :label="$t('Definition')"
                />
              </q-popup-edit>
            </q-btn>
            <q-btn
              v-bind="{ ...actionButtonProps, color: 'red' }"
              icon="delete"
              @click="onDeleteProjection(props.row)"
            >
            </q-btn>
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
  computed,
  getCurrentInstance,
  onMounted,
} from "vue";
import { useQuasar } from "quasar";
import { i18n } from "boot/i18n.js";
import { getAllProjection, getProjection , deleteProjection} from 'src/api/projection'
export default defineComponent({
  name: "ProjectionManagementPage",
  setup() {
    const $t = i18n.global.t;
    const $q = useQuasar();
    const filter = ref('')
    const value = ref(true)
    const visibleColumns = ref([ 'name', 'definition', "action"])
    const actionButtonProps = {
      size: "sm",
      color: "primary",
      round: true,
      dense: true,
    };
    const columns = computed(() => [
      {
        name: 'id',
        required: true,
        label: 'Id',
        align: 'left',
        field: row => row.id,
        format: val => `${val}`,
      },
      { name: 'name', align: 'center', label: $t('Name'), field: 'name', sortable: true },
      { name: 'definition', align: 'center', label: $t('Def'), field: 'definition' },
      { name: 'action', align: 'center', label: $t('Action')},
    ])
    const toggle = async (row) => {
       $q.dialog({
        title: $t('Warning'),
         message:
           !row.activate ?
             `${$t('Deactivate user')}  ${row.email}?`:
             `${$t('Activate user')}  ${row.email}?`,
        ok: {
          push: true
        },
        cancel: {
          push: true,
          color: 'negative'
        },
        persistent: true
      }).onOk(async() => {
        const response = await activateUser(row)
      }).onCancel(() => {
        row.activate = !row.activate
      }).onDismiss(() => {
      })
    }
    const getAll = async() => {
      const response = await getAllProjection()
        return response
    }
    const rows = ref([])
    onMounted(async () => {
      rows.value = await getAll()
    })

    const onDeleteProjection = async (row) => {
      const resolve = async () => {
        rows.value = await getAll();
      }
      const res = await deleteProjection(row, resolve);
    };
    return {
      value,
      filter,
      visibleColumns,
      columns,
      rows,
      toggle,
      onDeleteProjection,
      actionButtonProps
    }
  }
})
</script>
<style lang="scss">
.q-dialog__title {
  color: orange;

  &::before {
    content: "\26A0";
  }
}
</style>
