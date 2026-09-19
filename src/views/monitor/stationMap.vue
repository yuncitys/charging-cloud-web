<template>
  <div class="app-container station-map-page">
    <div id="station-map" class="station-map-canvas"></div>

    <div class="station-map-filter">
      <el-select
        v-model="query.city"
        class="station-map-filter__item"
        clearable
        filterable
        placeholder="请选择城市"
        :loading="cityLoading"
        @change="loadPoints"
        @clear="loadPoints"
      >
        <el-option
          v-for="city in cityOptions"
          :key="city"
          :label="city"
          :value="city"
        />
      </el-select>
      <el-input
        v-model="query.networkName"
        class="station-map-filter__item"
        clearable
        placeholder="请输入站点名称"
        @keyup.enter.native="loadPoints"
        @clear="loadPoints"
      />
      <el-button type="primary" size="mini" icon="el-icon-search" :loading="pointLoading" @click="loadPoints">查询</el-button>
      <el-button size="mini" icon="el-icon-refresh" :loading="pointLoading" @click="refresh">刷新</el-button>
    </div>
  </div>
</template>

<script>
import loadMap from '@/utils/loadMap'
import { getStationMapCities, getStationMapPoints } from '@/api/monitor/stationMap'

const MAP_VERSION = '1.4.4'
const MARKER_ICON = 'https://webapi.amap.com/theme/v1.3/markers/n/mark_b.png'
const FALLBACK_MAP_KEY = '87331a23c6a4e734969f8621bc166eff'

