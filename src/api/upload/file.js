import request from '@/utils/request'

export function upload(type,data) {
	return request({
		url: '/api/web/file/uploader/' + type,
		method: 'post',
		headers: {
			"Content-Type": "multipart/form-data",
		},
		data
	})
}
