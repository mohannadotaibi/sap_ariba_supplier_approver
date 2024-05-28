<template>
    <div id="results-table">
      <table v-if="results.length" style="width: 100%; background-color: red;">
        <thead>
          <tr>
            <th>Supplier Name</th>
            <th>ID</th>
            <th>Profile</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="supplier in results" :key="supplier.supplier.smVendorId">
            <td>{{ supplier.supplier.name }}</td>
            <td>{{ supplier.supplier.smVendorId }}</td>
            <td>
              <a :href="'https://example.com/profile/' + supplier.supplier.smVendorId" target="_blank">Profile</a>
            </td>
            <td v-if="supplier.vendor.vendor.vendorInfo.registrationStatus === 'PendingApproval'">
              <button @click="approveVendor(supplier.registrationTaskId)">Approve</button>
            </td>
            <td v-else>x</td>
          </tr>
        </tbody>
      </table>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  const results = ref([]);
  
  const approveVendor = async (taskId) => {
    const token = ref('');
    await window.api.approveVendor(taskId, token.value);
  };
  </script>
  
  <style scoped>
  /* Add your styles here */
  </style>
  