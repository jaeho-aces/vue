/*
 * AcesServer
 *  Basic ACES Tech Server interface
 *
 * (c) 2022~2025 ACES Tech, all rights reserved.
 *
 */

var sysWebSocketCount = 0;
class AcesLogger {
    showDebugLog = false;
    myId = '[ws:' + sysWebSocketCount++ + ']';

    /*
     *
     */
    constructor(showLog) {
        this.showDebugLog = showLog;
    }

    /*
     *
     */
    rightStr(str, n) {
        return str.substr(str.length - n, n);
    }
    getDateString(thisDate) {
        var month = "0" + (thisDate.getMonth() + 1);
        var day = "0" + thisDate.getDate();
        var hour = "0" + thisDate.getHours();
        var min = "0" + thisDate.getMinutes();
        var sec = "0" + thisDate.getSeconds();
        var msec = "00" + thisDate.getMilliseconds();
        return thisDate.getFullYear() + '-'
            + this.rightStr(month, 2) + '-'
            + this.rightStr(day, 2) + ' '
            + this.rightStr(hour, 2) + ':'
            + this.rightStr(min, 2) + ':'
            + this.rightStr(sec, 2) + '.'
            + this.rightStr(msec, 3);
    }
    _logOut(msg, force = false) {
        if (this.showDebugLog || force)
            console.log(`${this.getDateString(new Date())}: ${this.myId} ${msg}`);
    }
    logOut(msg, force = false) {
        this._logOut(msg, force);
    }
    logError(error) {
        console.log(`${this.getDateString(new Date())}: ${this.myId} ${error.name}: ${error.message}`);
    }
}

class AcesServer extends AcesLogger {
    static msgHello = 'HELLO';
    static msgBye = 'BYE';
    static msgError = 'ERROR';
    static msgConnectionFailed = 'Connection failed';
    static clearTimer = true;
    static defaultReopenDelay = 25;

    static get typeName() { return 'serverInterface' }

    title = '';
    timerId;
    defaultWaitTime = 3;
    stopped = false;
    onMessageCallback = null;

    sock = null;
    targetIP = '';
    targetExtIP = '';
    targetPort = '';
    proxyServer = null
    state = 'idle';
    timereRunCount = 0;
    url = null;
    useSecureConnection = false;
    userGetTypeName = null;
    reopenCount = 0;
    reopenDelay = AcesServer.defaultReopenDelay;

    constructor(showLog) {
        super(showLog);

        this.timerId = setInterval(() => {
            /* Prevent openNow() being recursive */
            if (this.reopenCount > 0 && --this.reopenCount == 0)
                this.openNow();

            /* For derived classess */
            this.onTimer();
        }, 100);
    }

