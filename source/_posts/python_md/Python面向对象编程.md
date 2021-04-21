---
title: Python 面向对象编程
date: '2020/12/31 23:59'
tags:
  - python
categories:
  - 学习笔记
abbrlink: 16004
cover: 
---

## **Python 面向对象编程** 

面向对象程序设计思想，首先思考的不是程序执行流程，它的核心是抽象出一个对象，然后构思此对象包括的数据，以及操作数据的行为方法。

本专题主要讨论面向对象编程(OOP)的基础和进阶知识，实际开发模型中OOP的主要实践，尽量使用最贴切的例子。

## **基础专题**

### 1 类定义

动物是自然界一个庞大的群体，以建模动物类为主要案例论述OOP编程。

Python语言创建动物类的基本语法如下，使用`class`关键字定义一个动物类：

```python
class Animal():
    pass
```

类里面可包括数据，如下所示的`Animal`类包括两个数据：`self.name`和`self.speed`：

```python
class Animal():
   def __init__(self,name,speed):
       self.name = name # 动物名字
       self.speed = speed # 动物行走或飞行速度
```

注意到类里面通过系统函数`__init__`为类的2个数据赋值，数据前使用`self`保留字。

`self`的作用是指名这两个数据是实例上的，而非类上的。

同时注意到`__init__`方法的第一个参数也带有`self`，所以也表明此方法是实例上的方法。

### 2 实例

理解什么是实例上的数据或方法，什么是类上的数据，需要先建立`实例`的概念，`类`的概念，如下：

```python
# 生成一个名字叫加菲猫、行走速度8km/h的cat对象
cat = Animal('加菲猫',8) 
```

`cat`就是`Animal`的实例，也可以一次创建成千上百个实例，如下创建1000只蜜蜂：

```python
bees = [Animal('bee'+str(i),5) for i in range(1000)]
```

总结：自始至终只使用一个类`Animal`，但却可以创建出许多个它的实例，因此是一对多的关系。

实例创建完成后，下一步打印它看看：

```python
In [1]: print(cat)                                                           
<__main__.Animal object at 0x7fce3a596ad0>
```

结果显示它是`Animal`对象，其实打印结果显示实例属性信息会更友好，那么怎么实现呢？

### 3 打印实例

只需重新定义一个系统(又称为魔法)函数`__str__` ，就能让打印实例显示的更加友好：

```python
class Animal():
   def __init__(self,name,speed):
       self.name = name # 动物名字
       self.speed = speed # 动物行走或飞行速度
  
   def __str__(self):
        return '''Animal({0.name},{0.speed}) is printed
                name={0.name}
                speed={0.speed}'''.format(self)
```

使用`0.数据名称`的格式，这是类专有的打印格式。

现在再打印:

```python
cat = Animal('加菲猫',8)
print(cat)
```

打印信息如下:

```python
Animal(加菲猫,8) is printed
                name=加菲猫
                speed=8
```

以上就是想要的打印格式，看到实例的数据值都正确。

### 4 属性

至此，我们都称类里的`name`和`speed`称为数据，其实它们有一个专业名称：属性。

同时，上面还有一个问题我们没有回答完全，什么是类上的属性？

如下，在最新`Animal`类定义基础上，再添加一个`cprop`属性，它前面没有`self`保留字：

```python
class Animal():
   cprop = "我是类上的属性cprop"
   
   def __init__(self,name,speed):
       self.name = name # 动物名字
       self.speed = speed # 动物行走或飞行速度
  
   def __str__(self):
        return '''Animal({0.name},{0.speed}) is printed
                name={0.name}
                speed={0.speed}'''.format(self)
```

类上的属性直接使用类便可引用：

```python
In [1]: Animal.cprop                                                           
Out[1]: '我是类上的属性cprop'
```

类上的属性，实例同样可以引用，并且所有的实例都共用此属性值：

```python
In [1]: cat = Animal('加菲猫',8)
In [2]: cat.cprop                                                              
Out[2]: '我是类上的属性cprop'
```

Python作为一门动态语言，支持属性的动态添加和删除。

如下`cat`实例原来不存在`color`属性，但是赋值时不光不会报错，相反会直接将属性添加到`cat`上：

```python
cat.color = 'grap'
```

那么，如何验证`cat`是否有`color`属性呢？使用内置函数`hasattr`：

```python
In [24]: hasattr(cat,'color') # cat 已经有`color`属性                          
Out[24]: True
```

但是注意：以上添加属性方法仅仅为`cat`实例本身添加，而不会为其他实例添加：

```python
In [26]: monkey = Animal('大猩猩',2)                                            
In [27]: hasattr(monkey,'color')                                             
Out[27]: False
```

