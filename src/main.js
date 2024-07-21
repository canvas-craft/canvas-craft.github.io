'use strict'

function val(x) {
    return Math.round(x / cell) * cell
}

function quad(x) {
    return x < .5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2
}

function pixel(x, y) {
    x = (x - camX) * scale + cvs.width / 2
    y = (y - camY) * scale + cvs.height / 2
    return {x, y}
}

function world(x, y) {
    x = (x - cvs.width / 2) / scale + camX,
    y = (y - cvs.height / 2) / scale + camY
    return {x, y}
}

function rect(x, y, w, h) {
    const pos = pixel(x, y)
    ctx.fillRect(pos.x, pos.y, w * scale, h * scale)
    return pos
}

function img(image, x, y, w, h) {
    const pos = pixel(x, y)
    ctx.drawImage(image, pos.x, pos.y, w * scale, h * scale)
    return pos
}

function mousePos(e) {
    m.x = e.clientX * devicePixelRatio
    m.y = e.clientY * devicePixelRatio
}

function resize() {
    cvs.width = cvs.clientWidth * devicePixelRatio
    cvs.height = cvs.clientHeight * devicePixelRatio
    updateScreen = true
}

function loop() {
    requestAnimationFrame(loop)
    time += 1

    if (scrollSpeed) {
        scale -= scale * scrollSpeed
        scrollSpeed *= ZOOM_FRICTION
        if (Math.abs(scrollSpeed) < .01) scrollSpeed = 0
    }

    if (panSpeedX) {
        camX -= panSpeedX
        panSpeedX *= ZOOM_FRICTION
        if (Math.abs(panSpeedX) < .01) panSpeedX = 0
    }

    if (panSpeedY) {
        camY -= panSpeedY
        panSpeedY *= ZOOM_FRICTION
        if (Math.abs(panSpeedY) < .01) panSpeedY = 0
    }

    if (((m.creation || m.movingShape) && !cameraLock.locked)) {
        const gap = (cvs.width + cvs.height) / 20
        const speed = .05 / scale
        if (m.x < gap) camX += (m.x - gap) * speed
        if (m.y < gap) camY += (m.y - gap) * speed
        if (m.x > cvs.width - gap) camX += (m.x - (cvs.width - gap)) * speed
        if (m.y > cvs.height - gap) camY += (m.y - (cvs.height - gap)) * speed
    }

    else if (!updateScreen && !panSpeedX && !panSpeedY && !scrollSpeed) return

    ctx.imageSmoothingEnabled = false

    const w = cvs.width
    const h = cvs.height
    ctx.clearRect(0, 0, w, h)
    ctx.fillStyle = 'rgb('+backgroundColor[0]+','+backgroundColor[1]+','+backgroundColor[2]+')'
    ctx.fillRect(0, 0, cvs.width, cvs.height)
    const size = Math.max(cvs.width, cvs.height)
    const amt = Math.ceil(size / (scale * cell))
    const gridSize = cell
    const limit = 300
    const thick = 1.5 + scale * .01

    if (gridOn.checked) {
        let alpha = limit / amt / 60
        if (alpha > .3) alpha = .3

        let gridColor = 'rgb(0,0,0,'
        if (whiteGrid.checked) gridColor = 'rgb(255,255,255,'

        if (amt < limit) {
            for (let i = Math.ceil(camY); i < amt + Math.ceil(camY); i ++) {
                const y = Math.ceil(i - amt / 2) * gridSize
                if (!y) continue
                const pos = pixel(0, y)

                ctx.fillStyle = gridColor+alpha+')'
                if (y % 5 == 0) ctx.fillStyle = gridColor+alpha*2+')'
                ctx.fillRect(0, pos.y - thick / 2, w, thick)
            }
            for (let i = Math.ceil(camX); i < amt + Math.ceil(camX); i ++) {
                const x = Math.ceil(i - amt / 2) * gridSize
                if (!x) continue
                const pos = pixel(x, 0)

                ctx.fillStyle = gridColor+alpha+')'
                if (x % 5 == 0) ctx.fillStyle = gridColor+alpha*2+')'
                ctx.fillRect(pos.x - thick / 2, 0, thick, h)
            }
        }

        const pos = pixel(0, 0)
        ctx.fillStyle = gridColor+alpha*5+')'
        ctx.fillRect(pos.x - thick, 0, thick, h)
        ctx.fillRect(0, pos.y - thick, w, thick)
    }

    updateScreen = false
    shapeIsHovered = 0
    hoveringShorthand = false
    selectedShapes = []

    for (let i = 0; i < layers.length; i ++) {
        const layer = layers[i].arr
        if (layers[i].hidden) continue
        for (let j = 0; j < layer.length; j ++) {
            const shape = layer[j]
            shape.draw()
        }
    }

    if (shapeIsHovered) {
        shapeIsHovered.hover += shapeIsHovered.outlineSpeed * 2
        if (shapeIsHovered.hover > 1) shapeIsHovered.hover = 1
        if (m.press) m.selection = shapeIsHovered
    }

    // Iterate through all selected shapes
    for (let i = 0; i < selectedShapes.length; i ++)
        selectedShapes[i].drawShorthand()
    if (m.selection) m.selection.updateDiv()
}

