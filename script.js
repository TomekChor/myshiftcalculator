const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const box = document.getElementById('shiftsContainer');

function addRow() {
    const div = document.createElement('div'); div.className = 'day-row';
    let opt = ''; days.forEach(d => opt += `<option value="${d}">${d}</option>`);
    div.innerHTML = `<div class="day-select-wrapper"><select>${opt}</select></div>
        <div class="form-group"><input type="time" class="start" value="09:00" required></div>
        <div class="form-group"><input type="time" class="end" value="17:00" required></div>
        <div class="form-group"><input type="number" class="break" value="30"></div>
        <button type="button" class="btn-remove" onclick="this.parentElement.remove()">✕</button>`;
    box.appendChild(div);
}
addRow();
document.getElementById('addShiftBtn').onclick = addRow;

const pm = document.getElementById('privacyModal'); const tm = document.getElementById('termsModal');
document.getElementById('openPrivacy').onclick = () => pm.style.display = 'flex';
document.getElementById('openTerms').onclick = () => tm.style.display = 'flex';
function closeModals() { pm.style.display = 'none'; tm.style.display = 'none'; }
window.onclick = (e) => { if(e.target == pm || e.target == tm) closeModals(); }

document.getElementById('calcForm').onsubmit = function(e) {
    e.preventDefault();
    let totalMin = 0, totalBreak = 0;
    const starts = document.querySelectorAll('.start'), ends = document.querySelectorAll('.end'), breaks = document.querySelectorAll('.break');

    starts.forEach((s, i) => {
        if(s.value && ends[i].value) {
            let mS = s.valueAsDate.getUTCHours()*60 + s.valueAsDate.getUTCMinutes();
            let mE = ends[i].valueAsDate.getUTCHours()*60 + ends[i].valueAsDate.getUTCMinutes();
            if(mE < mS) mE += 1440;
            let brK = parseInt(breaks[i].value, 10) || 0;
            totalMin += Math.max(0, (mE - mS) - brK);
            totalBreak += brK;
        }
    });

    let hours = totalMin / 60, rate = parseFloat(document.getElementById('hourlyRate').value) || 0;
    let limit = parseFloat(document.getElementById('otThreshold').value) || 40;
    let reg = Math.min(hours, limit), ot = Math.max(0, hours - limit), pay = (reg * rate) + (ot * rate * 1.5);

    document.getElementById('regHours').textContent = reg.toFixed(1) + " hrs";
    document.getElementById('otHours').textContent = ot.toFixed(1) + " hrs";
    document.getElementById('totalNetHours').textContent = hours.toFixed(1) + " hrs";
    document.getElementById('totalBreaks').textContent = totalBreak + " mins";
    document.getElementById('weeklyPay').textContent = "$" + pay.toFixed(2);
    document.getElementById('projWeek').textContent = "$" + pay.toFixed(2);
    document.getElementById('projBiWeek').textContent = "$" + (pay * 2).toFixed(2);
    document.getElementById('projMonth').textContent = "$" + ((pay * 52) / 12).toFixed(2);
    document.getElementById('projYear').textContent = "$" + (pay * 52).toFixed(2);
    document.getElementById('resultsGrid').style.display = 'grid';
}
