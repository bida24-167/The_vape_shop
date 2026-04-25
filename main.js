/* THE VAPE HOUSE — main.js */

// ── WELCOME → AGE GATE ────────────────────────
function goToAgeGate() {
  document.getElementById('welcome').classList.add('out');
  setTimeout(() => {
    document.getElementById('welcome').style.display = 'none';
    const ag = document.getElementById('ag');
    ag.classList.add('show');
    setTimeout(() => ag.classList.remove('out'), 10);
  }, 550);
}

function enter() {
  const ag = document.getElementById('ag');
  ag.classList.add('out');
  setTimeout(() => ag.style.display = 'none', 500);
}

// ── CURSOR (fast, GPU transform) ──────────────
const c1 = document.getElementById('cur');
const c2 = document.getElementById('cur2');
let mx = 0, my = 0, rx = 0, ry = 0;

document.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  c1.style.transform = `translate(${mx}px,${my}px)`;
}, { passive: true });

(function tick() {
  rx += (mx - rx) * 0.3; ry += (my - ry) * 0.3;
  c2.style.transform = `translate(${rx}px,${ry}px)`;
  requestAnimationFrame(tick);
})();

document.querySelectorAll('a,button,.pc').forEach(el => {
  el.addEventListener('mouseenter', () => { c2.style.width='44px';c2.style.height='44px';c2.style.marginLeft='-22px';c2.style.marginTop='-22px';c2.style.borderColor='rgba(255,149,0,.8)'; });
  el.addEventListener('mouseleave', () => { c2.style.width='26px';c2.style.height='26px';c2.style.marginLeft='-13px';c2.style.marginTop='-13px';c2.style.borderColor='rgba(255,149,0,.38)'; });
});

// ── NAV SCROLL ────────────────────────────────
window.addEventListener('scroll', () => {
  document.getElementById('nav').classList.toggle('sc', scrollY > 60);
}, { passive: true });

// ── MOBILE MENU ───────────────────────────────
function toggleMobile() {
  const m = document.getElementById('mnav');
  m.classList.toggle('open');
  m.style.display = m.classList.contains('open') ? 'flex' : 'none';
}
function checkHam() {
  const h = document.getElementById('ham');
  const nl = document.getElementById('navlinks');
  if (window.innerWidth <= 768) { h.style.display='flex'; nl.style.display='none'; }
  else { h.style.display='none'; nl.style.display='flex'; document.getElementById('mnav').classList.remove('open'); document.getElementById('mnav').style.display='none'; }
}
checkHam();
window.addEventListener('resize', checkHam, { passive: true });

// ── LIGHTBOX ──────────────────────────────────
function openLb(src) {
  document.getElementById('lbImg').src = src;
  document.getElementById('lb').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeLb() {
  document.getElementById('lb').classList.remove('open');
  document.body.style.overflow = '';
}
document.getElementById('lb').addEventListener('click', e => {
  if (e.target === document.getElementById('lb') || e.target === document.getElementById('lbCloseBtn')) closeLb();
});

// ── PAYMENT TABS ──────────────────────────────
let payMethod = 'myzaka';

function selectPayMethod(method, el) {
  payMethod = method;
  document.querySelectorAll('.pm-tab').forEach(t => t.classList.remove('on'));
  el.classList.add('on');
  document.querySelectorAll('.pm-panel').forEach(p => p.style.display = 'none');
  document.getElementById('pm-' + method).style.display = 'block';
}

// ── CART ──────────────────────────────────────
let cart = [];

function selectCardType(btn) {
  document.querySelectorAll('.ctt').forEach(x => x.classList.remove('on'));
  btn.classList.add('on');
}

function addToCart(name, price) {
  const ex = cart.find(i => i.name === name);
  if (ex) ex.qty++; else cart.push({ name, price, qty: 1 });
  updateBadge();
  showToast('✦ ' + name + ' added');
}

function removeFromCart(name) {
  cart = cart.filter(i => i.name !== name);
  updateBadge(); renderCart();
}

function updateBadge() {
  const cnt = cart.reduce((s, i) => s + i.qty, 0);
  ['badge','badge-mobile'].forEach(id=>{const el=document.getElementById(id);if(el)el.textContent=cnt;});
}

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('on');
  clearTimeout(t._t); t._t = setTimeout(() => t.classList.remove('on'), 2600);
}

