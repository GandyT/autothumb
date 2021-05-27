const Fs = require("fs");

const getCharacters = async () => {
    return new Promise((res, rej) => {
        const characters = [];
        Fs.readdir("./io/input", (err, files) => {
            if (err) throw new Error(err);
            if (!files.length) rej("PLEASE INPUT IMAGES");

            files.forEach(file => {
                if (
                    file.startsWith("character") &&
                    (
                        file.endsWith("png") ||
                        file.endsWith("jpg")
                    )
                ) {
                    characters.push(file);
                }
            });

            res(characters);
        });
    })
}

module.exports = {
    getCharacters: getCharacters
}