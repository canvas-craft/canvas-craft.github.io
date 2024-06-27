'use strict'

function generateDownloadFile() {
    const save = {}
    save.codes = codes
    save.layers = []

    for (let i = 0; i < layers.length; i ++) {
        save.layers.push({arr: [], hidden: layers[i].hidden, name: layerDiv.children[i].name.value})

        const layer = layers[i].arr
        for (let j = 0; j < layer.length; j ++) {
            const shape = layer[j]
            save.layers[i].arr.push({
                x: shape.x,
                y: shape.y,
                w: shape.w,
                h: shape.h,
                line: shape.line,
                lineThick: shape.lineThick,
                invertX: shape.invertX,
                invertY: shape.invertY,
                color: shape.color,
                hidden: shape.hidden,
                property: shape.property,
                activeRemix: shape.activeRemix,
                activePreset: shape.activePreset,
                remixes: shape.remixes
            })
        }
    }

    const name = 'canvasCraft' + randomStr() + '.json'
    const data = JSON.stringify(save)
    const file = new File([data], name, {type: 'application/json'})

    const a = document.createElement('a')
    const url = URL.createObjectURL(file)
    a.href = url
    a.download = name
    a.click()
}

function generateUploadFile(item) {
    if (!item.files.length) return
    const file = item.files[0]
    const reader = new FileReader()
    layers = []

    reader.onload = () => {
        const save = JSON.parse(reader.result)
        if (!save.layers.length) return
        codes = save.codes
        layerDiv.innerHTML = ''

        for (let i = 0; i < save.layers.length; i ++) {
            const layer = save.layers[i]

            const elem = addNewLayer(save.layers.length)
            elem.name.value = layer.name
            if (layer.hidden) elem.hide.onmousedown()

            for (let j = 0; j < layer.arr.length; j ++) {
                const shape = layer.arr[j]
                const newShape = new Shape(shape.x, shape.y, shape.w, shape.h)
                createShape(newShape)

                newShape.line = shape.line
                newShape.lineThick = shape.lineThick
                newShape.invertX = shape.invertX
                newShape.invertY = shape.invertY
                newShape.color = shape.color
                if (shape.hidden) newShape.hideSelf()
                newShape.property = shape.property
                newShape.activeRemix = shape.activeRemix
                newShape.activePreset = shape.activePreset
                newShape.remixes = shape.remixes

                newShape.drawOnShape()
                newShape.draw()
            }
        }

        updateScreen = true
    }

    reader.readAsText(file)
}