<template>
  <div class="divElmenu" ref="divElmenu">
    <el-menu :default-active="pActiveMenu" :background-color="variables.menuBg" :text-color="variables.menuText"
      :unique-opened="true" :active-text-color="variables.menuActiveText" :collapse-transition="false" mode="horizontal"
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
            更多..<i class="el-icon-arrow-down el-icon--right"></i>
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
      <template v-if="device!=='mobile'">
        <div style="display:flex;align-items:center">
          <el-tooltip content="大数据" effect="dark" placement="bottom">
            <div class="largeScreenBox" @click="largeScreen">
              <i class="el-icon-s-platform" style="font-size: 28px;color: #5a5e66;"></i>
            </div>
          </el-tooltip>
          <!-- <screenfull id="screenfull" class="right-menu-item hover-effect" style="display:flex;align-items:center" /> -->
        </div>
      </template>
      <el-dropdown class="avatar-container right-menu-item hover-effect" trigger="click">
        <div class="userName">{{userName}}<i class="el-icon-caret-bottom" style="font-size: 18px;color: #666;" /></div>
        <el-dropdown-menu slot="dropdown" class="sysInfo">
          <el-dropdown-item divided @click.native="setPwd">
            <span>修改密码</span>
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

    },
    data() {
      return {
        pActiveMenu: '首页',
        topOffsetWidth: 0,
        lists: [],
        elmenuMore: []
      }
    },
    created() {
      if (window.sessionStorage.getItem("pActiveMenu")) {
        this.pActiveMenu = window.sessionStorage.getItem("pActiveMenu")
      };
    },
    computed: {
      ...mapGetters([
        'permission_routes',
        'sidebar',
        'device'

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
        window.sessionStorage.setItem("pActiveMenu", item.title);
        this.pActiveMenu = item.title;
        if (item.children.length > 0) {
          this.$store.commit('permission/setleftMeunList', item.children);
          this.$store.dispatch('app/openSideBar')
          this.$router.push({
            path: item.children[0].href
          });
          window.sessionStorage.setItem("activeMenu", item.children[0].href);
          window.sessionStorage.setItem("leftmeunList", JSON.stringify(item.children));
        } else {
          window.sessionStorage.removeItem("leftmeunList", item.title);
          this.$store.commit('permission/setleftMeunList', []);
          this.$store.dispatch('app/closeSideBar', {
            withoutAnimation: false
          })
          this.$router.push({
            path: item.href
          })
        }

      },
      // 数组拆分
      // size每组数组多少个，如：8
      // array需要拆分的数组
      arrayChunk(array, size) {
        let data = []
        for (let i = 0; i < array.length; i += size) {
          data.push(array.slice(i, i + size))
        }
        return data
      },
      async logout() {
        let logoutFrom = {
          grandType: 'password'
        }
        logout(logoutFrom).then(res => {
          if (res.code == 200) {
            this.$store.dispatch('user/resetToken')
            this.$router.push(`/login?redirect=${this.$route.fullPath}`);
            window.sessionStorage.removeItem("activeMenu");
            window.sessionStorage.removeItem("pActiveMenu");
            window.sessionStorage.removeItem("leftmeunList");
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
  }

  .top-elmenu {
    overflow: hidden;
    display: flex;
    flex: 1;
    border: none !important;
    margin-left: 100px;

    & .el-menu-item {
      padding: 0 0px;
      line-height: normal;
      color: $menuText !important;
      font-weight: 600;

      &>div {
        padding: 8px 22px;
        margin: 14px 4px;
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