let updateScreen = true
let selectedLayer = 0
let shapeIsHovered = 0
let defaultTemplate = 0
let hoveringShorthand = false
let lineThickness = DEFAULT_LINE_THICK
let selectedShapes = []
let defaultProperty = ''
let scale = 30
let cell = 1
let time = 0
let camX = 0
let camY = 0
let drawIterations = 10000
let defaultColor = [50, 230, 90]
let backgroundColor = [0, 0, 0]
let lineColor = [0, 255, 0]
let pinchZoom = 0

let spans = []
reSyntaxHighlight()

const whiteGrid = document.getElementById('whiteGrid')
whiteGrid.checked = true
whiteGrid.onchange = () => updateScreen = true

const cvs = document.getElementById('cvs')
const ctx = cvs.getContext('2d')
const screen = document.getElementById('screen')
const container = document.getElementById('container')
const popup = document.getElementById('popBackground')
const popupText = document.getElementById('popText')
const popupChoice = document.getElementById('popOptions')
const cameraLock = document.getElementById('cameraLock')
const shapeToggle = document.getElementById('shapeToggle')
const settingsButton = document.getElementById('settingsButton')
const settings = document.getElementById('settings')
const settingClose = document.getElementById('settingClose')
const settingColor = document.getElementById('settingColor')
const bgColor = document.getElementById('bgColor')
const settingColorText = document.getElementById('settingColorText')
const bgText = document.getElementById('bgText')
const randomBrushContain = document.getElementById('randomBrushContain')
const randomBrush = document.getElementById('randomBrush')
const defaultBrush = document.getElementById('defaultBrush')
const textureRender = document.getElementById('textureRender')
const saveButton = document.getElementById('saveButton')
const saveScreen = document.getElementById('saveScreen')
const copyCodeButton = document.getElementById('copyCodeButton')
const saveAsCode = document.getElementById('saveAsCode')
const gridOn = document.getElementById('gridOn')
const includeShapes = document.getElementById('includeShapes')
const includeLines = document.getElementById('includeLines')
const includeProperties = document.getElementById('includeProperties')
const surroundProperty = document.getElementById('surroundProperty')
const includeHidden = document.getElementById('includeHidden')
const includeType = document.getElementById('includeType')
const verticalLast = document.getElementById('verticalLast')
const selectAsCodeLayer = document.getElementById('selectAsCodeLayer')
const saveAsImageBox = document.getElementById('saveAsImageBox')
const transparentBg = document.getElementById('transparentBg')
const hiddenBoundary = document.getElementById('hiddenBoundary')
const downloadImage = document.getElementById('downloadImage')
const downloadFile = document.getElementById('downloadFile')
const uploadFile = document.getElementById('uploadFile')
const about = document.getElementById('aboutCanvasCraft')
const splash = document.getElementById('splash')
const centerSplash = document.getElementById('centerSplash')
const splashPanel = document.getElementById('splashPanel')
const splashClose = document.getElementById('splashClose')
const changelog = document.getElementById('changelog')
const aboutSection = document.getElementById('aboutSection')
const changelogSection = document.getElementById('changelogSection')
const helpSplash = document.getElementById('helpSplash')
const helpSection = document.getElementById('helpSection')
const openSplash = document.getElementById('openSplash')
const details = document.getElementById('details')

openSplash.onmousedown = () => splash.classList.remove('closed')

