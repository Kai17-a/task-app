<template>
  <div class="d-flex mt-3">
      <h1 class="me-auto">ワークスペース</h1>
      <v-btn class="align-self-center" variant="flat" color="primary" @click="registWorkspaceDialog = true">ワークスペース追加</v-btn>
  </div>

  <div class="mt-5">
    <div class="tasks mt-3" v-if="workspacesSize !== 0">
      <v-dialog v-model="registWorkspaceDialog" width="600">
        <v-card title="タスク追加">
          <template v-slot:append>
            <v-icon icon="mdi-close" :class="(registPending) ? 'not-allowed' : ''" @click="registWorkspaceDialog = false"></v-icon>
          </template>

          <v-form @submit.prevent>
            <div class="ml-10 mr-10">
              <div class="text-right">
                {{ newWorkspaceName.length }}&nbsp;/&nbsp;15
              </div>
              <v-text-field
                v-model="newWorkspaceName"
                :rules="[v => !!v || 'ワークスペース名は必須です']"
                label="ワークスペース名"
                density="compact"
                variant="outlined"
                maxlength="15"
                class="mb-3"
              />
              <div class="text-right">
                {{ newWorkspaceDescript.length }}&nbsp;/&nbsp;15
              </div>
              <v-textarea label="説明" variant="outlined" rows="1" v-model="newWorkspaceDescript" />
            </div>
            <v-card-actions max-width="300">
              <v-spacer></v-spacer>
              <v-btn type="submit" variant="flat" color="primary" text="ワークスペース追加" @click="addWorkSpace" />
            </v-card-actions>
          </v-form>
        </v-card>
      </v-dialog>

      <ErrorDialog
        v-model="registErrDialog"
        :subTitle="error.subTitle"
        :items="error.items"
        @close="registErrDialog = false"
      />

      <v-row>
        <v-col v-for="workspace in aggregatedData" md="4">
          <v-card
            class="mx-auto"
            height="230"
            min-width="200"
            :subtitle="workspace.descript"
            :title="workspace.name"
            color="#fdfdfd"
            hover
            @click="navigateTo(`/workspaces/${workspace.id}`)"
          >
            <div v-for="status in workspace.statuses" class="pl-3">
              <v-chip v-if="status.status !== null" density="compact" variant="flat" :color="getStatusColor(status.status)" class="mb-1">
                {{ getStatusName(status.status) }}: {{ status.count }}
              </v-chip>
              <div class="ml-2 mt-1 text-disabled" v-else>タスクなし</div>
              <br />
            </div>

          </v-card>
        </v-col>
      </v-row>
    </div>
    <v-row>
    </v-row>
  </div>
</template>
<script lang="ts" setup>
import Database from "tauri-plugin-sql-api"
import type { WorkSpace } from '~/types/workspace'
import type { AggregatedTask } from '~/types/task'
import type { Error } from '~/types/error'

const registWorkspaceDialog: Ref<boolean> = ref(false)
const registPending: Ref<boolean> = ref(false)

const db = await Database.load("sqlite:task_app.db")

const aggregatedData: Ref<AggregatedTask[]> = ref([])
const workspacesSize: Ref<number> = ref(0)
await getWorkspaces()

async function getWorkspaces(): Promise<void> {
  // ワークスペース取得
  const workspaces: WorkSpace[] = await db.select(`
    SELECT
      w.id,
      w.name,
      w.descript,
      t.status,
      COUNT(*) AS count
    FROM
      workspaces w
    left join
      tasks t
    on
      w.id = t.workspace_id
    GROUP BY
      w.name,
      t.status
    ORDER BY
      w.created_at,
      w.name,
      t.status;
  `)

  // ワークスペース内のstatus集計処理
  const data = workspaces.reduce((result: AggregatedTask[], item: WorkSpace) => {
    const { id, name, status, count, descript } = item;
    // 名前ごとのエントリーを検索または新規作成
    let nameEntry = result.find(entry => entry.name === name);
    if (!nameEntry) {
        nameEntry = { id, name, descript, statuses: [] };
        result.push(nameEntry);
    }
    // ステータスのエントリーを検索または新規作成
    let statusEntry = nameEntry.statuses.find(entry => entry.status === status);
    if (statusEntry) {
        statusEntry.count += count;
    } else {
        nameEntry.statuses.push({ status, count });
    }
    return result;
  }, []);

  data.forEach(entry => {
    entry.statuses.sort((a, b) => {
        const order = ['todo', 'working', 'waiting', 'done'];
        return order.indexOf(a.status) - order.indexOf(b.status);
    });
  });

  workspacesSize.value = data.length
  aggregatedData.value = data
}

const newWorkspaceName: Ref<string> = ref("")
const newWorkspaceDescript: Ref<string> = ref("")
const registErrDialog: Ref<boolean> = ref(false)
const error: Ref<Error> = ref({subTitle: "", items:[]})
async function addWorkSpace() {
  if (!newWorkspaceName.value) return

  registPending.value = true
  await db.execute(
    "INSERT into workspaces (name, descript) VALUES ($1, $2)",
    [newWorkspaceName.value, newWorkspaceDescript.value]
  ).catch((err) => {
    registErrDialog.value = true
    error.value.subTitle = "登録に失敗しました。"
    error.value.items = ['ワークスペース名が重複していない']
  })
  await getWorkspaces()
  newWorkspaceName.value = ""
  newWorkspaceDescript.value = ""
  registPending.value = false
  registWorkspaceDialog.value = false
}
</script>
<style scoped>
.tasks {
  user-select: none;
}
</style>
