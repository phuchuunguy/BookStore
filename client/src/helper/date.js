const date = {
    getMonday: (date) => {
        const first = date.getDate() - date.getDay() + (date.getDay() === 0 ? -6 : 1)
        const monday = new Date(date.setDate(first))
        monday.setUTCHours(0, 0, 0, 0)
        monday.setHours(0)
        return monday
    },
    getSunday: (date) => {
        const first = date.getDate() - date.getDay() + (date.getDay() === 0 ? -6 : 1)
        const sunday = new Date(date.setDate(first + 6))
        sunday.setHours(23);
        sunday.setMinutes(59);
        return sunday
    },
}

export default date