<template>
	<div class="app-container">
		<div class="filter-container">
			<el-input v-model="formItem.goodsSn" style="width: 200px;margin-right: 20px ;" class="filter-item"
				placeholder="请输入商品编号" @keyup.enter.native="search" @clear="search()"/>
			<el-input v-model="formItem.name" style="width: 200px;margin-right: 20px ;" class="filter-item"
				placeholder="请输入商品名称" @keyup.enter.native="search" @clear="search()"/>
			<el-button type="primary" style="margin-right: 20px ;" class="filter-item" @click="search()"
				icon="el-icon-search">查询</el-button>
			<el-button type="primary" style="margin-right: 20px ;" class="filter-item" @click="add()"
				v-if="btnAuthen.permsVerifAuthention(':goods:goodsList:add')">添加商品</el-button>

			<!-- 表格  -->
			<el-table v-loading="listLoading" :data="list" element-loading-text="正在查询中。。。"  fit
				highlight-current-row id="tableBox">

				<el-table-column type="expand">
					<template slot-scope="props">
						<el-form label-position="left" class="table-expand">
							<el-form-item label="商品编号">
								<span>{{ props.row.goodsSn }}</span>
							</el-form-item>
							<el-form-item label="宣传画廊">
								<img v-for="pic in props.row.gallery" :key="pic" :src="pic" class="gallery">
							</el-form-item>
							<el-form-item label="商品介绍">
								<span>{{ props.row.brief }}</span>
							</el-form-item>
							<el-form-item label="商品单位">
								<span>{{ props.row.unit }}</span>
							</el-form-item>
							<el-form-item label="关键字">
								<span>{{ props.row.keywords }}</span>
							</el-form-item>
							<el-form-item label="类目ID">
								<span>{{ props.row.categoryId }}</span>
							</el-form-item>
							<el-form-item label="品牌商ID">
								<span>{{ props.row.brandId }}</span>
							</el-form-item>
						</el-form>
					</template>
				</el-table-column>

				<el-table-column align="center" label="商品ID" prop="id" />

				<el-table-column align="center" min-width="100" label="名称" prop="name" />

				<el-table-column align="center" property="iconUrl" label="图片">
					<template slot-scope="scope">
						<img :src="scope.row.picUrl" width="40">
					</template>
				</el-table-column>

				<el-table-column align="center" label="详情" prop="detail">
					<template slot-scope="scope">
						<el-dialog :visible.sync="detailShow" title="商品详情" :append-to-body="true">

							<div class="goods-detail-box" v-html="goodsDetail" />
						</el-dialog>
						<el-button type="primary" @click="showDetail(scope.row.detail)">查看</el-button>
					</template>
				</el-table-column>

				<el-table-column align="center" label="市场售价" prop="counterPrice" />

				<el-table-column align="center" label="当前价格" prop="retailPrice" />

				<el-table-column align="center" label="销售数量" prop="salesSum" />

				<el-table-column align="center" label="是否新品" prop="isNew">
					<template slot-scope="scope">
						<el-tag :type="scope.row.isNew ? 'success' : 'error' ">{{ scope.row.isNew ? '新品' : '非新品' }}
						</el-tag>
					</template>
				</el-table-column>

				<el-table-column align="center" label="是否热品" prop="isHot">
					<template slot-scope="scope">
						<el-tag :type="scope.row.isHot ? 'success' : 'error' ">{{ scope.row.isHot ? '热品' : '非热品' }}
						</el-tag>
					</template>
				</el-table-column>

				<el-table-column align="center" label="是否在售" prop="isOnSale">
					<template slot-scope="scope">
						<el-tag :type="scope.row.isOnSale ? 'success' : 'error' ">{{ scope.row.isOnSale ? '在售' : '未售' }}
						</el-tag>
					</template>
				</el-table-column>

				<el-table-column align="center" label="操作" width="230" class-name="small-padding fixed-width">
					<template slot-scope="scope">
						<el-button type="primary" @click="amend(scope.row)" size="mini"
							v-if="btnAuthen.permsVerifAuthention(':goods:goodsList:edit')">编辑</el-button>
						<el-button type="danger" @click="remove(scope.row)" size="mini"
							v-if="btnAuthen.permsVerifAuthention(':goods:goodsList:delete')">删除</el-button>
						<!-- <el-button type="success" v-if="scope.row.bannerStatus == 1" @click="imgOnSale(scope.row)"
							style="margin-top: 10px;">海报上架</el-button>
						<el-button type="warning" v-if="scope.row.bannerStatus == 2" @click="imgNoSale(scope.row)"
							style="margin-top: 10px;">海报下架</el-button> -->
					</template>
				</el-table-column>
			</el-table>

			<el-pagination v-show="total>0" :total="total" @size-change="changePageSize" @current-change="changPage"
				layout="total, sizes, prev, pager, next, jumper"> </el-pagination>
		</div>
	</div>
