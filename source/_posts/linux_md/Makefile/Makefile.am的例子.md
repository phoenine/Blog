---
title: Makefile.am的例子
date: '2020/12/31 23:59'
tags:
 - baisc
categories:
 - 个人项目
abbrlink: 13011
cover: 
---
看看configure,ac的修改

```makefile
#===================================================================

AC_PREREQ([2.69])

#===================================================================

AC_INIT([trsapp], [1.0.0], [], [], [https://gerrite1.ext.net.nokia.com:443/scm_rcp/trsapp])

#===================================================================

AC_PROG_CC
AC_PROG_CXX
AC_PROG_YACC
AC_PROG_LEX
AC_PROG_LIBTOOL

#===================================================================

AC_CONFIG_MACRO_DIR([m4])

AC_SUBST([CPPFLAGS], ['-I. -I${srcdir}/../include -I${srcdir}/../inc -I${srcdir}/../src'])
AC_SUBST([CFLAGS], [ ])
AC_SUBST([CXXFLAGS], [ ])

AC_SUBST([pkgconfigdir], ['${prefix}/lib64/pkgconfig'])

AC_ARG_WITH([trsprovider-dir],
    AS_HELP_STRING(
        [--with-trsprovider-dir[=PATH]],
        [Deploy bash completion scripts in this directory.]),
        [trsinfoscriptdir=${with_trsprovider_dir}],
        [])
AC_SUBST([trsinfoscriptdir])

#AC_ARG_WITH(dpdk_prefix, [  --with-dpdk-prefix=PATH for installed DPDK], DPDK_PREFIX=$withval,DPDK_PREFIX=/usr)
AC_SUBST([DPDK_PREFIX], ['/usr/'])

#AC_ARG_WITH(fp_prefix, [  --with-fp-prefix=PATH for installed FP], FP_PREFIX=$withval,FP_PREFIX=/usr)
AC_SUBST([FP_PREFIX], ['/usr/'])

AC_SUBST([FASTPATH_LIB_DIR], ['${buildroot}/usr/lib/'])
AC_SUBST([FASTPATH_PLUGIN_DIR], ['${FASTPATH_LIB_DIR}/fastpath'])

AC_SUBST([FP_DIR], ['${FP_PREFIX}/include/fp'])
AC_SUBST([FP_CPPFLAGS], [' \
						-I${FP_DIR} \
						-I${FP_DIR}/common \
						-I${FP_DIR}/config \
						-I${FP_DIR}/fptun \
						-I${FP_DIR}/fastpath \
						-I${FP_DIR}/fp-modules \
						-I${FP_DIR}/fp-modules/ipsec/common\
						-I${FP_DIR}/fp-modules/ipsec/common/filter \
						-I${FP_DIR}/fp-modules/ipsec6/common \
						-I${FP_DIR}/fp-modules/svti/common \
						-I${FP_DIR}/fp-modules/filter/common \
						-I${FP_DIR}/fp-modules/filter6/common \
						-I${FP_DIR}/fp-modules/tunnel/common \
						-I${FP_DIR}/fp-modules/vxlan/common \
						-I${FP_DIR}/fp-modules/tap/common \
						-I${FP_DIR}/fp-modules/tap/dataplane \
						-I${FP_DIR}/fp-modules/ip/ \
						-I${FP_DIR}/fp-modules/ip/common \
						-I${FP_DIR}/fp-modules/filter-bridge/common \
						-I${FP_DIR}/fp-modules/mcast/common \
						-I${FP_DIR}/fp-modules/bridge/common \
						-I${FP_DIR}/fp-modules/ip6/ \
						-I${FP_DIR}/fp-modules/ip6/common \
						-I${FP_DIR}/fp-modules/pbr/common \
						-I${FP_DIR}/fp-modules/vlan/common \
						-I${FP_DIR}/fp-modules/macvlan/common \
						-I${FP_DIR}/fp-modules/veth/common \
						-I${FP_DIR}/fp-modules/lag/common \
						-I${FP_DIR}/fp-modules/tc/common \
						-I${FP_DIR}/fp-modules/tc/dataplane \
						-I${FP_DIR}/fp-modules/gre/common \
						-I${FP_DIR}/fastpath \
						-I${FP_DIR}/fastpath/include \
						-I${FP_DIR}/fastpath/include/netinet \
						-I${FP_DIR}/fastpath/arch/dpdk \
						-I${FP_DIR}/libnetfpc \
						-I${FP_DIR}/fpdebug \
                      '])

AC_SUBST([FPNSDK_DIR], ['${FP_PREFIX}/include/fpn-sdk'])
AC_SUBST([FPNSDK_CPPFLAGS], [' \
                            -I${FPNSDK_DIR} \
                            -I${FPNSDK_DIR}/dpdk \
                            -I${FPNSDK_DIR}/dpdk/mk \
                            -I${FPNSDK_DIR}/dpdk/crypto \
                            -I${FPNSDK_DIR}/mk \
                            -I${FPNSDK_DIR}/dpvi \
                            -I${FPNSDK_DIR}/sched \
                            -I${FPNSDK_DIR}/shmem \
                            -I${FPNSDK_DIR}/timer \
                            -I${FPNSDK_DIR}/config \
                            -I${FPNSDK_DIR}/crypto \
                          '])

AC_DEFUN([AX_CFLAGS_ADD],[AX_C_CHECK_FLAG($1, , , CFLAGS="$CFLAGS $1")])
AX_CFLAGS_ADD([-Wno-error=zero-length-bounds])
AX_CFLAGS_ADD([-Wno-zero-length-bounds])

#===================================================================

AC_CONFIG_FILES([
  Makefile
  lib/libcmdkw/Makefile
  lib/libcutest/build/Makefile
  lib/libtrssdk/build/Makefile
  lib/libtrssdk/tst/Makefile
  lib/libtrsiwf/build/Makefile
  lib/libtrsiwf/tst/Makefile
  src/trscli/build/Makefile
  src/TrsConfig/Makefile
  lib/libtrsl2app/build/Makefile
  src/l2appcli/build/Makefile
  symptomreport/Makefile
])

#code coverage related macro and variables
AX_CODE_COVERAGE
AC_SUBST([CODE_COVERAGE_LCOV_RMOPTS], ['*tst/* */include/* *src/*.h'])
AC_SUBST([CODE_COVERAGE_OUTPUT_DIRECTORY], ['lcov_report/C'])


PKG_CHECK_MODULES([LIBDPDK], [libdpdk])
PKG_CHECK_MODULES([LIBCOMMONIO], [libcommonio])
PKG_CHECK_MODULES([LIBDPDKINIT], [libdpdkinit])
PKG_CHECK_MODULES([LIBCMOCKA], [cmocka])

#===================================================================

AM_INIT_AUTOMAKE([subdir-objects foreign 1.13 tar-pax])

#===================================================================

AC_OUTPUT

```

