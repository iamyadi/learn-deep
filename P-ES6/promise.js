// 博文链接：https://juejin.im/post/5cc54877f265da03b8585902
// 博文链接：https://www.cnblogs.com/yadiblogs/p/10824983.html

let count = 0
class DiPromise {
    constructor(executor) {
        //  自己维护的状态
        this.state = 'PENDING'
        // FULFILLED or REJECTED 后的结果
        this.value = ''
        // 存储success， reject的回调
        this.handlers = []
        // 绑定this
        this.handle = this.handle.bind(this)
        this.onResolve = this.onResolve.bind(this)
        this.onReject = this.onReject.bind(this)
        this.then = this.then.bind(this)
        this.done = this.done.bind(this)
        // 这个只是调试用
        this.name = count + 1
        count += 1
        // 在new的时候，立即执行executor，并给executor传入两个函数作为其参数
        executor(this.onResolve, this.onReject)
    }

    // 处理回调
    handle(handl) {
        if (this.state === 'PENDING') {
            console.log('handl, PENDING ' + this.name)
            this.handlers.push(handl)
        } else {
            if (this.state === 'FULFILLED') {
                console.log(' FULFILLED  ' + this.name)
                handl.onFulfilled(this.value)
            } else { // REJECT
                console.log('reject')
                handl.onReject(this.value)
            }
        }
    }
    // onResolve 1.改变状态, 2.并设置数据, 3.调用handlers里的回调
    onResolve(result) {
        console.log('in on resolve')
        // 改变状态
        this.state = 'FULFILLED'
        // 存入数据
        this.value = result
        this.handlers.forEach(handle => handle.onFulfilled(result));
        this.handlers = null;
    }
    // onReject 1.改变状态, 2.并设置数据, 3.调用handlers里的回调
    onReject(error) {
        this.state = 'REJECT'
        this.value = error
        this.handlers.forEach(handle => handle.onFulfilled(result));
        this.handlers = null;
    }

    // 要实现用.then链式调用，then返回了新的promise
    then(onFulfilled, onReject) {
        return new DiPromise((resolve, reject) => {
            this.done(() => {
                try {
                    return resolve(onFulfilled(this.value))
                } catch (err) {
                    return reject(err)
                }
            }, () => {
                try {
                    return resolve(onReject(this.value))
                } catch (err) {
                    return reject(err)
                }
            })
        })
    }
    
    // 做的事情：只是将回调传给this.handle
    done(onFulfilled, onReject) {
        setTimeout(() => {
            this.handle({
                onFulfilled: onFulfilled,
                onReject: onReject
            })
        }, 0)
    }
}
const p = new DiPromise(function excutor(resolve, reject) {
    setTimeout(() => {
        console.log('setTimeout')
        resolve('setTimeout')
    }, 1000)
})
p.then((res) => {
    console.log('then: ', res, this.name)
    return 'ffffffff'
}).then((res) => {
    console.log('then: ', res, this.name)
    return '00000000$$$$$$'
})