export const combineQuestionsAndAnswers = (questions, answers) =>{

    console.log('data-utils.ts');
    // 

    let results = [];

    // fill the results array with questions
    results = questions.map(item => {
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

    console.log('SupplierDetails.vue: ', answers.length);

    // Answer the qusetions
    answers.forEach(response => {
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

        const item = findItem(questions, response.externalSystemCorrelationId);

        if (item) {
            if (item.answerType === 'Attachment') {
                item.answer = response.attachmentAnswer;
            } else if (item.answerType === 'Address') {
                item.answer = response.addressAnswer;
            } else if (item.answerType === 'CommodityType') {
                item.answer = response.multiValueAnswer;
            } else if (item.answerType === 'BankAccount') {
                console.log('data-utils.ts: answer type bank account detected', response.bankAccountAnswer);
                item.answer = response.bankAccountAnswer;
            } else {
                item.answer = response.answer;
            }
        }
    });

    return results;
}


export const humanFileSize = (bytes, si = false, dp = 1) => {
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