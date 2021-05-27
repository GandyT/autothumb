const Options = require("../resource/options.json");

const scale = (iniWidth, iniHeight) => {
    var heightDiff = iniWidth - Options.CHARACTER.MAX_HEIGHT;
    var widthDiff = iniHeight - Options.CHARACTER.MAX_WIDTH;

    return (widthDiff > heightDiff ? Options.CHARACTER.MAX_WIDTH / iniWidth : Options.CHARACTER.MAX_HEIGHT / iniHeight) || 1;
}
const crop = async (characterIMG) => {
    let topLeft = [characterIMG.getWidth(), characterIMG.getHeight()];
    let bottomRight = [1, 1];

    var found = false;
    for (let wI = 1; wI <= characterIMG.getWidth(); wI += 1) {
        var columnContainsPixel = false;
        for (let hI = bottomRight[1]; hI <= characterIMG.getHeight(); ++hI) {
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

    return {
        topLeft: topLeft,
        bottomRight: bottomRight
    }
}

module.exports = {
    scale: scale,
    crop: crop
}