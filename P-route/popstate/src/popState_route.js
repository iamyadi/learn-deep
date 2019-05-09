'use strict';

// PageA
class PageD extends React.Component {

    render() {
        return e(
            'div',
            {
                style: {
                    background: 'blue',
                    height: 600,
                    width: 600
                }
            },
            'hello Page D'
        );
    }
}

// PageB
class PageE extends React.Component {

    render() {
        return e(
            'div',
            {
                style: {
                    background: 'yellow',
                    height: 600,
                    width: 600
                }
            },
            'hello Page E'
        );
    }
}

// PageC
class PageF extends React.Component {

    render() {
        return e(
            'div',
            {
                style: {
                    background: 'pink',
                    height: 600,
                    width: 600
                }
            },
            'hello Page F'
        );
    }
}

class PopstateClass {
    constructor() {
        this.current = ''
    }

    // 判断是否是当前url
    isMatch = (newURL) => {
        const current = location.pathname
        if (newURL === current) {
            return true
        }
        return false
    }
    // 更新页面组件
    refresh2 = (newURL) => {
        if (this.isMatch(newURL)) {
            return null
        } else {
            const domContainer = document.querySelector('#root2');
            ReactDOM.render(e(PageF), domContainer)
        }
    }
}

// 给div加事件，push state，并且调用刷新方法
const div = document.getElementById('pop')
let Popstate = new PopstateClass()
div.addEventListener('click', (e) => {
    const newURL = e.target.attributes['link']
    // push state
    history.pushState(null, null, newURL)
    // 调用刷新方法
    Popstate.refresh2(newURL)
}, false)

// 监听popstate事件
window.addEventListener('popstate', Popstate.refresh2(location.pathname))