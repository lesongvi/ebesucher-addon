import {surfbar} from './component.js'

let surfbarTemplate = document.createElement('template')
surfbarTemplate.innerHTML = surfbar

class Surfbar {
    constructor() {
        const surfbarFonts = document.querySelector('link[href*="lib/css/font-awesome.min.css"]')
        const surfbarStyle = document.querySelector('link[href*="addon/css/addon.css"]')

        let surfbarShadow = document.querySelector('#addon-surfbar').attachShadow({mode: 'open'})
        surfbarShadow.appendChild(surfbarTemplate.content.cloneNode(true))

        if (surfbarFonts) surfbarShadow.appendChild(surfbarFonts.cloneNode())
        if (surfbarStyle) surfbarShadow.appendChild(surfbarStyle.cloneNode())

        this.overBar = this.overBar.bind(this)
        this.leaveBar = this.leaveBar.bind(this)
        this.overReportBtn = this.overReportBtn.bind(this)
        this.leaveReportBtn = this.leaveReportBtn.bind(this)
        this.togglePlayBtn = this.togglePlayBtn.bind(this)
        this.clickReportBtn = this.clickReportBtn.bind(this)

        this.timeout = null
        this.progressContainer = surfbarShadow.querySelector('.progress-container')
        this.progressBar = surfbarShadow.querySelector('.progress-bar')
        this.progressCount = surfbarShadow.querySelector('.progress-count')
        this.playBtn = surfbarShadow.querySelector('.button')
        this.reportBtn = surfbarShadow.querySelector('.fa-exclamation')
        this.hubContainer = surfbarShadow.querySelector('#hub-container')

        this.playBtn.addEventListener('click', this.togglePlayBtn)
        this.reportBtn.addEventListener('click', this.clickReportBtn)
        this.reportBtn.addEventListener('mouseover', this.overReportBtn)
        this.reportBtn.addEventListener('mouseleave', this.leaveReportBtn)
        this.progressContainer.addEventListener('mouseover', this.overBar)
        this.progressContainer.addEventListener('mouseleave', this.leaveBar)
    }

    overReportBtn(){
        this.reportBtn.className = "fa fa-exclamation-circle"
    }

    leaveReportBtn(){
        this.reportBtn.className = "fa fa-exclamation"
    }

    overBar() {
        clearTimeout(this.timeout)

        this.progressCount.style.display = "flex"
        this.progressBar.style.height = 20 + "px"
        this.hubContainer.style.display = "flex"
    }

    leaveBar() {
        clearTimeout(this.timeout)

        this.timeout = setTimeout(() => {
            this.progressCount.style.display = "none"
            this.hubContainer.style.display = "none"
            this.progressBar.style.height = 5 + "px"
        }, 3000)
    }

    togglePlayBtn() {
        this.playBtn.className = this.playBtn.className === "button" ? "button paused" : "button"
    }

    clickReportBtn() {
        this.playBtn.className = "button"
    }
}

new Surfbar()












