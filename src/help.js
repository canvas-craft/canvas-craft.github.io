'use strict'

const help = document.getElementById('helpMenu')
const helpButton = document.getElementById('helpButton')

const querySearch = document.getElementById('querySearch')
const quesryResult = document.getElementById('queryResult')

helpButton.onmouseover = () => helpChange('help')

const conversation = {
    layerTitle: '*Layer Title* Click to select this layer or rename it',
    createAfter: '*Create After* Create a new layer below this one',
    dropLayer: '*Drop* Move this layer to the one beneath',
    hideLayer: '*Hide* Disable or Enable the layer\'s visibility',
    collapseLayer: '*Collapse* Collapse or Expand this layer box',
    shapeX: '*Shape X* Edit the shape\'s x position',
    shapeY: '*Shape Y* Edit the shape\'s y position',
    shapeW: '*Shape Width* Edit the shape\'s width',
    shapeH: '*Shape Height* Edit the shape\'s height',
    shape: '*Shape* Click to select',
    shapeBadLayer: '*Shape* You cannot select a shape that is in a different layer',
    shapeSelected: '*Selected Shape* The icons enable you to move, hide, or delete the shape',
    moveUp: '*Move Up* Move the shape backwards',
    moveDown: '*Move Down* Move the shape forwards',
    closeRight: '*Side Panel* Close or open the Advanced Editing panel',
    closeShapes: '*Shape Panel* Close or open the Shape Editing panel',
    closeList: '*List* Close or open this list',
    state: '*Shape State* Hidden shapes are represented by a forward slash. An asterisk signifies that the shape has an invalid width or height',
    cameraLock: '*Camera Lock* Lock or unlock camera scrolling when shapes are near the edge of the screen',
    shapeToggle: '*Shape Toggle* Toggle between shape mode and mock line mode',
    currentShapeLayer: '*Shape Layer* Assign the shape to a different layer',
    codeTextarea: '*Code Box* This is where you can code the texture of your shape. You are given the "x" and "y" coordinates of the pixel, and can use JavaScript to return a colour as a string',
    presetList: '*Template List* Choose a different code template. Templates are available to every shape in CanvasCraft',
    remixList: '*Remix List* Choose a different remix. Remixes are extentions of templates, and can only be accessed by this shape',
    applyTexture: '*Apply Texture* This excecutes the code written in the box. If there are no errors, the texture will be rendered to the shape',
    colorPick: '*Colour Chooser* Choose a base colour for this shape. You can access it in the code box as <span class = snippet>color <span style="color:var(--operator)">{</span><span style="color:var(--variable)">r</span>, <span style="color:var(--variable)">g</span>, <span style="color:var(--variable)">b</span><span style="color:var(--operator)">}</span></span>',
    saveAsPreset: '*Save as Template* Add this remix to the list of templates. You can assign a template to any shape in the CanvasCraft',
    asDefault: '*Set as Default* Create all future shapes with this template as default',
    lineThickness: '*Line Thickness* Control the thickness of the line',
    settingsButton: '*Settings* Control default settings, manage files and customise the user interface',
    defaultColorButton: '*Save Default Colour* All future shapes will be created with this colour as default',
    deleteShape: '*Delete Shape* Delete this shape from CanvasCraft. This cannot be undone',
    hideShape: '*Hide Shape* Control the shape\'s visibility',
    property: '*Add a Property* Assign properties to this shape. Properties allow you to describe the shape\'s attributes in detail. These descriptions will be included in the Level Export code',
    defProperty: '*Property as Default* All future shapes will be given this property automatically',
    savePanel: '*Save Project* Export your creation as an image, a file, or level code',
    help: '*Help* Close or open the help panel. Hover over anything and the help panel will explain it',
    transform: '*Transform Layer* Move the contents of the layer by a certain amount',
    layerUp: '*Move Back* Push the layer back',
    layerDown: '*Move Down* Pull the layer forward',
    merge: '*Merge Up* Merge this layer into the one above',
    image: '*Image Mode* This allows you to insert an image from your device. You can switch back at any time',
    shapeMode: '*Shape Mode* Go back to the original texture mode. You can switch back at any time',
    chooseShapeImage: '*Select Image* Upload to an image from your device to assign it to this shape. If you do not want to upload an image, just switch back to Shape Mode',
    opacitySlider: '*Opacity* Control the opacity of this image',
    imagexPos: '*X Offset* The x offset of the image in this shape',
    imageyPos: '*Y Offset* The y offset of the image in this shape',
    imageScale: '*Scale* Control the size of the image',
    pixelX: '*Pixel X* The x position of the pixel. <span class = code><span style="color:var(--operator)">(</span><span style="color:var(--number)">0</span>, <span style="color:var(--number)">0</span><span style="color:var(--operator)">)</span></span> is the top left of the shape',
    pixelY: '*Pixel Y* The y position of the pixel. <span class = code><span style="color:var(--operator)">(</span><span style="color:var(--number)">0</span>, <span style="color:var(--number)">0</span><span style="color:var(--operator)">)</span></span> is the top left of the shape',
    pixelColor: '*Shape Colour* Access the RGB colour values of this shape as <span class = code><span style="color:var(--operator)">{</span><span style="color:var(--variable)">r</span>, <span style="color:var(--variable)">g</span>, <span style="color:var(--variable)">b</span><span style="color:var(--operator)">}</span></span>',
    pixelSize: '*Size* Access the width and height of this shape as <span class = code><span style="color:var(--operator)">{</span><span style="color:var(--variable)">w</span>, <span style="color:var(--variable)">h</span><span style="color:var(--operator)">}</span></span>',
}

