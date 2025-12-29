// State
const state = {
    annualLeave: 1, startDate: null, endDate: null,   selectedPeriod: "12",

    includeWeekends: true,     // 기본값
    includeHolidays: true
}

// Initialize
document.addEventListener("DOMContentLoaded", () => {
    setupEventListeners()
    loadFromURL()
    updateDates()
})

function setupEventListeners() {
    // Annual leave stepper
    document.getElementById("decreaseBtn").addEventListener("click", () => {
        const input = document.getElementById("annualLeaveInput")
        if (input.value > 0) {
            input.value = Number.parseInt(input.value) - 1
            state.annualLeave = Number.parseInt(input.value)
            updateURL()
        }
    })

    document.getElementById("increaseBtn").addEventListener("click", () => {
        const input = document.getElementById("annualLeaveInput")
        if (input.value < 50) {
            input.value = Number.parseInt(input.value) + 1
            state.annualLeave = Number.parseInt(input.value)
            updateURL()
        }
    })

    document.getElementById("annualLeaveInput").addEventListener("change", (e) => {
        state.annualLeave = Number.parseInt(e.target.value)
        updateURL()
    })

    // Period buttons
    document.querySelectorAll(".period-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".period-btn").forEach((b) => {
                b.classList.remove("border-blue-500", "dark:border-blue-400", "bg-blue-50", "dark:bg-blue-900/30", "text-blue-600", "dark:text-blue-400",)
                b.classList.add("border-gray-200", "dark:border-gray-600", "text-gray-700", "dark:text-gray-300")
            })
            btn.classList.remove("border-gray-200", "dark:border-gray-600", "text-gray-700", "dark:text-gray-300")
            btn.classList.add("border-blue-500", "dark:border-blue-400", "bg-blue-50", "dark:bg-blue-900/30", "text-blue-600", "dark:text-blue-400",)

            const period = btn.dataset.months
            state.selectedPeriod = period

            if (period === "custom") {
                document.getElementById("customDateInputs").classList.remove("hidden")
            } else {
                document.getElementById("customDateInputs").classList.add("hidden")
                updateDates(Number.parseInt(period))
            }
            updateURL()
        })
    })

    // Date inputs
    document.getElementById("startDate").addEventListener("change", (e) => {
        state.startDate = new Date(e.target.value)
        updateURL()
    })

    document.getElementById("endDate").addEventListener("change", (e) => {
        state.endDate = new Date(e.target.value)
        updateURL()
    })

    // Options

    document.getElementById("includeWeekends").addEventListener("change", (e) => {
        state.includeWeekends = e.target.checked
        updateURL()
    })

    // Calculate buttons
    document.getElementById("calculateBtn").addEventListener("click", calculate)
    document.getElementById("mobileCalculateBtn").addEventListener("click", calculate)

    // Dark mode toggle
    document.getElementById("darkModeToggle").addEventListener("click", toggleDarkMode)

    // Help modal
    document.getElementById("helpBtn").addEventListener("click", () => {
        document.getElementById("helpModal").classList.add("show")
    })

    document.getElementById("closeModalBtn").addEventListener("click", () => {
        document.getElementById("helpModal").classList.remove("show")
    })

    document.getElementById("helpModal").addEventListener("click", (e) => {
        if (e.target.id === "helpModal") {
            document.getElementById("helpModal").classList.remove("show")
        }
    })
}

function updateDates(months = 12) {
    const today = new Date()
    state.startDate = today
    state.endDate = new Date(today)
    state.endDate.setMonth(today.getMonth() + months)

    document.getElementById("startDate").value = window.holidayUtils.formatDate(state.startDate)
    document.getElementById("endDate").value = window.holidayUtils.formatDate(state.endDate)
}

function calculate() {
    const results = findGoldenHolidays()
    displayResults(results)

    // Scroll to results
    document.getElementById("resultsSection").scrollIntoView({behavior: "smooth"})
}

function expandRange(startDate, endDate) {
    // 양 끝을 주말/공휴일(OFF)까지 자동 확장
    let start = new Date(startDate);
    let end = new Date(endDate);

    // 앞 확장
    while (true) {
        const prev = window.holidayUtils.addDays(start, -1);
        const isOff = (state.includeWeekends && window.holidayUtils.isWeekend(prev)) || (state.includeHolidays && window.holidayUtils.isHoliday(prev));

        if (!isOff) break;
        start = prev;
    }

    // 뒤 확장
    while (true) {
        const next = window.holidayUtils.addDays(end, 1);
        const isOff = (state.includeWeekends && window.holidayUtils.isWeekend(next)) || (state.includeHolidays && window.holidayUtils.isHoliday(next));

        if (!isOff) break;
        end = next;
    }

    return {start, end};
}

