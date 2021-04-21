---
title: SPEC file writing - Best Practices
date: '2020/12/31 23:59'
tags:
 - baisc
 - Encrypted
categories:
 - 个人项目
abbrlink: 13014
cover: 
---


# SPEC file writing - Best Practices

## Do not leave empty tags

Always fill "Summary", "description", etc tags. Never left things blank.
They will be displayed when queried using "rpm -qi <rpm>". 

## SPEC Directives values aligned to same column

It is easier to read SPEC files if values of directives are aligned to same column like this:

**sample spec**

```makefile
Name:           RUOAM-CommonLibrary
Version:        %{_version}
Release:        %{_release}
Summary:        Common library
Group:          Fronthaul Gateway
License:        Nokia License
URL:            https://bhgerrit.ext.net.nokia.com/scm_fhgw/RUOAM-CommonLibrary
AutoReqProv:    no
 
Requires:       container-logging-service-libs
 
%description
%{summary}
 
%package devel
Summary:        Development files for %{name}
Group:          Development/Libraries
Requires:       %{name}-libs%{?_isa} = %{version}-%{release}
```

## New lines

Separate each section with new lines but don't use new lines inside sections. Refer above spec file example.

## Using Macros

Wherever possible, try to use macros and do not hardcode any paths. 
Most commonly used macros

%{_prefix}    → /opt/nokia/
%{_libdir}     → /opt/nokia/lib64/
%{_includedir} → /opt/nokia/include/

## %install section

Try not to crate directories and copy files in %install section. It is ok to do it in un avoidable conditions, but the best place to do such things is Makefile.am

**Avoid this in spec file**

```
%install
...
mkdir -p %{buildroot}/opt/nokia/RUOAM-NetconfStartup/module_config_scripts/
mkdir -p %{buildroot}/opt/nokia/RUOAM-NetconfStartup/module_feature_configs/
mkdir -p %{buildroot}/opt/nokia/RUOAM-NetconfStartup/preconfiguration_scripts/
 
cp ../CPRIN/ODU/module_config_scripts/*.sh  %{buildroot}/opt/nokia/RUOAM-NetconfStartup/module_config_scripts/
cp ../CPRIN/ODU/module_config_scripts/*.py  %{buildroot}/opt/nokia/RUOAM-NetconfStartup/module_config_scripts/
cp ../CPRIN/ODU/module_feature_configs/01_base_modules.conf %{buildroot}/opt/nokia/RUOAM-NetconfStartup/module_feature_configs/
```



In [Makefile.am](http://makefile.am/), to specify the destination directory create variable ending with "dir" (for ex: yanginstalldir)
To copy existing script to the destination path, use "dist_<dir-variable-name>_SCRIPTS (for ex: dist_yanginstall_SCRIPTS)
To copy existing data/configuration file to the destination path, use "dist_<dir-variable-name>_SCRIPTS (for ex: dist_yanginit_DATA)
Similarly, if files are not available but are crated as part of 'make' from any input files (for ex ".in" files), then use "nodist" instead of "dist" (these are useful when doing "make dist")

These steps will make sure that the destination directory is created in build environment, and files are copied with correct permissions (based on SCRIPTS/DATA etc).
Then these paths has to be just specified in %files section to make them part of rpm.

**Do this in Makefile.am**

```
yanginstalldir=$(NETCONF_MODULE_CONFIG_DIR)
dist_yanginstall_SCRIPTS=$(top_srcdir)/scripts/install_default_user.py \
                         $(top_srcdir)/scripts/host_key.py
 
preconfigdir=$(NETCONF_PRE_CONFIG_DIR)
dist_preconfig_SCRIPTS=$(top_srcdir)/scripts/01_copy_usermgmt_persist_wrapper.py
 
usermgmtdir=/opt/nokia/RUOAM-UserManagement/
dist_usermgmt_SCRIPTS=$(top_srcdir)/scripts/usermgmt_persist_files.py
 
yanginitdir=$(NETCONF_YANG_DIR)
dist_yanginit_DATA=$(top_srcdir)/yang/o-ran-usermgmt.yang
```

## %files section

Files and directories included recursively.
Directories and files must not be listed multiple times in %files section. Having a directory in %files section automatically includes all files and directories recursively in that directory.

Never add test files in the main package. Create separate package for devel/test and install only when required.

## File attributes

In cases where the package builder cannot create the files to be packaged with the proper ownership and permissions, the %attr macro can be used to make things right.
File attributes should be set in %files section instead of %post section.

```
%attr(-, root, root) /var/%{name}/
%config(noreplace) %attr(0660, 1000, 1000) /var/%{name}/data
```

See, http://ftp.rpm.org/max-rpm/s1-rpm-anywhere-specifying-file-attributes.html

## Directory ownership

Each file should be owned by just a single RPM. One must not list directories owned by other packages in their file section. However, one must make sure to take ownership of those file that do belong to them.

## Adding Container only components

When adding container only components, never forget to specify *include_in_build* to *no* is rpm.spec file.

```
...
AutoReqProv:    no
 
%define include_in_build no
 
%description
...
```

## rpm macro check

With command 'rpm --showrc' , you can get list all available macros. For example , if you need to find what macro is pointing to /etc directory , you can run

```
# rpm --showrc | grep '\/etc'
-13: _sysconfdir %{_prefix}/etc
 
# Or opposite query
 
# rpm --eval %{_sysconfdir}
/usr/etc
```

## Additional useful tools

### *rpmspec*

rpmspec is useful for getting info from spec file, it parses the spec file and provides various data such as what RPMs will spec build etc. For example:

```
$ rpmspec -q fhgw/rpm.spec
warning: line 2: Possible unexpanded macro in: Version: %{_version}
warning: line 3: Possible unexpanded macro in: Release: %{_release}
warning: line 20: Possible unexpanded macro in: Requires: RUOAM-CommonLibrary-libs(x86-64) = %{_version}-%{_release}
RUOAM-CommonLibrary-%{_version}-%{_release}.x86_64
RUOAM-CommonLibrary-devel-%{_version}-%{_release}.x86_64
RUOAM-CommonLibrary-libs-%{_version}-%{_release}.x86_64
```

For more information see rpmspec man page with man rpmspec.