export default {
  name: 'StationMap',
  data() {
    return {
      query: {
        city: '',
        networkName: ''
      },
      cityOptions: [],
      cityLoading: false,
      pointLoading: false,
      AMap: null,
      map: null,
      infoWindow: null,
      markers: []
    }
  },
  mounted() {
    document.addEventListener('click', this.onInfoWindowClick)
    this.loadCities()
    const mapKey = (window.BaseConfig && window.BaseConfig.VUE_MAP_KEY) || FALLBACK_MAP_KEY
    if (!mapKey) {
      this.$message.error('未配置地图 Key（BaseConfig.VUE_MAP_KEY）')
      return
    }
    loadMap(mapKey, [], MAP_VERSION).then(AMap => {
      this.AMap = AMap
      this.$nextTick(() => {
        this.initMap()
        this.loadPoints()
      })
    }).catch(() => {
      this.$message.error('地图加载失败，请稍后重试')
    })
  },
  beforeDestroy() {
    document.removeEventListener('click', this.onInfoWindowClick)
    this.clearMarkers()
    if (this.infoWindow) {
      this.infoWindow.close()
    }
    if (this.map && this.map.destroy) {
      this.map.destroy()
    }
    this.map = null
  },
  methods: {
    initMap() {
      const container = document.getElementById('station-map')
      if (!container || !this.AMap) return
      this.map = new this.AMap.Map(container, {
        zoom: 11,
        resizeEnable: true
      })
      this.infoWindow = new this.AMap.InfoWindow({
        offset: new this.AMap.Pixel(0, -35)
      })
      // 布局完成后强制重算尺寸，避免容器初始为 0 导致白屏
      this.$nextTick(() => {
        if (this.map && typeof this.map.resize === 'function') {
          this.map.resize()
        }
      })
    },
    loadCities() {
      this.cityLoading = true
      return getStationMapCities(this.buildParams()).then(res => {
        this.cityOptions = this.normalizeList(res).filter(city => city !== null && city !== undefined && city !== '')
      }).catch(() => {
        this.$message.error('城市列表加载失败')
      }).finally(() => {
        this.cityLoading = false
      })
    },
    loadPoints() {
      if (!this.map || !this.AMap) return
      this.pointLoading = true
      return getStationMapPoints(this.buildParams()).then(res => {
        const points = this.normalizeList(res)
        this.renderMarkers(points)
      }).catch(() => {
        this.$message.error('站点地图加载失败')
      }).finally(() => {
        this.pointLoading = false
      })
    },
    refresh() {
      this.loadCities()
      this.loadPoints()
    },
    buildParams() {
      const params = {}
      if (this.query.city) {
        params.city = this.query.city
      }
      const name = (this.query.networkName || '').trim()
      if (name) {
        params.networkName = name
      }
      return params
    },
    normalizeList(res) {
      if (Array.isArray(res)) return res
      if (res && Array.isArray(res.data)) return res.data
      return []
    },
    renderMarkers(points) {
      this.clearMarkers()
      const validPoints = (points || []).filter(point => this.getPosition(point))
      this.markers = validPoints.map(point => {
        const marker = new this.AMap.Marker({
          icon: MARKER_ICON,
          position: this.getPosition(point)
        })
        marker.on('click', () => this.openInfoWindow(point, marker))
        this.map.add(marker)
        return marker
      })
      if (this.markers.length > 0) {
        this.map.setFitView(this.markers)
      }
    },
    clearMarkers() {
      if (this.map && this.markers.length) {
        this.map.remove(this.markers)
      }
      this.markers = []
    },
    getPosition(point) {
      if (!point) return null
      const lngRaw = point.longitude
      const latRaw = point.latitude
      if (lngRaw == null || latRaw == null) return null
      const lngStr = String(lngRaw).trim()
      const latStr = String(latRaw).trim()
      if (!lngStr || !latStr) return null
      const lng = Number(lngStr)
      const lat = Number(latStr)
      if (isNaN(lng) || isNaN(lat)) return null
      if (lng < -180 || lng > 180 || lat < -90 || lat > 90) return null
      return [lng, lat]
    },
    openInfoWindow(point, marker) {
      this.infoWindow.setContent(this.buildInfoWindow(point))
      this.infoWindow.open(this.map, marker.getPosition())
    },
    buildInfoWindow(point) {
      const stationId = this.escapeHtml(point.stationId)
      return [
        '<div class="station-map-info">',
        '<div class="station-map-info__title">' + this.escapeHtml(point.networkName || '-') + '</div>',
        '<div class="station-map-info__address">' + this.escapeHtml(point.networkAddress || '-') + '</div>',
        this.buildCountBlock('直流设备', point.dc),
        this.buildCountBlock('交流设备', point.ac),
        '<a href="javascript:;" class="station-map-info__link" data-station-id="' + stationId + '">进入站点监控</a>',
        '</div>'
      ].join('')
    },
    buildCountBlock(label, counts) {
      const data = counts || {}
      return [
        '<div class="station-map-info__block">',
        '<div>' + label + this.count(data.total) + '个</div>',
        '<div class="station-map-info__counts">',
        '空闲 ' + this.count(data.idle),
        '<span>充电 ' + this.count(data.charging) + '</span>',
        '<span>故障 ' + this.count(data.fault) + '</span>',
        '<span>离线 ' + this.count(data.offline) + '</span>',
        '<span>其它 ' + this.count(data.other) + '</span>',
        '</div>',
        '</div>'
      ].join('')
    },
    count(value) {
      const n = Number(value)
      return isNaN(n) ? 0 : n
    },
    escapeHtml(value) {
      return String(value === null || value === undefined ? '' : value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
    },
    onInfoWindowClick(event) {
      const target = event.target
      const link = target && target.closest ? target.closest('.station-map-info__link') : null
      if (!link) return
      const stationId = link.getAttribute('data-station-id')
      if (!stationId) return
      this.$router.push({
        path: '/device/stationMonitor',
        query: { stationId }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.station-map-page {
  position: relative;
  height: calc(100vh - 130px);
  min-height: 560px;
  padding: 0;
  overflow: hidden;
}

.station-map-canvas {
  width: 100%;
  height: 100%;
  min-height: 560px;
}

.station-map-filter {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 10;
  display: flex;
  align-items: center;
  padding: 12px;
  background: rgba(255, 255, 255, 0.96);
  border-radius: 4px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.12);

  &__item {
    width: 180px;
    margin-right: 10px;
  }
}

::v-deep .station-map-info {
  min-width: 260px;
  line-height: 1.8;
  color: #303133;

  &__title {
    margin-bottom: 4px;
    font-size: 15px;
    font-weight: 600;
  }

  &__address {
    margin-bottom: 8px;
    color: #606266;
  }

  &__block {
    margin-top: 8px;
  }

  &__counts span {
    margin-left: 12px;
  }

  &__link {
    display: inline-block;
    margin-top: 10px;
    color: #07b161;
    text-decoration: none;
  }
}

::v-deep .amap-info-close {
  color: #07b161;
}
</style>
