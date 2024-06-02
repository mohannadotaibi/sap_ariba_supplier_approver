<template>
	<div id="supplier-info">
		<table v-if="supplier" style="width: 100%; background-color: red">
			<thead>
				<tr>
					<th>Question</th>
					<th>Answer</th>
				</tr>
			</thead>
			<tbody>
				<tr v-for="qnaItem in supplier.questionnaire.items" :key="qnaItem.externalSystemCorrelationId">
					<td v-if="qnaItem.isSection" :colspan="2" style="background-color: #f0f0f0">{{ qnaItem.question }}</td>
					<template v-else>
						<td>{{ qnaItem.question }}</td>
						<td>{{ qnaItem.answer }}</td>
					</template>
				</tr>
			</tbody>
		</table>
	</div>
</template>

<script setup lang="ts">
	import { ref, watch, defineProps } from 'vue';

	const props = defineProps({
		token: String,
		supplier: Object
	});

	const supplier = ref(props.supplier);

	watch(supplier, newVal => {
		console.log('supplier updated');
	});
</script>

<style scoped>
	/* Add your styles here */
</style>
