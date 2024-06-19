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
        <v-btn :loading="pending" variant="flat" color="primary" text="追加" @click="add" />
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

  <v-row class="mt-4 tasks">
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

const db = await Database.load("sqlite:task_app.db")

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

await getTaskList()

// タスク一覧取得処理
async function getTaskList(): Promise<void> {
  const tasks: Task[] = await db.select(
    "SELECT id, name, descript, status, deadline, priority FROM tasks WHERE workspace_id = $1",
    [workspaceId]
  ).catch((err) => {
    console.log(err)
    errDialog.value = true
  })

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

  console.log(todoTasks.value)
  console.log(workingTasks.value)
  console.log(waitingTasks.value)
  console.log(doneTasks.value)
  console.log(taskList.value)
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
