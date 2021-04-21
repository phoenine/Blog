---
title: asm goto与JUMP_LABEL
date: '2020/12/31 23:59'
tags:
 - baisc
categories:
 - 学习笔记
abbrlink: 15000
cover: 
---

## asm goto与JUMP_LABEL

版权声明：本文为CSDN博主「dog250」的原创文章，遵循CC 4.0 BY-SA版权协议，转载请附上原文出处链接及本声明。

原文链接：https://blog.csdn.net/dog250/article/details/6123517

------

越来越多的工作现如今都交给了编译器，甚至连动态代码修改的数据组织这种事都交给了编译器。gcc提供了一个特性用于嵌入式汇编，那就是asm goto，其实这个特性没有什么神秘之处，就是在嵌入式汇编中go to到c代码的label，其最简单的用法如下(来自gcc的文档)：

![img](/Users/phoenine/Documents/MyBlog/hexo/source/_posts/linux_md/Linux Basic/asm goto与JUMP_LABEL/29b980e2bc932adf7464c8f17c5302cd.png)

asm goto其实就是在outputs，inputs，registers-modified之外提供了嵌入式汇编的第四个“:”，后面可以跟一系列的c语言的label，然后你可以在嵌入式汇编中go to到这些label中一个。然而使用asm goto可以巧妙地将“一个大家都能想到的点子”规范化，就是说你只需要调用一个统一的接口--一个宏，编译器就将你想实现的东西给实现了，要不然代码写起来会很麻烦，这点上，编译器不嫌麻烦。这一个大家都能想出的点子的由来还得从内核的效率说起。

以下的代码来自lwn的《Jump label》：

![img](/Users/phoenine/Documents/MyBlog/hexo/source/_posts/linux_md/Linux Basic/asm goto与JUMP_LABEL/fff4bc0460b6a42964f0707e37e2fdfc.png)

即使有了unlikey优化，既然有if判断，cpu的分支预测就有可能失败，再者do_trace在代码上离if这么近，即使编译器再聪明，二进制代码的do_trace也不会离前面的代码太远的，这样由于局部性原理和cpu的预取机制，do_trace的代码很有可能就被预取入了cpu的cache，就算我们从来不打算trace代码也是如此。

   我们需要的是如果不开启trace，那么do_trace永远不被欲取或者被预测，唯一的办法就是去掉if判断，永远不调用goto语句，像下面这样：

![img](/Users/phoenine/Documents/MyBlog/hexo/source/_posts/linux_md/Linux Basic/asm goto与JUMP_LABEL/f20c49b0c9978b8ef05c5f21b3086abb.png)

在运行时修改载入内存的二进制代码就是我们大家都能想到的点子，就是说在运行的时候当我们知道trace_foo_enabled在某一时刻被设置为0的时候，我们动态的将二进制代码修改掉，将if代码段去掉，这样一个分支预测就不存在了，而且trace_foo_enabled这一个变量也不需要再被访问了(该变量在内存中，访问它肯定会涉及load/flush cache的动作，为了一个很可能没有用的变量操作cache很不值)。提前要说的是，我们可以使用这种方式去掉所有的分支预测，然而这并不可取，因为程序是动态运行的，很多用于判断的变量值都是根据程序的执行瞬息万变，正是这种根据判断结果采取不同动作的机制给与了程序灵活性，如果每当我们确定一个值时就修改二进制代码取消分支预测的话，其本身的开销将会远远大于分支预测的开销，更重要的是，紧接着那个值又变化了，我们不得不再次修改二进制代码，这期间要访问那个变量好几次。所以，只有在我们确定不经常变化的变量的判断上才能用这种方式取消分支预测，而像trace与否的判断正好符合我们的需求。

   gcc编译器提供了asm goto的机制来满足我们的需求，使得我们可以在asm goto的基础上构建出一个叫做jump label的东西。下面的代码段说明了jump label的用法和原理：

![img](/Users/phoenine/Documents/MyBlog/hexo/source/_posts/linux_md/Linux Basic/asm goto与JUMP_LABEL/6bac3d6ecb4de4fb911fdea52ac3b685.png)

标号0仅仅执行一个nop，不涉及cache，后面的pushp保存现有的p，很多情况下当前的p就是text，然后定义一个“表”，表中有两个元素：0b和trace#NUM，其实就是两个标号，在asm goto机制中，标号还可以更多，它们在嵌入式汇编的最后一个“:”后面依次排布。这些标号就是供选择的标号，执行流将跳入其中的一个标号处，具体跳到哪一个就看当前的二进制代码被修改成了“跳到哪一个”，因此asm goto为我们做的仅仅是提供一个地方(一个“:”)供我们将label传入，保存了一系列的表还是需要我们的c代码逻辑--jump label实现，这些表(其实就是一系列的三元组)方便我们根据这些表来修改运行中的二进制代码，最终修改二进制代码还是要由我们自己写代码完成的。

   有了这个asm goto以及我们jump label代码的支持，内核对于是否trace这种小事就再也不用愁了(使用中的kernel一般是不用trace的，只有在出了问题以后或者调试内核时才使用trace，因此在主代码中加入“是否trace”的判断实在是一种沉重的负担)，如果对于某一个函数不需要trace，内核只需要执行一个操作将asm goto附近的代码改掉即可，比如改称下面这样：

