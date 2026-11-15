const state={content:null,freeFilter:"all",vipFilter:"all"};
const $=s=>document.querySelector(s);
const safe=(v)=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function toast(msg){const el=$("#toast");el.textContent=msg;el.classList.add("show");setTimeout(()=>el.classList.remove("show"),2600)}
function imageFallback(img){img.onerror=()=>{img.onerror=null;img.src="https://placehold.co/900x600/17171d/f12b3c?text=TUN+DEVELOPED"}}
function renderCards(items,kind,filter,query){
 const grid=kind==="free"?$("#freeGrid"):$("#vipGrid");
 const filtered=items.filter(p=>(filter==="all"||p.category===filter)&&(`${p.name} ${p.description} ${p.category}`.toLowerCase().includes(query.toLowerCase())));
 if(!filtered.length){grid.innerHTML='<div class="empty">Không tìm thấy gói phù hợp. Thử từ khóa khác nhé.</div>';return}
 grid.innerHTML=filtered.map(p=>`<article class="product-card">
 <div class="product-image"><img src="${safe(p.image)}" alt="${safe(p.name)}" loading="lazy"><span class="product-label ${kind==="vip"?"gold":""}">${kind==="vip"?"VIP ACCESS":"FREE DOWNLOAD"}</span></div>
 <div class="product-body"><div class="product-category">${safe(p.category.toUpperCase())}</div><h3>${safe(p.name)}</h3><p>${safe(p.description)}</p>
 <div class="product-foot"><span class="${kind==="vip"?"vip-price":"product-version"}">${kind==="vip"?safe(p.price):safe(p.version)}</span><button class="product-link" data-product="${safe(p.id)}" data-kind="${kind}">${kind==="vip"?"CHI TIẾT & MUA":"CHI TIẾT & TẢI"} <b>↗</b></button></div></div></article>`).join("");
 grid.querySelectorAll("img").forEach(imageFallback);
}
function render(){
 const c=state.content;
 $("#announcement").textContent=c.announcement||"TUN DEVELOPED";
 $("#heroTitle").innerHTML=c.heroTitle||"NÂNG CẤP<br>TRẢI NGHIỆM<br><span>PHẦN MỀM</span>";
 $("#heroDescription").textContent=c.heroDescription||"";
 $("#heroBg").style.backgroundImage=`url("${(c.heroImage||"").replace(/"/g,"%22")}")`;
 $("#freeTitle").innerHTML=(c.sections.freeTitle||"KHO MIỄN PHÍ").replace("MIỄN PHÍ","<em>MIỄN PHÍ</em>");
 $("#freeSubtitle").textContent=c.sections.freeSubtitle||"";
 $("#vipTitle").innerHTML=(c.sections.vipTitle||"KHO MUA VIP").replace("VIP","<em>VIP</em>");
 $("#vipSubtitle").textContent=c.sections.vipSubtitle||"";
 $("#newsTitle").innerHTML=(c.sections.newsTitle||"TIN TỨC & CẬP NHẬT").replace("& CẬP NHẬT","<em>& CẬP NHẬT</em>");
 renderCards(c.freeProducts||[],"free",state.freeFilter,$("#freeSearch").value);
 renderCards(c.vipProducts||[],"vip",state.vipFilter,$("#vipSearch").value);
 $("#newsGrid").innerHTML=(c.news||[]).map(n=>`<article class="news-card"><img src="${safe(n.image)}" alt="${safe(n.title)}" loading="lazy"><div><small>${safe(n.date)}</small><h3>${safe(n.title)}</h3><p>${safe(n.description)}</p></div></article>`).join("");
 $("#newsGrid").querySelectorAll("img").forEach(imageFallback);
 for(const key of ["facebook","zalo","telegram","email"]){const a=$("#"+key+"Link");a.href=c.contact?.[key]||"#";if(key==="email"&&!a.href.startsWith("mailto:"))a.href="mailto:"+a.href}
}
function openProduct(id,kind){
 const list=kind==="vip"?state.content.vipProducts:state.content.freeProducts;
 const p=list.find(x=>x.id===id);if(!p)return;
 $("#modalImage").src=p.image||"";imageFallback($("#modalImage"));
 $("#modalTag").textContent=kind==="vip"?"VIP • SẢN PHẨM CAO CẤP":"FREE • TẢI XUỐNG TRỰC TIẾP";
 $("#modalTag").className="tag"+(kind==="vip"?" tag-gold":"");
 $("#modalName").textContent=p.name;$("#modalDescription").textContent=p.description;
 $("#modalMeta").innerHTML=`Danh mục: ${safe(p.category)}<br>Phiên bản: ${safe(p.version)}<br>Hệ điều hành: ${safe(p.system)}<br>Giá: ${safe(p.price)}`;
 const action=$("#modalAction");
 if(kind==="vip"){
  const msg=encodeURIComponent(state.content.contact?.purchaseMessage||`Xin chào, tôi muốn mua ${p.name}.`);
  const email=state.content.contact?.email||"";
  const href=state.content.contact?.zalo||"";
  action.innerHTML=`<a class="modal-button vip" href="${safe(href)}" target="_blank" rel="noopener">LIÊN HỆ MUA GÓI VIP ↗</a> <a class="modal-button" style="margin-left:6px" href="${safe(email.startsWith("mailto:")?email+"?body="+msg:"mailto:"+email+"?body="+msg)}">GỬI EMAIL</a>`;
 }else{
  const path=p.download||"";
  action.innerHTML=path?`<a class="modal-button" href="${safe(path)}" download>TẢI GÓI NGAY ↓</a>`:`<button class="modal-button" disabled>CHƯA CÓ FILE TẢI</button>`;
  if(!path)toast("Gói này chưa được gắn file tải xuống.");
 }
 $("#productModal").classList.add("open");$("#productModal").setAttribute("aria-hidden","false");document.body.style.overflow="hidden";
}
function closeModal(){$("#productModal").classList.remove("open");$("#productModal").setAttribute("aria-hidden","true");document.body.style.overflow=""}
document.addEventListener("click",e=>{
 const product=e.target.closest("[data-product]");if(product)openProduct(product.dataset.product,product.dataset.kind);
 if(e.target.matches("[data-close]"))closeModal();
});
document.addEventListener("keydown",e=>{if(e.key==="Escape")closeModal()});
$("#freeSearch").addEventListener("input",()=>renderCards(state.content.freeProducts,"free",state.freeFilter,$("#freeSearch").value));
$("#vipSearch").addEventListener("input",()=>renderCards(state.content.vipProducts,"vip",state.vipFilter,$("#vipSearch").value));
$("#freeFilters").addEventListener("click",e=>{const b=e.target.closest("button[data-filter]");if(!b)return;state.freeFilter=b.dataset.filter;$("#freeFilters").querySelectorAll("button").forEach(x=>x.classList.toggle("active",x===b));renderCards(state.content.freeProducts,"free",state.freeFilter,$("#freeSearch").value)});
$("#vipFilters").addEventListener("click",e=>{const b=e.target.closest("button[data-filter]");if(!b)return;state.vipFilter=b.dataset.filter;$("#vipFilters").querySelectorAll("button").forEach(x=>x.classList.toggle("active",x===b));renderCards(state.content.vipProducts,"vip",state.vipFilter,$("#vipSearch").value)});
$("#menuToggle").addEventListener("click",()=>$("#nav").classList.toggle("open"));
$("#nav").addEventListener("click",e=>{if(e.target.closest("a"))$("#nav").classList.remove("open")});
fetch("content.json").then(r=>{if(!r.ok)throw Error("Không tải được content.json");return r.json()}).then(c=>{try{const draft=localStorage.getItem("tunDevelopedDraft");if(draft)c=JSON.parse(draft)}catch(e){console.warn("Bản nháp local không hợp lệ, dùng content.json gốc.",e)}state.content=c;render()}).catch(err=>{console.error(err);document.querySelector("main").innerHTML='<div class="wrap" style="padding:100px 0"><h2>CHƯA TẢI ĐƯỢC DỮ LIỆU WEBSITE</h2><p>Hãy mở website bằng Live Server trong VS Code, không mở trực tiếp file index.html.</p><p>Kiểm tra file content.json có nằm cùng thư mục với index.html hay không.</p></div>'});
