// ---------- Data ----------
// ---------- Helpers ----------
const $ = id => document.getElementById(id);
const seed = [
  {id:1,name:"Running Shoes",category:"Shoes",price:2499,emoji:"👟",desc:"Light and comfy shoes for daily runs."},
  {id:2,name:"Wireless Headphones",category:"Electronics",price:1999,emoji:"🎧",desc:"Bluetooth headphones with 20 hour battery."},
  {id:3,name:"Backpack",category:"Bags",price:1299,emoji:"🎒",desc:"Water resistant bag with a laptop pocket."},
  {id:4,name:"Smart Watch",category:"Electronics",price:3499,emoji:"⌚",desc:"Tracks steps, sleep and heart rate."},
  {id:5,name:"Sunglasses",category:"Fashion",price:899,emoji:"🕶️",desc:"UV protected, lightweight frame."},
  {id:6,name:"Water Bottle",category:"Home",price:399,emoji:"🍶",desc:"Steel bottle that keeps drinks cold for 12 hours."},
  {id:7,name:"Laptop",category:"Electronics",price:45999,emoji:"💻",desc:"14 inch laptop, 16GB RAM, good for coding."},
  {id:8,name:"Denim Jacket",category:"Fashion",price:1799,emoji:"🧥",desc:"Classic blue jacket, soft inside lining."},
  {id:9,name:"Table Lamp",category:"Home",price:749,emoji:"💡",desc:"LED desk lamp with 3 brightness levels."}
];
function load(key, fallback){
  try{ const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }catch(e){ return fallback; }
}
function save(key, val){ try{ localStorage.setItem(key, JSON.stringify(val)); }catch(e){} }

let products = load("cartly_products_v2", seed);
let cart = load("cartly_cart_v2", []);   // [{id, qty}]
let editingId = null;

const money = n => "₹" + n.toLocaleString("en-IN");
function esc(s){ const d=document.createElement("div"); d.textContent=s; return d.innerHTML; }
function toast(msg){ const t=$("toast"); t.textContent=msg; t.style.display="block"; clearTimeout(t._t); t._t=setTimeout(()=>t.style.display="none",1600); }

// ---------- Render products (Read + Search + Filter + Sort) ----------
function renderFilter(){
  const cur = $("filter").value;
  const cats = [...new Set(products.map(p=>p.category))].sort();
  $("filter").innerHTML = '<option value="">All categories</option>' + cats.map(c=>`<option>${esc(c)}</option>`).join("");
  $("filter").value = cats.includes(cur) ? cur : "";
}
function renderProducts(){
  const q = $("search").value.trim().toLowerCase();
  const cat = $("filter").value, sort = $("sort").value;
  let list = products.filter(p => (!cat || p.category===cat) && (!q || (p.name+" "+p.category).toLowerCase().includes(q)));
  if(sort==="low") list.sort((a,b)=>a.price-b.price);
  if(sort==="high") list.sort((a,b)=>b.price-a.price);
  if(sort==="az") list.sort((a,b)=>a.name.localeCompare(b.name));
  if(sort==="za") list.sort((a,b)=>b.name.localeCompare(a.name));
  $("grid").innerHTML = list.length ? list.map(p=>`
    <div class="card">
      <div class="thumb" data-view="${p.id}" title="View details">${esc(p.emoji||"📦")}</div>
      <div class="cat">${esc(p.category)}</div>
      <strong>${esc(p.name)}</strong>
      <div class="price">${money(p.price)}</div>
      <div class="row">
        <button class="primary" data-add="${p.id}">Add to cart</button>
        <button data-view="${p.id}">View</button>
        <button data-edit="${p.id}">Edit</button>
      </div>
    </div>`).join("") : '<div class="empty">No products match. Try another search or add a product.</div>';
}

// ---------- Create / Update ----------
function openForm(id){
  editingId = id || null;
  const p = products.find(x=>x.id===id);
  $("formTitle").textContent = p ? "Edit product" : "Add product";
  $("fName").value = p?.name || ""; $("fCat").value = p?.category || "";
  $("fPrice").value = p?.price || ""; $("fEmoji").value = p?.emoji || ""; $("fDesc").value = p?.desc || "";
  $("formOverlay").classList.add("open"); $("fName").focus();
}
$("form").addEventListener("submit", e=>{
  e.preventDefault();
  const data = {name:$("fName").value.trim(), category:$("fCat").value.trim(),
    price:Number($("fPrice").value), emoji:$("fEmoji").value.trim()||"📦", desc:$("fDesc").value.trim()};
  if(!data.name || !data.category || !(data.price>0)){ toast("Fill name, category and a valid price"); return; }
  if(editingId){ products = products.map(p=>p.id===editingId ? {...p,...data} : p); toast("Product updated"); }
  else { products.push({id:Date.now(),...data}); toast("Product added"); }
  save("cartly_products_v2", products);
  $("formOverlay").classList.remove("open");
  renderFilter(); renderProducts(); renderCart();
});

