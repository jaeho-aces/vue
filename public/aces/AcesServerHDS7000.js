/*
 * AcesServerHDS7000.js
 *
 * (c) 2022 ACES Tech, all rights reserved.
 *
 */

class ListObj {
    requested = false;
    listName;
    total = 0;
    list = [];
    readyFunc() {}

    constructor(name, func) {
        this.listName = name;
        this.readyFunc = func;
    }
    add(list, caller) {
        this.total = 0;
        if (list.Total !== undefined && list.Total != this.total)
            this.total = list.Total;
        if (list.Index == 0)
            this.list = [];
        if (list.Index >= this.list.length
            && list[this.listName] !== undefined
            && list[this.listName] != null)
            this.list = this.list.concat(list[this.listName]);

        if (this.total == this.list.length) {
            this.requested = false;
            this.readyFunc(caller);
        }
    }
};
class PendingItem {
    f1 = null;
    f2 = null;
    f3 = null;
    f4 = null;

    constructor(a1, a2, a3, a4) {
        this.f1 = a1;
        this.f2 = a2;
        this.f3 = a3;
        this.f4 = a4;
    }
};
class SessionState {
    name = '';
    ready = false;
    count = 0;

    constructor(a0) { this.name = a0; }
    inc() { this.count++; }
    dec() { if (this.count > 0) this.count--; return this.count; }
};

class AcesServerHDS7000 extends AcesServer {
    static reqServerList = 'REQ-SERVER-LIST';
    static reqSessionList = 'REQ-SESSION-LIST';
    static reqClientList = 'REQ-CLIENT-LIST';
    static reqRestart = 'REQ-RESTART';
    static reqServerStatus = 'REQ-SERVER-STATUS';
    static reqTranscoding = 'REQ-TRANSCODING';
    static reqTranscodingList = 'REQ-TRANSCODING-LIST';
    static genServerMessage = 'GEN-SERVER-MESSAGE';

    serverState = null;
    serverTimerId = null;
    intervalId = null;
    enabledSessionListRequest = true;
    defaultWaitTime = 7;
    userID = "";
    userPW = "";
    userHash = "";

    constructor(needSessionList = false, showLog = true) {
        super(showLog);
        this.enabledSessionListRequest = needSessionList;
    }

    serverSessions = new ListObj('SessionList', this.onSessionListReady);
    clientSessions = new ListObj('ClientList', this.onClientListReady);
    transcodingList = [];
    sessionCount = [];
    pendingVideoList = [];          /* 영상 표출 요청 중인 Video 목록 - 내부 형식 */
    videoList = [];                 /* 영상 표출 중인 AcesVideo instance 목록 */
    realm = '';
    nonce = '';

    onSessionListReady(target) {
        if (typeof target.onSessionReady == 'function')
            target.onSessionReady(target);
    }
    onClientListReady(target) {
        if (typeof target.onClientReady == 'function')
            target.onClientReady(target);
    }

    /* Override AcesServerInterface */
    onmessage(evt) {
        this.state = 'connected';

        switch (evt.type) {
        case AcesServer.msgHello:
            this.serverState = evt.type;
            if (evt.Realm !== undefined)
                this.realm = evt.Realm;
            if (evt.Nonce !== undefined) {
                this.nonce = evt.Nonce;
                this.userHash = md5(this.getHash(this.userPW), this.nonce, false);
            }
            this.onReady(this);
            break;

        case AcesServer.msgError:
            this.onError(evt);
            break;

        case AcesServerHDS7000.reqSessionList:
            this.serverState = evt.type;
            this.serverSessions.add(evt, this);
            break;

        case AcesServerHDS7000.reqClientList:
            this.clientSessions.add(evt, this);
            break;

        case AcesServerHDS7000.reqTranscoding:
            var result = evt.Result !== undefined ?
                            evt.Result
                            : (evt.result !== undefined ? evt.result : null);
            if (result !== null && result == true && evt.SessionName !== undefined) {
                /*
                 * Transcoding list willl soon be updated. No need to add this item
                 */
                if (evt.ready !== undefined && evt.ready) {
                    /*
                     * 세션 준비가 되어 있음을 최상단 호출자에게 알려줌
                     * -> 서버 메시지를 받은 후 추가 동작이 필요한 경우
                     *    처리할 수 있도록 함.
                     */
                    this.onServerMessage(this, {
                        message:    AcesVideo.strMediaReady,
                        key:        evt.SessionNameLong
                    });

                    /* 해당 세션이 준비되어 있으므로 바로 접속하도록 함 */
                    this.handleServerMessage({
                        code:       AcesVideo.msgMediaReady,
                        key:        evt.SessionNameLong
                    });
                }
            }
            break;

        case AcesServerHDS7000.reqTranscodingList:
            this.transcodingList = evt.SessionList !== undefined ? evt.SessionList : [];
            this.logOut(`Got Transcoding list, len=${this.transcodingList.length}`, true);
            if (typeof this.onTranscodingListReady == 'function')
                this.onTranscodingListReady(this);
            break;

        case AcesServerHDS7000.genServerMessage:
            this.handleServerMessage(evt);
            if (typeof this.onServerMessage == 'function')
                this.onServerMessage(this, evt);
            break;

        default:
            if (typeof this.onMessageDefault == 'function')
                this.onMessageDefault(evt);
            break;
        }
    }

