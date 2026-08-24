<template>
  <div :class="{'show':show}" class="header-search">
    <svg-icon class-name="search-icon" icon-class="search" @click.stop="click" />
    <el-select
      ref="headerSearchSelect"
      v-model="search"
      :remote-method="querySearch"
      filterable
      default-first-option
      remote
      placeholder="Search"
      class="header-search-select"
      @change="change"
    >
      <el-option v-for="item in options" :key="item.path" :value="item" :label="item.title.join(' > ')" />
    </el-select>
  </div>
</template>

<script>
/**
 * 顶栏页面搜索：按菜单树（menuList）生成候选项，与侧栏/面包屑层级一致。
 * 原逻辑遍历 permission_routes，会缺菜单中间目录、且按 URL 模块分组。
 */
import Fuse from 'fuse.js'
import { mapGetters } from 'vuex'
import { collectMenuSearchItems } from '@/utils/menuNav'

export default {
  name: 'HeaderSearch',
  data() {
    return {
      search: '',
      options: [],
      searchPool: [],
      show: false,
      fuse: undefined
    }
  },
  computed: {
    ...mapGetters(['meunList', 'rightMoreMeunList']),
    lang() {
      return this.$store.getters.language
    },
    supportPinyinSearch() {
      return this.$store.state.settings.supportPinyinSearch
    }
  },
  watch: {
    lang() {
      this.searchPool = this.buildSearchPool()
    },
    meunList() {
      this.searchPool = this.buildSearchPool()
    },
    rightMoreMeunList() {
      this.searchPool = this.buildSearchPool()
    },
    searchPool(list) {
      // Support pinyin search
      if (this.lang === 'zh' && this.supportPinyinSearch) {
        this.addPinyinField(list)
      }
      this.initFuse(list)
    },
    show(value) {
      if (value) {
        document.body.addEventListener('click', this.close)
      } else {
        document.body.removeEventListener('click', this.close)
      }
    }
  },
  mounted() {
    this.searchPool = this.buildSearchPool()
  },
  methods: {
    async addPinyinField(list) {
      const { default: pinyin } = await import('pinyin')
      if (Array.isArray(list)) {
        list.forEach(element => {
          const title = element.title
          if (Array.isArray(title)) {
            title.forEach(v => {
              v = pinyin(v, {
                style: pinyin.STYLE_NORMAL
              }).join('')
              element.pinyinTitle = v
            })
          }
        })
        return list
      }
    },
    click() {
      this.show = !this.show
      if (this.show) {
        this.$refs.headerSearchSelect && this.$refs.headerSearchSelect.focus()
      }
    },
    close() {
      this.$refs.headerSearchSelect && this.$refs.headerSearchSelect.blur()
      this.options = []
      this.show = false
    },
    change(val) {
      this.$router.push(val.path)
      this.search = ''
      this.options = []
      this.$nextTick(() => {
        this.show = false
      })
    },
    initFuse(list) {
      this.fuse = new Fuse(list, {
        shouldSort: true,
        threshold: 0.4,
        location: 0,
        distance: 100,
        maxPatternLength: 32,
        minMatchCharLength: 1,
        keys: [{
          name: 'title',
          weight: 0.7
        }, {
          name: 'pinyinTitle',
          weight: 0.3
        }, {
          name: 'path',
          weight: 0.3
        }]
      })
    },
    buildSearchPool() {
      const menus = [].concat(this.meunList || [], this.rightMoreMeunList || [])
      return collectMenuSearchItems(menus)
    },
    querySearch(query) {
      if (query !== '' && this.fuse) {
        this.options = this.fuse.search(query)
      } else {
        this.options = []
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.header-search {
  font-size: 0 !important;
  .search-icon {
    cursor: pointer;
    font-size: 18px;
    vertical-align: middle;
  }
  .header-search-select {
    font-size: 18px;
    transition: width 0.2s;
    width: 0;
    overflow: hidden;
    background: transparent;
    border-radius: 0;
    display: inline-block;
    vertical-align: middle;

    ::v-deep .el-input__inner {
      border-radius: 0;
      border: 0;
      padding-left: 0;
      padding-right: 0;
      box-shadow: none !important;
      border-bottom: 1px solid #d9d9d9;
      vertical-align: middle;
    }
  }
  &.show {
    .header-search-select {
      width: 210px;
      margin-left: 10px;
    }
  }
}
</style>
