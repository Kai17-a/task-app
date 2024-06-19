<template>
  <h1>{{ workspaceName }}</h1>
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
        @click:append="console.log('test')"
      />
    </v-col>
    <v-col cols="auto">
      <v-btn variant="flat" color="primary" @click="registDialog = true">タスク追加</v-btn>
    </v-col>
    <v-col cols="auto">
      <v-btn variant="flat" color="error" @click="deleteDialog = true">ワークスペース削除</v-btn>
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
        <v-btn :loading="pending" variant="flat" color="primary" text="追加" @click="console.log('test')" />
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog v-model="deleteDialog" width="350" :persistent="pending">
    <v-card title="タスク追加">
      <v-card-text max-width="auto">
        このワークスペースを削除しますか？
      </v-card-text>

      <v-card-actions max-width="300">
        <v-spacer></v-spacer>
        <v-btn :disabled="pending" variant="outlined" color="error" text="キャンセル" @click="deleteDialog = false" />
        <v-btn :loading="pending" variant="flat" color="error" text="削除" @click="deleteWorkspace" />
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-row v-if="tasksSize != 0" class="mt-4 tasks">
    <v-col v-for="task in taskList" cols="3">
      <h3>{{ task.value }}</h3>
      <v-sheet elevation="1" min-height="580" width="auto" :rounded="true" color="#fefefe" border>
        <div v-for="datasktum in task.data">
          <v-card min-height="110" class="mx-3 my-3 .bg-surface-secondary" :title="datasktum.name" :text="datasktum.descript" variant="tonal" hover @mouseup="detailDialogOpen(datasktum.id)">
            <p class="text-body-2 text-right text-red-lighten-1 pr-1" color="red">{{ datasktum.deadline }}</p>
          </v-card>
        </div>
      </v-sheet>
    </v-col>
  </v-row>
  <v-row velse class="mt-6 tasks">
    <v-col>
      <h2 class="text-disabled">タスクが存在しません。</h2>
    </v-col>
  </v-row>

  <v-dialog v-model="detailDialog" width="600">
    <v-card :subtitle="taskDetail.descript">
      <template v-slot:title>
        <div class="d-flex align-center">
          {{ taskDetail.name }}
          <v-chip variant="flat" density="compact" :color="getStatusColor(taskDetail.status)">
            {{ getStatusName(taskDetail.status) }}
          </v-chip>
        </div>
      </template>
      <template v-slot:append>
        <v-icon icon="mdi-close" :class="(pending) ? 'not-allowed' : ''" @click="detailDialog = false"></v-icon>
      </template>
      <v-card-text max-width="auto">
        <div class="mb-1">メモ&nbsp;:</div>
        <v-sheet v-if="true" class="pa-3" min-height="150" color="#fefefe" :rounded="true" border>
          {{ taskDetail.note }}
        </v-sheet>
        <v-textarea
          v-else
          :model-value="taskDetail.note"
          variant="outlined"
          disabled
        ></v-textarea>
      </v-card-text>
      <v-card-text class="mt-n5">
        <div class="mb-1">サブタスク&nbsp;:</div>

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

  <v-dialog v-model="errDialog" width="450">
    <v-card title="エラー" color="red-lighten-5">
      <template v-slot:append>
        <v-icon icon="mdi-close" @click="errDialog = false"></v-icon>
      </template>
      <v-card-text max-width="auto">
        <p>登録に失敗しました。</p>
        以下の確認をしてください。
        <li>ワークスペース名が重複していない</li>
        <br>
        <p>それ以外の場合は開発者に聞いてね(/・ω・)/</p>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>
<script lang="ts" setup>
import Database from "tauri-plugin-sql-api"

const route = useRoute()
const workspaceId = route.params.workspaceId
const searchValue: Ref<string> = ref("");
const registDialog: Ref<boolean> = ref(false)
const errDialog: Ref<boolean> = ref(false)
  const pending: Ref<boolean> = ref(false)

const db = await Database.load("sqlite:task_app.db")

function closeRegistDialog() {
  if (pending.value) {
    return
  } else {
    registDialog.value = false
  }
}