function renderCart() {
  const el = document.getElementById('cItems');
  const tot = document.getElementById('cTotal');
  const pb = document.getElementById('pb');
  if (!cart.length) {
    el.innerHTML = '<div class="ce">— Your cart is empty —</div>';
    tot.textContent = 'P0'; pb.textContent = 'Complete Purchase'; return;
  }
  let html = '', total = 0;
  cart.forEach(i => {
    total += i.price * i.qty;
    html += `<div class="ci"><div><div class="ci-name">${i.name}</div><div class="ci-qty">Qty: ${i.qty} · P${(i.price*i.qty).toLocaleString()}</div></div><button class="ci-rm" onclick="removeFromCart('${i.name.replace(/'/g,"\\'")}')">✕</button></div>`;
  });
  el.innerHTML = html;
  tot.textContent = 'P' + total.toLocaleString();
  pb.textContent = 'Pay P' + total.toLocaleString();
}

function openCart(e) {
  if (e) e.preventDefault();
  renderCart();
  document.getElementById('ov').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeCart() {
  document.getElementById('ov').classList.remove('open');
  document.body.style.overflow = '';
}
document.getElementById('ov').addEventListener('click', e => { if (e.target === e.currentTarget) closeCart(); });

// card formatting
document.getElementById('cn').addEventListener('input', function () {
  let v = this.value.replace(/\D/g,'').slice(0,16);
  this.value = v.replace(/(.{4})/g,'$1 ').trim();
});
document.getElementById('ex').addEventListener('input', function () {
  let v = this.value.replace(/\D/g,'');
  if (v.length >= 2) v = v.slice(0,2)+' / '+v.slice(2,4);
  this.value = v;
});

// ── PAY ───────────────────────────────────────
function pay() {
  if (!cart.length) { showToast('Cart is empty!'); return; }
  const total = cart.reduce((s,i)=>s+i.price*i.qty,0);
  const btn = document.querySelector('.pay-main');

  if (payMethod === 'card') {
    const n=document.getElementById('fn').value.trim();
    const num=document.getElementById('cn').value.replace(/\s/g,'');
    const exp=document.getElementById('ex').value;
    const cvv=document.getElementById('cv').value;
    const em=document.getElementById('em').value.trim();
    if (!n||num.length<16||!exp||!cvv||!em) { showToast('Fill in all card details'); return; }
  } else if (payMethod==='myzaka') {
    if (!document.getElementById('myzaka-phone').value.trim()) { showToast('Enter your MyZaka number'); return; }
  } else if (payMethod==='orange') {
    if (!document.getElementById('orange-phone').value.trim()) { showToast('Enter your Orange Money number'); return; }
  } else if (payMethod==='ewallet') {
    if (!document.getElementById('ew-phone').value.trim()) { showToast('Enter your eWallet number'); return; }
  }

  btn.style.opacity = '0.6';
  document.getElementById('pb').textContent = 'Processing…';

  // ── Replace with real gateway when ready ──
  setTimeout(() => {
    cart=[]; updateBadge(); closeCart();
    btn.style.opacity='1';
    document.getElementById('pb').textContent='Complete Purchase';
    ['fn','cn','ex','cv','em','myzaka-phone','orange-phone','ew-phone']
      .forEach(id=>{const e=document.getElementById(id);if(e)e.value='';});
    showToast('✦ Order confirmed! We\'ll contact you shortly.');
  }, 1800);
}

// ── CONTACT FORM ──────────────────────────────
function sendMessage() {
  const name = document.getElementById('cf-name').value.trim();
  const phone = document.getElementById('cf-phone').value.trim();
  const msg = document.getElementById('cf-msg').value.trim();
  if (!name || !msg) { showToast('Please fill in your name and message'); return; }
  const btn = document.getElementById('cf-send');
  btn.style.opacity = '0.6';
  setTimeout(() => {
    btn.style.opacity='1';
    document.getElementById('cf-name').value='';
    document.getElementById('cf-phone').value='';
    document.getElementById('cf-msg').value='';
    showToast('✦ Message sent! We\'ll be in touch soon.');
  }, 1200);
}

// ── SCROLL REVEAL ─────────────────────────────
const rObs = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) e.target.classList.add('v'); }), { threshold: 0.06 });
document.querySelectorAll('.rev').forEach(r => rObs.observe(r));

