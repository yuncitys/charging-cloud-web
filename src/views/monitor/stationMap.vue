<template>
  <div class="app-container station-map-page">
    <div id="station-map" />

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

const MAP_KEY = '87331a23c6a4e734969f8621bc166eff'
const MAP_VERSION = '1.4.4'
const MARKER_ICON = 'https://webapi.amap.com/theme/v1.3/markers/n/mark_b.png'

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
    loadMap(MAP_KEY, [], MAP_VERSION).then(AMap => {
      this.AMap = AMap
      this.initMap()
      this.loadPoints()
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
  },
  methods: {
    initMap() {
      this.map = new this.AMap.Map('station-map', {
        zoom: 11,
        resizeEnable: true
      })
      this.infoWindow = new this.AMap.InfoWindow({
        offset: new this.AMap.Pixel(0, -35)
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
  height: calc(100vh - 84px);
  min-height: 560px;
  padding: 0;
}

#station-map {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
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
