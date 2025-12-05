import request from '@/utils/request'

export function uploadFile(type,data) {
	return request({
		url: '/api/web/file/uploader/' + type,
		method: 'post',
		headers: {
			"Content-Type": "multipart/form-data",
		},
		data
	})
}