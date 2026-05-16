import { View, Text } from '@tarojs/components';

export default function StudentsPage() {
  return (
    <View>
      <View className="card">
        <Text style={{ fontSize: '40rpx', fontWeight: 'bold' }}>👩‍🎓 学生管理</Text>
        <Text style={{ color: '#6B7280', display: 'block', marginTop: '16rpx' }}>
          学生列表和积分管理即将上线！
        </Text>
      </View>
    </View>
  );
}
