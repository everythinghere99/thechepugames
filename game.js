const canvas = document.getElementById('gameCanvas'); const ctx = canvas.getContext('2d');

const screens = { loading: document.getElementById('screen-loading'), levels: document.getElementById('screen-levels'), hangar: document.getElementById('screen-hangar'), game: document.getElementById('screen-game') };
const UI = { health: document.getElementById('health'), gold: document.getElementById('gold'), wave: document.getElementById('wave'), announcer: document.getElementById('announcer'), loadingBar: document.getElementById('loading-bar'), loadingText: document.getElementById('loading-text') };

canvas.width = 1280; canvas.height = 720; const tileSize = 80;
let currentTowerType = 'basic'; let frameCount = 0; let shakeFrames = 0;
let gameState = { health: 100, gold: 200, state: 'LOADING' };
let towers = [], enemies = [], bullets = [], floatingTexts = [], placedTrees = [];

const enemyLinks = ["https://i.ibb.co/1GtYVpLX/23043.png", "https://i.ibb.co/NdJSX0K2/23032.png", "https://i.ibb.co/XfJ0qMVq/23037.png", "https://i.ibb.co/ksDKh5M4/23038.png", "https://i.ibb.co/0RvTTdsk/23040.png", "https://i.ibb.co/LXsqpvmy/23039.png", "https://i.ibb.co/YFRKqgsX/23044.png", "https://i.ibb.co/bM6m2LBB/23042.png", "https://i.ibb.co/bMMMXqcT/23041.png", "https://i.ibb.co/KzQJGyWT/23051.png", "https://i.ibb.co/zyKfB91/23047.png", "https://i.ibb.co/Xfdb8kdW/23052.png", "https://i.ibb.co/2Y8ZrCsT/23055.png", "https://i.ibb.co/ds2bN150/23056.png", "https://i.ibb.co/Q3Cgv512/23048.png", "https://i.ibb.co/Qj6S0wBY/23049.png", "https://i.ibb.co/q3P419kk/23053.png", "https://i.ibb.co/bgvrfPMB/23057.png", "https://i.ibb.co/ZspgRLQ/23058.png", "https://i.ibb.co/Mx3HCV0R/23059.png", "https://i.ibb.co/wZgjMg5t/23060.png", "https://i.ibb.co/G4T0BP3M/23069.png", "https://i.ibb.co/WW3N3VK4/23030.png"];
const towerLinks = ["https://i.ibb.co/mr5mkNSP/file-00000000837082118637e67daa5c0b90-6.png", "https://i.ibb.co/bMr9Scd1/file-00000000837082118637e67daa5c0b90-7.png", "https://i.ibb.co/rKgnFzG1/file-00000000837082118637e67daa5c0b90-8.png", "https://i.ibb.co/Z68nLg51/file-00000000837082118637e67daa5c0b90-9.png", "https://i.ibb.co/C55NXh53/file-00000000837082118637e67daa5c0b90-10.png", "https://i.ibb.co/KzqXpkjR/file-00000000837082118637e67daa5c0b90-1.png", "https://i.ibb.co/3yP3hw32/file-00000000837082118637e67daa5c0b90-2.png", "https://i.ibb.co/mFqmxkxp/file-00000000837082118637e67daa5c0b90-3.png", "https://i.ibb.co/qLxfBPgR/file-00000000837082118637e67daa5c0b90-4.png", "https://i.ibb.co/NgMz20hR/file-00000000837082118637e67daa5c0b90-5.png", "https://i.ibb.co/216Hyd9X/23082.png", "https://i.ibb.co/cS6x42Dd/23081.png", "https://i.ibb.co/93pRYsmd/23080.png", "https://i.ibb.co/Y4njFQfL/23085.png", "https://i.ibb.co/HLNdwKsT/23087.png", "https://i.ibb.co/dSj4CRZ/23088.png", "https://i.ibb.co/247xXGn/23099.png", "https://i.ibb.co/VWF58ptr/23079.png"];
const mapLinks = ["https://i.ibb.co/xqskSXRX/1786782712162.png", "https://i.ibb.co/SXjhvWPQ/1786782715801.png", "https://i.ibb.co/67KLk8y9/1786782718728.png"];
const treeLinks = ["https://i.ibb.co/0yXrcvy8/23191.png", "https://i.ibb.co/Z6HcJYM3/23192.png", "https://i.ibb.co/p6fhw5sy/23193.png"];

