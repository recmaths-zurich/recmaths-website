const CalendarMonth = {
    January: 1, February: 2, March: 3,
    April: 4, May: 5, June: 6,
    July: 7, August: 8, September: 9,
    October: 10, November: 11, December: 12
}

const CalendarMonthNames = {
    "de": {
        [CalendarMonth.January]: "Januar",
        [CalendarMonth.February]: "Februar",
        [CalendarMonth.March]: "März",
        [CalendarMonth.April]: "April",
        [CalendarMonth.May]: "Mai",
        [CalendarMonth.June]: "Juni",
        [CalendarMonth.July]: "Juli",
        [CalendarMonth.August]: "August",
        [CalendarMonth.September]: "September",
        [CalendarMonth.October]: "Oktober",
        [CalendarMonth.November]: "November",
        [CalendarMonth.December]: "Dezember"
    },
    "en": {
        [CalendarMonth.January]: "January",
        [CalendarMonth.February]: "February",
        [CalendarMonth.March]: "March",
        [CalendarMonth.April]: "April",
        [CalendarMonth.May]: "May",
        [CalendarMonth.June]: "June",
        [CalendarMonth.July]: "July",
        [CalendarMonth.August]: "August",
        [CalendarMonth.September]: "September",
        [CalendarMonth.October]: "October",
        [CalendarMonth.November]: "November",
        [CalendarMonth.December]: "December"
    }
}

class CalendarWidget {
    
    constructor(containerElement) {
        this.containerElement = containerElement
        this.events = []

        this.currMonth = null
        this.currYear = null
    }

    addClickableDay(day, month, year, {
        title="",
        func=() => {},
        color=null
    }={}) {
        this.events.push({day, month, year, title, func, color})
    }

    _getDayIndex(date) {
        const sundayOrientedDay = date.getDay()
        if (sundayOrientedDay == 0) {
            return 6
        } else {
            return sundayOrientedDay - 1
        }
    }

    changeMonthBy(increment) {
        this.currMonth += increment

        while (this.currMonth < 1) {
            this.currMonth += 12
            this.currYear--
        }

        while (this.currMonth > 12) {
            this.currMonth -= 12
            this.currYear++
        }

        this.update()
    }

    showMonth(month, year) {
        this.containerElement.innerHTML = ""
        
        const header = document.createElement("div")
        header.classList.add("calendar-header")
        const monthName = CalendarMonthNames[document.documentElement.lang][month]

        const headerSpan = document.createElement("span")
        headerSpan.textContent = `${monthName} ${year}`

        const prevButton = document.createElement("div")
        prevButton.classList.add("calendar-button")
        prevButton.textContent = "◀"

        const nextButton = document.createElement("div")
        nextButton.classList.add("calendar-button")
        nextButton.textContent = "▶"
        
        prevButton.addEventListener("click", () => this.changeMonthBy(-1))
        nextButton.addEventListener("click", () => this.changeMonthBy(1))

        header.appendChild(prevButton)
        header.appendChild(headerSpan)
        header.appendChild(nextButton)

        this.containerElement.appendChild(header)
        
        const allDayDates = []
        let currDate = new Date(Date.UTC(year, month - 1))
        while (currDate.getUTCMonth() == month - 1) {
            allDayDates.push(new Date(currDate.getTime()))
            currDate.setUTCDate(currDate.getUTCDate() + 1)
        }

        const gridOffset = this._getDayIndex(allDayDates[0])
        const flatGrid = Array.from({length: gridOffset}, () => null)
            .concat(allDayDates.map((_, i) => i + 1))
        const gridHeight = Math.ceil(flatGrid.length / 7)

        const gridValues = Array.from({length: gridHeight})
            .map((_, i) => Array.from({length: 7}).map((_, j) => flatGrid[i * 7 + j] ?? null))
        
        const gridContainer = document.createElement("div")
        gridContainer.classList.add("calendar-grid")

        const today = new Date()

        for (const gridRow of gridValues) {
            for (const gridCell of gridRow) {
                const cellElement = document.createElement("div")
                cellElement.classList.add("calendar-cell")
                cellElement.textContent = gridCell
                gridContainer.appendChild(cellElement)

                for (const event of this.events) {
                    if (event.year != year || event.month != month || event.day != gridCell) {
                        continue
                    }

                    cellElement.title = event.title
                    cellElement.classList.add("clickable")
                    cellElement.addEventListener("click", event.func)

                    if (event.color) {
                        cellElement.style.backgroundColor = event.color 
                    }
                }

                if (today.getFullYear() == year && today.getMonth() + 1 == month && today.getDate() == gridCell) {
                    cellElement.classList.add("today")
                }
            }
        }

        this.containerElement.appendChild(gridContainer)

        this.currMonth = month
        this.currYear = year
    }

    update() {
        if (this.currMonth && this.currYear) {
            this.showMonth(this.currMonth, this.currYear)
        }
    }

    showCurrentMonth() {
        const now = new Date()
        this.currMonth = now.getMonth()
        this.currYear = now.getFullYear()
        
        // month is one off...
        this.changeMonthBy(1)
    }

}

const calendarWidget = new CalendarWidget(calendarContainer)
calendarWidget.showCurrentMonth()