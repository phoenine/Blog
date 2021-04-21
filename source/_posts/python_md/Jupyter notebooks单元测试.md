---
title: Jupyter notebooks 单元测试
date: '2020/12/31 23:59'
tags:
 - python
categories:
 - 学习笔记
abbrlink: 16000
cover: 
---

# 在 Jupyter notebooks 中进行单元测试

我们都知道开发过程中应该编写单元测试，实际上我们中的许多人都这样做。对于生产代码，库代码，或者归因于测试驱动的开发过程，这一点尤其正确。

通常，Jupyter notebooks用于数据探究，因此用户可能不选择（或不需要）为其代码编写单元测试，因为当他们在Jupyter中运行时，通常会查看每个单元格的结果，然后得出结论，之后继续。但是，以我的经验来看，Jupyter通常会发生的情况是，Jupyter中的代码很快就超出了数据探究的范围，对于进一步的工作很有用。或者，Jupyter本身可能会产生有用的结果，需要定期运行。也许需要维护代码并将其与外部数据源集成。然后，确保可以测试和验证notebook中的代码就变得很重要。

在这种情况下，我们有哪些选择对Jupyter代码来进行单元测试？在本文中，我将介绍在Jupyter notebooks中对Python代码进行单元测试的几个选项。

**也许只是不做？**

Jupyter notebook 单元测试的第一个选择是根本不做。这样，我并不是说不要对代码进行单元测试，而是将其从notebook 中提取到单独的Python模块中，然后再将其重新导入notebook 中。应该使用通常对单元代码进行单元测试的方式来测试该代码，无论是使用unittest，pytest，doctest还是其他单元测试框架。本文不会详细介绍所有这些框架，但是对于python开发人员来说，一个不错的选择是不在其Jupyter notebook本中进行测试，而是使用多种可用于Python代码的测试框架，并在开发过程中尽快将代码移至外部模块。

## 1. **在notebook中进行测试**

如果最终决定要将代码保留在Jupyter notebook中，则实际上有一些单元测试选项。在复习其中的一些内容之前，让我们先设置一个在Jupyter notebook中可能会遇到的代码示例。假设您的notebook从API中提取了一些数据，从中计算出一些结果，然后生成了一些图表和其他数据摘要，这些摘要会一直保存在其他地方。也许有一个函数可以产生正确的API URL，我们想对该函数进行单元测试。此功能具有一些逻辑，可以根据报告的日期更改URL格式。这是经过调试的版本。

```python
import datetime
import dateutil

def make_url(date):
    """Return the url for our API call based on date."""

    if isinstance(date, str):
        date = dateutil.parser.parse(date).date()
    elif not isinstance(date, datetime.date):
        raise ValueError("must be a date")
    if date >= datetime.date(2020, 1, 1):
        return f"https://api.example.com/v2/{date.year}/{date.month}/{date.day}"
    else:
        return f"https://api.example.com/v1/{date:%Y-%m-%d}"
```

## 2. **使用unittest进行单元测试**

通常，当我们使用unittest进行测试时，我们会将测试方法放在单独的测试模块中，或者可能将这些方法混入主模块中。然后，我们需要执行`unittest.main`方法，可能是`__main__`防护中的默认方法。我们基本上可以在Jupyter notebook中执行相同的操作。我们可以创建一个`unitest.TestCase`类，执行所需的测试，然后仅在任何单元格中执行单元测试。您只需要保存`unittest.main`方法的输出并检查是否有错误。

```python
import unittest

class TestUrl(unittest.TestCase):
    def test_make_url_v2(self):
        date = datetime.date(2020, 1, 1)
        self.assertEqual(make_url(date), "https://api.example.com/v2/2020/1/1")
        
    def test_make_url_v1(self):
        date = datetime.date(2019, 12, 31)
        self.assertEqual(make_url(date), "https://api.example.com/v1/2019-12-31")

        
res = unittest.main(argv=[''], verbosity=3, exit=False)

# if we want our notebook to stop processing due to failures, we need a cell itself to fail
assert len(res.result.failures) == 0
test_make_url_v1 (__main__.TestUrl) ... ok
test_make_url_v2 (__main__.TestUrl) ... ok

----------------------------------------------------------------------
Ran 2 tests in 0.001s

OK
```

事实证明，这非常简单，如果您不介意在notebook中混合使用代码和进行测试，那么效果很好。

## 3. **使用doctest进行单元测试**

在代码中包含测试的另一种方法是使用doctest。Doctest使用特殊格式的代码文档，其中包括我们的测试和预期结果。下面是包含此特殊代码文档的更新方法，包括正例和负例。这是一种在一个地方测试和记录代码的简单方法，通常会在python模块中使用，main头文件将仅在其中运行doct测试，如下所示：

```python
if __name__ == __main__:
    doctest.testmod()
```

