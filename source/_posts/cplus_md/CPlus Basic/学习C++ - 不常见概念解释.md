---
title: 学习C++ - 不常见概念解释
date: '2020/12/31 23:59'
tags:
 - baisc
categories:
 - 使用教程
abbrlink: 13004
cover: img/cpp.png
---
**学习C++ - 不常见概念解释**

# 模板相关

## Dependent Name

https://en.cppreference.com/w/cpp/language/dependent_name

在涉及到模板时，如果引用模板参数中的符号，那么这个符号就是dependent name，即依赖于模板实例化才能确定符号类型。



### Binding Rules

不依赖模板参数的符号是在模板定义时绑定的。如果绑定时和模板实例化时，同一个符号的含义发生了变化，那程序可能会出问题。



### Lookup Rules

依赖模板参数的符号是在模板实例化时才去绑定的。



#### 非ADL

非ADL的情况下，只会在模板定义的上下文寻找符号定义；

下面的例子中，writeObject方法的模板参数类型并不是用户命名空间中定义的，因此对应非ADL场景，只会在模板定义上下文寻找 operator << (std::ostream& os, std::vector<int>&) 符号的定义，不会去用户命名空间中查找：

```
// an external library
namespace E {
  template<typename T>
  void writeObject(const T& t) {
    std::cout << "Value = " << t << '\n';
  }
}
 
// translation unit 1:
// Programmer 1 wants to allow E::writeObject to work with vector<int>
namespace P1 {
  std::ostream& operator<<(std::ostream& os, const std::vector<int>& v) {
      for(int n: v) os << n << ' '; return os;
  }
  void doSomething() {
    std::vector<int> v;
    E::writeObject(v); // error: will not find P1::operator<<
  }
}
 
// translation unit 2:
// Programmer 2 wants to allow E::writeObject to work with vector<int>
namespace P2 {
  std::ostream& operator<<(std::ostream& os, const std::vector<int>& v) {
      for(int n: v) os << n <<':'; return os << "[]";
  }
  void doSomethingElse() {
    std::vector<int> v;
    E::writeObject(v); // error: will not find P2::operator<<
  }
}
```



#### ADL

ADL的情况下，不仅会在模板定义的上下文，还会在模板实例化的上下文寻找符号定义；

在下面的这个例子中，模板参数中包括用户命名空间P1中的C，因此对应着ADL场景，会在P1中寻找合适的函数。

```
namespace P1 {
  // if C is a class defined in the P1 namespace
  std::ostream& operator<<(std::ostream& os, const std::vector<C>& v) {
      for(C n: v) os << n; return os;
  }
  void doSomething() {
    std::vector<C> v;
    E::writeObject(v); // OK: instantiates writeObject(std::vector<P1::C>)
                       //     which finds P1::operator<< via ADL
  }
}
```



## injected-class-name

https://zh.cppreference.com/w/cpp/language/injected-class-name

### 非模板情况

在类作用域中，可以直接使用当前类名来指代当前类，这个类名被称为“注入类名”，这个和当前类名相同的符号是在类定义一开始就被自动注入的，注入类名可以被继承，因此private继承可能导致父类的注入类名对子类不可见，此时只能通过使用父类namespace来显式地指代父类；

### 模板情况

在模板类的作用域中，类名即可指代当前类，又可指代当前模板名称，需要多加分辨。



### 注入类名与构造函数

在类作用域中，注入类名被当作构造函数的名称，由此引入了一个需要注意的规则：

在限定名C::D解析过程中，如果D是C作用域中的注入类名，且编译器认为C::D可能是一个函数，那么该限定名一定会被解析成构造函数：

不过事实上，只有当D和C同名时，C才会是D作用域的注入类名，毕竟对于D作用域而言，唯一的注入类名就是D了。。也就是说，C::D规则其实就是C::C规则，当然，标准里面的表述方式逻辑上也没毛病，就是理解起来差点意思。



```
struct A {
    // 在A的作用域开始处，编译器会注入符号A作为注入类名
    A();
    A(int);
    template<class T> A(T) {}
};
using A_alias = A;
 
A::A() {}
A_alias::A(int) {}
template A::A(double);
 
struct B : A {
    using A_alias::A;
};
 
// 编译器认为A::A可能是一个函数，并且在A的作用域中查找到了注入类名A，于是将A::A解释为指代构造函数
A::A a; // 错误：A::A 被认为指名构造函数，而非类型
// 明确指出A::A是一个struct，编译器不会尝试将A::A解释为构造函数
struct A::A a2; // OK：与 'A a2;' 相同
// B的声明作用域中没有注入类名A，编译器不会将B::A解释为构造函数引用
B::A b; // OK：与 'A b;' 相同
```



# 函数相关

## ADL - Argument-dependent lookup

https://en.cppreference.com/w/cpp/language/adl

在编写函数调用（包括操作符函数）语句时，如果函数没有限定符并且在当前环境下找不到定义，编译器根据函数参数的限定符去推测函数限定符的行为。



# 异常相关

## Function-try-block

https://en.cppreference.com/w/cpp/language/function-try-block





