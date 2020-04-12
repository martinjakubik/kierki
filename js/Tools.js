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
        var n, aShuffledThings = [];

        while (aThings.length > 0) {
            n = Math.floor(Math.random() * aThings.length);
            aShuffledThings.push(aThings.splice(n, 1)[0]);
        }

        return aShuffledThings;
    };

    /**
    * gets the last sub-object from an object
    */
    Tools.getLastItemInObject = function (oThings) {

        var aThingKeys = Object.keys(oThings);
        var aLastThingKey = aThingKeys[aThingKeys.length - 1];

        return oThings[aLastThingKey];

    };

    /**
    * gets the number of last sub-object from an object
    */
    Tools.getKeyOfLastItemInObject = function (oThings) {

        var aThingKeys = Object.keys(oThings);
        var aLastThingKey = aThingKeys[aThingKeys.length - 1];

        return aLastThingKey;

    };

    Tools.makeButton = function (oParameters) {
        var sId = oParameters.id;
        var sClass = oParameters.class ? oParameters.class : sId;
        var sLabel = oParameters.label ? oParameters.label : null;
        var oParentView = oParameters.parentView;
        var oHandler = oParameters.handler;

        var oButton = document.createElement('button');
        oButton.setAttribute('id', sId);
        if (sLabel) {
            var oContent = document.createTextNode(sLabel);
            oButton.appendChild(oContent);
            Tools.setClass(oButton, 'textButton');
        } else {
            Tools.setClass(oButton, 'iconButton');
        }
        Tools.addClass(oButton, sClass);
        oButton.onclick = oHandler;
        oParentView.insertBefore(oButton, null);

        return oButton;
    }

    Tools.makeTextInput = function (oParameters) {

        var sId = oParameters.id;

        if (!sId) {
            return;
        }

        var sRefId = oParameters.refId ? oParameters.refId : sId;
        var sClass = oParameters.class ? oParameters.class : sId;
        var oParentView = oParameters.parentView;
        var oChangeHandler = oParameters.handler;

        var oTextInputView = document.createElement('input');
        Tools.setClass(oTextInputView, sClass);
        oTextInputView.setAttribute('id', sId);
        oTextInputView.setAttribute('ref-id', sRefId);

        oTextInputView.onchange = oChangeHandler;

        oParentView.insertBefore(oTextInputView, null);

    }

    return Tools;
});
