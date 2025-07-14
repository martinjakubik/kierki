const CSS_CLASS_SHOW_FACE='showFace';
const CSS_CLASS_SHOW_BACK='showBack';
const DOM_ID_ZOOM_DISPLAY='zoomDisplay';
const CSS_CLASS_ZOOM_DISPLAY_ON='on';

const oCard = document.getElementById('card-kierki-ad');

let sTouchStartCard = null;
let nTouchStartX = -1;
let nTouchStartY = -1;

function flipCard (sCardId) {
    const oCard = document.getElementById(sCardId);
    if (oCard.classList.contains(CSS_CLASS_SHOW_FACE)) {
        oCard.classList.remove(CSS_CLASS_SHOW_FACE);
        oCard.classList.add(CSS_CLASS_SHOW_BACK);
    } else {
        oCard.classList.remove(CSS_CLASS_SHOW_BACK);
        oCard.classList.add(CSS_CLASS_SHOW_FACE)
    }
}

function zoomInCard(sCardId) {
    const oCard = document.getElementById(sCardId);
    const oZoomDisplay = document.getElementById(DOM_ID_ZOOM_DISPLAY);
    oZoomDisplay.classList.add(CSS_CLASS_ZOOM_DISPLAY_ON);
    oZoomDisplay.appendChild(oCard);
}

function zoomOutCard(sCardId) {
    const oCard = document.getElementById(sCardId);
    const oZoomDisplay = document.getElementById(DOM_ID_ZOOM_DISPLAY);
    oZoomDisplay.classList.remove(CSS_CLASS_ZOOM_DISPLAY_ON);
    document.body.appendChild(oCard);
}

function handleCardTapped (oEvent) {
    const oTarget = oEvent.currentTarget;
    const sCardId = oTarget.id;
    flipCard (sCardId);
}

function handleCardTouchStart (oEvent) {
    const oTarget = oEvent.currentTarget;
    const sCardId = oTarget.id;
    nTouchStartX = oEvent.screenX;
    nTouchStartY = oEvent.screenY;
    sTouchStartCard = sCardId;
}

function handleCardTouchEnd (oEvent) {
    if (nTouchStartY < 0) {
        return;
    }
    const oTarget = oEvent.currentTarget;
    const sCardId = oTarget.id;
    if (sTouchStartCard === sCardId) {
        const nTouchEndY = oEvent.screenY;
        if (nTouchEndY < nTouchStartY) {
            zoomInCard(sCardId);
        } else if (nTouchEndY > nTouchStartY) {
            zoomOutCard(sCardId);
        }
    };
    nTouchEndX = -1;
    nTouchEndY = -1;
}

const sCardClass = 'card';
const aCards = document.getElementsByClassName(sCardClass);
for (const oCard of aCards) {
    oCard.onclick = handleCardTapped;
    oCard.onmousedown = handleCardTouchStart;
    oCard.onmouseup = handleCardTouchEnd;
};

for (const oCard of aCards) {
    const nRandom = Math.random();
    if (nRandom > .1) {
        flipCard(oCard.id);
    }
};

if (aCards[10].classList.contains(CSS_CLASS_SHOW_BACK)) {
    aCards[10].classList.remove(CSS_CLASS_SHOW_BACK);
    aCards[10].classList.add(CSS_CLASS_SHOW_FACE);
}