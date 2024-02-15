
module.exports = { formatTimeDifference };
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
