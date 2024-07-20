<template>
  <div>
    サブタスク&nbsp;:&nbsp;
    <v-btn
      icon="mdi-plus"
      variant="text"
      density="compact"
      size="small"
      @click="registSubTaskDialogOpen(taskDetail.id)"
    ></v-btn>
  </div>
  <v-list v-if="subTasksSize !== 0">
    <v-list-item
      v-for="subTask in subTasks"
      density="compact"
      class="my-n2"
    >
      <div class="d-flex justify-start">
        <input
          class="mr-2"
          type="checkbox"
          id="sub-task"
          :value="true"
          v-model="subTask.is_done"
          @change="$updateSubTask(subTask.id, subTask.is_done)"
        >
        <span class="mr-1" style="font-size:small;">
          {{ subTask.name }}
        </span>
        <v-btn
          color="error"
          icon="mdi-trash-can"
          variant="text"
          density="compact"
          size="small"
          @click="deleteSubTask(subTask.id, taskDetail.id)"
        ></v-btn>
      </div>
    </v-list-item>
  </v-list>

  <SubTaskRegistForm
    v-model:dialog="registSubTaskDialog"
    v-model:taskId="taskId"
    v-model:subTaskList="subTasks"
    v-model:subTasksSize="subTasksSize"
  />

</template>
<script setup lang="ts">
import type { SubTask } from '~/types/subTask'
import type { TaskDetail } from '~/types/taskDetail'
import type { Error } from '~/types/error'


const taskDetail: globalThis.Ref<TaskDetail> = defineModel("taskDetail", {required: true})

const taskId: Ref<number> = ref(taskDetail.value.id)
const registSubTaskDialog: Ref<boolean> = ref(false)
const subTasks: Ref<SubTask[]> = ref([])
const subTasksSize: Ref<number> = ref(0)
const error: Ref<Error> = ref({subTitle: "", items:[]})
const errDialog: Ref<boolean> = ref(false)

const { $getSubTasks, $updateSubTask, $deleteSubTask } = useNuxtApp()

await $getSubTasks(taskId.value).then((result: SubTask[]) => {
  subTasks.value = result
  subTasksSize.value = result.length
}).catch((err) => {
  errDialog.value = true
  error.value.subTitle = err.message
  error.value.items = err.items
})

// サブタスク削除処理
async function deleteSubTask(subTaskId: number, taskId: number): Promise<void> {
  $deleteSubTask(subTaskId, taskId).then((result) => {
    subTasks.value = result
  }).catch((err) => {
    errDialog.value = true
    error.value.subTitle = err.message
    error.value.items = err.items
  })
}

function registSubTaskDialogOpen(task_id: number): void {
  taskId.value = task_id
  registSubTaskDialog.value = true
}
</script>
