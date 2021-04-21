---
title: 学习C++ - 艰难的熟悉过程
date: '2020/12/31 23:59'
tags:
 - baisc
categories:
 - 使用教程
abbrlink: 13005
cover: img/cpp.png
---
**学习C++ - 艰难的熟悉过程**

# using声明

https://en.cppreference.com/w/cpp/language/using_declaration

自C++11开始，除了可以使用using引入命名空间所有符号外，还可以使用using来定义类型别名，以及使用using为子类引入父类定义的函数，**包括构造函数**；



昨天晚上读React-Native源码时，发现调用了一个类的构造函数，但是并没有找到这个构造函数的定义在哪里，找了很久才发现看漏了一行using，原来子类是通过using将父类的构造函数全部引入了进来。



如果子类使用using引入父类构造函数会有一些需要注意的点，第一个是引入时，会将父类的所有构造函数一次性的全部引入到子类，如果子类中新定义的所有成员都能进行隐式的初始化，那就可以直接使用using引入的父类构造函数方法来实例化子类实例了。

如果子类自己定义了函数，并且签名和using引入的函数的签名一样，那么using引入的函数会被隐藏。

例如：



```
struct B1 {  B1(int, ...) { } };
struct B2 {  B2(double)   { } };
 
int get();
 
struct D1 : B1 {
  using B1::B1;  // inherits B1(int, ...)
  int x;
  int y = get();
};
 
void test() {
  D1 d(2, 3, 4); // OK: B1 is initialized by calling B1(2, 3, 4),
                 // then d.x is default-initialized (no initialization is performed),
                 // then d.y is initialized by calling get()
  D1 e;          // Error: D1 has no default constructor
}
 
struct D2 : B2 {
  using B2::B2; // inherits B2(double)
  B1 b; // unable to implicitly initialize b, parent constructor can't be used
};
 
D2 f(1.0);       // error: B1 has no default constructor
```





# in-class initialization

在C++03中，禁止在struct或class定义中为成员指定默认值，只能使用initialization-list进行指定，但从C++11开始，允许在定义时为成员指定默认值了。指定默认值时，可以使用=，也可以使用C++11新提供的initializer-list初始化列表语法。（注意上面的表述中有一个例外：大多数编译器一直允许为static const整型成员指定默认值。）

如果同时使用了列表初始化和就地初始化，编译器需要保证最终列表初始化覆盖就地初始化。



# 静态成员变量定义

静态成员变量在类的头文件中声明，但必须在实现文件中定义，因为一个符号只能被定义一次，如果将定义放在头文件中，一旦任意两个文件引用了这个头文件，那么该静态变量就会被定义两次，导致链接错误。



# C++陷阱

在函数调用语法中，C++没有明确规定各个参数表达式的求值顺序，这可能会导致问题：



```
// dont do this
callSomeMethod(new std::shared_ptr<Widget>(new Widget), methodMayThrow());

// this is ok
std::shared_ptr<Widget> widgetPtr = new std::shared_ptr<Widget>(new Widget);
callSomeMethod(widgetPtr, methodMayThrow());
```



如果上面的函数调用中，如果new Widget先被执行了，然后methodMayThrow被执行，最后才轮到shared_ptr的构造，那么一旦methodMayThrow抛出了异常，new Widget占用的资源就永远得不到清理。

为什么C++不对这种场景进行明确的规定？因为C++的设计哲学中，更多的考虑的是效率、语言能力，规范制定得往往较为宽松，留给编译器实现者充足的优化空间，易用性并不在其中，开发者必须自己识别出代码中的缺陷并加以规避，因此C++是一门初学者很难上手，但在专家手中非常好用的语言。



# 方法调用的习惯

方法参数应该尽量声明成const reference，而不是value，避免不必要的拷贝构造函数调用；

但是，需要返回新创建的值时，直接返回value一般没什么问题，因为编译器有RVO。



# 命名空间与名字查找(argument-dependent-lookup)

在函数调用发生时，C++规定编译器应该尝试去参数类型所处的命名空间中查找函数，这使得如下的程序能够通过编译：



```
namespace MyNameSpace {
    template <typename T>
    class MyClass {...};
    
    template <typename T>
    void swap(MyClass<T>& lhv, MyClass<T>& rhv) {...}
}

// 初始化myClass1, myClass2
// 以下语句可以被编译，相当于MyNameSpace::swap(myClass1, myClass2);
swap(myClass1, myClass2);
```



