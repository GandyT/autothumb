const Jimp = require("jimp");
const InputReader = require("./modules/InputReader.js");
const CharacterModifier = require("./modules/CharacterModifier.js");

(async () => {
    const characters = await InputReader.getCharacters();

    if (characters.length == 0) {
        console.log("PLEASE INPUT A CHARACTER");
        return;
    }

    const fileName = characters[Math.floor(Math.random() * characters.length)];
    var characterIMG = await Jimp.read(`./io/input/${fileName}`);
    var cropPoints = await CharacterModifier.crop(characterIMG);
    var scaleFactor = CharacterModifier.scale(characterIMG.getWidth(), characterIMG.getHeight());

    await characterIMG.crop(cropPoints.topLeft[0], cropPoints.topLeft[1], cropPoints.bottomRight[0] - cropPoints.topLeft[0], cropPoints.bottomRight[1] - cropPoints.topLeft[1]);
    await characterIMG.scale(scaleFactor);
    await characterIMG.write(`./io/output/${fileName.split(".")[0]}.png`);
})();