centerSplash.onmousedown = () => {
    if (performance.now() < 1000 || splash.classList.contains('closed')) return

    splash.classList.add('closed')
    if (settings.classList.contains('open')) return

    popup.classList.add('open')
    popupText.textContent = 'Welcome to CanvasCraft!'
    popupChoice.innerHTML = ''
    const mode = document.createElement('div')
    mode.textContent = 'New here? Choose your mode!'
    popupChoice.appendChild(mode)

    const beginner = document.createElement('button')
    beginner.textContent = 'Beginner'
    beginner.onmousedown = () => popup.classList.remove('open')
    popupChoice.appendChild(beginner)

    const expert = document.createElement('button')
    expert.onmousedown = () => {
        popup.classList.remove('open')
        sideHandle()
        baseHandle()
    }
    expert.textContent = 'Expert'
    popupChoice.appendChild(expert)

    const tip = document.createElement('div')
    const options = [
        'To create a batch of shapes with the same colour, simply press the save icon next to the colour selector.',
        'Tired of the copying templates for multiple shapes? Select the "Set template as default" button for an automatic assignment.',
        'You can ask for advanced help by typing your query into CanvasCraft\'s homepage.',
        'Hover over anything and help assistant will explain it. You can disable it by pressing the question mark at the top-left of the screen.',
        'Properties are an easy way to store specific details about a shape. You can use the feature in a variety of ways, from designing game worlds to simply annotating shapes.'
    ]
    tip.innerHTML = '<b>Pro-tip!</b> ' + options[Math.floor(Math.random() * options.length)]
    tip.style.color = '#fb0'
    popupChoice.appendChild(tip)
}

about.onmousedown = () => {
    splashPanel.classList.add('open')
    splashPanel.scrollTo(0, 0)
    aboutSection.style.display = 'block'
    changelogSection.style.display = 'none'
    helpSection.style.display = 'none'
}

changelog.onmousedown = () => {
    splashPanel.classList.add('open')
    splashPanel.scrollTo(0, 0)
    changelogSection.style.display = 'flex'
    aboutSection.style.display = 'none'
    helpSection.style.display = 'none'
}

helpSplash.onmousedown = () => {
    splashPanel.classList.add('open')
    splashPanel.scrollTo(0, 0)
    helpSection.style.display = 'flex'
    aboutSection.style.display = 'none'
    changelogSection.style.display = 'none'
}

splashClose.onmousedown = () => {
    splashPanel.classList.remove('open')
}

uploadFile.onchange = () => generateUploadFile(uploadFile)
downloadFile.onmousedown = () => generateDownloadFile()

surroundProperty.checked = false
transparentBg.checked = false
hiddenBoundary.checked = false

transparentBg.onchange = () => generateFinalImage()
hiddenBoundary.onchange = () => generateFinalImage()

let chosenLayer = 'all'

const change = () => {
    if (chosenLayer == 'all') selectAsCodeLayer.textContent = 'All Layers'
    else selectAsCodeLayer.textContent = layerDiv.children[chosenLayer].name.value
}
change()

selectAsCodeLayer.onmousedown = () => {
    popup.classList.add('open')
    popupText.textContent = 'Select a layer'
    popupChoice.innerHTML = ''

    const all = document.createElement('button')
    all.textContent = 'All Layers'

    all.onmousedown = () => {
        chosenLayer = 'all'
        generateSaveCode()
        change()
        popup.classList.remove('open')
    }
    popupChoice.appendChild(all)

    for (let i = 0; i < layerDiv.children.length; i ++) {
        const layer = layerDiv.children[i]

        const layerButton = document.createElement('button')
        layerButton.className = 'wide'
        layerButton.textContent = layer.name.value
        layerButton.onmousedown = () => {
            chosenLayer = i
            generateSaveCode()
            change()
            popup.classList.remove('open')
        }

        popupChoice.appendChild(layerButton)
    }
}

gridOn.checked = true
gridOn.onchange = () => updateScreen = true

includeShapes.onchange = () => generateSaveCode()
includeLines.onchange = () => generateSaveCode()
includeProperties.onchange = () => generateSaveCode()
surroundProperty.onchange = () => generateSaveCode()
includeHidden.onchange = () => generateSaveCode()
includeType.onchange = () => generateSaveCode()
verticalLast.onchange = () => generateSaveCode()

saveButton.onmouseover = () => helpChange('savePanel')
saveButton.onmousedown = () => {
    saveButton.classList.add('open')
    saveScreen.classList.add('open')
    createdAShape = true

    generateSaveCode()
    generateFinalImage()
}

saveClose.onmousedown = () => {
    saveButton.classList.remove('open')
    saveScreen.classList.remove('open')
}

randomBrush.onchange = () => {
    if (randomBrush.checked) randomBrushContain.classList.add('checked')
    else randomBrushContain.classList.remove('checked')
    defaultBrush.checked = !defaultBrush.checked
}

