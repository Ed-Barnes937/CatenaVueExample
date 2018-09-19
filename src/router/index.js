import Vue from 'vue'
import Router from 'vue-router'
import LinkMapsTld from '@/pages/LinkMapsTld'
import WhoIs from '@/pages/WhoIs'
import IpAddresses from '@/pages/IpAddresses'
import NameServers from '@/pages/NameServers'
import GoogleIndex from '@/pages/GoogleIndex'
import Dashboard from '@/pages/Dashboard'
import Details from '@/pages/Details'
import Linkmap from '@/pages/Linkmap'
import Overview from '@/pages/Overview'
import CrawlScheduler from '@/pages/CrawlScheduler'

// Authentication and User management
import Auth0Callback from '@/components/Auth0Callback'
import UserSettings from '@/components/UserSettings'

Vue.use(Router)

const router = new Router({
  mode: 'history', // toggled back on by fred during merging master into 207 - BUT NOT SURE THIS IS WHAT WE WANT!!!
  routes: [ {
    path: '/callback',
    name: 'callback',
    component: Auth0Callback,
    meta: {
      requiresAuth: false
    }
  }, {
    path: '/me',
    children: [
      {
        path: '/settings',
        component: UserSettings
      }
    ]
  }, {
    path: '/',
    name: 'DashBoard',
    redirect: '/dashboard',
    render: false
  }, {
    path: '/dashboard',
    name: 'dashboard',
    component: Dashboard,
    icon: 'dashboard',
    label: 'Dashboard',
    render: true
  }, {
    path: '/dashboard/crawl-scheduler',
    name: 'crawl-scheduler',
    component: CrawlScheduler,
    icon: 'schedule',
    label: 'Crawl Scheduler',
    render: true
  }, {
    path: '/dashboard/:details',
    name: 'dashboard-details',
    component: Details,
    render: false
  }, {
    path: '/dashboard/:selection/:overview',
    name: 'dashboard-selection-overview',
    component: Overview,
    label: 'Linkmap',
    render: false
  }, {
    path: '/dashboard/:selection/:overview/linkmap',
    name: 'dashboard-selection-overview-linkmap',
    component: Linkmap,
    label: 'Linkmap',
    render: false
  }, {
    path: '/linkmaps/:tld',
    name: 'LinkMapsTld',
    component: LinkMapsTld,
    icon: 'link',
    description: 'Link maps and network diagrams',
    label: 'Linkmaps TLD',
    render: false
  }, {
    path: '/ip-addresses',
    icon: 'laptop',
    label: 'IP Addresses',
    description: 'IP addresses records',
    component: IpAddresses,
    dataFile: 'ipAddresses', // globalData.dataFiles.ipAddresses,
    render: true
  }, {
    path: '/nameservers',
    icon: 'domain',
    label: 'Nameservers',
    description: 'Nameservers records',
    component: NameServers,
    dataFile: 'nameServers', // globalData.dataFiles.nameServers,
    render: true
  }, {
    path: '/whois',
    icon: 'question_answer',
    label: 'Whois',
    description: 'Whois records',
    component: WhoIs,
    dataFile: 'whois', // globalData.dataFiles.whois,
    render: true
  }, {
    path: '/google-index',
    icon: 'data_usage',
    label: 'Google Index',
    description: 'Google index records',
    component: GoogleIndex,
    dataFile: 'googleIndex', // globalData.dataFiles.googleIndex,
    render: true
  }]
})

// Very basic 'setup' of a global guard
router.beforeEach((to, from, next) => {
  if (to.matched.some(record => record.meta.requiresAuth === false)) { // check if 'to'-route not requires authentication and allow access
    next()
  } else {
    if (!router.app.$auth0.isAuthenticated()) { // trigger auth0 login
      router.app.$auth0.login()
    } else { // if authenticated allow access
      next()
    }
  }
})

export default router
