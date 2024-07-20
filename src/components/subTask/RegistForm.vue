<template>
  <v-dialog v-model="registSubTaskDialog" width="300">
    <v-card title="サブタスク追加">
      <template v-slot:append>
        <v-icon icon="mdi-close" :class="(pending) ? 'not-allowed' : ''" @click="registSubTaskDialog = false"></v-icon>
      </template>

      <v-form @submit.prevent>
        <div class="ml-10 mr-10">
          <div class="text-right">
            {{ registSubTaskName.length }}&nbsp;/&nbsp;15
          </div>
          <v-text-field
            v-model="registSubTaskName"
            :rules="[v => !!v || '必須事項です。']"
            label="サブタスク名"
            density="compact"
            variant="outlined"
            maxlength="15"
            class="mb-3"
          />
        </div>
        <v-card-actions max-width="300">
          <v-spacer></v-spacer>
          <v-btn type="submit" variant="flat" color="primary" text="追加" @click="registSubTask()" />
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>
<script setup lang="ts">
import type { Error } from '~/types/error'
import type { SubTask } from "~/types/subTask";

const pending: Ref<boolean> = ref(false)
const error: Ref<Error> = ref({subTitle: "", items:[]})
const errDialog: Ref<boolean> = ref(false)
const registSubTaskName: Ref<string> = ref("")

const registSubTaskDialog: globalThis.Ref<boolean> = defineModel("dialog", {required: true})
const taskId: globalThis.Ref<number> = defineModel("taskId", {required: true})
const subTaskList: globalThis.Ref<SubTask[]> = defineModel("subTaskList", {required: true})
const subTasksSize: globalThis.Ref<number> = defineModel("subTasksSize", {required: true})

const { $getSubTasks, $registSubTask } = useNuxtApp()

async function registSubTask() : Promise<void> {
  await $registSubTask(registSubTaskName.value, taskId.value).then(async () => {
    await $getSubTasks(taskId.value).then((result: SubTask[]) => {
      subTaskList.value = result
      subTasksSize.value = result.length
      registSubTaskDialog.value = false
    })
  }).catch((err) => {
    errDialog.value = true
    error.value.subTitle = err.message
    error.value.items = err.items
  })
  registSubTaskName.value = ""
}
</script>
