import Cookie from './Cookie.js';
const cookie = new Cookie();
class Untitled {
    constructor() {
        this.data = {};
        this.labels = {
            cookie: 'Cookie',
            ua: 'User Agent'
        };
        this.pre = document.createElement('pre');
        this.pre.className = 'data';
        document.body.appendChild(this.pre);
        this.setupButtons();
        this.setData('ua', navigator.userAgent);
        this.setData('cookie', cookie.all());
        const err = this.getUrlParam('err');
        if (err) this.setData('error', err);

        this.render();
    }
    getUrlParam(name) {
        const url = new URL(location.href);
        return url.searchParams.get(name);
    }
    setupButtons() {
        const buttons = {
            'Reload': () => location.reload(),
            'Random cookie': () => {
                const key = 'test';
                const value = (Math.sin(Date.now()) * Math.PI).toString().substring(5);
                cookie.set(key, value);
                this.setData('cookie', cookie.all());
                this.render();
            },
        }
        const buttonBar = document.createElement('div');
        buttonBar.className = 'button-bar';
        document.body.appendChild(buttonBar);
        for (let k in buttons) {
            const btn = document.createElement('button');
            btn.textContent = k;
            btn.onclick = buttons[k];
            buttonBar.appendChild(btn);
        }
    }
    setData(key, value) {
        this.data[key] = value;
    }
    render() {
        const data = {};
        for (let k in this.data) {
            const key = this.labels[k] ?? k;
            data[key] = this.data[k];
        }
        this.pre.innerText = JSON.stringify(data, null, 4);
    }
}
new Untitled();
