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