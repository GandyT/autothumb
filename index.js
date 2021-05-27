const Jimp = require("jimp");
const Options = require("./resource/options.json");
const InputReader = require("./modules/InputReader.js");

(async () => {
    const characters = await InputReader.getCharacters();

    if (characters.length == 0) {
        console.log("PLEASE INPUT A CHARACTER");
        return;
    }

    const fileName = characters[Math.floor(Math.random() * characters.length)];
    var characterIMG = await Jimp.read(`./io/input/${fileName}`);

    let topLeft = [characterIMG.getWidth(), characterIMG.getHeight()];
    let bottomRight = [0, 0];

    // cut out character
    // find a more efficient way of scanning pixels

    var found = false;
    for (let wI = 1; wI <= characterIMG.getWidth(); wI += 3) {
        var columnContainsPixel = false;
        for (let hI = 1; hI <= characterIMG.getHeight(); ++hI) {
            if (characterIMG.getPixelColor(wI, hI)) {
                found = true;
                columnContainsPixel = true;
                console.log(`COLORPIXEL - X: ${wI}, Y: ${hI}`)
                if (wI < topLeft[0]) topLeft[0] = wI;
                if (wI > bottomRight[0]) bottomRight[0] = wI;
                if (hI < topLeft[1]) topLeft[1] = hI;
                if (hI > bottomRight[1]) bottomRight[1] = hI;
            }
        }

        if (found && !columnContainsPixel) break;
    }

    await characterIMG.crop(topLeft[0], topLeft[1], bottomRight[0] - topLeft[0], bottomRight[1] - topLeft[1]);

    while (
        characterIMG.getWidth() > Options.CHARACTER.MAX_WIDTH &&
        characterIMG.getHeight() > Options.CHARACTER.MAX_HEIGHT
    ) {
        var heightDiff = characterIMG.getHeight() - Options.CHARACTER.MAX_HEIGHT;
        var widthDiff = characterIMG.getWidth() - Options.CHARACTER.MAX_WIDTH;
        var scale = widthDiff > heightDiff ? Options.CHARACTER.MAX_WIDTH / characterIMG.getWidth() : Options.CHARACTER.MAX_HEIGHT / characterIMG.getHeight();

        await characterIMG.resize(characterIMG.getWidth() * scale, characterIMG.getHeight() * scale);
    }

    await characterIMG.quality(100);
    await characterIMG.write(`./io/output/${fileName.split(".")[0]}.png`);
})();

