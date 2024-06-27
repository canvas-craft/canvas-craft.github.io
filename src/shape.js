'use strict'

class Shape {
    constructor(x, y, w = 0, h = 0) {
        this.line = shapeToggle.line
        this.lineThick = lineThickness
        this.invertX = 1
        this.invertY = 1
        this.x = x
        this.y = y
        this.w = w
        this.h = h
        this.hover = 0
        this.select = 0
        this.outlineSpeed = .1
        this.hidden = false

        this.shorthand = {}
        this.div = 0
        this.hoverCommand = false
        this.layer = selectedLayer
        this.passkey = makePasskey()

        this.property = defaultProperty

        const rand = () => {return Math.floor(Math.random() * 255)}
        if (randomBrush.checked) this.color = [rand(), rand(), rand()]
        else this.color = [defaultColor[0], defaultColor[1], defaultColor[2]]

        this.activeRemix = 0
        this.activePreset = defaultTemplate
        this.remixes = []
        this.addRemix(codes[defaultTemplate], this.activePreset)

        this.runX = 0
        this.runY = 0
        this.error = false
        this.running = false
        this.override = false
        this.cvs = document.createElement('canvas')
        this.ctx = this.cvs.getContext('2d')
        this.cvs.width = 1
        this.cvs.height = 1
        this.drawOnShape(true)
    }

    deleteSelf() {
        m.press = false

        popupText.textContent = 'Do you want to delete this shape?'

        const contents = document.createElement('div')
        contents.className = 'inputContainer'
        const yes = document.createElement('button')
        const no = document.createElement('button')
        contents.appendChild(yes)
        contents.appendChild(no)
        yes.textContent = 'Delete'
        no.textContent = 'Cancel'
        yes.onmousedown = () => {
            for (let i = 0; i < layers.length; i ++) {
                const layer = layers[i].arr
                for (let j = 0; j < layer.length; j ++) {
                    if (layer[j] == this) {
                        deleteShape(this, layer, j)
                        break
                    }
                }
            }
            m.rightClick = false
            m.press = false
            m.creation = 0
            m.movingShape = 0
            m.selection = 0
            popup.classList.remove('open')
        }
        no.onmousedown = () => popup.classList.remove('open')
        popupChoice.innerHTML = ''
        popupChoice.appendChild(contents)

        popup.classList.add('open')
    }

    hideSelf() {
        m.press = false
        if (this.hidden) {
            this.hidden = false
            this.div.state.textContent = ''
        }
        else {
            this.hidden = true
            this.div.state.textContent = '/'
        }
    }

    addRemix(code, i) {
        this.activePreset = i
        const newName = code.name + ' ' + this.remixes.length + 1
        this.remixes.push({name: newName, code: code.code, preset: this.activePreset})
        this.activeRemix = this.remixes.length - 1
    }

