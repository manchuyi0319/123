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
});
