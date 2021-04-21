---
title: C++ Struct的使用
date: '2020/12/31 23:59'
tags:
 - cpp
categories:
 - 使用教程
abbrlink: 13002
cover: img/cpp.png
---
# C++ Struct的使用

## C++中的结构体

在C语言中，结构体不能包含函数。

在面向对象的程序设计中，对象具有状态（属性）和行为，状态保存在成员变量中，行为通过成员方法（函数）来实现。

C语言中的结构体只能描述一个对象的状态，不能描述一个对象的行为。在C++中，考虑到C语言到C++语言过渡的连续性，对结构体进行了扩展,C++的结构体可以包含函数，这样，C++的结构体也具有类的功能，与class不同的是，结构体包含的函数默认为public，而class中默认是private。

C++中的struct对C中的struct进行了扩充，它已经不再只是一个包含不同数据类型的数据结构了，它已经获取了太多的功能。

struct能包含成员函数吗？   能！

struct能继承吗？          能！！

struct能实现多态吗？       能！！！

## 结构体的定义与声明

实例代码1：

```c++
struct tag 
{
    member-list;
}variable-list;

/*
注：struct为结构体关键字；
   tag为结构体的标志；
   member-list为结构体成员变量及成员函数列表，其必须列出其所有成员；
   variable-list为此结构体声明的变量；
*/
```

实例代码2：

```cpp
#include <iostream> 

using namespace std;

struct SAMPLE
{
    int x;
    int y;
    int add() {return x+y;}
}s1;

int main()
{
    cout<<"没初始化成员变量的情况下："<<s1.add()<<endl;
    s1.x = 3;
    s1.y = 4;
    cout<<"初始化成员变量的情况下："<<s1.add()<<endl;
    system("pause");
    return 0;
}

/*
=>没初始化成员变量的情况下：0
  初始化成员变量的情况下：7
*/
```

C++中的结构体与类的区别： 

(1)class中默认的成员访问权限是private的，而struct中则是public的。 

(2)class继承默认是private继承，而从struct继承默认是public继承。

C++中的结构体与类的区别： 

(1)class中默认的成员访问权限是private的，而struct中则是public的。

 (2)class继承默认是private继承，而从struct继承默认是public继承。

结构体也可以继承结构体或者类。

**关于使用大括号初始化**
　　class和struct如果定义了构造函数的话，都不能用大括号进行初始化
　　如果没有定义构造函数，struct可以用大括号初始化。
　　如果没有定义构造函数，且所有成员变量全是public的话，可以用大括号初始化。

**关于模版**
　　在模版中，类型参数前面可以使用class或typename，如果使用struct，则含义不同，struct后面跟的是“non-type template parameter”，而class或typename后面跟的是类型参数。

**关于默认访问权限**
　　class中默认的成员访问权限是private的，而struct中则是public的。

## 结构体的作用

在实际项目中，结构体是大量存在的。研发人员常使用结构体来封装一些属性来组成新的类型。由于C语言内部程序比较简单，研发人员通常使用结构体创造新的“属性”，其目的是简化运算。
结构体在函数中的作用不是简便，最主要的作用就是封装。封装的好处就是可以再次利用。让使用者不必关心这个是什么，只要根据定义使用就可以了。