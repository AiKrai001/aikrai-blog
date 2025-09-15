---
title: "Registry docker-compose部署"
description: ''
pubDate: '2024 06 18'
heroImage: ''
tags: ['docker', 'registry']
categories: ['Docker']
author: 'AiKrai'
---


![](https:pixel-oss.aikrai.com/picgo/20241121113130.png)

虽然registry已经不再支持oss，但目前registry:2.8.3还能用，尽量不升级版本就行。

目录结构

    ├── config
    │   ├── config.yml
    │   └── htpasswd
    ├── data
    └── docker-compose.yml
    

dockercompose.yaml

    version: '3.8'
    
    services:
      registry-ui:
        image: joxit/docker-registry-ui:main
        restart: always
        ports:
          - 18080:80
        environment:
          - SINGLE_REGISTRY=true
          - REGISTRY_TITLE=AiKrai Docker Registry
          - DELETE_IMAGES=true
          - SHOW_CONTENT_DIGEST=true
          - NGINX_PROXY_PASS_URL=http://registry-server:5000
          - SHOW_CATALOG_NB_TAGS=true
          - CATALOG_MIN_BRANCHES=1
          - CATALOG_MAX_BRANCHES=1
          - TAGLIST_PAGE_SIZE=100
          - REGISTRY_SECURED=false
          - CATALOG_ELEMENTS_LIMIT=1000
        container_name: registry-ui
      
      registry-server:
        image: registry:2.8.3
        restart: always
        volumes:
          - ./config:/etc/docker/registry
          - ./data:/var/lib/registry
        container_name: registry-server
    

替换更改registry-ui映射端口和registry-server数据卷映射位置即可

config.yml

    version: 0.1
    
    storage:
      delete:
        enabled: true
      cache:
        blobdescriptor: inmemory
      oss:
        accesskeyid: xxx
        accesskeysecret: xxx
        region: xxx
        bucket: xxx
        secure: true
        v4auth: true
      redirect:
        disable: true
    http:
      addr: :5000
    auth:
      htpasswd:
        realm: basic-realm
        path: /etc/docker/registry/htpasswd
    

config.yml中填写accesskeyid，accesskeysecret，region，bucket即可。如果不需要鉴权，删掉auth及下面内容即可，htpasswd文件生成方式自行搜索。

参考文档  
[docker-registry-ui/examples/issue-75/docker-compose.yml at main · Joxit/docker-registry-ui · GitHub](https://github.com/Joxit/docker-registry-ui/blob/main/examples/issue-75/docker-compose.yml)  
[Registry | Docker Docs](https://docs.docker.com/registry/#redirect)  
[Deploy a registry server | CNCF Distribution](https://distribution.github.io/distribution/about/deploying/)  
[趣玩 OSS + docker registry + consul-template 组合](https://vqiu.cn/funny-to-docker-registry/)

最后再说一点，这套方案不好用，我是自己搭着玩玩。 生产部署harbor，虽然有点重，但用起来方便。 可以连接的公网话，也没必要自己搭docker registry，可以使用阿里云和腾讯云个人的镜像仓库。 github上也有转存镜像的项目。
