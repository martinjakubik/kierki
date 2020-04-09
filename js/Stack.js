/*global define */
define('Stack', ['Tools'], function (Tools) {
    'use strict';

    var cardFlipSound = new Audio('../resources/cardflip.wav');
    var cardShwipSound = new Audio('../js/lib/kierki/resources/cardshwip.wav');

    var Stack = function (oRemoteReference, nCardWidth) {

        this.remoteReference = oRemoteReference || null;
        this.cardWidth = nCardWidth;

        this.hand = [];
        this.table = [];

    };

    Stack.prototype.getHand = function () {
        return this.hand;
    };

    Stack.prototype.setHand = function (aCards) {
        this.hand = aCards;
    };

    Stack.prototype.getTable = function () {
        return this.table;
    };

    Stack.prototype.setTable = function (aCards) {
        this.table = aCards;
    };

    Stack.prototype.getNumberCards = function () {
        return this.hand.length;
    };

    Stack.prototype.makeStackView = function (oPlayAreaView) {

        var oStackView,
            oStackTableView,
            oStackHandView;

        oStackView = document.createElement('div');
        Tools.setClass(oStackView, 'stack');
        oStackView.setAttribute('id', 'stack');

        oPlayAreaView.insertBefore(oStackView, null);

        oStackTableView = document.createElement('div');
        Tools.setClass(oStackTableView, 'table');
        oStackTableView.setAttribute('id', 'table');

        oStackView.insertBefore(oStackTableView, null);

        oStackHandView = document.createElement('div');
        Tools.setClass(oStackHandView, 'hand');
        oStackHandView.setAttribute('id', 'hand');

        oStackView.insertBefore(oStackHandView, null);

    };

    /**
    * renders the cards in the table
    */
    Stack.prototype.renderTable = function () {

        var i, oPlayAreaView = document.getElementById('playArea'),
            oStackTableView = document.getElementById('table');

        if (!oStackTableView) {
            this.makeStackView(oPlayAreaView);
            oStackTableView = document.getElementById('table');
        }

        // clears view of all cards
        while (oStackTableView.firstChild) {
            oStackTableView.removeChild(oStackTableView.firstChild);
        }

        // redraws the whole table
        var bShowCardFace = false,
            bIsMoving = false;
        for (i = 0; i < this.table.length; i++) {
            bShowCardFace = true;
            bIsMoving = i === (this.table.length - 1);
            this.addCardToView(oStackTableView, this.table[i], 0, this.hand.length + this.table.length, bShowCardFace, bIsMoving);
        }
    };

    /**
     * renders the cards in the hand
     */
    Stack.prototype.renderHand = function () {

        var i, oPlayAreaView = document.getElementById('playArea'),
            oStackHandView = document.getElementById('hand'),
            bShowCardFace = false,
            bIsMoving = false;

        if (!oStackHandView) {
            this.makeStackView(oPlayAreaView);
            oStackHandView = document.getElementById('hand');
        }

        // clears view of all cards
        while (oStackHandView.firstChild) {
            oStackHandView.removeChild(oStackHandView.firstChild);
        }

        // redraws the whole hand
        for (i = 0; i < this.hand.length; i++) {
            this.addCardToView(oStackHandView, this.hand[i], i, this.hand.length, bShowCardFace, bIsMoving);
        }
    };

    /**
     * adds the given card to the given view
     */
    Stack.prototype.addCardToView = function (oView, oCard, nCardPosition, nNumCards, bShowCardFace, bIsMoving) {

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
            if (bShowCardFace) {
                Tools.addClass(oCardView, 'movingToTableFromLocalFlip');
            } else {
                Tools.addClass(oCardView, 'movingToTableFromLocal');
            }

            oCardView.addEventListener('animationend', this.finishedMovingToTableListener, false);
        }

        oCardView.onclick = this.onTapCardInHand;

        // sets the card's id as value
        oCardView.setAttribute('id', 'card' + oCard.value);

        // renders the card's word
        var oCardWord = document.createElement('div');
        oCardWord.innerText = oCard.value;
        oCardView.insertBefore(oCardWord, null);

        oView.insertBefore(oCardView, null);
    };

    Stack.prototype.finishedMovingToTableListener = function (oEvent) {

        switch (oEvent.type) {
          case 'animationend':
              var oElement = oEvent.target;

              // removes moving to table flag
              Tools.removeClass(oElement, 'movingToTableFromLocal');
              Tools.removeClass(oElement, 'movingToTableFromLocalFlip');
              break;
          default:

        }
    };

    Stack.prototype.putCardOnTable = function () {

        this.table.push(this.hand[0]);
        this.hand.splice(0, 1);

        this.renderHand();
        this.renderTable();

        this.updateRemoteReference();

        cardFlipSound.play();
    };

    Stack.prototype.moveTableToHand = function () {

        // copies table to hand
        Array.prototype.push.apply(this.hand, this.table);

        // clears table
        this.clearTable();

        cardShwipSound.play();

        // updates the remote reference for this stack
        // TODO: optimize performance here; if we have two or more players, all
        // of whose cards are "won" by the present player, then we will update
        // the remote reference every time we call this method; instead, we
        // should only call update once: for example, make moveTableToHand a
        // promise, and only when all promises complete call
        // updateRemoteReference
        this.updateRemoteReference();
    };

    Stack.prototype.clearTable = function () {
        this.table.splice(0);
    };

    Stack.prototype.getTableCard = function () {

        if (this.table.length > 0) {
            return this.table[this.table.length - 1];
        }
        return null;
    };

    Stack.prototype.updateRemoteReference = function () {

        this.remoteReference.set({
            hand: this.getHand(),
            table: this.getTable()
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
    Stack.prototype.wiggleCardInHand = function () {

        var oCard = this.getHand() ? this.getHand()[0] : null;
        if (oCard) {
            var sCardId = oCard.value;

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
    Stack.prototype.finishedWigglingListener = function (oEvent) {

        switch (oEvent.type) {
          case 'animationend':
              var oElement = oEvent.target;

              // removes wiggling flag
              Tools.removeClass(oElement, 'wiggling');
              break;
          default:

        }
    };

    /**
     * sets the function for tapping a a card that player wants to play
     */
    Stack.prototype.setOnTapCardInHand = function (fnOnTapPlayCard) {
        this.onTapPlayCard = fnOnTapPlayCard;
        this.onTapCardInHand = fnOnTapPlayCard;
    };

    /**
    * gets index of the given card view
    */
    Stack.prototype.getIndexOfCardViewInHand = function (oCardView) {
        var i,
            aCards = this.getHand(),
            sCardId = oCardView.id,
            sCardInCardsId;

        for (i = 0; i < aCards.length; i++) {
            sCardInCardsId = 'card' + aCards[i].value;
            if (sCardId === sCardInCardsId) {
                return i;
            }
        }
    };

    return Stack;
});
