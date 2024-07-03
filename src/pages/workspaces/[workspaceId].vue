<template>
  <div class="mx-n4 my-n1">
    <v-breadcrumbs :items="breadcrumbsItems" density="compact">
      <template v-slot:divider>
        <v-icon icon="mdi-chevron-right"></v-icon>
      </template>
    </v-breadcrumbs>
  </div>

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
      <v-btn variant="flat" color="error" @click="deleteWorkspaceDialog = true">ワークスペース削除</v-btn>
    </v-col>
  </v-row>

  <v-dialog v-model="registDialog" width="600" :persistent="pending">
    <v-card title="タスク追加">
      <template v-slot:append>
        <v-icon icon="mdi-close" :class="(pending) ? 'not-allowed' : ''" @click="closeRegistDialog"></v-icon>
      </template>
      <v-form @submit.prevent>
        <div class="ml-10 mr-10">
          <div class="text-right">
            {{ newTaskName.length }}&nbsp;/&nbsp;15
          </div>
          <v-text-field
            v-model="newTaskName"
            :rules="[v => !!v || 'タスク名は必須です']"
            label="タスク名"
            density="compact"
            variant="outlined"
            maxlength="15"
            class="mb-3"
          />
            <v-text-field
              v-model="newTaskDeadline"
              label="期限"
              type="date"
              density="compact"
              variant="outlined"
              class="mt-5"
              width="170"
            />
          <div class="text-right">
            {{ newTaskDescript.length }}&nbsp;/&nbsp;15
          </div>
          <v-textarea label="説明" variant="outlined" rows="1" v-model="newTaskDescript" />
        </div>
        <v-card-actions max-width="300">
          <v-spacer></v-spacer>
          <v-btn type="submit" variant="flat" color="primary" text="追加" @click="addTask " />
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>

  <ConfirmDialog
    v-model="deleteWorkspaceDialog"
    title="ワークスペース削除"
    message="このワークスペースを削除しますか？"
    btn-color="error"
    @close="deleteWorkspaceDialog = false"
    @func="deleteWorkspace"
  />

  <v-row v-if="tasksSize != 0" class="mt-4 tasks">
    <v-col v-for="task in taskList" cols="3">
      <h3>{{ task.value }}</h3>
      <v-sheet elevation="1" min-height="580" width="auto" :rounded="true" color="#fefefe" border>
        <div v-for="datasktum in task.data">
          <v-card
            min-height="110"
            class="mx-3 my-3 bg-grey-lighten-4"
            :title="datasktum.name"
            :text="datasktum.descript"
            hover
            @mouseup="detailDialogOpen(datasktum.id)"
          >
            <p class="text-body-2 text-right text-red-lighten-1 pr-1" color="red">
              {{ datasktum.deadline }}
            </p>
          </v-card>
        </div>
      </v-sheet>
    </v-col>
  </v-row>
  <v-row v-else class="mt-6 tasks">
    <v-col>
      <h2 class="text-disabled">タスクが存在しません。</h2>
    </v-col>
  </v-row>

  <v-dialog v-model="detailDialog" scrollable width="600">
    <v-card :subtitle="taskDetail.descript" min-height="100" max-height="600">
      <template v-slot:title>
        <div class="d-flex align-center">
          {{ taskDetail.name }}
          <v-chip class="ml-2" variant="flat" density="compact" :color="getStatusColor(taskDetail.status)">
            {{ getStatusName(taskDetail.status) }}
          </v-chip>
        </div>
      </template>
      <template v-slot:append>
        <v-icon icon="mdi-close" :class="(pending) ? 'not-allowed' : ''" @click="detailDialog = false"></v-icon>
      </template>

      <v-card-text max-height="400">
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
                @change="updateSubTask(subTask.id, subTask.is_done)"
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

        <div class="mt-3 mb-1">メモ&nbsp;:</div>
        <v-sheet v-if="true" class="pa-3" min-height="150" color="#fefefe" :rounded="true" border>
          {{ taskDetail.note }}
        </v-sheet>
        <v-textarea
          v-else
          :model-value="taskDetail.note"
          variant="outlined"
          disabled
        ></v-textarea>

        <div class="mt-5">
          関連ファイル&nbsp;:&nbsp;
          <v-btn
            icon="mdi-plus"
            variant="text"
            density="compact"
            size="small"
            @click="saveFile(taskDetail.id)"
          ></v-btn>
          <v-list v-if="taskFilesSize !== 0">
            <v-list-item
              v-for="taskFile in taskFiles"
              density="compact"
              class="my-n2"
            >
              <div class="d-flex justify-start">
                <span
                  class="mr-1 text-blue-darken-3 task-file text-decoration-underline"
                  style="font-size:small;"
                  @click="downloadTaskFile(taskFile.name)"
                >
                  {{ taskFile.name }}
                </span>
                <v-btn
                  color="error"
                  icon="mdi-trash-can"
                  variant="text"
                  density="compact"
                  size="small"
                  @click="deleteTaskFile(taskFile.id, taskFile.name, taskDetail.id)"
                ></v-btn>
              </div>
            </v-list-item>
        </v-list>
        </div>
      </v-card-text>
      <v-card-actions max-width="300">
        <v-spacer></v-spacer>
        <v-btn variant="flat" color="red" append-icon="mdi-delete" text="タスク削除" @click="deleteTaskDialog = true" />
      </v-card-actions>
    </v-card>
  </v-dialog>

  <ConfirmDialog
    v-model="deleteTaskDialog"
    title="タスク削除"
    message="このタスクを削除しますか？"
    btn-color="error"
    @close="deleteTaskDialog = false"
    @func="deleteTask(openTaskId)"
  />

  <ErrorDialog
    v-model="errDialog"
    :subTitle="error.subTitle"
    :items="error.items"
    @close="errDialog = false"
  />

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
          <v-btn type="submit" variant="flat" color="primary" text="追加" @click="registSubTask(registSubTaskId)" />
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>
<script lang="ts" setup>
import Database from "tauri-plugin-sql-api"
import { open, save } from "@tauri-apps/api/dialog"
{/* @ts-ignore */}
import { invoke } from '@tauri-apps/api/tauri'
import { appDataDir, downloadDir } from '@tauri-apps/api/path'
import { exists, createDir, copyFile, BaseDirectory } from '@tauri-apps/api/fs';
import type { Task } from '~/types/task'
import type { TaskList } from '~/types/taskList'
import type { TaskDetail } from '~/types/taskDetail'
import type { SubTask } from '~/types/subTask'
import type { WorkspaceName } from '~/types/workspace'
import type { Error } from '~/types/error'
import type { TaskFile } from '~/types/taskFile'

