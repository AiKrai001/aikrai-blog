---
title: "FreePBX（Debian 12）官方脚本安装与基础配置指南（含 Cloudflare + SSL + SIP 客户端）"
description: ''
pubDate: '2026 01 04'
heroImage: ''
tags: ['voip', 'sip', 'freePBX']
categories: ['voip']
author: 'AiKrai'
---

# FreePBX（Debian 12）官方脚本安装与基础配置指南（含 Cloudflare + SSL + SIP 客户端）

> 适用环境：一台全新 **Debian 12** VPS（2C2G 也可跑起来，但并发/转码能力有限）  
> 安装方式：使用 FreePBX 官方 Debian 安装脚本：  
> https://github.com/FreePBX/sng_freepbx_debian_install

---

## 目录

- [1. 前置说明与踩坑结论](#1-前置说明与踩坑结论)
- [2. 安装 FreePBX（官方脚本）](#2-安装-freepbx官方脚本)
- [3. 首次进入 Web 初始化](#3-首次进入-web-初始化)
- [4. 防火墙（FreePBX Firewall）配置与 IP 白名单](#4-防火墙freepbx-firewall配置与-ip-白名单)
- [5. 配置 SSL（Let’s Encrypt）与 HTTPS 访问](#5-配置-ssllets-encrypt与-https-访问)
- [6. 创建 SIP 分机（Extensions）](#6-创建-sip-分机extensions)
- [7. Zoiper5（Windows）注册与测试](#7-zoiper5windows注册与测试)
- [8. Cloudflare 代理导致的 522 / 408 问题与解决方案](#8-cloudflare-代理导致的-522--408-问题与解决方案)
- [9. 常见问题与建议](#9-常见问题与建议)

---

## 1. 前置说明与踩坑结论

一开始 VPS 上装了 **1panel** 和一些 **Docker 服务**，在执行 FreePBX 安装脚本时遇到各种报错。  
最终结论：

- **强烈建议在“干净的 Debian 12”上安装 FreePBX**  
- 直接重装 Debian 12 后执行脚本，一路顺畅并成功安装

---

## 2. 安装 FreePBX（官方脚本）

> 建议：确保系统是全新 Debian 12，且无额外面板/容器服务占用端口（80/443/5060 等）。

脚本仓库：

- https://github.com/FreePBX/sng_freepbx_debian_install

按仓库说明执行官方安装脚本即可（此处不重复仓库内的命令，避免版本差异）。

安装完成后：

- 用浏览器访问：`http://服务器IP`

---

## 3. 首次进入 Web 初始化

访问 `http://服务器IP` 后进入初始化页面，建议按以下顺序操作：

1. 设置管理员用户名/密码
2. **禁用模块自动更新（Module Auto Updates）**（避免无人值守更新带来不稳定）
3. 下一步继续

---

## 4. 防火墙（FreePBX Firewall）配置与 IP 白名单

初始化流程会询问是否开启防火墙。

### 4.1 建议做法

- **先把自己的公网 IP 加入白名单（Trusted）**
- 再开启防火墙  
否则可能会把自己锁在门外。

### 4.2 加白单个 IP（/32）

```bash
fwconsole firewall trust x.x.x.x/32 "my-ip"


### 4.3 加白一个网段

```bash
fwconsole firewall trust 223.160.0.0/16 "trusted-223.160"
```

---

## 5. 配置 SSL（Let’s Encrypt）与 HTTPS 访问

### 5.1 申请证书（FreePBX 后台）

在 FreePBX 后台：

* `Admin -> Certificate Management`
* 选择：`Generate Let's Encrypt Certificate`
* 勾选该证书为默认（Default）

**注意：**

* 申请证书前，域名需要在 DNS 中配置 A 记录指向服务器公网 IP
* 证书文件通常会出现在：

    * `/etc/asterisk/keys/`

### 5.2 开源版没有 Sysadmin 菜单？（需要 Sangoma 注册激活）

FreePBX 的 `Sysadmin (System Admin)` 菜单在开源安装中可能需要注册/激活才可用。
此时可以通过 **手动修改 Apache SSL 配置**完成 HTTPS。

### 5.3 手动配置 Apache 使用 FreePBX 证书

编辑 Apache SSL 站点配置：

```bash
nano /etc/apache2/sites-available/default-ssl.conf
```

将证书配置改为你真实的证书路径（推荐用 **fullchain + key**，最省事）：

```apache
SSLCertificateFile      /etc/asterisk/keys/your-domain-fullchain.crt
SSLCertificateKeyFile   /etc/asterisk/keys/your-domain.key
```

示例（按你的实际域名替换）：

```apache
SSLCertificateFile      /etc/asterisk/keys/freepbx.aikrai.xyz-fullchain.crt
SSLCertificateKeyFile   /etc/asterisk/keys/freepbx.aikrai.xyz.key
```

重载 Apache：

```bash
systemctl reload apache2
```

之后访问：

* `https://你的域名`

---

## 6. 创建 SIP 分机（Extensions）

在 FreePBX 后台：

* `Connectivity -> Extensions`
* 添加 SIP 分机（如 PJSIP / Chan_SIP 视系统模块而定）
* 记录关键信息：

    * **分机号（Extension）**
    * **Secret（密码）**
    * 认证账号（通常与分机号一致）

---

## 7. Zoiper5（Windows）注册与测试

Windows 客户端可下载 Zoiper5：

* [https://www.zoiper.com/en/voip-softphone/download/current](https://www.zoiper.com/en/voip-softphone/download/current)

### 7.1 Zoiper5 账号填写参考

常见填法（示例）：

* **User / Login**：`分机号@域名:5060`
* **Password**：分机的 `Secret`
* **Auth user**：分机号

保存后 Zoiper 会进行连通性测试：

* SIP UDP 测试项变绿后即可 Finish

### 7.2 “全是 not found”的一个经验

如果一开始使用 `IP` 直接访问/注册，且没有配置 SSL、域名、证书等，测试可能出现各种异常（例如 not found）。
在本次部署中：**配置 SSL + 用域名后注册成功**。

> 注：SIP 本身不依赖 HTTPS/SSL（除非你用的是 TLS/SRTP），但实际环境里往往同时伴随防火墙、DNS、NAT、端口暴露等配置变化；因此“配置 SSL 后恢复正常”更像是整体配置完善后的结果。

---

## 8. Cloudflare 代理导致的 522 / 408 问题与解决方案

你的域名托管在 Cloudflare，上面配置时 **未开启代理（灰云）** 一切正常。
开启代理（橙云）后出现两个典型问题：

### 8.1 访问网页报 522（Connection timed out）

原因之一：FreePBX Firewall 开启后，可能阻断了 Cloudflare 回源 IP。

解决思路：把 Cloudflare 回源 IP 段加入 Trusted，然后重启 firewall。

> ⚠️ Cloudflare IP 段会变更，建议以 Cloudflare 官方文档为准定期更新。

#### 将 Cloudflare 回源 IP 段加入 Trusted（示例）

```bash
fwconsole firewall add trusted \
103.21.244.0/22 \
103.22.200.0/22 \
103.31.4.0/22 \
104.16.0.0/13 \
104.24.0.0/14 \
108.162.192.0/18 \
131.0.72.0/22 \
141.101.64.0/18 \
162.158.0.0/15 \
172.64.0.0/13 \
173.245.48.0/20 \
188.114.96.0/20 \
190.93.240.0/20 \
197.234.240.0/22 \
198.41.128.0/17

fwconsole firewall restart
```

处理后，Web 访问一般恢复正常。

### 8.2 Zoiper 登录失败：Request Timeout (408)

原因：Cloudflare 默认只代理少数 **HTTP/HTTPS 端口**（80/443/8443 等），**不包含 5060/5160**。
当你给域名开启代理时：

* Zoiper 解析到的是 Cloudflare 边缘 IP
* SIP 流量（5060/5160）无法正确到达你的 PBX
* 于是 Zoiper 报：`Request Timeout (408)`

✅ 解决方案：为 SIP 单独准备一个“不走代理”的子域名（灰云）

做法：

1. 在 Cloudflare DNS 新增一个子域名（例如 `sip.example.com`）
2. **关闭代理（灰云 / DNS only）**
3. Zoiper 用这个 `sip` 子域名进行注册即可成功

推荐实践：

* Web 管理：`pbx.example.com`（可橙云代理、走 443）
* SIP 注册：`sip.example.com`（必须灰云直连，走 5060/5160 或 TLS 5061）

---

## 9. 常见问题与建议

* **强烈建议新装系统部署**：面板、docker、反代、iptables 规则都可能干扰 FreePBX 安装与端口使用
* **防火墙先白名单再开启**：至少白自己的公网 IP，以及必要的运维来源
* **Cloudflare 橙云不适合 SIP UDP 5060**：SIP 最简单可靠的方案仍是直连（灰云）
* 若后续要做更安全的语音链路：

    * 研究 SIP TLS（5061）+ SRTP
    * 配合 Fail2ban / FreePBX Firewall 的安全策略

---

### 附：本文中的可替换占位符

* `你的域名`：例如 `freepbx.aikrai.xyz`
* `your-domain-fullchain.crt / your-domain.key`：按 `/etc/asterisk/keys/` 中实际文件名替换
* `x.x.x.x`：你的公网 IP

---

```

