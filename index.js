const Jimp = require("jimp");
const InputReader = require("./modules/InputReader.js");
const CharacterModifier = require("./modules/CharacterModifier.js");
const Options = require("./resource/options.json");

const text = "BEDWARS GAMEPLAY";

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
    console.log(`Writing Text on ${bgFileName}`);

    /* WRITING MESSAGES */
    const FONT = await Jimp.loadFont(Jimp.FONT_SANS_128_WHITE);
    const freeWidth = bgIMG.getWidth() - characterIMG.getWidth() * 1.5 - (Options.BACKGROUND.BORDER_WIDTH * 2);
    const charSize = await Jimp.measureText(FONT, "a");
    const charHeight = await Jimp.measureTextHeight(FONT, "A");
    const charPerLine = freeWidth / charSize;
    var count = 0;
    var str = "";

    text.split(" ").forEach((s, i) => {
        count += s.length + 1;
        if (count > charPerLine) {
            str += `\n${s}`;
            count = 0;
        } else {
            if (i != 0) str += " ";
            str += s;
        }
    });

    const startY = bgIMG.getHeight() / 2 - ((text.split(" ").length * charHeight) / 2);

    /* FIGURE OUT WHICH WAY CHARACTER IS FACING */
    if (characterIMG.getPixelColor(cropPoints.topLeft[0], cropPoints.topLeft[1])) {
        // facing left
        await bgIMG.composite(characterIMG, bgIMG.getWidth() - (characterIMG.getWidth() * 1.5), (bgIMG.getHeight() / 2) - (characterIMG.getHeight() / 2));

        await str.split("\n").forEach(async (s, i) => {
            await bgIMG.print(FONT, Options.BACKGROUND.BORDER_WIDTH, charHeight * i + startY, s);
        });

    } else {
        // facing right
        await bgIMG.composite(characterIMG, characterIMG.getWidth() * 0.5, (bgIMG.getHeight() / 2) - (characterIMG.getHeight() / 2));
        await str.split("\n").forEach(async (s, i) => {
            await bgIMG.print(FONT, characterIMG.getWidth() * 1.5, charHeight * i + startY, str);
        });
    }

    bgIMG.write(`./io/output/${bgFileName.split(".")[0]}.png`);
})();

