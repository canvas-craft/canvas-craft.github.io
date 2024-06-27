'use strict'

const help = document.getElementById('helpMenu')
const helpButton = document.getElementById('helpButton')

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
    merge: '*Merge Up* Merge this layer with the one above'
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