---
title: "阿里云效平台(codeup)：自动构建镜像并部署指南"
description: ''
pubDate: '2024 06 18'
heroImage: ''
tags: ['codeup', 'CI/CD']
categories: ['CI/CD']
author: 'AiKrai'
---


完成配置后，代码提交并推送会自动触发流水线，自动构建镜像并部署，发送通知。

## 1\. 创建项目与配置

### 项目创建

1.  创建项目，并推送GitHub。使用 **Gradle** 或 **Maven** 构建都行。
2.  创建 **Dockerfile** 文件。

##### Maven 构建 Dockerfile 示例

```Dockerfile
# 使用阿里云镜像中的 OpenJDK 17 JDK Alpine 版本
FROM registry.cn-zhangjiakou.aliyuncs.com/publicci/openjdk:17-jdk-alpine
# 将项目文件拷贝到容器内
COPY . /workspace/src
# 设置工作目录为 /workspace/src
WORKDIR /workspace/src
# 使用 Maven 构建项目并跳过测试生成 jar 包
RUN ./mvnw clean package -DskipTests
# 使用含 DejaVu 字体的镜像以支持中文显示
FROM registry.cn-zhangjiakou.aliyuncs.com/publicci/openjdk:17-jdk-alpine-ttf-dejavu
# 设置时区为 Asia/Shanghai
ENV TZ=Asia/Shanghai
# 将 jar 包复制到新的镜像中
COPY --from=0 /workspace/src/target/项目名称.jar /workspace/apps/项目名称.jar
WORKDIR /workspace/apps
EXPOSE 8080
CMD ["java", "-jar", "/workspace/apps/项目名称.jar"]

```

##### Gradle 构建 Dockerfile 示例

```Dockerfile
FROM registry.cn-zhangjiakou.aliyuncs.com/publicci/openjdk:17-jdk-alpine
COPY . /workspace/src
WORKDIR /workspace/src
# 赋予 gradlew 文件执行权限
RUN chmod +x ./gradlew
# 使用 gradlew 构建项目并安装 shadow jar 文件
RUN ./gradlew installShadowDist
FROM registry.cn-zhangjiakou.aliyuncs.com/publicci/openjdk:17-jdk-alpine-ttf-dejavu
# 将本地的时间配置文件复制到容器的 /etc 目录下，配置系统时区
COPY ./make/localtime /etc
COPY ./make/timezone /etc
# 将应用拷贝到新镜像
COPY --from=0 /workspace/src/build/install/项目名称-shadow /workspace/apps
WORKDIR /workspace/apps
EXPOSE 8080
CMD ./bin/项目名称

```

##### 配置应用启动参数

使用 Maven 构建时，在DockerFile中CMD部分补充参数。 使用 Gradle 构建时，可以在 `build.gradle` 或 `build.gradle.kts` 中设置应用启动参数，以便控制 JVM 启动配置：

```kotlin
application {
    mainClass.set("app.Application")
    applicationDefaultJvmArgs.addAll("--add-opens java.base/java.lang=ALL-UNNAMED".split(" "))
    applicationDefaultJvmArgs = listOf(
        "-Xms512m", 
        "-Xmx1024m", 
        "-Dspring.profiles.active=dev" 
    )
}

```

或者在 `shadowJar` 任务或 `startScripts` 任务中自定义启动参数。

## 2\. 配置阿里云平台

1.  注册并登录阿里云，开通 **容器镜像服务**。
2.  创建 **个人实例** 与 **镜像仓库**，仓库名可与项目名一致，方便管理。
3.  在镜像仓库中配置 **访问凭证**，设置一个仓库密码。 注：实例不知道起什么名称就起个纯英文网名。 创建镜像仓库，地区看你需求选择，或者默认地区就行。 创建仓库时，可根据需求选择代码源，这里我们只使用仓库功能，选择本地仓库就行。 使用云效平台构建，不需要配置构建设置。

## 3\. 创建云效 DevOps 团队

