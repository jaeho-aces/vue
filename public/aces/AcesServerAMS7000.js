/*
 * AcesServerAMS7000.js
 *	AMS7000 interface
 *
 * (c) 2022~2023 ACES Tech, all rights reserved.
 *
 */

class GenericRequest {
    owner = null;
    requestID = null;
    requestType = null;
    reqSent = false;
    eventCallback = null;
    valid = true;
    requestFunc = null;
    params = null;

    constructor(owner, type, callback = null, reqFunc = null, params = null) {
        this.owner = owner;
        this.requestID = owner.requestID++;
        this.requestType = type;
        this.reqSent = false;
        this.eventCallback = callback;
        this.requestFunc = reqFunc;
        this.params = params;
    }
};

class VideoRequest extends GenericRequest {
    static strCantAllocate = "Can't allocate server";

    target = null;
    serverIp = null;
    serverPort = null;
    serverExtIP = null;
    proxyServer = null;
    videoTag = null;            /* video="xxx" */
    logger = null;              /* logger */
    userID = '';
    userPW = '';
    needReconnect = false;
    useSecureConnection = false;
    userGetTypeName = null;

    /*
     * AcesXXX class instances
     */
    hds7000 = null;             /* AcesServerHDS7000 object */
    videoObj = null;            /* AcesVideo object */
    connectionErrorCount = 0;   /* WebSocket 연결 실패 횟수 (최대 5회 재시도) */
    retryCount = 0;             /* onretry 경로(초기접속실패/영상없음 등) 재시도 횟수 (최대 5회) */
    noSessionInListCount = 0;   /* 변환 목록에 세션이 연속 없을 때 카운트 (2회 시 에러) */
    wasInListAtLeastOnce = false; /* 목록에 한 번이라도 올라온 적 있음 (다른 슬롯 목록으로 에러 방지) */
    pendingForStream = false;   /* startVideo 호출 전 대기 중 */
    pendingTimeoutId = null;    /* 대기 타임아웃(15초) 타이머 ID */

    constructor(owner, type, videoTag, target, callback) {
        super(owner, type, callback);
        this.videoTag = videoTag;
        this.target = target;
        this.userID = owner.userID;
        this.userPW = owner.userPW;
        this.proxyServer = owner.proxyServer;
        this.useSecureConnection = owner.useSecureConnection;
        this.userGetTypeName = owner.userGetTypeName;
    }