C++标准规定std命名空间内的template可以被客户全特化，但是禁止添加任何新的template、function、class到std命名空间中去，这意味着我们可以全特化std命名空间中的swap，但是却不能在std中声明一个新的swap模板方法：



```
namespace std {
    // ok
    void swap(Widget<MyClass>& a, Widget<MyClass>& b) {...};   
    // 下面这个是标准禁止的
    template <typename T>
    void swap(Widget<T>& a, Widget<T>& b) {...};
}
```



C++的这种特殊的名字查找规则规定：在查找函数名字时，应先在参数类型所处作用域中查找，在模板编程中为了能够在模板类型定义了自己的swap时，使用模板类型自己的swap，并在其他情况下使用std的标准swap，可以这样写：



```
template <typename T>
void myFunction(T& a, T& b) {
    using std::swap;
    // 如果T所处的命名空间内有合适的swap函数，会优先使用；否则，才会使用上面引入的std命名空间的swap
    swap(a, b);
}
```



# 降低编译依存关系

C++库通常会提供给用户一个头文件，头文件详细描述了库所提供的功能，同时不透露任何实现细节。这可以确保用户只依赖库提供的对外头文件，而不用依赖任何实现的细节。

通常，这是由如下的技术实现的：



```
// interface.h, 对外接口头文件
// 前置声明
class MyInterfaceImpl;
class MyInterface {
public:
    void a();
    void b();
private:
    MyInterfaceImpl* impl;
};

// interface.cpp, 实现文件
class MyInterfaceImpl {
public:
    void a();
    void b();
};
void MyInterface::a() {
    impl->a();
}
    
```



# CRTP

crtp指的是curiously recurring template pattern，奇异递归模板模式。

维基百科指出，奇异递归模板模式让基类可以调用子类的非virtual方法，用这种模式即兼顾了运行效率，又获得了类似多态的表现；

而Effective C++指出，如果每个子类都需要独享基类中定义的static成员变量，可以使基类成为一个template类，然后在继承基类时以子类作为模板类型参数实例化基类。



# placement new

通常，placement new指的是：当客户调用new (ptr) Widget时，会有一个特定版本的operator new就会被编译器调用（void* operator new(std::size_t, void*)）。上述形式的operator new被专门用来将Widget对象构造在addr指向的内存处，这件事是由编译器完成的，编译器中实际的placement new方法实现仅仅返回传入的地址即可。

自定义类可以通过定义一个 static void* operator new(std::size_t, void*) 静态成员方法来替换编译器的默认实现。

如果使用placement new来在指定的位置构造了一个对象，在需要销毁这个对象时一定要小心，明确能否直接使用delete释放所处内存，如果这片内存不应该在这个对象销毁时被释放，就需要仅调用对象的destroctor，而不可以直接使用delete。



不过，placement new其实还有另外的意思，事实上C++标准允许我们在常规的operator new的std::size_t参数之后声明任意额外参数，只要在使用new关键字创建堆上对象时，通过括号传入兼容的参数即可（不过除了void*以外的额外参数没有编译器的默认实现）。通常大家在说placement new时，指的都是第一个意思。



# Const重载

C++中，被声明为const的成员函数和没有被声明为const的成员函数是两个同名的重载函数。

当调用const对象的方法时，只有被const修饰的成员函数会被考虑；但是当调用没有const修饰的对象的方法时，会优先调用无const修饰的成员函数，如果没有找到，编译器会接着尝试调用有const修饰的成员函数。这非常合理，const是强保证，确保方法调用时不会修改对象上的任何属性，因此const对象只能调用const方法，对于非const对象，有无强保证都无所谓。一般来说，如果实现了const版本的成员函数，就不应该再实现一个非const版本的成员函数了。

当函数的参数类型中有const时，top-level cv qualifiers都会被移除掉，因为函数参数是按值传递的，顶级cv qualifier没有意义，只有次级cv qualifier会被保留到函数签名中。

什么是top-level cv qualifier？https://stackoverflow.com/questions/24676824/where-is-the-definition-of-top-level-cv-qualifiers-in-the-c11-standard



# 异常

C++的异常被抛出时，抛出的异常的类型是在编译时静态确定的，如果通过一个base&抛出一个实际类型是derived类型的异常，最终被抛出的异常类型不是derived，而是base；

在确定被抛出的异常和哪个catch语句匹配时，C++不会尝试做隐式类型转换，只有两种转换是会自动尝试的：

