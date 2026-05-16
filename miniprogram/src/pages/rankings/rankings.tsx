import { View, Text } from '@tarojs/components';

export default function RankingsPage() {
  return (
    <View>
      <View className="card">
        <Text style={{ fontSize: '40rpx', fontWeight: 'bold' }}>🏆 排行榜</Text>
        <Text style={{ color: '#6B7280', display: 'block', marginTop: '16rpx' }}>
          学生排行、宠物排行、班级排行即将上线！
        </Text>
      </View>
    </View>
  );
}
