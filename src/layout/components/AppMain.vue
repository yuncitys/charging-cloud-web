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
  .fixed-header+.app-main {
    padding-top: 50px;
  }

  .hasTagsView {
    .app-main {
      min-height: calc(100vh - 84px);
      width: 100%;
      position: relative;
      overflow: hidden;
      background: #e9eff8;
      padding: 15px;

      .app-content {
        background: white;
        min-height: calc(100vh - 84px);
      }
    }

    .fixed-header+.app-main {
      padding-top: 84px;
    }
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