    onServerAllocated(evt) {
        var result = evt.Result !== undefined ?
                        evt.Result
                        : (evt.result !== undefined ? evt.result : null);
        if (result == null || (result.error !== undefined && result.error == "fail")) {
            this.onError(evt);
            this.shutdown(AcesServer.clearTimer);
            return;
        }
        if (this.proxyServer == null
            && result.serverExtIp != undefined
            && result.serverExtIp != '') {
            /* 시험용이나 https를 사용하지 않을 경우 */
            this.serverIp = result.serverExtIp;
        } else
            this.serverIp = result.serverIp !== undefined ?  result.serverIp : null;
        this.serverPort = result.serverIp !== undefined ?  result.serverPort : 8880;

        if (this.serverIp != null && this.serverPort != null) {
            this.hds7000 = new AcesServerHDS7000(false, true);
            this.hds7000.setAuthInfo(this.userID, this.userPW);
            this.hds7000.setProxyServer(this.proxyServer);
            this.hds7000.setSecureConnection(this.useSecureConnection);
            this.hds7000.setUserGetTypeName(this.userGetTypeName);

            /* Just for debug */
            this.hds7000.targetIP = this.serverIp;
            this.hds7000.setOutIP();
            this.hds7000.logOut(`${this.target.SessionNameLong}: Server allocated`, true);

            /*
             * WebRTC messages should go to a proxy port
             * and STUN messages should go to this external port
             */
            if (result.serverExtIp != undefined && result.serverExtIp != '')
                this.hds7000.setTargetExtIP(result.serverExtIp);

            this.hds7000.onError = this.onError;
            this.hds7000.onReady = this.onServerReady;
            this.hds7000.onServerMessage = this.onServerMessage;
            this.hds7000.open(this.serverIp, this.serverPort);
        } else
            console.log(`${this.target.SessionNameLong}: No data for server allocated`);
    }
    onServerReady = (source) => {
        if (this.hds7000 == null && source) {
            if (this.videoObj != null) {
                /* 처리 완료된 상황임 */
                source.logOut(`${this.target.SessionNameLong}: Already handled`, true);
                source.shutdown(AcesServer.clearTimer);
                return;
            }

            /* 서버와 접속이 끊어진 경우 완전히 재시작하도록 함 */
            source.logOut(`${this.target.SessionNameLong}: Server disconnected`, true);
            if (typeof this.target.onVideoError == 'function') {
                this.target.onVideoError();
                return;
            }
        }

        /* HDS7000에 영상 접속 및 변환 시작을 요청함 */
        this.hds7000.requestTranscoding(this.target);
        this.hds7000.logOut(`${this.target.SessionNameLong}: Transcoding requested`, true);

        /* WebRTC 접속 요청 */
        this.videoObj = this.hds7000.openVideo(this.videoTag, this.target, false);
        this.videoObj.owner = this;
        this.videoObj.onstart = this.onVideoStart;
        this.videoObj.onretry = this.onVideoRetry;
        /* WebSocket 연결 실패 시 최대 5회까지 재시도 후 종료 */
        this.videoObj.onerror = this.onVideoConnectionError;

        /* 변환 목록에 세션이 없으면 대기하지 않고 에러 알림 (startVideo가 호출되지 않는 경우) */
        this.hds7000.onTranscodingListReady = this.onTranscodingListReady;

        this.pendingForStream = true;
        var self = this;
        this.pendingTimeoutId = setTimeout(function() {
            self.pendingTimeoutId = null;
            if (self.videoObj && self.pendingForStream && !self.wasInListAtLeastOnce) {
                if (self.target.onVideoError !== undefined && typeof self.target.onVideoError === 'function')
                    self.target.onVideoError({ message: '변환 세션 없음' });
                self.videoObj.shutdown();
                self.videoObj = null;
            }
        }, 15000);

        /* For additional control */
        if (this.target.onVideoOK !== undefined && typeof this.target.onVideoOK == 'function')
            this.videoObj.ondisplayok = this.target.onVideoOK;
        /* target.onVideoError는 onVideoConnectionError에서 재시도 포기 시 호출 */
        if (this.target.onVideoClose !== undefined && typeof this.target.onVideoClose == 'function')
            this.videoObj.addShutdownCallback(this.target.onVideoClose);
    }
    onServerMessage = (server, evt) => {
        if (typeof this.eventCallback == 'function')
            this.eventCallback(server, evt);
    }
    /* 변환 목록 수신 시: 한 번이라도 목록에 있었을 때만 "사라짐"으로 에러 (다른 슬롯 영향 제거) */
    onTranscodingListReady = (source) => {
        if (!this.videoObj) return;
        if (source.findTranscodingList(this.target.SessionName)) {
            this.wasInListAtLeastOnce = true;
            this.noSessionInListCount = 0;
            return;
        }
        if (!this.wasInListAtLeastOnce) return;
        this.noSessionInListCount = (this.noSessionInListCount || 0) + 1;
        if (this.noSessionInListCount >= 1) {
            if (this.pendingTimeoutId != null) {
                clearTimeout(this.pendingTimeoutId);
                this.pendingTimeoutId = null;
            }
            if (this.target.onVideoError !== undefined && typeof this.target.onVideoError === 'function')
                this.target.onVideoError({ message: '변환 세션 없음' });
            this.videoObj.shutdown();
            this.videoObj = null;
            this.noSessionInListCount = 0;
        }
    }
    onVideoStart = (target) => {
        this.pendingForStream = false;
        if (this.pendingTimeoutId != null) {
            clearTimeout(this.pendingTimeoutId);
            this.pendingTimeoutId = null;
        }
        try {
            this.hds7000.shutdown(AcesServer.clearTimer);
        } catch(e) {
            /*
             * 이 상황이면 WebRTC가 남을 수 있음.
             * 이미 처리된 요청일 수 있으니 영상은 닫도록 함
             */
            target.shutdown(AcesServer.clearTimer);
        }
        this.hds7000 = null;
    }
    onVideoRetry = (msg) => {
        this.retryCount = (this.retryCount || 0) + 1;
        var shouldRetry = this.retryCount <= 5;
        if (!shouldRetry) {
            if (this.target.onVideoError != undefined && typeof this.target.onVideoError == 'function')
                this.target.onVideoError({ message: msg });
        }
        return shouldRetry;
    }
    /* WebSocket 연결 실패 시 최대 5회 재시도. true=재시도, false=종료 */
    onVideoConnectionError = (evt) => {
        this.connectionErrorCount = (this.connectionErrorCount || 0) + 1;
        var shouldRetry = this.connectionErrorCount <= 5;
        if (!shouldRetry && this.target.onVideoError !== undefined && typeof this.target.onVideoError == 'function')
            this.target.onVideoError(evt);
        return shouldRetry;
    }
    onError(evt) {
        if (this.videoObj !== undefined
            && this.videoObj != null
            && this.videoObj.onerror !== undefined
            && typeof this.videoObj.onerror == 'function')
            this.videoObj.onerror(evt);
        else if (this.target !== undefined
                 && this.target != null
                 && this.target.onVideoError !== undefined
                 && typeof this.target.onVideoError == 'function')
            this.target.onVideoError(evt);
    }
    shutdown() {
        if (this.pendingTimeoutId != null) {
            clearTimeout(this.pendingTimeoutId);
            this.pendingTimeoutId = null;
        }
        if (this.hds7000 != null)
            this.onVideoStart({});

        if (this.videoObj !== undefined && this.videoObj !== null) {
            this.videoObj.shutdown();
            this.videoObj = null;
        }
        this.owner.removeRequest(this);
        this.valid = false;
    }
    removeShutdownCallback(callback) {
        if (this.videoObj !== undefined && this.videoObj !== null)
            this.videoObj.removeShutdownCallback(callback);
    }
};

