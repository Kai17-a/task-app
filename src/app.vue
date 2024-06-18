<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
<script setup>
import Database from "tauri-plugin-sql-api"

const db = await Database.load("sqlite:task_app.db")
</script>
