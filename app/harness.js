const CSS_CLASS_SHOW_FACE='showFace';
const CSS_CLASS_SHOW_BACK='showBack';

const oCard = document.getElementById('card-kierki-ad');

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

function handleCardTapped (oEvent) {
    const oTarget = oEvent.currentTarget;
    const sCardId = oTarget.id;
    flipCard (sCardId);
}

const sCardClass = 'card';
const aCards = document.getElementsByClassName(sCardClass);
for (const oCard of aCards) {
    oCard.onclick = handleCardTapped;
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