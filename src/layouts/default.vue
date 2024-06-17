<template>
  <v-app>
    <v-navigation-drawer permanent rail>
      <v-list density="compact" nav color="primary">
        <v-list-item :active="true" prepend-icon="mdi-home" value="home" @click="navigateTo('/')">
          <v-tooltip activator="parent" location="start">ホーム</v-tooltip>
        </v-list-item>
        <v-divider class="mb-1"></v-divider>
        <v-list-item v-for="workspace in workspaces" :key="workspace.id" :value="workspace.title" @click="navigateTo(`/workspaces/${workspace.id}`)">
          <template v-slot:prepend>
            <v-icon :icon="workspace.icon"></v-icon>
          </template>
          <v-tooltip activator="parent" location="start">ワークスペース追加</v-tooltip>
        </v-list-item>
        <v-list-item prepend-icon="mdi-plus-circle-outline" value="add">
          <v-tooltip activator="parent" location="start">ワークスペース追加</v-tooltip>
        </v-list-item>
        <v-divider class="mb-1"></v-divider>
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
const workspaces: object[] = [
  {
    id: 1,
    title: "title1",
    descript: "説明",
    icon: "mdi-arrow-up"
  },
  {
    id: 2,
    title: "title2",
    descript: "説明",
    icon: "mdi-arrow-down"
  },
  {
    id: 3,
    title: "title3",
    descript: "説明",
    icon: "mdi-arrow-right"
  },
  {
    id: 4,
    title: "title4",
    descript: "説明",
    icon: "mdi-arrow-left"
  },
]
</script>
<style scoped>
.link {
  cursor: pointer;
  user-select: none;
}
</style>