let enemyImgs = new Array(enemyLinks.length); let towerImgs = new Array(towerLinks.length);
let mapImgs = new Array(mapLinks.length); let treeImgs = new Array(treeLinks.length);
let loadedCount = 0; let totalImgs = enemyLinks.length + towerLinks.length + mapLinks.length + treeLinks.length;

function showScreen(screenName) {
    Object.values(screens).forEach(s => { if(s) { s.classList.add('hidden'); s.classList.remove('active'); } });
    if(screens[screenName]) { screens[screenName].classList.remove('hidden'); screens[screenName].classList.add('active'); }
}

if(document.getElementById('nav-hangar')) document.getElementById('nav-hangar').onclick = () => showScreen('hangar');
if(document.getElementById('nav-levels')) document.getElementById('nav-levels').onclick = () => showScreen('levels');
if(document.getElementById('btn-level-1')) document.getElementById('btn-level-1').onclick = () => { showScreen('game'); startNextWave(); gameLoop(); };

function loadAllAssets(callback) {
    let finished = false;
    function finishLoading() {
        if(finished) return; finished = true;
        if(UI.loadingText) UI.loadingText.innerText = "SYSTEM READY";
        setTimeout(() => callback(), 500); 
    }
    function onImgLoad() { 
        if(finished) return; loadedCount++; 
        let percent = Math.floor((loadedCount / totalImgs) * 100);
        if(UI.loadingBar) UI.loadingBar.style.width = percent + "%";
        if(UI.loadingText) UI.loadingText.innerText = `Loading Assets... ${percent}%`; 
        if (loadedCount >= totalImgs) { finishLoading(); }
    }
    setTimeout(() => { finishLoading(); }, 3500); 
    const loadArr = (arr, imgs) => arr.forEach((src, i) => { 
        let img = new Image(); img.crossOrigin = "Anonymous";
        img.onload = onImgLoad; img.onerror = onImgLoad; img.src = src; imgs[i] = img; 
    });
    loadArr(enemyLinks, enemyImgs); loadArr(towerLinks, towerImgs); loadArr(mapLinks, mapImgs); loadArr(treeLinks, treeImgs);
}

const waves = [ { mapIndex: 0, enemyList: [0, 0, 1, 1, 2, 2] }, { mapIndex: 0, enemyList: [3, 4, 4, 5, 5, 6, 7] }, { mapIndex: 1, enemyList: [8, 9, 10, 10, 11, 12] }, { mapIndex: 1, enemyList: [13, 14, 15, 16, 17, 18] }, { mapIndex: 2, enemyList: [19, 20, 21, 21, 22, 22] } ];
const mapPaths = [ [ [{x:8, y:361}, {x:681, y:358}, {x:727, y:348}, {x:764, y:342}, {x:804, y:335}, {x:838, y:324}, {x:871, y:317}, {x:902, y:317}, {x:935, y:321}, {x:964, y:323}, {x:991, y:334}, {x:1015, y:345}, {x:1043, y:353}, {x:1075, y:365}, {x:1117, y:364}, {x:1160, y:356}, {x:1206, y:354}] ], [ [{x:12, y:181}, {x:512, y:180}, {x:577, y:196}, {x:636, y:221}, {x:686, y:262}, {x:735, y:297}, {x:789, y:334}, {x:853, y:364}, {x:941, y:369}, {x:1019, y:365}, {x:1086, y:365}, {x:1155, y:363}, {x:1212, y:362}], [{x:13, y:546}, {x:535, y:546}, {x:607, y:524}, {x:662, y:484}, {x:711, y:454}, {x:761, y:413}, {x:812, y:383}, {x:862, y:363}, {x:946, y:364}, {x:1012, y:361}, {x:1077, y:364}, {x:1141, y:361}, {x:1188, y:364}] ], [ [{x:11, y:361}, {x:308, y:364}, {x:348, y:326}, {x:387, y:278}, {x:415, y:234}, {x:454, y:199}, {x:491, y:167}, {x:534, y:142}, {x:584, y:119}, {x:634, y:110}, {x:680, y:116}, {x:730, y:134}, {x:771, y:154}, {x:808, y:176}, {x:835, y:206}, {x:870, y:231}, {x:905, y:265}, {x:932, y:304}, {x:972, y:341}, {x:1019, y:365}, {x:1084, y:368}, {x:1163, y:363}], [{x:12, y:364}, {x:297, y:364}, {x:336, y:390}, {x:369, y:431}, {x:394, y:465}, {x:442, y:510}, {x:486, y:551}, {x:541, y:581}, {x:609, y:611}, {x:672, y:615}, {x:741, y:582}, {x:803, y:555}, {x:857, y:511}, {x:900, y:461}, {x:939, y:416}, {x:993, y:375}, {x:1068, y:366}, {x:1157, y:369}] ] ];
const towerDefs = { 'basic': { cost: 20, imgBaseIdx: 0, maxLvl: 5, range: 120, damage: 20, fireRate: 35 }, 'heavy': { cost: 40, imgBaseIdx: 5, maxLvl: 5, range: 150, damage: 50, fireRate: 70 }, 'slow': { cost: 50, imgBaseIdx: 10, maxLvl: 4, range: 130, damage: 0, fireRate: 999 }, 'buff': { cost: 60, imgBaseIdx: 14, maxLvl: 4, range: 140, damage: 0, fireRate: 999 } };

