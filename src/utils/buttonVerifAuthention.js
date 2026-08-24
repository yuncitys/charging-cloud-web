import store from '../store'
import {trim} from './index.js'
const permsVerifAuthention = function(perms) {
	let authentionList = store.getters.authentionList
	perms = trim(perms)
	if (!perms || !Array.isArray(authentionList)) {
		return false
	}
	for (var i = 0; i < authentionList.length; i++) {
		const item = authentionList[i]
		if (!item || item.perms == null) {
			continue
		}
		let authPerms = trim(item.perms)
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
