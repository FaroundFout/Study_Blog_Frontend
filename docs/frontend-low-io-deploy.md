# Frontend Low-IO Deployment

适用场景：
- 本地先完成前端构建
- 云服务器不执行 `npm install`、`npm ci`、`next build`
- 服务器只做“上传单个压缩包 + 解压 + 启动”

## 1. 先确认构建环境

当前项目要求：
- Node.js `>= 18.17.0`

当前项目使用到的公开环境变量：
- `NEXT_PUBLIC_API_BASE_URL`
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_ENABLE_MOCK`

注意：
- 这些 `NEXT_PUBLIC_*` 变量会影响本地构建出来的产物。
- 如果你本地打包时仍然使用 `localhost`，上传到服务器后，前端仍然会请求 `localhost`。
- 如果云服务器是 Linux，最稳妥的做法是在本地 Linux / WSL / Docker Linux 环境中构建，尽量与线上系统保持一致。

## 2. 本地构建

在 `frontend` 目录下执行：

```powershell
cd D:\study_blog\frontend
Copy-Item .env.local.example .env.production.local
```

将 `.env.production.local` 改成线上值，例如：

```env
NEXT_PUBLIC_API_BASE_URL=https://wwt-lab.xyz
NEXT_PUBLIC_SITE_URL=https://wwt-lab.xyz
NEXT_PUBLIC_ENABLE_MOCK=false
```

然后执行：

```powershell
npm ci
npm run build
```

构建完成后，检查下面这个文件是否存在：

```powershell
Test-Path .\.next\standalone\server.js
```

如果返回 `True`，说明可以进入打包步骤。

## 3. 本地打包

下面这组命令只整理运行所需的最小文件：
- `.next/standalone`
- `.next/static`
- `public`

不会把整份源码和完整 `node_modules` 上传到服务器。

```powershell
cd D:\study_blog\frontend

Remove-Item .\deploy -Recurse -Force -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Path .\deploy\app\.next -Force | Out-Null

Copy-Item .\.next\standalone\* .\deploy\app\ -Recurse -Force
Copy-Item .\.next\static .\deploy\app\.next\static -Recurse -Force
Copy-Item .\public .\deploy\app\public -Recurse -Force

Compress-Archive -Path .\deploy\app\* -DestinationPath .\deploy\frontend-standalone.zip -Force
```

打包完成后，上传这个文件即可：

```text
frontend\deploy\frontend-standalone.zip
```

## 4. 上传到服务器

推荐只上传一个压缩包，避免大量小文件传输。

Windows 本地推送到 Linux 服务器示例：

```powershell
scp .\deploy\frontend-standalone.zip user@your-server:/tmp/frontend-standalone.zip
```

## 5. 服务器部署

登录服务器后执行：

```bash
mkdir -p /opt/study-blog/frontend/current
rm -rf /opt/study-blog/frontend/current/*
unzip /tmp/frontend-standalone.zip -d /opt/study-blog/frontend/current
cd /opt/study-blog/frontend/current
```

然后直接启动：

```bash
PORT=3000 HOSTNAME=0.0.0.0 NODE_ENV=production node server.js
```

说明：
- 这里不需要执行 `npm install`
- 这里不需要执行 `npm run build`
- 这里只是解压和运行，IO 很轻

## 6. 使用 pm2 托管前端

如果你希望用 `pm2` 守护前端进程，可以只在服务器上安装一次 `pm2`：

```bash
npm install -g pm2
```

启动前端：

```bash
pm2 delete study-blog-frontend
PORT=3000 NODE_ENV=production pm2 start /root/myblog/frontend/server.js --name study-blog-frontend --cwd /root/myblog/frontend
```

查看日志：

```bash
pm2 logs study-blog-frontend
```

设置开机自启：

```bash
pm2 save
pm2 startup
```

说明：
- `pm2` 适合用来托管前端 Node 进程，提供日志、重启和开机自启能力。
- 这个方案同样不需要在服务器执行 `npm install`、`npm run build`。
- 如果你已经使用 `pm2`，建议优先用这套方式，不要再同时用 `systemd` 托管同一个前端进程。

## 7. 可选：使用 systemd 托管

如果你不打算用 `pm2`，也可以用 `systemd`。

创建服务文件：

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
```

启用并启动：

```bash
systemctl daemon-reload
systemctl enable --now study-blog-frontend
systemctl status study-blog-frontend
```

## 8. 更新发布

后续每次发布只需要重复这条轻量链路：

1. 本地修改代码
2. 本地执行 `npm run build`
3. 本地重新生成 `frontend-standalone.zip`
4. 上传新压缩包到服务器
5. 服务器解压覆盖
6. 根据你的托管方式执行 `pm2 restart study-blog-frontend` 或 `systemctl restart study-blog-frontend`

如果你使用 `pm2`，对应命令是：

```bash
pm2 stop study-blog-frontend
find /root/myblog/frontend -mindepth 1 -maxdepth 1 -exec rm -rf -- {} +          // 删除frontend目录下所有的文件（包含隐藏文件）
unzip frontend-standalone.zip 
pm2 restart study-blog-frontend --update-env
pm2 logs study-blog-frontend --lines 50
```

如果你使用 `systemd`，对应命令是：

```bash
rm -rf /opt/study-blog/frontend/current/*
unzip /tmp/frontend-standalone.zip -d /opt/study-blog/frontend/current
systemctl restart study-blog-frontend
```

## 9. 不建议在服务器执行的命令

下面这些命令都会造成较多文件扫描、写入或依赖安装，不适合你的场景：

```bash
npm install
npm ci
npm run build
next build
```

## 10. 反向代理示例

如果你使用 Nginx：

```nginx
server {
    listen 80;
    server_name blog.example.com;

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

## 11. 一句话原则

最省服务器 IO 的方式就是：

本地构建 -> 本地压缩最小运行包 -> 服务器只上传、解压、重启。