const route = useRoute()
const workspaceId = route.params.workspaceId
const searchValue: Ref<string> = ref("");
const registDialog: Ref<boolean> = ref(false)
const errDialog: Ref<boolean> = ref(false)
const error: Ref<Error> = ref({subTitle: "", items:[]})
const pending: Ref<boolean> = ref(false)

const db = await Database.load("sqlite:task_app.db")

async function downloadTaskFile(fileName: string) {
  const appDataDirPath = await appDataDir()
  const downloadTargetPath = `${appDataDirPath}files/${fileName}`
  const downloadDirectoryPath = await downloadDir()
  await save({ defaultPath: downloadDirectoryPath }).then(async (dir) => {
    if (typeof dir === 'string') {
      console.log(dir)
    }
  })

}

{/* @ts-ignore */}
const invoke = window.__TAURI__.invoke
async function saveFile(taskId: number): Promise<void> {
  const appDataDirPath = await appDataDir()
  const saveDirPath = `${appDataDirPath}files/`
  const saveDirWorkspaceTaskPath = `${appDataDirPath}files/${workspaceName.value}/${taskDetail.value.name}/`
  if (!await exists(saveDirWorkspaceTaskPath)) {
    await createDir(saveDirPath)
    await createDir(`${saveDirPath}${workspaceName.value}/`)
    await createDir(`${saveDirPath}${workspaceName.value}/${taskDetail.value.name}/`)
  }
  await open().then(async (files) => {
    if (typeof files === 'string') {
      const paths: string[] = files.split("\\")
      const filename = paths[paths.length - 1]
      const fileNameArr = filename.split(".")
      const expand = fileNameArr[fileNameArr.length - 1]

      if (await exists(`${saveDirWorkspaceTaskPath}${filename}`)) {
        errDialog.value = true
        error.value.subTitle = "同じ名前のファイルが既に存在します。"
        return
      }

      if (['AAA'].includes(expand)) {
        // 将来のエラー用
        console.log("想定外の拡張子")
      } else {
        await copyFile(files, `${saveDirWorkspaceTaskPath}${filename}`)
        await registFile(filename, taskId)
      }
    }
  }).catch((err) => {
    console.log(err)
    errDialog.value = true
    error.value.subTitle = "ファイルの保存に失敗しました。"
    error.value.items = [""]
  })
}

