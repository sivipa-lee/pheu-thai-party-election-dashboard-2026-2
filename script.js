// ═══════════════════════════════════════════════════
// LANDING PAGE, TUTORIAL, SOURCE & HINT SYSTEM
// ═══════════════════════════════════════════════════
function enterDashboard() {
    const landing = document.getElementById('landing-page');
    const shell   = document.getElementById('dashboard-shell');
    landing.style.transition = 'opacity 0.45s ease, transform 0.45s ease';
    landing.style.opacity    = '0';
    landing.style.transform  = 'scale(1.04)';
    setTimeout(() => {
        landing.style.display = 'none';
        shell.classList.add('visible');
        if (!sessionStorage.getItem('tut_seen')) {
            sessionStorage.setItem('tut_seen', '1');
            setTimeout(() => openTutorial(), 600);
        }
    }, 440);
}
function goHome() {
    const landing = document.getElementById('landing-page');
    const shell   = document.getElementById('dashboard-shell');
    shell.classList.remove('visible');
    landing.style.transition = 'none';
    landing.style.opacity    = '0';
    landing.style.transform  = 'scale(1.04)';
    landing.style.display    = 'flex';
    requestAnimationFrame(() => {
        landing.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
        landing.style.opacity    = '1';
        landing.style.transform  = 'scale(1)';
    });
}
function openTutorial() {
    const ov = document.getElementById('tutorial-overlay');
    ov.style.display = 'flex'; ov.style.opacity = '0';
    requestAnimationFrame(() => { ov.style.transition = 'opacity 0.2s'; ov.style.opacity = '1'; });
}
function closeTutorial() {
    const ov = document.getElementById('tutorial-overlay');
    ov.style.transition = 'opacity 0.18s'; ov.style.opacity = '0';
    setTimeout(() => {
        ov.style.display = 'none';
        // Ensure map fits into view after tutorial closes
        setTimeout(() => { if (typeof fitMap === 'function') fitMap(); }, 50);
    }, 200);
}
function openSource() {
    const ov = document.getElementById('source-overlay');
    ov.style.display = 'flex'; ov.style.opacity = '0';
    requestAnimationFrame(() => { ov.style.transition = 'opacity 0.2s'; ov.style.opacity = '1'; });
}
function closeSource() {
    const ov = document.getElementById('source-overlay');
    ov.style.transition = 'opacity 0.18s'; ov.style.opacity = '0';
    setTimeout(() => { ov.style.display = 'none'; }, 200);
}

// ── Sidebar Toggle ─────────────────────────────────
const sidebarStates = { map: true, analysis: true }; // true = open
function toggleSidebar(tab) {
    const sidebar = document.getElementById('sidebar-' + tab);
    const btn = document.getElementById('toggle-' + tab);
    const icon = btn.querySelector('.sidebar-toggle-icon');
    sidebarStates[tab] = !sidebarStates[tab];
    if (sidebarStates[tab]) {
        sidebar.classList.remove('sidebar-collapsed');
        icon.textContent = '‹';
    } else {
        sidebar.classList.add('sidebar-collapsed');
        icon.textContent = '›';
    }
    // Reflow charts after sidebar animation
    setTimeout(() => {
        if (tab === 'analysis') {
            ['scatter-plot','sankey-diagram','hist-lost','hist-won'].forEach(id => {
                const el = document.getElementById(id);
                if (el && el._fullLayout) Plotly.relayout(el, {autosize: true});
            });
            if (sankeyChart) sankeyChart.resize();
        }
    }, 300);
}

const HINTS = {
    mode: {
        title: 'โหมดแสดงผล',
        body:  '<b>แบ่งเขต</b> — สีของแต่ละกล่องแสดงผลการแข่งขันเขตนั้น<br><b>บัญชีรายชื่อ</b> — แสดงผลคะแนนพรรคในระบบบัญชีรายชื่อ<br><b>เปรียบเทียบ</b> — สีพื้น = ผู้ชนะเขต, สีกรอบ = ผู้ชนะบัญชีรายชื่อ'
    },
    'main-filters': {
        title: 'ตัวกรองหลัก',
        body: 'ตัวกรองเหล่านี้ใช้งานได้กับทุกโหมดแผนที่ กรองตามภูมิภาค ลักษณะประชากร และรายได้เฉลี่ยของจังหวัด เขตที่ไม่ตรงเงื่อนไขจะจางลงบนแผนที่'
    },
    demographics: {
        title: 'ลักษณะประชากร',
        body: 'กรองเขตที่มีสัดส่วนกลุ่มอายุสูงกว่าค่าเฉลี่ยประเทศ<br><b>First Voter</b> — ผู้มีสิทธิ์เลือกตั้งครั้งแรก<br><b>Gen Z</b> — อายุ 18-27 ปี<br><b>Gen Y</b> — อายุ 28-43 ปี<br><b>Gen X</b> — อายุ 44-59 ปี<br><b>ผู้สูงวัย</b> — อายุ 60+ ปี'
    },
    income: {
        title: 'รายได้เฉลี่ยจังหวัด',
        body: 'ลากตัว Slider สองด้านเพื่อกำหนดช่วงรายได้เฉลี่ยต่อครัวเรือนต่อเดือนของจังหวัดนั้น ๆ'
    },
    'const-filters': {
        title: 'ตัวกรอง แบ่งเขต / รายชื่อ',
        body: 'ตัวกรองนี้ใช้ได้กับโหมด <b>แบ่งเขต</b> และ <b>บัญชีรายชื่อ</b> เท่านั้น<br>กรองตามอันดับที่เพื่อไทยได้รับในเขตนั้น และช่วงส่วนต่างคะแนนกับพรรคอื่น'
    },
    gap: {
        title: 'ส่วนต่างคะแนน',
        body: 'ลากตัว Slider สองด้านเพื่อกำหนดช่วงส่วนต่างคะแนน โดยเป็น % ของคะแนนทั้งหมดในเขต เช่น 10% หมายถึงเพื่อไทยชนะหรือแพ้ด้วยคะแนนห่าง 10% ตัวกรองนี้ใช้ค่าสัมบูรณ์ ไม่แยกชนะ/แพ้'
    },
    'compare-filters': {
        title: 'ตัวกรอง เปรียบเทียบ',
        body: 'ใช้ได้กับโหมด <b>เปรียบเทียบ</b> เท่านั้น แสดงผลรวมระหว่างเขตเลือกตั้ง (สส.แบ่งเขต) และบัญชีรายชื่อ เช่น WW = ชนะทั้งสองระบบ, LL = แพ้ทั้งสองระบบ'
    },
    'analysis-filters': {
        title: 'ตัวกรองหน้าวิเคราะห์',
        body: 'กรองข้อมูลที่แสดงในกราฟทั้งสามชิ้นพร้อมกัน เลือกภาค หรือ สถานะเขต (ชนะ/แพ้ปี 69) เพื่อเปรียบเทียบพลวัตเฉพาะกลุ่ม'
    },
    'district-status': {
        title: 'สถานะเขต',
        body: 'กรองเขตตามผลปี 2569 เพื่อเปรียบเทียบเฉพาะเขตที่เพื่อไทยชนะ, แพ้, พลิกชนะ หรือพลิกแพ้ กราฟทุกชิ้นในหน้าวิเคราะห์จะอัพเดทพร้อมกัน'
    },
    scatter: {
        title: 'Scatter Plot — ส่วนต่างคะแนน 66 vs 69',
        body: '<b>แกน X</b> = ส่วนต่างคะแนนปี 2566 (%) &nbsp;|&nbsp; <b>แกน Y</b> = ส่วนต่างคะแนนปี 2569 (%)<br><br><b>ส่วนต่างคะแนน (%)</b> คือคะแนนเพื่อไทย <b>ลบ</b> คะแนนพรรคอันดับ 1 ของเขต หารด้วยคะแนนทั้งหมดในเขต<br>ค่า <b>บวก (+)</b> = เพื่อไทยชนะ &nbsp;|&nbsp; ค่า <b>ลบ (−)</b> = เพื่อไทยแพ้<br><br><b>ลากครอบจุด (Lasso)</b> เพื่อกรอง ตารางด้านล่างจะอัพเดทอัตโนมัติ'
    },
    sankey: {
        title: 'Sankey Diagram',
        body: 'แสดงการย้ายผลชนะ/แพ้ระหว่างปี 2566 และ 2569<br>ความกว้างของเส้นแสดงสัดส่วนของเขต<br>วางเมาส์บนเส้นหรือโหนดเพื่อดูจำนวนเขตที่เปลี่ยนแปลง'
    },
    flips: {
        title: 'การพลิกโผ',
        body: '<b>เสียให้ใคร</b> — เขตที่เพื่อไทยพลิกแพ้จากปี 66 แบ่งตามพรรคพรรคคู่แข่งที่มาแย่งชิงพื้นที่ไป<br><b>แย่งใครมา</b> — เขตที่เพื่อไทยพลิกชนะ แบ่งตามพรรคพรรคเจ้าของพื้นที่เดิม'
    }
};
function showHint(key, anchorEl) {
    const hint = HINTS[key]; if (!hint) return;
    const pop = document.getElementById('hint-popover');
    document.getElementById('hint-pop-content').innerHTML = `<b style="display:block;margin-bottom:8px;color:#fff;font-size:13px">${hint.title}</b>${hint.body}`;
    pop.style.display = 'block';
    const rect = anchorEl.getBoundingClientRect();
    let left = rect.left, top = rect.bottom + 8;
    if (left + 300 > window.innerWidth) left = window.innerWidth - 308;
    pop.style.left = left + 'px'; pop.style.top = top + 'px';
}
// ── Dropdown toggle helper ──────────────────────────
function toggleDropdown(name) {
    const content = document.getElementById('dropdown-' + name + '-content');
    const wrap    = document.getElementById('mob-dropdown-' + name) || document.getElementById('dropdown-' + name);
    if (!content) return;
    const isOpen = content.classList.contains('show');
    document.querySelectorAll('.dropdown-content.show').forEach(el => el.classList.remove('show'));
    document.querySelectorAll('.custom-dropdown.open').forEach(el => el.classList.remove('open'));
    if (!isOpen) {
        content.classList.add('show');
        if (wrap) wrap.classList.add('open');
    }
}
document.addEventListener('click', e => {
    if (!e.target.closest('.custom-dropdown')) {
        document.querySelectorAll('.dropdown-content.show').forEach(el => el.classList.remove('show'));
        document.querySelectorAll('.custom-dropdown.open').forEach(el => el.classList.remove('open'));
    }
});

// Mobile dropdown label updater
function updateMobDropdownLabel(name) {
    const content = document.getElementById('dropdown-mob-' + name + '-content');
    const label   = document.getElementById('dropdown-mob-' + name + '-label');
    if (!content || !label) return;
    const checked = [...content.querySelectorAll('input:checked')].map(cb => cb.parentElement.textContent.trim());
    label.textContent = checked.length === 0
        ? (name === 'region' ? 'ทุกภาค' : 'ทุกกลุ่ม')
        : checked.length <= 2 ? checked.join(', ')
        : checked.length + ' รายการ';
}
function clearMobDropdown(name) {
    const content = document.getElementById('dropdown-mob-' + name + '-content');
    if (!content) return;
    content.querySelectorAll('input[type=checkbox]').forEach(cb => cb.checked = false);
    if (name === 'region') { filterState.regions.clear(); document.querySelectorAll('#dd-region input').forEach(i=>i.checked=false); }
    else if (name === 'demo') { filterState.demos.clear(); document.querySelectorAll('#dd-demo input').forEach(i=>i.checked=false); }
    updateMobDropdownLabel(name);
    render();
}

