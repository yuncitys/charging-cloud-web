<template>
  <el-dialog :title="title" :visible.sync="visible" lock-scroll>
    <div class="req-item">
      <h3>入参: </h3>
      <div class="code">
        <pre v-highlightjs="reqCode">
          <code class="javascript">
          </code>
        </pre>
      </div>
    </div>
    <div class="req-item">
      <h3>返回: </h3>
      <div class="code">
        <pre v-highlightjs="resCode">
          <code class="javascript"></code>
        </pre>
      </div>
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: "ReqAndRes",
  data() {
    return {
      visible: false,
      title: '请求第三方代码',
      reqCode: '',
      resCode: ''
    }
  },
  computed: { },
  methods: {
    init(req, res, title) {
      this.visible = true
      this.reqCode = req?req:''
      this.resCode = res?res:''
      this.title = '请求第三方代码: '+ title
    },
  }
}
</script>

<style scoped lang="scss">
>>> .el-dialog__body{
  padding: 10px 20px;
}
h3{
  line-height: 1;
  font-size: 14px;
}
</style>
