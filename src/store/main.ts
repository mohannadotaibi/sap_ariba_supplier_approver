import { defineStore } from 'pinia';

export const useStore = defineStore('main', {
    state: (): State => {
        return {
            apiToken: localStorage.getItem("apiToken"), // No need to parse as it is a string
            supplierNameSearchField: localStorage.getItem("supplierNameSearchField"), // No need to parse as it is a string
            isAuthenticated: JSON.parse(localStorage.getItem("isAuthenticated") || 'false'),
        };
    },

    actions: {
        setToken(token: string) {
            this.apiToken = token;
            this.persistToLocalStorage();
        },
        
        setIsAuthenticated(isAuthenticated: boolean) {
            this.isAuthenticated = isAuthenticated;
            this.persistToLocalStorage();
        },

        setSupplierNameSearchField(searchField: string) {
            this.supplierNameSearchField = searchField;
            this.persistToLocalStorage();
        },

        persistToLocalStorage() {
            localStorage.setItem("apiToken", this.apiToken); // No need to stringify as it is a string
            localStorage.setItem("supplierNameSearchField", this.supplierNameSearchField); // No need to stringify as it is a string
            localStorage.setItem("isAuthenticated", JSON.stringify(this.isAuthenticated));
        },

        async refreshAuthentication() {
            if (!this.apiToken) {
                console.log('store/main.ts: No token available');
                this.setIsAuthenticated(false);
                return;
            }

            try {
                // @ts-expect-error refreshToken
                const refreshResult = await window.api.refreshToken(this.apiToken);
                if (refreshResult.error) {
                    throw new Error('store/main.ts: Authentication failed due to known error');
                }
                this.setToken(refreshResult);
                this.setIsAuthenticated(true);
            } catch (error: any) {
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