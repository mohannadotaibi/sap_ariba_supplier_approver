import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './view/App.vue';
import './styles/styles.scss';
import { useStore } from './store/main';

createApp(App).use(createPinia()).mount('#app');
const store = useStore();
store.checkAuthenticated();
