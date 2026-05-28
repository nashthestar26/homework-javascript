import createElement from '../helpers/domHelper';

export function createFighterPreview(fighter, position, onReselect) {
    const positionClassName = position === 'right' ? 'fighter-preview___right' : 'fighter-preview___left';
    const fighterElement = createElement({
        tagName: 'div',
        className: `fighter-preview___root ${positionClassName}`
    });

    if (fighter) {
        const imgElement = createFighterImage(fighter);
        const infoContainer = createElement({
            tagName: 'div',
            className: 'fighter-preview___info'
        });

        const nameElement = createElement({ tagName: 'p', className: 'fighter-preview___name' });
        nameElement.innerText = fighter.name || '';

        const statsContainer = createElement({ tagName: 'div', className: 'fighter-preview___stats' });

        if (fighter.health !== undefined) {
            const healthElement = createElement({ tagName: 'p', className: 'fighter-preview___stat' });
            healthElement.innerText = `Health: ${fighter.health}`;
            statsContainer.append(healthElement);
        }
        if (fighter.attack !== undefined) {
            const attackElement = createElement({ tagName: 'p', className: 'fighter-preview___stat' });
            attackElement.innerText = `Attack: ${fighter.attack}`;
            statsContainer.append(attackElement);
        }
        if (fighter.defense !== undefined) {
            const defenseElement = createElement({ tagName: 'p', className: 'fighter-preview___stat' });
            defenseElement.innerText = `Defense: ${fighter.defense}`;
            statsContainer.append(defenseElement);
        }

        infoContainer.append(nameElement, statsContainer);
        fighterElement.append(imgElement, infoContainer);

        if (onReselect) {
            const reselectButton = createElement({
                tagName: 'button',
                className: 'fighter-preview___reselect-btn'
            });
            reselectButton.innerText = 'Reselect';
            reselectButton.addEventListener('click', onReselect);
            fighterElement.append(reselectButton);
        }
    }

    return fighterElement;
}

export function createFighterImage(fighter) {
    const { source, name } = fighter;
    const attributes = {
        src: source,
        title: name,
        alt: name
    };
    const imgElement = createElement({
        tagName: 'img',
        className: 'fighter-preview___img',
        attributes
    });

    return imgElement;
}
