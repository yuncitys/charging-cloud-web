<!--
*新增广告
 -->
<template>
	<div style="display: inline-block;">
		<el-button style="margin-right: 20px ;" type="primary" @click="onShowAddAD"
			v-if="btnAuthen.permsVerifAuthention(':AD:ADList:add')">新增广告</el-button>
		<!-- 新增广告 -->
		<el-dialog :visible.sync="showAddAD" title="新增广告" @close="showAddAD = false" v-loading="loadingAdd">
			<el-form ref="addAdData" :model="addAdData" label-position="left" label-width="120px" style="width: 600px; margin-left:50px;" :rules="Rules" :append-to-body="true">
				<!-- <el-form-item :label="'运营商'" prop="adminId">
					<el-select style="width: 100%;" class="filter-item" v-model="addAdData.adminId" filterable clearable placeholder="请选择运营商">
						<el-option
							v-for="item in operatorList"
							:key="item.id"
							:label="item.adminFullname"
							:value="item.id">
						</el-option>
					</el-select>
				</el-form-item> -->
				<el-form-item :label="'广告名称'" prop="imageTitle">
					<el-input v-model="addAdData.imageTitle" placeholder="请输入广告名称" clearable />
				</el-form-item>
				<el-form-item :label="'排序号'" prop="sorting">
					<el-input v-model="addAdData.sorting" placeholder="请输入排序号" clearable />
				</el-form-item>
				<el-form-item :label="'文件类型'" prop="types">
					<el-select v-model="addAdData.types" style="width: 100%;margin-right: 20px ;" class="filter-item"
						placeholder="请选上传文件类型" clearable @change="changeTypes">
						<el-option v-for="item in tags" :key="item.id" :label="item.title" :value="item.id" />
					</el-select>
				</el-form-item>
				<!-- 图片 -->
				<!-- <el-form-item :label="'跳转链接'" prop="imageLink" v-if="addAdData.types == 1">
						<el-input v-model="addAdData.imageLink" placeholder="请输入跳转链接" clearable />
					</el-form-item> -->
				<!-- 图片 -->
				<el-form-item :label="`${addAdData.types == 1 ? '上传图片' : '上传视频'}`" prop="imageUrl">
					<uploadFile v-model="addAdData.imageUrl" ref="upload" />
				</el-form-item>
				<el-form-item>
					<el-button type="primary" @click="onaddAdData('addAdData')">确定</el-button>
					<el-button @click="showAddAD = false">取消</el-button>
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
		getOperator
	} from '@/api/agent/agentList.js'
	import {
		parseTime
	} from '@/utils/index'
	import uploadFile from '@/components/Common/uploadFile.vue'
	export default {
		name: 'addPage',
		components: {
			uploadFile
		},
		data() {
			return {
				showAddAD: false,
        		operatorList: [],
				addAdData: {
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
				loadingAdd: false,
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
					sorting: [{
						required: true,
						message: '请输入排序序号',
						trigger: 'blur',
					}],
					types: [{
						required: true,
						message: '请选择文件类型',
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
				this.addAdData.imageUrl = ''
				this.addAdData.imageLink = ''
				this.$refs.upload.getType(e)
			},
			onShowAddAD() {
				this.showAddAD = true
        		this.getOperator()
				this.$nextTick(() => {
					this.$refs.upload.getType(1)
				})
			},
			onaddAdData(formName) {
				this.$refs[formName].validate(valid => {
					if (valid) {
						console.log(this.addAdData)
						addImageCarousel(this.addAdData).then(res => {
							if (res.code == 200) {
								this.showAddAD = false
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
