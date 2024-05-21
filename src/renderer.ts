import './view/style.css';
//import { createApp } from 'vue'
//import App from './view/App.vue'

//const app = createApp(App)
//app.mount('#app')


const submitButton = document.getElementById('submit') as HTMLButtonElement;
const supplier = document.getElementById('supplier') as HTMLInputElement;
const output = document.getElementById('output') as HTMLDivElement;
const token = document.getElementById('token') as HTMLInputElement;
const results_table = document.getElementById('results-table') as HTMLTableElement;
const supplier_info = document.getElementById('supplier-info') as HTMLDivElement;

submitButton.addEventListener('click', async () => {
    output.innerText = 'searching';
    results_table.innerHTML = '';  // Clear previous results
    // @ts-expect-error it exists
    const res =  await api.searchSuppliers(supplier.value, token.value);
    console.log('res', res)  
    
    if (res.length > 0) {
        displaySuppliers(res);
        output.innerText = `${res.length} suppliers found`;
        displaySupplierQuestionnaireAnswersTable(res[0]);
        
    } else {
        output.innerText = 'No suppliers found or error in response';
    }

});

function displaySuppliers(suppliers) {
    const table = document.createElement('table');
        table.style.width = '100%';
        table.style.backgroundColor = 'red';

        const thead = table.createTHead();
        const headerRow = thead.insertRow();
        const headers = ['Supplier Name', 'ID', 'Profile', 'Actions'];
        headers.forEach(text => {
            const th = document.createElement('th');
            th.textContent = text;
            headerRow.appendChild(th);
        });

        const tbody = table.createTBody();

    suppliers.forEach(supplierInfo => {
    
        const row = tbody.insertRow();
        row.insertCell().textContent = supplierInfo.supplier.name;
        row.insertCell().textContent = supplierInfo.supplier.smVendorId;

        const profileCell = row.insertCell();
        const profileLink = document.createElement('a');
        profileLink.href = `https://example.com/profile/${supplierInfo.supplier.smVendorId}`;
        profileLink.target = '_blank';
        profileLink.textContent = 'Profile';
        profileCell.appendChild(profileLink);

        const actionCell = row.insertCell();
        
        if (supplierInfo.vendor.vendor.vendorInfo.registrationStatus === "PendingApproval") {
            const approveButton = document.createElement('button');
            approveButton.textContent = 'Approve';
            approveButton.addEventListener('click', () => handleApproval(supplierInfo.registrationTaskId, token.value));
            actionCell.appendChild(approveButton);
        } else {
            actionCell.textContent = 'x';
        }

        results_table.appendChild(table);
        
    });
}

function displaySupplierQuestionnaireAnswersTable(supplier) {
    supplier_info.innerHTML = '';
    const table = document.createElement('table');
    table.style.width = '100%';
    table.style.backgroundColor = 'red';

    const thead = table.createTHead();
    const headerRow = thead.insertRow();
    const headers = ['Question', 'Answer'];

    headers.forEach(text => {
        const th = document.createElement('th');
        th.textContent = text;
        headerRow.appendChild(th);
    });

    const tbody = table.createTBody();

    /*
    supplier.questionnaire is an object which contains two critical proprties for the use in table below, items and responses, items is an array of objects which have a proprety called label
    and a property called section, if it is true, then this item is a section, thus, it will have an array called items, each item will be the question and it has a label as well as
    a labelId ti identify it.
    then we have supplier.questionnaire.responses which is an array of answer versions, each version is an array of answers, each have an itemId linking it back to the itemId in the items array, and an answer proprety which has 
    the answer to the question
    we want to create a new constant where we map the questions labels to the latest version of the matching answer, then we can use it to show the table

    the constant shall be structured like this
    
        const qna = [
            {
                question: 'section titme',
                isSection: true,
                qna: [
                    {
                        question: 'question1',
                        isSection: false,
                        answer: 'answer1'
                    },
                    {
                        question: 'question2',
                        isSection: false,
                        answer: 'answer2'
                    }
                ]
            },
            {
                question: 'question2',
                isSection: false,
                answer: 'answer2'
            }
        ]

    */

    // we can use the items array to create the qna array, then we can use the responses array to fill in the answers
    const qna = supplier.questionnaire.items.map(item => {
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
    }

    );
    console.log('qna before appending', qna)

    // now we can fill in the answers
    supplier.questionnaire.responses.forEach(version => {
        console.log('version detected');

        version.answers.forEach(response => {
            console.log('question detected')

            // the following line will loop through the sections only, will not recursively loop through the subitems
            // const item = qna.find(item => item.externalSystemCorrelationId === response.externalSystemCorrelationId);
            // lets fix it
            const item = qna.find(item => {
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

    console.log('qna', qna);


    // supplier.questionnaire.vendor.vendorInfo.questionnaireAnswers.forEach(answer => {
    //     const row = tbody.insertRow();
    //     row.insertCell().textContent = answer.question;
    //     row.insertCell().textContent = answer.answer;
    // });

    // supplier_info.appendChild(table);

    // Now lets loop through QNA and display a good table with full with TR and TDs for sections, and broken down TRs for questions and answers
    // if it is a section, it should be one td with col-span 2, if it is a question, it should be two tds, one for question and one for answer
    qna.forEach(item => {
        const row = tbody.insertRow();
        
        if (item.isSection) {
            const cell = row.insertCell();
            cell.textContent = item.question;
            // lets make the background a little bit darker
            cell.style.backgroundColor = '#f0f0f0';
            cell.colSpan = 2;

            // then loop through subitems and add rows and cells
            item.qna.forEach(subItem => {
                const subRow = tbody.insertRow();
                const subQuestionCell = subRow.insertCell();
                subQuestionCell.textContent = subItem.question;

                const subAnswerCell = subRow.insertCell();
                subAnswerCell.textContent = subItem.answer;
            });

        } else {

            // we should create two cells, one with question one with answer.
            const questionCell = row.insertCell();
            questionCell.textContent = item.question;

            const answerCell = row.insertCell();
            answerCell.textContent = item.answer;

            
        }
    });
    
    supplier_info.appendChild(table);

}

async function handleApproval(taskId: string, token: string) {
    console.log('Approving task renderer.ts', taskId);
    // @ts-expect-error it exists
    api.approveVendor(taskId, token).then((res) => {
        if (res.statusCode === 200) {
            console.log('Vendor approved:', res);
            alert('Approval successful!');
            // Do something with the vendor data
        } else {
            console.error('Approval failed:', res.message);
            alert('Approval failed!');
        }
    });
}

window.addEventListener('DOMContentLoaded', async () => {
    // @ts-expect-error it exists
    const inputs = await api.loadInputs();

    if (inputs.token) {
        token.value = inputs.token;
    }
    if (inputs.supplier) {
        supplier.value = inputs.supplier;  
    }
}); // what


token.addEventListener('change', async () => {
    console.log('token changed');
    updateInputs();
});

window.addEventListener('beforeunload', async () => {
    await updateInputs();
});

const updateInputs = async () => {
    const inputs = {
        token: token.value,
        supplier: supplier.value,
    };
    // @ts-expect-error it exists
    await api.saveInputs(inputs);
}