// Mobile filter panel toggle
function toggleMobileFilters() {
    const panel = document.getElementById('mobile-filter-panel');
    const arrow = document.getElementById('mf-arrow');
    if (!panel) return;
    const isOpen = panel.style.display !== 'none';
    panel.style.display = isOpen ? 'none' : 'flex';
    if (arrow) arrow.classList.toggle('open', !isOpen);
}
function updateMapInsightBar() {
    const modes = ['const','plist','compare'];
    modes.forEach(m => {
        const el = document.getElementById('map-insight-' + m);
        if (el) el.style.display = (m === currentMode) ? '' : 'none';
    });
    if (currentMode === 'const' || currentMode === 'plist') {
        const src    = currentMode === 'const' ? DATA_CONST : DATA_PLIST;
        const active = src.filter(d => {
            if (!hasData(d)) return false;
            const pNorm = normProv(d.province);
            if (!getBaseFilterMatch(pNorm)) return false;
            const gap = parseFloat(d["คะแนนห่าง (%)"]) || 0;
            const rank = parseInt(d.pt_rank || 99) || 99;
            const win  = checkWin(d.is_win);
            let rOk = filterState.ranks.size === 0;
            if (filterState.ranks.has("1") && win) rOk = true;
            if (filterState.ranks.has("2") && rank === 2) rOk = true;
            if (filterState.ranks.has("3") && rank >= 3 && rank < 99) rOk = true;
            return rOk && gap >= filterState.gapMin && gap <= filterState.gapMax;
        });
        const won   = active.filter(d => checkWin(d.is_win)).length;
        const total = active.length;
        const wonEl   = document.getElementById('insight-won');
        const totalEl = document.getElementById('insight-total');
        if (wonEl)   wonEl.textContent   = won;
        if (totalEl) totalEl.textContent = total;
    }
    if (currentMode === 'compare') {
        let WW = 0, total = 0;
        GRID_DATA.forEach(pos => {
            if (!getBaseFilterMatch(normProv(pos.p))) return;
            const k = makeKey(pos.p, pos.z);
            const cd = constMap.get(k), pd = plistMap.get(k);
            if (!hasData(cd) || !hasData(pd)) return;
            total++;
            if (checkWin(cd.is_win) && checkWin(pd.is_win)) WW++;
        });
        const wwEl = document.getElementById('insight-ww');
        if (wwEl) wwEl.textContent = WW;
    }
}

function closeHint() { document.getElementById('hint-popover').style.display = 'none'; }
document.addEventListener('click', e => {
    const a = e.target.closest('.hint-anchor');
    if (a) { e.stopPropagation(); showHint(a.dataset.hint, a); return; }
    if (!e.target.closest('#hint-popover') && !e.target.closest('.custom-dropdown')) closeHint();
});

// ═══════════════════════════════════════════════════
// TAB SWITCHER
// ═══════════════════════════════════════════════════
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-pane').forEach(p => { p.style.display = 'none'; p.classList.remove('active'); });
        btn.classList.add('active');
        const pane = document.getElementById('tab-' + tab);
        pane.style.display = 'flex';
        pane.classList.add('active');
        if (tab === 'analysis' && !analysisLoaded) {
            loadAnalysisData();
        }
        if (tab === 'analysis') {
            setTimeout(() => {
                ['scatter-plot','sankey-diagram','hist-lost','hist-won'].forEach(id => {
                    const el = document.getElementById(id);
                    if (el && el._fullLayout) Plotly.relayout(el, {autosize: true});
                });
                if (sankeyChart) sankeyChart.resize();
            }, 50);
        }
    });
});

// ═══════════════════════════════════════════════════
// MAP TAB
// ═══════════════════════════════════════════════════