defaultBrush.onchange = () => {
    if (defaultBrush.checked) randomBrushContain.classList.remove('checked')
    else randomBrushContain.classList.add('checked')
    randomBrush.checked = !randomBrush.checked
}

randomBrushContain.classList.add('checked')
randomBrush.checked = true
defaultBrush.checked = false

// Display the default colour in settings
makeColorPick(settingColor, settingColorText, 'Choose your default colour', defaultColor, () => {
    const r = defaultColor[0] * .3
    const g = defaultColor[1] * .59
    const b = defaultColor[2] * .11
    if (r + g + b < 128) settingColorText.className = 'light'
    else settingColorText.className = ''
})
const colorString = 'rgb('+defaultColor[0]+','+defaultColor[1]+','+defaultColor[2]+')'
settingColor.style.backgroundColor = colorString
settingColorText.textContent = colorString

// Display the default background colour in settings
makeColorPick(bgColor, bgText, 'Change the background colour', backgroundColor, () => {
    const r = backgroundColor[0] * .3
    const g = backgroundColor[1] * .59
    const b = backgroundColor[2] * .11
    if (r + g + b < 128) {
        bgText.className = 'light'
        whiteGrid.checked = true
    }
    else {
        bgText.className = ''
        whiteGrid.checked = false
    }
})
const bgColorString = 'rgb('+backgroundColor[0]+','+backgroundColor[1]+','+backgroundColor[2]+')'
bgColor.style.backgroundColor = bgColorString
bgText.textContent = bgColorString
bgText.className = 'light'

popup.onmousedown = e => {if (e.target.id == 'popBackground') popup.classList.remove('open')}

cameraLock.onmousedown = () => {
    cameraLock.classList.toggle('locked')
    cameraLock.locked = cameraLock.classList.contains('locked')
}
cameraLock.onmouseover = () => helpChange('cameraLock')

shapeToggle.onmousedown = () => {
    shapeToggle.classList.toggle('line')
    shapeToggle.line = shapeToggle.classList.contains('line')
}
shapeToggle.line = false
shapeToggle.onmouseover = () => helpChange('shapeToggle')

settingsButton.onmousedown = () => {
    settings.classList.add('open')
    settingsButton.classList.add('open')
}
settingClose.onmousedown = () => {
    settings.classList.remove('open')
    settingsButton.classList.remove('open')
}
settingsButton.onmouseover = () => helpChange('settingsButton')

// Assign texture speed
textureRender.value = drawIterations
textureRender.oninput = () => {
    let val = Number(textureRender.value)
    if (!val) return
    if (val > 50000) val = 50000
    if (val > 1) textureRender.value = val
}
textureRender.onchange = () => {
    let val = Number(textureRender.value)
    if (val < 2) val = 2
    if (!val || !textureRender.value.length) val = 500
    textureRender.value = val
    drawIterations = val
}

copyCodeButton.onmousedown = () => {
    // SELECT AND COPY
    saveAsCode.select()
    saveAsCode.setSelectionRange(0, 1e5)
    navigator.clipboard.writeText(saveAsCode.value)

    // DISPLAY
    const old = copyCodeButton.textContent
    copyCodeButton.textContent = 'Copied!'
    setTimeout(() => copyCodeButton.textContent = old, 2000)
}

let codes = [
    {name: 'Basic', code: 'let r = color.r\nlet g = color.g\nlet b = color.b\nlet a = 1\n\nreturn \'rgb(\'+r+\',\'+g+\',\'+b+\',\'+a+\')\''},
    {name: 'Random', code: 'let r = color.r + Math.random() * 50 - 25\nlet g = color.g + Math.random() * 50 - 25\nlet b = color.b + Math.random() * 50 - 25\nlet a = 1\n\nreturn \'rgb(\'+r+\',\'+g+\',\'+b+\',\'+a+\')\''}
]

const m = {
    x: 0,
    y: 0,
    press: false,
    creation: 0,
    startX: 0,
    startY: 0,
    rightClick: false,
    selection: 0,
    movingShape: false,
    moveOffset: {x: 0, y: 0},
    movePos: {x: 0, y: 0}
}
let layers = []
const icons = {}
function newIcon(name) {
    const icon = new Image()
    icon.src = 'src/'+name+'.svg'
    icons[name] = icon
}
newIcon('move')
newIcon('hide')
newIcon('remove')

addNewLayer(0)

