import { View, Text, Button } from '@tarojs/components';
import { useApp } from '../../app';
import Taro from '@tarojs/taro';
import { useState } from 'react';

export default function IndexPage() {
  const { auth, logout } = useApp();
  const [role, setRole] = useState<string | null>(null);

  // 登录后跳转到仪表盘
  if (auth.token) {
    Taro.redirectTo({ url: '/pages/dashboard/dashboard' });
    return null;
  }

  const menuItems = [
    { label: '教师登录', icon: '👨‍🏫', desc: '班级管理、积分评价、宠物养成', role: 'teacher', url: '/pages/login/login' },
    { label: '家长登录', icon: '👨‍👩‍👧', desc: '查看孩子积分、宠物、排名', role: 'parent', url: '/pages/login/login?role=parent' },
  ];

  return (
    <View style={{ padding: '48rpx', paddingTop: '120rpx' }}>
      <View style={{ textAlign: 'center', marginBottom: '80rpx' }}>
        <Text style={{ fontSize: '100rpx', display: 'block' }}>📚</Text>
        <Text style={{ fontSize: '44rpx', fontWeight: 'bold', color: '#1F2937', display: 'block', marginTop: '24rpx' }}>
          我的老师我的班
        </Text>
        <Text style={{ fontSize: '28rpx', color: '#9CA3AF', display: 'block', marginTop: '16rpx' }}>
          游戏化班级管理与宠物养成
        </Text>
      </View>

      {menuItems.map(item => (
        <View
          key={item.role}
          className="card"
          onClick={() => {
            Taro.setStorageSync('login_role', item.role);
            Taro.navigateTo({ url: item.url });
          }}
          style={{ margin: '0 0 32rpx 0', cursor: 'pointer' }}
        >
          <View style={{ display: 'flex', alignItems: 'center', gap: '24rpx' }}>
            <Text style={{ fontSize: '56rpx' }}>{item.icon}</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: '34rpx', fontWeight: 'bold', color: '#1F2937', display: 'block' }}>
                {item.label}
              </Text>
              <Text style={{ fontSize: '24rpx', color: '#9CA3AF', display: 'block', marginTop: '8rpx' }}>
                {item.desc}
              </Text>
            </View>
            <Text style={{ color: '#D1D5DB', fontSize: '36rpx' }}>›</Text>
          </View>
        </View>
      ))}

      <View style={{ marginTop: '60rpx', textAlign: 'center' }}>
        <Text style={{ fontSize: '22rpx', color: '#D1D5DB' }}>
          v2.4.0 · 全部宠物免费领养
        </Text>
      </View>
    </View>
  );
}
