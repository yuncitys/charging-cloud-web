<template>
  <div class="divElmenu" :class="{'sidebar-only-mode': menuLayout !== 'mix'}" ref="divElmenu">
    <el-menu
      v-if="menuLayout === 'mix'"
      :default-active="pActiveMenu"
      :background-color="variables.menuBg"
      :text-color="variables.menuText"
      :unique-opened="true"
      :active-text-color="variables.menuActiveText"
      :collapse-transition="false"
      mode="horizontal"
      class="top-elmenu">
      <template v-for="item in list">
        <el-menu-item :index="item.title" :key="item.title" ref="subMenuitem">
          <div @click="onClick(item)">
            <span>{{ item.title }}</span>
          </div>
        </el-menu-item>
      </template>
      <el-menu-item v-if="rightMoreMeunList.length > 0">
        <el-dropdown trigger="click" class="topEldrop">
          <span class="el-dropdown-link" >
            更多...<i class="el-icon-arrow-down el-icon--right"></i>
          </span>
          <el-dropdown-menu slot="dropdown" class="top-dropdown-menu">
            <el-dropdown-item v-for="item in rightMoreMeunList" :key="item.title">
              <el-menu-item :index="item.title">
                <div @click="onClick(item)">
                  <i :class="item.icon"></i>
                  <span>{{ item.title }}</span>
                </div>
              </el-menu-item>
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </el-menu-item>
    </el-menu>
    <div class="right-menu">
      <template v-if="device!=='mobile' && btnAuthen.permsVerifAuthention(':web:largeScreen:openWatch')">
        <el-tooltip content="大数据" effect="dark" placement="bottom">
          <div class="right-menu-item hover-effect" @click="largeScreen">
            <i class="el-icon-s-platform toolbar-icon" />
          </div>
        </el-tooltip>
      </template>
      <header-search id="header-search" class="right-menu-item hover-effect" />
      <lang-select class="right-menu-item hover-effect" />
      <screenfull id="screenfull" class="right-menu-item hover-effect" />

      <el-tooltip
        :content="menuLayout === 'mix' ? '切换到左侧菜单' : '切换到混合菜单'"
        effect="dark"
        placement="bottom"
      >
        <div class="right-menu-item hover-effect layout-toggle-btn" @click="toggleMenuLayout">
          <svg v-if="menuLayout === 'mix'" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="7" height="18" rx="1"/>
            <rect x="13" y="3" width="8" height="4" rx="1"/>
            <rect x="13" y="10" width="8" height="4" rx="1"/>
            <rect x="13" y="17" width="8" height="4" rx="1"/>
          </svg>
          <svg v-else viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="7" height="18" rx="1"/>
            <line x1="13" y1="3" x2="21" y2="3"/>
            <line x1="13" y1="8" x2="21" y2="8"/>
            <line x1="13" y1="13" x2="21" y2="13"/>
            <line x1="13" y1="18" x2="21" y2="18"/>
            <line x1="13" y1="21" x2="21" y2="21"/>
          </svg>
        </div>
      </el-tooltip>

      <el-dropdown class="avatar-container right-menu-item hover-effect" trigger="click">
        <div class="userName">
          <span>{{ userName }}</span>
          <i class="el-icon-caret-bottom" />
        </div>
        <el-dropdown-menu slot="dropdown" class="sysInfo">
          <el-dropdown-item divided @click.native="setPwd">
            <span style="display:block;">{{ $t('navbar.changePassword') }}</span>
          </el-dropdown-item>
          <el-dropdown-item divided @click.native="logout">
            <span style="display:block;">{{ $t('navbar.logOut') }}</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
  </div>
</template>