const queries = [
    ['whatiscanvascraft','<p>CanvasCraft is a free tool designed to help creators create game worlds and images. You can learn more about us by clicking the "About" button on the homepage.</p>'],
    ['whatarecodetemplatespresets', '<h1>What are code templates?</h1><p>Code templates allow you to store useful code snippets that can be accessed by other shapes. Just press the "Save code as template" button and choose its name!</p>'],
    ['whatarecoderemixes', '<h1>What are code remixes?</h1><p>Code remixes are ways of storing multiple codes for a single shape. If you want to experiment with new textures without losing your original creation, just select a new template, and CanvasCraft will generate a fresh remix for you. This allows you to experiment with different textures while preserving your previous designs. </p><h2>How it Works</h2><p>&bull; Write some code to create a texture</p><p>&bull; When you\'re happy with how it looks, select a new texture from the <span class=code>Templates</span> list. This will create a new <b>Remix.</b> If you ever want to go back to the old texture that you made, simply select the right one in the <span class=code>Remixes</span> list!</p>'],
    ['whatlanguageisthecodeinuse', '<h1>What language is the code in?</h1><p>When you\'re creating textures in CanvasCraft, you will be coding in pure JavaScript. You are given the coordinates of each pixel in the shape, the shape\'s base colour, and the width and height of the shape.</p>'],
    ['howdoiusecanvascraft', '<h1>How do I use CanvasCraft?</h1><p>At the time of writing, CanvasCraft does not support touch-screen devices. For PCs, you can start CanvasCraft by clicking on the big icon on the homepage. The basic help assistant will tell you how to get started. If you need further help, simply hover over something and the assistant will explain it.</p>'],
    ['howdoiusejavascriptcodetomaketexturesincanvascraftcodebox', '<h1>How do I use JavaScript code to make textures in CanvasCraft?</h1><p>Making a texture is very simple, provided you know a little about code and RGB colours. Here\'s a breakdown of how it works.</p><p>&bull; The first time you create a shape, it will be given the Basic template. A template is a small code texture that you can work from.</p><p>&bull; At the start of the code, it defines four variables. <span class=code>r</span> - the red value - is a number between 0 and 255. The Green and Blue values are stored in the same way. Curiously, the alpha variable <span class=code>a</span> is stored as a number between 0 and 1. We added this feature to CanvasCraft because that\'s how standard JavaScript workds when creating RGB colours.</p><p>&bull; The last part of the code returns a string from the function. What does that mean? To put it into simple words, imagine the code snippet as a machine. You put stuff into the machine, and after doing a few calculations, it spits something back out. When we\'re coding textures in CanvasCraft, we are in essence telling the machine how to process its given information. The parameters of the function (or, the stuff that\'s put into the machine) is <span class=code>x</span>, <span class=code>y</span>, <span class=code>color</span> and <span class=code>size</span>. To learn more about them, search "What are the code arguments?" into the query bar at the top of this page. Back to the machine. So we have all these inputs, and we need to give an output. The output of this function is a standard JavaScript string. This can be in Hexadecimal format, HSL, or - in our instance - RGB.</p><p>&bull; Now we can start coding! Remember, we have the RGB variables defined earlier, so why not try making the colours change based on the coordinates? Paste the following code below the <span class=code>let a = 1</span> line and see what happens: <span class=code>r = r + x * 20</span>. After pressing "Apply Texture," the shape should gradually get redder from left to right. This is a very basic example of how to make textures, but it should be enough to get you started.</p>'],
    ['whatarethecodeparametersargumentsforboxxycolorsize', '<h1>What are the code arguments?</h1><p>The arguments for the code box function are <span class=code>x</span>, <span class=code>y</span>, <span class=code>color</span> and <span class=code>size</span>. The <span class=code>x</span> and <span class=code>y</span> values represent the positions of a pixel. When you apply the texture, the function will run for <b>every pixel in the shape.</b> This means that each pixel can be given a different colour, based on the arguments provided. The final two arguments <span class=code>color {r, g, b}</span> and <span class=code>size {w, h}</span> are <b>objects.</b></p>']
]

querySearch.oninput = () => {
    const queryWords = querySearch.value.split(' ')
    quesryResult.innerHTML = queryWords

    const arr = []

    // Iterate through stored queries
    for (let i = 0; i < queries.length; i ++) {
        const dic = {name: queries[i][0], score: 0}
        const name = dic.name

        // Iterate through words of searches query
        for (let j = 0; j < queryWords.length; j ++) {
            const word = queryWords[j].toLowerCase().replace(/[^a-z]/g,'')
            if (name.includes(word)) dic.score += word.length

            // If the word doesn't match, find a match inside the word
            else {
                for (let k = 0; k < word.length; k ++) {
                    const wordSoFar = word.slice(0, k)
                    if (name.includes(wordSoFar)) dic.score ++
                }
            }
        }

        arr.push(dic)
    }

    // Get largest score
    let score = -1
    let chosen = -1
    for (let i = 0; i < arr.length; i ++) {
        if (arr[i].score > score) {
            score = arr[i].score
            chosen = i
        }
    }
    if (chosen > -1) {
        quesryResult.innerHTML = queries[chosen][1]
        const spans = document.getElementsByClassName('code')
        for (let i = 0; i < spans.length; i ++) {
            const span = spans[i]
            span.innerHTML = syntaxHighlightJavaScriptCode(span.textContent)
        }
    }
}

let createdAShape = false
function helpChange(key) {
    if (!createdAShape) return
    help.innerHTML = conversation[key].replace(/(\*)(.*)(\*)/, '<b style="font-family:code">$2</b><hr>')
}

function toggleHelpMenu() {
    help.classList.toggle('closed')
    helpButton.classList.toggle('closed')
}