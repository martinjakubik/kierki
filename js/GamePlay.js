/*global define */
define('GamePlay', ['Stack', 'Tools', 'GameSession'], function (Stack, Tools, GameSession) {

    'use strict';

    var WAITING_TO_GATHER_CARDS = 0;
    var WAITING_TO_FILL_TABLE = 1;
    var GAME_OVER = 3;
    var iRound = 0;

    /**
     * constructs a GamePlay object
     *
     * @param nNumHomebases the number of homebases connected to the game
     * @param aCards a deck of cards
     * @param aSounds an array of sounds used during a war
     * @param aHomebaseNames possible names to choose from upon startup
     * @param nMaxNumberOfSlots maximum number of game slots to use on the
     *          remote database
     * @param nCardWidth the width of the cards
     * @param oCallbacks functions used for customized actions {
     *              renderResult: function used to render the winning message
     *              getRandomName: function used to get a random
     *                  player name from a given list
     *          }
     */
    var GamePlay = function (nNumHomebases, aCards, aHomebaseNames, nMaxNumberOfSlots, nCardWidth, oCallbacks) {

        this.numPlayers = nNumHomebases;
        this.cards = aCards;
        this.homebaseNames = aHomebaseNames;
        this.maxNumberOfSlots = nMaxNumberOfSlots;
        this.cardWidth = nCardWidth;
        this.callbacks = oCallbacks;

        this.stackController = null;
        this.homebaseControllers = [];

        this.allPlayersJoined = false;

        this.state = WAITING_TO_FILL_TABLE;

        this.numMoves = 0;
        this.soundOn = true;

    };

    /**
    * hides the Don't Wait button
    */
    GamePlay.hideDontWaitButton = function () {
        var oDontWaitBtn = document.getElementById('dontWait');
        if (oDontWaitBtn) {
            oDontWaitBtn.style.display = 'none';
        }
    };

    /**
    * renders all the cards
    */
    GamePlay.prototype.renderCards = function () {

        this.stackController.renderTable();
        this.stackController.renderHand();

    };

    /**
     * finds a homebase given the Id of a homebase view
     */
    GamePlay.prototype.findHomebaseForHomebaseViewId = function (sHomebaseViewId) {
        var oHomebase = null;

        var i;

        for (i = 0; i < this.homebaseControllers.length ; i++) {
            if ('homebase' + this.homebaseControllers[i].getHomebaseNum() === sHomebaseViewId) {
                oHomebase = this.homebaseControllers[i];
                break;
            }
        }

        return oHomebase;
    };

    /**
     * moves to next round
     */
    GamePlay.prototype.moveToNextRound = function () {
        if (iRound < 3) {
            iRound = iRound + 1;
        } else {
            iRound = 0;
            this.state = GAME_OVER;
        }
    };

    /**
     * checks if one game is over
     */
    GamePlay.prototype.isGameFinished = function () {

        // checks if the stack's hand is empty
        if (this.stackController.hand.length === 0) {

            this.callbacks.renderResult(this.result);
            this.state = this.moveToNextRound();
            return true;
        }

        return false;
    };

    /**
     * Checks table to see if it's a war, or if it's time to gather cards.
     */
    GamePlay.prototype.updateGameStateBasedOnTable = function () {

        if (this.stackController.getTableCard()) {

                // assumes both homebases have face down cards (in war)
                this.state = WAITING_TO_FILL_TABLE;

                // checks if the game is over
                this.isGameFinished();

        } else {

            // assumes the homebases have no cards on the table
            this.state = WAITING_TO_FILL_TABLE;

        }
    };

    /**
     * updates the game when homebase wants to play a card, based on current state
     *
     * @param oStack a stack controller on whom the event happened
     * @param bIsLocalEvent true if the event happened in the local UI
     */
    GamePlay.prototype.homebaseWantsToPlayACard = function (oStack, bIsLocalEvent) {
        switch (this.state) {
            case WAITING_TO_FILL_TABLE:
                // checks if the homebase already has a face-up card on the table
                if (bIsLocalEvent) {
                    oStack.putCardOnTable();
                }
                break;
            case WAITING_TO_GATHER_CARDS:
                if (bIsLocalEvent) {
                    this.gatherCards();
                    this.numMoves++;
                }
                break;
            default:
                break;
        }

        this.updateGameStateBasedOnTable();

    };

    /**
     * Moves cards to the table or moves the table cards to the hand of the
     * homebase.
     * Or waits for more cards on the table in case of a tie.
     */
    GamePlay.prototype.gatherCards = function () {

        // decides what to do if card was played
        if (this.state === WAITING_TO_GATHER_CARDS) {

            // moves table cards to the hand
            this.stackController.moveTableToHand();

            this.state = WAITING_TO_FILL_TABLE;

            this.renderCards();

        }
    };

    /**
     * reacts to a local homebase tapping a card in their hand
     *
     * @param oEvent a browser event
     */
    GamePlay.prototype.localHomebaseTappedCardInHand = function (oEvent) {

        // gets the homebase and the homebase view
        var oTarget = oEvent.currentTarget;

        var oStackView = (oTarget && oTarget.parentNode) ? oTarget.parentNode.parentNode : null;
        var sStackViewId = null;
        var oStack = null;

        if (oStackView) {
            sStackViewId = oStackView.getAttribute('id');
            if (sStackViewId) {
                oStack = this.findHomebaseForHomebaseViewId(sStackViewId);
                oStack = this.stackController;
            }
        }

        var bIsLocalEvent = true;

        this.homebaseTappedCardInHand(oStack, bIsLocalEvent);
    };

    /**
     * reacts to a local or remote homebase tapping a card in their hand
     *
     * @param oStack a stack on whom the event happened
     * @param bIsLocalEvent true if the event happened in the local UI
     */
    GamePlay.prototype.homebaseTappedCardInHand = function (oStack, bIsLocalEvent) {

        var i;

        // checks if the tap is a legitimate move in the game
        if (oStack && bIsLocalEvent && this.allPlayersJoined && this.state !== GAME_OVER) {
            this.homebaseWantsToPlayACard.call(this, oStack, bIsLocalEvent);
        } else {
            // does nothing
            oStack.wiggleCardInHand();
        }
    };

    /**
     * distributes the current cards to the homebase controllers that are
     * available
     */
    GamePlay.prototype.distributeCardsToAvailablePlayers = function () {

        // distributes cards to the stack controller
        if (this.stackController) {
            this.stackController.setHand(this.shuffledCards);
        }
        this.result = '';
    };

    /**
     * gets the game slot list from a game slots snapshot
     *
     * @param oGameSlots a snapshot of game slots
     *
     * @return a game slots list
     */
    GamePlay.getGameSlotsListFromSnapshot = function (oGameSlots) {

        if (!oGameSlots) {
            oGameSlots = {
                lastSlot: 0,
                list: {}
            };
        }

        // gets list of game slots
        return oGameSlots ? oGameSlots.list : null ;

    };

    /**
     * gets the number of the last-used game slot from a game slots object
     *
     * @param oGameSlots a snapshot of game slots
     *
     * @return the number of the last-used game slot
     */
    GamePlay.getLastGameSlotKey = function (oGameSlots) {

        // gets index of last game slot
        var aGameSlots = GamePlay.getGameSlotsListFromSnapshot(oGameSlots);
        var sLastGameSlotKey = Tools.getKeyOfLastItemInObject(aGameSlots);

        return sLastGameSlotKey;
    };

    /**
     * gets the last-used game slot from a game slots object
     *
     * @param oGameSlots a snapshot of game slots
     *
     * @return the snapshot of the last-used game slot
     */
    GamePlay.getLastGameSlot = function (oGameSlots) {

        var aGameSlots = GamePlay.getGameSlotsListFromSnapshot(oGameSlots);

        // gets the current game slot
        var oLastGameSlot = null;
        if (aGameSlots) {
            oLastGameSlot = Tools.getLastItemInObject(aGameSlots);
        }

        if (!oLastGameSlot) {
            oLastGameSlot = {};
        }

        return oLastGameSlot;
    };

    /**
     * moves to the next game slot and updates homebase references to the ones
     * that are in that slot;
     * finds the next available game slot, but starts over at 0
     * if the max number is reached
     *
     * @param oReferenceGameSlotList reference to the game slot list on the
     *                                  remote database
     */
    GamePlay.prototype.moveToNextGameSlot = function(oReferenceGameSlotList) {

        // moves to next slot
        var oReferenceGameSlot = oReferenceGameSlotList.push({
            homebase0: '_new_',
            stack: {
                table: {},
                hand: {}
            }
        });
        this.slotKey = oReferenceGameSlot.key;

        // updates remote references after the slot number changed
        this.homebaseReference[0] = oReferenceGameSlot.child('homebase0');
        this.homebaseReference[1] = oReferenceGameSlot.child('homebase1');
        this.stackReference = oReferenceGameSlot.child('stack');
    };

    /**
     * checks remote database and stores homebases in a game slot, then sets up
     * the remote homebases;
     *
     * @param oGamePlay an instance of a game
     *
     * @return false if could not set up the game slot; true otherwise
     */
    GamePlay.prototype.setUpRemoteGameSlot = function (oGamePlay) {

        var oDatabase = firebase.database();
        var oReferenceGameAllSlots = oDatabase.ref('game/slots');
        var oReferenceGameSlotList = oDatabase.ref('game/slots/list');

        if (!oReferenceGameSlotList) {
            oDatabase.set({
                game: {
                    slots: {
                        lastSlot: null,
                        list: []
                    }
                }
            })
        }

        oReferenceGameAllSlots.once('value', function (snapshot) {

            // gets game slot object from remote database
            var oGameSlots = snapshot.val();

            // gets the last-used game slot
            var oSlotKey = GamePlay.getLastGameSlotKey(oGameSlots);
            if (!oSlotKey) {
                oGamePlay.moveToNextGameSlot(oGameSlots);
            }
            oGamePlay.slotKey = oSlotKey;
            oGamePlay.gameSlot = GamePlay.getLastGameSlot(oGameSlots);

            // stores remote references to homebases and to the rest of the cards
            oGamePlay.homebaseReference = [];
            oGamePlay.homebaseReference.push(oDatabase.ref('game/slots/list/' + oGamePlay.slotKey + '/homebase0'));
            oGamePlay.homebaseReference.push(oDatabase.ref('game/slots/list/' + oGamePlay.slotKey + '/homebase1'));
            oGamePlay.stackReference = oDatabase.ref('game/slots/list/' + oGamePlay.slotKey + '/stack');

            // checks if homebase 0 or homebase 1 have joined
            var bIsHomebase0SlotFull = oGamePlay.gameSlot.homebase0 ? true : false;
            var bIsHomebase1SlotFull = oGamePlay.gameSlot.homebase1 ? true : false;

            if (!bIsHomebase0SlotFull && !bIsHomebase1SlotFull) {

                // found a new slot; keeps local homebase 0 waits for homebase 1
                oGamePlay.makeHomebase0();

            } else if (bIsHomebase0SlotFull && bIsHomebase1SlotFull) {

                // takes next slot, even if it is full; makes homebase 0 controller
                oGamePlay.moveToNextGameSlot(oReferenceGameSlotList);

                // keeps local homebase 0 waits for homebase 1
                oGamePlay.makeHomebase0();

            } else if (bIsHomebase0SlotFull && !bIsHomebase1SlotFull) {

                // joins another homebase in the slot - there is only one homebase in it

                // adds the two homebase controllers
                var oHomebase1Value = null;
                oGamePlay.makeHomebase1(oHomebase1Value, oGamePlay.stackReference);

            } else if (!bIsHomebase0SlotFull && bIsHomebase1SlotFull) {

                // TODO: implement the case when homebase 1 has somehow joined
                // before homebase 0

            }

            // updates the last slot number on the remote database
            var oReferenceGameAllSlots = oDatabase.ref('game/slots');

            oReferenceGameAllSlots.child('lastSlot').set({
                value: oGamePlay.slotKey
            });

            oGamePlay.setUpHandlerForRemoteStackEvents(oGamePlay, oDatabase);

        }.bind(this));
    };

    /**
     * sets up a callback to wait for homebase 1
     */
    GamePlay.prototype.makeHomebase0 = function () {

        var oGamePlay = this;

        var oDatabase = firebase.database();
        var oReferenceGameSlotList = oDatabase.ref('game/slots/list');
        var oReferenceGameSlot = oReferenceGameSlotList.child(oGamePlay.slotKey);

        // makes a session Id for homebase 0
        var sHomebase0SessionId = GameSession.makeNewBrowserSessionId();

        var bIsLocal = true;

        // makes homebase 0 controller
        oGamePlay.makeHomebaseController(0, oGamePlay.homebaseControllers, oGamePlay.homebaseReference[0], sHomebase0SessionId, bIsLocal);

        oGamePlay.makeStackController(oGamePlay.stackReference, oGamePlay.localHomebaseTappedCardInHand.bind(oGamePlay));

        oGamePlay.homebaseControllers[0].setName(this.callbacks.getRandomName(0, oGamePlay.homebaseNames));

        // distributes cards to homebase 0
        oGamePlay.distributeCardsToAvailablePlayers();

        // gets the current time
        var iTimestamp = new Date().getTime();

        // stores remote homebase 0, clears homebase 1 and waits for new homebase 1
        oGamePlay.gameSlot = {
            timestamp: iTimestamp,
            homebase0: {
                name: oGamePlay.homebaseControllers[0].getName(),
                sessionId: sHomebase0SessionId
            },
            homebase1: null,
            stack: {
                hand: oGamePlay.stackController.getHand()
            }
        };

        oReferenceGameSlot.set(oGamePlay.gameSlot);

        // renders homebase 0
        var oPlayAreaView = document.getElementById('playArea');
        oGamePlay.stackController.makeStackView(oPlayAreaView);
        oGamePlay.renderCards();

        // adds waiting message
        oGamePlay.result = 'waiting for homebase 2';
        oGamePlay.callbacks.renderResult(this.result);

        // stores a reference to the remote homebase 1
        oGamePlay.homebaseReference[1] = oReferenceGameSlot.child('/homebase1');
        oGamePlay.stackReference = oReferenceGameSlot.child('/stack');

        // listens for arrival of homebase 1
        oGamePlay.homebaseReference[1].on('value', function (snapshot) {

            var oGamePlay = this;
            var oHomebase1Value = snapshot.val();

            // checks if a remote homebase 1 just joined and if there is no
            // homebase 1 yet
            if (oHomebase1Value && !oGamePlay.homebaseControllers[1]) {
                oGamePlay.makeHomebase1(oHomebase1Value, oGamePlay.stackReference);
            }
        }.bind(oGamePlay));

        // if don't wait button is pressed, removes listener for second homebase
        var dontWaitPressed = function () {

            var oGamePlay = this;

            // removes the listeners that detect changes to remote homebases
            oGamePlay.homebaseReference[0].off();
            oGamePlay.homebaseReference[1].off();

            var oHomebase1Value = null;
            oGamePlay.makeHomebase1(oHomebase1Value, oGamePlay.stackReference);
        };

        // makes don't wait button
        var oBodyView = document.body;
        Tools.makeButton({
            id: 'dontWait',
            label: 'Don\'t wait',
            parentView: oBodyView,
            handler: dontWaitPressed.bind(this)
        });

    };

    /**
    * adds homebase 1 to the game
    *
    * @param oHomebase1Value {optional} a homebase object
    * @param oReferenceToStack {optional} reference to rest of cards on remote database
    */
    GamePlay.prototype.makeHomebase1 = function (oHomebase1Value, oStackReference) {

        var oGamePlay = this;

        var oHomebase0Value = oGamePlay.gameSlot.homebase0;

        // checks if the homebase0 already has a different session ID (this is
        // the case if the homebase is from a different browser)
        var bIsHomebase0Local = GameSession.isLocal(oHomebase0Value);

        // makes controller for homebase 0
        if (!oGamePlay.homebaseControllers[0]) {
            oGamePlay.makeHomebaseController(0, oGamePlay.homebaseControllers, oGamePlay.homebaseReference[0], oHomebase0Value.sessionId, bIsHomebase0Local);
        }

        if (!oGamePlay.stackController) {
            oGamePlay.makeStackController(oStackReference, oGamePlay.localHomebaseTappedCardInHand.bind(oGamePlay));
        }

        // keeps hand from remote homebase object
        if (oGamePlay.gameSlot) {
            oGamePlay.stackController.setHand(oGamePlay.gameSlot.stack.hand);
        }

        var sHomebase0SessionId;

        if (bIsHomebase0Local) {

            // sets the session Id from the browser
            sHomebase0SessionId = GameSession.getBrowserSessionId();
            oGamePlay.homebaseControllers[0].setSessionId(sHomebase0SessionId);

        } else {

            // keeps the session Id from the remote homebase object
            if (oGamePlay.gameSlot) {
                sHomebase0SessionId = oGamePlay.gameSlot.homebase0.sessionId;
                oGamePlay.homebaseControllers[0].setSessionId(sHomebase0SessionId);
            }

        }

        // gets the rest of the cards to give to homebase 1
        // (there may be no cards locally if the browser was refreshed)
        if (!oGamePlay.stackController) {
            oGamePlay.stackController = oGamePlay.gameSlot ? oGamePlay.gameSlot.stack : null;
        }

        // if for some reason the rest of cards was not stored remotely either,
        // re-distributes the cards
        if (!oGamePlay.stack) {
            oGamePlay.distributeCardsToAvailablePlayers();
        }

        var sHomebase1SessionId = oHomebase1Value ? oHomebase1Value.sessionId : null;
        var bIsHomebase1Local = (sHomebase1SessionId === null);

        // makes homebase 1 controller
        oGamePlay.makeHomebaseController(1, oGamePlay.homebaseControllers, oGamePlay.homebaseReference[1], sHomebase1SessionId, bIsHomebase1Local);

        // chooses homebase 1's name
        var sNotThisName = oGamePlay.homebaseControllers[0] ? oGamePlay.homebaseControllers[0].getName() : '';
        oGamePlay.homebaseControllers[1].setName(oGamePlay.callbacks.getRandomName(1, oGamePlay.homebaseNames, sNotThisName));

        // lets homebase 0 play
        oGamePlay.stackController.setOnTapCardInHand(oGamePlay.localHomebaseTappedCardInHand.bind(oGamePlay));
        oGamePlay.stackController.renderTable();
        oGamePlay.stackController.renderHand();

        // stores homebase 1
        oGamePlay.homebaseControllers[1].updateRemoteReference();

        // hides don't wait button
        GamePlay.hideDontWaitButton();

        // clears waiting message
        oGamePlay.result = '';
        oGamePlay.callbacks.renderResult(oGamePlay.result);

        oGamePlay.allPlayersJoined = true;
    };

    /**
    * sets up the handlers for events from the remote stack;
    * gets hand and table from remote database and updates stack controller
    *
    * @param oGamePlay an instance of a game
    * @param oDatabase reference to the remote database
    */
    GamePlay.prototype.setUpHandlerForRemoteStackEvents = function (oGamePlay, oDatabase) {

        oGamePlay.stackReference = oDatabase.ref('/game/slots/list/' + oGamePlay.slotKey + '/stack');
        oGamePlay.stackReference.on('value', oGamePlay.handlerForRemoteStackEvents.bind(this));

    };

    /**
    * handler when a remote stack changes;
    * gets hand and table from remote database and updates stack controller
    *
    * @param oSnapshot an instance of a game
    */
    GamePlay.prototype.handlerForRemoteStackEvents = function (oSnapshot) {

        // gets the GamePlay object from the bound 'this'
        var oGamePlay = this;

        var oStackValue = oSnapshot.val();
        var bIsLocalEvent = false;

        if (oStackValue) {
            var oStackHandValue = oStackValue.hand || [];
            var oStackTableValue = oStackValue.table || [];

            // recreates a remote stack controller to pass to the
            // homebaseWantsToPlayACard method
            var oRemoteStack = new Stack(null, this.cardWidth);

            // sets hand
            if (oStackHandValue && oGamePlay.stackController) {
                oGamePlay.stackController.setHand(
                    oStackHandValue
                );
                oGamePlay.stackController.renderHand();
            }

            // sets table
            if (oStackTableValue && oGamePlay.stackController) {
                oGamePlay.stackController.setTable(
                    oStackTableValue
                );
                oGamePlay.stackController.renderTable();
            }

            oGamePlay.homebaseWantsToPlayACard.call(oGamePlay, oRemoteStack, bIsLocalEvent);
        }
    };

    /**
     * starts a game
     */
    GamePlay.prototype.start = function (bShuffleCards) {

        if (bShuffleCards === true) {
            this.shuffledCards = Tools.shuffle(this.cards);
        } else {
            this.shuffledCards = this.cards;
        }

        this.setUpRemoteGameSlot(this);

        this.numMoves = 0;
    };

    return GamePlay;
});
