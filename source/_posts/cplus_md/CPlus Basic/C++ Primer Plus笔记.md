---
title: C++ Primer Plus笔记
date: '2020/12/31 23:59'
tags:
 - cpp
categories:
 - 学习笔记
abbrlink: 13010
cover: img/cpp.png
---

# C++ Primer Plus笔记

## 预备知识

### 如何运行C++程序

1. 使用文本编辑器编写程序，保存文件，这个文件就是源代码。

2. 编译源代码。运行程序将源代码翻译为机器语言。翻译后的文件就是目标代码。

3. 将目标代码与其他代码链接起来，生成程序的运行阶段版本。最终产品文件为可执行代码。

   > 链接指的是将目标代码同使用的函数的目标代码以及一些标准的启动代码组合起来，生成程序的运行阶段版本

编程步骤如下图：

​	<img src="./C++ Primer Plus/编程步骤-8644713.png" alt="编程步骤" style="zoom: 67%;" />

> 从4.2版起，g++要求编译源代码文件时使用标记-std=c++0x： `g++ -std=C++11 use_auto.cpp`

## 开始学习C++

### 为什么main()不能使用其他名称？

C++程序必须包含一个名为main()的函数， 这是由系统的C++运行时决定的。编译器生成目标系统的可执行文件时，操作系统的启动入口就是C++运行时，然后运行时完成初始化之后就会调用main函数(入口点)。

存在一些例外情况：比如windows上编写DLL模块，是因为DLL模块不是独立的程序。

### cin不支持录入空格

在C++中，用`cin>>str;`这种方法来接收字符串那么录入的str不能包含空格，否则它会按照空格将整个字符串切分成若干段。如果你要是想输入带空格的字符串那就要用到getline()这个函数了。

```cpp
#include <iostream>

using namespace std;

int main()
{
    string name;
    string address;
    cout << "Please input your name: ";
    getline(cin, name);
    cout << "Please input your address: ";
    getline(cin, address);
    cout << "Your name is " << name << " and address is " << address << endl;
    return 0;
}
```

执行程序：

```shell
(base) phoenine@EvandeMacBook-Pro C_Study_1 % g++ -std=c++17 cpp_chapter_2.cpp -o test
(base) phoenine@EvandeMacBook-Pro C_Study_1 % ./test                                  
Please input your name: Evan Yang
Please input your address: Comba Street 64, cot
Your name is Evan Yang and address is Comba Street 64, cot
(base) phoenine@EvandeMacBook-Pro C_Study_1 % 
```

## 处理数据

### 整型的范围

整型： char、short、int、long、long long(C++11)

C++提供了一种灵活的标准，确保了最小长度：

* short至少16位
* int至少与short一样长
* long至少32位，且至少与int一样长
* long long至少64位，且至少与long一样长

查看大小：

```cpp
#include <iostream>
#include <climits>

using namespace std;

int main()
{
    int n_int = INT_MAX;
    short n_short = SHRT_MAX;
    long n_long = LONG_MAX;
    long long n_llong = LLONG_MAX;

    cout << "int is " << sizeof(int) << " bytes" << endl;
    cout << "short is " << sizeof(short) << " bytes" << endl;
    cout << "long is " << sizeof(long) << " bytes" << endl;
    cout << "long long is " << sizeof(long long) << " bytes" << endl;

    cout << "int is " << n_int << endl;
    cout << "short is " << n_short << endl;
    cout << "long is " << n_long << endl;
    cout << "long long is " << n_llong << endl;
  	return 0；
}
```

输出：

```shell
(base) phoenine@EvandeMacBook-Pro C_Study_1 % ./test                                  
int is 4 bytes
short is 2 bytes
long is 8 bytes
long long is 8 bytes
int is 2147483647
short is 32767
long is 9223372036854775807
long long is 9223372036854775807
(base) phoenine@EvandeMacBook-Pro C_Study_1 % 
```

### 整型的字面值

C++能以三种不同的计数方式来书写整数：

* 基数为10
* 基数为8(老式UNIX版本)：0
* 基数为16(硬件黑客的最爱)： 0x或者0X