</template>
<script>
	import {
		getList,
		updateBannerById,
		deleteGood
	} from '@/api/goods/goods.js'
	export default {
		name: 'goodsList',
		components: {},
		data() {
			return {
				listLoading: false, //列表查询动画
				formItem: { //搜索栏
					goodsSn: "",
					name: "",
				},
				detailShow: false, //商品详情弹窗隐藏
				goodsDetail: '', //商品详情html
				downloadLoading: false, //导出动画
				list: [ //表格列表数据
					//{id: 1,name: "商品",brief: "企鹅",picUrl: require("@/assets/img/img.jpg"),detail:"<p><img src='http://122.51.199.160:8080/wx/storage/fetch/4hud8xxme7jjcjer7igz.jpg' alt='' width='350' height='300'/></p>"}
				],
				total: 0, //数据总条数
				page: 1, //页码数
				size: 10, //每页条数
			};
		},
		methods: {
			search() { //搜索
				this.page = 1;
				this.request(this.page, this.size, this.formItem.name);
			},
			add() { //添加商品
				this.$router.push({
					name: "goodsOnSale"
				});
			},
			imgOnSale(row) { //海报上架
				this.$confirm("确定上架该商品分享海报图片吗?", "提示", {
					confirmButtonText: "确定",
					cancelButtonText: "取消",
					closeOnClickModal: false,
					type: "warning"
				}).then(() => {
					let data = {
						goodsId: row.id,
						status: 2,
					}
					updateBannerById(data).then(res => {
						if (res.code == 200) {
							this.$message.success("海报上架成功!");
							this.request(this.page, this.size, this.formItem.goodsSn, this.formItem.name);
						} else {
							this.$message.error(res.message);
						}
					})
				})
			},
			imgNoSale(row) { //海报下架
				this.$confirm("确定下架该商品分享海报图片吗?", "提示", {
					confirmButtonText: "确定",
					cancelButtonText: "取消",
					closeOnClickModal: false,
					type: "warning"
				}).then(() => {
					let data = {
						goodsId: row.id,
						status: 1,
					}
					updateBannerById(data).then(res => {
						if (res.code == 200) {
							this.$message.success("海报上架成功!");
							this.request(this.page, this.size, this.formItem.goodsSn, this.formItem.name);
						} else {
							this.$message.error(res.message);
						}
					})
				})
			},
			amend(row) { // 编辑弹框 
				this.$router.push({
					name: "goodsEdit",
					query: {
						value: row.id, //跳转页面时携带的参数 商品id
					},
				});
			},
			showDetail(detail) { //查看按钮  商品详情弹窗
				//console.log(detail)
				this.goodsDetail = detail; //商品详情弹窗  详情html内容
				this.detailShow = true;
			},
			remove(row) { // 删除
				this.$confirm("此操作将永久删除该条记录, 是否继续?", "提示", {
					confirmButtonText: "确定",
					cancelButtonText: "取消",
					closeOnClickModal: false,
					type: "warning"
				}).then(() => {
					let data = {
						ids: row.id,
					}
					deleteGood(data).then(res => {
						if (res.code == 200) {
							this.$message.success("删除成功!");
							if (this.total - 1 == (this.page - 1) * this.size && (this.total != 0) & (this
									.page > 1)) {
								this.page -= 1;
								this.request(this.page, this.size, this.formItem.goodsSn, this.formItem
									.name);
							} else {
								this.request(this.page, this.size, this.formItem.goodsSn, this.formItem
									.name);
							}
						} else {
							this.$message.error(res.message);
						}
					})
				});
			},
			download() { //列表数据导出
				this.downloadLoading = true
			},
			changPage(e) { //分页
				this.page = e;
				this.request(this.page, this.size, this.formItem.goodsSn, this.formItem.name);
			},
			changePageSize(e) { // //每页条数
				this.size = e;
				this.request(this.page, this.size, this.formItem.goodsSn, this.formItem.name);
			},
			request(page, size) { //列表数据接口请求
				this.listLoading = true; //表格数据查询动画关闭
				let data = {
					pageNum: page,
					pageSize: size,
					name: this.formItem.name,
					goodsSn: this.formItem.goodsSn,
				}
				getList(data).then(res => {
					if (res.code == 200) {
						this.listLoading = false;
						this.list = res.data.records;
						this.total = res.data.total;
					}
				})
			},
		},
		created() {
			this.request();
		},
	};
</script>
<style>
	.table-expand {
		font-size: 0;
	}

	.table-expand label {
		width: 100px;
		color: #99a9bf;
	}

	.table-expand .el-form-item {
		margin-right: 0;
		margin-bottom: 0;
	}

	.gallery {
		width: 80px;
		margin-right: 10px;
	}

	.goods-detail-box img {
		width: 100%;
		vertical-align: middle;
	}
</style>