`monkey`实例并没有`color`属性，注意与`__init__`创建属性方法的区别。

### 5 private,protected,public

像`name`和`speed`属性，引用此实例的对象都能访问到它们，如下：

```python
# 模块名称：manager.py

import time

class Manager():
    def __init__(self,animal):
        self.animal = animal
        
    def recordTime(self):
        self.__t = time.time()
        print('feeding time for %s（行走速度为:%s） is %.0f'%(self.animal.name,self.animal.speed,self.__t))
    
    def getFeedingTime(self):
        return '%0.f'%(self.__t,) 
```

使用以上`Manager`类，创建一个`cat`实例，`xiaoming`实例引用`cat`:

```python
cat = Animal('加菲猫',8)
xiaoming =  Manager(cat) 
```

`xiaoming`的`recordTime`方法引用里，引用了animal的两个属性`name`和`speed`:

```python
In[1]: xiaoming.recordTime()

Out[1]: feeding time for 加菲猫（行走速度为:8） is 1595681304
```

注意看到`self.__t`属性，它就是一个私有属性，只能被`Manager`类内的所有方法引用，如被方法`getFeedingTime`方法引用。但是，不能被其他类引用。

如果我们连`speed`这个属性也不想被其他类访问，那么只需将`self.speed`修改为`self.__speed`:

同时`Manager`类的`self.animal.speed`修改为`self.animal.__speed`，再次调用下面方法时：

```python
xiaoming.recordTime()
```

就会报没有`__speed`属性的异常，从而验证了`__speed`属性已经变为类内私有，不会暴露在外面。

