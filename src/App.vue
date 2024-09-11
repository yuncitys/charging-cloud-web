<template>
	<div id="app">
		<router-view />
	</div>
</template>

<script>
	export default {
		name: 'App'
	}
</script>
<style lang="scss">
	/* 解决element-ui的table表格控件表头与内容列不对齐问题 */
	.el-table th.gutter {
		display: table-cell !important;
	}
	.el-table--border th,
	.el-table--border td {
		border-right: 1px solid #dfe6ec;
	}
	/* 解决element-ui的table表格控件表头与内容列不对齐问题 */
	
    /* 浏览器保存密码后自动填充的文本框样式 */
	.login-container .el-input input:-webkit-autofill ,
	textarea:-webkit-autofill,
	select:-webkit-autofill {  
	    -webkit-text-fill-color: #000 !important;  
	    -webkit-box-shadow: 0 0 0px 1000px transparent  inset !important;  
	    background-color:transparent;  
	    background-image: none;  
	    transition: background-color 50000s ease-in-out 0s;  
	}  
	input {  
	    background-color:transparent;  
	}
    /* 浏览器保存密码后自动填充的文本框样式 */
	
	.marker {
		position: absolute;
		border-radius: 50%;
		z-index: 999;
	}

	/* 上传图片 */
	.avatar {
		width: 178px;
		height: 178px;
		display: block;
		border: 1px dashed #d9d9d9 !important;
	}

	.avatar-uploader-icon {
		border: 1px dashed #d9d9d9 !important;
		border-radius: 6px;
		cursor: pointer;
		position: relative;
		overflow: hidden;
	}

	.avatar-uploader-icon {
		font-size: 28px;
		color: #8c939d;
		width: 178px;
		height: 178px;
		line-height: 178px;
		text-align: center;
	}

	/* 上传图片 */

	/* 表格行高 */
	#tableBox {
		th {
			padding: 0 !important;
			height: 40px;
			line-height: 40px;
		}

		td {
			padding: 8px !important;
			height: 40px;
			line-height: 40px;
		}
	}
    /* 表格行高 */
	.el-submenu__title {
		height: 45px !important;
		line-height: 45px !important;
	}

	.el-submenu .el-menu-item {
		height: 45px !important;
		line-height: 45px !important;
	}

	.tags-view-container .tags-view-wrapper .tags-view-item {
		height: 30px !important;
		line-height: 30px !important;
		margin-top: 12px !important;
	}

	.top10 {
		margin-top: 10px;
	}

	.left10 {
		margin-left: 10px;
	}

	@media (max-width:550px) {
		.el-dialog {
			width: 100% !important;
		}

		.el-form {
			width: 100% !important;
			margin-left: 10px !important;
		}

		.cardBox {
			.cardItem {
				width: 100% !important;
			}
		}

		.pagination-container {
			overflow: scroll;
		}

		.card-panel-description {
			display: block;
			float: none !important;
			text-align: center;
		}

		.card-panel-icon-wrapper {
			display: none;
		}

		.partBox {
			flex-wrap: wrap;
			width: 100% !important;
		}
		
		.el-upload-dragger,.el-upload{
			width: 100%;
		}
		
		.feeName{
			width: 100% !important;
		}
	}
</style>