const GRID_DATA = [
  {p:"เชียงราย",z:"1",r:1,c:8},{p:"เชียงราย",z:"2",r:1,c:9},{p:"เชียงราย",z:"3",r:1,c:10},{p:"เชียงราย",z:"4",r:2,c:7},{p:"เชียงราย",z:"5",r:2,c:8},{p:"เชียงราย",z:"6",r:2,c:9},{p:"เชียงใหม่",z:"1",r:3,c:3},{p:"เชียงใหม่",z:"2",r:3,c:4},{p:"เชียงใหม่",z:"3",r:3,c:5},{p:"เชียงราย",z:"7",r:3,c:7},{p:"เชียงใหม่",z:"4",r:4,c:3},{p:"เชียงใหม่",z:"5",r:4,c:4},{p:"เชียงใหม่",z:"6",r:4,c:5},{p:"พะเยา",z:"1",r:4,c:10},{p:"พะเยา",z:"2",r:4,c:11},{p:"พะเยา",z:"3",r:4,c:12},{p:"เชียงใหม่",z:"7",r:5,c:3},{p:"เชียงใหม่",z:"8",r:5,c:4},{p:"น่าน",z:"1",r:5,c:15},{p:"แม่ฮ่องสอน",z:"1",r:6,c:1},{p:"เชียงใหม่",z:"9",r:6,c:3},{p:"ลำปาง",z:"1",r:6,c:7},{p:"ลำปาง",z:"2",r:6,c:8},{p:"แพร่",z:"1",r:6,c:11},{p:"น่าน",z:"2",r:6,c:14},{p:"แม่ฮ่องสอน",z:"2",r:7,c:1},{p:"เชียงใหม่",z:"10",r:7,c:3},{p:"ลำปาง",z:"3",r:7,c:7},{p:"ลำปาง",z:"4",r:7,c:8},{p:"แพร่",z:"2",r:7,c:11},{p:"น่าน",z:"3",r:7,c:13},{p:"หนองคาย",z:"1",r:7,c:17},{p:"หนองคาย",z:"3",r:7,c:19},{p:"บึงกาฬ",z:"1",r:7,c:21},{p:"บึงกาฬ",z:"2",r:7,c:22},{p:"บึงกาฬ",z:"3",r:7,c:23},{p:"ลำพูน",z:"1",r:8,c:5},{p:"แพร่",z:"3",r:8,c:11},{p:"อุตรดิตถ์",z:"1",r:8,c:15},{p:"หนองคาย",z:"2",r:8,c:18},{p:"ลำพูน",z:"2",r:9,c:5},{p:"อุตรดิตถ์",z:"2",r:9,c:14},{p:"อุตรดิตถ์",z:"3",r:9,c:15},{p:"สกลนคร",z:"1",r:9,c:24},{p:"สกลนคร",z:"2",r:9,c:25},{p:"นครพนม",z:"1",r:9,c:28},{p:"ตาก",z:"1",r:10,c:1},{p:"สุโขทัย",z:"1",r:10,c:7},{p:"สุโขทัย",z:"2",r:10,c:8},{p:"อุดรธานี",z:"1",r:10,c:18},{p:"อุดรธานี",z:"2",r:10,c:19},{p:"อุดรธานี",z:"3",r:10,c:20},{p:"อุดรธานี",z:"4",r:10,c:21},{p:"อุดรธานี",z:"5",r:10,c:22},{p:"สกลนคร",z:"3",r:10,c:24},{p:"สกลนคร",z:"4",r:10,c:25},{p:"นครพนม",z:"2",r:10,c:28},{p:"ตาก",z:"2",r:11,c:2},{p:"สุโขทัย",z:"3",r:11,c:7},{p:"สุโขทัย",z:"4",r:11,c:8},{p:"พิษณุโลก",z:"1",r:11,c:12},{p:"พิษณุโลก",z:"2",r:11,c:13},{p:"พิษณุโลก",z:"3",r:11,c:14},{p:"เลย",z:"1",r:11,c:16},{p:"อุดรธานี",z:"6",r:11,c:18},{p:"อุดรธานี",z:"7",r:11,c:19},{p:"อุดรธานี",z:"8",r:11,c:20},{p:"อุดรธานี",z:"9",r:11,c:21},{p:"อุดรธานี",z:"10",r:11,c:22},{p:"สกลนคร",z:"5",r:11,c:24},{p:"สกลนคร",z:"6",r:11,c:25},{p:"นครพนม",z:"3",r:11,c:29},{p:"ตาก",z:"3",r:12,c:3},{p:"พิษณุโลก",z:"4",r:12,c:12},{p:"พิษณุโลก",z:"5",r:12,c:13},{p:"เลย",z:"2",r:12,c:16},{p:"สกลนคร",z:"7",r:12,c:24},{p:"นครพนม",z:"4",r:12,c:28},{p:"กำแพงเพชร",z:"1",r:13,c:5},{p:"กำแพงเพชร",z:"2",r:13,c:6},{p:"พิจิตร",z:"1",r:13,c:8},{p:"พิจิตร",z:"2",r:13,c:9},{p:"พิจิตร",z:"3",r:13,c:10},{p:"เลย",z:"3",r:13,c:16},{p:"เลย",z:"4",r:13,c:17},{p:"หนองบัวลำภู",z:"1",r:13,c:19},{p:"หนองบัวลำภู",z:"2",r:13,c:20},{p:"หนองบัวลำภู",z:"3",r:13,c:21},{p:"กำแพงเพชร",z:"3",r:14,c:5},{p:"กำแพงเพชร",z:"4",r:14,c:6},{p:"กาฬสินธุ์",z:"1",r:14,c:24},{p:"กาฬสินธุ์",z:"2",r:14,c:25},{p:"กาฬสินธุ์",z:"3",r:14,c:26},{p:"มุกดาหาร",z:"1",r:14,c:29},{p:"เพชรบูรณ์",z:"1",r:15,c:13},{p:"เพชรบูรณ์",z:"2",r:15,c:14},{p:"ขอนแก่น",z:"1",r:15,c:19},{p:"ขอนแก่น",z:"2",r:15,c:20},{p:"ขอนแก่น",z:"3",r:15,c:21},{p:"กาฬสินธุ์",z:"4",r:15,c:24},{p:"กาฬสินธุ์",z:"5",r:15,c:25},{p:"กาฬสินธุ์",z:"6",r:15,c:26},{p:"มุกดาหาร",z:"2",r:15,c:29},{p:"อุทัยธานี",z:"1",r:16,c:3},{p:"นครสวรรค์",z:"1",r:16,c:7},{p:"นครสวรรค์",z:"2",r:16,c:8},{p:"นครสวรรค์",z:"3",r:16,c:9},{p:"นครสวรรค์",z:"4",r:16,c:10},{p:"เพชรบูรณ์",z:"3",r:16,c:13},{p:"เพชรบูรณ์",z:"4",r:16,c:14},{p:"ขอนแก่น",z:"4",r:16,c:20},{p:"ขอนแก่น",z:"5",r:16,c:21},{p:"อุทัยธานี",z:"2",r:17,c:4},{p:"นครสวรรค์",z:"5",r:17,c:9},{p:"นครสวรรค์",z:"6",r:17,c:10},{p:"เพชรบูรณ์",z:"5",r:17,c:13},{p:"เพชรบูรณ์",z:"6",r:17,c:14},{p:"ชัยภูมิ",z:"1",r:17,c:16},{p:"ชัยภูมิ",z:"2",r:17,c:17},{p:"ขอนแก่น",z:"6",r:17,c:20},{p:"ขอนแก่น",z:"7",r:17,c:21},{p:"ร้อยเอ็ด",z:"1",r:17,c:26},{p:"ร้อยเอ็ด",z:"2",r:17,c:27},{p:"อำนาจเจริญ",z:"1",r:17,c:30},{p:"ชัยภูมิ",z:"3",r:18,c:16},{p:"ชัยภูมิ",z:"4",r:18,c:17},{p:"ขอนแก่น",z:"8",r:18,c:20},{p:"ขอนแก่น",z:"9",r:18,c:21},{p:"มหาสารคาม",z:"1",r:18,c:23},{p:"มหาสารคาม",z:"2",r:18,c:24},{p:"ร้อยเอ็ด",z:"3",r:18,c:26},{p:"ร้อยเอ็ด",z:"4",r:18,c:27},{p:"อำนาจเจริญ",z:"2",r:18,c:31},{p:"ชัยนาท",z:"1",r:19,c:5},{p:"ชัยนาท",z:"2",r:19,c:6},{p:"สิงห์บุรี",z:"1",r:19,c:10},{p:"ลพบุรี",z:"1",r:19,c:13},{p:"ลพบุรี",z:"2",r:19,c:14},{p:"ชัยภูมิ",z:"5",r:19,c:16},{p:"ชัยภูมิ",z:"6",r:19,c:17},{p:"ชัยภูมิ",z:"7",r:19,c:18},{p:"ขอนแก่น",z:"10",r:19,c:20},{p:"ขอนแก่น",z:"11",r:19,c:21},{p:"มหาสารคาม",z:"3",r:19,c:23},{p:"มหาสารคาม",z:"4",r:19,c:24},{p:"ร้อยเอ็ด",z:"5",r:19,c:26},{p:"ร้อยเอ็ด",z:"6",r:19,c:27},{p:"ยโสธร",z:"1",r:19,c:29},{p:"ลพบุรี",z:"3",r:20,c:12},{p:"ลพบุรี",z:"4",r:20,c:13},{p:"มหาสารคาม",z:"5",r:20,c:23},{p:"มหาสารคาม",z:"6",r:20,c:24},{p:"ร้อยเอ็ด",z:"7",r:20,c:26},{p:"ร้อยเอ็ด",z:"8",r:20,c:27},{p:"ยโสธร",z:"2",r:20,c:29},{p:"อุบลราชธานี",z:"1",r:20,c:31},{p:"อ่างทอง",z:"1",r:21,c:8},{p:"อ่างทอง",z:"2",r:21,c:9},{p:"ยโสธร",z:"3",r:21,c:29},{p:"อุบลราชธานี",z:"2",r:21,c:31},{p:"อุบลราชธานี",z:"3",r:21,c:32},{p:"สุพรรณบุรี",z:"1",r:22,c:5},{p:"สุพรรณบุรี",z:"2",r:22,c:6},{p:"นครราชสีมา",z:"1",r:22,c:15},{p:"นครราชสีมา",z:"2",r:22,c:16},{p:"นครราชสีมา",z:"3",r:22,c:17},{p:"นครราชสีมา",z:"4",r:22,c:18},{p:"นครราชสีมา",z:"5",r:22,c:19},{p:"นครราชสีมา",z:"6",r:22,c:20},{p:"อุบลราชธานี",z:"4",r:22,c:31},{p:"อุบลราชธานี",z:"5",r:22,c:32},{p:"สุพรรณบุรี",z:"3",r:23,c:5},{p:"สุพรรณบุรี",z:"4",r:23,c:6},{p:"สระบุรี",z:"1",r:23,c:12},{p:"สระบุรี",z:"2",r:23,c:13},{p:"นครราชสีมา",z:"7",r:23,c:15},{p:"นครราชสีมา",z:"8",r:23,c:16},{p:"นครราชสีมา",z:"9",r:23,c:17},{p:"นครราชสีมา",z:"10",r:23,c:18},{p:"นครราชสีมา",z:"11",r:23,c:19},{p:"นครราชสีมา",z:"12",r:23,c:20},{p:"สุรินทร์",z:"1",r:23,c:24},{p:"สุรินทร์",z:"2",r:23,c:25},{p:"ศรีสะเกษ",z:"1",r:23,c:27},{p:"ศรีสะเกษ",z:"2",r:23,c:28},{p:"ศรีสะเกษ",z:"3",r:23,c:29},{p:"อุบลราชธานี",z:"6",r:23,c:31},{p:"อุบลราชธานี",z:"7",r:23,c:32},{p:"สุพรรณบุรี",z:"5",r:24,c:6},{p:"อยุธยา",z:"1",r:24,c:8},{p:"อยุธยา",z:"2",r:24,c:9},{p:"อยุธยา",z:"3",r:24,c:10},{p:"สระบุรี",z:"3",r:24,c:12},{p:"สระบุรี",z:"4",r:24,c:13},{p:"นครราชสีมา",z:"13",r:24,c:15},{p:"นครราชสีมา",z:"14",r:24,c:16},{p:"นครราชสีมา",z:"15",r:24,c:17},{p:"นครราชสีมา",z:"16",r:24,c:18},{p:"สุรินทร์",z:"3",r:24,c:23},{p:"สุรินทร์",z:"4",r:24,c:24},{p:"สุรินทร์",z:"5",r:24,c:25},{p:"ศรีสะเกษ",z:"4",r:24,c:27},{p:"ศรีสะเกษ",z:"5",r:24,c:28},{p:"ศรีสะเกษ",z:"6",r:24,c:29},{p:"อุบลราชธานี",z:"8",r:24,c:31},{p:"อุบลราชธานี",z:"9",r:24,c:32},{p:"อยุธยา",z:"4",r:25,c:9},{p:"อยุธยา",z:"5",r:25,c:10},{p:"บุรีรัมย์",z:"1",r:25,c:20},{p:"บุรีรัมย์",z:"2",r:25,c:21},{p:"สุรินทร์",z:"6",r:25,c:23},{p:"สุรินทร์",z:"7",r:25,c:24},{p:"สุรินทร์",z:"8",r:25,c:25},{p:"ศรีสะเกษ",z:"7",r:25,c:27},{p:"ศรีสะเกษ",z:"8",r:25,c:28},{p:"ศรีสะเกษ",z:"9",r:25,c:29},{p:"อุบลราชธานี",z:"10",r:25,c:31},{p:"อุบลราชธานี",z:"11",r:25,c:32},{p:"กาญจนบุรี",z:"1",r:26,c:3},{p:"ปราจีนบุรี",z:"1",r:26,c:18},{p:"บุรีรัมย์",z:"3",r:26,c:20},{p:"บุรีรัมย์",z:"4",r:26,c:21},{p:"กาญจนบุรี",z:"2",r:27,c:4},{p:"นครปฐม",z:"1",r:27,c:8},{p:"นครปฐม",z:"2",r:27,c:9},{p:"ปทุมธานี",z:"1",r:27,c:11},{p:"ปทุมธานี",z:"2",r:27,c:12},{p:"ปทุมธานี",z:"3",r:27,c:13},{p:"ปทุมธานี",z:"4",r:27,c:14},{p:"ปราจีนบุรี",z:"2",r:27,c:18},{p:"บุรีรัมย์",z:"5",r:27,c:20},{p:"บุรีรัมย์",z:"6",r:27,c:21},{p:"กาญจนบุรี",z:"3",r:28,c:4},{p:"นครปฐม",z:"3",r:28,c:8},{p:"นครปฐม",z:"4",r:28,c:9},{p:"ปทุมธานี",z:"5",r:28,c:11},{p:"ปทุมธานี",z:"6",r:28,c:12},{p:"ปทุมธานี",z:"7",r:28,c:13},{p:"ปราจีนบุรี",z:"3",r:28,c:18},{p:"บุรีรัมย์",z:"7",r:28,c:20},{p:"บุรีรัมย์",z:"8",r:28,c:21},{p:"สระแก้ว",z:"1",r:28,c:23},{p:"สระแก้ว",z:"2",r:28,c:24},{p:"กาญจนบุรี",z:"4",r:29,c:5},{p:"นครปฐม",z:"5",r:29,c:8},{p:"นครปฐม",z:"6",r:29,c:9},{p:"นครนายก",z:"1",r:29,c:15},{p:"นครนายก",z:"2",r:29,c:16},{p:"บุรีรัมย์",z:"9",r:29,c:20},{p:"บุรีรัมย์",z:"10",r:29,c:21},{p:"สระแก้ว",z:"3",r:29,c:23},{p:"กาญจนบุรี",z:"5",r:30,c:6},{p:"นนทบุรี",z:"1",r:31,c:10},{p:"นนทบุรี",z:"2",r:31,c:11},{p:"นนทบุรี",z:"3",r:31,c:12},{p:"นนทบุรี",z:"4",r:31,c:13},{p:"ฉะเชิงเทรา",z:"1",r:31,c:18},{p:"ฉะเชิงเทรา",z:"2",r:31,c:19},{p:"ฉะเชิงเทรา",z:"3",r:31,c:20},{p:"ฉะเชิงเทรา",z:"4",r:31,c:21},{p:"สมุทรสาคร",z:"1",r:32,c:7},{p:"สมุทรสาคร",z:"2",r:32,c:8},{p:"นนทบุรี",z:"5",r:32,c:10},{p:"นนทบุรี",z:"6",r:32,c:11},{p:"นนทบุรี",z:"7",r:32,c:12},{p:"นนทบุรี",z:"8",r:32,c:13},{p:"ชลบุรี",z:"1",r:32,c:15},{p:"ชลบุรี",z:"2",r:32,c:16},{p:"จันทบุรี",z:"1",r:32,c:23},{p:"สมุทรสาคร",z:"3",r:33,c:7},{p:"ชลบุรี",z:"3",r:33,c:15},{p:"ชลบุรี",z:"4",r:33,c:16},{p:"ชลบุรี",z:"5",r:33,c:17},{p:"ระยอง",z:"1",r:33,c:19},{p:"ระยอง",z:"2",r:33,c:20},{p:"ระยอง",z:"3",r:33,c:21},{p:"จันทบุรี",z:"2",r:33,c:23},{p:"จันทบุรี",z:"3",r:33,c:24},{p:"สมุทรปราการ",z:"1",r:34,c:9},{p:"สมุทรปราการ",z:"2",r:34,c:10},{p:"สมุทรปราการ",z:"3",r:34,c:11},{p:"สมุทรปราการ",z:"4",r:34,c:12},{p:"สมุทรปราการ",z:"5",r:34,c:13},{p:"ชลบุรี",z:"6",r:34,c:15},{p:"ชลบุรี",z:"7",r:34,c:16},{p:"ชลบุรี",z:"8",r:34,c:17},{p:"ระยอง",z:"4",r:34,c:20},{p:"ระยอง",z:"5",r:34,c:21},{p:"สมุทรสงคราม",z:"1",r:35,c:7},{p:"สมุทรปราการ",z:"6",r:35,c:11},{p:"สมุทรปราการ",z:"7",r:35,c:12},{p:"สมุทรปราการ",z:"8",r:35,c:13},{p:"ชลบุรี",z:"9",r:35,c:15},{p:"ตราด",z:"1",r:35,c:25},{p:"ชลบุรี",z:"10",r:36,c:15},{p:"ราชบุรี",z:"1",r:37,c:6},{p:"ราชบุรี",z:"2",r:37,c:7},{p:"ราชบุรี",z:"3",r:38,c:6},{p:"ราชบุรี",z:"4",r:38,c:7},{p:"ราชบุรี",z:"5",r:38,c:8},{p:"เพชรบุรี",z:"1",r:40,c:6},{p:"กรุงเทพมหานคร",z:"1",r:40,c:11},{p:"กรุงเทพมหานคร",z:"2",r:40,c:12},{p:"กรุงเทพมหานคร",z:"3",r:40,c:13},{p:"กรุงเทพมหานคร",z:"4",r:40,c:14},{p:"กรุงเทพมหานคร",z:"5",r:40,c:15},{p:"กรุงเทพมหานคร",z:"6",r:40,c:16},{p:"กรุงเทพมหานคร",z:"7",r:40,c:17},{p:"กรุงเทพมหานคร",z:"8",r:40,c:18},{p:"เพชรบุรี",z:"2",r:41,c:6},{p:"เพชรบุรี",z:"3",r:41,c:7},{p:"กรุงเทพมหานคร",z:"9",r:41,c:11},{p:"กรุงเทพมหานคร",z:"10",r:41,c:12},{p:"กรุงเทพมหานคร",z:"11",r:41,c:13},{p:"กรุงเทพมหานคร",z:"12",r:41,c:14},{p:"กรุงเทพมหานคร",z:"13",r:41,c:15},{p:"กรุงเทพมหานคร",z:"14",r:41,c:16},{p:"กรุงเทพมหานคร",z:"15",r:41,c:17},{p:"กรุงเทพมหานคร",z:"16",r:41,c:18},{p:"กรุงเทพมหานคร",z:"17",r:41,c:19},{p:"กรุงเทพมหานคร",z:"18",r:42,c:11},{p:"กรุงเทพมหานคร",z:"19",r:42,c:12},{p:"กรุงเทพมหานคร",z:"20",r:42,c:13},{p:"กรุงเทพมหานคร",z:"21",r:42,c:14},{p:"กรุงเทพมหานคร",z:"22",r:42,c:15},{p:"กรุงเทพมหานคร",z:"23",r:42,c:16},{p:"กรุงเทพมหานคร",z:"24",r:42,c:17},{p:"กรุงเทพมหานคร",z:"25",r:42,c:18},{p:"กรุงเทพมหานคร",z:"26",r:42,c:19},{p:"ประจวบคีรีขันธ์",z:"1",r:43,c:6},{p:"กรุงเทพมหานคร",z:"27",r:43,c:13},{p:"กรุงเทพมหานคร",z:"28",r:43,c:14},{p:"กรุงเทพมหานคร",z:"29",r:43,c:15},{p:"กรุงเทพมหานคร",z:"30",r:43,c:16},{p:"กรุงเทพมหานคร",z:"31",r:43,c:17},{p:"กรุงเทพมหานคร",z:"32",r:43,c:18},{p:"กรุงเทพมหานคร",z:"33",r:43,c:19},{p:"ประจวบคีรีขันธ์",z:"2",r:44,c:5},{p:"ประจวบคีรีขันธ์",z:"3",r:45,c:4},{p:"ชุมพร",z:"1",r:47,c:4},{p:"ชุมพร",z:"2",r:48,c:3},{p:"ชุมพร",z:"3",r:49,c:3},{p:"ระนอง",z:"1",r:51,c:2},{p:"สุราษฎร์ธานี",z:"1",r:52,c:4},{p:"สุราษฎร์ธานี",z:"2",r:52,c:5},{p:"พังงา",z:"1",r:53,c:2},{p:"สุราษฎร์ธานี",z:"3",r:53,c:4},{p:"สุราษฎร์ธานี",z:"4",r:53,c:5},{p:"พังงา",z:"2",r:54,c:2},{p:"สุราษฎร์ธานี",z:"5",r:54,c:4},{p:"สุราษฎร์ธานี",z:"6",r:54,c:5},{p:"นครศรีธรรมราช",z:"1",r:54,c:7},{p:"สุราษฎร์ธานี",z:"7",r:55,c:5},{p:"นครศรีธรรมราช",z:"2",r:55,c:7},{p:"ภูเก็ต",z:"1",r:56,c:1},{p:"นครศรีธรรมราช",z:"3",r:56,c:7},{p:"นครศรีธรรมราช",z:"4",r:56,c:8},{p:"นครศรีธรรมราช",z:"5",r:56,c:9},{p:"ภูเก็ต",z:"2",r:57,c:1},{p:"กระบี่",z:"1",r:57,c:3},{p:"กระบี่",z:"2",r:57,c:4},{p:"นครศรีธรรมราช",z:"6",r:57,c:7},{p:"นครศรีธรรมราช",z:"7",r:57,c:8},{p:"นครศรีธรรมราช",z:"8",r:57,c:9},{p:"ภูเก็ต",z:"3",r:58,c:1},{p:"กระบี่",z:"3",r:58,c:3},{p:"นครศรีธรรมราช",z:"9",r:58,c:8},{p:"นครศรีธรรมราช",z:"10",r:58,c:9},{p:"ตรัง",z:"1",r:60,c:4},{p:"ตรัง",z:"2",r:60,c:5},{p:"พัทลุง",z:"1",r:60,c:7},{p:"ตรัง",z:"3",r:61,c:4},{p:"ตรัง",z:"4",r:61,c:5},{p:"พัทลุง",z:"2",r:61,c:7},{p:"พัทลุง",z:"3",r:61,c:8},{p:"สตูล",z:"1",r:63,c:5},{p:"สงขลา",z:"1",r:63,c:7},{p:"สงขลา",z:"2",r:63,c:8},{p:"สงขลา",z:"3",r:63,c:9},{p:"สตูล",z:"2",r:64,c:5},{p:"สงขลา",z:"4",r:64,c:7},{p:"สงขลา",z:"5",r:64,c:8},{p:"สงขลา",z:"6",r:64,c:9},{p:"ปัตตานี",z:"1",r:64,c:11},{p:"ปัตตานี",z:"2",r:64,c:12},{p:"สงขลา",z:"7",r:65,c:7},{p:"สงขลา",z:"8",r:65,c:8},{p:"สงขลา",z:"9",r:65,c:9},{p:"ปัตตานี",z:"3",r:65,c:11},{p:"ปัตตานี",z:"4",r:65,c:12},{p:"ปัตตานี",z:"5",r:65,c:13},{p:"ยะลา",z:"1",r:67,c:11},{p:"ยะลา",z:"2",r:67,c:12},{p:"ยะลา",z:"3",r:68,c:12},{p:"นราธิวาส",z:"1",r:68,c:14},{p:"นราธิวาส",z:"2",r:68,c:15},{p:"นราธิวาส",z:"3",r:69,c:14},{p:"นราธิวาส",z:"4",r:69,c:15},{p:"นราธิวาส",z:"5",r:69,c:16}
];

