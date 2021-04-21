---
title: Jenkinsfile introduce
date: '2020/12/31 23:59'
tags:
 - jenkins
categories:
 - 个人项目
abbrlink: 12007
cover: 
---
# Jenkinsfile introduce

## Jenkinsfile 基本语法

### Defining a Pipeline

Jenkins Pipeline is a suite of plugins that supports implementing and integrating continuous delivery pipelines into Jenkins. 

A Pipeline can be created in one of the following ways:

- [Through Blue Ocean](https://jenkins.io/doc/book/pipeline/getting-started/#through-blue-ocean) - after setting up a Pipeline project in Blue Ocean, the Blue Ocean UI helps you write your Pipeline’s `Jenkinsfile` and commit it to source control.
- [Through the classic UI](https://jenkins.io/doc/book/pipeline/getting-started/#through-the-classic-ui) - you can enter a basic Pipeline directly in Jenkins through the classic UI.
- [In SCM](https://jenkins.io/doc/book/pipeline/getting-started/#defining-a-pipeline-in-scm) - you can write a `Jenkinsfile` manually, which you can commit to your project’s source control repository.

### Using Environmental Variables

Environment variables can be set globally or per stage.

Setting environment variables per stage means they will only apply to the stage in which they’re defined.

```Jenkins
// setting environment variables globally
pipeline {
 environment {
 BUILD_NUMBER="${Calendar.getInstance()format('yyyyMMddHHmmssSSS')}"
 BUILD_ID = "${env.BUILD_NUMBER}"
 }
}
```

### Agent

In declarative pipelines the **agent** directive is used for specifying which agent/slave the job/task is to be executed on. This directive only allows you to specify where the task can be executed (On which agent, slave, label or docker image)

```
agent { kubernetes { label 'my-defined-label' inheritFrom 'my-defined-build' containerTemplate { name 'build-name' image 'my-docker-image:latest' workingDir 'my/working/dir' } } }
```

### Parameters

The parameters directive provides a list of parameters which a user should provide when triggering the Pipeline. The values for these user-specified parameters are made available to Pipeline steps via the '`params'` object.

```Jenkins
String parameter:
parameters {
 string(name: 'DEPLOY_ENV', defaultValue: 'staging', description: '')
}
Boolean parameter:
parameters {
 booleanParam(name: 'DEBUG_BUILD', defaultValue: true, description: '')
}
Choice parameter:
parameters {
 choice(name:'OPTIONS', description:'Select an option', choices:'Option1\nOption2\nOption3')
}
```

### Gerrit Triggers

This plugin integrates Jenkins to Gerrit code review for triggering builds when a "patch set" is created.

<u>**Trigger configuration in pipeline job:**</u>

In the "Build Triggers" section of your Job configuration page; tick "Gerrit event"

Specify what type of event(s) to trigger on:

- **Draft Published:** Sent when a change moves from draft state to new. (only available in version 2.5 or higher of Gerrit).
- **Patchset Created:** Sent when a new patchset arrives on a change. Before version 2.6.0, this was the only event you could trigger on.
- **Change Merged:** Sent when a change is merged on the Gerrit server.
- **Comment Added:** Sent when a comment is added to a change. Which category and value to trigger on can be configured. The available categories can be configured in the server settings for the plugin.
- **Ref Updated:** Sent when a ref is updated on the Gerrit server, i.e. someone pushes past code review.

{% asset_img image-20200729094356824.png %}

<img src="Jenkinsfile%20introduce/image-20200729094356824.png" alt="image-20200729094356824" style="zoom: 67%;" />

<u>**Trigger configuration in Jenkinsfile:**</u>

Jenkinsfile will overwrite the configuration done in pipeline job. 

```
triggers {
 gerrit(
   customUrl: '',
   gerritProjects: [[
     branches: [[
      compareType: 'PLAIN',
      pattern: 'master'
     ]],
    compareType: 'PLAIN',
    disableStrictForbiddenFileVerification: false,
    pattern: 'repo-name'
   ]],
   serverName: 'user-name',
   triggerOnEvents: [
     changeMerged(),
     patchsetCreated(
       excludeDrafts: true,
       excludeNoCodeChange: false,
       excludeTrivialRebase: false
     ),
     commentAdded(
       verdictCategory: 'Code-Review',
       commentAddedTriggerApprovalValue: '+2'
     )
   ]
  )
}
```

## Jenkinsfile simple

### @Library

```Jenkins
@Library(['scm@<pipeline-utils branch or tag>']) _
```

Example:

```Jenkins
@Library(['scm@container-stable-2.x', 'commonLibs@0.0.3']) _
```

### extraOnboardingImages

List containing the extra images that need to onboard to Open Edge server. 

列出包含需要附加到Open Edge服务器的其他图像的列表。

Example:

```Jenkins
Map containers = [
    DockerImage: [
        name: 'fhproxy/docker-fhproxy',
        buildName: 'fhproxy',
        testNames: ['Test fhproxy container mvp','Test fhproxy container l3 call'],
        published: true,
        type: 'runtime'
    ],
    DockerTestImage: [
        name: 'fhproxy/docker-fhproxy-test',
        buildName: 'fhproxy',
        testNames: ['Test fhproxy container mvp','Test fhproxy container l3 call'],
        published: true,
        type: 'runtime'
    ],
    NwInitImage: [
        name: "fhproxy/docker-nwinit",
        buildName: 'Onboarding',
        testNames: ['Test fhproxy container mvp','Test fhproxy container l3 call'],
        published: false
    ],
    NwMgmtImage: [
        name: "fhproxy/docker-nwmgmt",
        buildName: 'Onboarding',
        testNames: ['Test fhproxy container mvp','Test fhproxy container l3 call'],
        published: false
    ]
]
```

### tersyParams

> platform: <b>Optional arguments</b>

String containing platform type of NESC node.  包含NESC节点的平台类型的字符串

Possible values:

- any
- TPI3-like
- NCIR-like

Default value: NCIR-like

When test is executed in real HW [tersyParams](#tersyparams) will define which kind of environment is selected

在实际硬件中执行测试时，tersyParams将定义选择哪种环境

Map containing information that is used for test environment reservation from Tersy. 

映射包含用于从Tersy保留测试环境的信息。

Duration and pool or tenant attributes in tersyParams are mandatory if RUN_ON_HW is set to true. 

如果将**RUN_ON_HW**设置为true，则tersyParams中的**duration**和**pool**或**tenant**属性是必需的。

Other attributes are optional.

Tersy parameters:

For details on supported parameters see documentation of [tersycli create](https://pypi.dynamic.nsn-net.net/rcp/prod/tersycli/latest/+doc/CLI.html#create) command.

有关支持的参数的详细信息，请参见tersycli create命令的文档。

Only long format of the named arguments are supported, use for example 'duration' instead of 'd'. 

Note that '**reservation_name**' is not needed as it is automatically set to Jenkins job name. 

Default value of **queue_timeout** parameter is 1 hour if priority is given. 

Default value of **env_type** is CAAS. 

Additionally a specific tersycli version can be requested with `tersycliVersion`, 2.3.5 is used by default.

仅支持长格式的命名参数，例如使用“duration”代替“ d”。

```Jenkins
Map tersyParamsMvp = [    
    pool: "CAAS_test",
    priority: "3",
    duration: "1",
    queue_timeout: "6",
    tag: "NIC=Intel-XXV710",
    platform: "NCIR19"
]

Map tersyParams = [
    pool: "CAAS_Host_VLAN",
    priority: "3",
    duration: "1",
    queue_timeout: "6",
    tag: "NIC=Intel-XXV710",
    platform: "NCIR19"
]
```

### builds

```Jenkins
List builds = [
    [
        name: 'fhproxy',
        agent: 'docker_helmci',
        command: 'ci/docker-build'
    ],
    [
        name: 'Onboarding',
        agent: 'docker_helmci',
        command: 'ci/get-onboarding-images'
    ]
]
```

### agent

> agent: <b>Optional arguments</b>

Jenkins agent where the test is executed. 执行测试的Jenkins代理。

Some possible values are:

- `single-node-container-k8s-dpdk`  for 8 core [cloud-development](https://gitlabe2.ext.net.nokia.com/cloud-tools/cloud-development/) environment with dpdk support
- `single-node-pod-k8s-dpdk`  for 16 core [cloud-development](https://gitlabe2.ext.net.nokia.com/cloud-tools/cloud-development/) environment with dpdk support
- `multi-node-pod-k8s-dpdk`  for 1+1 node, 13 core each, [container-infra-system](https://gitlabe2.ext.net.nokia.com/cloud-tools/container-infra-system) environment with dpdk support
- TODO: IT kubernetes cluster agent

Default value for the parameter is `single-node-container-k8s-dpdk`

> cleanCommand: <b>Optional arguments</b>

Optional shell command to run before and after test to clean up resources. 

在测试之前和之后运行的可选shell命令，以清理资源。

要注意的是，pipeline检测v2和v3的Helm命令，并将它们分别暴露为环境变量$ {HELM2}和$ {HELM3}。因此最好在shell脚本中使用这些变量，以避免在'helm'命令更改为指向helm3而不是旧的helm2时更改脚本。

> helmName:  <b>Mandatory arguments</b>

Name of the helm chart to be tested and published. Helm chart will be cloned to a directory with this name regardless what the repository name is. All scripts are executed in this directory.

要测试和发布的helm chart的名称, 无论存储库名称是什么，Helm chart都会被克隆到具有该名称的目录中。所有脚本都在此目录中执行。

To allow for more than one pipeline to be executed for same helm chart, pipeline appends automatically Jenkins build id and branch name to the helm name defined in the [env_vars file]().

为了允许对同一helm chart执行多个管道，管道会自动将Jenkins构建ID和分支名称附加到env_vars文件中定义的helm名称。

> deployCommand: <b>Optional arguments</b>

Optional shell command to deploy the helm chart. Default value is `ci/deploy.sh`

可选的shell命令，用于部署helm chart。默认值为ci / deploy.sh， 应该是这里的command

> testCommand: <b>Optional arguments</b>

Optional shell command to deploy the helm chart. Default value is `ci/test.sh`

可选的shell命令，用于部署helm chart。默认值为ci / test.sh

> logsCommand: <b>Optional arguments</b>

Optional shell command to run at the end of the pipeline to collect logs. Default value is `gather-artifacts.sh` Will be executed always even if deploy or test fails. To ensure that all logs are collected make sure that the command handles error cases correctly.

可选的shell命令在pipeline末端运行以收集日志。失败后的log收集，为确保收集所有日志，请确保该命令正确处理错误情况。

If using `bash` script you can use `+e` flag to ignore errors:

如果使用bash脚本，则可以使用+ e标志忽略错误： `#!/bin/bash +e`

```Jenkins
List tests = [
    [
        name: 'Test fhproxy container mvp',
		runOnOpenEdge: true,
		tersyParams: tersyParamsMvp,
		helmName: 'fhproxy',
        agent: 'single-node-container-k8s-dpdk',
        prepareCommand: 'ci/prepare mvp_logs',
        command: 'ci/docker-test mvp_logs',
        logsCommand: 'ci/helm-log.sh mvp_logs',
        cleanCommand: 'ci/helm-delete.sh mvp_logs',
        artifacts: 'mvp_logs/*',
        addSkipParam: true,
        timeout: '30'
    ],
    [
        name: 'Test fhproxy container l3 call',
        runOnOpenEdge: true,
        tersyParams: tersyParams,
        helmName: 'fhproxy',
        agent: 'single-node-container-k8s-dpdk',
        prepareCommand: 'ci/prepare l3_call_logs',
        command: 'ci/docker-test l3_call_logs',
        logsCommand: 'ci/helm-log.sh l3_call_logs',
        cleanCommand: 'ci/helm-delete.sh l3_call_logs',
        artifacts: 'l3_call_logs/*',
        addSkipParam: true,
        timeout: '30'
    ]
]
```

### jobParams

```Jenkins
List jobParams =  [
    [
        name: 'CASE_TAG',
        description: '--test RCP_TRH_FHP_001*; -s FHP_first_temp_test_case; --include owner-XXX; --exclude not-ready;',
        defaultValue: '',
        type: 'string'
    ],
    [
        name: 'UP_HELM_BRANCH',
        description: "This parameter is the branch of rcp-pod-up helm. 'master' are set by default.",
        defaultValue: 'master',
        type: 'string'
    ],
    [
        name: 'MN_HELM_BRANCH',
        description: "This parameter is the branch of rcp-pod-mn helm. 'master' are set by default.",
        defaultValue: 'master',
        type: 'string'
    ]
]
```

### Notification Recipients

Specifies if email or office365 (yammer/teams) notification should be sent. By default no notifications are sent.

For each of the notification type define a Map which has [webhookUrl](#webhookurl) and/or [emailAddresses](#emailaddresses) defined.

An example where all the notifications are sent:

> notifyMainBranchFailure: <b>Optional arguments</b>

Set to receive notifications when pipeline failed on the branch defined by [mainBranch](). Do not define to not receive these notifications.

设置为在mainBranch定义的分支上的pipeline 发生故障时接收通知。别定义为不接收这些通知。

> notifyTagSuccess: <b>Optional arguments</b>

Set to receive notifications of successful publishing of helm chart. Do not define to not receive these notifications.

> notifyTagFailure: <b>Optional arguments</b>

Set to receive information when pipeline failed when helm chart was tried to be published. Do not define to not receive these notifications.

> webhookUrl: <b>Optional arguments</b>

Provide the webhook from yammer or teams to get notifications sent there. In yammer you can add Jenkins app from the "Add or Remove Apps" link. In teams this is done via the "Connectors" link for the channel.

> emailAddresses: <b>Optional arguments</b>

Comma separated list of email addresses to sent notifications to.

```Jenkins
Map defaultNotificationRecipients = [
    webhookUrl: 'https://outlook.office.com/webhook/1aace586-e82a-49e8-8031-1d5686283369@5d471751-9675-428d-917b-70f44f9630b0/JenkinsCI/a4f01ac738d74f35a2f9d8c5407fb860/64e29d73-1461-434c-9aa1-3c353689ffd6',
    emailAddresses: 'I_NSB_MN_CRAN_RD_CF_RCPTRS_SQUAD_TOUCHDOWN@internal.nsn.com'
]
```

```Jenkins
Map notifications = [
    notifyMainBranchFailure: defaultNotificationRecipients,
    notifyMainBranchSuccess: defaultNotificationRecipients,
    notifyTagSuccess: defaultNotificationRecipients,
    notifyTagFailure: defaultNotificationRecipients
]
```

### containerPipeline

calling the pipeline from container Jenkinsfile:

> gitlabConnection:  <b>Mandatory arguments</b>

Tells Jenkins which gitlab connection to use when reporting. Valid values are:

- 'IT gitlab' for gitlabe1.ext.net.nokia.com
- 'Gitlabe2' for gitlabe2.ext.net.nokia.com

> tagPublishRegexp: <b>Optional arguments</b>

By default all tags trigger image publishing if [publishTags](#publishtags) is set to `true`. With this argument it is possible to filter which tags are published. The format is regular expression. Some examples:

默认情况下，如果publishTags设置为true，则所有标签都会触发图像发布。使用此参数，可以过滤发布哪些标签。格式为正则表达式。

- `^\\d+\\.\\d+\\.\\d+$` would match only semVer formatted tags e.g. 1.2.0  --将仅匹配semVer格式的标签，例如1.2.0
- `^release-.*` would match only tags which start with release- prefix  --将仅匹配以release-前缀开头的标签
- `^\\d+\\.\\d+\\.\\d+([-_]hb)?$` when publishing for Heart Beat build  --在发布Heart Beat版本时

```Jenkins
containerPipeline   containers: containers,
                    jobParams: jobParams,
                    gitlabConnection: 'Gitlabe2',
                    builds: builds,
                    tests: tests,
                    tagPublishRegexp: '^\\d+\\.\\d+\\.\\d+.*',
                    relNoteCategory: 'ContainerImages',
                    configFile: 'config',
                    notifications: notifications
```

### Set environment variables

Some environment variables name and value are printed to ./env_vars file. Scripts like config.deployCommand, config.testCommand, config.cleanCommand can source env_vars file and use the listed env variables.

一些环境变量的名称和值会打印到./env_vars文件中。诸如config.deployCommand，config.testCommand，config.cleanCommand之类的脚本可以获取env_vars文件并使用列出的env变量。

Example env_vars:

```verilog
17:59:24  + cat env_vars
17:59:24  HELM_NAME="fhproxy-10-change-the-rpm-name-of-testca"
17:59:24  NAMESPACE="cran2"
17:59:24  TARGET_FILE="OE19-TT-O5-AIO-1_cran2.yaml"
17:59:24  RUN_ON_OPEN_EDGE="true"
17:59:24  RUN_ON_HW="true"
17:59:24  PLATFORM="NCIR19"
17:59:24  WORKING_DIR="CONTAINER_PIPELINE_WORKDIR-fhproxy/fhproxy"
17:59:24  K8S_NODE_HOST_IP="192.168.81.26"
17:59:24  BUILD_ID="10"
17:59:24  BRANCH_NAME="Change_the_rpm_name_of_testcase"
17:59:24  BUILDING_TAG="null"
17:59:24  PUBLISHING_TAG="null"
17:59:24  DockerImage="registry.kube-system.svc.nokia.net:5555/fhproxy/docker-fhproxy:0.0.0-78-g80c0c0f_21595482723715_10"
17:59:24  DockerTestImage="registry.kube-system.svc.nokia.net:5555/fhproxy/docker-fhproxy-test:0.0.0-78-g80c0c0f_21595482723715_10"
17:59:24  NwInitImage="registry.kube-system.svc.nokia.net:5555/fhproxy/docker-nwinit:0.0.0-78-g80c0c0f_21595482723715_10"
17:59:24  NwMgmtImage="registry.kube-system.svc.nokia.net:5555/fhproxy/docker-nwmgmt:0.0.0-78-g80c0c0f_21595482723715_10"
17:59:24  CASE_TAG=""
17:59:24  UP_HELM_BRANCH="master"
17:59:24  MN_HELM_BRANCH="master"
```

**RUN_ON_OPEN_EDGE** env variable is deprecated. Scripts should be changed to use RUN_ON_HW instead of RUN_ON_OPEN_EDGE.

不赞成使用RUN_ON_OPEN_EDGE环境变量。应将脚本更改为使用RUN_ON_HW而不是RUN_ON_OPEN_EDGE。

**BUILD_ID** is the Jenkins job build number. This and **BRANCH_NAME** are also appended to the **HELM_NAME** variable so that it does not conflict with other pipelines running tests for the same helm chart. `The name is limited to 40 characters.` This allows container developers to add possible pre- and postfixes, but the name should not exceed the maximum allowed for helm release name (53 characters).

BUILD_ID变量和BRANCH_NAME也附加到HELM_NAME变量中，以使其与运行针对同一helm chart的测试中的其他pipelines不冲突。

### 3. 参考链接

https://gitlabe1.ext.net.nokia.com/RCP/pipeline-utils/blob/pkg-mgmt-pipes/vars/helmChartPipeline.md#products

https://www.w3cschool.cn/jenkins/jenkins-jg9528pb.html

https://confluence.int.net.nokia.com/display/MPP/Jenkinsfile+Template

https://www.jenkins.io/zh/doc/book/pipeline/jenkinsfile/