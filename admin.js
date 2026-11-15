window.addEventListener("tun-admin-authorized", () => {
let data=null,currentKind="free",selectedId=null;
const $=s=>document.querySelector(s);
const safe=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function toast(t){const e=$("#toast");e.textContent=t;e.classList.add("show");setTimeout(()=>e.classList.remove("show"),2600)}
function saveLocal(){localStorage.setItem("tunDevelopedDraft",JSON.stringify(data));}
function downloadJson(){const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="content.json";document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url);toast("Đã xuất content.json. Hãy tải file lên GitHub để công khai.");}
function switchTab(name){document.querySelectorAll(".tab-panel").forEach(p=>p.classList.toggle("active",p.id==="tab-"+name));document.querySelectorAll(".nav-item").forEach(b=>b.classList.toggle("active",b.dataset.tab===name));window.scrollTo({top:0,behavior:"smooth"});}
document.querySelectorAll("[data-tab]").forEach(b=>b.addEventListener("click",()=>switchTab(b.dataset.tab)));
document.querySelectorAll("[data-goto]").forEach(b=>b.addEventListener("click",()=>switchTab(b.dataset.goto)));
function products(){return currentKind==="free"?data.freeProducts:data.vipProducts}
function updateStats(){$("#statFree").textContent=data.freeProducts.length;$("#statVip").textContent=data.vipProducts.length;$("#statTotal").textContent=data.freeProducts.length+data.vipProducts.length;$("#countFree").textContent=data.freeProducts.length;$("#countVip").textContent=data.vipProducts.length}
function renderList(){
 const q=$("#productSearch").value.toLowerCase();
 const list=products().filter(p=>(p.name+" "+p.category).toLowerCase().includes(q));
 $("#productList").innerHTML=list.map(p=>`<button class="product-choice ${p.id===selectedId?"active":""}" data-id="${safe(p.id)}"><strong>${safe(p.name)}</strong><small>${safe(p.category)} • ${currentKind==="vip"?safe(p.price):safe(p.version)}</small></button>`).join("")||'<p style="color:#888;font-size:10px">Không có sản phẩm phù hợp.</p>';
}
function loadForm(p){
 selectedId=p?.id||null;$("#formTitle").textContent=p?p.name:"THÊM SẢN PHẨM MỚI";
 $("#pId").value=p?.id||"";$("#pName").value=p?.name||"";$("#pCategory").value=p?.category||"";$("#pVersion").value=p?.version||"v1.0.0";$("#pDescription").value=p?.description||"";$("#pSystem").value=p?.system||"Windows 10/11";$("#pPrice").value=p?.price||(currentKind==="free"?"Miễn phí":"");$("#pImage").value=p?.image||"";$("#pDownload").value=p?.download||"";
 $("#downloadField").style.display=currentKind==="free"?"block":"none";$("#deleteProduct").style.display=p?"inline-flex":"none";
 $("#imagePreview").src=p?.image||"";$("#imagePreview").style.display=p?.image?"block":"none";renderList();
}
function refresh(){updateStats();renderList();fillSettings()}
function fillSettings(){
 $("#aAnnouncement").value=data.announcement||"";$("#aHeroTitle").value=data.heroTitle||"";$("#aHeroDescription").value=data.heroDescription||"";$("#aHeroImage").value=data.heroImage||"";
 $("#aFreeTitle").value=data.sections?.freeTitle||"";$("#aFreeSubtitle").value=data.sections?.freeSubtitle||"";$("#aVipTitle").value=data.sections?.vipTitle||"";$("#aVipSubtitle").value=data.sections?.vipSubtitle||"";$("#aNewsTitle").value=data.sections?.newsTitle||"";
 $("#heroPreview").src=data.heroImage||"";
 $("#cFacebook").value=data.contact?.facebook||"";$("#cZalo").value=data.contact?.zalo||"";$("#cTelegram").value=data.contact?.telegram||"";$("#cEmail").value=data.contact?.email||"";$("#cMessage").value=data.contact?.purchaseMessage||"";
}
function addProduct(){
 const list=products();let n=list.length+1;let id;
 do{id=(currentKind==="free"?"free-":"vip-")+String(n).padStart(2,"0");n++}while([...data.freeProducts,...data.vipProducts].some(p=>p.id===id));
 const p={id,name:"SẢN PHẨM MỚI",description:"Mô tả sản phẩm của bạn.",category:"Tiện ích",version:"v1.0.0",system:"Windows 10/11",price:currentKind==="free"?"Miễn phí":"0₫",image:"",...(currentKind==="free"?{download:""}:{purchase:true})};
 list.push(p);selectedId=id;refresh();loadForm(p);toast("Đã thêm sản phẩm mới. Hãy chỉnh thông tin rồi lưu.");
}
$("#productList").addEventListener("click",e=>{const b=e.target.closest("[data-id]");if(!b)return;const p=products().find(x=>x.id===b.dataset.id);loadForm(p)});
document.querySelectorAll("[data-kind]").forEach(b=>b.addEventListener("click",()=>{currentKind=b.dataset.kind;document.querySelectorAll("[data-kind]").forEach(x=>x.classList.toggle("active",x===b));loadForm(null);renderList()}));
$("#productSearch").addEventListener("input",renderList);
$("#newProduct").addEventListener("click",addProduct);
$("#clearForm").addEventListener("click",()=>loadForm(null));
$("#pImage").addEventListener("input",()=>{const v=$("#pImage").value.trim();$("#imagePreview").src=v;$("#imagePreview").style.display=v?"block":"none"});
$("#productForm").addEventListener("submit",e=>{
 e.preventDefault();const list=products();let p=list.find(x=>x.id===$("#pId").value);
 if(!p){const id=$("#pId").value||`${currentKind}-${Date.now()}`;p={id};list.push(p)}
 Object.assign(p,{name:$("#pName").value.trim(),category:$("#pCategory").value.trim(),version:$("#pVersion").value.trim(),description:$("#pDescription").value.trim(),system:$("#pSystem").value.trim(),price:$("#pPrice").value.trim(),image:$("#pImage").value.trim()});
 if(currentKind==="free")p.download=$("#pDownload").value.trim();else p.purchase=true;
 saveLocal();refresh();loadForm(p);toast("Đã lưu sản phẩm vào bản nháp trên máy.");
});
$("#deleteProduct").addEventListener("click",()=>{if(!selectedId)return;if(!confirm("Bạn chắc chắn muốn xóa sản phẩm này?"))return;const list=products();const i=list.findIndex(p=>p.id===selectedId);if(i>=0)list.splice(i,1);selectedId=null;saveLocal();refresh();loadForm(null);toast("Đã xóa sản phẩm khỏi bản nháp.")});
$("#appearanceForm").addEventListener("submit",e=>{e.preventDefault();data.announcement=$("#aAnnouncement").value;data.heroTitle=$("#aHeroTitle").value;data.heroDescription=$("#aHeroDescription").value;data.heroImage=$("#aHeroImage").value;data.sections={...data.sections,freeTitle:$("#aFreeTitle").value,freeSubtitle:$("#aFreeSubtitle").value,vipTitle:$("#aVipTitle").value,vipSubtitle:$("#aVipSubtitle").value,newsTitle:$("#aNewsTitle").value};saveLocal();$("#heroPreview").src=data.heroImage;toast("Đã lưu nội dung giao diện.")});
$("#contactForm").addEventListener("submit",e=>{e.preventDefault();data.contact={...data.contact,facebook:$("#cFacebook").value.trim(),zalo:$("#cZalo").value.trim(),telegram:$("#cTelegram").value.trim(),email:$("#cEmail").value.trim(),purchaseMessage:$("#cMessage").value.trim()};saveLocal();toast("Đã lưu thông tin liên hệ.")});
$("#saveDraft").addEventListener("click",()=>{saveLocal();toast("Đã lưu bản nháp trên trình duyệt này.")});
$("#resetDraft").addEventListener("click",()=>{if(!confirm("Xóa bản nháp trên trình duyệt và tải lại dữ liệu gốc?"))return;localStorage.removeItem("tunDevelopedDraft");location.reload()});
$("#exportJson").addEventListener("click",downloadJson);$("#quickExport").addEventListener("click",downloadJson);
$("#importJson").addEventListener("change",async e=>{const f=e.target.files[0];if(!f)return;try{const imported=JSON.parse(await f.text());if(!Array.isArray(imported.freeProducts)||!Array.isArray(imported.vipProducts))throw Error("Thiếu danh sách sản phẩm Free/VIP");data=imported;saveLocal();refresh();loadForm(null);toast("Đã nhập dữ liệu JSON thành công.")}catch(err){alert("Không thể nhập JSON: "+err.message)}e.target.value=""});
async function init(){try{const draft=localStorage.getItem("tunDevelopedDraft");if(draft)data=JSON.parse(draft);else{const r=await fetch("content.json");if(!r.ok)throw Error("Không đọc được content.json");data=await r.json()}if(!data.sections)data.sections={};if(!data.contact)data.contact={};refresh();loadForm(null)}catch(e){document.querySelector(".main").innerHTML=`<div class="panel"><h2>KHÔNG TẢI ĐƯỢC DỮ LIỆU</h2><p>Hãy mở admin.html bằng Live Server và kiểm tra content.json.</p><p>${safe(e.message)}</p></div>`}}
init();

});