const MAP_CONST_URL  = "https://gist.githubusercontent.com/saranpornsasi/5dd6e8b3d819c8805314e17456e069bf/raw/pt_constituency.csv";
const MAP_PLIST_URL  = "https://gist.githubusercontent.com/saranpornsasi/59b5870b5ed21abf96eb5095decdde65/raw/pt_partylist.csv";
const SES_URL        = "https://gist.githubusercontent.com/saranpornsasi/9c3125cb8c56b076f26abbc0b83d5fa0/raw/b7da73355065defd606da75a1adb0ccd5b184a11/complete_ses.csv";
const GEN_URL        = "https://gist.githubusercontent.com/saranpornsasi/11786ea2af9384b8d92e9ba1a069da78/raw/534dc8cbeecb4c2e8f773a86c4b81ec82482c51e/voter_age.csv";
const ANALYSIS_URL   = "https://gist.githubusercontent.com/getwariss/502c2f201fb847f5c4c295478a60995c/raw/857a338183c8c40456e39fc79e58dde3430dfd26/data_66vs69.csv";

const PARTY_COLORS = {
    'เพื่อไทย':'#C72222','ประชาชน':'#f47933','ก้าวไกล':'#f47933',
    'ภูมิใจไทย':'#243273','กล้าธรรม':'#7ed956','ประชาธิปัตย์':'#00aeef',
    'พลังประชารัฐ':'#056839','ประชาชาติ':'#a56f05','โอกาสใหม่':'#f3717b',
    'ไทรวมพลัง':'#ee008c','ไทยสร้างไทย':'#7d21e0','รวมไทยสร้างชาติ':'#7c7cfa'
};

const REGION_MAP = {
    เชียงใหม่:"เหนือ",เชียงราย:"เหนือ",แม่ฮ่องสอน:"เหนือ",ลำปาง:"เหนือ",ลำพูน:"เหนือ",พะเยา:"เหนือ",แพร่:"เหนือ",น่าน:"เหนือ",
    ตาก:"ตะวันตก",สุโขทัย:"เหนือ",อุตรดิตถ์:"เหนือ",พิษณุโลก:"เหนือ",พิจิตร:"เหนือ",เพชรบูรณ์:"เหนือ",
    กาญจนบุรี:"ตะวันตก",ราชบุรี:"ตะวันตก",เพชรบุรี:"ตะวันตก",ประจวบคีรีขันธ์:"ตะวันตก",
    กำแพงเพชร:"กลาง",นครสวรรค์:"กลาง",นนทบุรี:"กลาง",ปทุมธานี:"กลาง",สมุทรปราการ:"กลาง",
    สมุทรสาคร:"กลาง",สมุทรสงคราม:"กลาง",นครปฐม:"กลาง",สุพรรณบุรี:"กลาง",อ่างทอง:"กลาง",
    สิงห์บุรี:"กลาง",ชัยนาท:"กลาง",ลพบุรี:"กลาง",สระบุรี:"กลาง",นครนายก:"กลาง",
    พระนครศรีอยุธยา:"กลาง",อยุธยา:"กลาง",อุทัยธานี:"กลาง",กรุงเทพมหานคร:"กรุงเทพมหานคร","กรุงเทพฯ":"กรุงเทพมหานคร",
    กาฬสินธุ์:"อีสาน",ขอนแก่น:"อีสาน",ชัยภูมิ:"อีสาน",นครพนม:"อีสาน",นครราชสีมา:"อีสาน",
    บึงกาฬ:"อีสาน",บุรีรัมย์:"อีสาน",มหาสารคาม:"อีสาน",มุกดาหาร:"อีสาน",ยโสธร:"อีสาน",
    ร้อยเอ็ด:"อีสาน",เลย:"อีสาน",ศรีสะเกษ:"อีสาน",ศรีสะเกษ:"อีสาน",สกลนคร:"อีสาน",
    สุรินทร์:"อีสาน",หนองคาย:"อีสาน",หนองบัวลำภู:"อีสาน",อำนาจเจริญ:"อีสาน",อุดรธานี:"อีสาน",อุบลราชธานี:"อีสาน",
    ปราจีนบุรี:"ตะวันออก",สระแก้ว:"ตะวันออก",ฉะเชิงเทรา:"ตะวันออก",ชลบุรี:"ตะวันออก",ระยอง:"ตะวันออก",จันทบุรี:"ตะวันออก",ตราด:"ตะวันออก",
    ชุมพร:"ใต้",กระบี่:"ใต้",ตรัง:"ใต้",นครศรีธรรมราช:"ใต้",นราธิวาส:"ใต้",ปัตตานี:"ใต้",
    พังงา:"ใต้",พัทลุง:"ใต้",ภูเก็ต:"ใต้",ยะลา:"ใต้",ระนอง:"ใต้",สงขลา:"ใต้",สตูล:"ใต้",สุราษฎร์ธานี:"ใต้"
};

// State
let DATA_CONST = [], DATA_PLIST = [], DATA_INCOME = {}, DATA_DEMO = {};
let NAT_AVG = {fv:0,z:0,y:0,x:0,senior:0};
let globalWinningParties = new Set();
let currentMode = "const";
const filterState = {regions:new Set(),ranks:new Set(),compare:new Set(),demos:new Set(),gapMin:0,gapMax:100,incMin:0,incMax:Infinity};
let constMap = new Map(), plistMap = new Map();

// Helpers
const normProv = p => {
    if (!p) return "";
    const s = p.trim();
    if (s.includes("กรุงเทพ") || s === "กทม.") return "กรุงเทพมหานคร";
    if (s.includes("อยุธยา")) return "พระนครศรีอยุธยา";
    if (s === "ศรีสะเกษ") return "ศรีสะเกษ";
    return s;
};
const makeKey = (p,z) => `${normProv(p)}__${String(z).trim()}`;
const checkWin = v => { const s=String(v??"").trim().toUpperCase(); return s==="TRUE"||s==="1"; };
const hasData  = d => d!=null && !["","0","-"].includes(String(d.pt_rank??"").trim());

const getTileColor = d => {
    if (!hasData(d)) return "#c0c6cc";
    const gap = parseFloat(d["คะแนนห่าง (%)"]) || 0, win = checkWin(d.is_win);
    const l = 95 - (Math.min(gap, 40) / 40) * 60;
    return win ? `hsl(0,82%,${l}%)` : `hsl(212,72%,${l}%)`;
};
const getTileTextColor = d => {
    if (!hasData(d)) return "#5a6268";
    const gap = parseFloat(d["คะแนนห่าง (%)"]) || 0;
    return gap < 20 ? (checkWin(d.is_win) ? "#8B0000" : "#003366") : "#ffffff";
};

function getMatchedPartyKey(name) {
    if (!name) return null;
    for (const k of Object.keys(PARTY_COLORS)) { if (name.includes(k)) return k; }
    return null;
}
const getPartyColor = name => { const k=getMatchedPartyKey(name); return k?PARTY_COLORS[k]:"#999"; };

function generatePartyLegend() {
    const c = document.getElementById("dynamic-party-legend"); if(!c) return;
    let html = '';
    for (const [party, color] of Object.entries(PARTY_COLORS)) {
        if (party === 'ก้าวไกล') continue;
        if (globalWinningParties.has(party) || party === 'เพื่อไทย') {
            let label = party;
            if (party === 'ประชาชน') label = 'ประชาชน/ก้าวไกล';
            html += `<div class="legend-item"><div class="legend-swatch" style="background:${color}"></div>${label}</div>`;
        }
    }
    c.innerHTML = html;
}

