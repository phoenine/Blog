---
abbrlink: 3
---
# 《明解C语言》读书笔记

## 第一章 初识C语言

### 1. 转义字符

1. 响铃🔔： \a

   <!--不过似乎没有什么用-->

   ```c
   #include <stdio.h>
   
   int main(void)
   {
       char *name = "Evan";
       printf("Hello, %s!\a\a\a\n", name);
       return 0;
   }
   ```

### 2. 通过键盘输入和显示

 1. scanf

    ```C
    #include <stdio.h>
    
    int main(int argc, const char * argv[]) {
        int number;
        printf("Please input a number: \n");
        scanf("%d", &number);
        printf("Your number is %d\n", number);
        return 0;
    }
    ```

2. puts

   <!--注意puts已经带换行了-->

   <!--scanf后面不用加\n-->

   ```C
   #include <stdio.h>
   
   int main(int argc, const char * argv[]) {
       int num1, num2;
       puts("Please input two numbers.");
       printf("num1: ");
       scanf("%d", &num1);
       printf("num2: ");
       scanf("%d", &num2);
       printf("Sum is %d\n", num1 + num2);
       return 0;
   }
   ```

## 第二章 运算和数据类型

### 1. 使用printf打印%

​	<!--如果想通过printf打印%的话，必须写成%%-->     

```C
#include <stdio.h>

int main(int argc, const char * argv[]) {
    int num1, num2;
    puts("Please input two numbers.");
    printf("整数A: ");
    scanf("%d", &num1);
    printf("整数B: ");
    scanf("%d", &num2);
    printf("A的值是B的%d%%\n", num1*100/num2);
    return 0;
}
```

## 第三章 指针编程

