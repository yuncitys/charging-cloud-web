<template>
	<div class="editorBox" v-loading="quillUpdateImg">
		<el-upload style="display:none" class="avatar-uploader1" :action="serverUrl" name="file" :show-file-list="false"
			:on-error="uploadError" :before-upload="beforeUpload" :http-request="uploadSuccess"></el-upload>
        <el-upload style="display:none" class="video-uploader1" :action="serverUrl" name="file" :show-file-list="false"
        	:on-error="uploadError" :before-upload="VbeforeUpload" :http-request="VuploadSuccess"></el-upload>
		
		<quill-editor class="editor" v-model="detail" ref="myQuillEditor" :options="editorOption"
			@blur="onEditorBlur($event)" @focus="onEditorFocus($event)" @change="onEditorChange($event)"></quill-editor>
	</div>
</template>
<script>
	// 工具栏配置
	const toolbarOptions = [
		["bold", "italic", "underline", "strike"], // 加粗 斜体 下划线 删除线
		["blockquote", "code-block"], // 引用  代码块
		[{
			header: 1
		}, {
			header: 2
		}], // 1、2 级标题
		[{
			list: "ordered"
		}, {
			list: "bullet"
		}], // 有序、无序列表
		[{
			script: "sub"
		}, {
			script: "super"
		}], // 上标/下标
		[{
			indent: "-1"
		}, {
			indent: "+1"
		}], // 缩进
		// [{'direction': 'rtl'}],                         // 文本方向
		[{
			size: ["small", false, "large", "huge"]
		}], // 字体大小
		[{
			header: [1, 2, 3, 4, 5, 6, false]
		}], // 标题
		[{
			color: []
		}, {
			background: []
		}], // 字体颜色、字体背景颜色
		[{
			font: []
		}], // 字体种类
		[{
			align: []
		}], // 对齐方式
		["clean"], // 清除文本格式
		["link", "image", "video"] // 链接、图片、视频
	];
	const toolbarTips = [{
			Choice: '.ql-bold',
			title: "加粗"
		},
		{
			Choice: '.ql-italic',
			title: '斜体'
		},
		{
			Choice: '.ql-underline',
			title: '下划线'
		},
		{
			Choice: '.ql-header',
			title: '段落格式'
		},
		{
			Choice: '.ql-strike',
			title: '删除线'
		},
		{
			Choice: '.ql-blockquote',
			title: '块引用'
		},
		{
			Choice: '.ql-code',
			title: '插入代码'
		},
		{
			Choice: '.ql-code-block',
			title: '插入代码段'
		},
		{
			Choice: '.ql-font',
			title: '字体'
		},
		{
			Choice: '.ql-size',
			title: '字体大小'
		},
		{
			Choice: '.ql-list[value="ordered"]',
			title: '编号列表'
		},
		{
			Choice: '.ql-list[value="bullet"]',
			title: '项目列表'
		},
		{
			Choice: '.ql-direction',
			title: '文本方向'
		},
		{
			Choice: '.ql-header[value="1"]',
			title: 'H1'
		},
		{
			Choice: '.ql-header[value="2"]',
			title: 'H2'
		},
		{
			Choice: '.ql-align',
			title: '对齐方式'
		},
		{
			Choice: '.ql-color',
			title: '字体颜色'
		},
		{
			Choice: '.ql-background',
			title: '背景颜色'
		},
		{
			Choice: '.ql-image',
			title: '插入图片'
		},
		{
			Choice: '.ql-video',
			title: '插入视频'
		},
		{
			Choice: '.ql-link',
			title: '添加链接'
		},
		{
			Choice: '.ql-formula',
			title: '插入公式'
		},
		{
			Choice: '.ql-clean',
			title: '清除字体格式'
		},
		{
			Choice: '.ql-script[value="sub"]',
			title: '下标'
		},
		{
			Choice: '.ql-script[value="super"]',
			title: '上标'
		},
		{
			Choice: '.ql-indent[value="-1"]',
			title: '向左缩进'
		},
		{
			Choice: '.ql-indent[value="+1"]',
			title: '向右缩进'
		},
		{
			Choice: '.ql-header .ql-picker-label',
			title: '标题大小'
		},
		{
			Choice: '.ql-header .ql-picker-item[data-value="1"]',
			title: '标题一'
		},
		{
			Choice: '.ql-header .ql-picker-item[data-value="2"]',
			title: '标题二'
		},
		{
			Choice: '.ql-header .ql-picker-item[data-value="3"]',
			title: '标题三'
		},
		{
			Choice: '.ql-header .ql-picker-item[data-value="4"]',
			title: '标题四'
		},
		{
			Choice: '.ql-header .ql-picker-item[data-value="5"]',
			title: '标题五'
		},
		{
			Choice: '.ql-header .ql-picker-item[data-value="6"]',
			title: '标题六'
		},
		{
			Choice: '.ql-header .ql-picker-item:last-child',
			title: '标准'
		},
		{
			Choice: '.ql-size .ql-picker-item[data-value="small"]',
			title: '小号'
		},
		{
			Choice: '.ql-size .ql-picker-item[data-value="large"]',
			title: '大号'
		},
		{
			Choice: '.ql-size .ql-picker-item[data-value="huge"]',
			title: '超大号'
		},
		{
			Choice: '.ql-size .ql-picker-item:nth-child(2)',
			title: '标准'
		},
		{
			Choice: '.ql-align .ql-picker-item:first-child',
			title: '居左对齐'
		},
		{
			Choice: '.ql-align .ql-picker-item[data-value="center"]',
			title: '居中对齐'
		},
		{
			Choice: '.ql-align .ql-picker-item[data-value="right"]',
			title: '居右对齐'
		},
		{
			Choice: '.ql-align .ql-picker-item[data-value="justify"]',
			title: '两端对齐'
		}
	];
	import {
		quillEditor
	} from "vue-quill-editor";
	import "quill/dist/quill.core.css";
	import "quill/dist/quill.snow.css";
	import "quill/dist/quill.bubble.css";
	import * as Quill from 'quill'  // 引入编辑器
	 import ImageResize from 'quill-image-resize-module';
	 Quill.register('modules/imageResize',ImageResize);
	 // 这里引入修改过的video模块并注册
	 import Video from './video.js'
	 Quill.register(Video, true)
	import {
		Loading
	} from "element-ui";
	import {
		uploadImg
	} from '@/api/goods/goods.js'
	export default {
		props: {
			value: { // 编辑器的内容
				type: String
			},
			maxSize: { //图片大小
				type: Number,
				default: 4000 //kb
			},
		},
		components: {
			quillEditor
		},
		watch: {
			value(val) {
				this.detail = this.value;
			}
		},
		data() {
			return {
				detail: this.value,
				quillUpdateImg: false, // 根据图片上传状态来确定是否显示loading动画，刚开始是false,不显示
				editorOption: {
					theme: "snow", // or 'bubble'
					placeholder: "请填写内容",
					modules: {
						toolbar: {
							container: toolbarOptions,
							// container: "#toolbar",
							handlers: {
								image: function(value) {
									if (value) {
										// 触发input框选择图片文件
										document.querySelector(".editorBox .avatar-uploader1 input").click();
									} else {
										this.quill.format("image", false);
									}
								},
								'video': function(value) {
									if (value) {
										// 触发input框选择图片文件
										document.querySelector(".editorBox .video-uploader1 input").click();
									} else {
										this.quill.format("image", false);
									}
								}
								// link: function(value) {
								//   if (value) {
								//     var href = prompt('请输入url');
								//     this.quill.format("link", href);
								//   } else {
								//     this.quill.format("link", false);
								//   }
								// },
							}
						},
						imageResize: {
							displayStyles: {
								backgroundColor: 'black',
								border: 'none',
								color: 'white'
							},
							modules: ['Resize', 'DisplaySize']
						}
					}
				},
				serverUrl: "http://120.24.242.251:9001/storage/create", // 这里写你要上传的图片服务器地址
				header: { // 有的图片服务器要求请求头需要有token
					//token: sessionStorage.token
					"Authentication": localStorage.getItem("token")
				},
				//index: 0,
			};
		},
		methods: {
			onEditorBlur() { //失去焦点事件
				//console.log(this.detail);
			},
			onEditorFocus(event) { //获得焦点事件
				// let quill = this.$refs.myQuillEditor.quill;
				// console.log(quill.getSelection())
				// this.index = quill.getSelection().index;  // 获取注焦后光标所在的位置小标
			},
			onEditorChange() { //内容改变事件
				this.$emit("input", this.detail);

			},
			// 富文本图片上传前
			beforeUpload(file) { // 显示loading动画
				this.quillUpdateImg = true;
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
			uploadSuccess(file) { // res为图片服务器返回的数据
			    this.quillUpdateImg = true;
				// 获取富文本组件实例
				let quill = this.$refs.myQuillEditor.quill;
				var formData = new FormData(); //构造一个 FormData，把后台需要发送的参数添加
				formData.append("file", file.file); //接口需要传的参数
				uploadImg(formData).then(res => {
					this.quillUpdateImg = false;
					if (res.code == 200) {
                        
						let url = res.data
						
						let length = quill.getSelection().index;
						// 插入图片  res.url为服务器返回的图片地址
						quill.insertEmbed(length, "image", url);
						quill.setSelection(length + 1); // 调整光标到最后
					} else {
						this.$message.error("图片插入失败");
					}
				})
			},
			// 富文本视频上传前
			VbeforeUpload(file) { // 显示loading动画
				this.quillUpdateImg = true;
				const isRightType = (file.type === 'video/mp4') || (file.type === 'video/m4v') || (file.type ===
					'video/3gp') || (file.type === 'video/mov') || (file.type === 'video/avi') || (file.type ===
					'video/m3u8') || (file.type === 'video/webm')
				const isLt2M = file.size / 1024 / 1024 < 60
			
				if (!isRightType) {
					this.$message.error('只能上传mp4,mov,m4v,3gp,avi,m3u8,webm和wmv格式!')
				}
				if (!isLt2M) {
					this.$message.error('视频大小不能超过60M')
				}
				return isRightType && isLt2M
			},
			VuploadSuccess(file) { // res为图片服务器返回的数据
			    this.quillUpdateImg = true;
				// 获取富文本组件实例
				let quill = this.$refs.myQuillEditor.quill;
				var formData = new FormData(); //构造一个 FormData，把后台需要发送的参数添加
				formData.append("file", file.file); //接口需要传的参数
				uploadImg(formData).then(res => {
					this.quillUpdateImg = false;
					if (res.code == 200) {
			            
						let url = res.data
						
						let length = quill.getSelection().index;
						// 插入图片  res.url为服务器返回的图片地址
						quill.insertEmbed(length, "video", url);
						quill.setSelection(length + 1); // 调整光标到最后
					} else {
						this.$message.error("视频插入失败");
					}
				})
			},
			
			
			uploadError() { // 富文本图片上传失败
				console.log(1111)
				// loading动画消失
				this.quillUpdateImg = false;
				this.$message.error("图片插入失败");
			},
		},
		mounted() {
			autotip: { // 富文本插件提示
				document.getElementsByClassName('ql-editor')[0].dataset.placeholder = ''
				for (let item of toolbarTips) {
					let tip = document.querySelector('.quill-editor ' + item.Choice);
					if (!tip) continue;
					tip.setAttribute('title', item.title);
				}
			};

		},
		computed: {
			editor() {
				return this.$refs.myQuillEditor.quill;
			}
		}
	};
</script>

<style>
	.editor {
		line-height: normal !important;
		white-space: pre-wrap;
	}

	.ql-snow .ql-tooltip[data-mode="link"]::before {
		content: "请输入链接地址:";
	}

	.ql-snow .ql-tooltip.ql-editing a.ql-action::after {
		border-right: 0px;
		content: "保存";
		padding-right: 0px;
	}

	.ql-snow .ql-tooltip[data-mode="video"]::before {
		content: "请输入视频地址:";
	}

	.ql-snow .ql-picker.ql-size .ql-picker-label::before,
	.ql-snow .ql-picker.ql-size .ql-picker-item::before {
		content: "14px";
	}

	.ql-snow .ql-picker.ql-size .ql-picker-label[data-value="small"]::before,
	.ql-snow .ql-picker.ql-size .ql-picker-item[data-value="small"]::before {
		content: "10px";
	}

	.ql-snow .ql-picker.ql-size .ql-picker-label[data-value="large"]::before,
	.ql-snow .ql-picker.ql-size .ql-picker-item[data-value="large"]::before {
		content: "18px";
	}

	.ql-snow .ql-picker.ql-size .ql-picker-label[data-value="huge"]::before,
	.ql-snow .ql-picker.ql-size .ql-picker-item[data-value="huge"]::before {
		content: "32px";
	}

	.ql-snow .ql-picker.ql-header .ql-picker-label::before,
	.ql-snow .ql-picker.ql-header .ql-picker-item::before {
		content: "文本";
	}

	.ql-snow .ql-picker.ql-header .ql-picker-label[data-value="1"]::before,
	.ql-snow .ql-picker.ql-header .ql-picker-item[data-value="1"]::before {
		content: "标题1";
	}

	.ql-snow .ql-picker.ql-header .ql-picker-label[data-value="2"]::before,
	.ql-snow .ql-picker.ql-header .ql-picker-item[data-value="2"]::before {
		content: "标题2";
	}

	.ql-snow .ql-picker.ql-header .ql-picker-label[data-value="3"]::before,
	.ql-snow .ql-picker.ql-header .ql-picker-item[data-value="3"]::before {
		content: "标题3";
	}

	.ql-snow .ql-picker.ql-header .ql-picker-label[data-value="4"]::before,
	.ql-snow .ql-picker.ql-header .ql-picker-item[data-value="4"]::before {
		content: "标题4";
	}

	.ql-snow .ql-picker.ql-header .ql-picker-label[data-value="5"]::before,
	.ql-snow .ql-picker.ql-header .ql-picker-item[data-value="5"]::before {
		content: "标题5";
	}

	.ql-snow .ql-picker.ql-header .ql-picker-label[data-value="6"]::before,
	.ql-snow .ql-picker.ql-header .ql-picker-item[data-value="6"]::before {
		content: "标题6";
	}

	.ql-snow .ql-picker.ql-font .ql-picker-label::before,
	.ql-snow .ql-picker.ql-font .ql-picker-item::before {
		content: "标准字体";
	}

	.ql-snow .ql-picker.ql-font .ql-picker-label[data-value="serif"]::before,
	.ql-snow .ql-picker.ql-font .ql-picker-item[data-value="serif"]::before {
		content: "衬线字体";
	}

	.ql-snow .ql-picker.ql-font .ql-picker-label[data-value="monospace"]::before,
	.ql-snow .ql-picker.ql-font .ql-picker-item[data-value="monospace"]::before {
		content: "等宽字体";
	}

	.ql-container {
		min-height: 350px;
	}

	.ql-editor {
		height: 350px;
	}

	.ql-snow .ql-editor img {
		max-width: 20%;
		vertical-align: top;
	}
</style>
