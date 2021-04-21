---
title: Python中的“*”总结
date: '2020/12/31 23:59'
tags:
  - python
categories:
  - 学习笔记
abbrlink: 16001
cover: 
---

## Python中的“*”总结

对于一般的Python使用者来说，清楚Python中的“*”号是作为乘法运算符就足够了，但是如果你想要更进一步，想要在Python领域中更进一步的话，就需要了解Python中“星号”的五个强大的用途。

### **1.作为乘法或者是乘幂运算符**

![img](https://mmbiz.qpic.cn/mmbiz_png/H4U1sS0fpI6paSHxlqkGz3roPyaNyYibmP6gnlib8DyoYJfjjogscYBQiaMbQoKvrcDK8ibgiaTT3Zic3zUzuhHXX2NA/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)



作为基础的Python应用，乘法运算和乘幂运算是大家最容易想到的星号作用。上述程序中，单个星号运算符起到了乘法运算的目的，而连续的两个乘号起到了乘幂运算的目的。从结果可以看出，3*3的结果是9，而3的3次方是27。



### **2.接收多个参数**

当我们在编写函数时，有时候函数的参数数量太多，所以我们想尽量的缩短程序，让程序看起来简介，除此之外，我们可能不知道函数有多少个具体的参数，这个时候，就可以用星号来发挥作用。

![img](https://mmbiz.qpic.cn/mmbiz_png/H4U1sS0fpI6paSHxlqkGz3roPyaNyYibm0jwvh8XeMdSQxV9bSXacBlUgv3RemyH8ORoSicAG3ZSkj5yHxOXF0KQ/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

上述程序中，单个星号起到的作用是帮助我们捕获多个位置参数，然后将其放入到字典中，需要注意的是，在传入参数时，它的顺序位置需要明确，以方便在函数调用中使用。



而对于双星号的参数，可以帮助我们捕获多个带关键字名字的参数，并放入到字典中去，这样的话，我们在程序内使用的时候，可以根据关键字名字来调用，而无需过多关注参数的顺序位置。



### **3.函数使用时必须带有形参名称**

星号的一个作用是在函数调用时，必须要指定函数的形参名称，如下图程序:

![img](https://mmbiz.qpic.cn/mmbiz_png/H4U1sS0fpI6paSHxlqkGz3roPyaNyYibme58q0hXtt6ib4cgzCrwx2dRzv0MR5a1ccfGelT7VZ98ibDJpaDSA7mQQ/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

上述的程序中，func3的第一个参数是星号，它的作用是星号之后的形参在函数调用时都必须要显示的指定；

通过函数的调用就可以看出，我们在前两次的函数调用都指明了星号之后的函数的形参名称；

而第二次的调用没有指定函数的形参名称，结果显示，没有明确形参指定的函数会报错误，从而提示我们必须指定函数的形参。



### **4.可迭代对象的组合**

对于Python中的可迭代对象，是指实现了__iter__()方法的对象，通常大家使用的列表、元组、字典、字符串等等，都是可迭代对象。对于可迭代对象的组合，如下图所示：

![img](https://mmbiz.qpic.cn/mmbiz_png/H4U1sS0fpI6paSHxlqkGz3roPyaNyYibm068JNmTicYgmFiam67v6rOM3KX8FwDhdrjp7QJsskJO5PD4WmQ5QYpww/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

可以看到，我们日常所使用的可迭代对象的组合方式，是通过两个for循环来实现，但是这样的方法简单，却并不能展示出Python的简洁性的优势。

![img](https://mmbiz.qpic.cn/mmbiz_png/H4U1sS0fpI6paSHxlqkGz3roPyaNyYibmbOZMI7Bhgn1Yzia70RASMyicm6KUichr03VG2TvZmnZGI4hl8lX91LiaRQ/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

上图中，可以利用星号来实现可迭代对象的解压。一行代码即可搞定可迭代对象的组合。



### **5.压缩可迭代对象的一部分**

![img](https://mmbiz.qpic.cn/mmbiz_png/H4U1sS0fpI6paSHxlqkGz3roPyaNyYibmGpql7eYUCY4yOJphnNULZpXD8dqt8ANy9aYQWKmH5ibx1llSWf3iba9A/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

当我们从可迭代对象中取值，例如上例中，a，b，c，d与mylist中的元素是一一对应的关系，既不能多也不能少，而当我们只想取出某一部分的元素时，就可以利用星号来进行剩余部分元素的一个压缩。



如上述程序中，可以利用星号前缀的c元素来代替后面的可迭代对象的内容，对象c也是一个可迭代对象。



### **总结**

星号运算符在Python的程序中，除了用作乘法运算符外，还有一些非常强大而且高效的使用方法，我们要在日常的程序中学会使用这些方法，让我们的程序变得更加简洁高效。