---
title: Helm Introduction
date: '2020/12/31 23:59'
tags:
 - helm
categories:
 - 个人项目
abbrlink: 12008
cover: 
---
# Helm Introduction

### 1. Chart的结构

#### 1.1. 什么是chart

Helm uses a packaging format called charts. A chart is a collection of files that describe a related set of Kubernetes resources.

Charts are created as files laid out in a particular directory tree, then they can be packaged into versioned archives to be deployed.

#### 1.2 chart的目录结构

```yaml
wordpress/
  Chart.yaml            # A YAML file containing information about the chart -包含chart信息的YAML文件
  LICENSE               # OPTIONAL: A plain text file containing the license for the chart
  README.md             # OPTIONAL: A human-readable README file
  requirements.yaml     # OPTIONAL: A YAML file listing dependencies for the chart  -列出chart依赖关系的YAML文件
  values.yaml           # The default configuration values for this chart  -chart的默认配置值
  charts/               # A directory containing any charts upon which this chart depends.  -包含chart所依赖的所有chart的目录
  templates/            # A directory of templates that, when combined with values,  -模板目录，生成有效的k8s清单文件
                        # will generate valid Kubernetes manifest files.
  templates/NOTES.txt   # OPTIONAL: A plain text file containing short usage notes
```

#### 1.3 chart.yaml文件

```yaml
apiVersion: The chart API version, always "v1" (required)
name: The name of the chart (required)
version: A SemVer 2 version (required)
kubeVersion: A SemVer range of compatible Kubernetes versions (optional)
description: A single-sentence description of this project (optional)
keywords:
  - A list of keywords about this project (optional)
home: The URL of this project's home page (optional)
sources:
  - A list of URLs to source code for this project (optional)
maintainers: # (optional)
  - name: The maintainer's name (required for each maintainer)
    email: The maintainer's email (optional for each maintainer)
    url: A URL for the maintainer (optional for each maintainer)
engine: gotpl # The name of the template engine (optional, defaults to gotpl)
icon: A URL to an SVG or PNG image to be used as an icon (optional).
appVersion: The version of the app that this contains (optional). This needn't be SemVer.
deprecated: Whether this chart is deprecated (optional, boolean)
tillerVersion: The version of Tiller that this chart requires. This should be expressed as a SemVer 
```

一个例子：

```yaml
apiVersion: v1
appVersion: "1.0"   #这是指定应用程序版本的一种方式
description: A Helm chart for Kubernetes
name: up
version: 1.5.0
```

> 1)    Every chart must have a **version number**. A version must follow the [SemVer 2](http://semver.org/) standard. Unlike Helm Classic, Kubernetes Helm uses version numbers as release markers. Packages in repositories are identified by name plus version.
>
> 2)    Note that the **appVersion** field is not related to the version field. It is a way of specifying the version of the application.
>
> 3)    When managing charts in a Chart Repository, it is sometimes necessary to deprecate a chart. The optional deprecated field in Chart.yaml can be used to mark a chart as deprecated. If the latest version of a chart in the repository is marked as deprecated, then the chart as a whole is considered to be deprecated.

#### 1.4 requirements.yaml

These dependencies can be dynamically linked through the requirements.yaml file or brought in to the charts/directory and managed manually. 

依赖关系可以通过requirements.yaml文件动态链接，也可以引入charts/directory并手动进行管理

And the preferred method of declaring dependencies is by using a requirements.yaml file inside of your chart.

声明依赖关系的首选方法是使用图表内部的requirements.yaml文件。

一个例子：

```yaml
dependencies:
  - name: apache
    version: 1.2.3
    repository: http://example.com/charts
  - name: mysql
    version: 3.2.1
    repository: http://another.example.com/charts
 
    condition: subchart1.enabled, global. subchart1.enabled
    tags:
      - front-end
      - subchart1
```

* The **name** field is the name of the chart you want. 

