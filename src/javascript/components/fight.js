import controls from '../../constants/controls';

// Small file-private helper that returns a random multiplier between 1 and 2
function getRandomMultiplier() {
    return 1 + Math.random(); // 1 <= multiplier < 2
}

const CRITICAL_STRIKE_COOLDOWN = 10000; // 10 seconds in milliseconds
const CRITICAL_STRIKE_MULTIPLIER = 2;

export async function fight(firstFighter, secondFighter) {
    return new Promise(resolve => {
        // Initialize fighter states with health and blocking status
        const fighters = {
            first: {
                fighter: firstFighter,
                health: firstFighter.health,
                isBlocking: false,
                lastCriticalTime: 0
            },
            second: {
                fighter: secondFighter,
                health: secondFighter.health,
                isBlocking: false,
                lastCriticalTime: 0
            }
        };

        const pressedKeys = new Set();

        const updateHealthDisplay = () => {
            const firstHealthPercent = (fighters.first.health / firstFighter.health) * 100;
            const secondHealthPercent = (fighters.second.health / secondFighter.health) * 100;

            const firstBar = document.getElementById('left-fighter-indicator');
            const secondBar = document.getElementById('right-fighter-indicator');

            if (firstBar) {
                firstBar.style.width = `${Math.max(0, firstHealthPercent)}%`;
            }
            if (secondBar) {
                secondBar.style.width = `${Math.max(0, secondHealthPercent)}%`;
            }
        };

        const checkCriticalStrike = (attacker, defender) => {
            const isCriticalCombo = checkCriticalCombo(
                attacker === fighters.first
                    ? controls.PlayerOneCriticalHitCombination
                    : controls.PlayerTwoCriticalHitCombination
            );

            if (!isCriticalCombo) return false;

            const now = Date.now();
            const timeSinceLastCritical = now - attacker.lastCriticalTime;
            const isCooldownReady = timeSinceLastCritical >= CRITICAL_STRIKE_COOLDOWN;

            if (!isCooldownReady) return false;

            attacker.lastCriticalTime = now;
            const criticalDamage = CRITICAL_STRIKE_MULTIPLIER * attacker.fighter.attack;
            defender.health -= criticalDamage;
            return true;
        };

        const checkCriticalCombo = criticalKeys => {
            return criticalKeys.every(key => pressedKeys.has(key));
        };

        const handleKeyDown = event => {
            pressedKeys.add(event.code);

            if (event.code === controls.PlayerOneAttack) {
                performAttack(fighters.first, fighters.second);
            } else if (event.code === controls.PlayerOneBlock) {
                fighters.first.isBlocking = true;
            } else if (event.code === controls.PlayerTwoAttack) {
                performAttack(fighters.second, fighters.first);
            } else if (event.code === controls.PlayerTwoBlock) {
                fighters.second.isBlocking = true;
            }

            // Check for critical strikes
            if (checkCriticalCombo(controls.PlayerOneCriticalHitCombination)) {
                checkCriticalStrike(fighters.first, fighters.second);
            } else if (checkCriticalCombo(controls.PlayerTwoCriticalHitCombination)) {
                checkCriticalStrike(fighters.second, fighters.first);
            }

            updateHealthDisplay();
            checkBattleEnd();
        };

        const handleKeyUp = event => {
            pressedKeys.delete(event.code);

            if (event.code === controls.PlayerOneBlock) {
                fighters.first.isBlocking = false;
            } else if (event.code === controls.PlayerTwoBlock) {
                fighters.second.isBlocking = false;
            }
        };

        const performAttack = (attacker, defender) => {
            // Attacker cannot strike while blocking
            if (attacker.isBlocking) {
                return;
            }

            // Defender blocks the strike and evades damage
            if (defender.isBlocking) {
                return;
            }

            const damage = getDamage(attacker.fighter, {
                ...defender.fighter,
                health: defender.health
            });
            defender.health -= damage;
        };

        const checkBattleEnd = () => {
            if (fighters.first.health <= 0) {
                endBattle(fighters.second.fighter);
            } else if (fighters.second.health <= 0) {
                endBattle(fighters.first.fighter);
            }
        };

        const endBattle = winner => {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('keyup', handleKeyUp);
            resolve(winner);
        };

        // Initialize health display
        updateHealthDisplay();

        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('keyup', handleKeyUp);
    });
}

export function getDamage(attacker, defender) {
    const attackPower = getHitPower(attacker);
    const blockPower = getBlockPower(defender);

    const rawDamage = attackPower - blockPower;
    return rawDamage > 0 ? rawDamage : 0;
}

export function getHitPower(fighter) {
    // attack * criticalHitChance (random between 1 and 2)
    const attackStat = fighter.attack || 0;
    const criticalHitChance = getRandomMultiplier();
    return attackStat * criticalHitChance;
}

export function getBlockPower(fighter) {
    // defense * dodgeChance (random between 1 and 2)
    const defenseStat = fighter.defense || 0;
    const dodgeChance = getRandomMultiplier();
    return defenseStat * dodgeChance;
}
