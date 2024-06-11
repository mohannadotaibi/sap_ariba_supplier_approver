<template>
	<div id="supplier-info">
		<div v-if="supplier?.externalRegistrationTask?.questionnaire?.status !=='ERROR'" class="relative overflow-x-auto">
			<table class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
				<thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
					<tr>
						<th scope="col" class="px-6 py-3">Question</th>
						<th scope="col" class="px-6 py-3">Answer</th>
					</tr>
				</thead>
				<tbody>
					<template v-for="qnaItem in qna" :key="qnaItem.externalSystemCorrelationId">
						<template v-if="qnaItem.isSection">
							<tr class="bg-white border-b dark:bg-gray-950 dark:border-gray-700">
								<td :colspan="2" class="px-6 py-4">{{ qnaItem.question }}</td>
							</tr>
							<template v-for="subItem in qnaItem.qna" :key="subItem.externalSystemCorrelationId">
								<template v-if="subItem.isSection">
									<tr class="bg-white border-b dark:bg-gray-950 dark:border-gray-700">
										<td :colspan="2" class="px-6 py-4">{{ subItem.question }}</td>
									</tr>
									<template v-for="nestedItem in subItem.qna" :key="nestedItem.externalSystemCorrelationId">
										<tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
											<td class="px-6 py-4">{{ nestedItem.question }}</td>
											<td v-if="nestedItem.answerType === 'Attachment'" class="px-6 py-4">
												<a class="text-blue-300 underline" :href="nestedItem.answer.downloadUrl" target="_blank">{{ nestedItem.answer.fileName }} </a>
												<span class="ps-2">(size: {{ humanFileSize(nestedItem.answer.fileSize) }})</span>
											</td>
											<td v-else-if="nestedItem.answerType === 'Address'" class="px-6 py-4">
												{{ nestedItem.answer }}
											</td>
											<td v-else-if="nestedItem.answerType === 'CommodityType'" class="px-6 py-4">
												<ul>
													<li v-for="value in nestedItem.answer" :key="value">{{ value }}</li>
												</ul>
											</td>
											<td v-else-if="nestedItem.answerType === 'BankAccount'" class="px-6 py-4">
												<span v-for="(value, key) in nestedItem.answer" :key="key">{{ key }}: {{ value }}<br /></span>
											</td>
											<td v-else class="px-6 py-4">{{ nestedItem.answer }}</td>
										</tr>
									</template>
								</template>
								<template v-else>
									<tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
										<td class="px-6 py-4">{{ subItem.question }}</td>
										<td v-if="subItem.answerType === 'Attachment'" class="px-6 py-4">
											<a class="text-blue-300 underline" :href="subItem.answer.downloadUrl" target="_blank">{{ subItem.answer.fileName }} </a>
											<span class="ps-2">(size: {{ humanFileSize(subItem.answer.fileSize) }})</span>
										</td>
										<td v-else-if="subItem.answerType === 'Address'" class="px-6 py-4">
											{{ subItem.answer.street }}, {{ subItem.answer.city }}, {{ subItem.answer.state }}, {{ subItem.answer.postalCode }},
											{{ subItem.answer.countryCode }}
										</td>
										<td v-else-if="subItem.answerType === 'CommodityType'" class="px-6 py-4">
											<ul>
												<li v-for="value in subItem.answer" :key="value">{{ value }}</li>
											</ul>
										</td>
										<td v-else-if="subItem.answerType === 'BankAccount'" class="px-6 py-4">
											<span v-for="(value, key) in subItem.answer" :key="key"
												><b class="me-2">{{ key }}</b
												>: {{ value }}<br
											/></span>
										</td>
										<td v-else class="px-6 py-4">{{ subItem.answer }}</td>
									</tr>
								</template>
							</template>
						</template>
						<template v-else>
							<tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
								<td class="px-6 py-4">{{ qnaItem.question }}</td>
								<td class="px-6 py-4">{{ qnaItem.answer }}</td>
							</tr>
						</template>
					</template>
				</tbody>
			</table>
		</div>

		<div v-else>
			<p>No supplier information available</p>
		</div>
	</div>
</template>

<script setup lang="ts">
	import { ref, watch } from 'vue';
	import { combineQuestionsAndAnswers, humanFileSize } from '../../utilities/data-utils';

	const props = defineProps({
		supplier: Object
	});

	const supplier = ref(props.supplier);

	const qna = ref([]);

	const updateQNA = () => {
		const questions = supplier.value.externalRegistrationTask.questionnaire.items;
		const latestVersionIndex = supplier.value.externalRegistrationTask.questionnaire.responses.length - 1;
		const answers = supplier.value.externalRegistrationTask.questionnaire.responses[latestVersionIndex].answers;
		// Combine questions and answers
		qna.value = combineQuestionsAndAnswers(questions, answers);
		console.log('SupplierDetails.vue: qna', qna.value);
	}
	

	watch(() => props.supplier,
		(newResults) => {
			try {
				console.log('SupplierDetails.vue: Supplier Details received new results:', newResults);
				supplier.value = newResults;
				updateQNA();
			} catch (error) {
				console.error(error)
			}
		}
	);
</script>