```cpp
#include <iostream>

using namespace std;

int main()
{
    int chest = 42;
    int waist = 42;
    int inseam = 42;

    cout << "Monsieur cuts a striking figure !\n";
    cout << "chest = " << chest << " (decimal for 42)\n";
    cout << hex;
    cout << "waist = " << waist << " (hexadecimal for 42)\n";
    cout << oct;
    cout << "inseam = " << inseam << " (octal for 42)\n";
    return 0;
}
```

输出：

```shell
(base) phoenine@EvandeMacBook-Pro C_Study_1 % ./test                                  
Monsieur cuts a striking figure !
chest = 42 (decimal for 42)
waist = 2a (hexadecimal for 42)
inseam = 52 (octal for 42)
```

### 类型转换

C++11将使用大括号的初始化称为列表初始化(list-initialization)，这种初始化常用于给复杂的数据类型提供值列表。列表初始化不允许缩窄(narrowing)，即变量的类型可能无法表示赋给它的值。例如：

```cpp
const int code = 66;
int x = 66;
char c1 {31325}; // narrowing, not allowed
char c2 {66}; //allowed because char can hold 66
char c3 {code}; //ditto
char c4 = {x}; // not allowed, cause x is not constant
x = 32325;
char c5 = x;  //allowed by this form of initialization
```

编译：

```shell
(base) phoenine@EvandeMacBook-Pro C_Study_1 % g++ -std=c++17 cpp_chapter_2.cpp -o test
cpp_chapter_2.cpp:9:14: error: constant expression evaluates to 31325 which cannot be narrowed to type 'char' [-Wc++11-narrowing]
    char c1 {31325}; // narrowing, not allowed
             ^~~~~
cpp_chapter_2.cpp:9:14: note: insert an explicit cast to silence this issue
    char c1 {31325}; // narrowing, not allowed
             ^~~~~
             static_cast<char>( )
cpp_chapter_2.cpp:12:16: error: non-constant-expression cannot be narrowed from type 'int' to 'char' in initializer list [-Wc++11-narrowing]
    char c4 = {x}; // not allowed, cause x is not constant
               ^
cpp_chapter_2.cpp:12:16: note: insert an explicit cast to silence this issue
    char c4 = {x}; // not allowed, cause x is not constant
               ^
               static_cast<char>( )
cpp_chapter_2.cpp:9:14: warning: implicit conversion from 'int' to 'char' changes value from 31325 to 93 [-Wconstant-conversion]
    char c1 {31325}; // narrowing, not allowed
            ~^~~~~
1 warning and 2 errors generated.
```

### auto声明

C++11新增一个工具，让编译器能够根据初始化值的类型推断变量的类型。重新定义了auto的含义。

`auto n = 100` // n is int

`auto x = 1.5;`  // x is double

`auto y = 1.3e12L` // y is long double

处理复杂类型，比如STL中的类型时，自动类型的优势才能显现出来：

```cpp
std::vector<double> scores;
auto pv = scores.begin()
```

## 复合类型

### C++11数组初始化

初始化数组的时候，可以省略等号：

`double earning[4] = {1.2e4, 1.1e4, 1.6e4, 1.7e4}`等价于

`double earning[4] {1.2e4, 1.1e4, 1.6e4, 1.7e4}`

关于列表初始化的缩窄问题：

```cpp
#include <iostream>

using namespace std;

int main()
{
    long plifs[] = {25, 29, 3.0};
    char slifs[4] = {'h', 'i', 1122011, '\0'};
    char tlifs[4] = {'h', 'i', 112, '\0'};
    return 0;
}
```

编译：