class AcesServerAMS7000 extends AcesServerHDS7000 {
    static XcodePrefix = 'video@';
    static reqServerAllocate = 'REQ-SERVER-ALLOCATE';

    serverIp = null;            /* AMS7000 server IP */
    serverPort = null;          /* AMS7000 server port */
    requestID = 0;              /* Request ID */
    requests = [];
    requestTimer = null;
    honorSourceServer = false;
    closeTimerCount = 0;        /* No activity close timer */

    constructor(serverIp, serverPort = 8880, honorSourceServer = false, showLog = false) {
        super(false, showLog);

        this.honorSourceServer = honorSourceServer;
        this.serverIp = serverIp;
        this.serverPort = serverPort;
    }

    allocate(videoTag, target, callback) {
        return this.issueRequest(
                new VideoRequest(this, AcesServerAMS7000.reqServerAllocate,
                                 videoTag, target, callback));

    }
    getSessionList(callback) {
        return this.issueRequest(
                new GenericRequest(this, AcesServerHDS7000.reqSessionList, callback,
                                   this.requestSessionList));
    }
    getServerList(callback) {
        return this.issueRequest(
                new GenericRequest(this, AcesServerHDS7000.reqServerList, callback,
                                   this.requestServerList));
    }
    getClientList(callback, params = null) {
        return this.issueRequest(
                new GenericRequest(this, AcesServerHDS7000.reqClientList, callback,
                                   this.requestClientList, params));
    }
    getServerStatus(callback) {
        return this.issueRequest(
                new GenericRequest(this, AcesServerHDS7000.reqServerStatus, callback,
                                   this.requestServerStatus));
    }
    sendRestart(callback) {
        return this.issueRequest(
                new GenericRequest(this, AcesServerHDS7000.reqRestart, callback,
                                   this.requestRestart));
    }

    issueRequest(req) {
        this.requests.push(req);
        if (this.open(this.serverIp, this.serverPort)) {
            this.setCloseTimer();
            this.sendRequest();
        }
        return req;
    }

    /*
     * @brief owner video open call
     *
     * @param videoTag      DIV element ID
     * @param target        object got from the server
     *                      f0: Camera name being displayed on UI
     *                      f1: HDS7000 server session name
     *                      f2: Camera source URL
     *                      f3: source connection type (0: UDP, 1: TCP)
     *                      f4: unused
     *                      f5: user name
     *                      f6: user password
     *                      f7: camera input relay server ip (in case the source camera input is
     *                          only allowed to this server)
     *                      f8: camera input relay server port
     *                      f10: close wait time
     *                      f11: output video resolution (ie: "720x480")
     *                      f12: output video bitrate in Kbps
     * @param callback      event handler
     * @param callbackOK    display OK event handler
     * @param callbackError display error event handler
     * @param callbackClose display closing event handler
     * @return VideoRequest object
     */
    openVideo(videoTag, target, callback = null,
              callbackOK = null, callbackError = null, callbackClose = null) {
        /*
         * If the target is one from the sessionList
         * convert to our internal object.
         */
        var targetVideo = {};
        if (target.f0 !== undefined
            && target.f1 !== undefined
            && target.f2 !== undefined) {
            targetVideo.SessionNameLong = target.f0;
            targetVideo.SessionName = target.f1;
            targetVideo.InputURL = target.f2;
            if (target.f3 !== undefined)
                targetVideo.ConnectionType = target.f3;
            if (target.f5 !== undefined)
                targetVideo.UserName = target.f5;
            if (target.f6 !== undefined)
                targetVideo.Password = target.f6;

            /*
             * 주: F7 항목은 현장 요구에 따라 설정 가능하도록 하여야 함.
             * 반드시 f7에 명시된 서버를 통해서만 영상을 받을 수 있는 경우에는
             * 기존 URL을 사용하도록 함. 실제 URL은 HDS7000에서 설정할 것임.
             */
            if (this.honorSourceServer && target.f7 !== undefined) {
                targetVideo.SourceServer = target.f7;
                if (target.f8 !== undefined)
                    targetVideo.SourceServerPort = target.f8;
                if (targetVideo.SessionName.indexOf(AcesServerAMS7000.XcodePrefix) == -1)
                    targetVideo.ServiceSessionName = AcesServerAMS7000.XcodePrefix + targetVideo.SessionName;
                else
                    targetVideo.ServiceSessionName = 'New' + targetVideo.SessionName;
            }

            /* 종료 후 대기 시간 설정 */
            if (target.f10 !== undefined)
                targetVideo.CloseWaitTime = target.f10;
            if (target.f11 !== undefined)
                targetVideo.OutputResolution = target.f11;
            if (target.f12 !== undefined)
                targetVideo.Bitrate = target.f12;
        } else if (target.SessionName !== undefined
                   && target.SessionName !== undefined
                   && target.InputURL !== undefined) {
            targetVideo = target;
        } else
            return null;

        if (targetVideo.ServiceSessionName === undefined
            && targetVideo.SessionName.indexOf(AcesServerAMS7000.XcodePrefix) == -1)
            targetVideo.SessionName = AcesServerAMS7000.XcodePrefix + targetVideo.SessionName

        /* 영상 접속 상태에 따른 추가 제어가 필요할 경우 */
        if (callbackOK !== null)
            targetVideo.onVideoOK = callbackOK;
        if (callbackError !== null)
            targetVideo.onVideoError = callbackError;
        if (callbackError !== null)
            targetVideo.onVideoError = callbackError;
        if (callbackClose !== null)
            targetVideo.onVideoClose = callbackClose;

        /*
         * Issue server request first
         */
        return this.allocate(videoTag, targetVideo, callback);
    }

