'use strict'

function randomStr() {
    return Math.floor(Math.random() * 10000)
}

function generateSaveCode() {
    let str = ''
    for (let i = 0; i < layers.length; i ++) {
        const layer = layers[i].arr
        if (chosenLayer != 'all' && i != chosenLayer) continue

        for (let j = 0; j < layer.length; j ++) {
            const shape = layer[j]
            if (!shape.line && !includeShapes.checked) continue
            if (shape.line && !includeLines.checked) continue
            if (shape.hidden && !includeHidden.checked) continue

            let w = shape.w
            let h = shape.h
            if (shape.line) {
                w *= shape.invertX
                h *= shape.invertY
            }

            if (includeType.checked) {
                if (shape.line) str += '\'line\','
                else str += '\'block\','
            }

            str += shape.x + ',' + shape.y + ',' + w + ',' + h + ','
            if (includeProperties.checked) {
                if (shape.property) {
                    if (surroundProperty.checked) str += '\'' + shape.property + '\','
                    else str += shape.property + ','
                }
                else str += 'false,'
            }
        }
    }

    // Set code and remove last comma
    saveAsCode.value = str.slice(0, -1)
}

function generateFinalImage() {
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')

    // Calculate image dimensions
    let X = 'none'
    let Y = 'none'
    let X2 = 'none'
    let Y2 = 'none'
    for (let i = 0; i < layers.length; i ++) {
        const layer = layers[i].arr
        if (layers[i].hidden) continue
        for (let j = 0; j < layer.length; j ++) {
            const shape = layer[j]
            if (shape.line || shape.hidden) continue
            if (shape.x < X || X == 'none') X = shape.x
            if (shape.y < Y || Y == 'none') Y = shape.y
            if (shape.x + shape.w > X2 || X2 == 'none') X2 = shape.x + shape.w
            if (shape.y + shape.h > Y2 || Y2 == 'none') Y2 = shape.y + shape.h
        }
    }
    canvas.width = X2 - X
    canvas.height = Y2 - Y

    if (!transparentBg.checked) {
        context.fillStyle = '#fff'
        context.fillRect(0, 0, canvas.width, canvas.height)
    }

    // Draw shapes on image
    let shapes = false
    for (let i = 0; i < layers.length; i ++) {
        const layer = layers[i].arr
        if (layers[i].hidden) continue
        for (let j = 0; j < layer.length; j ++) {
            const shape = layer[j]
            if (shape.line || shape.hidden) continue
            shapes = true
            context.drawImage(shape.cvs, shape.x - X, shape.y - Y, shape.w, shape.h)
        }
    }

    saveAsImageBox.innerHTML = ''
    saveAsImageBox.appendChild(canvas)

    // Update download image button
    downloadImage.onmousedown = () => {
        if (!shapes) return
        const link = document.createElement('a')
        link.download = 'CanvasCraft-' + randomStr() + '.png'
        link.href = canvas.toDataURL()
        link.click()
    }
}

function chooseDefaultColor() {
    popup.classList.add('open')
    popupText.textContent = 'Choose your default colour'
    popupChoice.innerHTML = ''

    const chosenColor = document.createElement('div')
    chosenColor.className = 'colorPick'
    popupChoice.appendChild(chosenColor)

    const setBackgroundColor = () => {
        const colorString = 'rgb('+Number(r.value)+','+Number(g.value)+','+Number(b.value)+')'
        chosenColor.style.backgroundColor = colorString
    }

    const rgb = document.createElement('div')
    rgb.className = 'inputContainer'
    const r = document.createElement('input')
    const g = document.createElement('input')
    const b = document.createElement('input')
    r.style.backgroundColor = '#111'
    g.style.backgroundColor = '#111'
    b.style.backgroundColor = '#111'
    r.placeholder = 'Red'
    g.placeholder = 'Green'
    b.placeholder = 'Blue'
    r.value = defaultColor[0]
    g.value = defaultColor[1]
    b.value = defaultColor[2]
    const restrict = val => {
        val.value = val.value.replace(/\D/g, '')
        if (Number(val.value) > 255) val.value = 255
        setBackgroundColor(chosenColor)
    }
    r.oninput = () => restrict(r)
    g.oninput = () => restrict(g)
    b.oninput = () => restrict(b)
    rgb.appendChild(r)
    rgb.appendChild(g)
    rgb.appendChild(b)
    popupChoice.appendChild(rgb)

    setBackgroundColor(chosenColor)

    const setColor = () => {
        const colorString = 'rgb('+defaultColor[0]+','+defaultColor[1]+','+defaultColor[2]+')'
        settingColor.style.backgroundColor = colorString
        settingColorText.textContent = colorString

        const r = defaultColor[0] * .3
        const g = defaultColor[1] * .59
        const b = defaultColor[2] * .11
        if (r + g + b < 128) settingColorText.className = 'light'
        else settingColorText.className = ''
    }

    const ok = document.createElement('button')
    ok.textContent = 'Okay'
    ok.onmousedown = () => {
        updateScreen = true
        popup.classList.remove('open')
        defaultColor[0] = Number(r.value)
        defaultColor[1] = Number(g.value)
        defaultColor[2] = Number(b.value)

        setColor()
    }
    popupChoice.appendChild(ok)
}

