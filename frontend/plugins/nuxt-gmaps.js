import Vue from 'vue'
import * as NuxtGmaps from 'nuxt-gmaps'
Vue.use(NuxtGmaps, {
	load: {
		key: '',
		libraries: 'places',
	},
})