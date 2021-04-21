---
title: automake基础
date: '2021/04/13 16:59'
tags:
 - automake
 - linux
categories:
 - 学习笔记
abbrlink: 13020
cover: 
---

# automake基础

[转载]: https://www.laruence.com/2009/11/18/1154.html	"automake,autoconf使用详解"

作为Linux下的程序开发人员,大家一定都遇到过Makefile,用make命令来编译自己写的程序确实是很方便.一般情况下,大家都是手工写一个简单Makefile,如果要想写出一个符合自由软件惯例的Makefile就不那么容易了.
在本文中,将给大家介绍如何使用autoconf和automake两个工具来帮助我们自动地生成符合自由软件惯例的 Makefile,这样就可以象常见的 GNU程序一样,只要使用"./configure","make","make instal"就可以把程序安装到Linux系统中去了.
这将特别适合想做开放源代码软件的程序开发人员,又或如果你只是自己写些小的Toy程序,那么这个文章对你也会有很大的帮助.

## Makefile介绍

Makefile是用于自动编译和链接的 ,一个工程有很多文件组成,每一个文件的改变都会导致工程的重新链接,但是不是 所有的文件都需要重新编译,Makefile中纪录有文件的信息,在 make时会决定在链接的时候需要重新编译哪些文件.　
Makefile的宗旨就是 ：让编译器知道要编译一个文件需要依赖其他的 哪些文件.当那些依赖文件有了改变,编译器会自动的发现最终的生成文件已经过时,而重新编译相应的 模块.　　
Makefile的 基本结构不是 很复杂,但当一个程序开发人员开始写Makefile时,经常会怀疑自己写的 是 否符合惯例,而且自己写的 Makefile经常和自己的 开发环境相关联,当系统环境变量或路径发生了变化后,Makefile可能还要跟着修改.这样就造成了手工书写Makefile的 诸多问题,automake恰好能很好地帮助我们解决这些问题.　　
使用automake,程序开发人员只需要写一些简单的 含有预定义宏的 文件,由autoconf根据一个宏文件生成configure,由automake根据另一个宏文件生成Makefile.in,再使用configure依据Makefile.in来生成一个符合惯例的 Makefile.下面我们将详细介绍Makefile的 automake生成方法.

## 使用的环境

本文所提到的 程序是 基于Linux发行版本：Fedora Core release 1,它包含了我们要用到的 autoconf,automake.

## 从helloworld入手

我们从大家最常使用的 例子程序helloworld开始.
下面的 过程如果简单地说来就是 ：
新建三个文件：

```makefile
　　　helloworld.c　　　
　　　configure.in　　　
　　　Makefile.am
```

然后执行：

```makefile
aclocal; autoconf; automake --add-missing; ./configure; make; ./helloworld
```

就可以看到Makefile被产生出来,而且可以将helloworld.c编译通过.
很简单吧,几条命令就可以做出一个符合惯例的 Makefile,感觉如何呀.
**现在 开始介绍详细的 过程：**

1. 建目录
    在 你的工作目录下建一个helloworld目录,我们用它来存放helloworld程序及相关文件,如在 /home/my/build下：

```makefile
$ mkdir helloword
$ cd helloworld
```

2. helloworld.c
    然后用你自己最喜欢的 编辑器写一个hellowrold.c文件,如命令：vi helloworld.c.使用下面的 代码作为helloworld.c的 内容.

```c
#include <stdio.h>

int main(int argc, char** argv)
{
    printf("%s", 'Hello, Linux World!\n");     
    return 0;
}
```

完成后保存退出.
现在 在 helloworld目录下就应该有一个你自己写的 helloworld.c了.

3. 生成configure

    我们使用autoscan命令来帮助我们根据目录下的 源代码生成一个configure.in的 模板文件. 命令：

```makefile
$ autoscan
$ ls
configure.scan helloworld.c
```

执行后在 hellowrold目录下会生成一个文件：configure.scan,我们可以拿它作为configure.in的 蓝本.
现在 将configure.scan改名为configure.in,并且编辑它,按下面的 内容修改,去掉无关的 语句：

```makefile
==========================configure.in内容开始=========================================
# -*- Autoconf -*-
# Process this file with autoconf to produce a configure script.
AC_INIT(helloworld.c)
AM_INIT_AUTOMAKE(helloworld, 1.0)
# Checks for programs.
AC_PROG_CC
# Checks for libraries.
# Checks for header files.
# Checks for typedefs, structures, and compiler characteristics.
# Checks for library functions.
AC_OUTPUT(Makefile)
==========================configure.in内容结束=========================================
```

然后执行命令aclocal和autoconf,分别会产生aclocal.m4及configure两个文件：

```makefile
$ aclocal
$ls
aclocal.m4 configure.in helloworld.c
$ autoconf
$ ls
aclocal.m4 autom4te.cache configure configure.in helloworld.c
```