// ---------- Single product ----------
function viewProduct(id){
  const p = products.find(x=>x.id===id); if(!p) return;
  $("viewBox").innerHTML = `
    <div class="big">${esc(p.emoji||"📦")}</div>
    <h2>${esc(p.name)}</h2>
    <div class="cat">${esc(p.category)}</div>
    <p>${esc(p.desc||"No description yet.")}</p>
    <div class="price" style="font-size:1.3rem">${money(p.price)}</div>
    <div class="row" style="margin-top:14px">
      <button id="vClose">Close</button>
      <button class="primary" id="vAdd">Add to cart</button>
    </div>`;
  $("viewOverlay").classList.add("open");
  $("vClose").onclick = ()=>$("viewOverlay").classList.remove("open");
  $("vAdd").onclick = ()=>{ addToCart(id); $("viewOverlay").classList.remove("open"); };
}

// ---------- Cart ----------
function addToCart(id){
  const item = cart.find(c=>c.id===id);
  if(item) item.qty++; else cart.push({id,qty:1});
  save("cartly_cart_v2", cart); renderCart(); toast("Added to cart");
}
function changeQty(id, delta){
  const item = cart.find(c=>c.id===id); if(!item) return;
  item.qty += delta;
  if(item.qty<1) cart = cart.filter(c=>c.id!==id);   // going below 1 removes it
  save("cartly_cart_v2", cart); renderCart();
}
function removeFromCart(id){
  cart = cart.filter(c=>c.id!==id);
  save("cartly_cart_v2", cart); renderCart();
}
function renderCart(){
  let total = 0, count = 0;
  const rows = cart.map(c=>{
    const p = products.find(x=>x.id===c.id); if(!p) return "";
    total += p.price*c.qty; count += c.qty;
    return `<div class="item">
      <div style="font-size:1.8rem">${esc(p.emoji||"📦")}</div>
      <div class="info"><strong>${esc(p.name)}</strong><br><span class="cat">${money(p.price)} each</span></div>
      <div>
        <div class="qty"><button data-dec="${p.id}" aria-label="Decrease">−</button><span>${c.qty}</span><button data-inc="${p.id}" aria-label="Increase">+</button></div>
        <div style="text-align:right"><strong>${money(p.price*c.qty)}</strong></div>
      </div>
      <button class="danger" data-rm="${p.id}" aria-label="Remove">✕</button>
    </div>`;
  }).join("");
  $("cartList").innerHTML = rows || '<div class="empty">Your cart is empty. Add something from the shop.</div>';
  $("total").textContent = money(total);
  $("cartCount").textContent = count;
}

// ---------- Events ----------
$("grid").addEventListener("click", e=>{
  const b = e.target.closest("[data-add],[data-view],[data-edit]"); if(!b) return;
  if(b.dataset.add) addToCart(+b.dataset.add);
  if(b.dataset.view) viewProduct(+b.dataset.view);
  if(b.dataset.edit) openForm(+b.dataset.edit);
});
$("cartList").addEventListener("click", e=>{
  const b = e.target.closest("[data-inc],[data-dec],[data-rm]"); if(!b) return;
  if(b.dataset.inc) changeQty(+b.dataset.inc, 1);
  if(b.dataset.dec) changeQty(+b.dataset.dec, -1);
  if(b.dataset.rm) removeFromCart(+b.dataset.rm);
});
$("addBtn").onclick = ()=>openForm();
$("formCancel").onclick = ()=>$("formOverlay").classList.remove("open");
$("cartBtn").onclick = ()=>$("drawer").classList.add("open");
$("closeCart").onclick = ()=>$("drawer").classList.remove("open");
$("clearCart").onclick = ()=>{ cart=[]; save("cartly_cart_v2",cart); renderCart(); };
["search","filter","sort"].forEach(id=>$(id).addEventListener("input", renderProducts));
document.querySelectorAll(".overlay").forEach(o=>o.addEventListener("click", e=>{ if(e.target===o) o.classList.remove("open"); }));
document.addEventListener("keydown", e=>{ if(e.key==="Escape"){ document.querySelectorAll(".overlay").forEach(o=>o.classList.remove("open")); $("drawer").classList.remove("open"); }});

renderFilter(); renderProducts(); renderCart();
