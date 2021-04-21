---
title: How to write SPEC file
date: '2020/12/31 23:59'
tags:
 - baisc
 - Encrypted
categories:
 - 个人项目
abbrlink: 13009
cover: 
---
# How to write SPEC file

SPEC file is the rule to package a RPM build, compile files in source code(subsystem) and generates a file hierarchy and select them to package. 

the Makefile and configure file will generate the needed bin/files and put them into a build hierarchy .

like:

```
scriptdir=$(libexecdir)/$(NAME)/scripts/ → here xxxdir like scriptdir is the package dir , now it's $(libexecdir) xxx
script_SCRIPTS=\  → xxx SCRIPTS is the scripts that will put into the package dir after makefile exectued.
$(top_srcdir)/conf/mkdir_for_swmdaemon.sh \  → these are the file path under source code subsystem
$(top_srcdir)/plugin/remove_release_json.sh \  → so after makefile compile these files will put into $(libexecdir)/$(NAME)/scripts/
$(top_srcdir)/plugin/swm_wait_vnf_ready.sh
```

the SPEC file will selected the generated files and package them in %files filed.

%files
%{_libexecdir}/* → selected all files (after compile makefile) under {_libexecdir}/ , like about 3 files, we can see as

\# rpm -qlv swmdaemon-9999.8bf34939_f5ec347c-1.wf32.1614301476.x86_64

-rwxr-xr-x 1 root root 1570 Feb 26 09:04 /usr/libexec/swmdaemon/scripts/mkdir_for_swmdaemon.sh
-rwxr-xr-x 1 root root 239 Feb 26 09:04 /usr/libexec/swmdaemon/scripts/remove_release_json.sh
-rwxr-xr-x 1 root root 672 Feb 26 09:04 /usr/libexec/swmdaemon/scripts/swm_wait_vnf_ready.sh

this %{_libexecdir}/ is /usr/libexec, can see in bellow link

https://docs.fedoraproject.org/en-US/packaging-guidelines/RPMMacros/

one SPEC file by default will generate one base RPM like it's name, if need more RPMs ,need to add in %package.



https://rpm-packaging-guide.github.io/



ExcludeArch: aarch64  → only x86
%global debug_package %{nil}  → no debug RPM (used in some script subsystem like python ,shell)

Requires: %{name}-sudoers%{?_isa} = %{version}-%{release} → use the macro like %{name} %{?_isa} = %{version}-%{release}
Requires: %{name}-AAA%{?_isa} = %{version}-%{release} 

%package sudoers   → sub RPMs  <Name>-sudoer
Summary: Sudo for %{name}
Requires: sudo     → sub RPMs require RPM



%post systemd  → after install 'systemd' RPM will execute bellow command (script)
%systemd_post swm-server.service swm-server-proxy.service swm-rest-framework.target swmdaemon-conf.service

→%systemd_post is the macro can see the script by bellow command 

'/usr/bin/systemctl --no-reload preset' this is the %systemd_post

swmdaemonIntegration-systemd-92dbdae-71460f8.wf32.x86_64.rpm
[d13li@conde x86_64]$ rpm -q --scripts swmdaemonIntegration-systemd-92dbdae-71460f8.wf32.x86_64.rpm
postinstall scriptlet (using /bin/sh):if [ $1 -eq 1 ] && [ -x /usr/bin/systemctl ]; then
\# Initial installation
/usr/bin/systemctl --no-reload preset swm-server.service swm-server-proxy.service swm-rest-framework.target swmdaemon-conf.service || :
fi
preuninstall scriptlet (using /bin/sh):


if [ $1 -eq 0 ] && [ -x /usr/bin/systemctl ]; then
\# Package removal, not upgrade
/usr/bin/systemctl --no-reload disable --now swm-server.service swm-server-proxy.service swm-rest-framework.target swmdaemon-conf.service || :
fi
postuninstall program: /bin/sh
[d13li@conde x86_64]$ pwd
/home/d13li/workbench/swmdaemonIntegration/RPMS/x86_64



%files sudoers
%attr(0440, root, root) %{_sysconfdir}/sudoers.d/swmdaemon_sudoers → %attr will add file into package and set the attribute.



subsystem's can in cyclic dependency like in "BuildRequires:" file

There is one issue for swmdaemon.spec, swmdaemon depends on apigw and apigw depends on swmdaemon, need to solve it.

Either swmdaemon or api-gateway-framework (or both) must be divided to two separate subsystems:

Core subsystem, which doesn't depend on anything Plugin or integration subsystem, which depends on the core subsystem and swmdaemon or api-gateway-framework



a file in which RPM we can check in ENV like:

\# rpm -qf /var/api-gateway-framework/upstream-apis/
api-gateway-framework-rcp-integration-1.44.0-1.wf32.x86_64

in ENV check RPM can use

rpm -qa | grep xxx



.pc file will provide the lib path used marco to other user, that if the path change don't impact user.

like

[swmdaemonplugin.pc.in](http://swmdaemonplugin.pc.in/):

prefix=@prefix@
exec_prefix=@exec_prefix@
libdir=@libdir@
swmplugindir=${libdir}/swm.d/plugins  → this swmplugindir will use by CertMan etc. , CertMan can put it's plungin inder this folder.

​                                 → so CertMan will need to `BuildRequires: pkgconfig(swmdaemonplugin)`
Name: swmdaemonplugin
Description: Plugin of blue green upgrade SWM daemon
URL: @PACKAGE_URL@
Version: @PACKAGE_VERSION@

https://en.wikipedia.org/wiki/Pkg-config

**pkg-config** is a computer program that defines and supports a unified interface for querying installed [libraries](https://en.wikipedia.org/wiki/Library_(computer_science)) for the purpose of [compiling](https://en.wikipedia.org/wiki/Compiler) software that depends on them. It allows programmers and installation scripts to work without explicit knowledge of detailed library path information. pkg-config was originally designed for [Linux](https://en.wikipedia.org/wiki/Linux), but it is now also available for [BSD](https://en.wikipedia.org/wiki/Berkeley_Software_Distribution), [Microsoft Windows](https://en.wikipedia.org/wiki/Microsoft_Windows), [macOS](https://en.wikipedia.org/wiki/MacOS), and [Solaris](https://en.wikipedia.org/wiki/Solaris_(operating_system)).



RPMs are started by kickstarts like, kickstarts start swmdaemonIntegration firstly, swmdaemonIntegration requries swmdaemon, so it will start swmdaemon later , etc.

Tang Shijun is response for rcp-kickstarts.

[Add swmdaemonintegration for CU Cloud build (!83) · Merge Requests · RCP / rcp-kickstarts · GitLab (nokia.com)](https://gitlabe1.ext.net.nokia.com/RCP/rcp-kickstarts/-/merge_requests/83)