    /*
     * 아래 함수들은 다른 함수로 대체하지 말것!!!!
     */
    /* open(ip, port)
     *  ip:         HDS7000 ip address
     *  port:       HDS7000 WebRTC port (554/8880)
     *
     * @ret         true: already opened, false: not yet opened
     */
    open(ip, port, waitTime = null) {
        this.targetIP = ip;
        this.targetPort = port;
        if (this.targetExtIP == '')
            this.targetExtIP = ip;
        if (waitTime != null)
            this.defaultWaitTime = waitTime;

        if (this.sock != null) {
            if (this.sock.readyState == 0)
                return false;
            if (this.sock.readyState == 1)
                return true;

            /* Socket might be closed by the server so reopen anyway */
            this.sock = null;
            this.setReopenTimer(5);         /* 5 * 100mSec */
            this.logOut(`${this.targetIP}: Will be reopened`);
            return false;
        }

        this.setOutIP();
        this.openNow();
        return false;
    }
    openNow() {
        if (this.sock != null) {
            if (this.sock.readyState == 1);
                return;
            if (this.sock.readyState != 3 && this.sock.readyState != 0)
                this.sock.close();
            this.sock = null;

            /* No need to continue */
            if (this.stopped)
                return;
        }
        this.logOut('Connecting WebSocket', true);

        /* If the web server being used doesn't effectively support
         * reverse proxy default page name should be mapped acoordingly..
         * ie. WebToB..
         */
        var typeName = this.getTypeName(AcesServer.typeName, this.targetIP);

        this.url = this.useSecureConnection ? 'wss://' : 'ws://';
        this.url += this.proxyServer == null ?
                        this.targetIP + ':' + this.targetPort : this.proxyServer;
        this.url += '/' + typeName;
        if (this.proxyServer != null && this.proxyServer != '')
            this.url +=  '?dest=' + this.targetIP + ':' + this.targetPort;

        this.state = 'connecting';
        this.sock = new WebSocket(this.url, AcesServer.typeName);
        this.sock.onopen = (evt) => {
            this.clearReopenTimer();
            try {
                this.sock.send(JSON.stringify({ type: AcesServer.msgHello }));
                this.onopen(evt);
            } catch (e) {
                this.close('retrying');
            }
        }
        this.sock.onmessage = (evt) => this.onmessage(JSON.parse(evt.data));
        this.sock.onerror = (evt) => this.onerror(evt);
        this.sock.onclose = (evt) => this.onsocketclose(evt);

        /* 접속이 안된 경우 재접속하도록 함 */
        this.timerRunCount = 0;
        this.setReopenTimer();
    }
    close(msg, timeValue = AcesServer.defaultReopenDelay) {
        var closeMsg = msg !== null && msg !== undefined ? ` (${msg})` : '';

        this.reopenDelay = timeValue;

        if (this.sock !== null) {
            if (this.sock.readyState == 1) {
                /* End of connection, let the server know this */
                this.sock.send(JSON.stringify({ type: AcesServer.msgBye }));
            }
            try {
                if (this.sock.readyState == 1)
                    this.sock.close();
            } catch (e) {
                this.logOut("socket close() error", false);
            }
            this.sock = null;
        }
        this.clearReopenTimer();
        this.state = 'closed';
        this.logOut('Closing WebSocket' + closeMsg, true);

        this.onclose(this.state);
    }
    shutdown(clear) {
        var fullShutdown = clear != undefined && clear == AcesServer.clearTimer;

        this.stopped = true;
        this.close('shutdown' + (fullShutdown ? ':inactive' : ':active'));

        /* Won't work after this line.. */
        if (fullShutdown)
            clearInterval(this.timerId);
    }
    setOutIP() {
        /* Hide some part of target IP - for security */
        const regex1 = RegExp('[0-9]+', 'g');
        let matches;
        let idx = 0;
        this.outIP = '*';
        while ((matches = regex1.exec(this.targetIP)) != null) {
            if (idx != 0 && idx < 4)
                this.outIP += '.' + (idx != 2 ? matches[0] : '*');
            idx++;
        }
    }
    active() {
        return this.sock != null;
    }

    setOnMessageCallback(func) {
        this.onMessageCallback = func;
    }
    setDefaultWaitTime(waitTime) {
        this.defaultWaitTime = waitTime;
    }
    setTargetExtIP(val) {
        this.targetExtIP = val;
    }
    setProxyServer(value) {
        this.proxyServer = value;
    }
    setSecureConnection(value) {
        this.useSecureConnection = value;
    }
    setTitle(value) {
        this.title = `=${value}`;
    }
    setUserGetTypeName(func) {
        if (typeof func == 'function') {
            this.userGetTypeName = func;
            this.getTypeName = func;
        }
    }
    setReopenTimer(value) {
        this.reopenCount = value != undefined ? value : this.reopenDelay;
    }
    clearReopenTimer() {
        this.reopenCount = 0;
    }

    getTypeName(name, ip) { return name; }

    /*
     * Common handlers
     */
    onmessage(evt) {
        this.state = 'connected';
        if (typeof this.onMessageCallback == 'function')
            this.onMessageCallback(evt);
    }
    name() {
        return AcesServer.typeName;
    };
    send(msg) {
        try {
            if (this.sock.readyState == 1)
                this.sock.send(msg);
        } catch (e) {
            this.logOut("Can't send message", false);
        }
    }
    sendJson(msg) {
        var strMsg = JSON.stringify(msg);
        try {
            if (this.sock.readyState == 1)
                this.sock.send(strMsg);
        } catch (e) {
            this.logOut("Can't send JSON msg", false);
        }
    }

    /*
     * Overridables
     */
    onopen(evt) {}
    onclose(evt) {
        if (!this.stopped)
            this.setReopenTimer();
    }
    onsocketclose(evt) {
        this.logOut('closed WebSocket', false);
    }
    onerror(evt) {
        if (evt.target !== undefined
            && evt.target.url !== undefined
            && evt.target.url.substr(0, 3) == 'wss'
            && evt.type == "error") {
            console.log(evt.target.url + ': Visit https://' + this.targetIP
                        + ' first and then allow to connect this site'
                        + ' if problem persists to resolve certificate issue!!!');
        }

        if (this.state != 'closed') {
            /* Firefox may call after normal closing */
            this.close(AcesServer.msgConnectionFailed);
            this.onError(evt);
        }
    }
    onfail(message) {
        this.logOut(message);
        this.shutdown();
    }

    onTimer() {}

    /*
     * User callbacks
     */
    onError(evt) {}

    logOut(msg, force = false) {
        this._logOut(`${this.constructor.name}[${this.outIP}]${this.title}: ${msg}`, force);
    }
}

/* vim: set ts=4 sw=4 expandtab: */
