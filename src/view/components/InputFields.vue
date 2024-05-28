<template>
    <div id="input-fields" style="text-align:center; display:flex; flex-direction:column">
      <div style="display:flex; flex-direction:column">
        <label for="token">Token</label>
        <input type="text" name="token" id="token" v-model="token" placeholder="Enter your token">
      </div>
      <div style="display:flex; flex-direction:column; margin-bottom:14px">
        <label for="supplier">Supplier</label>
        <input type="text" name="supplier" id="supplier" v-model="supplier" value="Projacs Academy" placeholder="Enter your supplier name">
      </div>
      <button id="submit" @click="searchSuppliers">Submit</button>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  
  const token = ref('');
  const supplier = ref('');
  
  const searchSuppliers = async () => {
    const output = document.getElementById('output');
    const results_table = document.getElementById('results-table');
    output.innerText = 'searching';
    results_table.innerHTML = '';
  
    const res = await window.api.searchSuppliers(supplier.value, token.value);
  
    if (res.length > 0) {
      output.innerText = `${res.length} suppliers found`;
      // You can add a method to update results here
    } else {
      output.innerText = 'No suppliers found or error in response';
    }
  };
  </script>
  
  <style scoped>
  /* Add your styles here */
  </style>
  