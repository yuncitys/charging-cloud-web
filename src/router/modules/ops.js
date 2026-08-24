/**
 * 扁平页面表（方案 B）。buildRoutes 按 URL 第一段自动包 Layout。
 * URL prefixes keep historical paths; sidebar/menu tree comes from backend.
 */
// 运维管理（日志 / 指令 / 反馈 / 定时任务）

export default [
{
        path: '/log/upDownRecordList',
        component: () => import('@/views/log/upDownRecordList'),
        name: 'upDownRecordList',
        meta: {
          title: '设备日志',
          icon: 'el-icon-full-screen',
        }
      },
{
        path: '/log/logininfor',
        component: () => import('@/views/log/logininfor'),
        name: 'logininfor',
        meta: {
          title: '登录日志',
          icon: 'el-icon-full-screen',
        }
      },
{
        path: '/log/system',
        component: () => import('@/views/log/system'),
        name: 'system',
        meta: {
          title: '系统日志',
          icon: 'el-icon-full-screen',
        }
      },
{
        path: '/log/job',
        component: () => import('@/views/log/job'),
        name: 'jobLog',
        meta: {
          title: '任务日志',
          icon: 'el-icon-full-screen',
        }
      },
{
      path: '/command/commandList',
      component: () => import('@/views/command/commandList'),
      name: 'commandList',
      meta: {
        title: '设备指令',
        icon: 'el-icon-notebook-2',
      }
    },
{
      path: '/report/reportList',
      component: () => import('@/views/report/reportList'),
      name: 'reportList',
      meta: {
        title: '历史故障申诉',
        icon: 'el-icon-set-up',
      }
    },
{
      path: '/report/feedbackList',
      component: () => import('@/views/feedback/feedbackList'),
      name: 'feedbackList',
      meta: {
        title: '意见反馈',
        icon: 'el-icon-chat-line-square',
      }
    },
{
      path: '/report/feedbackConfig',
      component: () => import('@/views/feedback/feedbackConfig'),
      name: 'feedbackConfig',
      meta: {
        title: '反馈类型配置',
        icon: 'el-icon-setting',
      }
    },
{
      path: '/monitor/job',
      component: () => import('@/views/monitor/job/index'),
      name: 'jobList',
      meta: {
        title: '定时任务',
        icon: 'el-icon-s-custom',
      }
    },
{
      path: '/monitor/task',
      component: () => import('@/views/monitor/task/index'),
      name: 'taskList',
      meta: {
        title: '下载中心',
        icon: 'el-icon-s-custom',
      }
    }
]
