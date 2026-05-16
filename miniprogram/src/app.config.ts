// 小程序全局配置
export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/login/login',
    'pages/dashboard/dashboard',
    'pages/classes/classes',
    'pages/students/students',
    'pages/pets/pets',
    'pages/rankings/rankings',
    'pages/parent/dashboard',
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#4F46E5',
    navigationBarTitleText: '我的老师我的班',
    navigationBarTextStyle: 'white',
    backgroundColor: '#f5f5f5',
  },
  tabBar: {
    color: '#999999',
    selectedColor: '#4F46E5',
    backgroundColor: '#ffffff',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/index/index',
        text: '首页',
        iconPath: 'assets/icons/home.png',
        selectedIconPath: 'assets/icons/home-active.png',
      },
      {
        pagePath: 'pages/classes/classes',
        text: '班级',
        iconPath: 'assets/icons/class.png',
        selectedIconPath: 'assets/icons/class-active.png',
      },
      {
        pagePath: 'pages/pets/pets',
        text: '宠物',
        iconPath: 'assets/icons/pet.png',
        selectedIconPath: 'assets/icons/pet-active.png',
      },
      {
        pagePath: 'pages/rankings/rankings',
        text: '排行',
        iconPath: 'assets/icons/rank.png',
        selectedIconPath: 'assets/icons/rank-active.png',
      },
    ],
  },
  permission: {
    'scope.userLocation': {
      desc: '你的位置信息将用于班级区域展示',
    },
  },
  requiredPrivateInfos: [],
});
