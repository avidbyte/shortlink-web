# ShortLink Web 🌐

ShortLink 的前端项目，基于 **Vue 3 + Vite** 构建，为短链接管理平台提供直观的 Web 界面。

👉 对应的后端项目请查看：[shortlink-go](https://github.com/avidbyte/shortlink-go)

---

## 📌 功能

- 短链创建与管理界面
- 访问统计（PV/UV）可视化
- 状态管理（启用 / 禁用）
- 国际化 (i18n) 支持
- 与后端 API 无缝对接

---

## 🛠️ 运行环境

请确保环境中已安装以下依赖：

- **Node.js 16+**
- **npm 7+ / pnpm / yarn**
- **后端服务（shortlink-go）**
- **Nginx** （生产部署时需要反向代理前后端）

---

## 🚀 本地开发

安装依赖：
```shell
npm install
```

启动开发服务器：
```shell
npm run dev
```

浏览器访问：
```shell
http://localhost:5173
```

## 📦 构建与部署

构建生产环境代码：
```shell
npm run build
```
构建完成后，静态文件会生成在 dist/ 目录下，可交由 Nginx 或其他 Web 服务器托管。

🌍 Nginx 部署说明

⚠️ 注意：前端和后端分别部署完成后，还需要配置 Nginx 才能正常访问。
示例配置（可根据实际路径调整）：
```text
server {
    listen 80;
    server_name test.com;

    access_log /log/short-link.access.log;
    error_log /log/short-link.error.log;

    # 防止非法请求方法
    if ($request_method !~ ^(GET|HEAD|POST|OPTIONS|PUT|DELETE)$ ) {
        return 405;
    }

    # 防止访问敏感文件
    location ~* (\.git|\.svn|\.DS_Store|\.env|\.log|\.bak|~)$ {
        deny all;
    }

    # /admin 无斜杠重定向
    location = /admin {
        return 301 /admin/;
    }

    # 静态资源缓存（修复 alias 使用方式）
    location ^~ /admin/assets/ {
        alias /shortlink-web/dist/assets/;
        expires 30d;
        add_header Cache-Control "public, no-transform";
        access_log off;
    }

    # /admin 静态页面服务（入口）
    location /admin/ {
        alias /shortlink-web/dist/;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # 其余请求代理给后端
    location / {
        proxy_pass http://127.0.0.1:8080;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        client_max_body_size 10M;

        proxy_connect_timeout 60s;
        proxy_send_timeout 120s;
        proxy_read_timeout 120s;
    }
}
```


## 📄 其他命令
类型检查：
```shell
npm run type-check
```

代码格式检查：
```shell
npm run lint
```

## 📝 License

MIT License