- 子类会与父类catch语句匹配，catch语句参数是by reference, by value, 还是by pointer（如果是by value，会有问题吗？会的，父类以外部分会被“切割”掉，这个对象将表现不出来子类特征）
- 指针类型一定会和无类型指针类型的catch语句catch(void *)匹配

即使catch语句中参数是by reference，被throw的异常对象也会被先拷贝一份，然后被引用的实际上是这个被拷贝的对象，它的生命期就是catch语句块；

在catch语句块中，throw exception和throw是不同的，前者会导致被catch的exception被复制一份，而后者不会复制，直接将catch到的excepition抛出。



# 继承

## misc

子类实现父类的虚函数时，其返回类型不必和父类虚函数声明完全一致，如果父类虚函数返回类型声明为一个基类的指针或者引用，那么子类可以将返回类型声明为基类的子类的指针或者引用。这样的宽松不会导致类型问题，毕竟一个父类的指针或者引用必然可以接收子类的指针或者引用，并且可以享受到多态性带来的便利。

## More Effective C++

在More Effective C++中，提到了virtual constructor，和virtual copy constructor，这种说法其实不太合适，virtual constructor就是一个普通函数，返回基类指针或引用，根据其参数确定实际返回的类型，factory就是典型的virtual constructor的应用；而virtual copy constructor指的是真正的virtual方法，该virtual方法负责通过copy constructor复制自身，相当于Java中的clone方法。

类似的，还有virtual non member function也不是指一个真正的虚函数，而是指一种技巧：为了让一个类型的non member function表现出多态行为，需要在这个类型中定义一个虚函数并在这个虚函数中实现non member function的需求，然后再定义一个参数为指定类型的non member function，调用类提供的这个虚函数。



# 智能指针

说到智能指针，我们应该想到：构造和析构、复制和赋值、解引用。

- 构造和析构、复制和赋值：如何实现构造函数和复制构造函数？如何实现赋值函数？如何实现析构函数？
- 解引用：如何实现->和* operator函数？

- - operator*应该返回被指向的真实对象引用（为什么是引用？当然是为了避免将你本来已经指向的对象再复制一份。。）；
    - operator->应该返回一个定义了operator->方法的对象（如果调用a->hello()，其实会被解释成a.(operator->)->hello()，也就是说一个对象的operator->必须返回一个长得向指针的类型，然后编译器会对这个返回的类型调用后面的hello方法），对于智能指针来说就是应该返回指针本身。

更加有经验的人除了上面的主题，还会想到：如何测试智能指针是否为null？能否判断智能指针是否存在，比如if (ptr) {...}？答案是前者通常要提供一个隐式转换操作符：operator void*，后者要求我们提供另一个隐式转换操作符：operator bool。



# 数组引用

数组也是有引用语法的。学习C和C++时，我们都学过数组作为函数调用的参数传递时，会被隐式转换成一个指针，但其实C++允许我们直接传递数组引用：

void acceptArrayRef(const int (&arr)[10]) {...}

这样，就声明并定义了一个能够接受长度为10的数组作为参数的函数。

不过，作为一个现代的C++程序员，总是应该更倾向于stl容器，而不是原始数组。



# 模板类型推导

模板类型推导往往相当直接，比如：



```
template <typename T>
void test(Param p) {...}    
// 当然上边的代码无法编译，因为Param是一个方便我们描述用的符号，实际表示的是T*, const T*等等，
// 下面会讨论Param为不同的模板类型时，编译器如何处理
```



当我们调用test时，参数p的类型是什么，那么Param就会被推成什么，而T则是根据Param来推导的。这里面Param其实是一个由T构成的类型修饰，如const T，或者const T&，此时Param分别指的是const T整体和const T&整体的类型。



果真如此吗？现在考虑三种情况：

## Param是个引用或指针

如果函数被声明为test(Param& p)或test(Param* p)，那么推导时，Param会保留p的cv限定符。也就是说，当p是一个const Widget*或者const Widget&时，Param成为const Widget。



## Param是个万能引用

test(Param&& p)

如果p是个左值，Param会被推导成左值引用；如果p是个右值，Param会被推导成右值引用。

随后，根据引用合并规则，&&&被视作左值引用，而&&&&被视作右值引用。

cv限定符会被保留。



## Param不是引用或指针

此时推导规则会对应按值传递。按值传递时，会发生拷贝构造，传递过来的值一定不是参数本身。

当p是一个引用时，Param不会被推导成引用。