    send(msg, param = null) {
        if (typeof msg == 'string')
            msg = { type: msg };

        msg.UserID = this.userID;
        msg.UserHash = this.userHash;
        msg.Realm = this.realm;
        msg.Nonce = this.nonce;
        msg.preventCache = Date();
        if (param != null)
            msg.param = param;
        super.sendJson(msg);
    }
    sendRequestList(list, reqType, param = null) {
        if (!list.requested) {
            this.send(reqType, param);
            list.requested = true;
        }
    }
    sendServerLog(msg) {
        this.send({ type: 'SAVE-SERVER-LOG', message: msg });
    }
    setAuthInfo(id, pw) {
        this.userID = id;
        this.userPW = pw;
    }

    requestRestart() {
        this.send(AcesServerHDS7000.reqRestart);
    }
    requestServerList() {
        this.send(AcesServerHDS7000.reqServerList);
    }
    requestServerStatus() {
        this.send(AcesServerHDS7000.reqServerStatus);
    }
    requestSessionList() {
        this.sendRequestList(this.serverSessions, AcesServerHDS7000.reqSessionList);
    }
    requestClientList(param) {
        this.sendRequestList(this.clientSessions, AcesServerHDS7000.reqClientList, param);
    }
    requestTranscoding(params) {
        var msg = {
            type: AcesServerHDS7000.reqTranscoding
        };
        function addParam(value) {
            if (params[value] !== undefined)
                msg[value] = params[value];
        }

        if (params.ConnectRetryMax !== undefined)
            this.defaultWaitTime = params.ConnectRetryMax;

        addParam('SessionName');
        addParam('SessionNameLong');
        addParam('InputURL');
        addParam('OutputResolution');
        addParam('Bitrate');
        addParam('CloseWaitTime');
        addParam('ConnectRetryMax');
        addParam('UserName');
        addParam('Password');
        addParam('SourceServer');           /* Optional */
        addParam('SourceServerPort');       /* Optional */
        addParam('ServiceSessionName');     /* Optional */
        this.send(msg);
    }
    requestTranscodingList() {
        this.send({ type: AcesServerHDS7000.reqTranscodingList });
    }

    findActiveSession(target) {
        /* First from our own list */
        if (this.sessionCount[target.SessionName] !== undefined)
            return true;

        /* Or from the list which the server sent to us */
        return this.findTranscodingList(target.SessionName);
    }
    findTranscodingList(sessionName) {
        for (var i = 0; i < this.transcodingList.length; i++) {
            var item = this.transcodingList[i];
            if (item.SessionName == sessionName)
                return true;
        }
        return false;
    }
    isSessionReady(sessionName) {
        for (var i = 0; i < this.transcodingList.length; i++) {
            var item = this.transcodingList[i];
            if (item.SessionName == sessionName)
                return item.ready;
        }
        return false;
    }