    draw() {
        const pos = pixel(this.x, this.y)
        if (this.hoverCommand) shapeIsHovered = this

        // HOVER OUTLINE
        const range = scale

        const hoverThin = this.line && (
            m.x > pos.x - range && m.x < pos.x + this.w * scale + range &&
            m.y > pos.y - range && m.y < pos.y + this.h * scale + range)

        const hoverNorm = m.x > pos.x && m.x < pos.x + this.w * scale &&
            m.y > pos.y && m.y < pos.y + this.h * scale

        this.hover -= this.outlineSpeed
        const hoverReady =
            !m.creation && !m.rightClick &&
            !m.movingShape && !hoveringShorthand &&
            (hoverNorm || hoverThin)

        if (hoverReady) {
            if (this.layer != selectedLayer) {if (this.hover <= 0) helpChange('shapeBadLayer')}
            else {
                if (this.hover <= 0) {
                    if (this.select > 0) helpChange('shapeSelected')
                    else helpChange('shape')
                }
                shapeIsHovered = this

                // Just in case, we disable panel hover if already hovering actual shape
                this.hoverCommand = false
            }
        }

        if (this.hover > 0) {
            updateScreen = true
            const thick = quad(this.hover) * SELECTION_THICKNESS
            ctx.lineWidth = thick
            ctx.strokeStyle = HOVER_COLOR
            ctx.strokeRect(
                pos.x - thick / 2,
                pos.y - thick / 2,
                this.w * scale + thick,
                this.h * scale + thick)
        }
        else this.hover = 0

        // SELECTION OUTLINE
        if (this.select > 0) {
            updateScreen = true
            selectedShapes.push(this)

            // SHORTHAND OPTIONS
            const gap = 20
            const progress = quad(this.select)
            this.shorthand = []

            const box = (X, icon, func) => {
                let sh = 70 * progress
                const shrink = .47
                const x = pos.x + this.w / 2 * scale + X * (gap + sh) * shrink
                const y = pos.y - progress * (gap + sh / 2)
                const BOX = {}

                if (progress >= 1 &&
                    m.x > x - sh / 2 && m.x < x + sh / 2 &&
                    m.y > y - sh / 2 && m.y < y + sh / 2) {
                    hoveringShorthand = true
                    if (m.press && !m.creation && !m.rightClick && !m.movingShape) {
                        shapeIsHovered = this
                        func()
                    }
                    BOX.color = 'rgb(0, 255, 200, ' + progress + ')'
                    const grow = 1.1
                    sh *= grow
                }
                else BOX.color = 'rgb(255, 255, 255, ' + progress + ')'

                BOX.x = x - sh / 2
                BOX.y = y - sh / 2
                BOX.s = sh
                BOX.icon = icon
                this.shorthand.push(BOX)
            }
            box(-2, 'move', () => {
                const pos = world(m.x, m.y)
                m.moveOffset.x = this.x - pos.x
                m.moveOffset.y = this.y - pos.y
                m.movePos = {x: this.x, y: this.y}
                m.movingShape = this
            })
            box(0, 'hide', () => this.hideSelf())
            box(2, 'remove', () => this.deleteSelf())

            const thick = progress * SELECTION_THICKNESS
            ctx.lineWidth = thick
            ctx.strokeStyle = SELECTION_COLOR
            ctx.strokeRect(
                pos.x - thick / 2,
                pos.y - thick / 2,
                this.w * scale + thick,
                this.h * scale + thick)
        }
        else this.select = 0

        if (m.selection == this) {
            this.select += this.outlineSpeed
            if (this.select > 1) this.select = 1
        }
        else this.select -= this.outlineSpeed

        // SET DIV COLOR
        this.div.buttonUp.style.backgroundColor = ''
        this.div.buttonDown.style.backgroundColor = ''
        if (shapeIsHovered == this) this.div.shapeName.style.color = STAT_HOVER_COLOR
        else this.div.shapeName.style.color = ''

        if (this.hidden) return

        this.drawShape()
    }

