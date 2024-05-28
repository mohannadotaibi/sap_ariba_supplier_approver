<template>
  <button id="loginButton" @click="openLoginWindow">Log In</button>
</template>

<script setup>
const openLoginWindow = () => {
  window.api.openLoginWindow();
};
</script>

<style scoped>
/* Add your styles here */
</style>
