<template>
  <div class="navbar">
    <hamburger id="hamburger-container" :is-active="sidebar.opened" class="hamburger-container"
      @toggleClick="toggleSideBar" />
    <breadcrumb id="breadcrumb-container" class="breadcrumb-container" />
  </div>
</template>

<script>
  import {
    mapGetters
  } from 'vuex'
  import Breadcrumb from '@/components/Breadcrumb'
  import Hamburger from '@/components/Hamburger'
  import ErrorLog from '@/components/ErrorLog'
  import SizeSelect from '@/components/SizeSelect'
  import LangSelect from '@/components/LangSelect'
  import Search from '@/components/HeaderSearch'
  
  import {
    MessageBox,
    Message
  } from 'element-ui'

  export default {
    components: {
      Breadcrumb,
      Hamburger,
      ErrorLog,
      SizeSelect,
      LangSelect,
      Search
    },
    data() {
      return {

      }
    },
    computed: {
      ...mapGetters([
        'sidebar',
        'avatar',
        'device'
      ]),

      logoData() {
        return this.$store.getters.logoData
      }
    },
    methods: {
      toggleSideBar() {
        this.$store.dispatch('app/toggleSideBar')
      },

    }
  }

</script>

<style lang="scss" scoped>
  .navbar {
    height: 50px;
    overflow: hidden;
    position: relative;
    background: #fff;
    box-shadow: 0 1px 4px rgba(0, 21, 41, .08);

    .hamburger-container {
      line-height: 46px;
      height: 100%;
      float: left;
      cursor: pointer;
      transition: background .3s;
      -webkit-tap-highlight-color: transparent;

      &:hover {
        background: rgba(0, 0, 0, .025)
      }
    }

    .breadcrumb-container {
      float: left;
    }

    .errLog-container {
      display: inline-block;
      vertical-align: top;
    }


  }

</style>
