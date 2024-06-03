<template>
	<div id="results-table">
		<table v-if="results.length" style="width: 100%; background-color: red">
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
