<template>
	<div id="results-table" class="mb-2">
		<div class="relative overflow-x-auto">
			<table v-if="results.length" class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
				<thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
					<tr>
						<th scope="col" class="px-6 py-3">Supplier Name</th>
						<th scope="col" class="px-6 py-3">ID</th>
						<th scope="col" class="px-6 py-3">Profile</th>
						<th scope="col" class="px-6 py-3">Actions</th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="supplier in results" :key="supplier.supplier.smVendorId" class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
						<td class="px-6 py-4">{{ supplier.supplier.name }}</td>
						<td class="px-6 py-4">{{ supplier.supplier.smVendorId }}</td>
						<td class="px-6 py-4">
							<a :href="'https://example.com/profile/' + supplier.supplier.smVendorId" target="_blank">Profile</a>
						</td>
						<td v-if="supplier.vendor.vendor.vendorInfo.registrationStatus === 'PendingApproval'"  class="px-6 py-4">
							<button @click="approveVendor(supplier.registrationTaskId)">Approve</button>
						</td>
						<td v-else>x</td>
					</tr>
				</tbody>
			</table>
		</div>
		
	</div>
</template>

<script setup>
	import { ref, watch } from 'vue';
	import {useStore} from '../../store/main';
	import {storeToRefs} from 'pinia';

    const store = useStore(); // store is now a reactive object
	
	const { apiToken } = storeToRefs(store);

	const props = defineProps({
		results: {
			type: Array,
			required: true
		}
	});

	console.log('props results', props.results.value);

	const results = ref(props.results);

	watch(() => props.results, newResults => {
			console.log('ResultsTable received new results:', newResults);
			results.value = newResults;
		}
	);

	const approveVendor = async taskId => {
		const res = await window.api.approveVendor(taskId, apiToken);
		if (res.statusCode === 200) {
            console.log('Vendor approved:', res);
            alert('Approval successful!');
            // Do something with the vendor data
        } else {
            console.error('Approval failed:', res.message);
            alert('Approval failed!');
        }
	};
</script>

<style scoped>
	/* Add your styles here */
</style>
