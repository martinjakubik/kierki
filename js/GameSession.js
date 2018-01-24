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
     * checks if a player is local
     *
     * @param oPlayerValue a player object
     *
     * @return true if local
     */
    GameSession.isLocal = function (oPlayerValue) {

        var sSessionId = GameSession.getBrowserSessionId();

        if (sSessionId === oPlayerValue.sessionId) {
            return true;
        }

        return false;
    };

    /**
     * checks which players in the given game slot are local (player 0, player 1
     * or both)
     *
     * @param aPlayerControllers a list of player controllers
     *
     * @return object {
     *             player0: true if local,
     *             player1: true if local
     *         }
     */
    GameSession.whoIsLocal = function (aPlayerControllers) {

        var sSessionId = GameSession.getBrowserSessionId(),
            sPlayer0SessionId = -1,
            sPlayer1SessionId = -1;

        var oIsLocal = {
            player0: null,
            player1: null
        };

        if (aPlayerControllers) {

            if (aPlayerControllers[0] && aPlayerControllers[0].sessionId) {
                oIsLocal.player0 = GameSession.isLocal(aPlayerControllers[0]);
            }

            if (aPlayerControllers[1] && aPlayerControllers[1].sessionId) {
                oIsLocal.player1 = GameSession.isLocal(aPlayerControllers[1]);
            }
        }

        return oIsLocal;
    };

    return GameSession;
});
