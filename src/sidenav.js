'use strict'

const sidenav = document.getElementById('right')
const basenav = document.getElementById('base')
const basenavContent = document.getElementById('baseContent')

const handle = document.getElementById('hideRight')
const handleBase = document.getElementById('hideBase')
const handleBaseLarge = document.getElementById('hideBaseLarge')

const layerDiv = document.getElementById('layers')
const layerSwitch = document.getElementById('layerSwitch')

layerSwitch.onmouseover = () => helpChange('closeList')
handle.onmouseover = () => helpChange('closeRight')
handleBase.onmouseover = () => helpChange('closeShapes')

function sideHandle() {
    sidenav.classList.toggle('closed')
    resize()
}

function baseHandle(large = false) {
    if (large) {
        if (handleBaseLarge.classList.contains('flip')) {
            handleBaseLarge.classList.remove('flip')
            basenav.style.height = '50%'
        }
        else {
            handleBaseLarge.classList.add('flip')
            basenav.style.height = '100%'
        }
    }
    else {
        basenav.classList.toggle('closed')
        basenav.style.height = '50%'

        if (basenav.classList.contains('closed'))
            handleBaseLarge.classList.add('flip')
        else handleBaseLarge.classList.remove('flip')
    }

    resize()
}