大家可以看到configure.in内容是 一些宏定义,这些宏经autoconf处理后会变成检查系统特性.环境变量.软件必须的 参数的 shell脚本.
autoconf 是 用来生成自动配置软件源代码脚本（configure）的 工具.configure脚本能独立于autoconf运行,且在 运行的 过程中,不需要用户的 干预.
要生成configure文件,你必须告诉autoconf如何找到你所用的 宏.方式是 使用aclocal程序来生成你的 aclocal.m4.
aclocal根据configure.in文件的 内容,自动生成aclocal.m4文件.aclocal是 一个perl 脚本程序,它的 定义是 ："aclocal - create aclocal.m4 by scanning configure.ac".
autoconf从configure.in这个列举编译软件时所需要各种参数的 模板文件中创建configure.
autoconf需要GNU m4宏处理器来处理aclocal.m4,生成configure脚本.
m4是 一个宏处理器.将输入拷贝到输出,同时将宏展开.宏可以是 内嵌的 ,也可以是 用户定义的 .除了可以展开宏,m4还有一些内建的 函数,用来引用文件,执行命令,整数运算,文本操作,循环等.m4既可以作为编译器的 前端,也可以单独作为一个宏处理器.

4. 新建Makefile.am
    新建Makefile.am文件,命令：

```makefile
$ vi Makefile.am
　　内容如下:
AUTOMAKE_OPTIONS=foreign
bin_PROGRAMS=helloworld
helloworld_SOURCES=helloworld.c
```

automake会根据你写的 Makefile.am来自动生成Makefile.in.
Makefile.am中定义的 宏和目标,会指导automake生成指定的 代码.例如,宏bin_PROGRAMS将导致编译和连接的 目标被生成.

5. 运行automake:

```makefile
$ automake --add-missing
configure.in: installing `./install-sh'
configure.in: installing `./mkinstalldirs'
configure.in: installing `./missing'
Makefile.am: installing `./depcomp'
```

automake会根据Makefile.am文件产生一些文件,包含最重要的 Makefile.in.

6. 执行configure生成Makefile

```makefile
$./configure
checking for a BSD-compatible install... /usr/bin/install -c
checking whether build environment is sane... yes
checking for gawk... gawk
checking whether make sets $(MAKE)... yes
checking for gcc... gcc
checking for C compiler default output... a.out
checking whether the C compiler works... yes
checking whether we are cross compiling... no
checking for suffix of executables...
checking for suffix of object files... o
checking whether we are using the GNU C compiler... yes
checking whether gcc accepts -g... yes
checking for gcc option to accept ANSI C... none needed
checking for style of include used by make... GNU
checking dependency style of gcc... gcc3
configure: creating ./config.status
config.status: creating Makefile
config.status: executing depfiles commands
$ ls -l Makefile
-rw-rw-r-- 1 yutao yutao 15035 Oct 15 10:40 Makefile
```

你可以看到,此时Makefile已经产生出来了.

7. 使用Makefile编译代码

```makefile
$make
if gcc -DPACKAGE_NAME=\"FULL-PACKAGE-NAME\" -DPACKAGE_TARNAME=\"full-package-name\" -DPACKAGE_VERSION=\"VERSION\" -DPACKAGE_STRING=\"FULL-PACKAGE-NAME\ VERSION\" -DPACKAGE_BUGREPORT=\"BUG-REPORT-ADDRESS\" -DPACKAGE=\"helloworld\" -DVERSION=\"1.0\" -DSTDC_HEADERS=1 -DHAVE_SYS_TYPES_H=1 -DHAVE_SYS_STAT_H=1 -DHAVE_STDLIB_H=1 -DHAVE_STRING_H=1 -DHAVE_MEMORY_H=1 -DHAVE_STRINGS_H=1 -DHAVE_INTTYPES_H=1 -DHAVE_STDINT_H=1 -DHAVE_UNISTD_H=1 -DHAVE_STDLIB_H=1  -I. -I.     -g -O2 -MT helloworld.o -MD -MP -MF ".deps/helloworld.Tpo" -c -o helloworld.o helloworld.c; \
then mv -f ".deps/helloworld.Tpo" ".deps/helloworld.Po"; else rm -f ".deps/helloworld.Tpo"; exit 1; fi
gcc  -g -O2   -o helloworld  helloworld.o
```

运行helloworld

```makefile
$ ./helloworld
Hello, Linux World!
```

这样helloworld就编译出来了,你如果按上面的 步骤来做的 话,应该也会很容易地编译出正确的 helloworld文件.你还可以试着使用一些其他的 make命令,如make clean,make install,make dist,看看它们会给你什么样的 效果.感觉如何？自己也能写出这么专业的 Makefile,老板一定会对你刮目相看.

## 深入浅出

针对上面提到的各个命令,我们再做些详细的介绍.

{%asset_img Makefile基础.png %}

![Makefile基础](.\automake基础\Makefile基础.png)