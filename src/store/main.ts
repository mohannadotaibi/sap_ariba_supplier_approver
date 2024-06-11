import { defineStore } from 'pinia';

export const useStore = defineStore('main', {
    state: () => {
        return {
            apiToken: JSON.parse(localStorage.getItem("apiToken")) || null,
            supplierNameSearchField: JSON.parse(localStorage.getItem("supplierNameSearchField")) || null,
            isAuthenticated: false,
        }
    },
    actions: {
        setToken(token) {
            this.apiToken = token;
            this.presistToLocalStorage();
        },
        setIsAuthenticated(isAuthenticated: boolean) {
            this.isAuthenticated = isAuthenticated;
            this.presistToLocalStorage();
        },
        setSupplierNameSearchField(searchField: string) {
            this.supplierNameSearchField = searchField;
            this.presistToLocalStorage(); 
        },

        presistToLocalStorage() {
            localStorage.setItem("apiToken", JSON.stringify(this.apiToken));
            localStorage.setItem("supplierNameSearchField", JSON.stringify(this.supplierNameSearchField));
            localStorage.setItem("isAuthenticated", JSON.stringify(this.isAuthenticated));
        },
        async refreshAuthentication() {
            if (!this.apiToken) {
                console.log('store/main.ts: No token available');
                this.setIsAuthenticated(false);
                return;
            }

            try {
                // @ts-expect-error some error
                const refreshResult = await window.api.refreshToken(this.apiToken);
                if (refreshResult.error) {
                    throw new Error('store/main.ts: Authentication failed due to known error');
                }
                this.setToken(refreshResult);
                this.setIsAuthenticated(true);
            } catch (error) {
                console.error('store/main.ts: Authentication refresh error:', error.message);
                this.setToken(null);
                this.setIsAuthenticated(false);
            }
        },
        async checkAuthenticated() {
            await this.refreshAuthentication();

            // Setup interval to refresh token every 2 minutes
            setInterval(async () => {
                await this.refreshAuthentication();
            }, 120000);
        }
    }

})