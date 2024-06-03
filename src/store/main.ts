import {defineStore} from 'pinia';

export const useStore = defineStore('main', {
    state:() =>{
        return{
            apiToken: JSON.parse(localStorage.getItem("apiToken")) || null,

            supplierNameSearchField: JSON.parse(localStorage.getItem("supplierNameSearchField")) || null,
        }
    },
    actions:{
        setToken(token){
            this.apiToken = token;
            this.presistToLocalStorage();
        },
        setSupplierNameSearchField(searchField: string){
            this.supplierNameSearchField = searchField;
            this.presistToLocalStorage();
        },
        presistToLocalStorage(){
            localStorage.setItem("apiToken", JSON.stringify(this.apiToken));
            localStorage.setItem("supplierNameSearchField", JSON.stringify(this.supplierNameSearchField));
        }
    }
})