// タスク削除
const deleteConfirmDialog: Ref<boolean> = ref(false)
function deleteTask(id: number) {
  deleteConfirmDialog.value = false
  detailDialog.value = false
  console.log(`delete: ${id}`)
}

// ワークスペース名
const workspaceName: Ref<string> = ref("")
await getWorkspacesName(Number(workspaceId))
async function getWorkspacesName(workspaceId: number) {
  const workspaces: object[] = await db.select(
    "SELECT name FROM workspaces WHERE id = $1",
    [workspaceId]
  ).catch((err) => {
    console.log(err)
    errDialog.value = true
  })
  workspaceName.value = workspaces[0].name
}

interface Task {
  id: number;
  name: string;
  descript: string;
  status: 'todo' | 'working' | 'waiting' | 'done';
  deadline: string;
  priority: 'low' | 'mid' | 'high';
}

interface TaskList {
  todo: {
    value: string;
    data: Task[];
  };
  working: {
    value: string;
    data: Task[];
  };
  waiting: {
    value: string;
    data: Task[];
  };
  done: {
    value: string;
    data: Task[];
  };
}

const tasksSize: Ref<number> = ref(0)
const todoTasks: Ref<Task[]> = ref([])
const workingTasks: Ref<Task[]> = ref([])
const waitingTasks: Ref<Task[]> = ref([])
const doneTasks: Ref<Task[]> = ref([])

// メイン部分
const taskList: Ref<TaskList> = ref({
  todo: {
    value: "未着手",
    data: []
  },
  working: {
    value: "作業中",
    data: []
  },
  waiting: {
    value: "レビュー待ち",
    data: []
  },
  done: {
    value: "完了",
    data: []
  }
})
// タスク一覧取得処理
await getTaskList()
async function getTaskList(): Promise<void> {
  const tasks: Task[] = await db.select(
    "SELECT id, name, descript, status, deadline, priority FROM tasks WHERE workspace_id = $1",
    [workspaceId]
  ).catch((err) => {
    console.log(err)
    errDialog.value = true
  })

  tasksSize.value = tasks.length

  if (tasksSize.value !== 0) {
    tasks.forEach((task: Task) => {
      switch(task.status) {
        case 'todo':
          todoTasks.value.push(task)
          break;
        case 'working':
          workingTasks.value.push(task)
          break;
        case 'waiting':
          waitingTasks.value.push(task)
          break;
        case 'done':
          doneTasks.value.push(task)
          break;
      }
    })

    taskList.value.todo.data = todoTasks.value
    taskList.value.working.data = workingTasks.value
    taskList.value.waiting.data = waitingTasks.value
    taskList.value.done.data = doneTasks.value
  }
}

// タスク詳細取得
interface TaskDetail {
  id: number;
  name: string;
  descript: string;
  status: string;
  deadline: string;
  note: string;
  priority: string;
  created_at: string;
}
const taskDetail: Ref<TaskDetail> = ref({
  id: 0,
  name: "",
  descript: "",
  status: "",
  deadline: "",
  note: "",
  priority: "",
  created_at: "",
})

async function getTaskDetail(taskId: number): Promise<void> {
  const result: TaskDetail[] = await db.select(
    "SELECT id, name, descript, status, deadline, note, priority, created_at FROM tasks WHERE id = $1",
    [taskId]
  ).catch((err) => {
    console.log(err)
    errDialog.value = true
  })

  taskDetail.value = result[0]
}

// タスク詳細を開く
const detailDialog: Ref<boolean> = ref(false)
const openTaskId: Ref<number> = ref(0)
async function detailDialogOpen(id: number) {
  openTaskId.value = id
  await getTaskDetail(id)
  detailDialog.value = true
}

// 削除処理
const deleteDialog: Ref<boolean> = ref(false)
async function deleteWorkspace(): Promise<void> {
  pending.value = true
  await db.execute(
    "DELETE FROM workspaces WHERE id = $1", [workspaceId]
  ).catch((err) => {
    errDialog.value = true
  })
  deleteDialog.value = false
  pending.value = false

  navigateTo('/')
}
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