* The **version** field is the version of the chart you want.

    > Where possible, use version ranges instead of an exact version. 

    * Example of a patch-level version match:

        version: ~1.2.3

        This will match version 1.2.3 and any patches to that release. In other words, ~1.2.3 is equivalent to >= 1.2.3, < 1.3.0

    * Example of a minor-level version match:

        version: ^1.2.0

        This will match version 1.2.0 and any minor version increments from it. In other words, ~1.2.0 is equivalent to >= 1.2.0, < 2.0.0

> ​	More information available at https://v2.helm.sh/docs/chart_best_practices/#requirements-files

* The **repository** field is the full URL to the chart repository. Note that you must also use helm repo add to add that repo locally. It’s a **mandatory** field.

* **condition** - The condition field holds one or more YAML paths (delimited by commas). 条件字段包含一个或多个YAML路径（以逗号分隔）。

    If this path exists in the top parent’s values and resolves to a Boolean value, the chart will be enabled or disabled based on that Boolean value. 

    Only the first valid path found in the list is evaluated and if no paths exist then the condition has no effect.

    如果此路径存在于父级的最高值中并且解析为布尔值，则将基于该布尔值启用或禁用图表。
    仅评估列表中找到的第一个有效路径，如果不存在路径，则该条件无效

* **tags** - The tags field is a YAML list of labels to associate with this chart.  标签字段是与该图表关联的YAML标签列表。

    In the top parent’s values, all charts with tags can be enabled or disabled by specifying the tag and a Boolean value.

    在最高父级的值中，可以通过指定标签和布尔值来启用或禁用所有带有标签的图表。

> •    Conditions (when set in values) always override tags.   <!--这个怎么理解-->？
>
> •    The first condition path that exists wins and subsequent ones for that chart are ignored. 
>
> •    Tags are evaluated as ‘if any of the chart’s tags are true then enable the chart’.
>
> •    Tags and conditions values must be set in the top parent’s values. 标签和条件值必须设置在父级的最高值中。
>
> •    The tags: key in values must be a top level key. Global and nested tags: tables are not currently supported.

Once you have a dependencies file, you can run *helm dependency update* and it will use your dependency file to download all the specified charts into your charts/ directory for you.

#### 1.5 Template file

All template files are stored in a chart’s templates/ folder. When Helm renders the charts, it will pass every file in that directory through the template engine. 通过模板引擎传递该目录中的每个文件。

Values for the templates are supplied two ways:

* Chart developers may supply a file called values.yaml inside of a chart. This file can contain **default values**.

* Chart users may supply a YAML file that contains values. This can be provided on the command line with helm install.

When a user supplies custom values, these values will override the values in the chart’s **values.yaml** file.

当用户提供自定义值时，这些值将覆盖图表的values.yaml 文件中的值。

Below is an example template files for a Kubernetes replication controller:

```yaml
apiVersion: v1
kind: ReplicationController
metadata:
  name: deis-database
  namespace: deis
  labels:
    app.kubernetes.io/managed-by: deis
spec:
  replicas: 1
  selector:
    app.kubernetes.io/name: deis-database
  template:
    metadata:
      labels:
        app.kubernetes.io/name: deis-database
    spec:
      serviceAccount: deis-database
      containers:
        - name: deis-database
          image: {{.Values.imageRegistry}}/postgres:{{.Values.dockerTag}}
          imagePullPolicy: {{.Values.pullPolicy}}
          ports:
            - containerPort: 5432
          env:
            - name: DATABASE_STORAGE
              value: {{default "minio" .Values.storage}}

```

It can use the following four template values (usually defined in a values.yaml file):

* **imageRegistry**: The source registry for the Docker image.

* **dockerTag**: The tag for the docker image.

* **pullPolicy**: The Kubernetes pull policy.

* **storage**: The storage backend, whose default is set to "minio"

All of these values are defined by the template author. Helm does not require or dictate parameters.