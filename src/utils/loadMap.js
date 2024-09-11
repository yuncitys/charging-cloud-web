/**
 * 动态加载高德地图
 *
 * @export
 * @param {*} key 高德地图key
 * @param {*} plugins 高德地图插件
 * @param {string} [v='1.4.14'] 高德地图版本
 * @returns
 */
export default function loadMap(key, plugins, v = '1.4.14') {
    return new Promise(function(resolve, reject) {
        if (typeof AMap !== 'undefined') {
            // eslint-disable-next-line no-undef
            resolve(AMap)
            return true
        }
        window.onCallback = function() {
            // eslint-disable-next-line no-undef
            resolve(AMap)
        }
        let script = document.createElement('script')
        script.type = 'text/javascript'
        script.src = `https://webapi.amap.com/maps?v=${v}&key=${key}&plugin=${plugins}&callback=onCallback`
        script.onerror = reject
        document.head.appendChild(script)
    })
}