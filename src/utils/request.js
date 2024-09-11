import axios from 'axios'
import {
	MessageBox,
	Message
} from 'element-ui'
import store from '@/store'
import router from '@/router'
import {
	getToken
} from '@/utils/auth'


const service = axios.create({
	baseURL: process.env.VUE_APP_BASE_API,
	timeout: 1000 * 300,
})


service.interceptors.request.use(
	config => {
		if (store.getters.token) {
			config.headers['Authorization'] = getToken()
		}
		return config
	},
	error => {
		console.log(error)
		return Promise.reject(error)
	}
)

// response interceptor
service.interceptors.response.use(
	response => {
		const res = response.data
		if (res.code === 501) {
			setTimeout(() => {
				store.dispatch('user/resetToken')
				router.push({
					path: '/login'
				})
			}, 1000)
		}
		return response.data
	},
	/**
	 * If you want to get http information such as headers or status
	 * Please return  response => response
	 */

	/**
	 * Determine the request status by custom code
	 * Here is just an example
	 * You can also judge the status by HTTP Status Code
	 */
	// response => {
	//   const res = response.data

	//   // if the custom code is not 20000, it is judged as an error.
	//   if (res.code !== 20000) {
	//     Message({
	//       message: res.message || 'Error',
	//       type: 'error',
	//       duration: 5 * 1000
	//     })

	//     // 50008: Illegal token; 50012: Other clients logged in; 50014: Token expired;
	//     if (res.code === 50008 || res.code === 50012 || res.code === 50014) {
	//       // to re-login
	//       MessageBox.confirm('You have been logged out, you can cancel to stay on this page, or log in again', 'Confirm logout', {
	//         confirmButtonText: 'Re-Login',
	//         cancelButtonText: 'Cancel',
	//         type: 'warning'
	//       }).then(() => {
	//         store.dispatch('user/resetToken').then(() => {
	//           location.reload()
	//         })
	//       })
	//     }
	//     return Promise.reject(new Error(res.message || 'Error'))
	//   } else {
	//     return res
	//   }
	// },
	error => {
		console.log('err' + error) // for debug
		Message({
			message: '请求超时',
			type: 'error',
			duration: 5 * 1000
		})
		return Promise.reject(error)
	}
)

export default service
