---
title: Test with Coverage
date: '2020/12/31 23:59'
tags:
  - python
  - coverage
categories:
  - 学习笔记
abbrlink: 16005
cover: 
---

前几天，听了公司某位大佬关于编程心得的体会，其中讲到了“测试驱动开发”，感觉自己的测试技能薄弱，因此，写下这篇文章，希望对测试能有个入门。这段时间，笔者也体会到了测试的价值，一句话，学会测试，能够让你的开发更加高效。

本文将介绍以下两个方面的内容：

- Test with Coverage
- Mock

### Test with Coverage

`测试覆盖率`通常被用来衡量测试的充分性和完整性。从广义的角度讲，主要分为两大类：面向项目的`需求覆盖率`和更偏向技术的`代码覆盖率`。对于开发人员来说，我们更注重代码覆盖率。

`代码覆盖率`指的是至少执行了一次的条目数占整个条目数的百分比。如果条目数是语句，对应的就是`代码行覆盖率`；如果条目数是函数，对应的就是`函数覆盖率`；如果条目数是路径，对应的就是`路径覆盖率`，等等。统计代码覆盖率的根本目的是找出潜在的遗漏测试用例，并有针对性的进行补充，同时还可以识别出代码中那些由于需求变更等原因造成的废弃代码。通常我们希望代码覆盖率越高越好，代码覆盖率越高越能说明你的测试用例设计是充分且完备的，但测试的成本会随着代码覆盖率的提高而增加。

在Python中，`coverage`模块帮助我们实现了`代码行覆盖率`，我们可以方便地使用它来完整测试的代码行覆盖率。

我们通过一个例子来介绍`coverage`模块的使用。

首先，我们有脚本`func_add.py`，实现了add函数，代码如下：

```python
# -*- coding: utf-8 -*-

def add(a, b):
    if isinstance(a, str) and isinstance(b, str):
        return a + '+' + b
    elif isinstance(a, list) and isinstance(b, list):
        return a + b
    elif isinstance(a, (int, float)) and isinstance(b, (int, float)):
        return a + b
    else:
        return None
```

在add函数中，分四种情况实现了加法，分别是字符串，列表，属性值，以及其它情况。

接着，我们用unittest模块来进行单元测试，代码脚本（`test_func_add.py`）如下：

```python
import unittest
from func_add import add


class Test_Add(unittest.TestCase):

    def setUp(self):
        pass

    def test_add_case1(self):
        a = "Hello"
        b = "World"
        res = add(a, b)
        print(res)
        self.assertEqual(res, "Hello+World")

    def test_add_case2(self):
        a = 1
        b = 2
        res = add(a, b)
        print(res)
        self.assertEqual(res, 3)

    def test_add_case3(self):
        a = [1, 2]
        b = [3]
        res = add(a, b)
        print(res)
        self.assertEqual(res, [1, 2, 3])

    def test_add_case4(self):
        a = 2
        b = "3"
        res = add(a, b)
        print(None)
        self.assertEqual(res, None)


if __name__ == '__main__':

    # 部分用例测试
    # 构造一个容器用来存放我们的测试用例
    suite = unittest.TestSuite()
    # 添加类中的测试用例
    suite.addTest(Test_Add('test_add_case1'))
    suite.addTest(Test_Add('test_add_case2'))
    # suite.addTest(Test_Add('test_add_case3'))
    # suite.addTest(Test_Add('test_add_case4'))
    run = unittest.TextTestRunner()
    run.run(suite)
```

在这个测试中，我们只测试了前两个用例，也就是对字符串和数值型的加法进行测试。

在命令行中输入`coverage run test_func_add.py`命令运行该测试脚本，输出结果如下：

```python
Hello+World
.3
.
----------------------------------------------------------------------
Ran 2 tests in 0.000s

OK
```

再输入命令`coverage html`就能生成代码行覆盖率的报告，会生成`htmlcov`文件夹，打开其中的`index.html`文件，就能看到本次执行的覆盖率情况，如下图：

