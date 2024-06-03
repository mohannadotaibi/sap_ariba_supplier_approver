<template>
  <a id="loginButton" class="group text-black relative inline-block focus:outline-none focus:ring" href="#" @click="openLoginWindow">
  <span class="absolute inset-0 translate-x-0 translate-y-0 bg-yellow-300 transition-transform group-hover:translate-x-1.5 group-hover:translate-y-1.5"  ></span>

  <span class="relative inline-block border-2 border-current px-8 py-3 text-sm font-bold uppercase tracking-widest"  >Login</span>
</a>

</template>

<script setup>
const openLoginWindow = () => {
  window.api.openLoginWindow();
};
</script>
