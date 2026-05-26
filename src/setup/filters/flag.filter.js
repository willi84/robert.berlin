const flagFilter = (value, width = 40) => {
        if (!value) {
        return '';
    }

    const country = String(value)
        .trim()
        .toLowerCase();

    return `https://flagcdn.com/w${width}/${country}.png`;

}
exports.flagFilter = flagFilter;