import { View, Text } from '@tarojs/components';

export default function PetsPage() {
  return (
    <View>
      <View className="card">
        <Text style={{ fontSize: '40rpx', fontWeight: 'bold' }}>🐾 宠物养成</Text>
        <Text style={{ color: '#6B7280', display: 'block', marginTop: '16rpx' }}>
          宠物系统即将上线！领养、喂养、成长，与班级共成长。
        </Text>
      </View>
    </View>
  );
}