![测试覆盖率结果总览](https://mmbiz.qpic.cn/mmbiz_png/cRWNtpP7icvE6ibveno14khnUCJu77eu0ry0AmyXalgcxSN4CgQAkKp3KpGIzqNcCqgg5YUh3q7J5kncvtjU2Gww/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)测试覆盖率结果总览


我们点击`func_add.py`查看add函数测试的情况，如下图：



![func_add.py脚本的测试覆盖率情况](https://mmbiz.qpic.cn/mmbiz_png/cRWNtpP7icvE6ibveno14khnUCJu77eu0rL6U6v3cFiaibKMMxklQRjBlgoMuwN2o5y06ibd98PdjTTB9EyWG7Cuueg/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)func_add.py脚本的测试覆盖率情况


可以看到，单元测试脚本test_func_add.py的前两个测试用例只覆盖到了add函数中左边绿色的部分，而没有测试到红色的部分，代码行覆盖率为75%。



因此，还有两种情况没有覆盖到，说明我们的单元测试中的测试用例还不够充分。



在`test_func_add.py`中，我们把main函数中的注释去掉，把后两个测试用例也添加进来，这时候我们再运行上面的`coverage`模块的命令，重新生成`htmlcov`后，func_add.py的代码行覆盖率如下图：

![增加测试用例后，func_add.py脚本的测试覆盖率情况](https://mmbiz.qpic.cn/mmbiz_png/cRWNtpP7icvE6ibveno14khnUCJu77eu0r6ZRjBjVzXEkBp3aqYSumPXIjibHJKgP5dMLwKiccjfKia6kT4Hew15SyA/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)增加测试用例后，func_add.py脚本的测试覆盖率情况


可以看到，增加测试用例后，我们调用的add函数代码行覆盖率为100%，所有的代码都覆盖到了。

### Mock

Mock这个词在英语中有模拟的这个意思，因此我们可以猜测出这个库的主要功能是模拟一些东西。准确的说，Mock是Python中一个用于支持单元测试的库，它的主要功能是使用mock对象替代掉指定的Python对象，以达到模拟对象的行为。在Python3中，mock是辅助单元测试的一个模块。它允许您用模拟对象替换您的系统的部分，并对它们已使用的方式进行断言。

在实际生产中的项目是非常复杂的，对其进行单元测试的时候，会遇到以下问题：

- 接口的依赖
- 外部接口调用
- 测试环境非常复杂

单元测试应该只针对当前单元进行测试, 所有的内部或外部的依赖应该是稳定的, 已经在别处进行测试过的。使用mock 就可以对外部依赖组件实现进行模拟并且替换掉, 从而使得单元测试将焦点只放在当前的单元功能。

我们通过一个简单的例子来说明mock模块的使用。

首先，我们有脚本`mock_multipy.py`，主要实现的功能是`Operator`类中的`multipy`函数，在这里我们可以假设该函数并没有实现好，只是存在这样一个函数，代码如下：

```python
# -*- coding: utf-8 -*-
# mock_multipy.py

class Operator():

    def multipy(self, a, b):
        pass
```

尽管我们没有实现`multipy`函数，但是我们还是想对这个函数的功能进行测试，这时候我们可以借助mock模块中的Mock类来实现。测试的脚本（`mock_example.py`）代码如下：

```python
# -*- coding: utf-8 -*-

from unittest import mock
import unittest

from mock_multipy import Operator

# test Operator class
class TestCount(unittest.TestCase):

    def test_add(self):
        op = Operator()
        # 利用Mock类，我们假设返回的结果为15
        op.multipy = mock.Mock(return_value=15)
        # 调用multipy函数，输入参数为4,5,实际并未调用
        result = op.multipy(4, 5)
        # 声明返回结果是否为15
        self.assertEqual(result, 15)


if __name__ == '__main__':
    unittest.main()
```

让我们对上述的代码做一些说明。

```python
op.multipy = mock.Mock(return_value=15)
```

通过Mock类来模拟调用Operator类中的multipy()函数，return_value 定义了multipy()方法的返回值。

```python
result = op.multipy(4, 5)
```

result值调用multipy()函数，输入参数为4,5，但实际并未调用，最后通过assertEqual()方法断言，返回的结果是否是预期的结果为15。输出的结果如下：

```python
Ran 1 test in 0.002s

OK
```

通过Mock类，我们即使在multipy函数并未实现的情况下，仍然能够通过想象函数执行的结果来进行测试，这样如果有后续的函数依赖multipy函数，也并不影响后续代码的测试。

利用Mock模块中的patch函数，我们可以将上述测试的脚本代码简化如下：

```python
# -*- coding: utf-8 -*-
import unittest

from unittest.mock import patch
from mock_multipy import Operator

# test Operator class
class TestCount(unittest.TestCase):

    @patch("mock_multipy.Operator.multipy")
    def test_case1(self, tmp):
        tmp.return_value = 15
        result = Operator().multipy(4, 5)
        self.assertEqual(15, result)

if __name__ == '__main__':
    unittest.main()
```

patch()装饰器可以很容易地模拟类或对象在模块测试。在测试过程中，您指定的对象将被替换为一个模拟（或其他对象），并在测试结束时还原。

那如果我们后面又实现了multipy函数，是否仍然能够测试呢？

修改`mock_multipy.py`脚本，代码如下：

```python
# -*- coding: utf-8 -*-
# mock_multipy.py

class Operator():

    def multipy(self, a, b):
        return a * b
```

这时候，我们再运行`mock_example.py`脚本，测试仍然通过，这是因为multipy函数返回的结果仍然是我们mock后返回的值，而并未调用真正的Operator类中的multipy函数。

我们修改`mock_example.py`脚本如下：

```python
# -*- coding: utf-8 -*-

from unittest import mock
import unittest

from mock_multipy import Operator

# test Operator class
class TestCount(unittest.TestCase):

    def test_add(self):
        op = Operator()
        # 利用Mock类，添加side_effect参数
        op.multipy = mock.Mock(return_value=15, side_effect=op.multipy)
        # 调用multipy函数，输入参数为4,5,实际已调用
        result = op.multipy(4, 5)
        # 声明返回结果是否为15
        self.assertEqual(result, 15)


if __name__ == '__main__':
    unittest.main()
```

`side_effect`参数和`return_value`参数是相反的。它给mock分配了可替换的结果，覆盖了return_value。简单的说，一个模拟工厂调用将返回side_effect值，而不是return_value。所以，设置`side_effect`参数为Operator类中的multipy函数，那么return_value的作用失效。

运行修改后的测试脚本，测试结果如下：

```python
Ran 1 test in 0.004s

FAILED (failures=1)


15 != 20

Expected :20
Actual   :15
```

可以发现，multipy函数返回的值为20，不等于我们期望的值15，这是side_effect函数的作用结果使然，返回的结果调用了Operator类中的multipy函数，所以返回值为20。

在`self.assertEqual(result, 15)`中将15改成20，运行测试结果如下：

```python
Ran 1 test in 0.002s

OK
```

本次分享到此结束，感谢大家的阅读~