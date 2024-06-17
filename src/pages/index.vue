<template>
  <h1>HOME</h1>

  <div class="mt-5">
    <h3>ワークスペース</h3>
    <div class="tasks mt-3" v-if="taskListSize !== 0">
      <v-row>
        <v-col v-for="task in taskList" md="6">
          <v-card
            class="mx-auto"
            height="150"
            min-width="200"
            subtitle="Same looks, no anchor"
            :title="task.name"
            hover
            @click="navigateTo(`/workspaces/${task.workspaceId}`)"
          >
            <div class="pl-3">
              <v-chip class="ml-2 mt-1" density="compact" variant="flat" color="secondary">未着手: 1</v-chip>
              <v-chip class="ml-2 mt-1" density="compact" variant="flat" color="yellow">作業中: 1</v-chip>
              <v-chip class="ml-2 mt-1" density="compact" variant="flat" color="primary">レビュー待ち: 1</v-chip>
              <v-chip class="ml-2 mt-1" density="compact" variant="flat" color="green">完了: 1</v-chip>
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


// メイン部分
const emptyList: object[] = []
const testList: object[] = [
  {
    workspaceId: '1',
    name: 'ワークスペース１',
    taskSize: 8,
    tasks: {
      todo: 2,
      working: 2,
      waiting: 2,
      done: 2
    }
  },
  {
    workspaceId: '2',
    name: 'ワークスペース２',
    taskSize: 6,
    tasks: {
      todo: 2,
      working: 2,
      waiting: 1,
      done: 1
    }
  },
  {
    workspaceId: '3',
    name: 'ワークスペース３',
    taskSize: 4,
    tasks: {
      todo: 2,
      working: 1,
      waiting: 0,
      done: 1
    }
  },
  {
    workspaceId: '4',
    name: 'ワークスペース４',
    taskSize: 4,
    tasks: {
      todo: 2,
      working: 1,
      waiting: 0,
      done: 1
    }
  },
  {
    workspaceId: '5',
    name: 'ワークスペース５',
    taskSize: 4,
    tasks: {
      todo: 2,
      working: 1,
      waiting: 0,
      done: 1
    }
  },
  {
    workspaceId: '6',
    name: 'ワークスペース６',
    taskSize: 4,
    tasks: {
      todo: 2,
      working: 1,
      waiting: 0,
      done: 1
    }
  },
]
const taskList: Ref<object[]> = ref(testList)
// const taskList: Ref<object[]> = ref(emptyList)
const taskListSize: Ref<number> = ref(taskList.value.length)
</script>
<style scoped>
.tasks {
  user-select: none;
}
</style>
