<template>
	<div style="display: inline-block;">
		<el-dialog :visible.sync="showAdd" title="新增物联网卡" @close="showAdd = false">
			<el-form ref="addData" :model="addData" label-position="left" label-width="100px"
				style="width: 600px; margin-left:50px;" :rules="iotCardRules" :append-to-body="true">
        <el-form-item :label="'归属'" prop="adminId">
        	<el-autocomplete class="filter-item" v-model="addData.adminName" :fetch-suggestions="querySearch"
        		placeholder="请选择归属" @select="selectOperator" clearable :debounce='0' style="width: 100%;"
        		@change="changeOperatorName" >
          </el-autocomplete>
        </el-form-item>
				<el-form-item :label="'ICCID'" prop="iccid">
					<el-input v-model="addData.iccid" placeholder="请输入ICCID" clearable />
				</el-form-item>
				<el-form-item :label="'IMSI'" prop="imsi">
					<el-input v-model="addData.imsi" placeholder="请输入IMSI" clearable />
				</el-form-item>
        <el-form-item :label="'MSISDN'" prop="msisdn">
        	<el-input v-model="addData.msisdn" placeholder="请输入MSISDN" clearable />
        </el-form-item>
        <el-form-item :label="'渠道商'" prop="channelName">
        	<el-input v-model="addData.channelName" placeholder="请输入渠道商" clearable />
        </el-form-item>
        <el-form-item :label="'备注'" prop="remark">
        	<el-input v-model="addData.remark" placeholder="请输入备注" clearable />
        </el-form-item>
				<el-form-item>
					<el-button type="primary" @click="onSave('addData')">确定</el-button>
					<el-button @click="showAdd = false">取消</el-button>
				</el-form-item>
			</el-form>
		</el-dialog>
	</div>
</template>

<script>
	import {
		getList,
		add
	} from '@/api/iotCard/iotCard.js'
	import {
		parseTime
	} from '@/utils/index'
  import {
    getOperator
  } from '@/api/agent/agentList.js'
	export default {
		name: 'addIotCard',
		data() {
			return {
				showAdd: false,
				addData: {
					iccid: '',
					imsi: '',
					msisdn: '',
          channelName:'',
          remark:'',
          adminId:'',
          adminName:''
				},
        iotCardRules: {
          iccid: [{
          	required: true,
          	message: '请输入iccid',
          	trigger: 'blur'
          }],
        	imsi: [{
        		required: true,
        		message: '请输入imsi',
        		trigger: 'blur'
        	}],
        	msisdn: [{
        		required: true,
        		message: '请输入msisdn',
        		trigger: 'blur'
        	}],
          adminId: [{
          	required: true,
          	message: '请选择归属',
          	trigger: 'change'
          }],
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
      openSave(){
        this.showAdd = true
        this.addData.iccid = ''
        this.addData.imsi = ''
        this.addData.msisdn = ''
        this.addData.channelName = ''
        this.addData.adminId = ''
        this.addData.adminName = ''
        this.addData.remark = ''
        this.getOperator()
      },
			onSave(formName) {
				console.log(this.addData)
				if (this.addData.iccid == '' || this.addData.iccid == null || this.addData.iccid ==
        undefined) {
					this.$message.error("请输入ICCID")
					return false
				}
				if (this.addData.imsi == '' || this.addData.imsi == null || this.addData.imsi ==
					undefined) {
					this.$message.error("请输入IMSI")
					return false
				}
				if (this.addData.msisdn == '' || this.addData.msisdn == null || this.addData.msisdn ==
					undefined) {
					this.$message.error("请输入msisdn")
					return false
				}
				add(this.addData).then(res => {
					if (res.code == 200) {
						this.showAdd = false
						this.resetForm(formName)
						this.$message.success(res.msg)
						this.$emit('getLists')
					} else {
						this.$message.error(res.msg)
					}
				})
			},
			resetForm(formName) {
				this.$refs[formName].resetFields();
			},
      //选择代理商
      selectOperator(item) {
      	this.addData.adminId = item.operatorId + ''
      	this.addData.adminName = item.value + ''
      },
      changeOperatorName() {
      	if (this.addData.adminName == '') {
      		this.addData.adminId = ''
      	}
        this.getOperator()
      },
      querySearch(queryString, cb) {
      	var restaurants = this.restaurants;
        console.log("restaurants：",restaurants)
      	let restaurantsText = []
      	if (restaurants.length != '') {
      		restaurants.forEach((item, index) => {
      			let obj = {
      				value: '',
      				operatorId: ''
      			}
      			let value = item.adminName + "(" + item.adminFullname + ")"
      			obj.value = value
      			obj.operatorId = item.id
      			restaurantsText.push(obj)
      		})
      	}
      	var results = queryString ? restaurantsText.filter(this.createFilter(queryString)) : restaurantsText;
        console.log("results：",results)
      	// 调用 callback 返回建议列表的数据
      	cb(results);
      },
      createFilter(queryString) {
      	return (restaurant) => {
      		return (restaurant.value.toLowerCase().indexOf(queryString.toLowerCase()) > -1);
      	};
      },
      //代理商列表
      getOperator() {
      	getOperator().then(res => {
      		if (res.code == 200) {
      			this.operatorList = res.data
      			this.restaurants = this.operatorList
      			this.restaurants.forEach((item, index) => {
      				if (Number(this.addData.adminId) === Number(item.id)) {
      					this.addData.adminName = item.adminName + "(" + item.adminFullname + ")"
      				}
      			})
      		} else {
      			this.$message.error(res.msg)
      		}
      	})
      },
		},
		created() {
		},
	}
</script>
