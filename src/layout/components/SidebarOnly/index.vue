<template>
  <div class="sidebar-only-wrapper">
    <!-- Logo 区域 -->
    <div class="sidebar-only-logo">
      <div class="logo-inner" v-if="!isCollapse">
        <img :src="logoData.LOGO_IMG" class="logo-img" v-if="logoData.LOGO_IMG" />
        <span class="logo-text">{{ logoData.TITLE || '智慧充电运营平台' }}</span>
      </div>
      <div class="logo-inner logo-inner--collapse" v-else>
        <img :src="logoData.LOGO_IMG" class="logo-img" v-if="logoData.LOGO_IMG" />
      </div>
    </div>

    <el-scrollbar wrap-class="scrollbar-wrapper">
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        :background-color="variables.menuBg"
        :text-color="variables.menuText"
        :unique-opened="true"
        :active-text-color="variables.menuActiveText"
        :collapse-transition="false"
        mode="vertical"
        class="sidebar-only-menu"
        @select="handleMenuSelect"
      >
        <sidebar-only-item
          v-for="item in fullMenuList"
          :key="String(item.id || item.title)"
          :item="item"
        />
      </el-menu>
    </el-scrollbar>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import variables from '@/styles/variables.scss'
import SidebarOnlyItem from './SidebarOnlyItem'

export default {
  name: 'SidebarOnly',
  components: { SidebarOnlyItem },
  data() {
    return {
      activeMenu: ''
    }
  },
  watch: {
    $route(route) {
      this.activeMenu = route.path
    }
  },
  created() {
    this.activeMenu = this.$route.path
    // 左侧菜单模式下，确保侧边栏默认展开，避免菜单以折叠 popup 形式渲染
    if (!this.sidebar.opened) {
      this.$store.dispatch('app/openSideBar')
    }
  },
  computed: {
    ...mapGetters([
      'sidebar',
      'meunList',
      'rightMoreMeunList',
      'logoData'
    ]),
    variables() {
      return variables
    },
    isCollapse() {
      return !this.sidebar.opened
    },
    // 合并顶部菜单 + 溢出菜单，展示完整菜单树
    fullMenuList() {
      return [...(this.meunList || []), ...(this.rightMoreMeunList || [])]
    }
  },
  methods: {
    handleMenuSelect(index) {
      // 叶节点 index 为路由路径（以 / 开头），统一在此处理导航
      if (index && index.startsWith('/')) {
        if (this.$route.path !== index) {
          this.$router.push({ path: index })
        }
        this.activeMenu = index
      }
    }
  }
}
</script>

<style lang="scss">
@import "~@/styles/variables.scss";

.sidebar-only-wrapper {
  height: 100%;
  background: $menuBg;
  overflow: hidden;
}

/* ===== Logo ===== */
.sidebar-only-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid #f0f0f0;

  .logo-inner {
    height: 60px;
    display: flex;
    align-items: center;
    padding: 0 12px;

    .logo-img {
      width: 30px;
      height: 30px;
      flex-shrink: 0;
    }

    .logo-text {
      font-size: 16px;
      color: rgb(49, 48, 48);
      font-weight: bold;
      margin-left: 10px;
      white-space: nowrap;
      overflow: hidden;
    }
  }

  .logo-inner--collapse {
    justify-content: center;
    padding: 0;
  }
}

/* ===== Menu ===== */
.sidebar-only-menu {
  border: none !important;

  /* ---- el-submenu 标题 ---- */
  .el-submenu > .el-submenu__title {
    height: auto !important;
    line-height: normal !important;
    /* 上下 3px 是 active 时与 item-inner 的视觉间距，左右 6px 留边 */
    padding: 3px 6px !important;
    color: $menuText !important;

    /* icon + text 包裹层，控制视觉区域，避免与展开箭头重叠 */
    .sidebar-only-submenu-title {
      display: flex;
      align-items: center;
      padding: 12px 8px; /* 上下间距与 item 一致 */
      border-radius: 8px;
      width: calc(100% - 20px); /* 留出右侧箭头空间 */
      overflow: hidden;
    }

    &:hover {
      background: none !important;

      .sidebar-only-submenu-title {
        color: $menuActiveText !important;

        .sidebar-only-icon {
          color: $menuActiveText !important;
        }
      }
    }
  }

  /* 激活子项时，父 submenu 标题高亮 */
  .el-submenu.is-active > .el-submenu__title {
    .sidebar-only-submenu-title {
      color: $menuActiveText !important;
    }
  }

  /* 二级 submenu 标题额外左缩进 */
  .el-submenu .el-submenu > .el-submenu__title {
    padding-left: 18px !important;
  }

  /* 三级 submenu 标题额外左缩进 */
  .el-submenu .el-submenu .el-submenu > .el-submenu__title {
    padding-left: 30px !important;
  }

  /* ---- el-menu-item ---- */
  .el-menu-item {
    /* 与激活状态保持相同外边距，避免 active 时左侧对齐漂移 */
    padding: 3px 6px !important;
    height: auto !important;
    line-height: normal !important;
    color: $menuText !important;
    font-size: 14px !important;
    overflow: hidden;

    .sidebar-only-item-inner {
      flex: 1;           /* 撑满 el-menu-item 的剩余宽度，背景不截断 */
      display: flex;
      align-items: center;
      padding: 12px 8px; /* 上下间距加大 */
      border-radius: 8px;
    }

    &:hover {
      background: none !important;
      color: $menuActiveText !important;

      .sidebar-only-item-inner {
        color: $menuActiveText !important;
      }

      .sidebar-only-icon {
        color: $menuActiveText !important;
      }
    }
  }

  /* 激活的 el-menu-item：外边距与普通状态完全相同，仅改内层背景 */
  .el-menu-item.is-active {
    padding: 3px 6px !important;
    background: none !important;
    color: white !important;

    .sidebar-only-item-inner {
      background: $menuActiveBg !important;
      color: white !important;
      font-weight: 600;

      .sidebar-only-icon {
        color: white !important;
      }
    }
  }

  /* 二级菜单项：外层 padding 与顶层保持一致（左右均 6px），
     缩进改由内层 margin 实现：左缩进 12px，右同步内收 6px，
     确保背景不贴边、右侧完整显示 */
  .el-submenu .el-menu-item {
    padding: 3px 6px !important;

    .sidebar-only-item-inner {
      margin-left: 12px;
      margin-right: 12px;
    }
  }

  /* ---- 图标 ---- */
  .sidebar-only-icon {
    font-size: 15px;
    margin-right: 6px;
    flex-shrink: 0;
  }

  /* ---- 文字超出省略 ---- */
  .sidebar-only-title-text,
  .sidebar-only-item-text {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

/* ===== 折叠时图标居中，隐藏文字 ===== */
.el-menu--collapse {
  .sidebar-only-title-text,
  .sidebar-only-item-text {
    display: none;
  }

  .sidebar-only-item-inner {
    padding: 12px 0 !important;
    justify-content: center;
  }
}
</style>
