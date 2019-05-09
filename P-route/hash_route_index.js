'use strict';

const e = React.createElement;
// PageA
class PageA extends React.Component {

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
            'hello Page A'
        );
    }
}

// PageB
class PageB extends React.Component {

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
            'hello Page B'
        );
    }
}

// PageC
class PageC extends React.Component {

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
            'hello Page C'
        );
    }
}

// 路由配置
const route = {
    'PageA': PageA,
    'PageC': PageC,
    'PageB': PageB
}
// 更新页面组件
const refresh = () => {
    const domContainer = document.querySelector('#root');
    const currentHash = location.hash.substring(1)
    ReactDOM.render(e(route[currentHash]), domContainer)
}
// 监听hashchange事件
window.addEventListener('hashchange',refresh , false)
// 第一次进入页面也需要更新组件
window.onload = refresh()