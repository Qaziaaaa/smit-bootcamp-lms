// Escapes special regex characters in a string so it can be used safely in MongoDB $regex.
// Without this, user input like "(test)" would be interpreted as a regex group and could crash.
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export default escapeRegex;
