module.exports = {
  apps: [{
    name: 'sync-helper',
    script: 'index.js',
    cwd: '/root/splendor-blockchain-v4/Core-Blockchain/plugins/sync-helper',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production'
    },
    error_file: '/var/log/pm2/sync-helper-error.log',
    out_file: '/var/log/pm2/sync-helper-out.log',
    log_file: '/var/log/pm2/sync-helper-combined.log',
    time: true,
    merge_logs: true,
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
};