    drawOnShape(init = false) {
        if (this.line) return

        // If shape is already rendering and needs to start again, reset the coordinates
        if (this.running) {
            this.ctx.clearRect(0, 0, this.w, this.h)
            this.runX = 0
            this.runY = -1
            return
        }

        if (this.w > 0) this.cvs.width = this.w
        if (this.h > 0) this.cvs.height = this.h
        this.ctx.clearRect(0, 0, this.w, this.h)

        const plainColor = 'rgb('+this.color[0]+','+this.color[1]+','+this.color[2]+')'
        const drawPlain = () => {
            this.runX = 0
            this.runY = 0
            this.ctx.fillStyle = plainColor
            this.ctx.fillRect(0, 0, this.cvs.width, this.cvs.height)
        }

        // If shape has just been created, fill plain colour
        // Don't bother rendering each pixel if the colour is going to be plain
        if (init || codes[0].code == this.remixes[this.activeRemix].code) {
            drawPlain()
            return
        }

        // Default function without code applied
        let fillFunction = (x, y, color) => {return plainColor}

        // Add code to function
        const calculateFillFunction = () => {
            try {
                let func = new Function('x', 'y', 'color', this.remixes[this.activeRemix].code)
                fillFunction = (x, y, color) => {
                    try {
                        return func(x, y, color)
                    }

                    // Runtime error check
                    catch (error) {
                        func = (x, y, color) => {return plainColor}
                        this.error = true
                        drawPlain()
                        this.div.error.textContent = 'Error: ' + error.message
                    }
                }
            }

            // Syntax error check
            catch (error) {
                this.error = true
                drawPlain()
                this.div.error.textContent = 'Error: ' + error.message
            }
        }
        const drawPixels = (x, y) => {
            let iterations = 0

            // Go through every pixel from where it left off
            for (this.runX = x; this.runX < this.cvs.width; this.runX ++) {
                for (this.runY = y; this.runY < this.cvs.height; this.runY ++) {
                    y = 0
                    this.running = true

                    // Calculate how to draw the shape at the start
                    if (this.runX <= 0 && this.runY <= 0) calculateFillFunction()

                    // Run the function for every pixel
                    this.ctx.fillStyle = fillFunction(
                        this.runX, this.runY,
                        {r: this.color[0], g: this.color[1], b: this.color[2]})
                    this.ctx.fillRect(this.runX, this.runY, 1, 1)

                    // Canel process if at end
                    if (this.runY >= this.cvs.height - 1 &&
                        this.runX >= this.cvs.width - 1 ||
                        this.error) {
                        this.running = false
                        break
                    }

                    // Check if ready for next frame
                    iterations ++
                    if (iterations >= drawIterations)
                        return setTimeout(() => {
                            iterations = 0
                            let nextY = this.runY + 1
                            if (nextY > this.cvs.height - 1) nextY = this.cvs.height - 1
                            drawPixels(this.runX, nextY)
                            updateScreen = true
                        }, 16)
                }
            }
        }

        this.div.error.textContent = ''
        this.error = false
        drawPixels(0, 0)
    }

    drawShape() {
        if (this.line) {
            const X = this.invertX
            const Y = this.invertY

            const pos1 = pixel(
                this.x + this.w / 2 + (this.w / 2) * X,
                this.y + this.h / 2 + (this.h / 2) * Y)
            const pos2 = pixel(
                this.x + this.w / 2 - (this.w / 2) * X,
                this.y + this.h / 2 - (this.h / 2) * Y)

            ctx.beginPath()
            ctx.strokeStyle = 'rgb('+this.color[0]+','+this.color[1]+','+this.color[2]+')'
            ctx.lineWidth = this.lineThick
            ctx.moveTo(pos1.x, pos1.y)
            ctx.lineTo(pos2.x, pos2.y)
            ctx.stroke()
        }
        else img(this.cvs, this.x, this.y, this.w, this.h)
    }

    updateDiv() {
        this.div.shapeName.style.color = STAT_SELECTION_COLOR
        this.div.buttonUp.style.backgroundColor = STAT_BUTTON_SELECTION_COLOR
        this.div.buttonDown.style.backgroundColor = STAT_BUTTON_SELECTION_COLOR

        const str = this.hidden ? '/' : ''
        this.div.state.textContent = str
        if ((!this.line && (!this.w || !this.h)) ||
            isNaN(this.x) || isNaN(this.y) ||
            isNaN(this.w) || isNaN(this.h))
            this.div.state.textContent = '* ' + str

        applyInfoToShapePanel(this.div)
    }

    drawShorthand() {
        const pad = 7

        for (let i = 0; i < this.shorthand.length; i ++) {
            const box = this.shorthand[i]
            ctx.fillStyle = box.color

            ctx.fillRect(box.x, box.y, box.s, box.s)

            const imgSize = Math.max(0, box.s - pad * 2)
            ctx.drawImage(
                icons[box.icon],
                box.x + pad, box.y + pad,
                imgSize, imgSize)
        }
    }
}