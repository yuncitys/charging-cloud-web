<template>
  <div :class="{'has-logo':showLogo}">
    <logo v-if="showLogo" :collapse="isCollapse" />
    <el-scrollbar wrap-class="scrollbar-wrapper">
      <!-- logo -->
      <div>
        <div class="logoBox" v-if="!isCollapse">
          <div class="logoItem flex">
            <div class="logoImgBox">
              <img :src="logoData.LOGO_IMG" class="logoImg" v-if="logoData.LOGO_IMG" />
              <!-- <img src="../../../assets/logo.png" class="logoImg" v-else/> -->
            </div>
            <div class="logoText" :title="logoData.TITLE ? logoData.TITLE : '智慧充电运营平台'">
              {{logoData.TITLE ? logoData.TITLE : '智慧充电运营平台'}}
            </div>
          </div>
        </div>
        <div class="logoBox" v-if="isCollapse">
          <div class="logoItem flex">
            <div>
              <img :src="logoData.LOGO_IMG" class="logoImg" v-if="logoData.LOGO_IMG" />
              <!-- <img src="../../../assets/logo-xy.png" class="logoImg"
                style="width: 20px;height: 20px;margin-left: 10px;" /> -->
            </div>
          </div>
        </div>
      </div>

      <el-menu :default-active="activeMenu" :collapse="isCollapse" :background-color="variables.menuBg"
        :text-color="variables.menuText" :unique-opened="true" :active-text-color="variables.menuActiveText"
        :collapse-transition="false" mode="vertical" class="leftElmenuClass sidebar-only-menu"
        @select="handleMenuSelect">
        <sidebar-only-item
          v-for="item in leftMeunList"
          :key="String(item.id || item.title)"
          :item="item"
        />
      </el-menu>
    </el-scrollbar>
  </div>
</template>

<script>
  import {
    mapGetters
  } from 'vuex'
  import Logo from './Logo'
  import SidebarItem from './SidebarItem'
  import SidebarOnlyItem from '../SidebarOnly/SidebarOnlyItem'
  import variables from '@/styles/variables.scss'
  import subMenu from "./subMenu";
  export default {
    data() {
      return {
        activeMenu: ''
      }
    },
    //监听执行
    watch: {
      $route(route) {
        let paths = this.$route.path;
        this.activeMenu = paths;
      },
    },
    created() {
      // let list = window.sessionStorage.getItem("leftmeunList");
      let list = window.localStorage.getItem("leftMeunList");
      if (list) {
        this.$store.commit('permission/setLeftMeunList', JSON.parse(list));
      }else{
        this.$store.commit('permission/setLeftMeunList', []);
      }
      // this.activeMenu = window.sessionStorage.getItem("activeMenu");
      this.activeMenu = window.localStorage.getItem("activeMenu") || this.$route.path;
    },
    methods: {
      handleMenuSelect(index) {
        if (index && index.startsWith('/')) {
          if (this.$route.path !== index) {
            this.$router.push({ path: index })
          }
          this.activeMenu = index
          window.localStorage.setItem("activeMenu", index)
        }
      },
      onClick(name) {
        this.handleMenuSelect(name)
      }
    },
    components: {
      SidebarItem,
      SidebarOnlyItem,
      Logo,
      subMenu
    },
    computed: {
      ...mapGetters([
        'permission_routes',
        'sidebar',
      ]),
      showLogo() {
        return this.$store.state.settings.sidebarLogo
      },
      variables() {
        return variables
      },
      isCollapse() {
        return !this.sidebar.opened
      },
      leftMeunList() {
        return this.$store.getters.leftMeunList
      },
      logoData() {
        return this.$store.getters.logoData
      }
    }
  }

</script>
<style scoped lang="scss">
  // #app .hideSidebar .el-submenu>.el-submenu__title {
  //   padding-left: 20px !important;
  // }

  @import "~@/styles/variables.scss";

  .logoBox {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    box-sizing: border-box;
    padding: 0 12px;
    overflow: hidden;

    .logoItem {
      width: 100%;
      height: 60px;
      display: flex;
      align-items: center;
      min-width: 0;

      .logoImgBox {
        flex-shrink: 0;
        padding: 0 10px;
      }

      .logoImg {
        width: 30px;
        height: 30px;
        display: block;
      }

      .logoText {
        flex: 1;
        min-width: 0;
        font-size: 16px;
        color: rgb(49, 48, 48);
        font-weight: bold;
        margin-left: 10px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }

  .active {
    color: #1890FF;
  }

  .iconColor {
    color: #FFFFFF;
  }

  .leftElmenuClass {
    border: none !important;

    &.sidebar-only-menu {
      .el-submenu > .el-submenu__title {
        height: auto !important;
        line-height: normal !important;
        padding: 3px 6px !important;
      }

      .el-submenu .el-menu-item {
        padding-left: 20px !important;
      }
    }

    & .el-menu-item {
      padding-left: 20px !important;
      line-height: normal;
      color: $menuText !important;

      &>div {
        padding: 14px 22px;
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
        font-weight: 600;
      }
    }
    
  }


  .leftElmenuClass.sidebar-only-menu.el-menu--collapse {
    .el-menu-item {
      display: flex;
      justify-content: center;
      padding-left: 0 !important;
    }

    .el-submenu > .el-submenu__title {
      display: flex !important;
      justify-content: center !important;
      padding-left: 0 !important;

      .el-submenu__icon-arrow {
        display: none;
      }
    }
  }
</style>
