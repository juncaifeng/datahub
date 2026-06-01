# DataHub Code Wiki

## 1. 项目概览 (Project Overview)
[DataHub](https://datahub.com) 是一个由 LinkedIn 开源的企业级元数据管理平台和 AI 数据目录（AI Data Catalog）。它提供了整个数据生态系统的发现、治理和可观测性能力。DataHub 采用推/拉（Push/Pull）结合的摄取架构，支持实时元数据流更新（Streaming-First），并且拥有高度可扩展的插件式模型。

---

## 2. 项目整体架构 (Overall Architecture)
DataHub 采用现代化的前后端分离与微服务架构，核心架构组件包括：
* **前端 (Frontend)**：基于 React 的单页应用（SPA），提供现代化的数据发现、血缘分析与治理看板。
* **代理/BFF层 (DataHub Frontend)**：基于 Play Framework 构建的中间层代理，负责身份验证、会话管理以及将 GraphQL 请求路由给后端 GMS。
* **后端核心服务 (GMS - Generalized Metadata Service)**：整个系统的核心大脑，负责元数据的 CRUD 操作、搜索索引构建、图关系更新以及权限控制。
* **存储层 (Storage Layer)**：
  * **关系型数据库 (MySQL/PostgreSQL)**：作为 Primary Store，存储元数据的真实记录（Aspects）。
  * **Elasticsearch / OpenSearch**：用于全文检索与复杂过滤（Search & Filter）。
  * **Kafka**：消息总线，处理实时元数据变更日志（MCL/MCP）的异步流式传输，保证各存储后端的最终一致性。
* **元数据摄取框架 (Metadata Ingestion)**：基于 Python 的模块化数据摄取框架，支持从 80+ 种异构数据源（如 Snowflake, BigQuery, Airflow, dbt 等）抓取元数据。

---

## 3. 主要模块职责 (Main Module Responsibilities)

* [**`datahub-web-react/`**](file:///workspace/datahub-web-react)
  前端 React 项目源码。包含实体渲染（`src/app/entity`）、数据血缘可视化（`src/app/lineage`）、搜索（`src/app/search`）以及与后端的 GraphQL 交互逻辑。
* [**`metadata-service/`**](file:///workspace/metadata-service)
  GMS（Generalized Metadata Service）后端源码（Java）。处理元数据读写、图数据库同步、搜索索引同步、鉴权（`auth-impl`）以及 Rest.li/GraphQL 接口实现。
* [**`metadata-ingestion/`**](file:///workspace/metadata-ingestion)
  Python 元数据摄取框架。包含核心的 `Pipeline` 引擎和各种 Source/Sink 连接器（在 `src/datahub/ingestion/` 中）。
* [**`datahub-frontend/`**](file:///workspace/datahub-frontend)
  前端代理服务，主要负责提供 Web 容器、处理 OIDC/SSO 登录以及代理 API 请求。
* [**`metadata-models/`**](file:///workspace/metadata-models)
  基于 Pegasus (PDL) 定义的元数据模型。声明了所有支持的 Entity（实体）、Aspect（切面属性）以及 Relationship（关系）。
* [**`docker/`**](file:///workspace/docker)
  包含本地开发、快速启动和各项基础设施（Kafka, MySQL, ES）的 Docker Compose 配置文件。
* [**`docs/`**](file:///workspace/docs) & [**`docs-website/`**](file:///workspace/docs-website)
  项目官方文档，基于 Docusaurus 构建的文档站点。

---

## 4. 关键类与核心概念说明 (Key Classes & Concepts)

### 4.1 核心数据模型概念
* **Entity (实体)**：数据栈中的主要对象，如 Dataset（数据集）、Dashboard（看板）、DataJob（数据任务）等。
* **Aspect (切面)**：实体的具体属性分组。例如 Dataset 包含 `DatasetProperties`、`SchemaMetadata`、`Ownership` 等 Aspects。
* **URN (Uniform Resource Name)**：实体的唯一标识符，格式如 `urn:li:dataset:(urn:li:dataPlatform:snowflake,analytics.customer_profiles,PROD)`。

### 4.2 后端核心类 (Java)
* **[`EntityService`](file:///workspace/metadata-service/services/src/main/java/com/linkedin/metadata/entity/EntityService.java)**：GMS 的核心服务接口，负责执行所有元数据的写操作（如 `ingestAspect`）、读操作，并触发下游的 Kafka 变更事件（MetadataChangeLog）。
* **`GraphService`**：负责与图数据库/Elasticsearch 通信，维护实体之间的血缘（Lineage）与关联关系。
* **`SearchService`**：封装对 Elasticsearch 的调用，处理实体搜索和自动补全请求。
* **`DataHubGraphQLEngine`**：GraphQL API 的入口，负责将前端的查询解析并路由给具体的 DataFetcher。

### 4.3 摄取框架核心类 (Python)
* **`Source`** (`datahub.ingestion.api.source`)：所有数据源提取器的基类接口，通过 `get_workunits()` 生成包含元数据的 WorkUnit（工作单元）。
* **`Sink`** (`datahub.ingestion.api.sink`)：元数据输出目的地的基类接口，如 `DatahubRestSink` 或 `DatahubKafkaSink`。
* **`Pipeline`** (`datahub.ingestion.run.pipeline`)：连接 Source 和 Sink 的执行引擎，负责配置解析、运行调度和状态报告。

### 4.4 前端核心组件 (React)
* **`EntityRegistry`** (`datahub-web-react/src/app/entity/EntityRegistry.tsx`)：前端的实体注册表。通过它可以动态注册和扩展新的实体类型，使其具备统一的页面路由、图标、搜索及渲染逻辑。
* **`LineageExplorer`**：数据血缘探索器组件，负责渲染基于层级的交互式数据流向图。

---

## 5. 技术栈与依赖关系 (Tech Stack & Dependencies)

### 后端与基础设施
* **语言**：Java 11/17
* **框架**：Spring Boot, Play Framework, Rest.li (LinkedIn 开源的 REST 框架)
* **构建工具**：Gradle
* **基础设施**：MySQL/MariaDB/PostgreSQL (关系型存储)、Elasticsearch/OpenSearch (搜索与图存储)、Kafka (事件总线)。

### 前端
* **语言**：TypeScript
* **框架**：React, Apollo GraphQL, Vite / Webpack
* **包管理**：Yarn

### 数据摄取
* **语言**：Python 3.8+
* **核心依赖**：Pydantic (配置校验), SQLAlchemy (数据库提取), 各种云厂商和数据库的 SDK（如 boto3, google-cloud-bigquery 等）。
* **包管理**：pip, uv

---

## 6. 项目运行方式 (How to Run)

### 6.1 快速体验 (Docker Quickstart)
依赖 Docker Desktop（分配 8GB+ RAM），使用 DataHub CLI 可以一键启动完整的技术栈：
```bash
# 安装 DataHub CLI
pip install acryl-datahub

# 启动本地 Docker 实例 (包含所有服务与基础组件)
datahub docker quickstart
```
启动后访问 `http://localhost:9002` (默认账密: datahub / datahub)。

### 6.2 本地源码开发模式 (Local Development)
针对贡献者和二次开发，可直接使用项目提供的开发脚本启动：
```bash
# 1. 初始化开发环境
./scripts/dev/datahub-dev.sh setup

# 2. 构建并启动后端与依赖服务
./scripts/dev/datahub-dev.sh start

# 3. 运行前端 (独立终端)
cd datahub-web-react
yarn start
```

### 6.3 运行元数据摄取 (Running Ingestion)
通过编写 `recipe.yml` 配置摄取任务，并使用 CLI 执行：
```bash
datahub ingest -c recipe.yml
```