function listLeaveDays(start, end) {
    const days = [];
    for (let d = new Date(start); d <= end; d = window.holidayUtils.addDays(d, 1)) {
        if (window.holidayUtils.isWorkday(d)) {
            days.push(window.holidayUtils.formatDate(d)); // 평일만 연차
        }
    }
    return days;
}

function findGoldenHolidays() {
    const candidates = [];
    const holidays = window.holidayUtils.getHolidays(state.startDate, state.endDate);

    // 공휴일 "하나"를 중심으로, 앞/뒤로 연차를 붙여본다 (0~N)
    holidays.forEach((holiday) => {
        const center = new Date(holiday.date);

        for (let before = 0; before <= state.annualLeave; before++) {
            for (let after = 0; after <= state.annualLeave - before; after++) {
                // before=after=0이면 그냥 공휴일 하루인데 이것도 의미 있으면 남기고, 싫으면 continue
                // if (before + after === 0) continue;

                const rawStart = window.holidayUtils.addDays(center, -before);
                const rawEnd = window.holidayUtils.addDays(center, after);

                // ✅ 핵심: 주말/공휴일까지 자동 확장
                const expanded = expandRange(rawStart, rawEnd);

                // ✅ 확장된 구간에서 실제 연차 필요일 계산
                const leaveDays = listLeaveDays(expanded.start, expanded.end);
                const usedLeave = leaveDays.length;

                if (usedLeave === 0) continue;

                // 연차 한도 초과는 버림
                if (usedLeave > state.annualLeave) continue;

                const totalDays = window.holidayUtils.getDaysBetween(expanded.start, expanded.end);

                // 참고용 카운트
                let weekendCount = 0;
                let holidayCount = 0;
                for (let d = new Date(expanded.start); d <= expanded.end; d = window.holidayUtils.addDays(d, 1)) {
                    if (state.includeWeekends && window.holidayUtils.isWeekend(d)) weekendCount++;
                    if (state.includeHolidays && window.holidayUtils.isHoliday(d)) holidayCount++;
                }

                candidates.push({
                    start: expanded.start, end: expanded.end, totalDays, usedLeave, leaveDays,            // ✅ “금요일 연차” 같은 실제 리스트
                     weekendCount, holidayCount, centerHoliday: holiday.name,
                });
            }
        }
    });

    // ✅ 같은 구간은 하나로 묶기(중복 제거) + 더 좋은 것만 남기기
    const bestByRange = new Map();
    for (const c of candidates) {
        const key = `${window.holidayUtils.formatDate(c.start)}~${window.holidayUtils.formatDate(c.end)}`;
        const prev = bestByRange.get(key);

        if (!prev) {
            bestByRange.set(key, c);
            continue;
        }

        // 같은 구간이면 “연차 덜 쓰는 것” 우선, 같으면 효율/총일수로
        const better =
            c.usedLeave < prev.usedLeave ||
            (c.usedLeave === prev.usedLeave && c.totalDays > prev.totalDays);

        if (better) bestByRange.set(key, c);
    }

    const results = [...bestByRange.values()];

    // ✅ 정렬: 1) 총 연속휴식 길이 2) 연차 적게 3) 효율
    results.sort((a, b) => {
        if (b.totalDays !== a.totalDays) return b.totalDays - a.totalDays;
        return a.usedLeave - b.usedLeave;
    });


    return results.slice(0, 5);
}