// ── FIRE CANVAS ───────────────────────────────
(function () {
  const canvas = document.getElementById('fireCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, P = [];
  function resize() {
    W=canvas.width=canvas.offsetWidth; H=canvas.height=canvas.offsetHeight;
    P=[]; const n=Math.ceil(W/8)*3;
    for(let i=0;i<n;i++) P.push(mkP());
  }
  function mkP(){return{x:Math.random()*W,y:H+Math.random()*30,vx:(Math.random()-.5)*1.1,vy:-(Math.random()*3+1.4),life:0,maxLife:55+Math.random()*75,size:Math.random()*22+7,col:Math.floor(Math.random()*4)};}
  const C=[a=>`rgba(255,214,0,${a})`,a=>`rgba(255,149,0,${a})`,a=>`rgba(255,80,0,${a})`,a=>`rgba(200,30,0,${a})`];
  function draw(){
    ctx.clearRect(0,0,W,H);
    const bg=ctx.createLinearGradient(0,0,0,H);bg.addColorStop(0,'rgba(7,6,10,0)');bg.addColorStop(1,'rgba(7,6,10,1)');ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
    const gg=ctx.createLinearGradient(0,H*.65,0,H);gg.addColorStop(0,'rgba(255,100,0,0)');gg.addColorStop(1,'rgba(200,30,0,.2)');ctx.fillStyle=gg;ctx.fillRect(0,H*.65,W,H*.35);
    P.forEach((p,i)=>{
      p.x+=p.vx+Math.sin(p.life*.05+i)*.4;p.y+=p.vy;p.vy*=.99;p.size*=.993;p.life++;
      if(p.life>p.maxLife||p.y<-p.size||p.size<1){P[i]=mkP();return;}
      const t=p.life/p.maxLife,alpha=t<.2?t/.2:t>.7?(1-t)/.3:1;
      ctx.save();ctx.translate(p.x,p.y);
      const g=ctx.createRadialGradient(0,0,0,0,0,p.size);
      g.addColorStop(0,C[p.col](alpha*.85));g.addColorStop(.5,C[p.col](alpha*.45));g.addColorStop(1,C[p.col](0));
      ctx.fillStyle=g;ctx.scale(1,1.75);ctx.beginPath();ctx.arc(0,0,p.size,0,Math.PI*2);ctx.fill();ctx.restore();
    });
    const lg=ctx.createLinearGradient(0,0,W,0);
    lg.addColorStop(0,'rgba(255,214,0,0)');lg.addColorStop(.2,'rgba(255,214,0,.8)');lg.addColorStop(.5,'rgba(255,80,0,1)');lg.addColorStop(.8,'rgba(255,214,0,.8)');lg.addColorStop(1,'rgba(255,214,0,0)');
    ctx.fillStyle=lg;ctx.fillRect(0,H-7,W,7);
    requestAnimationFrame(draw);
  }
  window.addEventListener('resize',resize,{passive:true});
  resize(); draw();
})();
