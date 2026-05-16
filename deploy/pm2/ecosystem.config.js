// ============================================================
// PM2 进程管理配置
// 用途：确保服务崩溃后自动重启，日志管理
// 使用：pm2 start ecosystem.config.js
// ============================================================

module.exports = {
  apps: [
    {
      name: 'class-pet-garden',
      cwd: '/home/ubuntu/class-pet-garden',
      script: 'npx',
      args: 'tsx server/src/index.ts',
      interpreter: 'none',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
        // 数据库文件存放路径（确保目录存在且有写入权限）
        DB_PATH: '/home/ubuntu/class-pet-garden/server/data/class-pet-garden.db',
      },
      // 自动重启配置
      autorestart: true,
      max_restarts: 10,
      restart_delay: 5000,
      // 内存限制（超过 500MB 自动重启）
      max_memory_restart: '500M',
      // 日志
      error_file: '/home/ubuntu/logs/class-pet-garden-error.log',
      out_file: '/home/ubuntu/logs/class-pet-garden-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      merge_logs: true,
    },
  ],
};
