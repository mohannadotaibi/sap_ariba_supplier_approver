import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './view/App.vue';
import './styles/styles.scss';

createApp(App).use(createPinia()).mount('#app');