function syntaxHighlightJavaScriptCode(code) {
    const span = (c, e) => '<span style = "color: var(--' + c + ')">' + e.replace(/&/g, '&amp;').replace(/</g, '&lt;') + '</span>'
    const main = code => {
        const data = {
            multi: /`[\s\S]*?`/,
            regex: /\/.+?\/[gim]*/,
            comment: /\/\*[\s\S]*?\*\/|\/\/.*/,
            string: /".*?"|'.*?'/}
        const total = new RegExp('(' + data.multi.source + '|' + data.string.source + '|' + data.comment.source + '|' + data.regex.source + ')')

        return code.split(total).map((e, i) => i % 2 ? data.multi.test(e) ? e.split(/(\${.*?})/).map(
            (e, i) => i % 2 ? loop(e) : span('string', e)).join('') : data.comment.test(e) ? span('comment', e) :
            data.regex.test(e) ? span('regex', e) : span('string', e) : loop(e)).join('')
    }

    const loop = (code, index = 0) => {
        const list = [
            {class: 'keyword', regex: /\b(arguments|await|case|catch|class|const|continue|debugger|default|delete|do|double|else|enum|eval|export|extends|finally|for|function|if|implements|import|in|instanceof|interface|let|new|package|private|protected|public|return|static|switch|throw|try|typeof|var|void|while|with|yield)\b/},
            {class: 'number', regex: /\b(true|false|null|undefined|NaN|Infinity|\d+)\b/},
            {class: 'builtin', regex: /\b(eval|isFinite|isNaN|parseFloat|parseInt|decodeURI|decodeURIComponent|encodeURI|encodeURIComponent|escape|unescape)\b/},
            {class: 'function', regex: /\b(\w+\()/, item: /\w+/},
            {class: 'variable', regex: /\b(\w+)\b/},
            {class: 'operator', regex: /([\/*+<>%=-?:]+)/}
        ]

        return code.split(list[index].regex).map((e, i) => i % 2 ? list[index].item ? e.replace(
            list[index].item, e => span(list[index].class, e)) : span(list[index].class, e) :
            index + 1 == list.length ? e : loop(e, index + 1)).join('')
    }

    return main(code)
}

let number = 0
function makePasskey() {
    number ++
    return number
}

function closePopUp() {
    popup.classList = []
}

function deselectAll() {
    m.selection = false
    shapeIsHovered = 0
    currentShapeInfo = 0
    basenavContent.innerHTML = NO_INFO
}

function closeLayers() {
    layerSwitch.classList.toggle('closed')
    layerDiv.classList.toggle('closed')
}

function selectThisLayer(passkey, makingNewShape = false) {
    if (!makingNewShape) deselectAll()

    for (let i = 0; i < layers.length; i ++) {
        const elem = layers[i].passkey
        if (elem == passkey) {
            if (layerDiv.children[selectedLayer])
                layerDiv.children[selectedLayer].style.border = 'var(--none)'
            selectedLayer = i
            layerDiv.children[i].style.border = 'var(--bright)'
            break
        }
    }

    const layer = layerDiv.children[selectedLayer]
    basenavContent.innerHTML = ''
    const head = document.createElement('h1')
    head.className = 'center wide'
    head.textContent = layer.name.value
    basenavContent.appendChild(head)

    const contain = document.createElement('div')
    contain.className = 'inputContainer'

    const moveUp = document.createElement('button')
    const moveUpImg = document.createElement('img')
    moveUpImg.src = 'src/close.svg'
    moveUpImg.id = 'up'
    moveUp.className = 'wide'
    moveUp.appendChild(moveUpImg)
    moveUp.onmouseover = () => helpChange('layerUp')
    moveUp.onmousedown = () => {
        const last = layer.previousElementSibling
        if (last) {
            last.sink.onmousedown()
            selectThisLayer(passkey)
        }
    }

    const moveDown = document.createElement('button')
    const moveDownImg = document.createElement('img')
    moveDownImg.src = 'src/close.svg'
    moveDownImg.id = 'down'
    moveDown.className = 'wide'
    moveDown.appendChild(moveDownImg)
    moveDown.onmouseover = () => helpChange('layerDown')
    moveDown.onmousedown = () => {
        layer.sink.onmousedown()
        selectThisLayer(passkey)
    }

    contain.appendChild(moveUp)
    contain.appendChild(moveDown)
    basenavContent.appendChild(contain)

    const transformButton = document.createElement('button')
    transformButton.textContent = 'Transform'
    transformButton.className = 'wide'
    transformButton.onmouseover = () => helpChange('transform')
    transformButton.onmousedown = () => {
        popup.classList.add('open')
        popupText.textContent = 'Move the contents of your layer'
        popupChoice.innerHTML = ''

        const transform = document.createElement('div')
        transform.className = 'inputContainer'
        const moveX = document.createElement('input')
        const moveY = document.createElement('input')
        moveX.className = 'wide'
        moveY.className = 'wide'
        moveX.placeholder = 'X coordinate'
        moveY.placeholder = 'Y coordinate'
        moveX.style.backgroundColor = '#111'
        moveY.style.backgroundColor = '#111'
        transform.appendChild(moveX)
        transform.appendChild(moveY)
        popupChoice.appendChild(transform)

        const transformButtonLink = document.createElement('button')
        transformButtonLink.textContent = 'Transform'
        transformButtonLink.className = 'wide'
        transformButtonLink.onmousedown = () => {
            updateScreen = true

            let valX = Number(moveX.value)
            let valY = Number(moveY.value)
            if (!valX) valX = 0
            if (!valY) valY = 0

            const layerArr = layers[selectedLayer].arr
            for (let i = 0; i < layerArr.length; i ++) {
                const shape = layerArr[i]
                shape.x += valX
                shape.y += valY
            }

            popup.classList.remove('open')
        }
        popupChoice.appendChild(transformButtonLink)
    }
    basenavContent.appendChild(transformButton)

    const merge = document.createElement('button')
    merge.textContent = 'Merge Up'
    merge.className = 'wide'
    merge.onmouseover = () => helpChange('merge')
    merge.onmousedown = () => {
        popup.classList.add('open')

        popupText.textContent = 'Do you really want to merge this layer with the one above?'
        popupChoice.innerHTML = ''

        const div = document.createElement('div')
        div.textContent = 'This cannot be undone'
        popupChoice.appendChild(div)

        const contain = document.createElement('div')
        contain.className = 'inputContainer'
        const yes = document.createElement('button')
        yes.textContent = 'Yes'
        yes.onmousedown = () => {
            popup.classList.remove('open')

            const last = layer.previousElementSibling
            if (last) {
                deselectAll()

                const theOneAbove = layers[selectedLayer - 1].arr
                const thisOne = layers[selectedLayer].arr

                // Add all the shapes from this layer to the one above
                for (let i = 0; i < thisOne.length; i ++) {
                    // Background logic
                    const shape = thisOne[i]
                    shape.layer = selectedLayer - 1
                    theOneAbove.push(shape)

                    // Side panel
                    last.contents.appendChild(shape.div)
                }

                // Remove this layer
                layers.splice(selectedLayer, 1)
                layerDiv.removeChild(layer)

                // Shift the indices of all the shapes because this one was deleted
                for (let i = selectedLayer; i < layers.length; i ++) {
                    const item = layers[i].arr
                    for (let j = 0; j < item.length; j ++) {
                        const shape = item[j]
                        shape.layer --
                    }
                }

                selectThisLayer(layers[selectedLayer - 1].passkey)
            }
        }
        const no = document.createElement('button')
        no.textContent = 'No'
        no.onmousedown = () => {
            popup.classList.remove('open')
        }
        contain.appendChild(yes)
        contain.appendChild(no)
        popupChoice.appendChild(contain)
    }
    basenavContent.appendChild(merge)

    const deleteLayer = document.createElement('button')
    deleteLayer.className = 'wide'
    deleteLayer.style.backgroundColor = '#622'
    deleteLayer.textContent = 'Delete Layer'
    deleteLayer.onmousedown = () => {
        popup.classList.add('open')
        popupText.textContent = 'Do you really want to delete "' + layer.name.value + '"?'
        popupChoice.innerHTML = ''

        const explain = document.createElement('div')
        explain.textContent = 'All its contents will be lost! If you would not like to lose the contents of this layer, press "Cancel" and select the "Merge Up" button instead.'
        popupChoice.appendChild(explain)

        const holder = document.createElement('div')
        holder.className = 'inputContainer'
        const deleteLayerConfirm = document.createElement('button')
        deleteLayerConfirm.textContent = 'Delete'
        deleteLayerConfirm.onmousedown = () => {
            updateScreen = true

            if (layers.length > 1) {
                // Remove this layer
                layers.splice(selectedLayer, 1)
                layerDiv.removeChild(layer)

                // Shift the indices of all the remaining shapes
                for (let i = selectedLayer; i < layers.length; i ++) {
                    const item = layers[i].arr
                    for (let j = 0; j < item.length; j ++) {
                        const shape = item[j]
                        shape.layer --
                    }
                }

                if (layers[selectedLayer - 1]) selectThisLayer(layers[selectedLayer - 1].passkey)
                else if (layers[selectedLayer]) selectThisLayer(layers[selectedLayer].passkey)
            }
            else {
                layer.contents.innerHTML = ''
                layers[0].arr = []
                selectThisLayer(layers[selectedLayer].passkey)
            }
            deselectAll()

            popup.classList.remove('open')
        }
        holder.appendChild(deleteLayerConfirm)

        const cancel = document.createElement('button')
        cancel.textContent = 'Cancel'
        cancel.onmousedown = () => popup.classList.remove('open')
        holder.appendChild(cancel)

        popupChoice.appendChild(holder)
    }
    basenavContent.appendChild(deleteLayer)
}

function addNewLayer(insertIndex) {
    const dic = {arr: [], hidden: false, passkey: makePasskey()}

    // If layer already exists at index, put the old one above
    layers.splice(insertIndex, 0, dic)

    const layer = document.createElement('div')
    const header = document.createElement('div')
    const name = document.createElement('input')
    const contents = document.createElement('div')
    const collapse = document.createElement('button')
    const hide = document.createElement('button')
    const insert = document.createElement('button')
    const move = document.createElement('button')
    collapse.textContent = 'Collapse'
    hide.textContent = 'Hide'
    insert.textContent = 'New Layer'
    move.textContent = 'Sink'
    layer.sink = move

    name.value = 'Layer ' + layers.length

    layer.className = 'layer'
    layer.name = name
    layer.contents = contents
    layer.hide = hide

    header.className = 'layerHeader'
    name.className = 'layerTitle'
    contents.className = 'layerContent'

    // Select layer
    name.onmouseover = () => helpChange('layerTitle')
    name.onmousedown = () => selectThisLayer(dic.passkey)

    // LAYER OPTIONS
    collapse.state = 'small'
    collapse.onmouseover = () => helpChange('collapseLayer')
    collapse.onmousedown = () => {
        if (collapse.state == 'big') {
            contents.style.height = 'auto'
            contents.style.visibility = 'visible'
            collapse.style.backgroundColor = ''
            collapse.textContent = 'Collapse'
            collapse.state = 'small'
        }
        else {
            contents.style.height = '0'
            contents.style.visibility = 'hidden'
            collapse.style.backgroundColor = STAT_BUTTON_SELECTION_COLOR
            collapse.textContent = 'Expand'
            collapse.state = 'big'
        }
    }

    hide.onmouseover = () => helpChange('hideLayer')
    hide.onmousedown = () => {
        updateScreen = true
        if (dic.hidden) {
            dic.hidden = false
            hide.style.backgroundColor = ''
            hide.textContent = 'Hide'
        }
        else {
            dic.hidden = true
            hide.style.backgroundColor = STAT_BUTTON_SELECTION_COLOR
            hide.textContent = 'Unhide'
        }
    }

    insert.onmouseover = () => helpChange('createAfter')
    insert.onmousedown = () => {
        updateScreen = true
        deselectAll()

        selectThisLayer(dic.passkey)
        if (!dic.arr.length) return
        addNewLayer(selectedLayer + 1)
    }

    // Drop layer down
    move.onmouseover = () => helpChange('dropLayer')
    move.onmousedown = () => {
        updateScreen = true
        selectThisLayer(dic.passkey)

        const next = layer.nextElementSibling
        if (next) {
            const item = layers[selectedLayer]
            const counter = layers[selectedLayer + 1]

            layers.splice(selectedLayer, 1)
            layers.splice(selectedLayer + 1, 0, item)

            for (let i = 0; i < item.arr.length; i ++) {
                const shape = item.arr[i]
                shape.layer = selectedLayer + 1
            }

            for (let i = 0; i < counter.arr.length; i ++) {
                const shape = counter.arr[i]
                shape.layer = selectedLayer
            }

            layerDiv.insertBefore(next, layer)
        }

        selectThisLayer(dic.passkey)
        deselectAll()
    }

    header.appendChild(name)
    header.appendChild(insert)
    header.appendChild(move)
    header.appendChild(hide)
    header.appendChild(collapse)
    layer.appendChild(header)
    layer.appendChild(contents)
    layerDiv.appendChild(layer)

    const old = layerDiv.children[insertIndex]
    if (old) layerDiv.insertBefore(layer, old)

    // Select this new layer
    selectThisLayer(dic.passkey)

    // Shift the indices of all the future shapes
    for (let i = selectedLayer; i < layers.length; i ++) {
        const item = layers[i].arr
        for (let j = 0; j < item.length; j ++) {
            const shape = item[j]
            shape.layer ++
        }
    }

    return layer
}

let currentShapeInfo = 0
function applyInfoToShapePanel(div, update = false) {
    if (div == currentShapeInfo && !update) return
    currentShapeInfo = div

    const head = document.createElement('h1')
    head.textContent = div.shapeName.value
    head.className = 'center'
    basenavContent.innerHTML = ''
    basenavContent.appendChild(head)

    const contain = document.createElement('div')
    contain.className = 'inputContainer'
    const x = document.createElement('input')
    const y = document.createElement('input')
    x.placeholder = 'x'
    y.placeholder = 'y'
    x.value = div.shape.x
    y.value = div.shape.y
    x.onmouseover = () => helpChange('shapeX')
    y.onmouseover = () => helpChange('shapeY')
    x.oninput = () => div.shape.x = Number(x.value)
    y.oninput = () => div.shape.y = Number(y.value)

    contain.appendChild(x)
    contain.appendChild(y)

    const w = document.createElement('input')
    const h = document.createElement('input')
    w.placeholder = 'width'
    h.placeholder = 'height'
    w.value = div.shape.w
    h.value = div.shape.h
    w.onmouseover = () => helpChange('shapeW')
    h.onmouseover = () => helpChange('shapeH')

    w.oninput = () => {
        let W = Number(w.value)
        if (W < 0) W = 1
        div.shape.w = W
        div.shape.resize()
    }
    h.oninput = () => {
        let H = Number(h.value)
        if (H < 0) H = 1
        div.shape.h = H
        div.shape.resize()
    }

    contain.appendChild(w)
    contain.appendChild(h)

    basenavContent.appendChild(contain)

    // Move up or down
    const moveContain = document.createElement('div')
    moveContain.className = 'inputContainer'
    const moveUp = document.createElement('button')
    const moveUpImg = document.createElement('img')
    moveUpImg.id = 'up'
    moveUpImg.src = 'src/close.svg'
    moveUp.className = 'wide'
    moveUp.appendChild(moveUpImg)
    moveUp.onmouseover = () => helpChange('moveUp')
    moveUp.onmousedown = () => div.up.onmousedown()
    const moveDown = document.createElement('button')
    const moveDownImg = document.createElement('img')
    moveDownImg.id = 'down'
    moveDownImg.src = 'src/close.svg'
    moveDown.className = 'wide'
    moveDown.appendChild(moveDownImg)
    moveDown.onmouseover = () => helpChange('moveDown')
    moveDown.onmousedown = () => div.down.onmousedown()
    moveContain.appendChild(moveUp)
    moveContain.appendChild(moveDown)
    basenavContent.appendChild(moveContain)

    // Choose different layer button
    const trio = document.createElement('div')
    trio.className = 'inputContainer'
    const currentLayer = document.createElement('button')
    currentLayer.className = 'wide'
    const layerName = layerDiv.children[div.shape.layer].name.value
    currentLayer.textContent = 'Layer: ' + layerName
    currentLayer.onmouseover = () => helpChange('currentShapeLayer')
    currentLayer.onmousedown = () => {
        popupChoice.innerHTML = ''
        popupText.textContent = 'Assign shape to a different layer'

        for (let i = 0; i < layerDiv.children.length; i ++) {
            const layer = layerDiv.children[i]

            if (layer.name.value == layerName)
                continue

            const layerButton = document.createElement('button')
            layerButton.className = 'wide'
            layerButton.textContent = layer.name.value
            layerButton.onmousedown = () => {
                updateScreen = true
                deselectAll()

                // Remove shape from old layer
                const oldLayer = layers[div.shape.layer].arr
                for (let j = 0; j < oldLayer.length; j ++) {
                    const shape = oldLayer[j]
                    if (shape == div.shape) {
                        oldLayer.splice(j, 1)
                        break
                    }
                }

                // Add shape to new layer
                layers[i].arr.push(div.shape)
                layer.contents.appendChild(div)
                selectThisLayer(layers[i].passkey)
                div.shape.layer = selectedLayer

                shapeIsHovered = div.shape
                m.selection = div.shape
                applyInfoToShapePanel(div)
                popup.classList.toggle('open')
            }

            popupChoice.appendChild(layerButton)
        }

        popup.classList.toggle('open')
    }
    trio.appendChild(currentLayer)

    // Hide
    const hide = document.createElement('button')
    hide.className = 'wide'

    const checkHide = () => {
        if (div.shape.hidden) hide.textContent = 'Unhide'
        else hide.textContent = 'Hide'
    }

    checkHide()
    hide.onmouseover = () => helpChange('hideShape')
    hide.onmousedown = () => {
        div.shape.hideSelf()
        checkHide()
    }
    trio.appendChild(hide)

    // Delete
    const deleteDiv = document.createElement('button')
    deleteDiv.className = 'wide'
    deleteDiv.textContent = 'Delete'
    deleteDiv.onmouseover = () => helpChange('deleteShape')
    deleteDiv.onmousedown = () => div.shape.deleteSelf()
    trio.appendChild(deleteDiv)

    basenavContent.appendChild(trio)

    if (div.shape.imageMode) {
        // Subheading
        const image = document.createElement('h3')
        image.textContent = 'Image'
        image.className = 'center'
        basenavContent.appendChild(image)

        const dim = document.createElement('div')
        const scaleAmt = document.createElement('input')

        // Name box
        const label = document.createElement('label')
        label.className = 'uploadFileLabel'
        label.textContent = 'Choose an Image'

        const input = document.createElement('input')
        input.className = 'small'
        input.type = 'file'
        input.accept = 'image/*'
        input.style.display = 'none'
        input.onmouseover = () => helpChange('chooseShapeImage')
        input.onchange = () => {
            if (!input.files.length) return
            const file = input.files[0]
            const reader = new FileReader()

            reader.onload = e => {
                const url = e.target.result
                const image = new Image()
                image.onload = () => {
                    div.shape.image = image
                    div.shape.image.width = image.width
                    div.shape.image.height = image.height
                    dim.innerHTML = image.width + ' &times; ' + image.height

                    div.shape.imageScale = div.shape.h / image.height
                    scaleAmt.value = div.shape.imageScale

                    div.shape.drawOnShape()
                    updateScreen = true
                }
                image.src = url
            }

            reader.readAsDataURL(file)
        }
        label.appendChild(input)
        basenavContent.appendChild(label)

        // Dimensions
        basenavContent.appendChild(dim)

        // Scale
        scaleAmt.className = 'wide noGap'
        scaleAmt.value = div.shape.imageScale
        scaleAmt.onmouseover = () => helpChange('imageScale')
        scaleAmt.oninput = () => {
            div.shape.imageScale = Number(scaleAmt.value)
            div.shape.drawOnShape()
            updateScreen = true
        }
        scaleAmt.onchange = () => {
            let num = Number(scaleAmt.value)
            if (!num) num = 1
            div.shape.imageScale = num
            div.shape.drawOnShape()
            updateScreen = true
        }
        basenavContent.appendChild(scaleAmt)

        // Position
        const pos = document.createElement('div')
        pos.className = 'inputContainer'
        const xPos = document.createElement('input')
        xPos.className = 'wide noGap'
        xPos.value = div.shape.imageOftX
        xPos.onmouseover = () => helpChange('imagexPos')
        xPos.oninput = () => {
            div.shape.imageOftX = Number(xPos.value)
            div.shape.drawOnShape()
            updateScreen = true
        }
        xPos.onchange = () => {
            let num = Number(xPos.value)
            if (!num) num = 0
            div.shape.imageOftX = num
            div.shape.drawOnShape()
            updateScreen = true
        }
        pos.appendChild(xPos)

        const yPos = document.createElement('input')
        yPos.className = 'wide noGap'
        yPos.value = div.shape.imageOftY
        yPos.onmouseover = () => helpChange('imageyPos')
        yPos.oninput = () => {
            div.shape.imageOftY = Number(yPos.value)
            div.shape.drawOnShape()
            updateScreen = true
        }
        yPos.onchange = () => {
            let num = Number(yPos.value)
            if (!num) num = 0
            div.shape.imageOftY = num
            div.shape.drawOnShape()
            updateScreen = true
        }
        pos.appendChild(yPos)

        basenavContent.appendChild(pos)

        // Opacity slider
        const slider = document.createElement('input')
        slider.type = 'range'
        slider.min = '0'
        slider.max = '1'
        slider.step = '.01'
        slider.value = div.shape.opacity
        slider.className = 'slider noGap'
        slider.onload = () => slider.value = div.shape.opacity
        slider.onmouseover = () => helpChange('opacitySlider')
        slider.oninput = () => {
            div.shape.opacity = Number(slider.value)
            div.shape.drawOnShape()
            updateScreen = true
        }
        basenavContent.appendChild(slider)

        // Change image mode
        const mode = document.createElement('button')
        mode.textContent = 'Back to Shape Mode'
        mode.className = 'wide'
        mode.onmouseover = () => helpChange('shapeMode')
        mode.onmousedown = () => {
            div.shape.imageMode = false
            div.shape.drawOnShape()
            applyInfoToShapePanel(div, true)
            updateScreen = true
        }
        basenavContent.appendChild(mode)
    }

    else {
        // Subheading
        const textures = document.createElement('h3')
        textures.textContent = 'Textures'
        textures.className = 'center'
        basenavContent.appendChild(textures)

        // Color picker
        const colorContain = document.createElement('div')
        colorContain.className = 'inputContainer'

        const color = document.createElement('button')
        color.className = 'colorPick'

        const colorText = document.createElement('div')
        colorText.textContent = color.style.backgroundColor
        color.appendChild(colorText)
        colorContain.appendChild(color)

        // Set colour as default
        const defaultColorButton = document.createElement('button')
        defaultColorButton.textContent = 'Save Default Colour'
        defaultColorButton.className = 'wide'
        defaultColorButton.id = 'small'
        defaultColorButton.onmouseover = () => helpChange('defaultColorButton')
        defaultColorButton.onmousedown = () => {
            popup.classList.add('open')
            popupText.textContent = 'Do you want to set this colour as default?'
            popupChoice.innerHTML = ''

            const cont = document.createElement('div')
            cont.className = 'inputContainer'

            const yes = document.createElement('button')
            yes.textContent = 'Yes'
            yes.onmousedown = () => {
                popup.classList.remove('open')
                defaultColor = [div.shape.color[0], div.shape.color[1], div.shape.color[2]]
                settingColor.style.backgroundColor = color.style.backgroundColor
                randomBrushContain.classList.remove('checked')
                randomBrush.checked = false
                defaultBrush.checked = true
            }
            cont.appendChild(yes)

            const no = document.createElement('button')
            no.textContent = 'No'
            no.onmousedown = () => popup.classList.remove('open')
            cont.appendChild(no)

            popupChoice.appendChild(cont)
        }
        colorContain.appendChild(defaultColorButton)

        const setMainPick = () => {
            const colorString = 'rgb('+div.shape.color[0]+','+div.shape.color[1]+','+div.shape.color[2]+')'
            color.style.backgroundColor = colorString
            colorText.textContent = colorString

            const r = div.shape.color[0] * .3
            const g = div.shape.color[1] * .59
            const b = div.shape.color[2] * .11
            if (r + g + b < 128) colorText.className = 'light'
            else colorText.className = ''
        }
        setMainPick()

        color.onmouseover = () => helpChange('colorPick')
        color.onmousedown = () => {
            popup.classList.add('open')
            popupText.textContent = 'Choose a colour for this shape'
            popupChoice.innerHTML = ''

            const chosenColor = document.createElement('div')
            chosenColor.className = 'colorPick'
            popupChoice.appendChild(chosenColor)

            const setBackgroundColor = () => {
                const colorString = 'rgb('+Number(r.value)+','+Number(g.value)+','+Number(b.value)+')'
                chosenColor.style.backgroundColor = colorString
            }

            const rgb = document.createElement('div')
            rgb.className = 'inputContainer'
            const r = document.createElement('input')
            const g = document.createElement('input')
            const b = document.createElement('input')
            r.style.backgroundColor = '#111'
            g.style.backgroundColor = '#111'
            b.style.backgroundColor = '#111'
            r.placeholder = 'Red'
            g.placeholder = 'Green'
            b.placeholder = 'Blue'
            r.value = div.shape.color[0]
            g.value = div.shape.color[1]
            b.value = div.shape.color[2]
            const restrict = val => {
                val.value = val.value.replace(/\D/g, '')
                if (Number(val.value) > 255) val.value = 255
                setBackgroundColor(chosenColor)
            }
            r.oninput = () => restrict(r)
            g.oninput = () => restrict(g)
            b.oninput = () => restrict(b)
            rgb.appendChild(r)
            rgb.appendChild(g)
            rgb.appendChild(b)
            popupChoice.appendChild(rgb)

            setBackgroundColor(chosenColor)

            const ok = document.createElement('button')
            ok.textContent = 'Okay'
            ok.onmousedown = () => {
                updateScreen = true
                popup.classList.remove('open')
                div.shape.color[0] = Number(r.value)
                div.shape.color[1] = Number(g.value)
                div.shape.color[2] = Number(b.value)
                if (div.shape.remixes[div.shape.activeRemix].code == codes[0].code)
                    div.shape.drawOnShape()
                setMainPick()
            }
            popupChoice.appendChild(ok)
        }
        basenavContent.appendChild(colorContain)

        if (!div.shape.line) {
            // Preset box
            const presets = document.createElement('div')
            presets.className = 'inputContainer'
            const presetListButton = document.createElement('button')
            presetListButton.className = 'wide'
            presetListButton.style.backgroundColor = 'var(--notice)'
            presetListButton.textContent = 'Template: ' + codes[div.shape.activePreset].name
            presetListButton.onmouseover = () => helpChange('presetList')
            presetListButton.onmousedown = () => {
                popup.classList.add('open')
                popupChoice.innerHTML = ''
                popupText.textContent = 'Choose an available template'

                for (let i = 0; i < codes.length; i ++) {
                    const code = codes[i]
                    const button = document.createElement('button')
                    button.className = 'wide'
                    button.textContent = code.name
                    button.onmousedown = () => {
                        popup.classList.remove('open')
                        div.shape.addRemix(code, i)
                        applyInfoToShapePanel(div, true)
                        div.shape.drawOnShape()
                    }
                    popupChoice.appendChild(button)
                }
            }
            presets.appendChild(presetListButton)

            const remixListButton = document.createElement('button')
            remixListButton.className = 'wide'
            remixListButton.textContent = 'Remix: ' + div.shape.remixes[div.shape.activeRemix].name
            remixListButton.onmouseover = () => helpChange('remixList')
            remixListButton.onmousedown = () => {
                popup.classList.add('open')
                popupChoice.innerHTML = ''
                popupText.textContent = 'Choose one of your remixes'

                for (let i = 0; i < div.shape.remixes.length; i ++) {
                    const code = div.shape.remixes[i]
                    const button = document.createElement('button')
                    button.className = 'wide'
                    button.textContent = code.name
                    button.onmousedown = () => {
                        popup.classList.remove('open')
                        div.shape.activeRemix = i
                        div.shape.activePreset = code.preset
                        applyInfoToShapePanel(div, true)
                    }
                    popupChoice.appendChild(button)
                }
            }
            presets.appendChild(remixListButton)

            basenavContent.appendChild(presets)

            // Save preset as default
            const asDefault = document.createElement('button')
            const name = codes[div.shape.activePreset].name
            asDefault.textContent = 'Set "' + name + '" as default'
            asDefault.className = 'wide'
            asDefault.onmouseover = () => helpChange('asDefault')
            asDefault.onmousedown = () => {
                popup.classList.add('open')

                popupText.textContent = 'Set "' + name + '" as Default'
                popupChoice.innerHTML = ''

                // Confirm text
                const confirm = document.createElement('div')
                confirm.textContent = 'From now on, all shapes will be given the "' + name + '" template as default.'
                popupChoice.appendChild(confirm)

                // Confirm
                const ok = document.createElement('button')
                ok.className = 'wide'
                ok.textContent = 'Confirm'
                ok.onmousedown = () => {
                    defaultTemplate = div.shape.activePreset
                    popup.classList.remove('open')
                }
                popupChoice.appendChild(ok)

                // Cancel
                const cancel = document.createElement('button')
                cancel.className = 'wide'
                cancel.textContent = 'Cancel'
                cancel.onmousedown = () => popup.classList.remove('open')
                popupChoice.appendChild(cancel)
            }
            basenavContent.appendChild(asDefault)

            // Overall code box
            const codeContain = document.createElement('div')
            codeContain.className = 'codeContain'

            // Function text
            const codeName = document.createElement('div')
            codeName.innerHTML = '<span style="color:var(--keyword)">function</span> <span style="color:var(--function)">draw</span><span style="color:var(--operator)">(</span><span style="color:var(--variable)">x</span>, <span style="color:var(--variable)">y</span>, <span style="color:var(--variable)">color</span><span style="color:var(--operator)">)</span> <span style="color:var(--operator)">{</span>'
            codeContain.appendChild(codeName)

            // Textarea code box
            const codeDiv = document.createElement('div')
            codeDiv.className = 'trueCodeContainer'

            const codePre = document.createElement('pre')
            const codeTextarea = document.createElement('textarea')

            codeTextarea.value = div.shape.remixes[div.shape.activeRemix].code
            codeTextarea.className = 'codeTextarea'

            codeTextarea.onmouseover = () => helpChange('codeTextarea')
            const change = () => {
                // Syntax highlight
                codePre.innerHTML = syntaxHighlightJavaScriptCode(codeTextarea.value)

                // Set background code
                div.shape.remixes[div.shape.activeRemix].code = codeTextarea.value
            }
            codeTextarea.oninput = () => change()
            change()

            codeTextarea.onscroll = () => {
                codePre.scrollTop = codeTextarea.scrollTop
                codePre.scrollLeft = codeTextarea.scrollLeft
            }

            codeDiv.appendChild(codePre)
            codeDiv.appendChild(codeTextarea)

            codeContain.appendChild(codeDiv)
            basenavContent.appendChild(codeContain)

            const ending = document.createElement('div')
            ending.innerHTML = '<span style="color:var(--operator)">}</span>'
            codeContain.appendChild(ending)

            // Error
            const error = document.createElement('div')
            error.className = 'error'
            div.error = error
            basenavContent.appendChild(error)

            // Run code
            const runCode = document.createElement('button')
            runCode.className = 'bright'
            runCode.textContent = 'Apply Texture'
            runCode.onmouseover = () => helpChange('applyTexture')
            runCode.onmousedown = () => div.shape.drawOnShape()
            basenavContent.appendChild(runCode)

            // Set remix as preset
            const toPreset = document.createElement('button')
            toPreset.textContent = 'Save this code as a template'
            toPreset.className = 'wide'
            toPreset.onmouseover = () => helpChange('saveAsPreset')
            toPreset.onmousedown = () => {
                popup.classList.add('open')

                popupText.textContent = 'Save as a template'
                popupChoice.innerHTML = ''

                // Confirm
                const ok = document.createElement('button')
                ok.className = 'wide'
                ok.textContent = 'Confirm'
                ok.style.opacity = '0'
                ok.style.padding = '0'
                ok.style.transitionDuration = '.6s'

                // Name box
                const input = document.createElement('input')
                input.style.backgroundColor = '#111'
                input.className = 'wide'
                input.placeholder = 'Name this template'
                input.oninput = () => {
                    if (input.value.length) {
                        ok.style.opacity = '1'
                        ok.style.padding = '10px'
                    }
                    else {
                        ok.style.opacity = '0'
                        ok.style.padding = '0'
                    }
                }
                popupChoice.appendChild(input)

                // Confirm text
                const div = document.createElement('div')
                div.textContent = 'You are adding this texture to the list of templates. Any shape in CanvasCraft will be able to access it.'
                popupChoice.appendChild(div)

                // Confirm button
                ok.onmousedown = () => {
                    if (!input.value.length) return
                    popup.classList.remove('open')
                    codes.push({name: input.value, code: codeTextarea.value})
                }

                popupChoice.appendChild(ok)
            }
            basenavContent.appendChild(toPreset)

            // Change image mode
            const image = document.createElement('button')
            image.textContent = 'Image Mode'
            image.className = 'wide'
            image.onmouseover = () => helpChange('image')
            image.onmousedown = () => {
                div.shape.imageMode = true
                div.shape.drawOnShape()
                applyInfoToShapePanel(div, true)
                updateScreen = true
            }
            basenavContent.appendChild(image)
        }

        else {
            const thick = document.createElement('input')
            thick.placeholder = 'Line thickness'
            thick.className = 'wide noGap'
            thick.value = div.shape.lineThick
            thick.onmouseover = () => helpChange('lineThickness')
            thick.oninput = () => {
                let number = Number(thick.value)
                if (!number) number = DEFAULT_LINE_THICK
                div.shape.lineThick = number
                lineThickness = number
            }
            basenavContent.appendChild(thick)
        }
    }

    // Subheading
    const properties = document.createElement('h3')
    properties.className = 'center'
    properties.textContent = 'Properties'
    basenavContent.appendChild(properties)

    const checkDefProperty = () => {
        if (property.value.length || !defaultProperty.length)
            defProperty.textContent = 'Set this property as default'
        else defProperty.textContent = 'Clear default property'
    }

    // Add properties
    const property = document.createElement('input')
    property.placeholder = 'Give this shape a property'
    property.className = 'wide noGap'
    property.value = div.shape.property
    property.onmouseover = () => helpChange('property')
    property.oninput = () => {
        div.shape.property = property.value
        checkDefProperty()
    }
    basenavContent.appendChild(property)

    // Default properties
    const defProperty = document.createElement('button')
    checkDefProperty()
    defProperty.className = 'wide'
    defProperty.onmouseover = () => helpChange('defProperty')
    defProperty.onmousedown = () => {
        popup.classList.add('open')
        popupChoice.innerHTML = ''

        const confirmDiv = document.createElement('div')
        const choices = document.createElement('div')
        choices.className = 'inputContainer'
        const yes = document.createElement('button')
        const no = document.createElement('button')
        const code1 = document.createElement('div')
        const code2 = document.createElement('div')
        code1.textContent = defaultProperty
        code2.textContent = property.value
        code1.className = 'code'
        code2.className = 'code'

        no.textContent = 'Cancel'

        yes.onmousedown = () => {
            popup.classList.remove('open')
            defaultProperty = property.value
        }

        no.onmousedown = () => popup.classList.remove('open')

        if (property.value.length) {
            if (defaultProperty.length) {
                if (defaultProperty == property.value) {
                    popupText.textContent = 'Confirm the default property'

                    confirmDiv.innerHTML = 'The property '
                    confirmDiv.appendChild(code1)
                    confirmDiv.innerHTML += ' is already default!'

                    yes.textContent = 'Okay'
                }

                else {
                    popupText.textContent = 'Replace the default property'

                    confirmDiv.innerHTML = 'You are replacing the default property '
                    confirmDiv.appendChild(code1)
                    confirmDiv.innerHTML += ' with '
                    confirmDiv.appendChild(code2)
                    confirmDiv.innerHTML += '. Do you really want to do this?'

                    yes.textContent = 'Replace'
                }
            }
            else {
                popupText.textContent = 'Save a new property'

                confirmDiv.innerHTML = 'You are saving '
                confirmDiv.appendChild(code2)
                confirmDiv.innerHTML += ' as default'

                yes.textContent = 'Save'
            }
        }
        else {
            if (defaultProperty.length) {
                popupText.textContent = 'Clear the default property'

                confirmDiv.innerHTML = 'You are clearing the default property '
                confirmDiv.appendChild(code1)
                confirmDiv.innerHTML += '. Do you want to do this?'

                yes.textContent = 'Clear'
            }
            else {
                popupText.textContent = 'Save a new property'
                confirmDiv.textContent = 'You are saving an empty property as default'
                yes.textContent = 'Yes'
            }
        }

        popupChoice.appendChild(confirmDiv)
        choices.appendChild(yes)
        choices.appendChild(no)
        popupChoice.appendChild(choices)
    }
    basenavContent.appendChild(defProperty)
}

function createShape(shape) {
    const layer = layers[shape.layer].arr
    // Add shape to end of layer
    layer.push(shape)

    // Select current layer in side panel
    selectThisLayer(layers[shape.layer].passkey, true)

    // Add side panel options
    const div = document.createElement('div')
    const state = document.createElement('span')
    state.className = 'state'
    state.onmouseover = () => helpChange('state')
    div.state = state

    div.onmousedown = () => {
        selectThisLayer(layers[shape.layer].passkey, true)

        shapeIsHovered = shape
        m.selection = shape
        updateScreen = true

        applyInfoToShapePanel(div)
    }

    const shapeName = document.createElement('input')
    shapeName.className = 'shapeName'
    if (shape.line) shapeName.value = 'Line ' + layer.length
    else shapeName.value = 'Shape ' + layer.length

    shapeName.oninput = () => {
        applyInfoToShapePanel(div, true)
    }
    shapeName.onmouseover = () => {
        helpChange('shape')
        updateScreen = true
        shape.hoverCommand = true
    }
    shapeName.onmouseleave = () => {
        updateScreen = true
        shape.hoverCommand = false
    }

    div.className = 'shape'
    div.shapeName = shapeName
    div.appendChild(shapeName)
    div.appendChild(state)

    // BUTTON OPTIONS
    const buttons = document.createElement('div')
    buttons.className = 'buttons'

    const up = document.createElement('button')
    const upIcon = document.createElement('img')
    upIcon.src = 'src/close.svg'
    upIcon.id = 'up'
    div.up = up
    up.className = 'smallButton'
    up.appendChild(upIcon)
    up.onmouseover = () => helpChange('moveUp')
    up.onmousedown = () => {
        const updated = layers[shape.layer].arr
        for (let i = 0; i < updated.length; i ++) {
            const newPasskey = updated[i].passkey
            if (newPasskey == shape.passkey) {
                if (i) {
                    // Move in array
                    const counter = updated[i - 1]
                    updated[i - 1] = shape
                    updated[i] = counter

                    // Move in side panel
                    const divCounter = layerDiv.children[shape.layer].contents.children[i - 1]
                    layerDiv.children[shape.layer].contents.insertBefore(div, divCounter)
                }
                break
            }
        }
    }

    const down = document.createElement('button')
    const downIcon = document.createElement('img')
    downIcon.src = 'src/close.svg'
    downIcon.id = 'down'
    div.down = down
    down.className = 'smallButton'
    down.appendChild(downIcon)
    down.onmouseover = () => helpChange('moveDown')
    down.onmousedown = () => {
        const updated = layers[shape.layer].arr
        for (let i = 0; i < updated.length; i ++) {
            const newPasskey = updated[i].passkey
            if (newPasskey == shape.passkey) {
                if (i < updated.length - 1) {
                    // Move in array
                    const counter = updated[i + 1]
                    updated[i + 1] = shape
                    updated[i] = counter

                    // Move in side panel
                    const divCounter = layerDiv.children[shape.layer].contents.children[i + 1]
                    layerDiv.children[shape.layer].contents.insertBefore(divCounter, div)
                }
                break
            }
        }
    }

    div.buttonUp = up
    div.buttonDown = down

    buttons.appendChild(up)
    buttons.appendChild(down)
    div.appendChild(buttons)

    shape.div = div
    div.shape = shape

    // Also add to layer in side panel
    layerDiv.children[shape.layer].contents.appendChild(div)

    // Apply info to shape panel
    applyInfoToShapePanel(div)
}

function deleteShape(shape, layer, index, tooSmall = false) {
    layer.splice(index, 1)

    if (shape.div)
        layerDiv.children[shape.layer].contents.removeChild(shape.div)

    if (!tooSmall) deselectAll()
    basenavContent.innerHTML = NO_INFO
}