function getBaseFilterMatch(pNorm) {
    const inc = DATA_INCOME[pNorm] || 0;
    const dm  = DATA_DEMO[pNorm] || {};
    if (filterState.regions.size > 0 && !filterState.regions.has(REGION_MAP[pNorm])) return false;
    if (inc < filterState.incMin || inc > filterState.incMax) return false;
    if (filterState.demos.size > 0) {
        const keys = {fv:"fvPct",z:"zPct",y:"yPct",x:"xPct",senior:"seniorPct"};
        const ok = [...filterState.demos].some(k => (dm[keys[k]]||0) > NAT_AVG[k]);
        if (!ok) return false;
    }
    return true;
}

const parseCSV = text => {
    const lines = text.trim().split("\n");
    if (lines.length < 2) return [];
    const headers = lines[0].replace(/^\uFEFF/,"").replace(/\r$/,"").split(",").map(h => h.trim());
    return lines.slice(1).map(line => {
        const vals = line.replace(/\r$/,"").split(",");
        return Object.fromEntries(headers.map((h,i) => [h,(vals[i]??"").trim()]));
    });
};

// SVG Tile Map
const TILE_SIZE = 28, TILE_GAP = 5, TILE_STEP = 33, TILE_R = 4;
let mapSvg = null, mapG = null, svgZoom = null, svgBuilt = false;

function getSVGFillColor(prov, zone, mode) {
    const key  = makeKey(prov, zone);
    const data = mode === "plist" ? plistMap.get(key) : constMap.get(key);
    if (!hasData(data)) return "#c0c6cc";
    const gap = parseFloat(data["คะแนนห่าง (%)"]) || 0;
    const win = checkWin(data.is_win);
    const l = 95 - (Math.min(gap, 40) / 40) * 60;
    return win ? `hsl(0,82%,${l}%)` : `hsl(212,72%,${l}%)`;
}
function getSVGTextColor(prov, zone, mode) {
    const key  = makeKey(prov, zone);
    const data = mode === "plist" ? plistMap.get(key) : constMap.get(key);
    if (!hasData(data)) return "#5a6268";
    const gap = parseFloat(data["คะแนนห่าง (%)"]) || 0;
    return gap < 20 ? (checkWin(data.is_win) ? "#8B0000" : "#003366") : "#ffffff";
}

function buildSVGMap() {
    const svg = d3.select("#map-svg");
    const g   = d3.select("#map-g");
    mapSvg = svg; mapG = g;
    g.selectAll("*").remove();

    const zoom = d3.zoom()
        .scaleExtent([0.08, 10])
        .on("zoom", e => g.attr("transform", e.transform));
    svg.call(zoom);
    svgZoom = zoom;

    const provFirst = {};
    GRID_DATA.forEach(d => { if (!provFirst[d.p]) provFirst[d.p] = d; });
    const labelsG = g.append("g").attr("class", "prov-labels");
    Object.entries(provFirst).forEach(([prov, d]) => {
        labelsG.append("text")
            .attr("class", "prov-label")
            .attr("x", (d.c - 1) * TILE_STEP)
            .attr("y", (d.r - 1) * TILE_STEP - 10)
            .text(prov)
            .attr("font-size", "16px")
            .attr("font-weight", "900")
            .attr("font-family", "Prompt, Sarabun, sans-serif")
            .style("pointer-events", "none");
    });

    const tilesG = g.append("g").attr("class", "tiles");
    GRID_DATA.forEach(pos => {
        const key   = makeKey(pos.p, pos.z);
        const cData = constMap.get(key);
        const pData = plistMap.get(key);
        const x = (pos.c - 1) * TILE_STEP;
        const y = (pos.r - 1) * TILE_STEP;

        const tileG = tilesG.append("g")
            .attr("class", "tile-g")
            .attr("data-key", key)
            .attr("data-prov", pos.p)
            .attr("data-zone", pos.z)
            .attr("transform", `translate(${x},${y})`);

        tileG.append("rect")
            .attr("width", TILE_SIZE).attr("height", TILE_SIZE)
            .attr("rx", TILE_R).attr("ry", TILE_R)
            .attr("class", "tile-rect");

        tileG.append("text")
            .attr("class", "tile-text")
            .attr("x", TILE_SIZE / 2).attr("y", TILE_SIZE / 2 + 1)
            .attr("font-size", "16px")
            .text(pos.z);

        tileG.on("mouseenter", function(event) {
            showTooltip(event, cData, pData);
        }).on("mousemove", function(event) {
            positionTooltipAt(event);
        }).on("mouseleave", () => {
            document.getElementById("tooltip").style.display = "none";
        });
    });

    svgBuilt = true;
    updateMapColors();
    setTimeout(() => { fitMap(); updateMapColors(); }, 400);

    const zIn  = document.getElementById("zoom-in");  if (zIn)  zIn.onclick  = () => svg.transition().call(zoom.scaleBy, 1.5);
    const zOut = document.getElementById("zoom-out"); if (zOut) zOut.onclick = () => svg.transition().call(zoom.scaleBy, 0.67);
    const zFit = document.getElementById("zoom-fit"); if (zFit) zFit.onclick = fitMap;
}

function fitMap() {
    if (!mapSvg || !svgZoom) return;
    const container = document.getElementById("map-container");
    const W = container.clientWidth, H = container.clientHeight;
    const maxR = d3.max(GRID_DATA, d => d.r), maxC = d3.max(GRID_DATA, d => d.c);
    const contentW = maxC * TILE_STEP, contentH = maxR * TILE_STEP + 40;
    const scale = Math.min(W / contentW, H / contentH) * 0.88;
    const tx = (W - contentW * scale) / 2, ty = (H - contentH * scale) / 2 + 18 * scale;
    mapSvg.transition().duration(700).ease(d3.easeCubicOut)
        .call(svgZoom.transform, d3.zoomIdentity.translate(tx, ty).scale(scale));
}

function updateMapColors() {
    if (!svgBuilt) return;
    document.getElementById("normal-legend").style.display  = currentMode === "compare" ? "none" : "flex";
    document.getElementById("compare-legend").style.display = currentMode === "compare" ? "flex" : "none";

    d3.selectAll(".tile-g").each(function() {
        const el   = d3.select(this);
        const prov = this.dataset.prov, zone = this.dataset.zone, key = this.dataset.key;
        const cData = constMap.get(key), pData = plistMap.get(key);
        const pNorm = normProv(prov);
        let fillColor, textColor, strokeColor = "rgba(0,0,0,0.06)", strokeWidth = 1;

        if (currentMode === "compare") {
            const cW = hasData(cData) ? checkWin(cData.is_win) : null;
            const pW = hasData(pData) ? checkWin(pData.is_win) : null;
            if (cW !== null && pW !== null) {
                fillColor = getPartyColor(cData.first_party);
                strokeColor = getPartyColor(pData.first_party);
                strokeWidth = 4; textColor = "#fff";
            } else { fillColor = "#dee2e6"; textColor = "#adb5bd"; }
        } else {
            fillColor = getSVGFillColor(prov, zone, currentMode);
            textColor = getSVGTextColor(prov, zone, currentMode);
        }

        const showData = currentMode === "plist" ? pData : cData;
        let visible = true;
        if (currentMode !== "compare") {
            if (!hasData(showData) || !getBaseFilterMatch(pNorm)) { visible = false; }
            else {
                const gap = parseFloat(showData["คะแนนห่าง (%)"]) || 0;
                const rank = parseInt(showData.pt_rank || 99) || 99;
                const win  = checkWin(showData.is_win);
                if (gap < filterState.gapMin || gap > filterState.gapMax) visible = false;
                if (filterState.ranks.size > 0) {
                    let rOk = false;
                    if (filterState.ranks.has("1") && win) rOk = true;
                    if (filterState.ranks.has("2") && rank === 2) rOk = true;
                    if (filterState.ranks.has("3") && rank >= 3 && rank < 99) rOk = true;
                    if (!rOk) visible = false;
                }
            }
        } else {
            const cW = hasData(cData) ? checkWin(cData.is_win) : null;
            const pW = hasData(pData) ? checkWin(pData.is_win) : null;
            let type = "";
            if      (cW===true  && pW===true)  type="WW";
            else if (cW===true  && pW===false) type="WL";
            else if (cW===false && pW===true)  type="LW";
            else if (cW===false && pW===false) type="LL";
            const compOk = filterState.compare.size===0 || filterState.compare.has(type);
            if (!getBaseFilterMatch(pNorm) || !compOk) visible = false;
        }

        el.select("rect")
            .attr("fill", visible ? fillColor : "#c8cdd3")
            .attr("stroke", visible ? strokeColor : "rgba(0,0,0,0.04)")
            .attr("stroke-width", visible ? strokeWidth : 1)
            .attr("opacity", 1);
        el.select(".tile-text")
            .attr("fill", visible ? textColor : "#9aa0a6")
            .attr("opacity", 1);
    });
    renderStats();
}

function render() { updateMapColors(); updateMapInsightBar(); }

function getGapColor(gap, win) {
    // Mirror map: l = 95 - (min(gap,40)/40)*60  → range 35–95
    const l = 95 - (Math.min(gap, 40) / 40) * 60;
    return win ? `hsl(0,82%,${l}%)` : `hsl(212,72%,${l}%)`;
}
function getGapTextColor(gap) {
    return gap < 20 ? '#1a1d23' : '#ffffff';
}

function renderStats() {
    const el = document.getElementById("stats-row");
    if (currentMode !== "compare") {
        const src    = currentMode==="const"?DATA_CONST:DATA_PLIST;
        const active = src.filter(d => {
            if (!hasData(d)) return false;
            const pNorm = normProv(d.province);
            if (!getBaseFilterMatch(pNorm)) return false;
            const gap=parseFloat(d["คะแนนห่าง (%)"])||0, rank=parseInt(d.pt_rank||99)||99, win=checkWin(d.is_win);
            let rOk = filterState.ranks.size===0;
            if(filterState.ranks.has("1")&&win) rOk=true;
            if(filterState.ranks.has("2")&&rank===2) rOk=true;
            if(filterState.ranks.has("3")&&rank>=3&&rank<99) rOk=true;
            return rOk && gap>=filterState.gapMin && gap<=filterState.gapMax;
        });
        const won=active.filter(d=>checkWin(d.is_win)).length, total=active.length;
        const pct=total?((won/total)*100).toFixed(1):"0.0";
        el.innerHTML=`
            <div class="stat-card"><div class="stat-label">เขตที่ชนะ</div><div class="stat-value" style="color:#C72222">${won}</div></div>
            <div class="stat-card"><div class="stat-label">เขตทั้งหมด (กรอง)</div><div class="stat-value" style="color:#374151">${total}</div></div>
            <div class="stat-card"><div class="stat-label">อัตราชนะ</div><div class="stat-value" style="color:#243273">${pct}%</div></div>
            <div class="stat-card"><div class="stat-label">เขตที่แพ้</div><div class="stat-value" style="color:#1e64aa">${total-won}</div></div>`;
    } else {
        let WW=0,WL=0,LW=0,LL=0;
        GRID_DATA.forEach(pos=>{
            if(!getBaseFilterMatch(normProv(pos.p))) return;
            const k=makeKey(pos.p,pos.z); const cd=constMap.get(k),pd=plistMap.get(k);
            if(!hasData(cd)||!hasData(pd)) return;
            const cW=checkWin(cd.is_win),pW=checkWin(pd.is_win);
            if(cW&&pW)WW++; else if(cW&&!pW)WL++; else if(!cW&&pW)LW++; else LL++;
        });
        el.innerHTML=`
            <div class="stat-card"><div class="stat-label">ชนะทั้งคู่ (WW)</div><div class="stat-value" style="color:#C72222">${WW}</div></div>
            <div class="stat-card"><div class="stat-label">ชนะเขต/แพ้รายชื่อ (WL)</div><div class="stat-value" style="color:#e8a020">${WL}</div></div>
            <div class="stat-card"><div class="stat-label">แพ้เขต/ชนะรายชื่อ (LW)</div><div class="stat-value" style="color:#243273">${LW}</div></div>
            <div class="stat-card"><div class="stat-label">แพ้ทั้งคู่ (LL)</div><div class="stat-value" style="color:#6b7280">${LL}</div></div>`;
    }
}

