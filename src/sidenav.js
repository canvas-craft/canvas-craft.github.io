'use strict'

const sidenav = document.getElementById('right')
const basenav = document.getElementById('base')
const basenavContent = document.getElementById('baseContent')

const handle = document.getElementById('hideRight')
const handleBase = document.getElementById('hideBase')

const layerDiv = document.getElementById('layers')
const layerSwitch = document.getElementById('layerSwitch')

layerSwitch.onmouseover = () => helpChange('closeList')
handle.onmouseover = () => helpChange('closeRight')
handleBase.onmouseover = () => helpChange('closeShapes')

function sideHandle() {
    sidenav.classList.toggle('closed')
    resize()
}

function baseHandle() {
    basenav.classList.toggle('closed')
    resize()
}