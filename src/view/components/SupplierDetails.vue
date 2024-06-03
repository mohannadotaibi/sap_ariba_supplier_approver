<template>
	<div id="supplier-info">
		<table v-if="supplier.length > 0" style="width: 100%; background-color: red">
			<thead>
				<tr>
					<th>Question</th>
					<th>Answer</th>
				</tr>
			</thead>
			<tbody>
				<tr v-for="qnaItem in qna" :key="qna.externalSystemCorrelationId">
					<td v-if="qnaItem.isSection" :colspan="2" style="background-color: #f0f0f0">{{ qnaItem.question }}</td>
					<template v-else>
						<td>{{ qnaItem.question }}</td>
						<td>{{ qnaItem.answer }}</td>
					</template>
				</tr>
			</tbody>
		</table>
		<div v-else>
			<p>No supplier information available</p>
		</div>
	</div>
</template>

<script setup lang="ts">
	import { ref, watch, defineProps } from 'vue';

	const props = defineProps({
		token: String,
		supplier: Object
	});

	const supplier = ref(props.supplier);

	const qna = ref({});

	const updateQna = (mySupplier) =>{
		console.log(mySupplier.length);
		qna.value = mySupplier[0].questionnaire.items.map(item => {
			
			const qnaItem = {
				question: item.label,
				isSection: item.section,
				externalSystemCorrelationId: item.externalSystemCorrelationId,
				qna: []
			};

			if (item.section) {
				qnaItem.qna = item.items.map(subItem => {
					return {
						question: subItem.label,
						isSection: subItem.section,
						externalSystemCorrelationId: subItem.externalSystemCorrelationId,
						answer: ''
					};
				});
			}

			return qnaItem;
		});
		console.log(supplier.value[0].questionnaire.responses.length)

		supplier.value[0].questionnaire.responses.forEach(version => {
			version.answers.forEach(response => {
				const item = qna.value.find(item => {
					if (item.isSection) {
						return item.qna.find(subItem => subItem.externalSystemCorrelationId === response.externalSystemCorrelationId);
					} else {
						return item.externalSystemCorrelationId === response.externalSystemCorrelationId;
					}
				});

				if (item) {
					if (item.isSection) {
						const subItem = item.qna.find(subItem => subItem.externalSystemCorrelationId === response.externalSystemCorrelationId);
						if (subItem) {
							subItem.answer = response.answer;
						}
					} else {
						item.answer = response.answer;
					}
				}
			});
		});

	}

	watch(supplier, newVal => {
		console.log('supplier updated');
	});

	watch(() => props.supplier, newResults => {
			console.log('Supplier Details received new results:', newResults);
			supplier.value = newResults;
			updateQna(newResults);
		}
	);
</script>

<style scoped>
	/* Add your styles here */
</style>