function showTooltip(e, cData, pData) {
    const tt = document.getElementById("tooltip");
    if (!hasData(cData)) return;
    const p = normProv(cData.province), inc = DATA_INCOME[p]||0, dm = DATA_DEMO[p]||{};
    const fp = v => (v||0).toFixed(1);
    let html = `<div class="tt-prov">${cData.province} เขต ${cData.zone}</div>
        <div style="font-size:11px;color:#9ca3af;padding-bottom:10px;border-bottom:1px dashed rgba(255,255,255,0.15);line-height:1.8">
            First Voter <b style="color:#fff">${fp(dm.fvPct)}%</b> | Gen Z <b style="color:#fff">${fp(dm.zPct)}%</b> | Gen Y <b style="color:#fff">${fp(dm.yPct)}%</b><br>
            Gen X <b style="color:#fff">${fp(dm.xPct)}%</b> | ผู้สูงวัย <b style="color:#fff">${fp(dm.seniorPct)}%</b> | รายได้ <b style="color:#fff">${inc.toLocaleString()}฿</b>
        </div>`;

    const buildSection = (d, isPl, showT) => {
        if (!hasData(d)) return `<div class="tt-section" style="color:#6b7280">ไม่มีข้อมูล</div>`;
        const win=checkWin(d.is_win), gap=(parseFloat(d["คะแนนห่าง (%)"])||0).toFixed(1);
        const cand=d["ผู้สมัคร"]||d.pt_candidate||"-";
        const fmt=n=>Number(n||0).toLocaleString();
        let s=showT?`<div class="tt-title">${isPl?"สส. บัญชีรายชื่อ":"สส. แบ่งเขต"}</div>`:"";
        s+=`<div class="tt-row" style="border-top:1px dashed rgba(255,255,255,0.15);padding-top:8px"><span>พรรคที่ชนะ:</span><span class="tt-val" style="color:${win?"#ff9999":getPartyColor(d.first_party)}">${win?"เพื่อไทย":(d.first_party||"-")}</span></div>`;
        if(!isPl) s+=`<div class="tt-row"><span>ผู้สมัคร:</span><span class="tt-val">${cand}</span></div>`;
        s+=`<div class="tt-row"><span>คะแนนเพื่อไทย:</span><span class="tt-val">${fmt(d.pt_votes)}</span></div>`;
        if(!win) s+=`<div class="tt-row"><span>อันดับเพื่อไทย:</span><span class="tt-val">อันดับ ${d.pt_rank}</span></div>`;
        s+=`<div class="tt-row"><span>ส่วนต่างคะแนน:</span><span class="tt-val">${gap}%</span></div>`;
        s+=`<div style="margin-top:10px;text-align:center;font-weight:700;font-size:12px;color:${win?"#fca5a5":"#93c5fd"}">${win?"✓ เพื่อไทยชนะ":"✗ เพื่อไทยแพ้"}</div>`;
        return s;
    };

    if (currentMode==="const") html+=buildSection(cData,false,true);
    else if (currentMode==="plist") html+=buildSection(cData,true,true);
    else { html+=buildSection(cData,false,true); html+=`<div style="border-top:1px solid rgba(255,255,255,0.15);margin:12px 0"></div>`; html+=buildSection(pData,true,true); }

    tt.innerHTML=html; tt.style.display="block";
    positionTooltipAt(e);
}

function positionTooltipAt(e) {
    const tt = document.getElementById("tooltip");
    if (!tt || tt.style.display === "none") return;
    const {width:tw,height:th}=tt.getBoundingClientRect();
    let x=e.clientX+15,y=e.clientY+15;
    if(x+tw>window.innerWidth) x=e.clientX-tw-15;
    if(y+th>window.innerHeight) y=e.clientY-th-15;
    tt.style.left=`${x}px`; tt.style.top=`${y}px`;
}

const setupRange = ({minId,maxId,fillId,minLblId,maxLblId,dMin,dMax,step=1,fmt,onChange}) => {
    const mn=document.getElementById(minId),mx=document.getElementById(maxId),fill=document.getElementById(fillId);
    mn.min=dMin;mn.max=dMax;mn.value=dMin;mn.step=step;
    mx.min=dMin;mx.max=dMax;mx.value=dMax;mx.step=step;
    const upd=ev=>{
        if(+mn.value>+mx.value){ if(ev?.target===mn)mn.value=mx.value; else mx.value=mn.value; }
        const span=dMax-dMin||1;
        fill.style.left=((+mn.value-dMin)/span*100)+"%";
        fill.style.width=((+mx.value-+mn.value)/span*100)+"%";
        document.getElementById(minLblId).textContent=fmt(+mn.value);
        document.getElementById(maxLblId).textContent=fmt(+mx.value);
        onChange(+mn.value,+mx.value); render();
    };
    mn.addEventListener("input",upd); mx.addEventListener("input",upd); upd();
};

const setupCheckGroup = (id,stateSet) => {
    document.getElementById(id).querySelectorAll("input[type=checkbox]").forEach(cb=>{
        cb.addEventListener("change",()=>{ cb.checked?stateSet.add(cb.value):stateSet.delete(cb.value); render(); });
    });
};

async function loadMapData() {
    try {
        const nc="?t="+Date.now();
        const [r1,r2,r3,r4]=await Promise.all([fetch(MAP_CONST_URL+nc),fetch(MAP_PLIST_URL+nc),fetch(SES_URL+nc),fetch(GEN_URL+nc)]);
        const mapRow=d=>({...d,province:normProv(d["จังหวัด"]||d.province),zone:(d["เขต"]||d.zone||"").trim()});
        DATA_CONST=parseCSV(await r1.text()).map(mapRow);
        DATA_PLIST=parseCSV(await r2.text()).map(mapRow);
        DATA_CONST.forEach(d=>constMap.set(makeKey(d.province,d.zone),d));
        DATA_PLIST.forEach(d=>plistMap.set(makeKey(d.province,d.zone),d));
        DATA_CONST.forEach(d=>{ const k=getMatchedPartyKey(d.first_party); if(k) globalWinningParties.add(k); });
        DATA_PLIST.forEach(d=>{ const k=getMatchedPartyKey(d.first_party); if(k) globalWinningParties.add(k); });
        generatePartyLegend();

        let minInc=Infinity,maxInc=-Infinity;
        parseCSV(await r3.text()).forEach(d=>{
            const p=normProv(d.province),v=parseFloat(d.income)||0;
            DATA_INCOME[p]=v; if(v>0&&v<minInc)minInc=v; if(v>maxInc)maxInc=v;
        });

        const nat={fv:0,z:0,y:0,x:0,senior:0,all:0};
        parseCSV(await r4.text()).forEach(d=>{
            const p=normProv(d.province);
            const fv=parseFloat(d["First Voter"])||0,z=parseFloat(d["Gen Z"])||0,y=parseFloat(d["Gen Y"])||0,x=parseFloat(d["Gen X"])||0;
            const sr=(parseFloat(d["Baby Boomers"])||0)+(parseFloat(d["Silent"])||0);
            const tot=fv+z+y+x+sr;
            DATA_DEMO[p]={fvPct:tot?(fv/tot)*100:0,zPct:tot?(z/tot)*100:0,yPct:tot?(y/tot)*100:0,xPct:tot?(x/tot)*100:0,seniorPct:tot?(sr/tot)*100:0};
            nat.fv+=fv;nat.z+=z;nat.y+=y;nat.x+=x;nat.senior+=sr;nat.all+=tot;
        });
        if(nat.all>0) NAT_AVG={fv:(nat.fv/nat.all)*100,z:(nat.z/nat.all)*100,y:(nat.y/nat.all)*100,x:(nat.x/nat.all)*100,senior:(nat.senior/nat.all)*100};

        document.getElementById("loading-overlay").classList.add("hidden");

        document.querySelectorAll(".mode-btn").forEach(btn=>{
            btn.addEventListener("click",()=>{
                document.querySelectorAll(".mode-btn").forEach(b=>b.classList.remove("active"));
                btn.classList.add("active"); currentMode=btn.dataset.mode;
                const isCmp=currentMode==="compare";
                // Desktop sidebar sections
                const secRank    = document.getElementById("section-rank");
                const secGap     = document.getElementById("section-gap");
                const secCompare = document.getElementById("section-compare");
                const catConstp  = document.getElementById("cat-constp");
                const catCompare = document.getElementById("cat-compare");
                if(secRank)    secRank.style.display    = isCmp?"none":"";
                if(secGap)     secGap.style.display     = isCmp?"none":"";
                if(secCompare) secCompare.style.display = isCmp?"":"none";
                if(catConstp)  catConstp.style.display  = isCmp?"none":"";
                if(catCompare) catCompare.style.display = isCmp?"":"none";
                // Mobile filter panel sections
                const mobRank    = document.getElementById("mob-group-rank");
                const mobGap     = document.getElementById("mob-group-gap");
                const mobCompare = document.getElementById("mob-group-compare");
                if(mobRank)    mobRank.style.display    = isCmp?"none":"";
                if(mobGap)     mobGap.style.display     = isCmp?"none":"";
                if(mobCompare) mobCompare.style.display = isCmp?"":"none";
                // Show contextual tutorial banner when entering compare mode
                const cmpTut = document.getElementById("compare-tutorial-banner");
                if (cmpTut) cmpTut.style.display = isCmp ? "" : "none";
                render();
            });
        });

        // ── Desktop sidebar: wire checkgroups ──
        setupCheckGroup("dd-region", filterState.regions);
        setupCheckGroup("dd-rank",   filterState.ranks);
        setupCheckGroup("dd-compare",filterState.compare);
        setupCheckGroup("dd-demo",   filterState.demos);

        // Desktop sidebar: clear buttons
        document.getElementById('sidebar-map').addEventListener("click",e=>{
            const btn=e.target.closest(".clear-btn"); if(!btn) return;
            const key=btn.dataset.target; filterState[key].clear();
            btn.closest(".dd-checkgroup").querySelectorAll("input").forEach(i=>i.checked=false); render();
        });

        // Desktop gap range
        filterState.gapMin=0; filterState.gapMax=100;
        setupRange({minId:"f-gap-min",maxId:"f-gap-max",fillId:"range-fill",minLblId:"range-val-min",maxLblId:"range-val-max",dMin:0,dMax:100,step:1,fmt:v=>`${v}%`,onChange:(mn,mx)=>{filterState.gapMin=mn;filterState.gapMax=mx;}});

        const iMin=Math.floor(minInc/1000)*1000, iMax=Math.ceil(maxInc/1000)*1000;
        filterState.incMin=iMin; filterState.incMax=iMax;

        // Desktop income range
        setupRange({minId:"f-inc-min",maxId:"f-inc-max",fillId:"range-fill-inc",minLblId:"range-val-inc-min",maxLblId:"range-val-inc-max",dMin:iMin,dMax:iMax,step:1000,fmt:v=>`${(v/1000).toFixed(0)}k฿`,onChange:(mn,mx)=>{filterState.incMin=mn;filterState.incMax=mx;}});

        // ── Mobile filter bar: wire checkgroups ──
        document.querySelectorAll('.mob-region-cb').forEach(cb=>cb.addEventListener('change',()=>{
            cb.checked?filterState.regions.add(cb.value):filterState.regions.delete(cb.value);
            // Sync desktop checkboxes
            const desktopCb = document.querySelector(`#dd-region input[value="${cb.value}"]`);
            if(desktopCb) desktopCb.checked = cb.checked;
            updateMobDropdownLabel('region'); render();
        }));
        document.querySelectorAll('.mob-demo-cb').forEach(cb=>cb.addEventListener('change',()=>{
            cb.checked?filterState.demos.add(cb.value):filterState.demos.delete(cb.value);
            const desktopCb = document.querySelector(`#dd-demo input[value="${cb.value}"]`);
            if(desktopCb) desktopCb.checked = cb.checked;
            updateMobDropdownLabel('demo'); render();
        }));
        document.querySelectorAll('.mob-rank-cb').forEach(cb=>cb.addEventListener('change',()=>{
            cb.checked?filterState.ranks.add(cb.value):filterState.ranks.delete(cb.value);
            const desktopCb = document.querySelector(`#dd-rank input[value="${cb.value}"]`);
            if(desktopCb) desktopCb.checked = cb.checked;
            render();
        }));
        document.querySelectorAll('.mob-compare-cb').forEach(cb=>cb.addEventListener('change',()=>{
            cb.checked?filterState.compare.add(cb.value):filterState.compare.delete(cb.value);
            const desktopCb = document.querySelector(`#dd-compare input[value="${cb.value}"]`);
            if(desktopCb) desktopCb.checked = cb.checked;
            render();
        }));

        // Mobile gap range
        setupRange({minId:"mob-f-gap-min",maxId:"mob-f-gap-max",fillId:"mob-range-fill",minLblId:"mob-range-val-min",maxLblId:"mob-range-val-max",dMin:0,dMax:100,step:1,fmt:v=>`${v}%`,onChange:(mn,mx)=>{
            filterState.gapMin=mn; filterState.gapMax=mx;
            // Sync desktop sliders
            const dMin=document.getElementById('f-gap-min'), dMax=document.getElementById('f-gap-max');
            if(dMin){dMin.value=mn;} if(dMax){dMax.value=mx;}
            render();
        }});

        // Mobile income range
        setupRange({minId:"mob-f-inc-min",maxId:"mob-f-inc-max",fillId:"mob-range-fill-inc",minLblId:"mob-range-val-inc-min",maxLblId:"mob-range-val-inc-max",dMin:iMin,dMax:iMax,step:1000,fmt:v=>`${(v/1000).toFixed(0)}k฿`,onChange:(mn,mx)=>{
            filterState.incMin=mn; filterState.incMax=mx;
            const dMin=document.getElementById('f-inc-min'), dMax=document.getElementById('f-inc-max');
            if(dMin){dMin.value=mn;} if(dMax){dMax.value=mx;}
            render();
        }});

        buildSVGMap();
    } catch(err) {
        console.error(err);
        document.getElementById("loading-overlay").innerHTML="<p style='color:red;padding:20px;font-family:Sarabun'>โหลดข้อมูลไม่สำเร็จ กรุณาลองใหม่</p>";
    }
}

