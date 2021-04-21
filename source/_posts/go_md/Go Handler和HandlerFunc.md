---
title: Go Handler和HandlerFunc
date: '2020/12/31 23:59'
tags:
 - go
categories:
 - 学习笔记
abbrlink: 14001
cover: 
---

# Go Handler 和 HandlerFunc

## 例子

先看一个简单的例子：

```go
package main

import (
    "fmt"
    "net/http"
)

type HelloHandler struct{}

func (h HelloHandler) ServeHTTP (w http.ResponseWriter, r *http.Request) {
    fmt.Fprintf(w, "Hello Handler!")
}

func hello (w http.ResponseWriter, r *http.Request) {
    fmt.Fprintf(w, "Hello!")
}

func main() {
    server := http.Server{
        Addr: "127.0.0.1:8080",
    }
    helloHandler := HelloHandler{}
    http.Handle("/hello1", helloHandler)
    http.HandleFunc("/hello2", hello)
    server.ListenAndServe()
}
```

上述代码启动了一个 http 服务器，监听 8080 端口，分别实现了 `/hello1` 和 `/hello2` 两个路由。实现这两个路由的方法有点不同，一个使用 `http.Handle`，另一个使用 `http.HandleFunc` ，下面来看看这两个之间的区别；

## http.Handle

首先，简单分析一下 `http.Handle(pattern string, handler Handler)`，`http.Handle(pattern string, handler Handler)` 接收两个参数，一个是路由匹配的字符串，另外一个是 `Handler` 类型的值：

```go
func Handle(pattern string, handler Handler) { DefaultServeMux.Handle(pattern, handler) }
```

第二个参数是Handler这个接口, 这个接口有一个ServeHTTP()的方法

```go
type Handler interface {
	ServeHTTP(ResponseWriter, *Request)
}
```

所以这个方法使用的时候需要自己去定义struct实现这个**Handler**接口。

```go
package main

import (
	"net/http"
	"log"
)

type httpServer struct {
}

func (server httpServer) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	w.Write([]byte(r.URL.Path))
}

func main() {
	var server httpServer
	http.Handle("/", server)
	log.Fatal(http.ListenAndServe("localhost:9000", nil))
}
```

然后由继续调用 `DefaultServeMux.Handle(pattern string, handler Handler)`，该函数接收的参数与上面的函数一样：

```go
func (mux *ServeMux) Handle(pattern string, handler Handler) {
...
}
```

这个 `Handler` 类型是什么呢，其实它就是一个接口，包含一个 `ServeHttp()` 的方法：

```tsx
type Handler interface {
    ServeHTTP(ResponseWriter, *Request)
}
```

所以，传入 `http.Handle(pattern string, handler Handler)` 第二个参数必须实现 `ServeHTTP` 这个方法，当接收到一个匹配路由的请求时，会调用该方法。

## http.HandleFunc

该方法接收两个参数，一个是路由匹配的字符串，另外一个是 `func(ResponseWriter, *Request)` 类型的函数：

```go
func HandleFunc(pattern string, handler func(ResponseWriter, *Request)) {
    DefaultServeMux.HandleFunc(pattern, handler)
}
```

这个第二个参数是一个方法，参数是ResponseWriter, 和 *Request 所以使用的时候需要传方法。

```go
package main

import (
	"net/http"
	"log"
)

func main() {
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte(r.URL.Path))
	})
	log.Fatal(http.ListenAndServe("localhost:9000", nil))
}
```

然后继续调用 `DefaultServeMux.HandleFunc(pattern, handler)`：

```go
func (mux *ServeMux) HandleFunc(pattern string, handler func(ResponseWriter, *Request)) {
    mux.Handle(pattern, HandlerFunc(handler))
}
```

可以看到，这里把 `handler` 转换成了 `HandlerFunc` 类型，而 `HandlerFunc` 类型则如下所示：

```go
type HandlerFunc func(ResponseWriter, *Request)

func (f HandlerFunc) ServeHTTP(w ResponseWriter, r *Request) {
    f(w, r)
}
```

该类型实现了 `ServeHTTP` 接口，所以其也可以转换成 `Handler` 类型，接下来调用 `mux.Handle(pattern string, handler Handler)` 就跟 `http.Handle` 的流程是一样的了。



