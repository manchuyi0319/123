import { View, Text } from '@tarojs/components';

export default function ParentDashboard() {
  return (
    <View>
      <View className="card">
        <Text style={{ fontSize: '40rpx', fontWeight: 'bold' }}>👨‍👩‍👧 家长中心</Text>
        <Text style={{ color: '#6B7280', display: 'block', marginTop: '16rpx' }}>
          查看孩子积分、宠物和排名。请先在网页端完成关联。
        </Text>
      </View>
    </View>
  );
}