// ═══════════════════════════════════════════════════
// ANALYSIS TAB (66vs69)
// ═══════════════════════════════════════════════════
let masterData = [], sankeyChart, analysisLoaded = false;
const analysisRegionMap = REGION_MAP;
const partyColorsAnalysis = {
    'เพื่อไทย':'#C72222','ประชาชน':'#f47933','ก้าวไกล':'#f47933','ภูมิใจไทย':'#243273',
    'กล้าธรรม':'#7ed956','ประชาธิปัตย์':'#00aeef','พลังประชารัฐ':'#056839',
    'รวมไทยสร้างชาติ':'#7c7cfa','โอกาสใหม่':'#f3717b','ประชาชาติ':'#a56f05',
    'ชาติไทยพัฒนา':'#e01487','ไทรวมพลัง':'#ee008c','ไทยสร้างไทย':'#7d21e0','เพื่อไทรวมพลัง':'#5265ae','อื่นๆ':'#9396a3'
};
const statusColors = {'พลิกชนะ':'#cd3d3d','รักษาแชมป์':'#1db741','พลิกแพ้':'#3490f1','ไม่เคยชนะ':'#6c757d'};

function categorizeMargin(m) {
    const a=Math.abs(m);
    if(a<5)return 'ฉิวเฉียด(<5%)'; if(a<=15)return 'ปานกลาง(5-15%)'; return 'ขาดลอย(>15%)';
}

async function loadAnalysisData() {
    if (analysisLoaded) return;
    try {
        const data = await d3.csv(ANALYSIS_URL);
        masterData = data.map(d=>{
            d.Margin_Pct_66=parseFloat(d.Margin_Pct_66)||0;
            d.Margin_Pct_69=parseFloat(d.Margin_Pct_69)||0;
            d.ภาค=analysisRegionMap[d['จังหวัด']]||'อื่นๆ';
            d.refId=d['จังหวัด']+"-"+d['เขต'];
            d.Margin_Cat_66=categorizeMargin(d.Margin_Pct_66);
            return d;
        });
        const sankeyDiv=document.getElementById('sankey-diagram');
        if(sankeyDiv&&typeof echarts!=='undefined') sankeyChart=echarts.init(sankeyDiv);
        setupAnalysisControls();
        updateDashboard(masterData);
        analysisLoaded = true;
    } catch(err) { console.error("Analysis load failed:", err); }
}

function setupAnalysisControls() {
    // Wire up desktop sidebar filters
    document.querySelectorAll('.a-region-cb').forEach(cb =>
        cb.addEventListener('change', () => { syncAnalysisMobileFromDesktop(); updateDashboardByControls(); }));
    document.querySelectorAll('.a-status-cb').forEach(cb =>
        cb.addEventListener('change', () => { syncAnalysisMobileFromDesktop(); updateDashboardByControls(); }));
    // Wire up mobile filter checkboxes
    document.querySelectorAll('.mob-a-region-cb').forEach(cb =>
        cb.addEventListener('change', () => { syncAnalysisDesktopFromMobile(); updateDashboardByControls(); }));
    document.querySelectorAll('.mob-a-status-cb').forEach(cb =>
        cb.addEventListener('change', () => { syncAnalysisDesktopFromMobile(); updateDashboardByControls(); }));
}

function syncAnalysisMobileFromDesktop() {
    const sr = [...document.querySelectorAll('.a-region-cb:checked')].map(cb => cb.value);
    const ss = [...document.querySelectorAll('.a-status-cb:checked')].map(cb => cb.value);
    document.querySelectorAll('.mob-a-region-cb').forEach(cb => { cb.checked = sr.includes(cb.value); });
    document.querySelectorAll('.mob-a-status-cb').forEach(cb => { cb.checked = ss.includes(cb.value); });
    updateMobAnalysisDropdownLabel();
}
function syncAnalysisDesktopFromMobile() {
    const sr = [...document.querySelectorAll('.mob-a-region-cb:checked')].map(cb => cb.value);
    const ss = [...document.querySelectorAll('.mob-a-status-cb:checked')].map(cb => cb.value);
    document.querySelectorAll('.a-region-cb').forEach(cb => { cb.checked = sr.includes(cb.value); });
    document.querySelectorAll('.a-status-cb').forEach(cb => { cb.checked = ss.includes(cb.value); });
    updateMobAnalysisDropdownLabel();
}
function updateMobAnalysisDropdownLabel() {
    const sr = [...document.querySelectorAll('.mob-a-region-cb:checked')].map(cb => cb.value);
    const lbl = document.getElementById('dropdown-mob-analysis-region-label');
    if (lbl) lbl.textContent = sr.length === 0 ? 'ทุกภาค' : sr.length === 1 ? sr[0] : `${sr.length} ภาค`;
}

window.toggleMobileFiltersAnalysis = function() {
    const panel = document.getElementById('mobile-filter-panel-analysis');
    const arrow = document.getElementById('mf-arrow-analysis');
    if (!panel) return;
    const isOpen = panel.style.display !== 'none';
    panel.style.display = isOpen ? 'none' : 'flex';
    if (arrow) arrow.classList.toggle('open', !isOpen);
};
window.clearMobAnalysisDropdown = function(type) {
    if (type === 'region') {
        document.querySelectorAll('.mob-a-region-cb').forEach(cb => cb.checked = false);
        syncAnalysisDesktopFromMobile();
        updateDashboardByControls();
    }
    const content = document.getElementById('dropdown-mob-analysis-region-content');
    if (content) content.classList.remove('show');
    const dd = document.getElementById('mob-dropdown-mob-analysis-region');
    if (dd) dd.classList.remove('open');
};

window.clearAnalysisRegion = () => {
    document.querySelectorAll('.a-region-cb').forEach(cb => cb.checked = false);
    syncAnalysisMobileFromDesktop();
    updateDashboardByControls();
};
window.clearAnalysisStatus = () => {
    document.querySelectorAll('.a-status-cb').forEach(cb => cb.checked = false);
    syncAnalysisMobileFromDesktop();
    updateDashboardByControls();
};

function updateDashboardByControls() {
    const sr=[...document.querySelectorAll('.a-region-cb:checked')].map(cb=>cb.value);
    const ss=[...document.querySelectorAll('.a-status-cb:checked')].map(cb=>cb.value);
    let filtered=masterData;
    if(sr.length>0) filtered=filtered.filter(d=>sr.includes(d.ภาค));
    if(ss.length>0) filtered=filtered.filter(d=>ss.includes(d['สถานะเขต']));
    updateDashboard(filtered);
}
function updateDashboard(data) { renderMetrics(data); renderScatter(data); updateBottomCharts(data); }
function updateBottomCharts(data) { renderSankey(data); renderHistograms(data); }

function renderMetrics(data) {
    const win   = data.filter(d=>d.Party_69==='เพื่อไทย').length;
    const fw    = data.filter(d=>d['สถานะเขต']==='พลิกชนะ').length;
    const fl    = data.filter(d=>d['สถานะเขต']==='พลิกแพ้').length;
    const keep  = data.filter(d=>d['สถานะเขต']==='รักษาแชมป์').length;
    const total = data.length;
    const pct   = total ? ((win/total)*100).toFixed(1)+'%' : '0%';

    // Top stats row
    const elW = document.getElementById('metric-win');
    const elFW= document.getElementById('metric-flipped-win');
    const elFL= document.getElementById('metric-flipped-lost');
    const elT = document.getElementById('metric-total');
    if(elW)  elW.innerText  = win;
    if(elFW) elFW.innerText = fw;
    if(elFL) elFL.innerText = fl;
    if(elT)  elT.innerText  = total;

    // Side card additional metrics
    const elK   = document.getElementById('metric-keep');
    const elPct = document.getElementById('metric-win-pct');
    if(elK)   elK.innerText   = keep;
    if(elPct) elPct.innerText = pct;
}

function renderScatter(data) {
    const div=document.getElementById('scatter-plot'); if(!div) return;
    const statuses=['รักษาแชมป์','พลิกชนะ','พลิกแพ้','ไม่เคยชนะ'];
    const traces=[];
    statuses.forEach(status=>{
        const gd=data.filter(d=>d['สถานะเขต']===status); if(!gd.length) return;
        const hoverTexts=gd.map(d=>{
            const m66=Math.abs(d.Margin_Pct_66).toFixed(0), m69=Math.abs(d.Margin_Pct_69).toFixed(0);
            const sc=statusColors[status]||'#333';
            const regionText=d['จังหวัด']!=='กรุงเทพมหานคร'?` <span style="color:#888">(ภาค${d.ภาค})</span>`:"";
            const c66=partyColorsAnalysis[d.Party_66]||'#666', c69=partyColorsAnalysis[d.Party_69]||'#666';
            const t66=d.Party_66==='เพื่อไทย'?`<span style="color:${c66}"><b>เพื่อไทยชนะ</b></span> <span style="color:#555">(${m66}%)</span>`:`<span style="color:${c66}"><b>เพื่อไทยแพ้ ${d.Party_66}</b></span> <span style="color:#555">(${m66}%)</span>`;
            const t69=d.Party_69==='เพื่อไทย'?`<span style="color:${c69}"><b>เพื่อไทยชนะ</b></span> <span style="color:#555">(${m69}%)</span>`:`<span style="color:${c69}"><b>เพื่อไทยแพ้ ${d.Party_69}</b></span> <span style="color:#555">(${m69}%)</span>`;
            return `<b><span style="color:${sc};">● ${status}</span></b><br><b>${d['จังหวัด']} เขต ${parseInt(d['เขต'])}</b>${regionText}<br><span style="color:#ddd">─────────────</span><br>ปี 66: ${t66}<br>ปี 69: ${t69}`;
        });
        traces.push({x:gd.map(d=>d.Margin_Pct_66),y:gd.map(d=>d.Margin_Pct_69),customdata:gd.map(d=>d.refId),mode:'markers',type:'scatter',name:status,text:hoverTexts,hoverinfo:'text',hovertemplate:'%{text}<extra></extra>',marker:{size:10,color:statusColors[status],opacity:0.8,line:{width:1,color:'white'}}});
    });
    const layout={
        margin:{l:55,r:20,t:40,b:55},
        xaxis:{
            title:{text:'ส่วนต่างคะแนนปี 66 (%) &nbsp;',font:{size:12}},
            zeroline:true,zerolinecolor:'#aaa',zerolinewidth:1.5,
            gridcolor:'#f0f0f0'
        },
        yaxis:{
            title:{text:'ส่วนต่างคะแนนปี 69 (%) &nbsp;',font:{size:12}},
            zeroline:true,zerolinecolor:'#aaa',zerolinewidth:1.5,
            gridcolor:'#f0f0f0'
        },
        hovermode:'closest',
        dragmode:'lasso',
        hoverlabel:{bgcolor:'#FFF',bordercolor:'#ccc',font:{family:'Prompt',size:13,color:'#333'},align:'left'},
        legend:{orientation:'h',y:-0.18,x:0,font:{size:12}}
    };
    Plotly.newPlot('scatter-plot',traces,layout,{responsive:true});
    renderDistrictList(data);
    if(div.removeAllListeners){ div.removeAllListeners('plotly_selected'); div.removeAllListeners('plotly_deselect'); }
    div.on('plotly_selected',ev=>{
        if(ev&&ev.points){
            const ids=ev.points.map(p=>p.customdata);
            const sel=masterData.filter(d=>ids.includes(d.refId));
            updateBottomCharts(sel);
            renderMetrics(sel);
            renderDistrictList(sel, true);
        }
    });
    div.on('plotly_deselect',()=>{ updateDashboardByControls(); });
}

