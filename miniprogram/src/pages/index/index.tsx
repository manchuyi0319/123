import { View, Text } from '@tarojs/components';
import { useApp } from '../../app';
import Taro from '@tarojs/taro';

export default function IndexPage() {
  const { auth, handleWechatLogin } = useApp();

  if (!auth.token) {
    return (
      <View className="flex-center" style={{ height: '100vh', flexDirection: 'column' }}>
        <Text style={{ fontSize: '80rpx', marginBottom: '40rpx' }}>📚</Text>
        <Text style={{ fontSize: '36rpx', fontWeight: 'bold', marginBottom: '16rpx' }}>
          我的老师我的班
        </Text>
        <Text style={{ color: '#6B7280', marginBottom: '80rpx' }}>
          游戏化班级管理与宠物养成
        </Text>
        <View className="btn-primary" onClick={() => Taro.navigateTo({ url: '/pages/login/login' })}>
          登录
        </View>
      </View>
    );
  }

  return (
    <View>
      <View className="card">
        <Text style={{ fontSize: '40rpx', fontWeight: 'bold' }}>
          你好，{auth.teacher?.display_name || '老师'}
        </Text>
      </View>
      <View className="card">
        <Text style={{ color: '#6B7280' }}>更多功能开发中...</Text>
        <Text style={{ color: '#6B7280', fontSize: '24rpx', marginTop: '16rpx' }}>
          仪表盘、班级管理、宠物养成、排行榜即将上线
        </Text>
      </View>
    </View>
  );
}
