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

submitButton.addEventListener('click', async () => {
    output.innerText = 'searching';
    results_table.innerHTML = '';  // Clear previous results
    // @ts-expect-error it exists
    const res =  await api.searchSuppliers(supplier.value, token.value);
    console.log('res', res)  
    
    if (res.length > 0) {
        displaySuppliers(res);
        output.innerText = `${res.length} suppliers found`;
        
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

window.addEventListener('beforeunload', async () => {
    const inputs = {
        token: token.value,
        supplier: supplier.value,
    };
    // @ts-expect-error it exists
    await api.saveInputs(inputs);
});

