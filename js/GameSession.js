/*global define */
define('GameSession', ['Tools'], function (Tools) {

    'use strict';

    var GameSession = function () {

    };

    /**
     * makes a new ID for the browser session (ie. this is the first player to
     * join)
     *
     * @return the new session ID
     */
    GameSession.makeNewBrowserSessionId = function (oGameRef) {

        var sKey = 'sessionId';
        var sValue = Tools.generateID();
        sessionStorage.setItem(sKey, sValue);

        return sValue;
    };

    /**
     * gets the browser session Id; creates a new on if none exists
     *
     * @return the sessionId
     */
    GameSession.getBrowserSessionId = function () {

        var sKey = 'sessionId';
        var sValue = sessionStorage.getItem(sKey);
        if (!sValue) {
            sValue = GameSession.makeNewBrowserSessionId();
        }

        return sValue;
    };

    /**
     * checks which players in the given game slot are local (player 0, player 1
     * or both)
     *
     * @param oGameSlot a game slot
     *
     * @return object {
     *             player0: true if local,
     *             player1: true if local
     *         }
     */
    GameSession.whoIsLocal = function (oGameSlot) {

        var sSessionId = GameSession.getBrowserSessionId(),
            sPlayer0SessionId = -1,
            sPlayer1SessionId = -1;

        var oIsLocal = {
            player0: true,
            player1: true
        };

        if (oGameSlot) {

            if (oGameSlot.player0 && oGameSlot.player0.sessionId) {
                     sPlayer0SessionId = oGameSlot.player0.sessionId;
                     if (sSessionId === sPlayer0SessionId) {
                         oIsLocal.player0 = true;
                     } else {
                         oIsLocal.player0 = false;
                     }
                 }

            if (oGameSlot.player1 && oGameSlot.player1.sessionId) {
                     sPlayer1SessionId = oGameSlot.player1.sessionId;
                     if (sSessionId === sPlayer1SessionId) {
                         oIsLocal.player1 = true;
                     }
                 }
        }

        return oIsLocal;
    };

    return GameSession;
});
