class WurzleLoader {

    static wurzles = null
    static wurzleApi = "https://www.noel-friedrich.de/wurzle-api/get_wurzles.php"

    static dateStringToDate(dateString) {
        const [day, monthPlusOne, year] = dateString.split(".").map(s => parseInt(s))
        return new Date(Date.UTC(year, monthPlusOne - 1, day))
    }

    static async loadWurzles() {
        const response = await fetch(this.wurzleApi)
        const jsonData = await response.json()

        this.wurzles = Array.from(Object.entries(jsonData))
            .map(([dateString, termString]) => ({
                dateString, termString,
                date: this.dateStringToDate(dateString)
            }))

        this.wurzles.sort((a, b) => a.date - b.date)
        for (let i = 0; i < this.wurzles.length; i++) {
            this.wurzles[i].numero = i + 1
        }

        for (const wurzle of this.wurzles) {
            const [day, month, year] = wurzle.dateString.split(".").map(s => parseInt(s))

            const today = new Date()
            if (today.getDate() == day && today.getMonth() == month - 1 && today.getFullYear() == year) {
                continue
            }

            calendarWidget.addClickableDay(day, month, year, {
                title: `Wurzle#${wurzle.numero}`,
                func: () => location.search = `w=${wurzle.numero}`
            })
        }
        calendarWidget.update()
    }

    static async getAllWurzles() {
        if (this.wurzles === null) {
            await this.loadWurzles()
        }
        return this.wurzles
    }

    static async getWurzleNumero(numero) {
        if (this.wurzles === null) {
            await this.loadWurzles()
        }
        return this.wurzles.find(w => w.numero == numero)
    }

    static async getLatestWurzle() {
        if (this.wurzles === null) {
            await this.loadWurzles()
        }
        return this.wurzles[this.wurzles.length - 1]
    }

}