1.  登录 [云效 DevOps 平台](https://accountid-devops.aliyun.com/)。
2.  选择云效DevOps立即开启，填一个企业名或团队名或个人网名。
3.  点击左上角9个点样子的菜单显示按钮，进入代码管理。点击导入代码，可选择不同代码平台，我使用的是github，选择github后绑定一个github账号，它会显示出你所以的仓库，选择要导入的并导入。

## 4\. 创建流水线并配置任务步骤

#### 创建流水线

点击左上角9个点样子的菜单显示按钮，进入流水线管理。新建 **流水线**，选择任意 Java 模板，点击创建，创建后将里面的任务步骤删除。

#### 流水线源

选择代码源，我选择的github平台，之前绑定了github账号，在这选择一个仓库就行，选择要部署的分支。 开启代码触发源 -> 复制Webhook链接 -> 打开github进入对应仓库并 -> 点击Setting -> 点击Webhook -> 将复制的链接填在Payload URL处 -> Content type选择application/json -> 其他的不动划到底下点击绿色的按钮 -> 完成。 如果点开github仓库的Webhook设置发现已经有一条，应该是上面导入仓库时自动设置的，不用管。

### 构建

1.  添加 **镜像构建任务**，选择 **镜像构建 -> 镜像构建并推送至ACR个人版** 点击进入配置：
    1.  任务名称：默认
    2.  构建集群：如果配置了依赖镜像仓库默认云效北京构建集群，如果没有选择香港。
    3.  构建环境：默认
    4.  下载流水线源：默认
    5.  任务步骤：删除原有步骤，点击添加 构建 -> 镜像构建并推送至ACR(个人版)，添加两个。
        1.  步骤1
            -   步骤名称：默认
            -   选择服务连接：点击添加服务链接，根据提示，添加容器镜像服务。
            -   地域：选择上面创建镜像仓库时的地区。
            -   仓库：选择创建的仓库。
            -   使用VPC地址推送镜像：不勾选
            -   标签：${DATETIME}
            -   Dockerfile路径：默认
            -   ContextPath：默认空
            -   镜像缓存：远端缓存，镜像地址和构建参数没有则不填
        2.  步骤2
            -   配置同步骤1
            -   将标签改为：latest

### 部署

1.  添加新阶段，部署 -> docker部署。
    -   任务名称：默认
    -   主机组：添加新建主机组，根据提示，添加自己的服务器。
    -   部署配置：自己玩默认就root就行。
    -   部署脚本

### Docker 部署脚本示例

```bash
#!/bin/bash

# ================================
# 配置部分
# ================================

# 阿里云 Docker Registry 配置
ALIYUN_USERNAME="xxx"  # 替换为您的阿里云账号全名
ALIYUN_PASSWORD="${ALIYUN_DOCKER_PASSWORD}"  # 建议通过环境变量传递密码
SENDKEY="${SERVER_SENDKEY}"

REGISTRY_URL="registry.cn-xxx.aliyuncs.com"
REPO_NAME="xxx"
INSTANCE_NAME="xxx"  # 替换为您的容器镜像服务实例名称
REGION="cn-xxx"

# 容器配置
CONTAINER_NAME="xxx"
HOST_PORT=15000
CONTAINER_PORT=5000
LOG_DIR="/opt/$REPO_NAME/log"

# 镜像存储路径
IMAGE_FULL_PATH="$REGISTRY_URL/$INSTANCE_NAME/$REPO_NAME"

# 内存限制
MEMORY_LIMIT="512m"  # 设置容器最大内存为 512MB

# ================================
# 函数定义
# ================================
# 日志函数
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1"
}
# 登录 Docker Registry
docker_login() {
    if [ -z "$ALIYUN_PASSWORD" ]; then
        log "错误：未设置 ALIYUN_DOCKER_PASSWORD 环境变量。"
        exit 1
    fi

    echo "$ALIYUN_PASSWORD" | docker login --username="$ALIYUN_USERNAME" --password-stdin "$REGISTRY_URL"
    if [ $? -ne 0 ]; then
        log "错误：Docker 登录失败。请检查用户名和密码。"
        exit 1
    fi
    log "Docker 登录成功。"
}
# 拉取最新镜像
pull_latest_image() {
    local tag="latest"
    log "开始拉取镜像：$IMAGE_FULL_PATH:$tag"
    docker pull "$IMAGE_FULL_PATH:$tag"
    if [ $? -ne 0 ]; then
        log "错误：无法拉取镜像 $IMAGE_FULL_PATH:$tag"
        exit 1
    fi
    log "成功拉取镜像：$IMAGE_FULL_PATH:$tag"
}
# 停止并移除现有容器（如果存在）
stop_and_remove_container() {
    if [ "$(docker ps -aq -f name=^/${CONTAINER_NAME}$)" ]; then
        log "发现现有容器 '$CONTAINER_NAME'，正在停止并移除..."
        docker stop "$CONTAINER_NAME"
        if [ $? -ne 0 ]; then
            log "错误：无法停止容器 $CONTAINER_NAME"
            exit 1
        fi
        docker rm "$CONTAINER_NAME"
        if [ $? -ne 0 ]; then
            log "错误：无法移除容器 $CONTAINER_NAME"
            exit 1
        fi
        log "已停止并移除容器 '$CONTAINER_NAME'。"
    else
        log "未发现名为 '$CONTAINER_NAME' 的现有容器。"
    fi
}
# 启动新容器
start_container() {
    local tag="latest"
    # 确保日志目录存在
    mkdir -p "$LOG_DIR"
    if [ $? -ne 0 ]; then
        log "错误：无法创建日志目录 $LOG_DIR"
        exit 1
    fi
    log "正在启动新容器 '$CONTAINER_NAME' ..."
    docker run -d \
        --name "$CONTAINER_NAME" \
        -p "$HOST_PORT":"$CONTAINER_PORT" \
        -v "$LOG_DIR":/workspace/apps/log \
        -e SENDKEY="$SENDKEY" \
        --memory="$MEMORY_LIMIT" \
        "$IMAGE_FULL_PATH":"$tag" \

    if [ $? -ne 0 ]; then
        log "错误：无法启动容器 $CONTAINER_NAME"
        exit 1
    fi
    log "成功启动容器 '$CONTAINER_NAME'，映射端口 $HOST_PORT:$CONTAINER_PORT，日志目录 $LOG_DIR，内存限制 $MEMORY_LIMIT。"
}

# ================================
# 主执行流程
# ================================
# 进入工作目录，如果不存在就创建
WORK_DIR="/opt/$REPO_NAME"
if [ ! -d "$WORK_DIR" ]; then
    log "工作目录 $WORK_DIR 不存在，正在创建..."
    mkdir -p "$WORK_DIR"
    if [ $? -ne 0 ]; then
        log "错误：无法创建工作目录 $WORK_DIR"
        exit 1
    fi
    log "已创建工作目录 $WORK_DIR。"
fi
cd "$WORK_DIR" || { log "错误：无法进入工作目录 $WORK_DIR"; exit 1; }
# 登录 Docker Registry
docker_login
# 拉取最新镜像
pull_latest_image
# 停止并移除现有容器（如果存在）
stop_and_remove_container
# 启动新容器
start_container
log "部署完成。容器 '$CONTAINER_NAME' 正在运行。"

```

-   变量：添加 `ALIYUN_DOCKER_PASSWORD` 配置对应容器仓库密码，如果有添加其他环境变量。
-   部署策略：默认 [Pipeline.yaml](https://alist.aikrai.xyz/guest/guest-local/)

### 任务插件 - 添加插件

**CodeUp 支持以下通知方式：**

-   钉钉机器人
-   邮件
-   Webhook
-   企业微信机器人
-   飞书机器人

**微信通知推送平台：**

-   [WxPusher 微信推送服务](https://wxpusher.zjiecode.com/docs/)
-   [Server 酱](https://sct.ftqq.com/)

**我自己写的 Webhook API：**

-   [Server酱 Python 脚本](https://github.com/AiKrai001/serverchan-pipeline.git)
