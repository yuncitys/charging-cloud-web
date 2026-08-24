import Layout from '@/layout'

/**
 * Menu-aligned route module (scheme A).
 * URL prefixes keep historical paths; sidebar/menu tree comes from backend.
 */
// 运维管理（日志 / 指令 / 反馈 / 定时任务）

export default [
{
    path: '/log',
    component: Layout,
    redirect: '/log',
    alwaysShow: true,
    name: 'log',
    meta: {
      title: '运维管理',
      icon: 'el-icon-wallet',
    },
    children: [{
        path: 'upDownRecordList',
        component: () => import('@/views/log/upDownRecordList'),
        name: 'upDownRecordList',
        meta: {
          title: '设备日志',
          icon: 'el-icon-full-screen',
        }
      },
      {
        path: 'logininfor',
        component: () => import('@/views/log/logininfor'),
        name: 'logininfor',
        meta: {
          title: '登录日志',
          icon: 'el-icon-full-screen',
        }
      },
      {
        path: 'system',
        component: () => import('@/views/log/system'),
        name: 'system',
        meta: {
          title: '系统日志',
          icon: 'el-icon-full-screen',
        }
      },
      {
        path: 'job',
        component: () => import('@/views/log/job'),
        name: 'jobLog',
        meta: {
          title: '任务日志',
          icon: 'el-icon-full-screen',
        }
      }
    ]
  },
{
    path: '/command',
    component: Layout,
    redirect: '/command/commandList',
    alwaysShow: true, // will always show the root menu
    name: 'command',
    meta: {
      title: '运维管理',
      icon: 'el-icon-notebook-1',
    },
    children: [{
      path: 'commandList',
      component: () => import('@/views/command/commandList'),
      name: 'commandList',
      meta: {
        title: '设备指令',
        icon: 'el-icon-notebook-2',
      }
    }, ]
  },
{
    path: '/report',
    component: Layout,
    redirect: '/report/reportList',
    alwaysShow: true,
    name: 'report',
    meta: {
      title: '运维管理',
      icon: 'el-icon-copy-document',
    },
    children: [{
      path: 'reportList',
      component: () => import('@/views/report/reportList'),
      name: 'reportList',
      meta: {
        title: '历史故障申诉',
        icon: 'el-icon-set-up',
      }
    }, {
      path: 'feedbackList',
      component: () => import('@/views/feedback/feedbackList'),
      name: 'feedbackList',
      meta: {
        title: '意见反馈',
        icon: 'el-icon-chat-line-square',
      }
    }, {
      path: 'feedbackConfig',
      component: () => import('@/views/feedback/feedbackConfig'),
      name: 'feedbackConfig',
      meta: {
        title: '反馈类型配置',
        icon: 'el-icon-setting',
      }
    }]
  },
{
    path: '/monitor',
    component: Layout,
    redirect: '/monitor/job',
    alwaysShow: true,
    name: 'monitor',
    meta: {
      title: '运维管理',
      icon: 'lock',
    },
    children: [{
      path: 'job',
      component: () => import('@/views/monitor/job/index'),
      name: 'jobList',
      meta: {
        title: '定时任务',
        icon: 'el-icon-s-custom',
      }
    }, {
      path: 'task',
      component: () => import('@/views/monitor/task/index'),
      name: 'taskList',
      meta: {
        title: '下载中心',
        icon: 'el-icon-s-custom',
      }
    }, ]
  }
]
