<template>
  <v-app>
    <v-navigation-drawer permanent rail>
      <v-list density="compact" nav color="primary">
        <v-list-item :active="checkPath('/')" prepend-icon="mdi-home" value="home" @click="navigateTo('/')">
          <v-tooltip activator="parent" location="start">ホーム</v-tooltip>
        </v-list-item>
        <v-divider class="mb-1"></v-divider>

        <!-- ワークスペースリスト -->
        <v-list-item v-for="workspace in workspaces"
          :active="checkPath(`/workspaces/${workspace.id}`)"
          :key="workspace.id"
          :value="workspace.name"
          color="primary"
          @click="navigateTo(`/workspaces/${workspace.id}`)"
        >
          <template v-slot:title>
            <span class="d-flex justify-center" style="font-size: large;">
              {{ workspace.name.substring(0,1) }}
            </span>
          </template>
          <v-tooltip activator="parent" location="start">{{ workspace.name }}</v-tooltip>
        </v-list-item>

        <!-- ワークスペース追加 -->
        <v-list-item prepend-icon="mdi-plus-circle-outline" value="add">
          <v-tooltip activator="parent" location="start">ワークスペース追加</v-tooltip>
        </v-list-item>
        <v-divider class="mb-1"></v-divider>

        <!-- 設定 -->
        <v-list-item prepend-icon="mdi-cog" value="setting">
          <v-tooltip activator="parent" location="start">設定</v-tooltip>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-main class="mx-5 mt-5">
      <slot />
    </v-main>
  </v-app>
</template>
<script lang="ts" setup>
import Database from "tauri-plugin-sql-api"

interface WorkSpace {
  id: number;
  name: string;
}

const db = await Database.load("sqlite:task_app.db")
// ワークスペース取得
const workspaces: WorkSpace[] = await db.select("SELECT id, name FROM workspaces")

function checkPath(path: string): boolean {
  const route = useRoute()
  const currentPath = route.path
  return currentPath === path
}
</script>
<style scoped>
.link {
  cursor: pointer;
  user-select: none;
}
</style>
