const Jimp = require("jimp");
const InputReader = require("./modules/InputReader.js");
const CharacterModifier = require("./modules/CharacterModifier.js");
const Options = require("./resource/options.json");

(async () => {
    const characters = await InputReader.getCharacters();
    const backgrounds = await InputReader.getBackgrounds();

    if (characters.length == 0) {
        console.log("PLEASE INPUT A CHARACTER");
        return;
    }
    if (backgrounds.length == 0) {
        console.log("PLEASE INPUT A BACKGROUND");
        return;
    }

    const charFileName = characters[Math.floor(Math.random() * characters.length)];
    var characterIMG = await Jimp.read(`./io/input/${charFileName}`);
    var cropPoints = await CharacterModifier.crop(characterIMG);
    var scaleFactor = CharacterModifier.scale(characterIMG.getWidth(), characterIMG.getHeight());

    await characterIMG.crop(cropPoints.topLeft[0], cropPoints.topLeft[1], cropPoints.bottomRight[0] - cropPoints.topLeft[0], cropPoints.bottomRight[1] - cropPoints.topLeft[1]);
    await characterIMG.scale(scaleFactor);

    /* FIND BACKGROUND DIRECTION */
    const bgFileName = backgrounds[Math.floor(Math.random() * backgrounds.length)];
    var bgIMG = await Jimp.read(`./io/input/${bgFileName}`);
    await bgIMG.crop(0, 0, 1920, 1080);

    console.log(`Applying Blur...`);
    await bgIMG.blur(4);

    /* ADDING BORDER */
    console.log("ADDING BORDER");
    const bgCrop = await Jimp.read(bgIMG);
    await bgCrop.crop(Options.BACKGROUND.BORDER_WIDTH, Options.BACKGROUND.BORDER_WIDTH, bgCrop.getWidth() - (Options.BACKGROUND.BORDER_WIDTH * 2), bgCrop.getHeight() - (Options.BACKGROUND.BORDER_WIDTH * 2));

    await bgIMG.brightness(0.5);

    await bgIMG.composite(bgCrop, Options.BACKGROUND.BORDER_WIDTH, Options.BACKGROUND.BORDER_WIDTH);

    console.log(`Compositing ${charFileName} on ${bgFileName}`);
    /* FIGURE OUT WHICH WAY CHARACTER IS FACING */
    if (characterIMG.getPixelColor(cropPoints.topLeft[0], cropPoints.topLeft[1])) {
        // facing left
        await bgIMG.composite(characterIMG, bgIMG.getWidth() - (characterIMG.getWidth() * 1.5), (bgIMG.getHeight() / 2) - (characterIMG.getHeight() / 2));
    } else {
        // facing right
        await bgIMG.composite(characterIMG, characterIMG.getWidth() * 0.5, (bgIMG.getHeight() / 2) - (characterIMG.getHeight() / 2));
    }

    bgIMG.write(`./io/output/${bgFileName.split(".")[0]}.png`);
})();

