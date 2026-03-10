<template>
	<div>
		<div :class="classObj" class="app-wrapper">
		  <div v-if="device==='mobile'&&sidebar.opened" class="drawer-bg" @click="handleClickOutside" />

		  <sidebar v-if="menuLayout === 'mix'" class="sidebar-container" />
		  <sidebar-only v-else class="sidebar-container" />

		  <div :class="{hasTagsView:needTagsView}" class="main-container">

		    <!-- mix 模式：顶部水平菜单独占一行 -->
		    <topSidebar v-if="menuLayout === 'mix'" />

		    <!-- mix 模式：navbar 单独一行；sidebar 模式：navbar + 用户区合并为一行 -->
		    <div :class="{'fixed-header': fixedHeader, 'sidebar-combined-header': menuLayout !== 'mix'}">
		      <navbar />
		      <!-- sidebar 模式：用户信息区与 navbar 同行 -->
		      <topSidebar v-if="menuLayout !== 'mix'" />
		    </div>

		    <app-main />
		  </div>
		</div>
	</div>
</template>

<script>
import RightPanel from '@/components/RightPanel'
import { AppMain, Navbar, Settings, Sidebar, SidebarOnly, TagsView } from './components';
import topSidebar from './components/topSidebar/topSidebar';
import ResizeMixin from './mixin/ResizeHandler'
import { mapState, mapGetters } from 'vuex'
import Frame from '@/components/Common/Frame'
export default {
  name: 'Layout',
  components: {
    AppMain,
    Navbar,
    RightPanel,
    Settings,
    Sidebar,
    SidebarOnly,
    TagsView,
    topSidebar,
	Frame
  },
  mixins: [ResizeMixin],
  computed: {
    ...mapState({
      sidebar: state => state.app.sidebar,
      device: state => state.app.device,
      showSettings: state => state.settings.showSettings,
      needTagsView: state => state.settings.tagsView,
      fixedHeader: state => state.settings.fixedHeader
    }),
    ...mapGetters(['menuLayout']),
    classObj() {
      return {
        hideSidebar: !this.sidebar.opened,
        openSidebar: this.sidebar.opened,
        withoutAnimation: this.sidebar.withoutAnimation,
        mobile: this.device === 'mobile'
      }
    }
  },
  methods: {
    handleClickOutside() {
      this.$store.dispatch('app/closeSideBar', { withoutAnimation: false })
    }
  }
}
</script>

<style lang="scss" scoped>
  @import "~@/styles/mixin.scss";
  @import "~@/styles/variables.scss";
  .app-wrapper {
    @include clearfix;
    position: relative;
    height: 100%;
    width: 100%;

    &.mobile.openSidebar {
      position: fixed;
      top: 0;
    }
  }

  .drawer-bg {
    background: #000;
    opacity: 0.3;
    width: 100%;
    top: 0;
    height: 100%;
    position: absolute;
    z-index: 999;
  }

  .fixed-header {
    position: fixed;
    top: 0;
    right: 0;
    z-index: 9;
    width: calc(100% - #{$sideBarWidth});
    transition: width 0.28s;
  }

  .hideSidebar .fixed-header {
    width: calc(100% - 54px)
  }

  .mobile .fixed-header {
    width: 100%;
  }

  /* sidebar 模式：navbar + topSidebar 合并为一行 */
  .sidebar-combined-header {
    display: flex;
    align-items: stretch;
    background: #fff;
    box-shadow: 0 1px 4px rgba(0, 21, 41, .08);
  }
</style>

<!-- 非 scoped：穿透子组件样式，仅在 sidebar 合并顶栏场景生效 -->
<style lang="scss">
  .sidebar-combined-header {
    .navbar {
      flex: 0 0 auto;
      height: 60px !important;      /* 与左侧 logo 区等高 */
      box-shadow: none !important;
      background: transparent;
    }
    /* 汉堡按钮在 60px 高度内垂直居中 */
    .hamburger-container {
      line-height: 60px !important;
    }
    /* 面包屑在左侧菜单模式下跟随 60px 顶栏高度 */
    .app-breadcrumb.el-breadcrumb {
      line-height: 60px !important;
    }
    .divElmenu {
      flex: 1;
      border-bottom: none !important;
      height: 60px !important;
    }
  }
</style>