    /*
     * @brief send any outstanding request
     */
    sendRequest() {
        var req = null;
        for (var i = 0; i < this.requests.length; i++) {
            var item = this.requests[i];
            if (!item.reqSent) {
                req = item;
                break;
            }
        }
        if (req != null) {
            switch (req.requestType) {
            case AcesServerAMS7000.reqServerAllocate:
                this.send({
                    type:   req.requestType,
                    params: req.target
                });
                req.reqSent = true;
                break;

            default:
                req.requestFunc.call(this, req.params);
                req.reqSent = true;
                break;
            }
            return req.reqSent;
        }
        return false;
    }

    /*
     * @brief AcesServerHDS7000.onmessage extension
     */
    onMessageDefault(evt) {
        var reqMatch = null;
        for (var i = 0; i < this.requests.length; i++) {
            var req = this.requests[i];
            if (req.reqSent && req.requestType == evt.type) {
                this.requests.splice(i, 1);
                reqMatch = req;
                break;
            }
        }
        if (reqMatch != null) {
            if (reqMatch.requestType == AcesServerAMS7000.reqServerAllocate) {
                /* */
                reqMatch.onServerAllocated(evt);
            } else if (reqMatch.requestType == AcesServerHDS7000.reqServerList) {
                /* */
                reqMatch.eventCallback(evt.Result);
            } else if (reqMatch.requestType == AcesServerHDS7000.reqSessionList) {
                /* */
                reqMatch.eventCallback(this.serverSessions.list);
            } else {
                /* */
                try {
                    reqMatch.eventCallback(evt);
                } catch (e) {
                    this.logOut('event callback error', false);
                }
            }
        }
        this.sendRequest();
    }
    setCloseTimer() {
        /* Default 30 secs */
        this.closeTimerCount = 300;
    }

    /*
     * Callback when WebSocket established..
     */
    onReady(source) {
        this.setCloseTimer();
        this.sendRequest();
    }
    onSessionReady(source) {
        /*
         * 세션 목록은 단일 응답이 아닐 수 있으므로 AcesServerHDS7000.onmessage()에서
         * 바로 호출을 받지 않음. 해당 목록 최종 응답을 받으면 개별 목록 수신 완료
         * 호출로 이 함수를 호출함.
         * 같은 처리를 반복하지 않도록 onMessageDefault()를 호출하고 끝냄.
         */
        this.onMessageDefault({ type: AcesServerHDS7000.reqSessionList });
    }
    onTimer() {
        if (this.closeTimerCount > 0 && --this.closeTimerCount == 0)
            this.shutdown();
    }

    removeRequest(req) {
        for (var i = 0; i < this.requests.length; i++) {
            if (req == this.requests[i]) {
                this.requests.splice(i, 1);
                return;
            }
        }
    }
    shutdown(clear) {
        super.shutdown(clear);

        /*
         * 차후 재접속할 수 있도록 함
         */
        this.stopped = clear != undefined ? clear : false;
    }

};

/* vim: set ts=4 sw=4 expandtab: */
