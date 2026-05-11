module.exports = {
  apps: [
    {
      name: 'svelteforge-admin',
      script: 'build/index.js',
      cwd: './',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        ORIGIN: 'https://amr.asia'
      }
    }
  ]
};