    openVideo(videoTag, target, showLog) {
        /*
         * Create a state obj first
         */
        if (this.sessionCount[target.SessionName] === undefined)
            this.sessionCount[target.SessionName] = new SessionState(target.SessionNameLong);
        else
            this.sessionCount[target.SessionName].inc();

        /* If exists and ready just start the video */
        var videoTarget = new AcesVideo(showLog);
        if (this.isSessionReady(target.SessionName)
            || this.sessionCount[target.SessionName].ready) {
            return this.startVideo(videoTarget, videoTag, target, showLog);
        }
        if (this.proxyServer != null)
            videoTarget.setProxyServer(this.proxyServer);
        if (this.useSecureConnection)
            videoTarget.setSecureConnection(this.useSecureConnection);

        /*
         * Video is not ready yet, just add to the list
         */
        var item = new PendingItem(videoTarget, videoTag, target, showLog);
        item.f1.addShutdownCallback(this.removePendingList);
        this.pendingVideoList.push(item);

        /*
         * 아예 원본에 접속이 안되는 경우 AcesVideo.open()이 호출이 안되므로
         * 표시 위치를 모를 수 있음. 향후 자동 접속 시험할 때 문제가 되므로
         * 무조건 설정하도록 함.
         */
        videoTarget.setAuthInfo(this.userID, this.userPW);
        videoTarget.targetVideo = videoTag;

        return videoTarget;
    }
    startVideo(videoTarget, videoTag, target, showLog) {
        videoTarget.sessionNameLong = target.SessionNameLong;
        videoTarget.setDefaultWaitTime(this.defaultWaitTime);
        videoTarget.setSecureConnection(this.useSecureConnection);
        videoTarget.setTransport('tcp');
        videoTarget.showProgress = false;
        videoTarget.onclose = (video, evt, running) => {
            if (!running)
                this.clearVideoInfo(video);
        };
        videoTarget.onbeforeretry = (video) => {
            /*
             * As request/service are async requests might be
             * lost and the server might not be able to receive
             * further request..
             * So let the server know we are still active..
             */
            if (!this.findTranscodingList(target.SessionName))
                this.requestTranscoding(target);
        }
        if (this.userGetTypeName != null)
            videoTarget.getTypeName = this.userGetTypeName;

        videoTarget.open(videoTag,
                         this.targetIP,
                         this.targetPort,
                         target.ServiceSessionName !== undefined ?
                            target.ServiceSessionName : target.SessionName,
                         this.targetExtIP + ':3478');
        videoTarget.onstart(videoTarget);

        /* Session record update */
        this.videoList.push(videoTarget);

        return videoTarget;
    }
    closeVideo(video) {
        if (typeof video == 'object' && video.constructor.name == 'AcesServer')
            video.shutdown();
    }
    clearVideoInfo(target) {
        /* Decrease session counter */
        for (var key in this.sessionCount) {
            if (key == target.sessionName && this.sessionCount[key].dec() <= 0) {
                delete this.sessionCount[key];
                this.logOut(`SessionCount[${target.sessionNameLong}] removed`, true);
                break;
            }
        }

        /* Find and remove an existing video object */
        var idx = -1;
        this.videoList.forEach((elem, index) => {
            if (elem == target)
                idx = index;
        });
        if (idx != -1) {
            this.videoList.splice(idx, 1);
            this.logOut(`${target.sessionNameLong} removed from the list`, true);
            target = null;
        }

        if (this.serverTimerId != null) {
            clearTimeout(this.serverTimerId);
            this.serverTimerId = null;
        }
    }
    getFirstPendingItem() {
        return this.pendingVideoList.length > 0 ? this.pendingVideoList[0] : null;
    }
    getServerMessage(evt) {
        return this.targetIP + ': ' + evt.key + ': ' + evt.message;
    }
    getHash(value) {
        var prefix ='';
        var postfix = '';
        prefix += 'W'; postfix += 'i'; prefix += 'e'; postfix += 'n';
        prefix += ' '; postfix += ' '; prefix += 'a'; postfix += 'T';
        prefix += 'r'; postfix += 'e'; prefix += 'e'; postfix += 'c';
        prefix += ' '; postfix += 'h'; prefix += 'A'; postfix += 'n';
        prefix += 'C'; postfix += 'o'; prefix += 'E'; postfix += 'l';
        prefix += 'S'; postfix += 'o'; postfix += 'g'; postfix += 'y';
        postfix += '.'; postfix += '.'; postfix += '.';
        return md5(prefix + value + postfix, '', false);
    }

    handleServerMessage(evt) {
        if (evt.code !== undefined) {
            switch (evt.code) {
            case AcesVideo.msgMediaReady:
                for (var i = 0; i < this.sessionCount.length; i++) {
                    if (this.sessionCount.name == evt.key) {
                        this.sessionCount.ready = true;
                        break;
                    }
                }
                for (var i = 0; i <  this.transcodingList.length; i++) {
                    var item = this.transcodingList[i];
                    if (item.SessionNameLong == evt.key) {
                        item.ready = true;
                        break;
                    }
                }

                /*
                 * 미디어가 접속할 수 있는 상태일 때만 처리함
                 */
                for (var i = 0; i < this.pendingVideoList.length; i++) {
                    var item = this.pendingVideoList[i];
                    if (item.f3.SessionNameLong == evt.key) {
                        /* Remove from the list first */
                        this.pendingVideoList.splice(i, 1);

                        /* Start media playing */
                        this.startVideo(item.f1, item.f2, item.f3, item.f4);

                        /* maybe */
                        i--;
                    }
               }

               /*
                * TBD: 접속 대기 상태로 오래 남아 있는 항목 처리 필요??
                */
                break;

            case AcesVideo.msgMediaInvalid:
                for (var i = 0; i < this.sessionCount.length; i++) {
                    if (this.sessionCount.name == evt.key) {
                        this.sessionCount.ready = false;
                        break;
                    }
                }
                for (var i = 0; i <  this.transcodingList.length; i++) {
                    var item = this.transcodingList[i];
                    if (item.SessionNameLong == evt.key) {
                        item.ready = false;
                        break;
                    }
                }
                break;
            }
        }
        return false;
    }
    removePendingList = (video) => {
        for (var i = 0; i < this.pendingVideoList.length; i++) {
            var item = this.pendingVideoList[i];
            if (item.f1 === video) {
                this.pendingVideoList.splice(i, 1);
                return true;
            }
        }
        return false;
    }

    /*
     * Overridables
     */
    onReady(source) {}
    onSessionReady(source) {}
    onClientReady(source) {}
    onMessageDefault(evt) {}
    onTranscodingListReady(source) {}
    onServerMessage(server, evt) {
        this.logOut(this.getServerMessage(evt));
    }
};

/* vim: set ts=4 sw=4 expandtab: */
