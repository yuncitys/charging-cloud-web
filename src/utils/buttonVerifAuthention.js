import store from '../store'
import {trim} from './index.js'
const permsVerifAuthention = function(perms) {
	let authentionList = store.getters.authentionList
	perms = trim(perms)
	for (var i = 0; i < authentionList.length; i++) {
		let authPerms = trim(authentionList[i].perms)
		if (perms == authPerms) {
			return true;
		}
	}
	return false;
}
export default {
	install(Vue) {
		Vue.prototype.btnAuthen = {
			permsVerifAuthention
		}
	}
}