function updateTop10Rank(filteredData) {
    // 1. คำนวณส่วนต่าง (Margin) และเรียงลำดับจากน้อยไปมาก
    const sortedData = [...filteredData]
        .filter(d => d.Margin !== undefined)
        .sort((a, b) => Math.abs(a.Margin) - Math.abs(b.Margin)) // น้อยไปมาก
        .slice(0, 10);

    const trace = {
        x: sortedData.map(d => Math.abs(d.Margin)),
        y: sortedData.map(d => `${d.Province} เขต ${d.District}`),
        type: 'bar',
        orientation: 'h',
        marker: { color: '#1e64aa' }
    };

    const layout = {
        title: 'Top 10 เขตที่คะแนนเบียดที่สุด (%)',
        margin: { l: 150, r: 20, t: 40, b: 40 },
        xaxis: { title: 'ส่วนต่างคะแนน' },
        yaxis: { autoresize: true }
    };

    Plotly.newPlot('top-10-rank-chart', [trace], layout, {responsive: true});
}

function renderDistrictList(data, isLassoSelection) {
    const container = document.getElementById('district-list-container');
    if (!container) return;

    const statusColors = {
        'รักษาแชมป์': '#1db741',
        'พลิกชนะ':    '#cd3d3d',
        'พลิกแพ้':    '#3490f1',
        'ไม่เคยชนะ':  '#9ca3af'
    };

    // Sort: พลิกชนะ first, then รักษาแชมป์, then พลิกแพ้, then ไม่เคยชนะ; within group by margin69 desc
    const statusOrder = {'พลิกชนะ':0,'รักษาแชมป์':1,'พลิกแพ้':2,'ไม่เคยชนะ':3};
    const sorted = [...data].sort((a,b) => {
        const so = (statusOrder[a['สถานะเขต']]??9) - (statusOrder[b['สถานะเขต']]??9);
        if (so !== 0) return so;
        return b.Margin_Pct_69 - a.Margin_Pct_69;
    });

    const titleText = isLassoSelection
        ? `เขตที่เลือก (Lasso) — ${data.length} เขต`
        : `รายการเขตทั้งหมด ${data.length} เขต`;

    const headerEl = document.getElementById('district-list-header');
    if (headerEl) headerEl.textContent = titleText;

    const sign = v => v > 0 ? '+' : '';
    const arrow = (v66, v69) => {
        if (v69 > v66) return '<span style="color:#28a745">▲</span>';
        if (v69 < v66) return '<span style="color:#dc3545">▼</span>';
        return '<span style="color:#9ca3af">─</span>';
    };

    let rows = sorted.map(d => {
        const m66 = d.Margin_Pct_66.toFixed(1);
        const m69 = d.Margin_Pct_69.toFixed(1);
        const sc = statusColors[d['สถานะเขต']] || '#9ca3af';
        const statusLabel = d['สถานะเขต'] || '—';
        const m66Color = d.Margin_Pct_66 >= 0 ? '#C72222' : '#1e64aa';
        const m69Color = d.Margin_Pct_69 >= 0 ? '#C72222' : '#1e64aa';
        return `<tr>
          <td><b>${d['จังหวัด']}</b><span class="dl-region"> ${d.ภาค !== 'กรุงเทพมหานคร' ? 'ภาค' + d.ภาค : ''}</span></td>
          <td style="text-align:center">เขต ${parseInt(d['เขต'])}</td>
          <td style="text-align:right;font-family:'IBM Plex Mono',monospace;color:${m66Color};font-weight:600">${sign(d.Margin_Pct_66)}${m66}%</td>
          <td style="text-align:right;font-family:'IBM Plex Mono',monospace;color:${m69Color};font-weight:600">${sign(d.Margin_Pct_69)}${m69}%</td>
          <td style="text-align:center">${arrow(d.Margin_Pct_66, d.Margin_Pct_69)}</td>
          <td><span class="dl-status-badge" style="background:${sc}20;color:${sc};border:1px solid ${sc}60">${statusLabel}</span></td>
        </tr>`;
    }).join('');

    const tableEl = document.getElementById('district-list-tbody');
    if (tableEl) tableEl.innerHTML = rows;
}

function renderSankey(data) {
    if(!sankeyChart||!document.getElementById('sankey-diagram')) return;
    if(!data.length){ sankeyChart.clear(); return; }
    const grp=p=>['เพื่อไทย','ก้าวไกล','ประชาชน','ภูมิใจไทย','ประชาธิปัตย์','กล้าธรรม'].includes(p)?p:'อื่นๆ';
    const lm={};
    data.forEach(d=>{ const k=grp(d.Party_66)+" (66)|"+grp(d.Party_69)+" (69)"; lm[k]=(lm[k]||0)+1; });
    const nodes=[],links=[];
    Object.keys(lm).forEach(k=>{
        const [src,tgt]=k.split("|");
        links.push({source:src,target:tgt,value:lm[k]});
        if(!nodes.find(n=>n.name===src)) nodes.push({name:src,itemStyle:{color:partyColorsAnalysis[src.replace(" (66)","")]||'#ced4da'}});
        if(!nodes.find(n=>n.name===tgt)) nodes.push({name:tgt,itemStyle:{color:partyColorsAnalysis[tgt.replace(" (69)","")]||'#ced4da'}});
    });
    sankeyChart.setOption({tooltip:{trigger:'item',textStyle:{fontFamily:'Prompt',fontSize:13},formatter:params=>{
        if(params.dataType==='edge'){
            const sn=params.data.source.replace(" (66)",""),tn=params.data.target.replace(" (69)","");
            const st=(sn===tn||(sn==='ก้าวไกล'&&tn==='ประชาชน'))?"รักษาพื้นที่":"ย้ายค่าย";
            return `<b style="color:${st==='รักษาพื้นที่'?'#28a745':'#dc3545'}">${st}</b><br/>ปี 66: ${sn}<br/>ปี 69: ${tn}<br/>จำนวน: <b>${params.value}</b> เขต`;
        } else {
            const is66=params.name.includes("(66)"),pn=params.name.replace(" (66)","").replace(" (69)","");
            return `<b>${pn} (${is66?"ปี 66":"ปี 69"})</b><br/>รวม: <b>${params.value}</b> เขต`;
        }
    }},series:[{type:'sankey',data:nodes,links,nodeAlign:'left',lineStyle:{color:'source',curveness:0.5,opacity:0.4},label:{position:'right',fontFamily:'Prompt'},emphasis:{focus:'adjacency'}}]},true);
}

function renderHistograms(data) {
    if(!document.getElementById('hist-lost')||!document.getElementById('hist-won')) return;
    const dfLost=data.filter(d=>d['สถานะเขต']==='พลิกแพ้');
    const dfWon=data.filter(d=>d['สถานะเขต']==='พลิกชนะ');
    const xOrder=['ฉิวเฉียด(<5%)','ปานกลาง(5-15%)','ขาดลอย(>15%)'];
    function makeTraces(filteredData,colorByField,tipLabel){
        let grouped={};
        xOrder.forEach(c=>grouped[c]={});
        filteredData.forEach(d=>{ const c=d.Margin_Cat_66,p=d[colorByField]; if(!grouped[c])grouped[c]={}; grouped[c][p]=(grouped[c][p]||0)+1; });
        let curX=0,tickvals=[],ticktext=[],partyData={};
        const bw=1,gs=2.5;
        xOrder.forEach(cat=>{
            const parts=Object.keys(grouped[cat]).filter(p=>grouped[cat][p]>0).sort((a,b)=>grouped[cat][b]-grouped[cat][a]);
            if(!parts.length){ tickvals.push(curX); ticktext.push(cat); curX+=gs; return; }
            const startX=curX,endX=curX+(parts.length-1)*bw;
            tickvals.push((startX+endX)/2); ticktext.push(cat);
            parts.forEach((party,i)=>{
                const xp=curX+(i*bw);
                if(!partyData[party]) partyData[party]={x:[],y:[],customdata:[],type:'bar',name:party,marker:{color:partyColorsAnalysis[party]||'#ced4da',line:{width:0}},width:bw,showlegend:false,legendgroup:party,hovertemplate:`<b>${tipLabel}: %{data.name}</b><br>จำนวน: <b>%{y}</b> เขต<extra></extra>`};
                partyData[party].x.push(xp); partyData[party].y.push(grouped[cat][party]); partyData[party].customdata.push(cat);
            });
            curX=endX+bw+gs;
        });
        return {traces:Object.values(partyData),tickvals,ticktext};
    }
    const lostD=makeTraces(dfLost,'Party_69','พรรคที่ได้พื้นที่');
    const wonD=makeTraces(dfWon,'Party_66','พรรคที่เสียพื้นที่');

    const allY = [...lostD.traces, ...wonD.traces].flatMap(t => t.y).filter(v => v !== null && v !== undefined);
    const yMax = Math.max(...allY, 1);
    const lb={barmode:'overlay',showlegend:false,margin:{l:50,r:10,t:10,b:70},yaxis:{title:'จำนวนเขต',range:[0, yMax * 1.15]}};
    Plotly.newPlot('hist-lost',lostD.traces,{...lb,xaxis:{tickmode:'array',tickvals:lostD.tickvals,ticktext:lostD.ticktext,showgrid:false,title:{text:'ส่วนต่างคะแนนปี 66',standoff:15}}},{responsive:true});
    Plotly.newPlot('hist-won',wonD.traces,{...lb,xaxis:{tickmode:'array',tickvals:wonD.tickvals,ticktext:wonD.ticktext,showgrid:false,title:{text:'ส่วนต่างคะแนนปี 66',standoff:15}}},{responsive:true});

    // Build combined top party legend
    const legendEl = document.getElementById('flip-party-legend');
    if(legendEl) {
        const allParties = new Set([
            ...lostD.traces.map(t=>t.name),
            ...wonD.traces.map(t=>t.name)
        ]);
        legendEl.innerHTML = [...allParties]
            .filter(p => p && partyColorsAnalysis[p])
            .sort((a,b) => a.localeCompare(b,'th'))
            .map(p => `<span class="flip-legend-item"><span class="flip-legend-dot" style="background:${partyColorsAnalysis[p]}"></span>${p}</span>`)
            .join('');
    }
}

// ═══════════════════════════════════════════════════
// BOOT
// ═══════════════════════════════════════════════════
loadMapData();
