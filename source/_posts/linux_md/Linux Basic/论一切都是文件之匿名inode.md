---
title: 论一切都是文件之匿名inode
date: '2020/12/31 23:59'
tags:
 - linux
categories:
 - 学习笔记
abbrlink: 15002
cover: 
---

## 宋宝华：论一切都是文件之匿名inode

01

唯有文件得人心

当一个女生让你替她抓100只萤火虫，她一定不是为了折磨你，而是因为她爱上了你。当你们之间经历了无数的恩恩怨怨和彼此伤害，她再次让你替她抓100只萤火虫，那一定是因为她还爱着你。 

![img](/Users/phoenine/Documents/MyBlog/hexo/source/_posts/linux_md/Linux Basic/论一切都是文件之匿名inode/5013388ec46043c59f4fb4b3e373e955.png)

为什么？因为这就是套路，是在下偶尔瞟一眼古装肥皂剧总结出来的套路。

Linux里面最大的套路，就是“一切都是文件”。爱一个人，就为她捉萤火虫；做一件事，就让它成为一个“文件”。 

为什么自古深情留不住，唯有“文件”得人心呢？因为文件在用户态最直观的形式是随着一次open，获得一个fd，有了这个fd，长城内外，你基本可以为所欲为：

- 在本进程内，fd的最直观操作是open、close、mmap、ioctl、poll这些。 m map 让你具备把fd透射到内存的能力，所以你可以通过指针访问文件的内容。再者，这个mmap，如果底层透射的是framebuffer、V4L2、DRM等，则让我们具备了从用户态操作底层显存、多媒体数据等的能力；比如，无论是V4L2还是DRM，都支持把底层的dma_buf导出为fd。poll则提供给用户阻塞等待某事件发生的能力。 至于ioctl，就更加不用说了，你可以透过ioctl灵活地为fd添加控制命令。
- 在跨进程的情况下，Linux支持fd的跨进程socket传输，从而可以实现共享内存、dma_buf跨进程共享等。比如一个进程可以通过send_fd可以把fd发送出去：

![img](/Users/phoenine/Documents/MyBlog/hexo/source/_posts/linux_md/Linux Basic/论一切都是文件之匿名inode/1fce6c5c621b4fd09919e87f52c59801.png)

而另外一个进程可以通过recv_fd把fd收过来： 

![img](/Users/phoenine/Documents/MyBlog/hexo/source/_posts/linux_md/Linux Basic/论一切都是文件之匿名inode/a0d3b15c19454faabb33b6fab3704d6f.png)

这种fd在长城内外可以互访，fd最终可以指向dma_buf同时可以被mmap，而dma_buf又最终可以被显卡、显示控制器、video decoder/encoder等设备访问的能力，让fd打通了设备、CPU和跨进程的障碍，从此可以横着走。 

![img](/Users/phoenine/Documents/MyBlog/hexo/source/_posts/linux_md/Linux Basic/论一切都是文件之匿名inode/277dafd9086b4d148de8b617f9252b62.png)

我们在《 宋宝华：世上最好的共享内存(Linux共享内存最透彻的一篇) 》一文中已经详细阐述过这个过程，这里我们就不再赘述了。本文的重点在于匿名inode。 

02

inode源头file活水

我们把文件想象成一个object，那么inode描述的是本源，和最终的object一一对应；dentry是inode的一个路径马甲，比如我们可以通过"ln"命令为同一个inode创建很多的硬链接马甲；而file则是活水，进程对object的一次“open”，获得一个file，导致用户态得到一个"fd"的句柄来操作这个object。

经典的inode、dentry、file谁都不缺席的模型是这样的：

![img](/Users/phoenine/Documents/MyBlog/hexo/source/_posts/linux_md/Linux Basic/论一切都是文件之匿名inode/d48bc627be544288b73fe774962b1010.png)

上图中，我们有一个inode，这个inode有2个dentry，进程A、B open的是第一个dentry；而进程C、D open的是第二个dentry。变了的是file和fd，不变的是inode，中间的dentry马甲没那么重要。

但是在inode、dentry、file这个经典铁三角中，从来都是可以有一个缺席者的，那就是dentry，因为，有时候用户态想获得长城内外行走的便利，但是却不想这个inode在文件系统里面留下一个路径的痕迹。简单来说，我希望有个fd，但是这个fd，你在从"/"往下面搜索的任何一条路径下，你都找不到它，它根本在根文件系统以下不存在路径，它是无名氏，它没有马甲，它是个传说。

比如，近期名震江湖的剑客usefaultfd允许我们在用户空间处理page fault，我们是通过userfaultfd这个系统调用先获得一个fd，之后就可以对它进行各种ioctl了： 

![img](/Users/phoenine/Documents/MyBlog/hexo/source/_posts/linux_md/Linux Basic/论一切都是文件之匿名inode/e0230f143c434814ba2cdc39c2faaa68.png)

我们透过userfaultfd系统获得了一个fd，它在/xxx/yyy/zzz这样的文件系统下没有路径。这种情况下的fd，对应着的是一个没有名字的匿名inode，你显然没有办法像fd = open ("xxx", ..)那样来得到匿名inode的fd，因为"xxx"是一个路径，而匿名inode没有xxx，所以你是直接透过syscall userfaultfd这样的系统调用，来获得anon_inode在你的进程里面对应的fd的:

