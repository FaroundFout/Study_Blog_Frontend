# Frontend Low-IO Deployment

这份文档用于“本地构建，服务器只上传压缩包、解压、重启”的部署方式。适合云服务器磁盘 IO 较弱，或不希望在线上执行 `npm install`、`npm ci`、`next build` 的场景。

## 1. 部署前提

- Node.js `>= 18.17.0`
- 后端 Spring Boot 已运行，例如 `http://127.0.0.1:8080`
- 线上域名已解析到服务器，例如 `https://wwt-lab.xyz`
- Nginx 或其他反向代理负责把 `/api/` 转发到后端

前端公开环境变量：

- `NEXT_PUBLIC_API_BASE_URL`
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_ENABLE_MOCK`

构建时需要注意：

- 浏览器端未配置 `NEXT_PUBLIC_API_BASE_URL` 时，会默认请求当前页面同源地址。
- 服务端渲染和构建阶段未配置 `NEXT_PUBLIC_API_BASE_URL` 时，会兜底请求 `http://localhost:8080`。
- 生产构建建议显式写入线上域名，并设置 `NEXT_PUBLIC_ENABLE_MOCK=false`。

## 2. 本地生产配置

在 `frontend` 目录下准备生产配置：

```powershell
cd D:\Projects\study_blog\frontend
Copy-Item .env.local.example .env.production.local
```

将 `.env.production.local` 改成线上值：

```env
NEXT_PUBLIC_API_BASE_URL=https://wwt-lab.xyz
NEXT_PUBLIC_SITE_URL=https://wwt-lab.xyz
NEXT_PUBLIC_ENABLE_MOCK=false
```

如果你已经在 Nginx 中把 `/api/` 反代到后端，也可以让浏览器端走同源请求；但为了避免服务端构建阶段请求 `localhost:8080`，生产构建仍建议保留 `NEXT_PUBLIC_API_BASE_URL=https://wwt-lab.xyz`。

## 3. 本地构建

```powershell
npm ci
npm run build
```

构建结束后确认 standalone 文件存在：

```powershell
Test-Path .\.next\standalone\server.js
```

返回 `True` 后进入打包步骤。

如果构建日志出现 `TypeError: fetch failed` 且原因是 `ECONNREFUSED`，通常是构建阶段访问不到后端。处理方式：

- 启动本地后端 `localhost:8080` 后重新构建。
- 或在 `.env.production.local` 中把 `NEXT_PUBLIC_API_BASE_URL` 设置为线上可访问后端域名。

## 4. 本地打包

只打包 Next.js standalone 运行所需文件：

- `.next/standalone`
- `.next/static`
- `public`

```powershell
cd D:\Projects\study_blog\frontend

Remove-Item .\deploy -Recurse -Force -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Path .\deploy\app\.next -Force | Out-Null

Copy-Item .\.next\standalone\* .\deploy\app\ -Recurse -Force
Copy-Item .\.next\static .\deploy\app\.next\static -Recurse -Force
Copy-Item .\public .\deploy\app\public -Recurse -Force

Compress-Archive -Path .\deploy\app\* -DestinationPath .\deploy\frontend-standalone.zip -Force
```

生成文件：

```text
frontend\deploy\frontend-standalone.zip
```

`deploy/app/server.js` 是构建产物，里面可能包含本机路径，正常情况下不需要提交到 Git。

## 5. 上传与解压

上传压缩包：

```powershell
scp .\deploy\frontend-standalone.zip user@your-server:/tmp/frontend-standalone.zip
```

服务器解压：

```bash
mkdir -p /opt/study-blog/frontend/current
rm -rf /opt/study-blog/frontend/current/*
unzip /tmp/frontend-standalone.zip -d /opt/study-blog/frontend/current
cd /opt/study-blog/frontend/current
```

直接启动验证：

```bash
PORT=3000 HOSTNAME=0.0.0.0 NODE_ENV=production node server.js
```

## 6. pm2 托管

服务器只需要安装一次 pm2：

```bash
npm install -g pm2
```

启动或重建进程：

```bash
pm2 delete study-blog-frontend || true
PORT=3000 HOSTNAME=0.0.0.0 NODE_ENV=production pm2 start /opt/study-blog/frontend/current/server.js --name study-blog-frontend --cwd /opt/study-blog/frontend/current
pm2 save
```

查看日志：

```bash
pm2 logs study-blog-frontend --lines 50
```

更新发布：

```bash
pm2 stop study-blog-frontend
rm -rf /opt/study-blog/frontend/current/*
unzip /tmp/frontend-standalone.zip -d /opt/study-blog/frontend/current
pm2 restart study-blog-frontend --update-env
pm2 logs study-blog-frontend --lines 50
```

## 7. systemd 托管

如果不使用 pm2，可以使用 systemd。

```bash
cat >/etc/systemd/system/study-blog-frontend.service <<'EOF'
[Unit]
Description=Study Blog Frontend
After=network.target

[Service]
Type=simple
WorkingDirectory=/opt/study-blog/frontend/current
Environment=NODE_ENV=production
Environment=PORT=3000
Environment=HOSTNAME=0.0.0.0
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=5
User=www-data
Group=www-data

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable --now study-blog-frontend
systemctl status study-blog-frontend
```

systemd 更新发布：

```bash
rm -rf /opt/study-blog/frontend/current/*
unzip /tmp/frontend-standalone.zip -d /opt/study-blog/frontend/current
systemctl restart study-blog-frontend
systemctl status study-blog-frontend
```

## 8. Nginx 反向代理

同域部署时，关键是 `/api/` 必须先代理到后端，其他路径再代理到前端。

```nginx
server {
    listen 80;
    server_name wwt-lab.xyz;

    location /api/ {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

启用 HTTPS 后，建议把 `JWT_REFRESH_COOKIE_SECURE=true` 保持为默认值；如果只是本地 HTTP 调试，则需要在后端开发配置中改为 `false`。

## 9. 不建议在线上执行

```bash
npm install
npm ci
npm run build
next build
```

这些命令会产生大量小文件读写。低 IO 部署的核心原则是：本地构建、本地压缩最小运行包，服务器只解压和重启。
