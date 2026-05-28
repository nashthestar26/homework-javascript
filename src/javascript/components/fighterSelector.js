import createElement from '../helpers/domHelper';
import renderArena from './arena';
import versusImg from '../../../resources/versus.png';
import { createFighterPreview } from './fighterPreview';
import fighterService from '../services/fightersService';

const fighterDetailsMap = new Map();

export async function getFighterInfo(fighterId) {
    if (!fighterId) return null;

    const cachedDetails = fighterDetailsMap.get(fighterId);
    if (cachedDetails) return cachedDetails;

    try {
        const fetchedDetails = await fighterService.getFighterDetails(fighterId);
        fighterDetailsMap.set(fighterId, fetchedDetails);
        return fetchedDetails;
    } catch (error) {
        console.error('Failed to load fighter details:', error);
        return null;
    }
}

function startFight(selectedFighters) {
    renderArena(selectedFighters);
}

function createVersusBlock(selectedFighters) {
    const canStartFight = selectedFighters.filter(Boolean).length === 2;
    const onClick = () => startFight(selectedFighters);
    const container = createElement({ tagName: 'div', className: 'preview-container___versus-block' });
    const image = createElement({
        tagName: 'img',
        className: 'preview-container___versus-img',
        attributes: { src: versusImg }
    });
    const disabledBtn = canStartFight ? '' : 'disabled';
    const fightBtn = createElement({
        tagName: 'button',
        className: `preview-container___fight-btn ${disabledBtn}`
    });

    fightBtn.addEventListener('click', onClick, false);
    fightBtn.innerText = 'Fight';
    container.append(image, fightBtn);

    return container;
}

function renderSelectedFighters(selectedFighters, onReselectFirst, onReselectSecond) {
    const fightersPreview = document.querySelector('.preview-container___root');
    const [playerOne, playerTwo] = selectedFighters;
    const firstPreview = createFighterPreview(playerOne, 'left', onReselectFirst);
    const secondPreview = createFighterPreview(playerTwo, 'right', onReselectSecond);
    const versusBlock = createVersusBlock(selectedFighters);

    fightersPreview.innerHTML = '';
    fightersPreview.append(firstPreview, versusBlock, secondPreview);
}

function removeSelectedFighter(fighterToRemove, selectedFighters) {
    return selectedFighters.map(selected => (selected && selected._id === fighterToRemove._id ? null : selected));
}

export function createFightersSelector() {
    const selectedFighters = [];

    const deselectFighter = index => {
        selectedFighters[index] = null;
        renderWithCallbacks();
    };

    const renderWithCallbacks = () => {
        const onReselectFirst = () => deselectFighter(0);
        const onReselectSecond = () => deselectFighter(1);
        renderSelectedFighters(selectedFighters, onReselectFirst, onReselectSecond);
    };

    return async (event, fighterId) => {
        const fighter = await getFighterInfo(fighterId);
        if (!fighter) return;

        // Select fighter in first available slot
        const firstSlotEmpty = !selectedFighters[0];
        if (firstSlotEmpty) {
            selectedFighters[0] = fighter;
        } else {
            selectedFighters[1] = fighter;
        }

        renderWithCallbacks();
    };
}
