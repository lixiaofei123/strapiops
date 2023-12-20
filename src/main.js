import 'core-js/stable'
import Vue from 'vue'
import App from './App'
import router from './router'
import CoreuiVue from '@coreui/vue'
import { iconsSet as icons } from './assets/icons/icons.js'
import store from './store'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import axios from 'axios';
import VueClipboard from 'vue-clipboard2'
import CKEditor from '@ckeditor/ckeditor5-vue2';
import VueDND from 'awe-dnd'

Vue.use(VueDND)
Vue.config.performance = true
Vue.use(CoreuiVue)
Vue.use( CKEditor );

Vue.prototype.$log = console.log.bind(console)

Vue.use(axios)
Vue.use(ElementUI);

VueClipboard.config.autoSetContainer = true
Vue.use(VueClipboard)


new Vue({
  el: '#app',
  router,
  store,
  icons,
  template: '<App/>',
  components: {
    App
  }
})
