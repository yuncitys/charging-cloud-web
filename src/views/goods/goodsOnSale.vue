<template>
	<div class="app-container">

		<el-card class="box-card">
			<h3>商品介绍</h3>
			<el-form ref="goods" :rules="rules" :model="goods" label-width="150px" style="width:95%;">
				<el-form-item label="商品编号" prop="goodsSn">
					<el-input v-model="goods.goodsSn" />
				</el-form-item>
				<el-form-item label="商品名称" prop="name">
					<el-input v-model="goods.name" />
				</el-form-item>
				<el-form-item label="原价" prop="counterPrice">
					<el-input v-model="goods.counterPrice" placeholder="0.00">
						<template slot="append">元</template>
					</el-input>
				</el-form-item>
				<el-form-item label="优惠后价格" prop="retailPrice">
					<el-input v-model="goods.retailPrice" placeholder="0.00">
						<template slot="append">元</template>
					</el-input>
				</el-form-item>
				<el-form-item label="是否上架" prop="isOnSale">
					<el-radio-group v-model="goods.isOnSale">
						<el-radio :label="true">上架</el-radio>
						<el-radio :label="false">不上架</el-radio>
					</el-radio-group>
				</el-form-item>

				<el-form-item label="主图" prop="picUrl">
					<el-upload :show-file-list="false" :multiple="false" :http-request="uploadPicUrl" action=""
						class="avatar-uploader" accept=".jpg,.jpeg,.png,.gif" :before-upload="beforeUploadShopSteps">
						<img v-if="goods.picUrl" :src="goods.picUrl" class="avatar">
						<i v-else class="el-icon-plus avatar-uploader-icon" />
					</el-upload>
				</el-form-item>
				<el-form-item label="轮播图" prop="gallery">
					<el-upload :multiple="false" :http-request="handleGalleryUrl" :before-upload="beforeUploadShopSteps"
						action="" class="avatar-uploader" list-type="picture-card" :limit="5" :on-exceed="uploadOverrun"
						:on-remove="handleRemove" accept=".jpg,.jpeg,.png,.gif">
						<i class="el-icon-plus" />
					</el-upload>
				</el-form-item>

				<el-form-item label="商品单位">
					<el-input v-model="goods.unit" placeholder="件 / 个 / 盒" />
				</el-form-item>
				<el-form-item label="商品简介">
					<el-input v-model="goods.brief" />
				</el-form-item>

				<el-form-item label="商品详细介绍">
					<editor v-model="goods.detail" ref="editor" />
				</el-form-item>
			</el-form>
		</el-card>

		<el-card class="box-card">
			<h3>商品规格</h3>
			<el-row :gutter="20" type="flex" align="middle" style="padding:20px 0;">
				<el-col :span="10">
					<el-radio-group v-model="multipleSpec" @change="specChanged">
						<el-radio-button :label="false">默认标准规格</el-radio-button>
						<el-radio-button :label="true">多规格支持</el-radio-button>
					</el-radio-group>
				</el-col>
				<el-col v-if="multipleSpec" :span="10">
					<el-button :plain="true" type="primary" @click="handleSpecificationShow">添加</el-button>
				</el-col>
			</el-row>
			<el-table :data="specifications">
				<el-table-column property="specification" label="规格名" />
				<el-table-column property="value" label="规格值">
					<template slot-scope="scope">
						<el-tag type="primary">
							{{ scope.row.value }}
						</el-tag>
					</template>
				</el-table-column>
				<el-table-column property="picUrl" label="规格图片">
					<template slot-scope="scope">
						<img v-if="scope.row.picUrl" :src="scope.row.picUrl" width="40">
					</template>
				</el-table-column>
				<el-table-column v-if="multipleSpec" align="center" label="操作" width="250"
					class-name="small-padding fixed-width">
					<template slot-scope="scope">
						<el-button type="danger" size="mini" @click="handleSpecificationDelete(scope.row)">删除
						</el-button>
					</template>
				</el-table-column>
			</el-table>
			<el-dialog :visible.sync="specVisiable" title="设置规格" :append-to-body="true">
				<el-form ref="specForm" :rules="rules" :model="specForm" status-icon label-position="left"
					label-width="100px" style="width: 400px; margin-left:50px;">
					<el-form-item label="规格名" prop="specification">
						<el-input v-model="specForm.specification" />
					</el-form-item>
					<el-form-item label="规格值" prop="value">
						<el-input v-model="specForm.value" />
					</el-form-item>
					<el-form-item label="规格图片" prop="picUrl">
						<el-upload :show-file-list="false" :multiple="false" :http-request="uploadSpecPicUrl" action=""
							class="avatar-uploader" accept=".jpg,.jpeg,.png,.gif"
							:before-upload="beforeUploadShopSteps">
							<img v-if="specForm.picUrl" :src="specForm.picUrl" class="avatar">
							<i v-else class="el-icon-plus avatar-uploader-icon" />
						</el-upload>
					</el-form-item>
				</el-form>
				<div slot="footer" class="dialog-footer">
					<el-button @click="specVisiable = false">取消</el-button>
					<el-button type="primary" @click="handleSpecificationAdd">确定</el-button>
				</div>
			</el-dialog>
		</el-card>

		<el-card class="box-card">
			<h3>商品库存</h3>
			<el-table :data="products">
				<el-table-column property="value" label="货品规格">
					<template slot-scope="scope">
						<el-tag v-for="tag in scope.row.specifications" :key="tag">
							{{ tag }}
						</el-tag>
					</template>
				</el-table-column>
				<el-table-column property="number" width="100" label="货品数量" />
				<el-table-column property="url" width="100" label="货品图片">
					<template slot-scope="scope">
						<img v-if="scope.row.url" :src="scope.row.url" width="40">
					</template>
				</el-table-column>
				<el-table-column align="center" label="操作" width="100" class-name="small-padding fixed-width">
					<template slot-scope="scope">
						<el-button type="primary" size="mini" @click="handleProductShow(scope.row)">设置</el-button>
					</template>
				</el-table-column>
			</el-table>
			<el-dialog :visible.sync="productVisiable" title="添加库存商品" :append-to-body="true">
				<el-form ref="productForm" :model="productForm" status-icon label-position="left" label-width="100px"
					style="width: 400px; margin-left:50px;">
					<el-form-item label="货品规格列" prop="specifications">
						<el-tag v-for="tag in productForm.specifications" :key="tag">
							{{ tag }}
						</el-tag>
					</el-form-item>
					<el-form-item label="货品数量" prop="number">
						<el-input v-model="productForm.number" />
					</el-form-item>
					<el-form-item label="货品图片" prop="url">
						<el-upload :show-file-list="false" :multiple="false" :http-request="uploadProductUrl" action=""
							class="avatar-uploader" accept=".jpg,.jpeg,.png,.gif"
							:before-upload="beforeUploadShopSteps">
							<img v-if="productForm.url" :src="productForm.url" class="avatar">
							<i v-else class="el-icon-plus avatar-uploader-icon" />
						</el-upload>
					</el-form-item>
				</el-form>
				<div slot="footer" class="dialog-footer">
					<el-button @click="productVisiable = false">取消</el-button>
					<el-button type="primary" @click="handleProductEdit">确定</el-button>
				</div>
			</el-dialog>
		</el-card>

		<el-card class="box-card">
			<h3>商品参数</h3>
			<el-button type="primary" @click="handleAttributeShow">添加</el-button>
			<el-table :data="attributes">
				<el-table-column property="attribute" label="商品参数名称" />
				<el-table-column property="value" label="商品参数值" />
				<el-table-column align="center" label="操作" width="100" class-name="small-padding fixed-width">
					<template slot-scope="scope">
						<el-button type="danger" size="mini" @click="handleAttributeDelete(scope.row)">删除</el-button>
					</template>
				</el-table-column>
			</el-table>
			<el-dialog :visible.sync="attributeVisiable" title="添加商品参数" :append-to-body="true">
				<el-form ref="attributeForm" :model="attributeForm" status-icon label-position="left"
					label-width="100px" style="width: 400px; margin-left:50px;">
					<el-form-item label="商品参数名称" prop="attribute">
						<el-input v-model="attributeForm.attribute" />
					</el-form-item>
					<el-form-item label="商品参数值" prop="value">
						<el-input v-model="attributeForm.value" />
					</el-form-item>
				</el-form>
				<div slot="footer" class="dialog-footer">
					<el-button @click="attributeVisiable = false">取消</el-button>
					<el-button type="primary" @click="handleAttributeAdd">确定</el-button>
				</div>
			</el-dialog>
		</el-card>

		<div class="op-container">
			<el-button @click="handleCancel">取消</el-button>
			<el-button type="primary" @click="handlePublish">上架</el-button>
		</div>

	</div>
