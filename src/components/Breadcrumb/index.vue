<template>
  <el-breadcrumb class="app-breadcrumb" separator="/">
    <transition-group name="breadcrumb">
      <el-breadcrumb-item v-for="(item,index) in levelList" :key="item.path + '-' + index">
        <span v-if="item.redirect==='noRedirect'||index==levelList.length-1" class="no-redirect">
          {{ generateTitle(item.meta.title) }}
        </span>
        <a v-else @click.prevent="handleLink(item)">{{ generateTitle(item.meta.title) }}</a>
      </el-breadcrumb-item>
    </transition-group>
  </el-breadcrumb>
</template>

<script>
/**
 * 面包屑（方案 C）
 *
 * 问题：菜单重组后有多级目录（如 运营管理 > 计费策略 > 计时收费方案），
 *       但 Vue Router 只有 Layout + 页面两级，$route.matched 缺中间目录。
 * 解决：优先从后端 menuList 按 href 找祖先链；hidden 页用 meta.authFollow 挂父页。
 * 回退：菜单未加载或找不到时，仍用 $route.matched（vue-element-admin 原逻辑）。
 *
 * 侧栏、面包屑、HeaderSearch 均读 menuList。
 */
import { mapGetters } from 'vuex'
import { generateTitle } from '@/utils/i18n'
import pathToRegexp from 'path-to-regexp'
import { findMenuTrailByHref, findFirstLeafHref, getLeafHref } from '@/utils/menuNav'
import { normalizePath } from '@/router/routePermission'

export default {
  data() {
    return {
      levelList: null
    }
  },
  computed: {
    ...mapGetters(['meunList', 'rightMoreMeunList'])
  },
  watch: {
    $route(route) {
      if (route.path.startsWith('/redirect/')) {
        return
      }
      this.getBreadcrumb()
    },
    meunList() {
      this.getBreadcrumb()
    },
    rightMoreMeunList() {
      this.getBreadcrumb()
    }
  },
  created() {
    this.getBreadcrumb()
  },
  methods: {
    generateTitle,
    /** 合并顶栏 + 「更多」里的菜单，与侧栏同一棵授权树 */
    getMenuTree() {
      return [].concat(this.meunList || [], this.rightMoreMeunList || [])
    },
    /** 菜单祖先链 → 面包屑项；目录节点可点击跳到其下首个叶子页 */
    buildFromMenuTrail(trail, extraTitle) {
      const home = {
        path: '/dashboard',
        meta: { title: '首页' }
      }
      const items = trail.map((node, index) => {
        const isLast = index === trail.length - 1 && !extraTitle
        const href = getLeafHref(node) || findFirstLeafHref(node)
        return {
          path: href || '',
          redirect: (!href || isLast) ? 'noRedirect' : undefined,
          meta: { title: node.title || '' }
        }
      })
      if (extraTitle) {
        items.push({
          path: this.$route.path,
          redirect: 'noRedirect',
          meta: { title: extraTitle }
        })
      }
      return [home].concat(items)
    },
    /**
     * 按当前 path 在 menuList 中匹配页面 href，拼出完整层级。
     * 列表页：trail 即最终面包屑。
     * hidden 页：无菜单 href，用 authFollow/activeMenu 找父页 trail，再追加 meta.title。
     */
    getBreadcrumbFromMenu() {
      const menus = this.getMenuTree()
      if (!menus.length) {
        return null
      }
      const path = normalizePath(this.$route.path)
      let trail = findMenuTrailByHref(menus, path)
      if (trail && trail.length) {
        return this.buildFromMenuTrail(trail, null)
      }
      const meta = this.$route.meta || {}
      const follow = meta.authFollow || meta.activeMenu
      if (follow) {
        trail = findMenuTrailByHref(menus, normalizePath(follow))
        if (trail && trail.length) {
          return this.buildFromMenuTrail(trail, meta.title || null)
        }
      }
      return null
    },
    /** 原逻辑：按路由嵌套生成面包屑（缺菜单中间目录，仅作 fallback） */
    getBreadcrumbFromRoute() {
      let matched = this.$route.matched.filter(item => item.meta && item.meta.title)
      const first = matched[0]

      if (!this.isDashboard(first)) {
        matched = [{ path: '/dashboard', meta: { title: '首页' }}].concat(matched)
      }

      return matched.filter(item => item.meta && item.meta.title && item.meta.breadcrumb !== false)
    },
    /** 菜单优先，找不到再走路由 */
    getBreadcrumb() {
      const fromMenu = this.getBreadcrumbFromMenu()
      this.levelList = fromMenu || this.getBreadcrumbFromRoute()
    },
    isDashboard(route) {
      const name = route && route.name
      if (!name) {
        return false
      }
      return name.trim().toLocaleLowerCase() === 'Dashboard'.toLocaleLowerCase()
    },
    pathCompile(path) {
      const { params } = this.$route
      var toPath = pathToRegexp.compile(path)
      return toPath(params)
    },
    handleLink(item) {
      const { redirect, path } = item
      if (redirect) {
        this.$router.push(redirect)
        return
      }
      if (!path) {
        return
      }
      this.$router.push(this.pathCompile(path))
    }
  }
}
</script>

<style lang="scss" scoped>
.app-breadcrumb.el-breadcrumb {
  display: inline-block;
  font-size: 14px;
  line-height: 50px;
  margin-left: 8px;

  .no-redirect {
    color: #97a8be;
    cursor: text;
  }
}
</style>