由于我们在notebook中，因此只需将其添加到定义了代码的单元格中，它也将起作用。首先，这是我们更新的带有doctest注释的`make_url`方法。

```python
def make_url(date):
    """Return the url for our API call based on date.
    >>> make_url("1/1/2020")
    'https://api.example.com/v2/2020/1/1'
    
    >>> make_url("1-1-x1")
    Traceback (most recent call last):
        ...
    dateutil.parser._parser.ParserError: Unknown string format: 1-1-x1
    
    >>> make_url("1/1/20001")
    Traceback (most recent call last):
        ...
    dateutil.parser._parser.ParserError: year 20001 is out of range: 1/1/20001
    
    >>> make_url(datetime.date(2020,1,1))
    'https://api.example.com/v2/2020/1/1'
    
    >>> make_url(datetime.date(2019,12,31))
    'https://api.example.com/v1/2019-12-31'
    """
    if isinstance(date, str):
        date = dateutil.parser.parse(date).date()
    elif not isinstance(date, datetime.date):
        raise ValueError("must be a date")
    if date >= datetime.date(2020, 1, 1):
        return f"https://api.example.com/v2/{date.year}/{date.month}/{date.day}"
    else:
        return f"https://api.example.com/v1/{date:%Y-%m-%d}"

import doctest
doctest.testmod()
TestResults(failed=0, attempted=5)
```

## 4. **用testbook进行单元测试**

testbook项目是notebook 单元测试的另一种方式。它允许您从notebook 外部以纯Python代码方式引用notebook 。这使您可以在单独的Python模块中使用任何您喜欢的测试框架（例如pytest或unittest）。您可能会遇到这样的情况：允许用户修改和更新notebook代码是保持代码更新并为最终用户提供灵活性的最佳方法。但是您可能希望仍单独对代码进行测试和验证。Testbook使其成为一个选项。

首先，您必须将其安装在您的环境中：

```python
pip install testbook
```

或者在你的notebook中：

```python
%pip install testbook
```

现在，在一个单独的python文件中，您可以导入notebook代码并在那里进行测试。在该文件中，您将创建类似于以下代码的代码，然后使用您更喜欢实际执行单元测试的任何单元测试框架。您可以在Python文件中创建以下代码（例如jupyter_unit_tests.py）。

```python
import datetime
import testbook

@testbook.testbook('./jupyter_unit_tests.ipynb', execute=True)
def test_make_url(tb):
    func = tb.ref("make_url")
    date = datetime.date(2020, 1, 2)
    assert make_url(date) == "https://api.example.com/v2/2020/1/1"
```

在这种情况下，您现在可以使用任何单元测试框架来运行测试。例如，使用pytest，您只需运行以下命令：

```python
pytest jupyter_unit_tests.py
```

这可以作为正常的单元测试，并且测试应该通过。但是，在撰写本文时，我意识到testbook代码对将单元测试中的参数传递回notebook内核进行测试的支持有限。这些参数是JSON序列化的，并且当前代码知道如何处理各种Python类型。但是，它不会将日期时间作为对象传递，而是作为字符串传递。由于我们的代码尝试将字符串解析为日期（在我对其进行修改之后），因此它可以工作。换句话说，上面的单元测试不是将`datetime.date`传递给`make_url`方法，而是传递一个字符串（2020-01-02），然后将其解析为一个日期。您如何将日期从单元测试传递到notebook代码中？您有以下几种选择。首先，您可以在notebook中创建一个日期对象，仅用于测试目的，然后在单元测试中引用它。

```python
testdate1 = datetime.date(2020,1,1)  # for unit test
```

然后，您可以编写单元测试以在测试中使用该变量。

第二种选择是将Python代码写入notebook，然后在单元测试中重新引用它。这两个选项都显示在外部单元测试的最终版本中。只需将其保存在`jupyter_unit_tests.py`上，然后使用您喜欢的单元测试框架来运行它。

```python
import datetime

import testbook

@testbook.testbook('./jupyter_unit_tests.ipynb', execute=True)
def test_make_url(tb):
    f = tb.ref("make_url")
    d = "2020-01-02"
    assert f(d) == "https://api.example.com/v2/2020/1/2"

    # note that this is actually converted to a string
    d = datetime.date(2020, 1, 2)
    assert f(d) == "https://api.example.com/v2/2020/1/2"

    # this one will be testing the date functionality
    d2 = tb.ref("testdate1")
    assert f(d2) == "https://api.example.com/v2/2020/1/1"

    # this one will inject similar code as above, then use it
    tb.inject("d3 = datetime.date(2020, 2, 3)")
    d3 = tb.ref("d3")
    assert f(d3) == "https://api.example.com/v2/2020/2/3"
```

## 5. **总结**

因此，无论您是单元测试的纯粹主义者还是只想在notebooks中添加一些单元测试，您都可以考虑以上几种选择。不要让notebooks的使用妨碍您在测试代码方面做正确的事情。