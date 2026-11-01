<template>
  <section class="app-main">
    <div class="app-content borRadduis10">
      <transition name="fade-transform" mode="out-in">
        <keep-alive :include="cachedViews">
          <router-view :key="key" />
        </keep-alive>
      </transition>
      <backTop />
    </div>
  </section>
</template>

<script>
  import backTop from '@/components/BackToTop'
  export default {
    components: {
      backTop
    },
    name: 'AppMain',
    computed: {
      cachedViews() {
        // console.log(this.$store.state.tagsView.cachedViews)
        return this.$store.state.tagsView.cachedViews
      },
      key() {
        // console.log(this.$route.path)
        return this.$route.path
      }
    }
  }

</script>

<style lang="scss" scoped>
  $content-gap: 15px;

  .hasTagsView {
    .app-main {
      min-height: calc(100vh - 84px);
      width: 100%;
      position: relative;
      overflow: hidden;
      background: #e9eff8;
      padding: $content-gap;

      .app-content {
        background: white;
        min-height: calc(100vh - 84px);
      }
    }
  }

  /* 固定顶栏占位 + 与左右/底一致的内容间距（须写在 padding 之后以免被覆盖） */
  .fixed-header+.app-main {
    padding-top: 50px + $content-gap;
  }

  /* mix：水平菜单 60 + 面包屑 50 + 间距 */
  .mix-header.fixed-header+.app-main {
    padding-top: 110px + $content-gap;
  }

  /* sidebar：合并顶栏 60 + 间距 */
  .sidebar-combined-header.fixed-header+.app-main {
    padding-top: 60px + $content-gap;
  }

</style>

<style lang="scss">
  // fix css style bug in open el-dialog
  .el-popup-parent--hidden {
    .fixed-header {
      padding-right: 15px;
    }
  }

</style>