p的cv限定符会被忽略，因为p的副本和p不是同一个对象，不需要保留限定。



## 当p是数组

当p是数组时，如果Param是引用，那么Param会被推导成数组引用：如int (&)[10]这样的类型。

而如果Param不是引用，那么Param一定会被推导成一个指针。

可以利用这一点实现一个推导数组长度的编译时方法：



```
template <typename T, std::size_t N>
constexpr std::size_t arraySize(T (&)[N]) noexcept {
    return N;   
}
```



## 当p是函数

当p是函数，情况和数组很像，因为函数也是一个可以退化成指针，也可以被直接引用的类型。



# 模板类型推导和auto

auto类型推导的形式如下：

const auto& a = p;

可以将const auto&这样的带修饰的类型看作上面模板里的Param，而将auto看作一个裸的类型T，如此，类型推导规则便和模板类型推导对得上了。

auto类型推导仅有一处和模板不同：initializer-list。

C++11增加了initializer-list语法，这使得我们可以使用四种方式初始化int：

int x = 2;

int x(2);

int x = {27}; // C++11

int x{27};   // C++11

如果将上面的int以auto替换，那么有initializer-list的初始化方式会导致auto被推导为std::initializer_list。

而如果为一个test(Param p)传入{27, 2, 3}这样的表达式，模板推导规则将无法推导出std::initializer_list。这是C++模板和auto推导规则的唯一不同之处。



普通的函数不能将参数或返回值声明为auto，毕竟如果你需要auto，那么你可以使用模板函数。

但是，如果要写lambda表达式，要想使用模板的语法来声明入参类型和返回值就太过麻烦了，毕竟lambda就是用来简化functor的编写的。此时C++规定可以在lambda中使用auto来起到模板函数中的Param及T的效果，但此时auto只是模板函数的一种简写，推导规则依然以模板为准，也就是说，initializer-list此时不受支持。



# template typedef

考虑你有一个模板：

map<Key, Value>

如果你想要声明一个模板别名：

template <typename Value> using IntKeyMap = map<int, Value>;

你会发现C++编译器阻止你这样做。这不是正确的C++语法。但是，为了达到我们的目的，可以这样做：

template <typename Value>

struct BindedIntMap {

using type = map<int, Value>;

}

然后，就可以通过BindedIntMap::type来表示前面我们想要的类型了。事实上这种做法在C++标准库中非常普遍，so get used to it!



上面的写法还导出一个经常被人们忽视的细节：如果我们将BindedIntMap作为模板参数实例化模板，会怎么样？比如：

template <typename T>

void test() {

T::type<int> map;

}

考虑一下可怜的编译器要怎么理解上面的T::type<int>，T::type是一个static变量？一个类型？还是一个模板？不同的场景上面的语句有不同的解释，编译器要到真正实例化时才能弄清楚这句代码的意图，但那有点太晚了，能不能在编译时期就确定代码的意图？答案：https://stackoverflow.com/questions/610245/where-and-why-do-i-have-to-put-the-template-and-typename-keywords。

如果T::type是一个类型，那么需要使用typename：

typename T::type map;

但是如果T::type是一个模板，语法又稍微有些区别：

T::template type<int> map;

上面的两个例子都无法正常编译，因为很多时候这两个技巧要结合起来才是正确的模板类型声明：

typename T::template type<int> map;

语言设计上的精巧和持续超出初学者的预期，这就是C++的魅力。。。



# 函数指针

C++标准规定，任何一个函数都可以被隐式的转换成函数指针，给定void test(int)，下面几种写法，最终的结果都会是一个void(*)(int)类型的指针：

*test

&test

test

****test

C++允许使用一个函数指针或者函数来进行函数调用，有了一个C++的函数指针：void(*ptrFunc)(int)，下面几种写法都是合法的函数调用：

(*ptrFunc)(1);

ptrFunc(1);

(******ptrFunc)(1);

再次感叹，C++的魅力。



# 模板重载

函数重载指的是拥有不同的参数类型或者数量的不同函数可以拥有同样的名称。当我们说不同类型的参数时，要记得const和volatile也是类型的一部分。

如果要为不同类型的参数实现一套完全相同的算法，那么可以为每个类型的参数编写函数，不过C++提供了函数模板来简化这个工作。



# SFINAE

Substitution failure is not an error，替换失败并不是错误。

指的是在进行模板实例化时，如果编译器遇到了错误，就会认为这种实例化是ill-formed，并放弃进行实例化，转而寻找其他特化。

