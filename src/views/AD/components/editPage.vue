<template>
	<div style="display: inline-block;">
		<el-button type="primary" @click="" style="margin-left: 10px;" @click="editData()"
			v-if="btnAuthen.permsVerifAuthention(':AD:ADList:edit')">编辑
		</el-button>

		<!-- 编辑 -->
		<el-dialog :visible.sync="showEditAD" title="编辑广告" @close="showEditAD = false" v-loading="loadingEdit" :append-to-body="true">
			<el-form ref="editAdData" :model="editAdData" label-position="left" label-width="120px"
				style="width: 600px; margin-left:50px;" :rules="Rules" :append-to-body="true">
				<!-- <el-form-item :label="'运营商'" prop="adminId">
				<el-select style="width: 100%;" class="filter-item" v-model="editAdData.adminId" filterable clearable placeholder="请选择运营商">
					<el-option
						v-for="item in operatorList"
						:key="item.id"
						:label="item.adminFullname"
						:value="item.id">
					</el-option>
				</el-select>
				</el-form-item> -->
				<el-form-item :label="'广告名称'" prop="imageTitle">
					<el-input v-model="editAdData.imageTitle" placeholder="请输入广告名称" clearable />
				</el-form-item>
				<el-form-item :label="'排序号'" prop="sorting">
					<el-input v-model="editAdData.sorting" placeholder="请输入排序号" clearable />
				</el-form-item>
				<el-form-item :label="'文件类型'" prop="types">
					<el-select v-model="editAdData.types" style="width: 100%;margin-right: 20px ;" class="filter-item"
						placeholder="请选上传文件类型" clearable @change="changeTypes">
						<el-option v-for="item in tags" :key="item.id" :label="item.title" :value="item.id" />
					</el-select>
				</el-form-item>
				<!-- 图片 -->
				<!-- <el-form-item :label="'跳转链接'" prop="imageLink" v-if="editAdData.types == 1">
					<el-input v-model="editAdData.imageLink" placeholder="请输入跳转链接" clearable />
				</el-form-item> -->
				<!-- 图片 -->
				<el-form-item :label="`${editAdData.types == 1 ? '上传图片' : '上传视频'}`" prop="imageUrl">
					<uploadFile v-model="editAdData.imageUrl" ref="upload" />
				</el-form-item>

				<el-form-item>
					<el-button type="primary" @click="oneditAdData('editAdData')">修改</el-button>
					<el-button @click="showEditAD = false">取消</el-button>
				</el-form-item>
			</el-form>
		</el-dialog>
	</div>
</template>

<script>
	import {
		getList,
		deleteImageCarousel,
		addImageCarousel,
		updateImageCarousel,
		uploadImg
	} from '@/api/AD/ADList.js'
	import {
		parseTime
	} from '@/utils/index'
  import {
    getOperator
  } from '@/api/agent/agentList.js'
  import uploadFile from '@/components/Common/uploadFile.vue'
	export default {
		props:{
			row_data:{
				type:Object
			}
		},
		components: {
      uploadFile
		},
		data() {
			return {
				showEditAD: false,
        		operatorList: [],
				editAdData: {
					imageTitle: '',
					imageUrl: '',
					imageLink: '',
					sorting: '',
					types: 1
				},
				tags: [{
					title: '图片',
					id: 1,
				}, {
					title: '视频',
					id: 2,
				}],
				loadingEdit: false,
				Rules: {
					imageTitle: [{
						required: true,
						message: '请输入广告名称',
						trigger: 'change'
					}],
					imageUrl: [{
						required: true,
						message: '请上传图片或者视频',
						trigger: 'change'
					}],
					types: [{
						required: true,
						message: '请选择广告类型',
						trigger: 'blur',
					}],
					sorting: [{
						required: true,
						message: '请选择排序序号',
						trigger: 'blur',
					}]
				},
			}
		},
		filters: {
			formatDate: function(time) {
				if (!time) {
					return ''
				}
				return parseTime(time)
			},
		},
		methods: {
			getOperator() {
				getOperator().then(res => {
					if (res.code == 200) {
						this.operatorList = res.data
					} else {
						this.$message.error(res.msg)
					}
				})
			},
			changeTypes(e) {
				console.log(e)
				this.editAdData.imageUrl = ''
				this.editAdData.imageLink = ''
				this.$refs.upload.getType(e)
			},
			editData() {
				let scope = this.row_data
				console.log(scope)
				let edit = {
					id: scope.id,
					imageTitle: scope.imageTitle,
					imageUrl: scope.imageUrl,
					sorting: scope.sorting,
					imageLink: scope.imageLink,
					types: scope.types
				}
				this.showEditAD = true
				this.editAdData = edit
        		this.getOperator()
				this.$nextTick(()=>{
					this.$refs.upload.getType(scope.types)
				})
			},
			oneditAdData(formName) {
				this.$refs[formName].validate(valid => {
					if (valid) {
						console.log(this.editAdData)
						updateImageCarousel(this.editAdData).then(res => {
							if (res.code == 200) {
								this.showEditAD = false
								this.resetForm(formName)
								this.$message.success(res.msg)
								this.$emit('getLists')
							} else {
								this.$message.error(res.msg)
							}
						})
					} else {
						console.log("不通过")
						return false
					}
				})
			},
			resetForm(formName) {
				this.$refs[formName].resetFields();
			},
		},
		created() {

		},
	}
</script>

<style scoped="scoped">

</style>
