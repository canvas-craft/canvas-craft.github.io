'use strict'

function generateDownloadFile() {
    const save = {}
    save.version = 'canvasCraft-v2.0.0-beta.1.6'
    save.codes = codes
    save.layers = []

    for (let i = 0; i < layers.length; i ++) {
        save.layers.push({arr: [], hidden: layers[i].hidden, name: layerDiv.children[i].name.value})

        const layer = layers[i].arr
        for (let j = 0; j < layer.length; j ++) {
            const shape = layer[j]
            const dic = {
                x: shape.x,
                y: shape.y,
                w: shape.w,
                h: shape.h,
                name: shape.div.shapeName.value,
                line: shape.line,
                lineThick: shape.lineThick,
                invertX: shape.invertX,
                invertY: shape.invertY,
                imageMode: shape.imageMode,
                opacity: shape.opacity,
                imageOftX: shape.imageOftX,
                imageOftY: shape.imageOftY,
                imageScale: shape.imageScale,
                color: shape.color,
                hidden: shape.hidden,
                property: shape.property,
                activeRemix: shape.activeRemix,
                activePreset: shape.activePreset,
                remixes: shape.remixes
            }

            dic.base64 = {image: false, url: false}
            if (shape.image) {
                const canvas = document.createElement('canvas')
                const context = canvas.getContext('2d')
                canvas.width = shape.image.width
                canvas.height = shape.image.height
                context.drawImage(shape.image, 0, 0, canvas.width, canvas.height)
                dic.base64 = {image: true, url: canvas.toDataURL()}
            }

            save.layers[i].arr.push(dic)
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
                newShape.imageMode = shape.imageMode
                newShape.opacity = shape.opacity
                newShape.imageOftX = shape.imageOftX
                newShape.imageOftY = shape.imageOftY
                newShape.imageScale = shape.imageScale
                newShape.color = shape.color
                if (shape.hidden) newShape.hideSelf()
                newShape.property = shape.property
                newShape.activeRemix = shape.activeRemix
                newShape.activePreset = shape.activePreset
                newShape.remixes = shape.remixes
                newShape.div.shapeName.value = shape.name

                if (shape.base64) {
                    const img = new Image()
                    img.onload = () => {
                        newShape.image = img
                        newShape.image.width = img.width
                        newShape.image.height = img.height

                        if (shape.imageMode) {
                            newShape.drawOnShape()
                            newShape.draw()
                            updateScreen = true
                        }
                    }
                    img.src = shape.base64.url
                }

                newShape.drawOnShape()
                newShape.draw()
            }
        }

        updateScreen = true
    }

    reader.readAsText(file)
}