![img](https://mmbiz.qpic.cn/mmbiz_png/FQd8gQcyN27U75xiaIHaCmh1hoTcHHAeKTUhyWWyR57DF1T4rsSuR9USGFHYn5mVmfaQxS22uGxNe1DICoVic9icA/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

总结：`name`属性相当于java的public属性，而`__speed`相当于java的private属性。

下面在说继承时，讲解`protected`属性，实际上它就是带有1个`_`的属性，它只能被继承的类所引用。

### 6 继承

上面已经讲完了OOP三大特性中的封装性，而继承是它的第二大特性。子类继承父类的所有`public`和`protected`数据和方法，极大提高了代码的重用性。

如上创建的`Animal`类最新版本为：

```python
class Animal():
   cprop = "我是类上的属性cprop"
   
   def __init__(self,name,speed):
       self.name = name # 动物名字
       self.__speed = speed # 动物行走或飞行速度
  
   def __str__(self):
        return '''Animal({0.name},{0.__speed}) is printed
                name={0.name}
                speed={0.__speed}'''.format(self)
```

现在有个新的需求，要重新定义一个`Cat`猫类，它也有`name`和`speed`两个属性，同时还有`color`和`genre`两个属性，打印时只需要打印`name`和`speed`两个属性就行。

因此，基本可以复用基类`Animal`，但需要修改`__speed`属性为受保护(`protected`)的`_speed`属性，这样子类都可以使用此属性，而外部还是访问不到它。

综合以上，`Cat`类的定义如下：

```python
class Cat(Animal):
    def __init__(self,name,speed,color,genre):
        super().__init__(name,speed)
        self.color = color 
        self.genre = genre
```

首先使用`super()`方法找到`Cat`的基类`Animal`，然后引用基类的`__init__`方法，这样复用基类的方法。

使用`Cat`类，打印时，又复用了基类的 `__str__`方法：

```python
jiafeimao = Cat('加菲猫',8,'gray','CatGenre')
print(jiafeimao)
```

打印结果：

```python
Animal(加菲猫,8) is printed
                name=加菲猫
                speed=8
```

以上就是基本的继承使用案例，继承要求基类定义的数据和行为尽量标准、尽量精简，以此提高代码复用性。

### 7 多态

如果说OOP的封装和继承使用起来更加直观易用，那么作为第三大特性的多态，在实践中真正运用起来就不那么容易。有的读者OOP编程初期，可能对多态的价值体会不深刻，甚至都已经淡忘它的存在。

那么问题就在：多态到底真的有用吗？到底使用在哪些场景？

多态价值很大，使用场景很多，几乎所有的系统或软件，都能看到它的应用。这篇文章尽可能通过一个精简的例子说明它的价值和使用方法。如果不用多态，方法怎么写；使用多态，又是怎么写。

为了一脉相承，做到一致性，仍然基于上面的案例，已经创建好的`Cat`类要有一个方法打印和返回它的爬行速度。同时需要再创建一个类`Bird`，要有一个方法打印和返回它的飞行速度；

如果不使用多态，为`Cat`类新增一个方法：

```python
class Cat(Animal):
    def __init__(self,name,speed,color,genre):
        super().__init__(name,speed)
        self.color = color 
        self.genre = genre
    # 添加方法
    def getRunningSpeed(self):
        print('running speed of %s is %s' %(self.name, self._speed))
        return self._speed
```

重新创建一个`Bird`类：

```python
class Bird(Animal):
    def __init__(self,name,speed,color,genre):
        super().__init__(name,speed)
        self.color = color 
        self.genre = genre
    # 添加方法
    def getFlyingSpeed(self):
        print('flying speed of %s is %s' %(self.name, self._speed))
        return self._speed
```

最后，上面创建的`Manager`类会引用`Cat`和`Bird`类，但是需要修改`recordTime`方法，因为Cat它是爬行的，Bird它是飞行的，所以要根据对象类型的不同做逻辑区分，如下所示：

```python
# 模块名称：manager.py

import time
from animal import (Animal,Cat,Bird)

class Manager():
    def __init__(self,animal):
        self.animal = animal
        
    def recordTime(self):
        self.__t = time.time()
        if isinstance(self.animal, Cat):
            print('feeding time for %s is %.0f'%(self.animal.name,self.__t))
            self.animal.getRunningSpeed()
        if isinstance(self.animal,Bird):
            print('feeding time for %s is %.0f'%(self.animal.name,self.__t))
            self.animal.getFlyingSpeed()

    def getFeedingTime(self):
        return '%0.f'%(self.__t,) 
```

如果再来一个类，我们又得需要修改`recordTime`，再增加一个`if`分支，从软件设计角度讲，这种不断破坏封装的行为不可取。

**但是，使用多态，就可以保证`recordTime`不被修改，不必写很多if分支。**怎么来实现呢？

首先，在基类`Animal`中创建一个基类方法，然后`Cat`和`Bird`分别重写此方法，最后传入到`Manager`类的`animal`参数是什么类型，在`recordTime`方法中就会对应调用这个`animal`实例的方法，这就是**多态**。

代码如下：

animal2.py 模块如下：

```python
# animal2.py 模块

class Animal():
   cprop = "我是类上的属性cprop"
   
   def __init__(self,name,speed):
       self.name = name # 动物名字
       self._speed = speed # 动物行走或飞行速度
  
   def __str__(self):
        return '''Animal({0.name},{0._speed}) is printed
                name={0.name}
                speed={0._speed}'''.format(self)

   def getSpeedBehavior(self):
       pass 

class Cat(Animal):
    def __init__(self,name,speed,color,genre):
        super().__init__(name,speed)
        self.color = color 
        self.genre = genre
        
    # 重写方法
    def getSpeedBehavior(self):
        print('running speed of %s is %s' %(self.name, self._speed))
        return self._speed
        

class Bird(Animal):
    def __init__(self,name,speed,color,genre):
        super().__init__(name,speed)
        self.color = color 
        self.genre = genre

    # 重写方法
    def getSpeedBehavior(self):
        print('flying speed of %s is %s' %(self.name, self._speed))
        return self._speed
```

manager2.py 模块如下：

```python
# manager2.py 模块

import time
from animal2 import (Animal,Cat,Bird)

class Manager():
    def __init__(self,animal):
        self.animal = animal
        
    def recordTime(self):
        self.__t = time.time()
        print('feeding time for %s is %.0f'%(self.animal.name,self.__t))
        self.animal.getSpeedBehavior()

    def getFeedingTime(self):
        return '%0.f'%(self.__t,)  
```

`recordTime`方法非常清爽，不需要任何if逻辑，只需要调用我们定义的`Animal`类的基方法`getSpeedBehavior`即可。

在使用上面所有类时，`Manager(jiafeimao)`传入`Cat`类实例时，`recordTime`方法调用就被自动指向`Cat`实例的`getSpeedBehavior`方法；

`Manager(haiying)`传入`Bird`类实例时，自动指向`Bird`实例的`getSpeedBehavior`方法，这就是多态和它的价值，Manager类的方法不必每次都修改，保证了类的封装性。

```python
if __name__ == "__main__":
    jiafeimao = Cat('jiafeimao',2,'gray','CatGenre')
    haiying = Bird('haiying',40,'blue','BirdGenre')

    Manager(jiafeimao).recordTime()
    print('#'*30)
    Manager(haiying).recordTime()  
```

## **总结**

以上就是面向对象编程专题的基础部分，大纲如下：

- Python 面向对象编程

- 基础专题

- - 1 类定义
    - 2 实例
    - 3 打印实例
    - 4 属性
    - 5 private,protected,public
    - 6 继承
    - 7 多态

- 总结