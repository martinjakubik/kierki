/*global define */
define('Tools', function () {
    'use strict';

    var Tools = function () {
    };

    Tools.generateID = function () {
        var sUuid;

        var fnS4 = function () {
            var n = Math.floor(Math.random() * 9999);
            return n;
        }

        var sUuid = fnS4() + '-' + fnS4();

        return sUuid;
    };

    Tools.addClass = function (oView, sClass) {
        var sClasses = oView.getAttribute('class');

        if (sClasses.indexOf(sClass) < 0) {
            oView.setAttribute('class', oView.getAttribute('class') + ' ' + sClass);
        }
    };

    Tools.setClass = function (oView, sClass) {
        oView.setAttribute('class', sClass);
    };

    Tools.removeClass = function (oView, sClass) {
        var sCurrentClasses = oView.getAttribute('class');
        var nStartIndex = sCurrentClasses.indexOf(sClass);
        var nEndIndex = nStartIndex + sClass.length;
        var sUpdatedClasses;

        if (nStartIndex > 0 && nEndIndex <= sCurrentClasses.length) {
            sUpdatedClasses = (sCurrentClasses.substr(0, nStartIndex) + ' ' +
                sCurrentClasses.substr(nEndIndex)).trim();
            oView.setAttribute('class', sUpdatedClasses);
        }
    };

    Tools.toggleClass = function (oView, sClass) {
        var sClasses = oView.getAttribute('class');

        if (sClasses.indexOf(sClass) < 0) {
            Tools.addClass(oView, sClass);
        } else {
            Tools.removeClass(oView, sClass);
        }
    };

    Tools.addStyle = function (oView, sStyleName, sStyleValue) {
        var sStyles = oView.style ? oView.style.cssText : null;

        oView.style[sStyleName] = sStyleValue;
    };

    Tools.setStyle = function (oView, sStyleName, sStyleValue) {
        oView.style[sStyleName] = sStyleValue;
    };

    Tools.removeStyle = function (oView, sStyleName) {
        oView.style[sStyleName] = '';
    };

    Tools.toggleStyle = function (oView, sStyleName, sStyleValue) {
        var sStyles = oView.style ? oView.style.cssText : null;

        if (sStyles && sStyles.indexOf(sStyleName) < 0) {
            Tools.addStyle(oView, sStyleName, sStyleValue);
        } else {
            Tools.removeStyle(oView, sStyleName);
        }
    };

    /**
    * shuffles a set of things
    */
    Tools.shuffle = function (aThings) {
        var i, n, aShuffledThings = [];

        while (aThings.length > 0) {
            n = Math.floor(Math.random() * aThings.length);
            aShuffledThings.push(aThings.splice(n, 1)[0]);
        }

        return aShuffledThings;
    };

    /**
    * checks if a list of cards includes a card
    */
    Tools.includesCard = function (aCards, oCard) {
        var bIncludesCard = false,
            i;

        for (i = 0; i < aCards.length; i++) {
            if (aCards[i].suit === oCard.suit && aCards[i].value === oCard.value) {
                bIncludesCard = true;
                break;
            }
        }

        return bIncludesCard;
    };

    /**
    * copies cards from one set to another
    */
    Tools.copyCards = function (aCardsToCopy, aCards) {

        var i;

        // clears the array
        aCards.splice(0, aCards.length);

        // copies the cards
        for (i = 0; i < aCardsToCopy.length; i++) {
            aCards.push(aCardsToCopy[i]);
        }
    };

    return Tools;
});