async function registFile(fileName: string, taskId: number) {
  try {
    pending.value = true
    await db.execute(
      "INSERT INTO related_files(name, task_id) VALUES($1, $2)",
      [fileName, taskId]
    )
    await getTaskFiles(taskId)
    pending.value = false
  } catch(err) {
    errDialog.value = true
    error.value.subTitle = "ファイル名のDBの保存に失敗しました。"
  }
  pending.value = false
}

const taskFiles: Ref<TaskFile[]> = ref([])
const taskFilesSize: Ref<number> = ref(0)
async function getTaskFiles(taskId: number): Promise<void> {
  try {
    pending.value = true
    taskFiles.value = await db.select(
      "SELECT id, name FROM related_files WHERE task_id = $1",
      [taskId]
    )
    taskFilesSize.value = taskFiles.value.length
    pending.value = false
  } catch(err) {
    errDialog.value = true
    error.value.subTitle = "関連ファイルの取得に失敗しました。"
  }
  pending.value = false
}

async function deleteTaskFile(fileId: number, fileName: string, taskId: number) {
  try {
    // Db更新処理
    invoke('delete_file', { fileName: fileName})
    await db.select(
      "DELETE FROM related_files WHERE id = $1",
      [fileId]
    )
    await getTaskFiles(taskId)
  } catch (err) {
    errDialog.value = true
    error.value.subTitle = "関連ファイルの削除に失敗しました。"
  }
}

function closeRegistDialog() {
  if (pending.value) {
    return
  } else {
    registDialog.value = false
  }
}

// タスク削除
const deleteTaskDialog: Ref<boolean> = ref(false)
async function deleteTask(id: number) {
  try {
    pending.value = true
    await db.execute(
      "DELETE FROM tasks WHERE id = $1",
      [id]
    )
    await getTaskList()
    deleteTaskDialog.value = false
    detailDialog.value = false
  } catch (err) {
    errDialog.value = true
    error.value.subTitle = "タスクの削除に失敗しました。"
    error.value.items = [""]
  }
  pending.value = false
}

// ワークスペース名
const workspaceName: Ref<string> = ref("")
await getWorkspacesName(Number(workspaceId))
async function getWorkspacesName(workspaceId: number) {
  try {
    const workspaces: WorkspaceName[] = await db.select(
      "SELECT name FROM workspaces WHERE id = $1",
      [workspaceId]
    )
    workspaceName.value = workspaces[0].name
  } catch (err) {
    errDialog.value = true
    error.value.subTitle = "ワークスペース名の取得に失敗しました。"
    error.value.items = [""]
  }
}

const breadcrumbsItems = [
  {
    title: 'ワークスペース一覧',
    disabled: false,
    href: '/',
  },
  {
    title: workspaceName.value,
    disabled: true,
    href: '',
  },
]

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
  if (tasksSize.value !== 0) {
    taskList.value.todo.data.splice(0)
    taskList.value.working.data.splice(0)
    taskList.value.waiting.data.splice(0)
    taskList.value.done.data.splice(0)
  }
  try {
    const tasks: Task[] = await db.select(
      "SELECT id, name, descript, status, deadline, priority FROM tasks WHERE workspace_id = $1",
      [workspaceId]
    )

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
    }
    taskList.value.todo.data = todoTasks.value
    taskList.value.working.data = workingTasks.value
    taskList.value.waiting.data = waitingTasks.value
    taskList.value.done.data = doneTasks.value
  } catch (err) {
    errDialog.value = true
    error.value.subTitle = "タスクの取得に失敗しました。"
    error.value.items = [""]
  }
}

