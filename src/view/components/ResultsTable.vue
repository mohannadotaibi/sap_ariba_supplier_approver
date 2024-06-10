<template>
	<div id="results-table" class="mb-2">
		<div class="relative overflow-x-auto">
			<table v-if="results.length" class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
				<thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
					<tr>
						<th scope="col" class="px-6 py-3">Supplier Name</th>
						<th scope="col" class="px-6 py-3">ID</th>
						<th scope="col" class="px-6 py-3 text-center">Internal</th>
						<th scope="col" class="px-6 py-3 text-center">External</th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="supplier in results" :key="supplier.supplier.smVendorId" class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
						<td class="px-6 py-4">{{ supplier.supplier.name }}</td>
						<td class="px-6 py-4">{{ supplier.supplier.smVendorId }}</td>
						<td v-if="supplier.internalRegistrationTask.canApprove"  class="px-6 py-4 text-center">
							<button @click="approveVendor(supplier.internalRegistrationTask.id)">Approve</button>
						</td>
						<td v-else class=" text-center">x</td>
						<td v-if="supplier.externalRegistrationTask.canApprove"  class="px-6 py-4 text-center">
							<button @click="approveVendor(supplier.externalRegistrationTask.id)">Approve</button>
						</td>
						<td v-else class=" text-center">x</td>
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

	console.log('ResultsTable.vue: props results', props.results.value);

	const results = ref(props.results);

	watch(() => props.results, newResults => {
			console.log('ResultsTable.vue: ResultsTable received new results:', newResults);
			results.value = newResults;
		}
	);

	const approveVendor = async taskId => {
		console.log('ResultsTable.vue: Approving vendor:', taskId, apiToken.value);
		const res = await window.api.approveVendor(taskId, apiToken.value);
		console.log('ResultsTable.vue: already called')
		if (res.statusCode === 200) {
            console.log('ResultsTable.vue: Vendor approved:', res);
            alert('ResultsTable.vue: Approval successful!');
            // Do something with the vendor data
        } else {
            console.error('ResultsTable.vue: Approval failed:', res.message);
            alert('ResultsTable.vue: Approval failed!');
        }
	};
</script>

<style scoped>
	/* Add your styles here */
</style>
