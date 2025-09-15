---
title: "阿里codeup docker构建部署"
description: ''
pubDate: '2024 06 18'
heroImage: ''
tags: ['codeup', 'CI/CD']
categories: ['CI/CD']
author: 'AiKrai'
---

1.新建流水线选择一个模板，我这个是一个java项目，就选了java模板中的第一个。创建后将里面的任务删光。 ![image.png](https://alist.aikrai.com/d/oss-aikrai-hk-pixel/picgo/20250603114414.png)![image.png](https://alist.aikrai.com/d/oss-aikrai-hk-pixel/picgo/20250603114816.png)

2.点击新建任务，滑动到最底下，选择自定义后，删除该任务步骤中默认的自定义环境构建。 ![image.png](https://alist.aikrai.com/d/oss-aikrai-hk-pixel/picgo/20250603114919.png)

3.点击添加步骤，选择构建中的镜像构建并推送至阿里云镜像仓库个人版，修改任务名称并填写相关配置。更多标签可以填写latest，方便部署。（如果没有阿里云镜像仓库，请搜索"阿里云镜像仓库创建教程"） ![image.png](https://alist.aikrai.com/d/oss-aikrai-hk-pixel/picgo/20250603115216.png)![image.png](https://alist.aikrai.com/d/oss-aikrai-hk-pixel/picgo/20250603115454.png)

4.点击新的任务，滑动到最底下，选择自定义，再添加一个自定义任务。 ![image.png](https://alist.aikrai.com/d/oss-aikrai-hk-pixel/picgo/20250603120247.png)

5.配置部署任务，填写自定义镜像"registry.cn-zhangjiakou.aliyuncs.com/publicci/deploy-bash:dev-220618181320", 编写脚本使用sshpass连接主机执行部署命令。[参考脚本](https://alist.aikrai.com/guest-oss/codeup/codeup1.sh)根据实际需求修改配置项和docker run部分。 ![image.png](https://alist.aikrai.com/d/oss-aikrai-hk-pixel/picgo/20250603133421.png)