看看trsapp的例子：

```makefile
ACLOCAL_AMFLAGS = -I m4                            //将自定义的宏编译成可用的宏
#===================================================================

SUBDIRS = lib/libcmdkw lib/libtrssdk/build         //说明当下目录哪些子目录需要编译
SUBDIRS += lib/libtrssdk/build
SUBDIRS += lib/libtrsiwf/build
SUBDIRS += lib/libcutest/build
SUBDIRS += src/trscli/build
SUBDIRS += src/TrsConfig
SUBDIRS += lib/libtrsl2app/build
SUBDIRS += src/l2appcli/build
SUBDIRS += symptomreport
#===================================================================

UTESTDIRS = lib/libtrssdk/tst
UTESTDIRS += lib/libtrsiwf/tst

#===================================================================
#UNIT Test Code Coverage
@CODE_COVERAGE_RULES@

#Command to check to generate code coverage
check:
        @dirs='$(UTESTDIRS)'; \
        for dir in $$dirs; \
        do \
                echo "Making utest in $$dir";\
                ${MAKE} check-code-coverage -C $$dir;\
        done

#===================================================================
```

伪目标是这样一个目标：它不代表一个真正的文件名，在执行make时可以指定这个目标来执行所在规则定义的命令，有时也可以将一个伪目标称为标签。伪目标通过PHONY来指明。

1、如果我们指定的目标不是创建目标文件，而是使用makefile执行一些特定的命令，例如：

```makefile
clean:    
		rm *.o temp
```

我们希望，只要输入”make clean“后，”rm *.o temp“命令就会执行。但是，当当前目录中存在一个和指定目标重名的文件时，例如clean文件，结果就不是我们想要的了。输入”make clean“后，“rm *.o temp” 命令一定不会被执行。  

解决的办法是:将目标clean定义成伪目标就成了。无论当前目录下是否存在“clean”这个文件，输入“make clean”后，“rm *.o temp”命令都会被执行。

注意：这种做法的带来的好处还不止此，它同时提高了make的执行效率，因为将clean定义成伪目标后，make的执行程序不会试图寻找clean的隐含规则。
**2、PHONY可以确保源文件（\*.c \*.h）修改后，对应的目标文件会被重建。倘若缺少了PHONY，可以看到情况会很糟。**  

现在做一个实验，实验的目录是/work，在这个目录中，包含了四个目录test、add、sub、include 和一个顶层目录makefile文件。test、add、sub三个目录分别包含了三个源程序test.c、add.c、sub.c和三个子目录makefile，目录include的是头文件heads.h的目录，分别展开四个目录的内容如下