```shell
(base) phoenine@EvandeMacBook-Pro C_Study_1 % g++ -std=c++17 cpp_chapter_2.cpp -o test
cpp_chapter_2.cpp:7:29: error: type 'double' cannot be narrowed to 'long' in initializer list [-Wc++11-narrowing]
    long plifs[] = {25, 29, 3.0};
                            ^~~
cpp_chapter_2.cpp:7:29: note: insert an explicit cast to silence this issue
    long plifs[] = {25, 29, 3.0};
                            ^~~
                            static_cast<long>( )
cpp_chapter_2.cpp:8:32: error: constant expression evaluates to 1122011 which cannot be narrowed to type 'char' [-Wc++11-narrowing]
    char slifs[4] = {'h', 'i', 1122011, '\0'};
                               ^~~~~~~
cpp_chapter_2.cpp:8:32: note: insert an explicit cast to silence this issue
    char slifs[4] = {'h', 'i', 1122011, '\0'};
                               ^~~~~~~
                               static_cast<char>( )
cpp_chapter_2.cpp:8:32: warning: implicit conversion from 'int' to 'char' changes value from 1122011 to -37 [-Wconstant-conversion]
    char slifs[4] = {'h', 'i', 1122011, '\0'};
                    ~          ^~~~~~~
1 warning and 2 errors generated.
```

### 为什么使用cin.get()

istream类有一个get()成员函数。

使用不带任何参数的cin.get()可以读取下一个字符(即使是换行符)， 因此可以处理换行符，比如：

```cpp
cin.get(name, ArSize);     // read first line
cin.get();                 // read newline
cin.get(dessert, ArSize);  // read second line
```

另一种使用get()的方式是将两个类成员函数拼接起来：

`cin.get(name, ArSize).get()`

之所以可以这么做，是因为cin.get(name, ArSize)返回一个cin对象，该对象随后将被用来调用get()函数。

```cpp
#include <iostream>

using namespace std;

int main()
{
    const int ArSize = 20;
    char name[ArSize];
    char dessert[ArSize];

    cout << "Enter your name: \n";
    cin.get(name ,ArSize).get();
    cout << "Enter your favorite dessert: \n";
    cin.get(dessert, ArSize).get();
    cout << "I have some delicious " << dessert;
    cout << " for you, " << name << ".\n";
    return 0;
}
```

输出：

```shell
(base) phoenine@EvandeMacBook-Pro C_Study_1 % g++ -std=c++17 cpp_chapter_2.cpp -o test
(base) phoenine@EvandeMacBook-Pro C_Study_1 % ./test
Enter your name: 
Evan Yang
Enter your favorite dessert: 
Chocolate Mouses
I have some delicious Chocolate Mouses for you, Evan Yang.
```

### cin.clear()

当cin函数输入错误的时候，cin里面有个函数cin.rdstate()可以自动检测到输入错误，当cin.rdstate()返回0(即ios::goodbit)时表示无错误。若返回4则发生非致命错误，即ios::failbit，不能继续输入或操作。cin.clear()则可以控制此时cin里的标识。其中标识符号有：

* goodbit 无错误 
* Eofbit 已到达文件尾 
* failbit 非致命的输入/输出错误，可挽回 
* badbit　致命的输入/输出错误,无法挽回。若在输入输出类里，需要加ios::标识符号 

cin.clear()一般会与cin.sync()或者cin.ignore()一起使用。cin.sync()代表清除缓冲区中的未读信息， cin.ignore()代表缓冲区中指定个数的字符。

```cpp
#include <iostream>

using namespace std;

int main()
{
    int number = 0;
    while(cin >> number,!cin.eof()) 
    {
        if(cin.bad())
			throw runtime_error("IO stream corrupted");
        if(cin.fail()) 
        {
            
            cout << "Error input: " << cin.rdstate() << endl;
            cin.clear();
            cin.ignore();
          	// cin.sync();   这里用sync会死循环？？？为什么？？？
            cout << "cin.rdstate(): " << cin.rdstate() << endl;
        }
        else
        {
            cout << "Input is: " << number << endl;
            break;
        }
    }
    return 0;
}
```

输出：

```shell
(base) phoenine@EvandeMacBook-Pro C_Study_1 % g++ -std=c++17 cpp_chapter_2.cpp -o test
(base) phoenine@EvandeMacBook-Pro C_Study_1 % ./test                                  
s
Error input: 4
cin.rdstate(): 0
3
Input is: 3
```

