<template>
	<div id="supplier-info">
		<div v-if="supplier.length > 0" class="relative overflow-x-auto">
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
									{{ nestedItem.answer.street }}, {{ nestedItem.answer.city }}, {{ nestedItem.answer.state }}, {{ nestedItem.answer.postalCode }},
									{{ nestedItem.answer.countryCode }}
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
								<span v-for="(value, key) in subItem.answer" :key="key"><b class="me-2">{{ key }}</b>: {{ value }}<br /></span>
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

const props = defineProps({
	token: String,
	supplier: Object
});

const supplier = ref(props.supplier);

const qna = ref({});

const updateQna = mySupplier => {
	console.log(mySupplier.length);

	qna.value = mySupplier[0].questionnaire.items.map(item => {
		// preparing the structure only
		const qnaItem = {
			question: item.label,
			isSection: item.section,
			answerType: item.answerType,
			externalSystemCorrelationId: item.externalSystemCorrelationId,
			qna: []
		};

		const processSubItems = items => {
			return items.map(subItem => {
				const subQnaItem = {
					question: subItem.label,
					isSection: subItem.section,
					answerType: subItem.answerType,
					externalSystemCorrelationId: subItem.externalSystemCorrelationId,
					answer: '',
					qna: []
				};
				if (subItem.section) {
					subQnaItem.qna = processSubItems(subItem.items); // Recursively process nested sections
				}
				return subQnaItem;
			});
		};

		if (item.section) {
			qnaItem.qna = processSubItems(item.items);
		}

		return qnaItem;
	});

	console.log(supplier.value[0].questionnaire.responses.length);

	supplier.value[0].questionnaire.responses.forEach(version => {
		version.answers.forEach(response => {
			const findItem = (items, externalSystemCorrelationId) => {
				for (const item of items) {
					if (item.isSection) {
						const foundSubItem = findItem(item.qna, externalSystemCorrelationId);
						if (foundSubItem) return foundSubItem;
					} else if (item.externalSystemCorrelationId === externalSystemCorrelationId) {
						return item;
					}
				}
				return null;
			};

			const item = findItem(qna.value, response.externalSystemCorrelationId);

			if (item) {
				if (item.answerType === 'Attachment') {
					item.answer = response.attachmentAnswer;
				} else if (item.answerType === 'Address') {
					item.answer = response.addressAnswer;
				} else if (item.answerType === 'CommodityType') {
					item.answer = response.multiValueAnswer;
				} else if (item.answerType === 'BankAccount') {
					console.log('answer type bank account detected');
					console.log(response.bankAccountAnswer);
					item.answer = response.bankAccountAnswer;
				} else {
					item.answer = response.answer;
				}
			}
		});
	});

	console.log('qna new value');
	console.log(qna.value);
};


	const humanFileSize = (bytes, si = false, dp = 1) => {
		const thresh = si ? 1000 : 1024;

		if (Math.abs(bytes) < thresh) {
			return bytes + ' B';
		}

		const units = si ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'] : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
		let u = -1;
		const r = 10 ** dp;

		do {
			bytes /= thresh;
			++u;
		} while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);

		return bytes.toFixed(dp) + ' ' + units[u];
	};

	watch(supplier, newVal => {
		console.log('supplier updated');
	});

	watch(
		() => props.supplier,
		newResults => {
			console.log('Supplier Details received new results:', newResults);
			supplier.value = newResults;
			updateQna(newResults);
		}
	);
</script>

<style scoped>
	/* Add your styles here */
</style>