需要注意的是，在C++11中，SFINAE只在“immediate context”中生效，也就是模板参数和函数参数/返回类型实例化阶段生效，函数body内部的"substitution failure"依然会导致error。

要想理解C++11的std标准库提供的各式各样的模板，必须要对SFINAE、函数重载决议、模板特化规则等常规OO风格的C++中不太被提及的方面非常了解和熟悉，然后还要多看些模板元编程的设计惯例、模式，否则生啃标准源码的效率会很低，正常的C++书籍中对于模板编程一般不会有非常详细的讲解。

利用SFINAE，我们得以通过模板编程技巧指定一个模板可接受的参数类型特征，为模板指定明确的重载规则。



# 临时对象

C++中，一个表达式可能由多个子表达式构成，标准并未明确各个语义上无依赖关系的子表达式的求值顺序，不要认为最左边的表达式会被率先求值。如果多个表达式之间没有语法上的依赖关系，只有语义上的依赖关系，那么必须要将这些表达式放在不同的行，明确指定求值顺序。

如果子表达式会导致产生临时对象，那么这个临时对象会在整个表达式求值结束后才会被析构、回收内存。不过，标准在这方面有个非常特殊的规定：一个const引用可以短暂地延长临时对象的生命，临时对象若被赋给引用，则这个临时对象的生命期会被延长到引用无效，或者是临时对象所在作用域结束时。



# C风格变长参数

https://zh.cppreference.com/w/c/variadic

C中可以在函数声明中使用...代表任意数量任意类型的参数，但是...前面必须至少存在一个具名参数：

void test(char* buf, size_t length, ...);

被...代表的参数会经历参数类型提升，整数类型的char和boolean都会被提升为int，而float类型会被提升为double。

为了在函数体中使用变长参数，必须使用<stdarg.h>库提供的工具方法：

- va_start
- va_arg
- va_end
- va_list

上面的方法都是宏方法，安全性需要使用者自行保证，如果调用va_arg次数超出了实际传入的变长参数个数，其行为是未定义的。

文档中对此没有过多解释，直接提供了两个例子：



如何在函数体中使用变长参数：

```
#include <stdio.h>
#include <stdarg.h>
 
void simple_printf(const char* fmt, ...)
{
    va_list args;
    va_start(args, fmt);
 
    while (*fmt != '\0') {
        if (*fmt == 'd') {
            int i = va_arg(args, int);
            printf("%d\n", i);
        } else if (*fmt == 'c') {
            // 将提升 'char' 类型值为 'int'
            // C 中字符常量自身为 'int' 类型
            int c = va_arg(args, int);
            printf("%c\n", c);
        } else if (*fmt == 'f') {
            double d = va_arg(args, double);
            printf("%f\n", d);
        }
        ++fmt;
    }
 
    va_end(args);
}
 
int main(void)
{
    simple_printf("dcff", 3, 'a', 1.999, 42.5); 
}
```



如何将变长参数转发给另一个接受变长参数的函数：

```
#include <stdio.h>
#include <time.h>
#include <stdarg.h>
 
void tlog(const char* fmt,...)
{
    char msg[50];
    strftime(msg, sizeof msg, "%T", localtime(&(time_t){time(NULL)}));
    printf("[%s] ", msg);
    va_list args;
    va_start(args, fmt);
    vprintf(fmt, args);
    va_end(args);
}
 
int main(void)
{
   tlog("logging %d %d %d...\n", 1, 2, 3);
}
```



# 栈上对象销毁顺序

栈上对象总是以和创建顺序相反的顺序被销毁。



# 委托构造函数

C++11起，可以使用委托构造函数。



```
class Foo {
public: 
  Foo(char x, int y) {}
  Foo(int y) : Foo('a', y) {} // Foo(int) 委托到 Foo(char,int)
};
```



# 模板特化与实例化

## 特化

模板特化分为全特化和偏特化，使用template<>关键字进行模板特化，介绍：

https://harttle.land/2015/10/03/cpp-template.html



## 实例化

实例化分为显式实例化和隐式实例化，隐式实例化就是编译期间按需根据模板头文件生成实际代码，显式实例化则是不论是否需要进行模板实例化，编译时都会生成一份指定的代码参与编译。

显式实例化使用不带模板类型部分的template关键字进行，在对类进行显式实例化时，必须提供所有static属性的定义，定义static属性时要使用和特化类似的语法：template <> VAR_TYPE TYPE::sVar = ...。