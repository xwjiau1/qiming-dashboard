# Cloudflare Tunnel 配置
# 用于将 platform.metanoia-tech.com 指向本地服务

# 1. 安装 cloudflared
# wget -q https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
# dpkg -i cloudflared-linux-amd64.deb

# 2. 登录 Cloudflare
# cloudflared tunnel login

# 3. 创建隧道
# cloudflared tunnel create company-platform

# 4. 创建配置文件 ~/.cloudflared/config.yml
# tunnel: <隧道ID>
# credentials-file: /root/.cloudflared/<隧道ID>.json
# ingress:
#   - hostname: platform.metanoia-labs.com
#     service: http://localhost:3001
#   - service: http_status:404

# 5. 运行隧道
# cloudflared tunnel run company-platform

# 6. 设置 DNS 记录（在 Cloudflare 控制台）
# 添加 CNAME: platform → <隧道ID>.cfargotunnel.com

# 7. 设置为系统服务
# cloudflared service install
# systemctl start cloudflared
