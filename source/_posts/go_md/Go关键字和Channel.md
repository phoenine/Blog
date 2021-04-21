---
title: Golang net包简介
date: '2020/12/31 23:59'
tags:
 - go
categories:
 - 学习笔记
abbrlink: 14003
cover: 
---
# 在 Golang 中使用 Go 关键字和 Channel 实现并行

## Go 关键字和 channel 的用法

##### go 关键字用来创建 goroutine (协程)，是实现并发的关键。go 关键字的用法如下：

```go
//go 关键字放在方法调用前新建一个 goroutine 并让他执行方法体
go GetThingDone(param1, param2);

//上例的变种，新建一个匿名方法并执行
go func(param1, param2) {
}(val1, val2)

//直接新建一个 goroutine 并在 goroutine 中执行代码块
go {
    //do someting...
}
```

##### 因为 goroutine 在多核 cpu 环境下是并行的。如果代码块在多个 goroutine 中执行，我们就实现了代码并行。那么问题来了，怎么拿到并行的结果呢？这就得用 channel 了。

```go
//resultChan 是一个 int 类型的 channel。类似一个信封，里面放的是 int 类型的值。
var resultChan chan int
//将 123 放到这个信封里面，供别人从信封中取用
resultChan <- 123
//从 resultChan 中取值。这个时候 result := 123
result := <- resultChan
```

## 使用 go 关键字和 channel 实现非阻塞调用

##### 阻塞的意思是调用方在被调用的代码返回之前必须一直等待，不能处理别的事情。而非阻塞调用则不用等待，调用之后立刻返回。那么返回值如何获取呢？Node.js 使用的是回调的方式，Golang 使用的是 channel。

```go
/**
 * 每次调用方法会新建一个 channel : resultChan，
 * 同时新建一个 goroutine 来发起 http 请求并获取结果。
 * 获取到结果之后 goroutine 会将结果写入到 resultChan。
 */
func UnblockGet(requestUrl string) chan string {
    resultChan := make(chan string)
    go func() {
        request := httplib.Get(requestUrl)
        content, err := request.String()
        if err != nil {
            content = "" + err.Error()
        }
        resultChan <- content
    } ()
    return resultChan
}
```

##### 由于新建的 goroutine 不会阻塞函数主流程的执行，所以调用 UnblockGet 方法会立刻得到一个 resultChan 返回值。一旦 goroutine 执行完毕拿到结果就会写入到 resultChan 中，这时外部就可以从 resultChan 中获取执行结果。

## 一个很 low 的并行示例

```go
fmt.Println(time.Now())
resultChan1 := UnblockGet("http://127.0.0.1/test.php?i=1")
resultChan2 := UnblockGet("http://127.0.0.1/test.php?i=2")

fmt.Println(<-resultChan1)
fmt.Println(<-resultChan1)
fmt.Println(time.Now())
```

##### 上面两个 http 请求是在两个 goroutine 中并行的。总的执行时间小于 两个请求时间和。

**这个例子只是为了体现 go 和 channel 的用法，有内存泄漏问题，千万不要在线上这么搞。因为新建的 channel 没有 close。下次写一个更高级一点的。**

## 简单的实现 http multi GET

```go
type RemoteResult struct {
    Url string
    Result string
}

func RemoteGet(requestUrl string, resultChan chan RemoteResult)  {
    request := httplib.NewBeegoRequest(requestUrl, "GET")
    request.SetTimeout(2 * time.Second, 5 * time.Second)
    //request.String()
    content, err := request.String()
    if err != nil {
        content = "" + err.Error()
    }
    resultChan <- RemoteResult{Url:requestUrl, Result:content}
}
func MultiGet(urls []string) []RemoteResult {
    fmt.Println(time.Now())
    resultChan := make(chan RemoteResult, len(urls))
    defer close(resultChan)
    var result []RemoteResult
    //fmt.Println(result)
    for _, url := range urls {
        go RemoteGet(url, resultChan)
    }
    for i:= 0; i < len(urls); i++ {
        res := <-resultChan
```