import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './view/App.vue';
import './styles/styles.scss';
import { Notification } from 'electron';


createApp(App).use(createPinia()).mount('#app');