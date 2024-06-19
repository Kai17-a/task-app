<template>
  <h1>workspace: {{ workspaceId }}</h1>
  <v-row class="mt-3">
    <v-col cols="4" class="me-auto">
      <v-text-field
        v-model="searchValue"
        append-icon="mdi-magnify"
        density="compact"
        label="タスク検索"
        variant="outlined"
        hide-details
        single-line
        @click:append="test"
      />
    </v-col>
    <v-col cols="auto">
      <v-btn variant="flat" color="primary" @click="registDialog = true">タスク追加</v-btn>
    </v-col>
  </v-row>

  <v-dialog v-model="registDialog" width="600" :persistent="pending">
    <v-card title="タスク追加">
      <template v-slot:append>
        <v-icon icon="mdi-close" :class="(pending) ? 'not-allowed' : ''" @click="closeRegistDialog"></v-icon>
      </template>
      <v-card-text max-width="auto">
        追加フォームがここに入る
      </v-card-text>

      <v-card-actions max-width="300">
        <v-spacer></v-spacer>
        <v-btn :loading="pending" variant="flat" color="primary" text="追加" @click="add" />
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-row class="mt-4 tasks">
    <v-col v-for="task in taskList" cols="3">
      <h3>{{ task.value }}</h3>
      <v-sheet elevation="1" min-height="580" width="auto" :rounded="true" color="#fefefe" border>
        <div v-for="datasktum in task.data">
          <v-card min-height="110" class="mx-3 my-3 .bg-surface-secondary" :title="datasktum.title" :text="datasktum.descript" variant="tonal" hover @mouseup="detailDialogOpen(datasktum.id)">
            <p class="text-body-2 text-right text-red-lighten-1 pr-1" color="red">{{ datasktum.deadline }}</p>
          </v-card>
        </div>
      </v-sheet>
    </v-col>
  </v-row>

  <v-dialog v-model="detailDialog" width="600">
    <v-card title="タスク追加">
      <template v-slot:append>
        <v-icon icon="mdi-close" :class="(pending) ? 'not-allowed' : ''" @click="detailDialog = false"></v-icon>
      </template>
      <v-card-text max-width="auto">
        タスク詳細
      </v-card-text>

      <v-card-actions max-width="300">
        <v-spacer></v-spacer>
        <v-btn variant="flat" color="red" append-icon="mdi-delete" text="タスク削除" @click="deleteConfirmDialog = true" />
      </v-card-actions>
    </v-card>
  </v-dialog>
  <v-dialog v-model="deleteConfirmDialog" width="300">
    <v-card>
      <v-card-text max-width="auto">
        本当に削除しますか？
      </v-card-text>
      <v-card-actions max-width="300">
        <v-spacer></v-spacer>
        <v-btn variant="flat" color="red" append-icon="mdi-delete" text="削除" @click="deleteTask(openTaskId)" />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script lang="ts" setup>
const route = useRoute()
const workspaceId = route.params.workspaceId
const searchValue: Ref<string> = ref("");
const registDialog: Ref<boolean> = ref(false)

function test() {
  console.log(searchValue.value)
}

const pending: Ref<boolean> = ref(false)
function closeRegistDialog() {
  if (pending.value) {
    return
  } else {
    registDialog.value = false
  }
}
async function add() {
  pending.value = true
  await new Promise(resolve => setTimeout(resolve, 3000))
  console.log("3秒経過")
  registDialog.value = false
  pending.value = false
}

// タスク詳細を開く
const detailDialog: Ref<boolean> = ref(false)
const openTaskId: Ref<number> = ref(0)
function detailDialogOpen(id: number) {
  openTaskId.value = id
  console.log(`open detail: ${openTaskId.value}`)
  detailDialog.value = true
}

// タスク削除
const deleteConfirmDialog: Ref<boolean> = ref(false)
function deleteTask(id: number) {
  deleteConfirmDialog.value = false
  detailDialog.value = false
  console.log(`delete: ${id}`)
}

// メイン部分
const taskList = [
  {
    status: "todo",
    value: "未着手",
    data: [
      {
        id: 1,
        title: "task1",
        descript: "タスク１タスク１タスク１タスク１タスク１タスク１タスク１",
        deadline: "2024/01/01"
      },
      {
        id: 2,
        title: "task2",
        descript: "タスク２",
        deadline: "2024/01/01"
      }
    ]
  },
  {
    status: "working",
    value: "作業中",
    data: [
      {
        id: 3,
        title: "task3",
        descript: "タスク３",
        deadline: "2024/01/01"
      },
      {
        id: 4,
        title: "task4",
        descript: "タスク４",
        deadline: "2024/01/01"
      },
    ]
  },
  {
    status: "waiting",
    value: "レビュー待ち",
    data: [
      {
        id: 5,
        title: "task5",
        descript: "タスク５",
        deadline: "2024/01/01"
      }
    ]
  },
  {
    status: "done",
    value: "完了",
    data: [
      {
        id:6,
        title: "task6",
        descript: "タスク６",
        deadline: "2024/01/01"
      }
    ]
  }
]

</script>
<style scoped>
.magnify {
  cursor: pointer;
}

.not-allowed {
  cursor: not-allowed;
}

.tasks {
  user-select: none;
}
</style>
