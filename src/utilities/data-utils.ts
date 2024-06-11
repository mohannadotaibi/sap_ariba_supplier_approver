export const combineQuestionsAndAnswers = (questions, answers) => {
    console.log('Combining questions with answers');

    const answerMap = new Map(answers.map(answer => [answer.externalSystemCorrelationId, answer]));

    const processItems = (items) => {
        return items.map(item => {
            const newItem = {
                question: item.label,
                isSection: item.section,
                answerType: item.answerType,
                externalSystemCorrelationId: item.externalSystemCorrelationId,
                answer: answerMap.has(item.externalSystemCorrelationId) ? mapAnswer(item, answerMap.get(item.externalSystemCorrelationId)) : null,
                qna: item.items ? processItems(item.items) : []
            };
            return newItem;
        });
    };

    const mapAnswer = (item, answer) => {
        switch (item.answerType) {
            case 'Attachment':
                return answer.attachmentAnswer;
            case 'Address':
                return `${answer.addressAnswer.street}, ${answer.addressAnswer.city}, ${answer.addressAnswer.state}, ${answer.addressAnswer.postalCode}, ${answer.addressAnswer.countryCode}`;
            case 'CommodityType':
                return answer.multiValueAnswer;
            case 'BankAccount':
                return Object.entries(answer.bankAccountAnswer).map(([key, value]) => `${key}: ${value}`).join(", ");
            default:
                return answer.answer;
        }
    };

    return processItems(questions);
};



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