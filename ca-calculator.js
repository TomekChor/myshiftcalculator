// California-specific overtime calculation.
// Loaded ONLY on california-overtime-calculator.html (after script.js), so it has
// no effect on the main index.html calculator, which keeps its simple weekly-threshold logic.
//
// Rules implemented (CA Labor Code, non-exempt employees):
// 1. Daily overtime: 1.5x for hours 8-12 in a single day, 2x for hours beyond 12 in a single day.
// 2. Weekly overtime: straight-time hours beyond 40/week are bumped to 1.5x (if not already OT/DT).
// 3. 7th-consecutive-day rule: first 8 hours on the 7th consecutive workday at 1.5x, remainder at 2x.
//
// Caveat: rule 3 requires knowing actual consecutive calendar dates. This form only collects
// day-of-week + hours (no dates), so as an approximation we treat the LAST shift row entered
// as the "7th day" whenever exactly 7 shifts are logged. For a fully accurate result, verify
// consecutive-day status against your actual work calendar.

document.getElementById('calcForm').onsubmit = function (e) {
    e.preventDefault();

    const starts = document.querySelectorAll('.start');
    const ends = document.querySelectorAll('.end');
    const breaks = document.querySelectorAll('.break');
    const rate = parseFloat(document.getElementById('hourlyRate').value) || 0;

    let totalBreakMin = 0;
    const shiftHours = [];

    starts.forEach((s, i) => {
        if (s.value && ends[i].value) {
            let mS = s.valueAsDate.getUTCHours() * 60 + s.valueAsDate.getUTCMinutes();
            let mE = ends[i].valueAsDate.getUTCHours() * 60 + ends[i].valueAsDate.getUTCMinutes();
            if (mE < mS) mE += 1440;
            const brk = parseInt(breaks[i].value, 10) || 0;
            const netMin = Math.max(0, (mE - mS) - brk);
            shiftHours.push(netMin / 60);
            totalBreakMin += brk;
        }
    });

    const numShifts = shiftHours.length;
    const seventhDayRuleApplies = numShifts >= 7;

    let totalRegHrs = 0, totalOtHrs = 0, totalDtHrs = 0;

    shiftHours.forEach((hrs, idx) => {
        const isSeventhDay = seventhDayRuleApplies && idx === numShifts - 1;

        if (isSeventhDay) {
            // First 8h on the 7th consecutive day: 1.5x. Beyond 8h that day: 2x.
            totalOtHrs += Math.min(hrs, 8);
            totalDtHrs += Math.max(hrs - 8, 0);
        } else {
            // Standard CA daily split: 0-8h regular, 8-12h at 1.5x, 12h+ at 2x.
            totalRegHrs += Math.min(hrs, 8);
            totalOtHrs += Math.min(Math.max(hrs - 8, 0), 4);
            totalDtHrs += Math.max(hrs - 12, 0);
        }
    });

    // Weekly 40-hour rule: any remaining straight-time hours over 40/week also become overtime.
    if (totalRegHrs > 40) {
        totalOtHrs += (totalRegHrs - 40);
        totalRegHrs = 40;
    }

    const totalHrs = totalRegHrs + totalOtHrs + totalDtHrs;
    const pay = (totalRegHrs * rate) + (totalOtHrs * rate * 1.5) + (totalDtHrs * rate * 2);

    document.getElementById('regHours').textContent = totalRegHrs.toFixed(1) + " hrs";
    document.getElementById('otHours').textContent = totalOtHrs.toFixed(1) + " hrs";
    document.getElementById('dtHours').textContent = totalDtHrs.toFixed(1) + " hrs";
    document.getElementById('totalNetHours').textContent = totalHrs.toFixed(1) + " hrs";
    document.getElementById('totalBreaks').textContent = totalBreakMin + " mins";
    document.getElementById('weeklyPay').textContent = "$" + pay.toFixed(2);
    document.getElementById('projWeek').textContent = "$" + pay.toFixed(2);
    document.getElementById('projBiWeek').textContent = "$" + (pay * 2).toFixed(2);
    document.getElementById('projMonth').textContent = "$" + ((pay * 52) / 12).toFixed(2);
    document.getElementById('projYear').textContent = "$" + (pay * 52).toFixed(2);
    document.getElementById('resultsGrid').style.display = 'grid';
};
