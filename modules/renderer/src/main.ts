import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { init as connectInit } from '@/hooks/useConnectPod';
import App from './App.vue';
import router from './router';

import './less/common.less';
import 'xterm/css/xterm.css';

connectInit();
const app = createApp(App);

app.use(createPinia());
app.use(router);

app.mount('#app');