let panSpeedX = 0
let panSpeedY = 0
let scrollSpeed = 0
function mouseScroll(e) {
    const max = .1
    let speed = e.deltaY * .005
    if (speed > max) speed = max
    if (speed < -max) speed = -max
    scrollSpeed = speed
    if (scale <= .5) {
        scale = .5
        scrollSpeed *= .1
    }
    else if (scale >= 500) {
        scale = 500
        scrollSpeed *= .1
    }
    else {
        camX -= (m.x - cvs.width / 2) / scale * speed
        camY -= (m.y - cvs.height / 2) / scale * speed
    }
    updateScreen = true
}
cvs.onwheel = e => mouseScroll(e)
cvs.onscroll = e => mouseScroll(e)
function mouseMove(e, mouseUp) {
    updateScreen = true

    calcDetails()

    if (m.press) {
        const pos = world(m.x, m.y)

        if (m.movingShape) {
            m.movingShape.x = val(pos.x + m.moveOffset.x)
            m.movingShape.y = val(pos.y + m.moveOffset.y)
            applyInfoToShapePanel(m.movingShape.div, true)
        }

        else if (m.rightClick) {
            const old = {x: m.x, y: m.y}
            mousePos(e)
            // camX -= (m.x - old.x) / scale
            // camY -= (m.y - old.y) / scale
            if (!mouseUp) {
                panSpeedX = (m.x - old.x) / scale
                panSpeedY = (m.y - old.y) / scale
            }
        }

        else if (!m.creation) {
            if (!mouseUp) {
                const shape = new Shape(val(pos.x), val(pos.y), 0, 0)
                createShape(shape)
                m.creation = shape
                m.startX = val(pos.x)
                m.startY = val(pos.y)
            }
        }

        else {
            let w = pos.x - m.startX
            let h = pos.y - m.startY
            m.creation.invertX = 1
            m.creation.invertY = 1

            if (w < 0) {
                w *= -1
                m.creation.invertX = -1
                m.creation.x = val(pos.x)
            }
            if (h < 0) {
                h *= -1
                m.creation.invertY = -1
                m.creation.y = val(pos.y)
            }
            m.creation.w = val(w)
            m.creation.h = val(h)
            applyInfoToShapePanel(m.creation.div, true)
        }
    }
}
cvs.onmousemove = e => {
    if (!m.x && !m.y) mousePos(e)
    mouseMove(e)
    mousePos(e)
}
cvs.ontouchmove = e => {
    if (!m.x && !m.y) mousePos(e.touches[0])
    if (e.touches[0].identifier == startTouch) mouseMove(e.touches[0])
    mousePos(e.touches[0])

    if (m.rightClick) {
        const oldZoom = pinchZoom
        pinchZoom = Math.hypot(
            e.touches[0].clientX - e.touches[1].clientX,
            e.touches[0].clientY - e.touches[1].clientY)
        if (oldZoom) mouseScroll({deltaY: oldZoom - pinchZoom})
    }
}
cvs.oncontextmenu = e => e.preventDefault()
cvs.onmousedown = e => {
    m.rightClick = e.button > 0
    m.press = true
    mousePos(e)
}

function mouseUp(e) {
    mouseMove(e, true)

    // Remove creation if too small
    if (m.creation) {
        const box = !m.creation.line && (!m.creation.w || !m.creation.h)
        const line = m.creation.line && !m.creation.w && !m.creation.h
        if (box || line) {
            for (let i = 0; i < layers.length; i ++) {
                const layer = layers[i].arr
                for (let j = 0; j < layer.length; j ++) {
                    if (layer[j] == m.creation) {
                        deleteShape(m.creation, layer, j, true)
                        break
                    }
                }
            }
        }
        else {
            m.creation.drawOnShape()
            m.selection = m.creation
            createdAShape = true
        }
    }
    m.rightClick = false
    m.press = false
    m.creation = 0
    m.movingShape = 0
    mousePos(e)
}
cvs.onmouseup = e => mouseUp(e)
cvs.onmouseleave = e => mouseUp(e)

let startTouch = 0
cvs.ontouchstart = e => {
    m.rightClick = e.touches.length >= 2
    m.press = true
    startTouch = e.touches[0].identifier
    mousePos(e.touches[0])
}

function cancel(e) {
    if (e.touches.length && e.touches[0].identifier != startTouch)
        mouseUp(e.touches[1])
    else mouseUp(e.touches[0])
    pinchZoom = 0
}
cvs.ontouchend = e => cancel(e)
cvs.ontouchcancel = e => cancel(e)

new ResizeObserver(resize).observe(cvs)
onresize = () => resize()
resize()
scale = (cvs.width + cvs.height) / 50
loop()

onload = () => scrollTo(0, 0)