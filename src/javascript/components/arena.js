import createElement from '../helpers/domHelper';
import { createFighterImage } from './fighterPreview';
import { fight } from './fight';
import showWinnerModal from './modal/winner';

function createFighter(fighter, position) {
    const imgElement = createFighterImage(fighter);
    const positionClassName = position === 'right' ? 'arena___right-fighter' : 'arena___left-fighter';
    const fighterElement = createElement({
        tagName: 'div',
        className: `arena___fighter ${positionClassName}`
    });

    fighterElement.append(imgElement);
    return fighterElement;
}

function createFighters(firstFighter, secondFighter) {
    const battleField = createElement({ tagName: 'div', className: `arena___battlefield` });
    const firstFighterElement = createFighter(firstFighter, 'left');
    const secondFighterElement = createFighter(secondFighter, 'right');

    battleField.append(firstFighterElement, secondFighterElement);
    return battleField;
}

function createHealthIndicator(fighter, position) {
    const { name } = fighter;
    const container = createElement({ tagName: 'div', className: 'arena___fighter-indicator' });
    const fighterName = createElement({ tagName: 'span', className: 'arena___fighter-name' });
    const indicator = createElement({ tagName: 'div', className: 'arena___health-indicator' });
    const bar = createElement({
        tagName: 'div',
        className: 'arena___health-bar',
        attributes: { id: `${position}-fighter-indicator` }
    });

    fighterName.innerText = name;
    indicator.append(bar);
    container.append(fighterName, indicator);

    return container;
}

function createHealthIndicators(leftFighter, rightFighter) {
    const healthIndicators = createElement({ tagName: 'div', className: 'arena___fight-status' });
    const versusSign = createElement({ tagName: 'div', className: 'arena___versus-sign' });
    const leftFighterIndicator = createHealthIndicator(leftFighter, 'left');
    const rightFighterIndicator = createHealthIndicator(rightFighter, 'right');

    healthIndicators.append(leftFighterIndicator, versusSign, rightFighterIndicator);
    return healthIndicators;
}

function createArena(selectedFighters) {
    const arena = createElement({ tagName: 'div', className: 'arena___root' });
    const healthIndicators = createHealthIndicators(...selectedFighters);
    const fighters = createFighters(...selectedFighters);

    arena.append(healthIndicators, fighters);
    return arena;
}

function createFightEffect() {
    const fightOverlay = createElement({
        tagName: 'div',
        className: 'arena___fight-effect'
    });

    const fightText = createElement({
        tagName: 'div',
        className: 'arena___fight-text'
    });
    fightText.innerText = 'FIGHT!';

    fightOverlay.append(fightText);
    return fightOverlay;
}

function showFightEffect(root) {
    return new Promise(resolve => {
        const fightEffect = createFightEffect();
        root.append(fightEffect);

        setTimeout(() => {
            fightEffect.remove();
            resolve();
        }, 1500);
    });
}

function createKOEffect() {
    const koOverlay = createElement({
        tagName: 'div',
        className: 'arena___ko-effect'
    });

    const koText = createElement({
        tagName: 'div',
        className: 'arena___ko-text'
    });
    koText.innerText = 'K.O!';

    koOverlay.append(koText);
    return koOverlay;
}

function showKOEffect(root) {
    return new Promise(resolve => {
        const koEffect = createKOEffect();
        root.append(koEffect);

        setTimeout(() => {
            koEffect.remove();
            resolve();
        }, 2000);
    });
}

function returnToSelection() {
    const root = document.getElementById('root');
    root.innerHTML = '';
}

export default async function renderArena(selectedFighters) {
    const root = document.getElementById('root');
    const arena = createArena(selectedFighters);

    root.innerHTML = '';
    root.append(arena);

    const [firstFighter, secondFighter] = selectedFighters;
    if (!firstFighter || !secondFighter) return;

    const startBattle = async () => {
        try {
            // Show FIGHT effect before battle starts
            await showFightEffect(root);

            const winner = await fight(firstFighter, secondFighter);
            if (winner) {
                await showKOEffect(root);
            }

            const onRematch = () => {
                const modal = document.querySelector('.modal-layer');
                if (modal) modal.remove();
                startBattle();
            };

            const onFinish = () => {
                returnToSelection();
            };

            showWinnerModal(winner, onRematch, onFinish);
        } catch (error) {
            console.error('Battle failed:', error);
            showWinnerModal(null);
        }
    };

    startBattle();
}
