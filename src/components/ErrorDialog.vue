<template>
  <v-dialog v-model="props.isOpen" width="450">
    <v-card title="エラー" color="red-lighten-5">
      <template v-slot:append>
        <v-icon icon="mdi-close" @click="close"></v-icon>
      </template>
      <v-card-text max-width="auto">
        <p>{{ $props.subTitle }}</p>
        <div v-if="items.length !== 0">
          以下の確認をしてください。
          <div v-for="item in items">
            <li>{{ item }}</li>
          </div>
          <br>
          <p>それ以外の場合は開発者に聞いてね(/・ω・)/</p>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>
<script lang="ts" setup>
const props = defineProps(['isOpen', 'subTitle', 'items'])
const emit = defineEmits(['close'])
const close = () => {
  emit('close')
}

</script>
