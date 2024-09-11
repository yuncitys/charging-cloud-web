<!--
 * @Description: 
 * @Author: PYH
 * @Date: 2019-08-07
 -->
<template functional>
  <el-submenu :index="props.data.name">
    <template slot="title">
      <i :class="props.data.icon"></i>
      <span>{{props.data.name}}</span>
    </template>
    <template v-for="item in props.data.children">
      <div  v-if="item.children && item.children.length === 0">
        <el-menu-item class="subitem" :index="item.name">
          <i :class="item.icon"></i>
          <span slot="title">{{item.name}}</span>
        </el-menu-item>
      </div>
      <sub-menu v-else :data="item" :key="item.name"></sub-menu>
    </template>
  </el-submenu>
</template>

<script>
export default {
  name: "submenu",
  props: {
    data: [Array, Object]
  }
};
</script>

<style lang="scss" scoped>
.el-submenu {
  .el-menu-item {
    padding: 0;
  }
}
</style>