# 基础概念

## ODR - One Definition Rule

https://en.cppreference.com/w/cpp/language/definition#One_Definition_Rule

一个符号可以被多次声明，但只能定义一次。



## ill-formed

非良构。当文档中提及ill-formed时，指的是一个遵从标准的C++编译器应该识别这种情况并给出明显提示。



# 名字查找

为了编译std::cout << std::endl，编译器进行了：

- 名字 `std` 的**无限定**的名字查找，找到了头文件 `<iostream>` 中的命名空间 std 的声明
- 名字 `cout` 的**有限定**的名字查找，找到了命名空间 `std` 中的一个变量声明
- 名字 `endl` 的有限定的名字查找，找到了命名空间 `std` 中的一个函数模板声明
- 名字 `operator <<` 的两个[**实参依赖查找**](https://zh.cppreference.com/w/cpp/language/adl)找到命名空间 `std` 中的多个函数模板声明，而名字 `std::ostream::operator<<` 的**有限定名字查找**找到声明于类 `std::ostream` 中的多个成员函数



对于函数和函数模板的名字，名字查找可以将同一个名字和多个声明联系起来，而且可能从[实参依赖查找](https://zh.cppreference.com/w/cpp/language/adl)中得到额外的声明。还会进行[模板实参推导](https://zh.cppreference.com/w/cpp/language/function_template)，并将声明的集合交给[重载决议](https://zh.cppreference.com/w/cpp/language/overload_resolution)，由它选择所要使用的那个声明。如果适用的话，[成员访问](https://zh.cppreference.com/w/cpp/language/access)的规则只会在名字查找和重载解析之后才被考虑。



## 有限定的名字查找

*限定*名，是出现在作用域解析操作符 `**::**` 右边的名字（参阅[有限定的标识符](https://zh.cppreference.com/w/cpp/language/identifiers#.E6.9C.89.E9.99.90.E5.AE.9A.E7.9A.84.E6.A0.87.E8.AF.86.E7.AC.A6)）。 限定名可能代表的是：

- 类的成员（包括静态和非静态函数、类型和模板等）
- 命名空间的成员（包括其它的命名空间）
- 枚举项

若 `**::**` 左边为空，则查找过程仅会考虑全局命名空间作用域中作出（或通过 [using 声明](https://zh.cppreference.com/w/cpp/language/namespace)引入到全局命名空间中）的声明。这样一来，即使局部声明隐藏了该名字，也能够访问它。


在能对 `**::**` 右边的名字进行名字查找之前，必须完成对其左边的名字的查找（除非左边所用的是 [decltype](https://zh.cppreference.com/w/cpp/language/decltype) 表达式或左边为空）。对左边的名字所进行的查找，根据这个名字左边是否有另一个 `**::**` 可以是有限定或无限定的，但其仅考虑命名空间、类类型、枚举和能特化为类型的模板（这一句话的意思参考下面的例子）。



```
struct A {
  static int n;
};
int main() {
  int A;
  A::n = 42;    // 正确：对 :: 左边的 A 的无限定查找忽略变量。因为A在当前作用域中不是类型
  A b;          // 错误：对 A 的无限定查找找到了变量 A
}
```



若 `**::**` 后跟字符 `**~**` 再跟着一个标识符（也就是说指定了析构函数或伪析构函数），那么该标识符将在 `**::**` 左边的名字相同的作用域中查找。下面的例子可以让你喝一壶：



```
struct C { typedef int I; };
typedef int I1, I2;
extern int *p, *q;
struct A { ~A(); };
typedef A AB;
int main() {
  p->C::I::~I(); // ~ 之后的名字 I 在 :: 前面的 I 的同一个作用域中查找
                 //（也就是说，在 C 的作用域中查找，因此查找结果是 C::I ）
  q->I1::~I2();  // 名字 I2 在 I1 的同一个作用域中查找，
                 // 也就是说从当前的作用域中查找，因此查找结果是 ::I2
  AB x;
  x.AB::~AB(); // ~ 之后的名字 AB 在 :: 前面的 AB 的同一个作用域中查找
               // 也就是说从当前的作用域中查找，因此查找结果是 ::AB
}
```





#### 枚举项

若对左边的名字的查找结果是[枚举](https://zh.cppreference.com/w/cpp/language/enum)（无论是有作用域还是无作用域），右边名字的查找结果必须是属于该枚举的一个枚举项，否则程序非良构。

####  

#### 类成员

若对左边的名字的查找结果是某个类、结构体或联合体的名字，则 `**::**` 右边的名字在该类、结构体或联合体的作用域中进行查找（因此可能找到该类或其基类的成员的声明），但有以下例外情况：

- 析构函数按如上所述进行查找（即在 :: 左边的名字的作用域中查找）
- [用户定义转换](https://zh.cppreference.com/w/cpp/language/cast_operator)函数名中的转换类型标识（ conversion-type-id ），首先在该类类型的作用域中查找。若未找到，则在当前作用域中查找该名字。
- 模板实参中使用的名字，在当前作用域中查找（而非在模板名的作用域中查找）
- [using 声明](https://zh.cppreference.com/w/cpp/language/namespace)中的名字，还考虑在当前作用域中声明的变量、数据成员、函数或枚举项所隐藏的类或枚举名



若 `**::**` 右边所指名的是和其左边相同的类，则右边的名字表示的是该类的[构造函数](https://zh.cppreference.com/w/cpp/language/constructor)。这种限定名仅能用在构造函数的声明以及引入[继承构造函数](https://zh.cppreference.com/w/cpp/language/using_declaration#.E7.BB.A7.E6.89.BF.E6.9E.84.E9.80.A0.E5.87.BD.E6.95.B0)的 [using 声明](https://zh.cppreference.com/w/cpp/language/using_declaration)中。在所有忽略函数名的查找过程中（即在查找 `**::**` 左边的名字，或查找[详述类型说明符](https://zh.cppreference.com/w/cpp/language/elaborated_type_specifier)或[基类说明符](https://zh.cppreference.com/w/cpp/language/derived_class)中的名字时），则将同样的语法解释成**注入类名（ injected-class-name ）**：struct A::A a2; a2类型就是struct A。



有限定名字查找可用来访问被嵌套声明或被派生类隐藏了的类成员。对有限定的成员函数的调用将不再是**虚调用**。



#### 命名空间的成员

若 `**::**` 左边的名字代表的是命名空间，或者 `**::**` 左边为空（这种情况其代表全局命名空间），那么 `**::**` 右边的名字就在这个命名空间的作用域中进行查找，但有以下例外：

- 在模板实参中使用的名字在当前作用域中查找



```
namespace N {
   template<typename T> struct foo {};
   struct X {};
}
N::foo<X> x; // 错误：X 查找结果为 ::X 而不是 N::X
```



在[命名空间](https://zh.cppreference.com/w/cpp/language/namespace) `N` 中进行有限定查找时，首先要考虑处于 `N` 之中的**所有声明**，以及处于 `N` 的[内联命名空间成员](https://zh.cppreference.com/w/cpp/language/namespace#.E5.86.85.E8.81.94.E5.91.BD.E5.90.8D.E7.A9.BA.E9.97.B4)（并且传递性地包括它们的内联命名空间成员）之中的**所有声明**。如果这个集合中没有找到任何声明，则再考虑在 `N` 和 `N` 的所有传递性的内联命名空间成员中发现的**所有**[**using 指令**](https://zh.cppreference.com/w/cpp/language/namespace#using_.E6.8C.87.E4.BB.A4)**所指名的命名空间之中的声明**。这条规则是递归实施的：



```
int x;
namespace Y {
  void f(float);
  void h(int);
}
namespace Z {
  void h(double);
}
namespace A {
  using namespace Y;
  void f(int);
  void g(int);
  int i;
}
namespace B {
  using namespace Z;
  void f(char);
  int i;
}
namespace AB {
  using namespace A;
  using namespace B;
  void g();
}
void h()
{
  AB::g();  // 在 AB 中查找，找到了 AB::g 并且选择了 AB::g(void)
            // （并未在 A 和 B 中查找）
  AB::f(1); // 首先在 AB 中查找，未能找到 f
            // 然后再在 A 和 B 中查找
            // 找到了 A::f 和 B::f（但并未在 Y 中查找，因而不考虑 Y::f）
            // 重载解析选中 A::f(int)
  AB::x++;    // 首先在 AB 中查找，未能找到 x
              // 然后再在 A 和 B 中查找。未能找到 x
              // 然后再在 X 和 Y 中查找。还是没有 x：这是一个错误
  AB::i++;  // 在 AB 中查找，未能找到 i
            // 然后再在 A 和 B 中查找。找到了 A::i 和 B::i：这是一个错误
  AB::h(16.8);  // 首先在 AB 中查找：未能找到 h
                // 然后再在 A 和 B 中查找。未能找到 h
                // 然后再在 X 和 Y 中查找。
                // 找到了 Y::h 和 Z::h。重载解析选中 Z::h(double)
}
```



上面的例子中多次定义同一个符号是违法的，但是同一个声明允许被多次找到：



```
namespace A { int a; }
namespace B { using namespace A; }
namespace D { using A::a; }
namespace BD {
  using namespace B;
  using namespace D;
}
void g()
{
  BD::a++; // OK ： 通过 B 和 D 找到同一个 A::a
}
```



## 无限定的名字查找





## 最内层的外围命名空间

这是英文原文：innermost enclosing namespace 的标准中文表述。

这种表述出现在对友元引入的名字的查找中：

若所查找的是由[友元](https://zh.cppreference.com/w/cpp/language/friend)声明所引入的名字：这种情况下仅考虑其最内层的外围命名空间，否则的话，对外围命名空间的查找将照常持续直到全局作用域。

指的是，如果通过friend引入了名字A，当使用A::a时，只会在A所限定的名字空间中查找a，该查找过程不会扩展到A所处的名字空间，这样的一个严格限定的名字空间就叫做a的最内层的外围名字空间（innermost enclosing namespace）。