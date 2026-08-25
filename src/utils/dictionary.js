import { getDictionarySelector } from '@/api/permission/dictionaryData'

const CACHE_TTL_MS = 5 * 60 * 1000
const cache = new Map()

function extractList(res) {
	const data = res && res.data
	return Array.isArray(data) ? data : (data && Array.isArray(data.list) ? data.list : [])
}

function mapSelectorItems(list) {
	return (list || []).map(item => ({
		label: item.fullName,
		value: item.enCode
	}))
}

export function getSelector(enCode) {
	const cached = cache.get(enCode)
	if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
		return Promise.resolve(cached.items)
	}
	return getDictionarySelector(enCode).then(res => {
		const items = mapSelectorItems(extractList(res))
		cache.set(enCode, { items, timestamp: Date.now() })
		return items
	}).catch(() => [])
}
