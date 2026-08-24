<template>
  <div class="errPage-container">
    <div class="err-icon">
      <i class="el-icon-lock" />
    </div>
    <h2 class="err-title">暂无访问权限</h2>
    <p class="err-desc">您没有权限访问该页面，请联系管理员授权后重试</p>
    <el-button type="primary" @click="back">返回上一页</el-button>
    <router-link to="/dashboard" class="home-link">回到首页</router-link>
  </div>
</template>

<script>
export default {
  name: 'Page401',
  methods: {
    back() {
      if (this.$route.query.noGoBack) {
        this.$router.push({ path: '/dashboard' })
      } else {
        this.$router.go(-1)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.errPage-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  text-align: center;

  .err-icon {
    font-size: 72px;
    color: #c0c4cc;
    margin-bottom: 16px;
  }

  .err-title {
    font-size: 22px;
    font-weight: 600;
    color: #303133;
    margin: 0 0 8px;
  }

  .err-desc {
    font-size: 14px;
    color: #909399;
    margin: 0 0 24px;
  }

  .home-link {
    display: inline-block;
    margin-top: 12px;
    font-size: 13px;
    color: #409eff;
    text-decoration: none;
    &:hover {
      text-decoration: underline;
    }
  }
}
</style>
