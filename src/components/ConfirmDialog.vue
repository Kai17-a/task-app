<template>
  <v-dialog v-model="$props.isOpen" width="350" :persistent="pending">
    <v-card :title="$props.title">
      <v-card-text max-width="auto">
        {{ $props.message }}
      </v-card-text>

      <v-card-actions max-width="300">
        <v-spacer></v-spacer>
        <v-btn :disabled="pending" variant="outlined" :color="$props.btnColor" text="キャンセル" @click="close" />
        <v-btn :loading="pending" variant="flat" :color="$props.btnColor" text="削除" @click="execute" />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script lang="ts" setup>
const pending: Ref<boolean> = ref(false)

const props = defineProps(['isOpen', 'title', 'message', 'btnColor'])
const emit = defineEmits(['close', 'func'])

// ダイアログを閉じる処理
const close = () => {
  emit('close')
}

// 連携された処理を実行
const execute = () => {
  pending.value = true
  emit('func')
  pending.value = false
  close()
}

</script>
