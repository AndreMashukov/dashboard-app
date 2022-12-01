import Vue from 'vue';
import BootstrapVue from 'bootstrap-vue';
import Vuelidate from 'vuelidate';
import ToggleButton from 'vue-js-toggle-button';
import VueSidebarMenu from 'vue-sidebar-menu';
import Toast from "vue-toastification";
import Vuetify from 'vuetify/lib/framework';
import VueApexCharts from 'vue-apexcharts'
import App from './App.vue';
import {axios} from './config';
import router from './router';
import { store } from './store';

import "./design/app.scss";
import 'vue-sidebar-menu/dist/vue-sidebar-menu.css'
import "vue-toastification/dist/index.css";
import 'vue2-datepicker/index.css';

axios();

Vue.config.productionTip = false
Vue.use(BootstrapVue)
Vue.use(Vuelidate)
Vue.use(Vuetify);
Vue.use(Toast, {
  timeout: 2000,
  maxToasts: 5,
  pauseOnFocusLoss: false,
});
Vue.use(ToggleButton)
Vue.use(VueSidebarMenu)
Vue.component('apexchart', VueApexCharts)

const vuetify = new Vuetify({});

new Vue({
  router,
  store,
  vuetify,
  render: h => h(App)
}).$mount('#app')
