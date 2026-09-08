<template>
	<div class="device-table-actions">
		<slot />
		<el-dropdown
			v-if="showMore"
			trigger="click"
			size="mini"
			@command="$emit('command', $event)"
		>
			<el-button type="primary" size="mini">
				更多<i class="el-icon-arrow-down el-icon--right" />
			</el-button>
			<el-dropdown-menu slot="dropdown" class="device-table-actions__menu">
				<slot name="more" />
			</el-dropdown-menu>
		</el-dropdown>
	</div>
</template>

<script>
export default {
	name: 'DeviceTableActions',
	props: {
		showMore: {
			type: Boolean,
			default: false
		}
	}
}
</script>

<style lang="scss">
.device-table-actions {
	display: inline-flex;
	flex-wrap: nowrap;
	gap: 8px;
	align-items: center;
	justify-content: center;
	white-space: nowrap;

	> * {
		margin: 0 !important;
		flex-shrink: 0;
	}
}

.device-table-actions__menu {
	.el-dropdown-item {
		padding: 0 16px;
		line-height: 36px;
		color: #606266;
	}

	.el-button {
		border: none !important;
		background: transparent !important;
		background-color: transparent !important;
		padding: 0;
		margin: 0;
		font-size: inherit;
		font-weight: normal;
		width: 100%;
		text-align: left;
		height: auto;
		line-height: inherit;
		box-shadow: none !important;
	}

	.el-button,
	.el-button:hover,
	.el-button:focus,
	.el-button:active,
	.el-button.is-active,
	.el-button--primary,
	.el-button--primary:hover,
	.el-button--primary:focus,
	.el-button--primary:active,
	.el-button--warning,
	.el-button--warning:hover,
	.el-button--warning:focus,
	.el-button--warning:active {
		color: #606266 !important;
		background: transparent !important;
		background-color: transparent !important;
		border-color: transparent !important;
	}

	.el-dropdown-item:not(.is-disabled):hover,
	.el-dropdown-item:focus {
		.el-button,
		.el-button--primary,
		.el-button--warning,
		.el-button--danger {
			color: #1890ff !important;
		}
	}

	.el-button--danger,
	.el-button--danger:hover,
	.el-button--danger:focus,
	.el-button--danger:active {
		color: #f56c6c !important;
		background: transparent !important;
		border-color: transparent !important;
	}

	.el-dropdown-item:not(.is-disabled):hover {
		.el-button--danger {
			color: #f56c6c !important;
		}
	}
}
</style>