// タスク詳細取得
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
  try {
     // メインタスク取得
    const mainTasks: TaskDetail[] = await db.select(
      "SELECT id, name, descript, status, deadline, note, priority, created_at FROM tasks WHERE id = $1",
      [taskId]
    )
    taskDetail.value = mainTasks[0]
    await getSubTasks(taskId)
    await getTaskFiles(taskId)
  } catch (err) {
    errDialog.value = true
    error.value.subTitle = "タスク詳細の取得に失敗しました。"
    error.value.items = [""]
  }
}

// タスク登録
const newTaskName: Ref<string> = ref("")
const newTaskDescript: Ref<string> = ref("")
const newTaskDeadline: Ref<string> = ref("")
async function addTask(): Promise<void> {
  try {
    // Db更新処理
    await db.execute(
      "INSERT INTO tasks (name, descript, status, workspace_id, deadline) VALUES ($1, $2, 'todo', $3, $4)",
      [newTaskName.value, newTaskDescript.value, workspaceId, newTaskDeadline.value]
    )
    getTaskList()
    registDialog.value = false
  } catch (err) {
    errDialog.value = true
    error.value.subTitle = "タスクの登録に失敗しました。"
    error.value.items = [""]
  }
}

// サブタスク
const subTasks: Ref<SubTask[]> = ref([])
const subTasksSize: Ref<number> = ref(0)
// // サブタスク取得
async function getSubTasks(taskId: number) {
  try {
    const searchSubTasks: SubTask[] = await db.select(
    "SELECT id, name, is_done FROM sub_tasks WHERE task_id = $1",
    [taskId])

    subTasksSize.value = searchSubTasks.length

    if (subTasksSize.value !== 0) {
      subTasks.value = searchSubTasks
    }
  } catch (err) {
    errDialog.value = true
    error.value.subTitle = "サブタスクの取得に失敗しました。"
    error.value.items = [""]
  }
}

// サブタスク登録処理
const registSubTaskDialog: Ref<boolean> = ref(false)
const registSubTaskId: Ref<number> = ref(0)
const registSubTaskName: Ref<string> = ref("")
function registSubTaskDialogOpen(task_id: number): void {
  registSubTaskDialog.value = true
  registSubTaskId.value = task_id
}
async function registSubTask(task_id: number) : Promise<void> {
  try {
    // Db更新処理
    await db.execute(
      "INSERT INTO sub_tasks (name, task_id) VALUES ($1, $2)",
      [registSubTaskName.value, task_id]
    )
    await getSubTasks(task_id)
    registSubTaskName.value = ""
    registSubTaskDialog.value = false
  } catch (err) {
    error.value.subTitle = "サブタスクの登録に失敗しました。"
    error.value.items = [""]
    errDialog.value = true
  }
}

// サブタスク更新処理
async function updateSubTask(subTaskId: number, status: boolean): Promise<void> {

  try {
    // Db更新処理
    await db.execute(
      "UPDATE sub_tasks SET is_done = $1 WHERE id = $2",
      [status, subTaskId]
    )
  } catch (err) {
    errDialog.value = true
    error.value.subTitle = "サブタスクの更新に失敗しました。"
    error.value.items = [""]
  }
}

// サブタスク削除処理
async function deleteSubTask(subTaskId: number, task_id: number): Promise<void> {
  try {
    // Db更新処理
    await db.select(
      "DELETE FROM sub_tasks WHERE id = $1",
      [subTaskId]
    )
    getSubTasks(task_id)
  } catch (err) {
    errDialog.value = true
    error.value.subTitle = "サブタスクの削除に失敗しました。"
    error.value.items = [""]
  }
}

// タスク詳細を開く
const detailDialog: Ref<boolean> = ref(false)
const openTaskId: Ref<number> = ref(0)
async function detailDialogOpen(id: number) {
  openTaskId.value = id
  await getTaskDetail(id)
  detailDialog.value = true
}

// ワークスペース削除処理
const deleteWorkspaceDialog: Ref<boolean> = ref(false)
async function deleteWorkspace(): Promise<void> {
  pending.value = true
  await db.execute(
    "DELETE FROM workspaces WHERE id = $1", [workspaceId]
  ).catch((err) => {
    errDialog.value = true
    error.value.subTitle = "ワークスペースの削除に失敗しました。"
    error.value.items = [""]
  })
  deleteWorkspaceDialog.value = false
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

.task-file {
  cursor: pointer;
}

</style>