function showAnnouncer(text, duration = 3000) { UI.announcer.innerText = text; UI.announcer.classList.remove('hidden'); if(duration > 0) setTimeout(() => UI.announcer.classList.add('hidden'), duration); }
function distToSegment(px, py, x1, y1, x2, y2) { let A = px-x1, B = py-y1, C = x2-x1, D = y2-y1; let dot = A*C+B*D, len_sq = C*C+D*D; let param = -1; if(len_sq!=0) param = dot/len_sq; let xx, yy; if(param<0){xx=x1;yy=y1;} else if(param>1){xx=x2;yy=y2;} else {xx=x1+param*C;yy=y1+param*D;} let dx = px-xx, dy = py-yy; return Math.sqrt(dx*dx+dy*dy); }
function isNearRoad(px, py, minDistance) { let mapRoutes = mapPaths[currentMapIndex]; for(let r=0; r<mapRoutes.length; r++) { let path = mapRoutes[r]; for(let i=0; i<path.length-1; i++) { if(distToSegment(px, py, path[i].x, path[i].y, path[i+1].x, path[i+1].y) < minDistance) return true; } } return false; }
function generateTrees() { placedTrees = []; for(let r = 0; r < 9; r++) { for(let c = 0; c < 16; c++) { let tx = c * tileSize + 40; let ty = r * tileSize + 40; if(!isNearRoad(tx, ty, 60) && Math.random() < 0.15) placedTrees.push({ x: tx-20, y: ty-20, img: treeImgs[Math.floor(Math.random() * treeImgs.length)] }); } } }

function startNextWave() {
    if(currentWaveIndex >= waves.length) { alert("VICTORY! All Waves Cleared!"); location.reload(); return; }
    let waveConfig = waves[currentWaveIndex];
    if(waveConfig.mapIndex !== currentMapIndex) { currentMapIndex = waveConfig.mapIndex; towers = []; bullets = []; floatingTexts = []; generateTrees(); }
    enemiesToSpawn = [...waveConfig.enemyList]; gameState.state = 'PLAYING';
    if(UI.wave) UI.wave.innerText = `${currentWaveIndex + 1}/5`; showAnnouncer(`WAVE ${currentWaveIndex + 1} START!`);
}

class Enemy {
    constructor(imgIndex) {
        this.img = enemyImgs[imgIndex]; this.isBoss = (imgIndex >= 21);
        this.maxHealth = 40 + (imgIndex * 30) + (this.isBoss ? 1500 : 0); this.health = this.maxHealth;
        this.baseSpeed = 1.8 - (imgIndex * 0.05); if(this.baseSpeed < 0.6) this.baseSpeed = 0.6; 
        this.goldReward = 10 + (imgIndex * 2) + (this.isBoss ? 150 : 0);
        let routes = mapPaths[currentMapIndex]; this.path = routes[Math.floor(Math.random() * routes.length)];
        this.waypointIndex = 0; this.x = this.path[0].x; this.y = this.path[0].y; this.slowFactor = 1; this.facingLeft = false; 
    }
    update() {
        let target = this.path[this.waypointIndex + 1]; if (!target) return; 
        let speed = this.baseSpeed * this.slowFactor; let dx = target.x - this.x; let dy = target.y - this.y; let dist = Math.hypot(dx, dy);
        if (dx < -0.5) this.facingLeft = true; else if (dx > 0.5) this.facingLeft = false;
        if (dist < speed) {
            this.x = target.x; this.y = target.y; this.waypointIndex++;
            if(this.waypointIndex >= this.path.length - 1) {
                gameState.health -= this.isBoss ? 40 : 10; shakeFrames = 15; 
                if(gameState.health <= 0) { gameState.health = 0; gameState.state = 'GAMEOVER'; setTimeout(()=> { alert("Base Destroyed!"); location.reload();}, 100); }
                if(UI.health) UI.health.innerText = gameState.health; this.health = 0; 
            }
        } else { this.x += (dx/dist)*speed; this.y += (dy/dist)*speed; }
    }
    draw() {
        ctx.save(); ctx.translate(this.x, this.y); if (this.facingLeft) ctx.scale(-1, 1); 
        if(this.slowFactor < 1) { ctx.shadowBlur = 15; ctx.shadowColor = "#3498db"; }
        if(this.img && this.img.naturalWidth > 0) ctx.drawImage(this.img, -35, -35, 70, 70); 
        ctx.restore(); ctx.fillStyle = 'red'; ctx.fillRect(this.x - 15, this.y - 25, 30, 4);
        ctx.fillStyle = '#2ecc71'; ctx.fillRect(this.x - 15, this.y - 25, 30 * (this.health / this.maxHealth), 4);
    }
}

