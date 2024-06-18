<template>
  <h1>HOME</h1>

  <div class="mt-5">
    <h3>ワークスペース</h3>
    <div class="tasks mt-3" v-if="taskListSize !== 0">
      <v-row>
        <v-col v-for="workspace in aggregatedData" md="4">
          <v-card
            class="mx-auto"
            height="230"
            min-width="200"
            :subtitle="workspace.descript"
            :title="workspace.name"
            hover
            @click="navigateTo(`/workspaces/${workspace.id}`)"
          >
            <div v-for="status in workspace.statuses" class="pl-3">
              <v-chip v-if="status.status !== null" density="compact" variant="flat" :color="getStatusColor(status.status)">
                {{ getStatusName(status.status) }}: {{ status.count }}
              </v-chip>
              <div class="ml-2 mt-1 text-disabled" v-else>タスクなし</div>
              <br />
            </div>

          </v-card>
        </v-col>
        <v-col md="6">
          <v-card
            class="d-flex align-center mb-6"
            min-height="150"
            max-width="200"
            hover
          >
            <div style="margin: auto;">
              <p class="text-h5 text-disabled text-center">
                追加
              </p>
              <div class="d-flex justify-center">
                <v-btn class="ma-2" size="small" color="grey-lighten-5" icon="mdi-plus"></v-btn>
              </div>
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

interface WorkSpace {
  id: number;
  count: number;
  name: string;
  descript: string;
  status: string;
}

interface AggregatedTask {
    id: number;
    name: string;
    descript: string;
    statuses: { status: string; count: number; }[];
}

const db = await Database.load("sqlite:task_app.db")
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
    w.name,
    t.status;
`)

const aggregatedData: AggregatedTask[] = workspaces.reduce((result: AggregatedTask[], item: WorkSpace) => {
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

aggregatedData.forEach(entry => {
    entry.statuses.sort((a, b) => {
        const order = ['todo', 'working', 'waiting', 'done'];
        return order.indexOf(a.status) - order.indexOf(b.status);
    });
});
console.log(aggregatedData)
const taskListSize: Ref<number> = ref(aggregatedData.length)

function getStatusName(status: string): string {
  switch (status) {
    case "todo":
      return "未着手"
    case "working":
      return "作業中"
    case "waiting":
      return "レビュー待ち"
    case "done":
      return "完了"
    default:
      return "未定義";
  }
}
function getStatusColor(status: string): string {
  switch (status) {
    case "todo":
      return "secondary"
    case "working":
      return "yellow"
    case "waiting":
      return "primary"
    case "done":
      return "green"
    default:
      return "gray";
  }
}
</script>
<style scoped>
.tasks {
  user-select: none;
}
</style>