![img](/Users/phoenine/Documents/MyBlog/hexo/source/_posts/linux_md/Linux Basic/asm goto与JUMP_LABEL/1cb5ae3625df65f6dd793016bd6ba1b8.png)

如果需要trace，那么就改成：

![img](/Users/phoenine/Documents/MyBlog/hexo/source/_posts/linux_md/Linux Basic/asm goto与JUMP_LABEL/67b8b0eb1f1a2653847f192d3419f03d.png)

这一切在kernel中的用法如下：

![img](/Users/phoenine/Documents/MyBlog/hexo/source/_posts/linux_md/Linux Basic/asm goto与JUMP_LABEL/c64bae7e63e732efcd28ab9f5698094a.png)

第一行的“1”是一个标号，该标号后的代码执行的内容就是nop-第二行，第三行重新开始了一个p，这样的意义很大，下面的三元组：[instruction address] [jump target] [tracepoint key]的二进制代码就不会紧接着标号1(nop)了，这个三元组就是jump label机制的核心，指示了所有可能跳转到的标号，这里的技巧在于标号1，标号1也作为一个合法的可能跳转到的标号存在，和标号label是并列的，由于pushp和popp的存在，上面的代码汇编结果看起来是下面这样：

![img](/Users/phoenine/Documents/MyBlog/hexo/source/_posts/linux_md/Linux Basic/asm goto与JUMP_LABEL/5ab2c7d479df91a760c9d4a5a3c910a8.png)

如果启用了trace，那么只需要将标号1修改成标号label就可以了：

![img](/Users/phoenine/Documents/MyBlog/hexo/source/_posts/linux_md/Linux Basic/asm goto与JUMP_LABEL/af59ab58bba48a1b8eb5365af15a3713.png)

内核之所以能够找到需要修改代码的地址，就是借助于上面说的那个三元组(instruction address,jump target,tracepoint key)，其中instruction address就是这个地址，在linux的JUMP  LABEL机制中，它固定为标号1，也就是nop的标号，如果不启用trace，那么直接执行nop，如果启用了trace，那么将nop修改为jmp label即可，如果后来又禁用了trace，只需将它再次修改成三元组中的标号1即可，这一切过程中，三元组本身是不会改变的。注意，三元组中的tracepoint key在jump label机制中并没有什么实质的意义，它仅仅是为了组织kernel中“是否trace”变量用的，所有的“是否trace”变量组织成一个链表，链表的每一个节点下面挂着另一个子链表，该子链表中元素是所有使用这个“是否trace”变量的代码环境，包括代码的地址，标号的地址等。

   下面看一下kernel对于JUMP_LABEL的实现框架。首先看一下三元组的数据结构：

![img](/Users/phoenine/Documents/MyBlog/hexo/source/_posts/linux_md/Linux Basic/asm goto与JUMP_LABEL/36bf84b3afa4158dd7d0aff0ee6e7a85.png)

其次一个比较重要的数据结构是一个key节点，表示一个“是否trace”的变量：

![img](/Users/phoenine/Documents/MyBlog/hexo/source/_posts/linux_md/Linux Basic/asm goto与JUMP_LABEL/bf51de614427cbe876e34154c0d163ed.png)

启用一个trace意味着需要将一个key(类似于trace_foo_enabled)设置为1，然后修改所有判断该key的代码附近的二进制代码：

![img](/Users/phoenine/Documents/MyBlog/hexo/source/_posts/linux_md/Linux Basic/asm goto与JUMP_LABEL/8d12750add3c38f5500d3df3ce376fd3.png)

![img](/Users/phoenine/Documents/MyBlog/hexo/source/_posts/linux_md/Linux Basic/asm goto与JUMP_LABEL/bcf035cdda2f9ec3b303a4246f873571.png)

以上就是使用asm goto实现的jump label，在2.6.37内核中被引入。

附：.p以及.previous

在汇编语言中使用.p和.previous指令可以将它们之间的代码编译到不同的p中，也就是不紧接着.p上面的代码。linux kernel中的异常处理就是用这两个伪指令实现的，定义了一个叫做fix的p和一个叫做ex_table的p，可能出现exception的代码用一个标号表示，ex_table中保存了一些二元组(出现异常代码的标号,异常处理程序的标号)，异常处理程序在fix这个p中，这样虽然代码看起来是下面这样：

![img](/Users/phoenine/Documents/MyBlog/hexo/source/_posts/linux_md/Linux Basic/asm goto与JUMP_LABEL/795f16a399b397a69fe06e8feaea5cbd.png)

然而编译器会将fix和ex_table放到离text很远的地方的，这样cpu预取时就不会将fix或者ex_table的代码预取到执行cache了，只有在发生异常的时候才会使用fix和ex_table，而发生异常毕竟是一种罕见现象，这就是一种优化。