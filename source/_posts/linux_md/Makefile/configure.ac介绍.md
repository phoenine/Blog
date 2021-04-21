---
title: configure.ac介绍
date: '2020/12/31 23:59'
tags:
 - baisc
categories:
 - 个人项目
abbrlink: 13008
cover: 
---
**configure.ac介绍**

https://www.gnu.org/savannah-checkouts/gnu/autoconf/manual/autoconf-2.69/autoconf.html

autoconfig:

[Autoconf (gnu.org)](https://www.gnu.org/savannah-checkouts/gnu/autoconf/manual/autoconf-2.70/autoconf.html#Introduction)

automake:

[Top (automake) (gnu.org)](https://www.gnu.org/software/automake/manual/html_node/index.html)

## 常用预定义宏：

### 基础设置

AC_INIT(PACKAGE, VERSION, BUG_REPORT_EMAIL)

AC_PREREQ(VERSION) # 最小支持的autoconf版本号

AC_CONFIG_SRCDIR(FILE) # safe check 确保configure的确是在正确的目录中被执行的

AC_CONFIG_AUX_DIR(DIR) # 辅助目录地址，存放install-sh和depcomp等辅助工具文件，若不指定会在当前目录直接创建辅助工具文件

### Automake设置

AM_INIT_AUTOMAKE([OPTIONS...]) # 检查由Automake生成的Makefile所需的工具，此时可以指定的常用选项有：

- -Wall 启用所有warning警告
- -Werror 将warning视作error
- foreign 表示项目不是完全遵循GNU标准的，放宽某些GNU标准检查
- 1.11.1 生命支持的最小的Automake版本

AC_PROG_RANLIB：如果需要生成静态库，则需要加入这一句

AC_PROG_LIBTOOL：如果需要生成动态库，则加入这一句，表示用libtool自动生成动态库

### 寻找所需程序

AC_PROC_CC # 检查c编译器cc存在

AC_PROC_CXX

AC_PROC_SED/AC_PROC_YACC/AC_PROC_LEX # 查找合适的实现，并将$SED, $YACC等变量设置为找到的实现

AC_CHECK_PROGS(VAR, PROGS, [VAL-IF-NOT-FOUND]) # 依次测试空格分隔的PROGS是否存在，将VAR设置为第一个找到的PROG，若所有PROGS都不存在，将VAR设置为VAL-IF-NOT-FOUND

### 错误提示及退出

AC_MSG_ERROR(ERROR-DESC, [EXIT-STATUS]) # 打印错误信息并退出

AC_MSG_WARN(ERROR-DESC) # 打印错误信息，但不退出

### 为config.h及Makefile定义变量

AC_DEFINE(VAR, VALUE, DESC) # 定义一个在config.h中出现的宏

AC_SUBST(VAR, [VALUE]) # 定义一个Makefile中的变量，若不指定VALUE，会以configure.ac被处理完毕时的VAR变量的值为准进行定义

### 库文件检查

AC_CHECK_LIB(LIBRARY, FUNC, [ACT-IF-FOUND], [ACT-IF-NOT-FOUND]) # 检查LIB是否存在，若LIB存在，是否包含FUNC，若检查结果是都存在，执行ACT-IF-FOUND，否则执行ACT-IF-NOT-FOUND。如果只有LIB存在，而FUNC不存在，该宏会将LIBS变量定义为 $LIBS = "-lLIBRARY, $LIBS"并在config.h中定义#define HAVE_LIBLIBRARY，注意标红的LIBRARY，都是AC_CHECK_LIB宏中传入的第一个参数。

AC_CHECK_HEADERS(HEADERS, ...) # 检查每个HEADERS是否存在，若存在就在config.h中定义#define HAVE_HEADER_H，若HEADER包含目录分隔符/，则会被替换为下划线

AC_CHECK_HEADER(HEADER, [ACT-IF-FOUND], [ACT-IF-NOT-FOUND])

### 输出指令

AC_CONFIG_HEADERS(HEADERS...) # 为每个HEADER.in创建HEADER，一般来说只要使用AC_CONFIC_HEADERS([config.h])即可，因为autoheader只会根据configure.ac中的宏创建HEADERS中出现的第一个HEADER对应的HEADER.in，一般来说就是config.h.in

AC_CONFIG_FILES(FILES...) # 为每个FILE.in创建FILE，一般来说只要使用这个宏来根据Makefile.in创建Makefile，Automake会为每一个FILE.am创建一个FILE.in，从而允许该宏从Makefile.in创建Makefile

## 常用宏组合：

### 检查是否存在程序，如果不存在就打印错误信息并退出

AC_CHECK_PROGS([TAR], [tar gtar], [:])

if test "$TAR" = :; then

 AC_MSG_ERROR([This package needs tar.])

fi

### 检查是否存在库及函数，并定义Makefile变量：

AC_CHECK_LIB([efence], [malloc], [EFENCELIB=-lefence])

AC_SUBST([EFENCELIB])

## .in文件模版

.in文件是模版文件，以一个简单的script.in文件为例：

```makefile
#!/bin/sh
SED=’@SED@’
TAR=’@TAR@’
d=$1; shift; mkdir "$d"
for f; do
 "$SED" ’s/#.*//’ "$f" \
   >"$d/$f"
done
"$TAR" cf "$d.tar" "$d"
```

以上，@XXX@是占位符，会在被处理时替换成由AC_SUBST定义的值；

Makefile.in就是这样一个模版文件，不过由于configure.ac在处理Makefile.in时，对每个AC_SUBST定义的变量都又进行了XXX=@XXX@这样的变量定义，因此在Makefile.in中既可以使用@XXX@又可以使用$XXX来引用变量值。