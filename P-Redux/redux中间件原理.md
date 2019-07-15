## redux中间件解决了什么问题？
> redux 中间件是给用户了一个统一处理action的机会, 是用于增强`store.dispatch`的， 比如我们想在dispatch的时候，把action打印出来，我们不需要修改每一个dispatch，只需要写一个中间件，这个中间件将这个action处理完后，再交给下一个中间件处理，最终交给原生dispatch。

## redux中间件是如何使用的?
> 常用的中间件都有现成的，只需要引用就可以了。在创建store的时候，使用中间件: logger，thunk，promise都是中间件。
```
const store = createStore(
  reducer,
  applyMiddleware(thunk, promise, logger)
);
```
可以看到挺简单的，只需要使用redux提供的`applyMiddleware`方法就可以了。看到这里，你可能会问，`applyMiddleware`这个方法到底是干什么的？

## redux中间件是如何实现的？
先让我们来看下`applyMiddleware`源码：
```
export default function applyMiddleware(...middlewares) {
   return function(createStore){
    return function(...args){
      const store = createStore(...args)
      let dispatch = () => {
        throw new Error(
          `Dispatching while constructing your middleware is not allowed. ` +
          `Other middleware would not be applied to this dispatch.`
        )
      }

    const middlewareAPI = {
      getState: store.getState,
      dispatch: (...args) => dispatch(...args)
    }
    const chain = middlewares.map(middleware => middleware(middlewareAPI)) //所有中间件都放在chain里，并且已经执行了一次了，并将middlewareAPI传入给了中间件
    dispatch = compose(...chain)(store.dispatch) //这里涉及到函数compose，其实就是函数嵌套执行，最后的(store.dispatch)是传进去的参数。注意，这里其实又执行了一遍了：compose(...chain)返回的是函数，后面加个(store.dispatch)就是执行了。

    return {
      ...store,
      dispatch
    }
    // 最后将改造好的dispatch return出去。
  }
}
```
这段代码非常精简，其中牵扯到了函数组合(compose)，函数currying。 那么compose是怎么实现的呢？
```
function compose(...funcs) {
  if (funcs.length === 0) {
    return arg => arg
  }

  if (funcs.length === 1) {
    return funcs[0]
  }

  return funcs.reduce((a, b) => (...args) => a(b(...args)))
}
```
compose 函数使用数组的reduce方法，将函数一层一层嵌套起来，组合成这种形式:`f(g(e()))`

### compose 这里我详细说一下：


## 中间件如何写？
这里用`redux-thunk`做例子. 源码里面都是箭头函数，看着绕，我给改成function写法了
```
function createThunkMiddle ({ dispatch, getState }) {
  return function (next) { // next就是真实store.dispatch
    return function (action) {
      if (typeof action === 'function') {
        // 如果redux-thunk中间件检测到action不是一个object，那么不会触发dispatch，而是将dispatch方法传到action方法里，并执行action,由action决定在何时触发dispatch
        return action(dispatch, getState, extraArgument);
      }

      return next(action);
    };
  }
}
```
我们知道了，中间件 比如A中间件 的写法，要用currying的写法，嵌套返回3个函数，才能经过`applyMiddleware`，一次chain时候执行，和一次dispatch时候执行后，返回的仍然是一个函数，最后再供用户调用。

最后附上所有代码：(这个例子我造了两个中间件，来实例)
```
// 组合函数，将多个函数变成这种形式：a(b(c()))
function compose(...funcs) {
  if (funcs.length === 0) {
    return arg => arg
  }
  if (funcs.length === 1) {
    return funcs[0]
  }
  return funcs.reduce((a, b) => (...args) => a(b(...args)))
}
// 中间件A
function A1({ dispatch, getState }) {
  return function A2 (next) {
    return function A3 (action) {
      if (typeof action === 'function') {
        // 如果redux-thunk中间件检测到action不是一个object，那么不会触发dispatch，而是将dispatch方法传到action方法里，并执行action,由action决定在何时触发dispatch
        return action(dispatch, getState, extraArgument);
      }
      return next(action);
    };
  }
}
// 中间件B
function B1({ dispatch, getState }) {
  return function B2(next) {
    return function B3(action) {
      if (typeof action === 'function') {
        return action(dispatch, getState, extraArgument);
      }
      return next(action);
    };
  }
}
// 参数
middlewareAPI = {
  getState: { sss: 'state' },
  dispatch: () => { console.log('dispatch') }
}
const func = [A1, B1]
const chain = func.map(middleware => middleware(middlewareAPI))// 此时chain=[A2, B2]
const test = chain.reduce((a, b) => (...args) => a(b(...args))) //此时test=A2(B2())
const test2 = test(store.dispatch) // 加一个()执行test函数, 此时test2=A3，A3里面next就是B3，B3的next就是store.dispatch, 所以，就行程了链式执行：A3->B3->store.dispatch

function applyMiddleware(...middlewares) {
  return function(createStore){
    return function(...args){
      const store = createStore(...args)
      let dispatch = () => {
        throw new Error(
          `Dispatching while constructing your middleware is not allowed. ` +
          `Other middleware would not be applied to this dispatch.`
        )
      }
  
      const middlewareAPI = {
        getState: store.getState,
        dispatch: (...args) => dispatch(...args)
      }
      const chain = middlewares.map(middleware => middleware(middlewareAPI))
      dispatch = compose(...chain)(store.dispatch) //类比上面的test2
  
      return {
        ...store,
        dispatch
      }
    }
  }
}
```