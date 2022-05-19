<template>
  <main font-sans p="x-4 y-10" text="center gray-700 dark:gray-200">
    <matching-picture></matching-picture>
    <Footer />
  </main>
</template>

<script setup lang="ts">
import { baseImage } from "./request";
baseImage();
</script>

<style scoped></style>