![img](/Users/phoenine/Documents/MyBlog/hexo/source/_posts/linux_md/Linux Basic/论一切都是文件之匿名inode/675fef6379254f7fb5c7b3a934c32255.png)

人过留名，雁过留声；杀人者，打虎武松也。但是anon inode不吃这一套，它是一个绝顶的轻功高手，它给与的，是透过fd长城内外行走的能力，但是，在文件系统里面却从未来过。这是用户真实的需求，如果这种需求一定要透过一个dentry的open才能实现，这未免有点画蛇添足了。

03

匿名inode的内核实例

我们接下来可以随便打开个anon inode的实例来看看它是怎么工作的了。首先userfaultd是一个系统调用：

![img](/Users/phoenine/Documents/MyBlog/hexo/source/_posts/linux_md/Linux Basic/论一切都是文件之匿名inode/cb54f7e833a743b1962c47dcd996e921.png)

这个代码里面比较核心的是就是，它通过： 

anon_inode_getfd_secure

生成一个匿名inode，并获得一个句柄fd。重点别忘记了，这种“文件”也是可以有file_operations的，比如上面anon_inode_getfd_secure参数中的userfaultfd_fops：

![img](/Users/phoenine/Documents/MyBlog/hexo/source/_posts/linux_md/Linux Basic/论一切都是文件之匿名inode/9a7eb6b3c35d45a1a4eaf1b76cc1398c.png)

这样，我们就可以在file_operations的ioctl，poll，read等callback里面实现自己特别的“文件”逻辑，这是我们自由发挥的舞台。 

说起anon_inode_getfd_secure，它再往底层走一级是__anon_inode_getfd：

![img](/Users/phoenine/Documents/MyBlog/hexo/source/_posts/linux_md/Linux Basic/论一切都是文件之匿名inode/0e672cd9bd994dc285f89e617c06305b.png)

进而再走一级是__anon_inode_getfile：

![img](/Users/phoenine/Documents/MyBlog/hexo/source/_posts/linux_md/Linux Basic/论一切都是文件之匿名inode/7e632a0669e34ab69bac30c3f5e4dd60.png)

所以本质上，是先造一个anon_inode，然后再在这个anon_inode上面造一个pseudo的file，最后通过fd_install(fd, file)，把fd和file缠在一起。再次强调，用户有了这个fd就可以为所欲为；而内核本身，则是通过file_operations的不同实现来为所欲为的。 

anon_inode之上添加一个系统调用，造一种特殊的fd，让用户去poll，去ioctl，把想象空间拉大了。这种实现方法，如此拉风灵活，以至于它本身也成为了一种套路。比如内核里面fs目录下的： 

![img](/Users/phoenine/Documents/MyBlog/hexo/source/_posts/linux_md/Linux Basic/论一切都是文件之匿名inode/0af65e9d09c34b96890eba35cecb648b.png)

eventfd，eventpoll，fscontext，io_uring，fanotify，inotify，signalfd，timerfd.......

正所谓， 待到秋来九月八，我花开后百花杀。冲天香阵透长安，满城尽带黄金甲。文件，哪怕最终是匿名的，都以冲天的香阵，弥漫整个Linux的世界。

04

用户使用匿名inode

到了要说再见的时刻了，用户可见的就是fd，通过fd来使用匿名inode。下面我们来制造一个page fault的例子，让用户态来处理它，这个例子直接简化自userfaultfd的man page。我们在主线程中，通过mmap申请一页内存，然后通过userfaultfd的ioctl告诉内核这页的开始地址和长度，以及通过UFFDIO_REGISTER告诉内核这页的page fault想用户空间处理：

![img](/Users/phoenine/Documents/MyBlog/hexo/source/_posts/linux_md/Linux Basic/论一切都是文件之匿名inode/36e34f1760bb4ac6a3192f57d58264ca.png)

然后我们在pthread_create创建的fault_handler_thread线程中，poll userfaultfd等待事件，之后把一页全是0x66的内容拷贝到page fault发生的那一页： 

![img](/Users/phoenine/Documents/MyBlog/hexo/source/_posts/linux_md/Linux Basic/论一切都是文件之匿名inode/5a7596802fc1411bbbca9f481cc42913.png)

我们运行这个程序得到的输出如下：

![img](/Users/phoenine/Documents/MyBlog/hexo/source/_posts/linux_md/Linux Basic/论一切都是文件之匿名inode/539b3cebc6034a6187bb941433906a9a.png)

我们主线程在执行addr[0]=0x5A5A5A5A的时候，触发了page fault。在fault线程里面，page fault发生后，poll阻塞返回，之后用户通过read读到了一个uffd_msg的结构体，里面的成员包含了page fault的地址。之后，我们通过UFFDIO_COPY这个ioctl，把内容为0x66的页面拷贝给page fault的页面。

可以看出来： 

- poll在等什么，完全被定制化了；
- read能读什么，完全被定制化了；
- ioctl能控制什么，完全被定制化了。

我们通过“文件”这个不变的“静”，制造了poll、read、ioctl的灵动自如。兵法有云，以不变应万变，以万变应不变。