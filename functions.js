const { LEVELS } = require('./config.json');
module.exports = { formatTimeDifference, getLevel, getLevelUpCoins};

function formatTimeDifference(unixTimestampInSeconds) {
    const currentTime = new Date();
    const eventTime = new Date(unixTimestampInSeconds * 1000); // Convert seconds to milliseconds
    const timeDifference = currentTime.getTime() - eventTime.getTime();

    const secondsDifference = Math.floor(timeDifference / 1000);

    if (secondsDifference < 60) {
        return secondsDifference === 1 ? '1 second ago' : `${secondsDifference} seconds ago`;
    }

    const minutesDifference = Math.floor(secondsDifference / 60);

    if (minutesDifference < 60) {
        return minutesDifference === 1 ? '1 minute ago' : `${minutesDifference} minutes ago`;
    }

    const hoursDifference = Math.floor(minutesDifference / 60);

    if (hoursDifference < 24) {
        return hoursDifference === 1 ? '1 hour ago' : `${hoursDifference} hours ago`;
    }

    const daysDifference = Math.floor(hoursDifference / 24);

    return daysDifference === 1 ? '1 day ago' : `${daysDifference} days ago`;
}


function getLevel(xp) {
    let level = 1;
    for (const key in LEVELS) {
        if (xp >= LEVELS[key].REQUIRED_XP) {
            level = parseInt(key);
        } else {
            break;
        }
    }
    return level;
}

function getLevelUpCoins(levelNumber) {
    const levelData = LEVELS[levelNumber];
    if (levelData) {
        return levelData.LEVEL_UP;
    } else {
        return 1000; // Return null if level data is not found
    }
}