function displayResults(results) {
    const container = document.getElementById("resultsContainer")
    container.innerHTML = ""

    results.forEach((result, index) => {
        const card = document.createElement("div")
        card.className = "bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"

        const holidaysInRange = window.holidayUtils.getHolidays(result.start, result.end)

        card.innerHTML = `
      <div class="p-6">
        <div class="flex justify-between items-start mb-4">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
              <span class="text-xl font-bold text-blue-600 dark:text-blue-400">${index + 1}</span>
            </div>
            <div>
              <h3 class="text-lg font-bold text-gray-900 dark:text-white">${result.centerHoliday} 연휴</h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">${window.holidayUtils.formatDateKorean(result.start)} ~ ${window.holidayUtils.formatDateKorean(result.end)}</p>
            </div>
          </div>
          <button class="copy-btn p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex-shrink-0" data-index="${index}">
            <svg class="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
            </svg>
          </button>
        </div>
        
        <div class="grid grid-cols-3 gap-4 mb-4">
          <div class="text-center p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
            <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">${result.totalDays}</div>
            <div class="text-xs text-gray-600 dark:text-gray-400">총 휴일</div>
          </div>
          <div class="text-center p-3 bg-red-50 dark:bg-red-900/30 rounded-lg">
            <div class="text-2xl font-bold text-red-600 dark:text-red-400">${result.usedLeave}</div>
            <div class="text-xs text-gray-600 dark:text-gray-400">사용 연차</div>
          </div>
          
          <div class="text-center p-3 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
            <div class="text-2xl font-bold text-purple-600 dark:text-purple-400">${result.holidayCount}</div>
            <div class="text-xs text-gray-600 dark:text-gray-400">공휴일</div>
          </div>
        </div>
                <div class="mt-2 mb-4">
          <div class="text-sm font-semibold text-gray-900 dark:text-white mb-2">연차 쓰는 날짜</div>
          <div class="flex flex-wrap gap-2">
            ${(result.leaveDays && result.leaveDays.length > 0) ? result.leaveDays.map(d => `
                  <span class="px-2 py-1 text-xs rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">
                    ${d}
                  </span>
                `).join("") : `<span class="text-sm text-gray-500 dark:text-gray-400">연차 없이 가능한 연휴</span>`}
          </div>
        </div>

        <button class="accordion-btn w-full flex justify-between items-center py-3 px-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors" data-index="${index}">
          <span class="font-medium text-gray-900 dark:text-white">상세 정보 보기</span>
          <svg class="w-5 h-5 text-gray-600 dark:text-gray-300 transform transition-transform accordion-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
          </svg>
        </button>
        
        <div class="accordion-content" data-index="${index}">
          <div class="pt-4 space-y-2">
            <h4 class="font-semibold text-gray-900 dark:text-white mb-2">포함된 공휴일:</h4>
            ${holidaysInRange
            .map((h) => `
              <div class="flex justify-between items-center py-2 px-3 bg-gray-50 dark:bg-gray-700 rounded">
                <span class="text-sm text-gray-700 dark:text-gray-300">${h.name}</span>
                <span class="text-sm text-gray-500 dark:text-gray-400">${window.holidayUtils.formatDateKorean(new Date(h.date))}</span>
              </div>
            `,)
            .join("")}
            ${result.weekendCount > 0 ? `
              <div class="flex justify-between items-center py-2 px-3 bg-gray-50 dark:bg-gray-700 rounded">
                <span class="text-sm text-gray-700 dark:text-gray-300">주말</span>
                <span class="text-sm text-gray-500 dark:text-gray-400">${result.weekendCount}일</span>
              </div>
            ` : ""}
          </div>
        </div>
      </div>
    `

        container.appendChild(card)
    })




    // Add accordion listeners
    document.querySelectorAll(".accordion-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
            const index = btn.dataset.index
            const content = document.querySelector(`.accordion-content[data-index="${index}"]`)
            const icon = btn.querySelector(".accordion-icon")

            content.classList.toggle("open")
            icon.classList.toggle("rotate-180")
        })
    })

    // Add copy listeners
    document.querySelectorAll(".copy-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
            const index = Number.parseInt(btn.dataset.index)
            const result = results[index]
            const text = `${result.centerHoliday} 연휴
기간: ${window.holidayUtils.formatDateKorean(result.start)} ~ ${window.holidayUtils.formatDateKorean(result.end)}
총 휴일: ${result.totalDays}일
사용 연차: ${result.usedLeave}일
`
            navigator.clipboard.writeText(text).then(() => {
                showToast()
            })
        })
    })

    document.getElementById("resultsSection").classList.remove("hidden")
}

function showToast() {
    const toast = document.getElementById("toast")
    toast.classList.add("show")
    setTimeout(() => {
        toast.classList.remove("show")
    }, 2000)
}

function toggleDarkMode() {
    document.documentElement.classList.toggle("dark")
    localStorage.setItem("darkMode", document.documentElement.classList.contains("dark"))
}

function updateURL() {
    const params = new URLSearchParams()
    params.set("leave", state.annualLeave)
    if (state.startDate) params.set("start", window.holidayUtils.formatDate(state.startDate))
    if (state.endDate) params.set("end", window.holidayUtils.formatDate(state.endDate))
    params.set("weekends", state.includeWeekends)
    params.set("period", state.selectedPeriod)

    window.history.replaceState({}, "", `?${params.toString()}`)
}

function loadFromURL() {
    const params = new URLSearchParams(window.location.search)

    if (params.has("leave")) {
        state.annualLeave = Number.parseInt(params.get("leave"))
        document.getElementById("annualLeaveInput").value = state.annualLeave
    }

    if (params.has("start")) {
        state.startDate = new Date(params.get("start"))
        document.getElementById("startDate").value = params.get("start")
    }

    if (params.has("end")) {
        state.endDate = new Date(params.get("end"))
        document.getElementById("endDate").value = params.get("end")
    }



    if (params.has("weekends")) {
        state.includeWeekends = params.get("weekends") === "true"
        document.getElementById("includeWeekends").checked = state.includeWeekends
    }

    if (params.has("period")) {
        state.selectedPeriod = params.get("period")
        document.querySelectorAll(".period-btn").forEach((btn) => {
            if (btn.dataset.months === state.selectedPeriod) {
                btn.click()
            }
        })
    }

    // Load dark mode preference
    if (localStorage.getItem("darkMode") === "true") {
        document.documentElement.classList.add("dark")
    }
}