function gameLoop() {
    frameCount++;
    if(gameState.state === 'PLAYING') {
        if(enemiesToSpawn.length > 0) { spawnTimer++; if(spawnTimer > 80) { enemies.push(new Enemy(enemiesToSpawn.shift())); spawnTimer = 0; } } 
        else if (enemies.length === 0) { gameState.state = 'INTERMISSION'; intermissionTimer = 300; currentWaveIndex++; }
    } else if (gameState.state === 'INTERMISSION') {
        intermissionTimer--; if(intermissionTimer % 60 === 0 && intermissionTimer > 0) showAnnouncer(`WAVE ${currentWaveIndex + 1} IN ${intermissionTimer/60}...`, 900);
        if(intermissionTimer <= 0) startNextWave();
    }

    towers.forEach(t => t.buffMultiplier = 1); enemies.forEach(e => e.slowFactor = 1);    
    towers.forEach(tower => {
        if (tower.type === 'buff') { towers.forEach(otherT => { if(Math.hypot(otherT.cx - tower.cx, otherT.cy - tower.cy) <= tower.range) otherT.buffMultiplier = 1.5; }); } 
        else if (tower.type === 'slow') { enemies.forEach(e => { if(Math.hypot(e.x - tower.cx, e.y - tower.cy) <= tower.range) e.slowFactor = 0.5 - (tower.level * 0.05); }); } 
        else {
            let target = null; for (let e of enemies) { if (Math.hypot(e.x - tower.cx, e.y - tower.cy) <= tower.range) { target = e; break; } }
            if (target) { tower.angle = Math.atan2(target.y - tower.cy, target.x - tower.cx); if (frameCount - tower.lastFired > (tower.fireRate / tower.buffMultiplier)) { bullets.push({ x: tower.cx, y: tower.cy, target: target, type: tower.type, speed: 12, damage: tower.damage * tower.buffMultiplier }); tower.lastFired = frameCount; } }
        }
    });

    for(let i = enemies.length - 1; i >= 0; i--) {
        enemies[i].update();
        if(enemies[i].health <= 0) {
            if(enemies[i].waypointIndex < enemies[i].path.length - 1) { gameState.gold += enemies[i].goldReward; if(UI.gold) UI.gold.innerText = gameState.gold; floatingTexts.push({x: enemies[i].x, y: enemies[i].y, text: `+$${enemies[i].goldReward}`, alpha: 1}); }
            enemies.splice(i, 1); 
        }
    }

    for(let i = bullets.length - 1; i >= 0; i--) {
        let b = bullets[i]; if(b.target && b.target.health <= 0) { bullets.splice(i, 1); continue; }
        let dx = b.target.x - b.x; let dy = b.target.y - b.y; let dist = Math.hypot(dx, dy);
        if (dist < b.speed) { b.target.health -= b.damage; bullets.splice(i, 1); } else { b.x += (dx/dist)*b.speed; b.y += (dy/dist)*b.speed; }
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if(shakeFrames > 0) { ctx.save(); ctx.translate((Math.random()-0.5)*12, (Math.random()-0.5)*12); shakeFrames--; }
    if(mapImgs[currentMapIndex] && mapImgs[currentMapIndex].naturalWidth > 0) ctx.drawImage(mapImgs[currentMapIndex], 0, 0, canvas.width, canvas.height); 
    else { ctx.fillStyle = '#4c5c44'; ctx.fillRect(0, 0, canvas.width, canvas.height); }

    placedTrees.forEach(tree => { if(tree.img && tree.img.naturalWidth > 0) ctx.drawImage(tree.img, tree.x, tree.y, 60, 70); });

    for(let t of towers) {
        ctx.save(); ctx.translate(t.cx, t.cy); let img = towerImgs[towerDefs[t.type].imgBaseIdx + (t.level - 1)];
        if(img && img.naturalWidth > 0) { if(t.type === 'basic' || t.type === 'heavy') ctx.rotate(t.angle + Math.PI/2); ctx.drawImage(img, -35, -35, 70, 70); }
        ctx.restore();
        if(t.type === 'slow') { ctx.beginPath(); ctx.arc(t.cx, t.cy, t.range, 0, Math.PI*2); ctx.fillStyle = 'rgba(52, 152, 219, 0.1)'; ctx.fill(); ctx.strokeStyle='rgba(52, 152, 219, 0.3)'; ctx.stroke(); } 
        else if(t.type === 'buff') { ctx.beginPath(); ctx.arc(t.cx, t.cy, t.range, 0, Math.PI*2); ctx.fillStyle = 'rgba(241, 196, 15, 0.1)'; ctx.fill(); ctx.strokeStyle='rgba(241, 196, 15, 0.3)'; ctx.stroke(); }
        ctx.fillStyle = '#f1c40f'; ctx.font="12px 'Press Start 2P'"; ctx.fillText("★".repeat(t.level), t.cx-15, t.cy-25);
    }

    for(let e of enemies) e.draw();
    for(let b of bullets) { ctx.beginPath(); ctx.arc(b.x, b.y, 4, 0, Math.PI*2); ctx.fillStyle = (b.type==='heavy' ? '#e67e22' : '#f1c40f'); ctx.fill(); }
    
    for(let i=floatingTexts.length-1; i>=0; i--){
        let ft = floatingTexts[i]; ctx.fillStyle = `rgba(241, 196, 15, ${ft.alpha})`; ctx.font = "14px 'Press Start 2P'"; ctx.fillText(ft.text, ft.x, ft.y);
        ft.y -= 1; ft.alpha -= 0.02; if(ft.alpha <= 0) floatingTexts.splice(i, 1);
    }
    if(shakeFrames >= 0) ctx.restore();
    if(gameState.state !== 'GAMEOVER') requestAnimationFrame(gameLoop);
}

document.querySelectorAll('.tower-btn').forEach(btn => {
    btn.onclick = (e) => { document.querySelectorAll('.tower-btn').forEach(b => b.classList.remove('active')); btn.classList.add('active'); currentTowerType = btn.id.replace('btn-', ''); };
});

canvas.addEventListener('pointerdown', (e) => {
    if(gameState.state !== 'PLAYING' && gameState.state !== 'INTERMISSION') return; e.preventDefault(); 
    const rect = canvas.getBoundingClientRect(); const scaleX = canvas.width / rect.width; const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX; const y = (e.clientY - rect.top) * scaleY;
    const col = Math.floor(x / tileSize); const row = Math.floor(y / tileSize); const cx = col * tileSize + 40; const cy = row * tileSize + 40;

    if(isNearRoad(cx, cy, 45)) { floatingTexts.push({x: cx-50, y: cy, text: "INVALID!", alpha: 1}); return; }

    let existingTower = towers.find(t => t.col === col && t.row === row);
    if (existingTower) {
        let def = towerDefs[existingTower.type]; let upgCost = def.cost * existingTower.level; 
        if (gameState.gold >= upgCost && existingTower.level < def.maxLvl) {
            gameState.gold -= upgCost; existingTower.level++; existingTower.range += 20; existingTower.damage += 15;
            floatingTexts.push({x: cx-30, y: cy-20, text: "UPGRADE", alpha: 1}); if(UI.gold) UI.gold.innerText = gameState.gold;
        }
    } else {
        let def = towerDefs[currentTowerType];
        if (gameState.gold >= def.cost) {
            gameState.gold -= def.cost; towers.push({ col, row, cx, cy, type: currentTowerType, level: 1, range: def.range, damage: def.damage, fireRate: def.fireRate, lastFired: 0, buffMultiplier: 1 }); if(UI.gold) UI.gold.innerText = gameState.gold;
        }
    }
});

function resizeCanvas() {
    if(!canvas.parentElement) return; let parentW = canvas.parentElement.clientWidth; let parentH = canvas.parentElement.clientHeight;
    let scale = Math.min(parentW / 1280, parentH / 720); canvas.style.width = (1280 * scale) + 'px'; canvas.style.height = (720 * scale) + 'px';
}
window.addEventListener('resize', resizeCanvas); resizeCanvas(); 

loadAllAssets(() => { showScreen('levels'); });
