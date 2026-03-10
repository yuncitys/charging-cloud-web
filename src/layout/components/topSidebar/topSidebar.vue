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
    <div class="right-menu" style="display: flex;">
      <div style="display:flex; align-items:center">
        <template v-if="device!=='mobile'">
          <el-tooltip content="大数据" effect="dark" placement="bottom"  class="right-menu-item hover-effect" >
            <div class="largeScreenBox" @click="largeScreen">
              <i class="el-icon-s-platform" style="font-size: 28px;color: #5a5e66;"></i>
            </div>
          </el-tooltip>
        </template>
        <lang-select class="right-menu-item hover-effect" style="display:flex; align-items:center" />
        <screenfull id="screenfull" class="right-menu-item hover-effect" style="display:flex; align-items:center" />

        <!-- 布局切换按钮 -->
        <el-tooltip
          :content="menuLayout === 'mix' ? '切换到左侧菜单' : '切换到混合菜单'"
          effect="dark"
          placement="bottom"
          class="right-menu-item hover-effect layout-toggle-btn"
        >
          <div @click="toggleMenuLayout" style="display:flex; align-items:center; padding: 0 8px; cursor: pointer;">
            <svg v-if="menuLayout === 'mix'" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#5a5e66" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="7" height="18" rx="1"/>
              <rect x="13" y="3" width="8" height="4" rx="1"/>
              <rect x="13" y="10" width="8" height="4" rx="1"/>
              <rect x="13" y="17" width="8" height="4" rx="1"/>
            </svg>
            <svg v-else viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#5a5e66" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="7" height="18" rx="1"/>
              <line x1="13" y1="3" x2="21" y2="3"/>
              <line x1="13" y1="8" x2="21" y2="8"/>
              <line x1="13" y1="13" x2="21" y2="13"/>
              <line x1="13" y1="18" x2="21" y2="18"/>
              <line x1="13" y1="21" x2="21" y2="21"/>
            </svg>
          </div>
        </el-tooltip>
      </div>

      <el-dropdown class="avatar-container right-menu-item hover-effect" trigger="click">
        <div class="userName">{{userName}}<i class="el-icon-caret-bottom" style="font-size: 18px;color: #666;" /></div>
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
  import {
    mapGetters
  } from 'vuex';
  import variables from '@/styles/variables.scss'
  import {
    logout
  } from '@/api/user'
  export default {
    components: {
      Screenfull,
      LangSelect
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
        if (item.children.length > 0) {
          this.$store.commit('permission/setLeftMeunList', item.children);
          this.$store.dispatch('app/openSideBar')
          this.$router.push({
            path: item.children[0].href
          });
          window.localStorage.setItem("activeMenu", item.children[0].href);
          window.localStorage.setItem("leftMeunList", JSON.stringify(item.children));
        } else {
          window.localStorage.removeItem("leftMeunList", item.title);
          this.$store.commit('permission/setLeftMeunList', []);
          this.$store.dispatch('app/closeSideBar', {
            withoutAnimation: false
          })
          this.$router.push({
            path: item.href
          })
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
    },
  }

</script>
<style lang="scss" scoped>
  @import "~@/styles/variables.scss";

  .divElmenu {
    display: flex;
    align-items: center;
    border-bottom: solid 1px #e6e6e6;

    /* 左侧菜单模式：整行高度 60px（与左侧 logo 区等高），去掉底部分割线，右侧操作区靠右 */
    &.sidebar-only-mode {
      border-bottom: none;
      height: 60px;

      .right-menu {
        margin-left: auto;
        height: 100%;
        display: flex;
        align-items: center;
      }
    }
  }

  .top-elmenu {
    overflow: hidden;
    display: flex;
    flex: 1;
    height: 60px;          /* 与整行高度一致 */
    border: none !important;

    & .el-menu-item {
      padding: 0;
      height: 100%;          /* 撑满 60px */
      display: flex;
      align-items: center;   /* 内层 div 垂直居中 */
      line-height: normal;
      color: $menuText !important;
      font-weight: 600;

      &>div {
        padding: 8px 22px;
        margin: 0 4px;       /* 去掉固定上下 margin，交由 flex 居中 */
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

  .userName {
    font-size: 25px;
    color: #3DA2FF;
    margin: 0 20px;
  }

  .right-menu {
    float: right;
    height: 100%;

    &:focus {
      outline: none;
    }

    .right-menu-item {
      display: inline-block;
      padding: 0 8px;
      height: 100%;
      font-size: 18px;
      color: #5a5e66;
      vertical-align: text-bottom;

      &.hover-effect {
        cursor: pointer;
        transition: background .3s;

        &:hover {
          background: rgba(0, 0, 0, .025)
        }
      }
    }

    .avatar-container {
      display: flex;
      align-items: center;

      .avatar-wrapper {
        margin-top: 5px;
        position: relative;

        .user-avatar {
          cursor: pointer;
          width: 40px;
          height: 40px;
          border-radius: 10px;
        }

        .el-icon-caret-bottom {
          cursor: pointer;
          position: absolute;
          right: -20px;
          top: 25px;
          font-size: 12px;
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

    .el-dropdown-menu__item--divided::before {}
  }

</style>