</template>
<script>
	import {
		Loading
	} from "element-ui";
	import detail from '@/components/editor/edit.vue';
	import {
		catAndBrand,
		setGoods,
		uploadImg
	} from '@/api/goods/goods.js'
	export default {
		name: 'goodsOnSale1',
		data() {
			return {
				uploadPath: 'http://120.24.242.251:9001/storage/create', //图片上传路径
				headers: { //图片上传消息头
					"Authentication": localStorage.getItem("token")
				},
				newKeywordVisible: false, //商品介绍模块  关键字输入框 默认隐藏
				newKeyword: '', //商品介绍模块  关键字输入框值
				keywords: [], //商品介绍模块  关键字
				categoryList: [], //商品介绍模块  商品所属分类
				brandList: [], //商品介绍模块  商品品牌分类
				goods: { //商品介绍模块  表单
					goodsSn: '', //商品编号
					name: '', //商品名称
					counterPrice: '', //专柜价格
					retailPrice: '', //零售价格
					isHot: false, //是否热卖
					isNew: true, //是否新品
					isOnSale: true, //是否在售
					picUrl: '', //商品图片
					shareUrl: '', //商品分享海报
					gallery: [], //宣传画廊
					unit: '', //商品单位
					keywords: '', //关键字
					categoryId: '', //所属分类
					brandId: '', //所属品牌商
					brief: '', //商品简介
					detail: "请填写商品详细介绍", //商品详细介绍  富文本内容 
				},
				specifications: [ //商品规格表
					{
						specification: '规格',
						value: '标准',
						picUrl: ''
					}
				],
				specVisiable: false, //商品规格  设置规格弹窗隐藏
				specForm: { //商品规格  弹窗  设置规格表单
					specification: '',
					value: '',
					picUrl: ''
				},
				multipleSpec: false, //商品规格  多规格支持
				products: [ //商品库存表
					{
						id: 0,
						specifications: ['标准'],
						price: 0.00,
						number: 0,
						url: ''
					}
				],
				productVisiable: false, //添加库存商品弹窗 隐藏
				productForm: { // 商品库存  弹窗  添加库存商品表单
					id: 0,
					specifications: [],
					price: 0.00,
					number: 0,
					url: ''
				},
				attributes: [], //商品参数表
				attributeVisiable: false, //添加商品参数弹窗 隐藏
				attributeForm: { //商品参数  弹窗  添加商品参数表单
					attribute: '',
					value: ''
				},
				rules: {
					goodsSn: [{
						required: true,
						message: '商品编号不能为空',
						trigger: 'blur'
					}],
					name: [{
						required: true,
						message: '商品名称不能为空',
						trigger: 'blur'
					}]
				},
			}
		},
		methods: {
			init: function() { //获取 商品所属分类、所属品牌商数据
				catAndBrand().then(res => {
					if (res.code == 200) {
						this.categoryList = res.data.categoryList; //商品分类
						this.brandList = res.data.brandList; //商品所属品牌
					}
				})
			},
			handleCategoryChange(value) { //商品所属分类选择
				console.log(value);
				this.goods.categoryId = value[value.length - 1];
				console.log(this.goods.categoryId);
			},
			handlePublish: function() { //商品上架按钮
				this.goods.categoryId = '1008002'
				const finalGoods = {
					goods: this.goods, //商品介绍表单
					specifications: this.specifications, //商品规格表
					products: this.products, //商品库存表
					attributes: this.attributes, //商品参数表
				}
				setGoods(finalGoods).then(res => {
					if (res.code == 200) {
						this.$message.success("添加成功!");
						//this.$store.dispatch('tagsView/delView', this.$route)
						this.$router.push({
							name: 'goodsList'
						});
					} else {
						this.$message.error(res.message);
					}
				})
			},
			handleCancel: function() { //取消按钮
				//this.$store.dispatch('tagsView/delView', this.$route)
				this.$router.push({
					path: '/goodsList'
				});
			},
			showInput() { //商品介绍模块  关键字  增加按钮
				this.newKeywordVisible = true
				this.$nextTick(_ => {
					this.$refs.newKeywordInput.$refs.input.focus()
				})
			},
			handleInputConfirm() { //关键字 input框输入确认
				const newKeyword = this.newKeyword
				if (newKeyword) {
					this.keywords.push(newKeyword)
					this.goods.keywords = this.keywords.toString()
				}
				this.newKeywordVisible = false
				this.newKeyword = ''
				//console.log(this.goods.keywords);
				//console.log(this.keywords);
			},
			handleClose(tag) { //关键字  标签关闭
				//console.log(tag);
				this.keywords.splice(this.keywords.indexOf(tag), 1);
				//console.log(this.keywords);
				this.goods.keywords = this.keywords.toString();
			},
			beforeUploadShopSteps(file) {
				const isRightType = (file.type === 'image/jpeg') || (file.type === 'image/png')
				const isLt2M = file.size / 1024 / 1024 < 2

				if (!isRightType) {
					this.$message.error('只能上传jgp和png格式!')
				}
				if (!isLt2M) {
					this.$message.error('图片大小不能超过2M')
				}
				return isRightType && isLt2M
			},
			uploadPicUrl(file) { //商品图片上传
				//console.log(file);
				Loading.service("正在上传");
				var formData = new FormData(); //构造一个 FormData，把后台需要发送的参数添加
				formData.append("file", file.file); //接口需要传的参数
				uploadImg(formData).then(res => {
					if (res.code == 200) {
						this.goods.picUrl = res.data
						console.log(this.goods.picUrl)
						Loading.service("正在上传").close();
					} else {
						Loading.service("正在上传").close();
					}
				})
			},
			uploadOverrun: function() { //宣传画廊图片上传超出个数限制时的钩子
				this.$message({
					type: 'error',
					message: '上传文件个数超出限制!最多上传5张图片!'
				})
			},
			handleGalleryUrl(file) { //宣传画廊图片上传
				Loading.service("正在上传");
				var formData = new FormData(); //构造一个 FormData，把后台需要发送的参数添加
				formData.append("file", file.file); //接口需要传的参数
				uploadImg(formData).then(res => {
					console.log(res)
					if (res.code == 200) {
						let url = res.data
						this.goods.gallery.push(url)
						console.log(url)
						Loading.service("正在上传").close();
					} else {
						Loading.service("正在上传").close();
					}
				})
			},
			handleRemove: function(file, fileList) { //宣传画廊图片删除
				console.log(file)
				for (var i = 0; i < this.goods.gallery.length; i++) {
					// 这里存在两种情况
					// 1. 如果所删除图片是刚刚上传的图片，那么图片地址是file.response.data，此时的file.url虽然存在，但是是本机地址，而不是远程地址。
					// 2. 如果所删除图片是后台返回的已有图片，那么图片地址是file.url
					var url
					console.log(file)
					if (this.goods.gallery[i] === url) {
						this.goods.gallery.splice(i, 1);
					}
				}
			},
			specChanged: function(label) { //商品规格选择
				if (label === false) {
					this.specifications = [{
						specification: '规格',
						value: '标准',
						picUrl: ''
					}]
					this.products = [{
						id: 0,
						specifications: ['标准'],
						price: 0.00,
						number: 0,
						url: ''
					}]
				} else {
					this.specifications = []
					this.products = []
				}
			},
			uploadSpecPicUrl: function(file) { //规格图片上传
				Loading.service("正在上传");
				var formData = new FormData(); //构造一个 FormData，把后台需要发送的参数添加
				formData.append("file", file.file); //接口需要传的参数
				uploadImg(formData).then(res => {
					console.log(res)
					if (res.code == 200) {
						let url = res.data
						this.specForm.picUrl = url
						Loading.service("正在上传").close();
					} else {
						Loading.service("正在上传").close();
					}
				})
			},
			handleSpecificationShow() { //商品规格添加
				this.specForm = {
					specification: '',
					value: '',
					picUrl: ''
				}
				this.specVisiable = true
			},
			handleSpecificationAdd() { //多规格支持  设置规格弹窗 确认按钮
				var index = this.specifications.length - 1
				for (var i = 0; i < this.specifications.length; i++) {
					const v = this.specifications[i]
					if (v.specification === this.specForm.specification) {
						if (v.value === this.specForm.value) {
							this.$message({
								type: 'warning',
								message: '已经存在规格值:' + v.value
							})
							this.specForm = {}
							this.specVisiable = false
							return
						} else {
							index = i
						}
					}
				}

				this.specifications.splice(index + 1, 0, this.specForm)
				this.specVisiable = false

				this.specToProduct()
			},
			handleSpecificationDelete(row) { //商品规格  列表  删除
				const index = this.specifications.indexOf(row)
				this.specifications.splice(index, 1)
				this.specToProduct()
			},
			specToProduct() {
				if (this.specifications.length === 0) {
					return
				}
				// 根据specifications创建临时规格列表
				var specValues = []
				var spec = this.specifications[0].specification
				var values = []
				values.push(0)

				for (var i = 1; i < this.specifications.length; i++) {
					const aspec = this.specifications[i].specification

					if (aspec === spec) {
						values.push(i)
					} else {
						specValues.push(values)
						spec = aspec
						values = []
						values.push(i)
					}
				}
				specValues.push(values)

				// 根据临时规格列表生产货品规格
				// 算法基于 https://blog.csdn.net/tyhj_sf/article/details/53893125
				var productsIndex = 0
				var products = []
				var combination = []
				var n = specValues.length
				for (var s = 0; s < n; s++) {
					combination[s] = 0
				}
				var index = 0
				var isContinue = false
				do {
					var specifications = []
					for (var x = 0; x < n; x++) {
						var z = specValues[x][combination[x]]
						specifications.push(this.specifications[z].value)
					}
					products[productsIndex] = {
						id: productsIndex,
						specifications: specifications,
						price: 0.00,
						number: 0,
						url: ''
					}
					productsIndex++

					index++
					combination[n - 1] = index
					for (var j = n - 1; j >= 0; j--) {
						if (combination[j] >= specValues[j].length) {
							combination[j] = 0
							index = 0
							if (j - 1 >= 0) {
								combination[j - 1] = combination[j - 1] + 1
							}
						}
					}
					isContinue = false
					for (var p = 0; p < n; p++) {
						if (combination[p] !== 0) {
							isContinue = true
						}
					}
				} while (isContinue)

				this.products = products
			},
			handleProductShow(row) { //商品库存 列表 设置按钮
				this.productForm = Object.assign({}, row)
				this.productVisiable = true
			},
			uploadProductUrl: function(file) { //添加库存商品弹窗  货品图片上传
				Loading.service("正在上传");
				var formData = new FormData(); //构造一个 FormData，把后台需要发送的参数添加
				formData.append("file", file.file); //接口需要传的参数
				uploadImg(formData).then(res => {
					console.log(res)
					if (res.code == 200) {
						let url = res.data
						this.productForm.url = url
						Loading.service("正在上传").close();
					} else {
						Loading.service("正在上传").close();
					}
				})
				// if(response.code == 200){
				//   this.productForm.url = response.data;
				// }
			},
			handleProductEdit() { //添加库存商品弹窗  确认按钮
				for (var i = 0; i < this.products.length; i++) {
					const v = this.products[i]
					if (v.id === this.productForm.id) {
						this.products.splice(i, 1, this.productForm)
						break
					}
				}
				this.productVisiable = false
				this.productForm.price = this.goods.retailPrice
			},
			handleAttributeShow() { //商品参数  添加按钮
				this.attributeForm = {}
				this.attributeVisiable = true
			},
			handleAttributeAdd() { //添加商品参数弹窗  确认按钮
				this.attributes.unshift(this.attributeForm)
				this.attributeVisiable = false
			},
			handleAttributeDelete(row) { //商品参数  列表  删除
				const index = this.attributes.indexOf(row)
				this.attributes.splice(index, 1)
			}
		},
		created() {
			this.init();
		},
		computed: {

		},
		mounted() {

		},
	}
</script>
<style>
	.el-card {
		margin-bottom: 10px;
	}

	.el-tag+.el-tag {
		margin-left: 10px;
	}

	.input-new-keyword {
		width: 90px;
		margin-left: 10px;
		vertical-align: bottom;
	}

	/* .avatar-uploader .el-upload {
		width: 145px;
		height: 145px;
		border: 1px dashed #d9d9d9;
		border-radius: 6px;
		cursor: pointer;
		position: relative;
		overflow: hidden;
	} */

	.avatar-uploader .el-upload:hover {
		border-color: #20a0ff;
	}

	/* .avatar-uploader-icon {
		font-size: 28px;
		color: #8c939d;
		width: 120px;
		height: 120px;
		line-height: 120px;
		text-align: center;
	} */

	.avatar {
		width: 145px;
		height: 145px;
		display: block;
	}
</style>
