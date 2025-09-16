<template>
  <div :class="{'has-logo':showLogo}">
    <logo v-if="showLogo" :collapse="isCollapse" />
    <el-scrollbar wrap-class="scrollbar-wrapper">
      <!-- logo -->
      <div>
        <div class="logoBox" v-if="!isCollapse">
          <div class="logoItem flex" style="width: 170px;">
            <div style="padding: 0 10px;">
              <img :src="logoData.LOGO_IMG" class="logoImg" v-if="logoData.LOGO_IMG" />
              <!-- <img src="../../../assets/logo.png" class="logoImg" v-else/> -->
            </div>
            <div class="logoText">
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
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        :background-color="variables.menuBg"
        :text-color="variables.menuText"
        :unique-opened="false"
        :active-text-color="variables.menuActiveText"
        :collapse-transition="false"
        mode="vertical"
        class="leftElmenuClass">
        <template v-for="item in leftmeunList">
          <el-submenu v-if="item.children && item.children.length" :index="item.href || `item-${item.id}`" :key="item.id">
            <template #title>
              <div @click="onClick(item.href)">
                <i :class="item.icon"></i>
                <span>{{ item.title }}</span>
              </div>
            </template>
            <el-menu-item
              v-for="subItem in item.children"
              :key="subItem.id"
              :index="subItem.href || `subitem-${subItem.id}`" v-if="!subItem.perms.startsWith(':')">
              <div @click="onClick(subItem.href)">
                <i :class="subItem.icon"></i>
                <span>{{ subItem.title }}</span>
              </div>
            </el-menu-item>
          </el-submenu>
          <!-- <el-menu-item v-else :index="item.href" :key="item.title">
            <div @click="onClick(item.href)">
              <i :class="item.icon"></i>
              <span>{{ item.title }}</span>
            </div>
          </el-menu-item> -->
          <el-submenu v-else :index="item.href || `item-${item.id}`" :key="item.id">
            <template #title>
              <div @click="onClick(item.href)">
                <i :class="item.icon"></i>
                <span>{{ item.title }}</span>
              </div>
            </template>
            <!-- <el-menu-item :index="item.href" :key="item.id">
              <div @click="onClick(item.href)">
                <i :class="item.icon"></i>
                <span>{{ item.title }} (href: {{ item.href }})</span>
              </div>
            </el-menu-item> -->
          </el-submenu>
        </template>
      </el-menu>
      <!-- <el-menu :default-active="activeMenu" :collapse="isCollapse" :background-color="variables.menuBg"
        :text-color="variables.menuText" :unique-opened="true" :active-text-color="variables.menuActiveText"
        :collapse-transition="false" mode="vertical" class="leftElmenuClass">
        <template v-for="item in leftmeunList">
          <el-menu-item :index="item.href" :key="item.title">
            <div @click="onClick(item.href)">
              <i :class="item.icon"></i>
              <span>{{ item.title }}</span>
            </div>
          </el-menu-item>
        </template>
      </el-menu> -->
    </el-scrollbar>
  </div>
</template>

<script>
  import {
    mapGetters
  } from 'vuex'
  import Logo from './Logo'
  import SidebarItem from './SidebarItem'
  import variables from '@/styles/variables.scss'
  import subMenu from "./subMenu";
  export default {
    data() {
      return {
        activeMenu: '',
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
      let list = window.sessionStorage.getItem("leftmeunList");
      if (list) {
        this.$store.commit('permission/setleftMeunList', JSON.parse(list));
      }else{
        this.$store.commit('permission/setleftMeunList', []);
      }
      this.activeMenu = window.sessionStorage.getItem("activeMenu");
    },
    methods: {
      onClick(name) {
        this.$router.push({
          path: name
        })
        window.sessionStorage.setItem("activeMenu", name);
        this.activeMenu = name;
      }
    },
    components: {
      SidebarItem,
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
      leftmeunList() {
        return this.$store.getters.leftmeunList
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

    .logoItem {
      height: 60px;
      display: flex;
      align-items: center;

      .logoImg {
        width: 30px;
        height: 30px;
        // border-radius: 50%;
      }

      .logoText {
        font-size: 16px;
        color: rgb(49, 48, 48);
        font-weight: bold;
        margin-left: 10px;
      }
    }
  }

  .active {
    color: #1890FF;
  }

  .iconColor {
    color: #FFFFFF;
  }

  // .el-menu-item {
  // 	padding-left: 40px !important;
  // }

  .leftElmenuClass {
    border: none !important;

    & .el-menu-item {
      // padding-left: revert !important;
      padding-left: 20px !important;
      // padding: 0 3px;
      line-height: normal;
      color: $menuText !important;

      &>div {
        // padding: 14px 22px;
        margin: 3px 15px;
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

    // .el-submenu.is-opened{
    // }

  }


  .el-menu--collapse {
    .el-menu-item {
      display: flex;
      justify-content: center;
    }
  }
</style>
