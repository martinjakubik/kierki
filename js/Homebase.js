/*global define */
define('Homebase', ['Tools'], function (Tools) {
    'use strict';

    var Homebase = function (nHomebaseNum, oRemoteReference, sSessionId, bIsLocal) {

        this.homebaseNum = nHomebaseNum;
        this.remoteReference = oRemoteReference || null;
        this.sessionId = sSessionId;
        this.isLocal = bIsLocal;

        this.name = '';

    };

    Homebase.prototype.getHomebaseNum = function () {
        return this.homebaseNum;
    };

    Homebase.prototype.getName = function () {
        return this.name;
    };

    Homebase.prototype.setName = function (sName) {
        this.name = sName;
    };

    Homebase.prototype.getSessionId = function () {
        return this.sessionId;
    };

    Homebase.prototype.setSessionId = function (sSessionId) {
        this.sessionId = sSessionId;
    };

    Homebase.prototype.isLocal = function () {
        return this.isLocal;
    };

    Homebase.prototype.setIsRemote = function (bIsLocal) {
        this.isLocal = bIsLocal;
    };

    Homebase.prototype.makeHomebaseView = function (oPlayAreaView) {

        var oHomebaseView,
            oHomebaseNameView;

        oHomebaseView = document.createElement('div');
        Tools.setClass(oHomebaseView, 'homebase');
        oHomebaseView.setAttribute('id', 'player' + this.homebaseNum);

        oPlayAreaView.insertBefore(oHomebaseView, null);

        oHomebaseNameView = document.createElement('input');
        Tools.setClass(oHomebaseNameView, 'name');
        oHomebaseNameView.setAttribute('id', 'name' + this.homebaseNum);
        oHomebaseNameView.setAttribute('ref-id', this.homebaseNum);
        oHomebaseNameView.value = this.getName();

        var fnOnHomebaseNameChanged = function (oEvent) {
            var nRefId, sValue = '';
            if (oEvent && oEvent.target) {
                nRefId = oEvent.target.getAttribute('ref-id');
                sValue = oEvent.target.value;
            }
            this.players[nRefId].setName(sValue);
        }.bind(this);

        oHomebaseNameView.onchange = fnOnHomebaseNameChanged;

        oHomebaseView.insertBefore(oHomebaseNameView, null);
    };

    /**
    * renders player's name
    */
    Homebase.prototype.renderName = function () {

        var oHomebaseNameView = document.getElementById('name' + this.homebaseNum);

        // redraws the name
        oHomebaseNameView.value = this.getName();
    };

    Homebase.prototype.updateRemoteReference = function () {

        this.remoteReference.set({
            name: this.getName(),
            sessionId: this.getSessionId()
        });
    };

    return Homebase;
});