<script>
  import Screenfull from '@/components/Screenfull'
  import LangSelect from '@/components/LangSelect'
  import HeaderSearch from '@/components/HeaderSearch'
  import {
    mapGetters
  } from 'vuex';
  import variables from '@/styles/variables.scss'
  import {
    logout
  } from '@/api/user'
  import { findFirstLeafHref, getNavChildren } from '@/utils/menuNav'
  export default {
    components: {
      Screenfull,
      LangSelect,
      HeaderSearch
    },
    data() {
      return {
        pActiveMenu: 'Dashboard',
        topOffsetWidth: 0,
        lists: [],
        elmenuMore: []
      }
    },
    created() {
      if (window.localStorage.getItem("pActiveMenu")) {
        this.pActiveMenu = window.localStorage.getItem("pActiveMenu")
      };
    },
    computed: {
      ...mapGetters([
        'permission_routes',
        'sidebar',
        'device',
        'menuLayout'
      ]),
      userName() {
        return this.$store.getters.adminUser.adminName
      },
      variables() {
        return variables
      },
      isCollapse() {
        return !this.sidebar.opened
      },
      list() {
        return this.$store.getters.meunList
      },
      rightMoreMeunList() {
        return this.$store.getters.rightMoreMeunList
      },
    },
    methods: {
      onClick(item) {
        window.localStorage.setItem("pActiveMenu", item.title);
        this.pActiveMenu = item.title;
        const navChildren = getNavChildren(item)
        const targetHref = findFirstLeafHref(item) || item.href

        if (navChildren.length > 0) {
          this.$store.commit('permission/setLeftMeunList', item.children || navChildren);
          this.$store.dispatch('app/openSideBar')
          if (targetHref) {
            this.$router.push({ path: targetHref });
            window.localStorage.setItem("activeMenu", targetHref);
          }
          window.localStorage.setItem("leftMeunList", JSON.stringify(item.children || navChildren));
        } else if (targetHref) {
          window.localStorage.removeItem("leftMeunList");
          this.$store.commit('permission/setLeftMeunList', []);
          this.$store.dispatch('app/closeSideBar', {
            withoutAnimation: false
          })
          this.$router.push({ path: targetHref })
          window.localStorage.setItem("activeMenu", targetHref);
        }
      },
      toggleMenuLayout() {
        const next = this.menuLayout === 'mix' ? 'sidebar' : 'mix'
        this.$store.dispatch('app/setMenuLayout', next)
        // 切换到左侧菜单模式时，确保侧边栏展开（避免菜单以折叠 icon-only 模式渲染）
        if (next === 'sidebar') {
          this.$store.dispatch('app/openSideBar')
        }
      },
      async logout() {
        let logoutFrom = {
          grandType: 'password'
        }
        logout(logoutFrom).then(res => {
          if (res.code == 200) {
            this.$store.dispatch('permission/resetPermission')
            this.$store.dispatch('user/resetToken')
            this.$router.push(`/login?redirect=${this.$route.fullPath}`);
            window.localStorage.removeItem("activeMenu");
            window.localStorage.removeItem("pActiveMenu");
            window.localStorage.removeItem("leftMeunList");
            this.$store.dispatch('app/closeSideBar', {
              withoutAnimation: false
            })
          } else {
            Message({
              message: res.msg,
              type: 'error',
              duration: 5 * 1000
            })
          }
        })
      },
      setPwd() {
        this.$router.push({
          name: 'setPwd'
        })
      },
      largeScreen() {
       const {
					href
				} = this.$router.resolve({
					name: "largeScreen",
				});
				window.open(href, '_blank');
      },
    },
    mounted() {
      this.$store.commit('permission/setTopOffsetWidth', this.$refs.divElmenu.offsetWidth);
      // 组件挂载后宽度才准确，重新按实际宽度分割顶部菜单
      this.$store.dispatch('permission/splitMenuByWidth', this.$refs.divElmenu.offsetWidth);
    },
  }

</script>
<style lang="scss" scoped>
  @import "~@/styles/variables.scss";

  .divElmenu {
    display: flex;
    align-items: center;
    height: 60px;
    border-bottom: solid 1px #e6e6e6;

    /* 左侧菜单模式：去掉底部分割线，右侧操作区靠右 */
    &.sidebar-only-mode {
      border-bottom: none;

      .right-menu {
        margin-left: auto;
      }
    }
  }

  .top-elmenu {
    overflow: hidden;
    display: flex;
    flex: 1;
    height: 100%;
    border: none !important;

    & .el-menu-item {
      padding: 0;
      height: 100%;
      display: flex;
      align-items: center;
      line-height: normal;
      color: $menuText !important;
      font-weight: 600;

      &>div {
        padding: 8px 22px;
        margin: 0 4px;
        border-radius: 10px;
      }

      &:hover {
        color: $menuActiveText !important;
        background: none !important;
      }
    }

    .el-menu-item.is-active {
      padding: 0 3px;

      &>div {
        background: $menuActiveBg !important;
        color: white;
      }
    }

  }

  .topEldrop {
    &:hover {
      color: $menuActiveText !important;

      i {
        color: $menuActiveText !important;
      }
    }
  }

  .top-dropdown-menu {
    padding: 2px;

    .el-dropdown-menu__item {
      padding: 0
    }

    & .el-menu-item {
      &:hover {
        color: $menuActiveText !important;
        background: none !important;

        i {
          color: $menuActiveText !important;
        }
      }
    }
  }

  .right-menu {
    display: flex;
    align-items: center;
    height: 100%;
    flex-shrink: 0;
    padding-right: 8px;

    &:focus {
      outline: none;
    }

    .right-menu-item {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      height: 40px;
      padding: 0 8px;
      font-size: 18px;
      color: #5a5e66;
      line-height: 1;

      &.hover-effect {
        cursor: pointer;
        border-radius: 4px;
        transition: background .3s;

        &:hover {
          background: rgba(0, 0, 0, .025)
        }
      }
    }

    .toolbar-icon {
      font-size: 20px;
      color: #5a5e66;
    }

    .avatar-container {
      margin-left: 4px;

      .userName {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        font-size: 14px;
        font-weight: 500;
        color: #3DA2FF;
        line-height: 1;
        white-space: nowrap;

        .el-icon-caret-bottom {
          font-size: 12px;
          color: #909399;
        }
      }
    }
  }

  .sysInfo {

    /* 菜单标题文字颜色*/
    .el-dropdown-link {
      cursor: pointer;
      color: #3f413f;
    }

    /* 鼠标移入后展现的样式修改*/
    .el-dropdown-menu__item:not(.is-disabled):hover {
      background-color: #ddffea;
      color: #38bb55;
    }

    /*下拉框字体颜色*/
    .el-dropdown-menu__item {
      color: rgb(31, 29, 29);
    }

    .el-dropdown-menu__item--divided {
      margin-top: 0 !important;
      padding: 4px 10px;

      &::before {
        height: 0;
      }
    }
  }

</style>
