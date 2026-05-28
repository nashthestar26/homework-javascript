import createElement from '../../helpers/domHelper';
import showModal from './modal';

export default function showWinnerModal(fighter) {
    const body = createElement({ tagName: 'div', className: 'winner-modal___root' });

    if (!fighter) {
        const message = createElement({ tagName: 'p', className: 'winner-modal___message' });
        message.innerText = 'The fight ended in a draw.';
        body.append(message);
        showModal({ title: 'Draw', bodyElement: body });
        return;
    }

    const image = createElement({
        tagName: 'img',
        className: 'winner-modal___img',
        attributes: { src: fighter.source, alt: fighter.name, title: fighter.name }
    });

    const name = createElement({ tagName: 'h2', className: 'winner-modal___name' });
    name.innerText = fighter.name;

    const details = createElement({ tagName: 'p', className: 'winner-modal___details' });
    const healthText = fighter.health !== undefined ? `Health: ${fighter.health}` : '';
    const attackText = fighter.attack !== undefined ? `Attack: ${fighter.attack}` : '';
    const defenseText = fighter.defense !== undefined ? `Defense: ${fighter.defense}` : '';
    details.innerText = [healthText, attackText, defenseText].filter(Boolean).join(' • ');

    body.append(image, name, details);

    showModal({ title: 'Winner', bodyElement: body });
}
