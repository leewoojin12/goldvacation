// 대한민국 공휴일 데이터 (2024-2026)
const HOLIDAYS = {
  2024: [
    { date: "2024-01-01", name: "신정" },
    { date: "2024-02-09", name: "설날" },
    { date: "2024-02-10", name: "설날" },
    { date: "2024-02-11", name: "설날" },
    { date: "2024-02-12", name: "대체공휴일" },
    { date: "2024-03-01", name: "삼일절" },
    { date: "2024-04-10", name: "국회의원 선거일" },
    { date: "2024-05-05", name: "어린이날" },
    { date: "2024-05-06", name: "대체공휴일" },
    { date: "2024-05-15", name: "부처님오신날" },
    { date: "2024-06-06", name: "현충일" },
    { date: "2024-08-15", name: "광복절" },
    { date: "2024-09-16", name: "추석" },
    { date: "2024-09-17", name: "추석" },
    { date: "2024-09-18", name: "추석" },
    { date: "2024-10-03", name: "개천절" },
    { date: "2024-10-09", name: "한글날" },
    { date: "2024-12-25", name: "크리스마스" },
  ],
  2025: [
    { date: "2025-01-01", name: "신정" },
    { date: "2025-01-28", name: "설날" },
    { date: "2025-01-29", name: "설날" },
    { date: "2025-01-30", name: "설날" },
    { date: "2025-03-01", name: "삼일절" },
    { date: "2025-03-03", name: "대체공휴일" },
    { date: "2025-05-05", name: "어린이날" },
    { date: "2025-05-06", name: "부처님오신날" },
    { date: "2025-06-06", name: "현충일" },
    { date: "2025-08-15", name: "광복절" },
    { date: "2025-10-05", name: "추석" },
    { date: "2025-10-06", name: "추석" },
    { date: "2025-10-07", name: "추석" },
    { date: "2025-10-08", name: "대체공휴일" },
    { date: "2025-10-03", name: "개천절" },
    { date: "2025-10-09", name: "한글날" },
    { date: "2025-12-25", name: "크리스마스" },
  ],
  2026: [
    { date: "2026-01-01", name: "신정" },
    { date: "2026-02-16", name: "설날" },
    { date: "2026-02-17", name: "설날" },
    { date: "2026-02-18", name: "설날" },
    { date: "2026-03-01", name: "삼일절" },
    { date: "2026-05-05", name: "어린이날" },
    { date: "2026-05-25", name: "부처님오신날" },
    { date: "2026-06-06", name: "현충일" },
    { date: "2026-08-15", name: "광복절" },
    { date: "2026-09-24", name: "추석" },
    { date: "2026-09-25", name: "추석" },
    { date: "2026-09-26", name: "추석" },
    { date: "2026-10-03", name: "개천절" },
    { date: "2026-10-09", name: "한글날" },
    { date: "2026-12-25", name: "크리스마스" },
  ],
}

window.holidayUtils = {
  getHolidays: (startDate, endDate) => {
    const holidays = []
    const start = new Date(startDate)
    const end = new Date(endDate)

    for (let year = start.getFullYear(); year <= end.getFullYear(); year++) {
      if (HOLIDAYS[year]) {
        HOLIDAYS[year].forEach((holiday) => {
          const holidayDate = new Date(holiday.date)
          if (holidayDate >= start && holidayDate <= end) {
            holidays.push(holiday)
          }
        })
      }
    }

    return holidays
  },

  isHoliday: function (date) {
    const dateStr = this.formatDate(date)
    const year = date.getFullYear()

    if (HOLIDAYS[year]) {
      return HOLIDAYS[year].some((h) => h.date === dateStr)
    }
    return false
  },

  isWeekend: (date) => {
    const day = date.getDay()
    return day === 0 || day === 6
  },

  formatDate: (date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  },

  formatDateKorean: (date) => {
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const days = ["일", "월", "화", "수", "목", "금", "토"]
    const dayName = days[date.getDay()]
    return `${year}년 ${month}월 ${day}일 (${dayName})`
  },

  addDays: (date, days) => {
    const result = new Date(date)
    result.setDate(result.getDate() + days)
    return result
  },

  getDaysBetween: (start, end) => {
    const oneDay = 24 * 60 * 60 * 1000
    return Math.round(Math.abs((end - start) / oneDay)) + 1
  },


}

window.holidayUtils.isWorkday = function(date) {
    // 주말 OR 공휴일이면 쉬는날 -> 근무일 아님
    return !(this.isWeekend(date) || this.isHoliday(date));
};
