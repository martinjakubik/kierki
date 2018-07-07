/*global define */
define('Player', ['Tools'], function (Tools) {
    'use strict';

    var cardFlipSound = new Audio('../resources/cardflip.wav');
    var cardShwipSound = new Audio('../js/lib/kierki/resources/cardshwip.wav');

    var Player = function (nPlayerNum, oRemoteReference, nCardWidth, sSessionId, bIsLocal) {

        this.playerNum = nPlayerNum;
        this.remoteReference = oRemoteReference || null;
        this.cardWidth = nCardWidth;
        this.sessionId = sSessionId;
        this.isLocal = bIsLocal;

        this.name = '';
        this.hand = [];
        this.table = [];

        this.fannedCards = false;
    };

    Player.prototype.getPlayerNum = function () {
        return this.playerNum;
    };

    Player.prototype.getName = function () {
        return this.name;
    };

    Player.prototype.setName = function (sName) {
        this.name = sName;
    };

    Player.prototype.getHand = function () {
        return this.hand;
    };

    Player.prototype.setHand = function (aCards) {
        this.hand = aCards;
    };

    Player.prototype.getTable = function () {
        return this.table;
    };

    Player.prototype.setTable = function (aCards) {
        this.table = aCards;
    };

    Player.prototype.getSessionId = function () {
        return this.sessionId;
    };

    Player.prototype.setSessionId = function (sSessionId) {
        this.sessionId = sSessionId;
    };

    Player.prototype.isLocal = function () {
        return this.isLocal;
    };

    Player.prototype.setIsRemote = function (bIsLocal) {
        this.isLocal = bIsLocal;
    };

    Player.prototype.getNumberCards = function () {
        return this.hand.length;
    };

    Player.prototype.makePlayerView = function (oPlayAreaView) {

        var oPlayerView,
            oPlayerTableView,
            oPlayerHandView,
            oPlayerNameView;

        oPlayerView = document.createElement('div');
        Tools.setClass(oPlayerView, 'player');
        oPlayerView.setAttribute('id', 'player' + this.playerNum);

        oPlayAreaView.insertBefore(oPlayerView, null);

        oPlayerTableView = document.createElement('div');
        Tools.setClass(oPlayerTableView, 'table');
        oPlayerTableView.setAttribute('id', 'table' + this.playerNum);

        oPlayerView.insertBefore(oPlayerTableView, null);

        oPlayerHandView = document.createElement('div');
        Tools.setClass(oPlayerHandView, 'hand');
        oPlayerHandView.setAttribute('id', 'hand' + this.playerNum);

        oPlayerView.insertBefore(oPlayerHandView, null);

        oPlayerNameView = document.createElement('input');
        Tools.setClass(oPlayerNameView, 'name');
        oPlayerNameView.setAttribute('id', 'name' + this.playerNum);
        oPlayerNameView.setAttribute('ref-id', this.playerNum);
        oPlayerNameView.value = this.getName();

        var fnOnPlayerNameChanged = function (oEvent) {
            var nRefId, sValue = '';
            if (oEvent && oEvent.target) {
                nRefId = oEvent.target.getAttribute('ref-id');
                sValue = oEvent.target.value;
            }
            this.players[nRefId].setName(sValue);
        }.bind(this);

        oPlayerNameView.onchange = fnOnPlayerNameChanged;

        oPlayerView.insertBefore(oPlayerNameView, null);
    };

    /**
    * renders player's name
    */
    Player.prototype.renderName = function () {

        var oPlayerNameView = document.getElementById('name' + this.playerNum);

        // redraws the name
        oPlayerNameView.value = this.getName();
    };

    /**
    * renders the cards in a player's table
    */
    Player.prototype.renderTable = function () {

        var i, oPlayAreaView = document.getElementById('playArea'),
            oPlayerTableView = document.getElementById('table' + this.playerNum),
            fnOnTapUpdateGame = null;

        if (!oPlayerTableView) {
            this.makePlayerView(oPlayAreaView);
            oPlayerTableView = document.getElementById('table' + this.playerNum);
        }

        // clears view of all cards
        while (oPlayerTableView.firstChild) {
            oPlayerTableView.removeChild(oPlayerTableView.firstChild);
        }

        // redraws the whole table
        var bShowCardFace = false,
            bIsMoving = false;
        for (i = 0; i < this.table.length; i++) {
            bShowCardFace = i % 2 === 0;
            bIsMoving = i === (this.table.length - 1);
            this.addCardToView(oPlayerTableView, this.table[i], 0, this.hand.length + this.table.length, bShowCardFace, bIsMoving);
        }
    };

    /**
     * renders the cards in a player's hand
     */
    Player.prototype.renderHand = function () {

        var i, oPlayAreaView = document.getElementById('playArea'),
            oPlayerHandView = document.getElementById('hand' + this.playerNum),
            bShowCardFace = false,
            bIsMoving = false,
            fnOnTapUpdateGame = null;

        // stops drawing the hand if this is not a local player
        if (!this.isLocal) {
            return;
        }

        if (!oPlayerHandView) {
            this.makePlayerView(oPlayAreaView);
            oPlayerHandView = document.getElementById('hand' + this.playerNum);
        }

        // clears view of all cards
        while (oPlayerHandView.firstChild) {
            oPlayerHandView.removeChild(oPlayerHandView.firstChild);
        }

        // redraws the whole hand
        for (i = 0; i < this.hand.length; i++) {
            this.addCardToView(oPlayerHandView, this.hand[i], i, this.hand.length, bShowCardFace, bIsMoving);
        }
    };

    /**
     * adds the given card to the given view
     */
    Player.prototype.addCardToView = function (oView, oCard, nCardPosition, nNumCards, bShowCardFace, bIsMoving, fnOnTapUpdateGame) {

        // creates a card view
        var oCardView = document.createElement('div');

        // calculates the z-index based on the position in the card set
        var nZedIndex = nNumCards - nCardPosition + 1;

        // calculates the position
        var nLeftPosition = 90 + nCardPosition * 12;

        // sets card styles, including z-index
        Tools.setClass(oCardView, 'card');
        Tools.addStyle(oCardView, 'z-index', nZedIndex);
        Tools.addStyle(oCardView, 'left', nLeftPosition + 'px');

        // sets the card to show back or face
        if (bShowCardFace === false) {
            Tools.addClass(oCardView, 'showBack');
        } else {
            Tools.addClass(oCardView, 'showFace');
        }

        // uses a class to flag that the card should be animated
        // (ie. moving to the table)
        if (bIsMoving) {
            if (this.isLocal) {
                if (bShowCardFace) {
                    Tools.addClass(oCardView, 'movingToTableFromLocalFlip');
                } else {
                    Tools.addClass(oCardView, 'movingToTableFromLocal');
                }
            } else {
                if (bShowCardFace) {
                    Tools.addClass(oCardView, 'movingToTableFromRemoteFlip');
                } else {
                    Tools.addClass(oCardView, 'movingToTableFromRemote');
                }
            }

            oCardView.addEventListener('animationend', this.finishedMovingToTableListener, false);
        }

        oCardView.onclick = this.onTapCardInHand;

        // sets the card's id as suit+value
        oCardView.setAttribute('id', 'card' + oCard.value + '-' + oCard.suit);

        oView.insertBefore(oCardView, null);
    };

    Player.prototype.finishedMovingToTableListener = function (oEvent) {

        switch (oEvent.type) {
          case 'animationend':
              var oElement = oEvent.target;

              // removes moving to table flag
              Tools.removeClass(oElement, 'movingToTableFromLocal');
              Tools.removeClass(oElement, 'movingToTableFromLocalFlip');
              Tools.removeClass(oElement, 'movingToTableFromRemote');
              Tools.removeClass(oElement, 'movingToTableFromRemoteFlip');
              break;
          default:

        }
    };

    Player.prototype.putCardOnTable = function () {

        this.table.push(this.hand[0]);
        this.hand.splice(0, 1);

        this.renderHand();
        this.renderTable();

        this.updateRemoteReference();

        cardFlipSound.play();
    };

    Player.prototype.moveTableToHand = function (aTable) {

        // copies the given table to this player's hand
        if (aTable && aTable.length > 0) {
            Array.prototype.push.apply(this.hand, aTable);

            // clears the given table
            aTable.splice(0);
        } else {
            // if no given table, copies this player's table to this player's
            // hand
            Array.prototype.push.apply(this.hand, this.table);

            // clears this player's table
            this.clearTable();
        }

        cardShwipSound.play();

        // updates the remote reference for this player
        // TODO: optimize performance here; if we have two or more players, all
        // of whose cards are "won" by the present player, then we will update
        // the remote reference every time we call this method; instead, we
        // should only call update once: for example, make moveTableToHand a
        // promise, and only when all promises complete call
        // updateRemoteReference
        this.updateRemoteReference();
    };

    Player.prototype.clearTable = function () {
        this.table.splice(0);
    };

    Player.prototype.getTableCard = function () {

        if (this.table.length > 0) {
            return this.table[this.table.length - 1];
        }
        return null;
    };

    Player.prototype.updateRemoteReference = function () {

        this.remoteReference.set({
            name: this.getName(),
            hand: this.getHand(),
            table: this.getTable(),
            sessionId: this.getSessionId()
        });
    };

    /**
     * finds a card view for a given card Id
     */
    var findCardViewForId = function (sCardId) {

        var i;
        var oCardView = null;

        var oCardView = document.getElementById('card' + sCardId);

        if (oCardView) {
            return oCardView;
        }

        return oCardView;
    };

    /**
     * wiggles a card
     */
    Player.prototype.wiggleCardInHand = function () {

        var oCard = this.getHand() ? this.getHand()[0] : null;
        if (oCard) {
            var sCardId = oCard.value + '-' + oCard.suit;

            var oCardView = findCardViewForId(sCardId);

            if (oCardView) {
                Tools.addClass(oCardView, 'wiggling');
                oCardView.addEventListener('animationend', this.finishedWigglingListener, false);
            }
        }
    };

    /**
     * stops wiggling a card
     */
    Player.prototype.finishedWigglingListener = function (oEvent) {

        switch (oEvent.type) {
          case 'animationend':
              var oElement = oEvent.target;

              // removes moving to table flag
              Tools.removeClass(oElement, 'wiggling');
              break;
          default:

        }
    };

    /**
     * decides what to do when a card is tapped depending on position of tap
     */
    var fnTapCard = function (oEvent) {
        var oTarget = oEvent ? oEvent.currentTarget : null;
        if (!oTarget) {
            return;
        }

        var nPositionOnCard = oEvent.offsetY;
        if (nPositionOnCard < 80) {
            this.onTapPlayCard(oEvent);
        } else {
            this.fanCards.call(this, oEvent);
        }
    };

    /**
     * sets the function for tapping a a card that player wants to play
     */
    Player.prototype.setOnTapCardInHand = function (fnOnTapPlayCard, bIsSplitHalf=false) {
        this.onTapPlayCard = fnOnTapPlayCard;

        if (bIsSplitHalf) {
            this.onTapCardInHand = fnTapCard.bind(this);
        } else {
            this.onTapCardInHand = fnOnTapPlayCard;
        }
    };

    /**
    * gets index of the given card view
    */
    Player.prototype.getIndexOfCardViewInHand = function (oCardView) {
        var i,
            aCards = this.getHand(),
            sCardId = oCardView.id,
            sCardInCardsId;

        for (i = 0; i < aCards.length; i++) {
            sCardInCardsId = 'card' + aCards[i].value + '-' + aCards[i].suit;
            if (sCardId === sCardInCardsId) {
                return i;
            }
        }
    };

    /**
    * unfans all cards
    */
    Player.prototype.unfanCards = function () {

        // puts back first card
        var oCard = this.getHand() ? this.getHand()[0] : null;
        var sCardId = oCard.value + '-' + oCard.suit;
        var oCardView = findCardViewForId(sCardId);

        Tools.removeClass(oCardView, 'showFace');
        Tools.removeClass(oCardView, 'fannedCard');
        Tools.addClass(oCardView, 'showBack');

        // puts back first card
        oCard = this.getHand() ? this.getHand()[this.getHand().length - 1] : null;
        sCardId = oCard.value + '-' + oCard.suit;
        oCardView = findCardViewForId(sCardId);

        Tools.removeClass(oCardView, 'showFace');
        Tools.removeClass(oCardView, 'fannedCard');
        Tools.addClass(oCardView, 'showBack');

        var i;

        // puts back rest of cards except last (they are stacked)
        for (i = 1; i < this.getHand().length - 1; i++) {
            oCard = this.getHand() ? this.getHand()[i] : null;
            sCardId = oCard.value + '-' + oCard.suit;

            if (oCard) {
                oCardView = findCardViewForId(sCardId);

                Tools.removeClass(oCardView, 'showFace');
                Tools.removeClass(oCardView, 'fannedCard');
                Tools.addClass(oCardView, 'showBack');
            }
        }
        this.fannedCards = false;
    };

    /**
    * fans out some cards
    */
    Player.prototype.fanCards = function (oEvent) {

        if (!oEvent) {
            return;
        }

        var i;

        if (this.fannedCards === true) {
            this.unfanCards();
            return;
        }

        var oCardView = oEvent.currentTarget;

        if (!oCardView) {
            return;
        }

        this.fannedCards = true;

        var nCardIndex = this.getIndexOfCardViewInHand(oCardView);

        var oCard,
            aCardIndexes = this.getNeighborCards(nCardIndex, this.getHand()),
            j = 0,
            sCardId;

        for (i = 0; i < aCardIndexes.length; i++) {
            j = aCardIndexes[i];
            oCard = this.getHand() ? this.getHand()[j] : null;
            sCardId = oCard.value + '-' + oCard.suit;

            if (oCard) {
                var oCardView = findCardViewForId(sCardId);

                Tools.toggleClass(oCardView, 'fannedCard');
                Tools.toggleClass(oCardView, 'showFace');
                Tools.toggleClass(oCardView, 'showBack');
            }
        }
    };

    /**
    * gets neighbor cards of a given card
    *
    * @return an array of the neighbor cards, centered on the given card
    */
    Player.prototype.getNeighborCards = function (nCardIndex, aCards) {
        var nNeighborhoodSize = 5;
        var aNeighborCardIndexes = [];
        var nAddCardIndex = -1;
        var i;

        if (nCardIndex < 0 || !aCards || aCards.length < 1) {
            return aNeighborCardIndexes;
        }

        var nHalfNeighborhoodSize = Math.floor(nNeighborhoodSize / 2);

        if (nCardIndex === 0) {
            i = 0;
            while (i < aCards.length) {
                aNeighborCardIndexes.push(i);
                i++;
                if (i > nHalfNeighborhoodSize) {
                    break;
                }
            }
            return aNeighborCardIndexes;
        }

        if (nCardIndex === aCards.length) {
            i = aCards.length;
            while (i > 0) {
                aNeighborCardIndexes.push(i);
                i--;
                if (aCards.length - i > (nHalfNeighborhoodSize)) {
                    break;
                }
            }
            return aNeighborCardIndexes;
        }

        var nBegin = nCardIndex - nHalfNeighborhoodSize;
        var nEnd = nCardIndex + nHalfNeighborhoodSize;

        for (i = nBegin; i < nEnd ; i++) {
            if (i > 0 && i < aCards.length) {
                aNeighborCardIndexes.push(i);
            }
        }
        return aNeighborCardIndexes;
    };

    return Player;
});
