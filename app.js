const STORE_KEY = "tryout-uh3-sejarah-v1";
let bank, state = loadState(), activePackage = 1, activeIndex = 0, currentSelections = [], toastTimer, quizStarted = false, warningPending = false, playingAlert = false;
const $ = id => document.getElementById(id);
function loadState(){try{return JSON.parse(localStorage.getItem(STORE_KEY))||{packages:{}}}catch{return{packages:{}}}}
function saveState(){localStorage.setItem(STORE_KEY,JSON.stringify(state));}
function packageState(id){const ps=state.packages[id] ||= {answers:{},checked:{},completed:false,score:null,violations:0};if(typeof ps.violations!=="number")ps.violations=0;return ps;}
function showView(id){document.querySelectorAll(".view").forEach(v=>v.classList.remove("active"));$(id).classList.add("active");window.scrollTo({top:0,behavior:"smooth"});}
function toast(msg){const el=$("toast");el.textContent=msg;el.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove("show"),2200);}
function pad(n){return String(n).padStart(2,"0")}
function totalAnswered(){return Object.values(state.packages).reduce((s,p)=>s+Object.keys(p.checked||{}).length,0)}
function renderHome(){
 const grid=$("packageGrid");grid.innerHTML="";
 bank.packages.forEach(pkg=>{
  const ps=packageState(pkg.id),done=Object.keys(ps.checked).length,complete=done===25;
  const card=document.createElement("article");card.className="package-card";card.tabIndex=0;card.setAttribute("role","button");card.setAttribute("aria-label",`Mulai ${pkg.name}`);
  card.innerHTML=`<div class="package-top"><span class="package-no">EDISI / ${pad(pkg.id)}</span><span class="package-state">${complete?"SELESAI":done?`${done}/25 TERJAWAB`:"TERSEDIA"}</span></div><h3>${pkg.name}</h3><p>20 PG · 5 PG kompleks</p><div class="card-bottom"><div class="card-progress"><i style="width:${done/25*100}%"></i></div><span class="card-arrow">↗</span></div>`;
  card.addEventListener("click",()=>startPackage(pkg.id));card.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();startPackage(pkg.id)}});grid.append(card);
 });
 const done=totalAnswered(),pct=Math.round(done/125*100),complete=bank.packages.filter(p=>packageState(p.id).completed).length;
 $("overallPercent").innerHTML=`${pct}<span>%</span>`;$("overallBar").style.width=pct+"%";$("overallDone").textContent=`${done} dari 125 soal terjawab`;$("packageDone").textContent=`${complete}/5 paket selesai`;
 $("miniBars").innerHTML=bank.packages.map(p=>`<span><i style="width:${Object.keys(packageState(p.id).checked).length/25*100}%"></i></span>`).join("");
}
function requestFullscreen(){
 if(!document.fullscreenElement && document.documentElement.requestFullscreen){
  document.documentElement.requestFullscreen().catch(()=>toast("Mode layar penuh tidak dapat diaktifkan. Gunakan tombol lanjutkan untuk mencoba lagi."));
 }
}
function startPackage(id){
 activePackage=id;quizStarted=true;warningPending=false;
 const ps=packageState(id);const firstUnchecked=bank.packages[id-1].questions.findIndex(q=>!ps.checked[q.number]);activeIndex=firstUnchecked<0?0:firstUnchecked;
 requestFullscreen();showView("quizView");renderQuestion();
}
function leaveQuizMode(){quizStarted=false;warningPending=false;if(document.fullscreenElement&&document.exitFullscreen)document.exitFullscreen().catch(()=>{});}
function showIntegrityWarning(message){
 $("integrityMessage").textContent=message;
 $("violationCount").textContent=pad(packageState(activePackage).violations);
 $("integrityWarning").hidden=false;
}
async function playAlertFiveTimes(){
 const audio=$("alertAudio");if(playingAlert)return;playingAlert=true;
 try{
  for(let i=0;i<5;i++){
   audio.pause();audio.currentTime=0;
   await new Promise((resolve,reject)=>{
    const ended=()=>{cleanup();resolve()};const error=()=>{cleanup();reject(new Error("Audio gagal diputar"))};
    const cleanup=()=>{audio.removeEventListener("ended",ended);audio.removeEventListener("error",error)};
    audio.addEventListener("ended",ended,{once:true});audio.addEventListener("error",error,{once:true});
    audio.play().catch(err=>{cleanup();reject(err)});
   });
  }
 }catch(e){toast("Audio otomatis dibatasi browser. Gunakan tombol putar ulang.");}
 finally{playingAlert=false;}
}
function resumeExam(){
 requestFullscreen();$("integrityWarning").hidden=true;
 if(warningPending){warningPending=false;}
}
document.addEventListener("visibilitychange",()=>{
 if(!quizStarted)return;
 if(document.visibilityState==="hidden"){
  warningPending=true;const ps=packageState(activePackage);ps.violations=(ps.violations||0)+1;saveState();
 }else if(warningPending){
  showIntegrityWarning("Sistem mendeteksi kamu berpindah tab atau meninggalkan halaman ujian. Tetap fokus dan kerjakan ujian pada halaman ini.");
  playAlertFiveTimes();
 }
});
document.addEventListener("fullscreenchange",()=>{
 if(quizStarted&&!document.fullscreenElement&&document.visibilityState==="visible"&&$("integrityWarning").hidden){
  showIntegrityWarning("Mode layar penuh telah dinonaktifkan. Tekan tombol lanjutkan untuk kembali ke mode layar penuh.");
 }
});
$("resumeExam").addEventListener("click",resumeExam);
$("replayAlert").addEventListener("click",playAlertFiveTimes);
function getQuestion(){return bank.packages[activePackage-1].questions[activeIndex]}
function renderQuestion(){
 const q=getQuestion(),ps=packageState(activePackage),saved=ps.answers[q.number]||[];
 currentSelections=[...saved];
 $("quizPackageName").textContent=`PAKET ${pad(activePackage)}`;$("quizTypeMeta").textContent="PERGERAKAN NASIONAL · INDONESIA";
 $("railCount").textContent=`${pad(activeIndex+1)} / 25`;$("railProgress").style.width=`${(Object.keys(ps.checked).length/25)*100}%`;
 $("questionTopic").textContent=q.topic.toUpperCase();$("questionNumber").textContent=pad(q.number);
 $("typePill").textContent=q.type==="pg"?"PILIHAN GANDA":"PILIHAN GANDA KOMPLEKS";
 $("questionText").textContent=q.stem;$("selectHint").textContent=q.type==="pg"?"Pilih satu jawaban yang paling tepat.":"Pilih semua jawaban yang benar. Jawaban dinilai tepat jika seluruh pilihan benar dipilih tanpa memilih opsi yang keliru.";
 const list=$("optionsList");list.innerHTML="";
 q.options.forEach(o=>{
  const b=document.createElement("button");b.className="option"+(currentSelections.includes(o.id)?" selected":"");b.type="button";b.disabled=!!ps.checked[q.number];b.innerHTML=`<span class="option-key">${q.type==="pg"?o.id:(currentSelections.includes(o.id)?"✓":"□")}</span><span class="option-text">${o.text}</span>`;
  b.addEventListener("click",()=>toggleOption(o.id));list.append(b);
 });
 const isChecked=!!ps.checked[q.number];$("submitAnswer").hidden=isChecked;$("nextQuestion").hidden=!isChecked;
 $("prevQuestion").disabled=activeIndex===0;$("prevQuestion").style.opacity=activeIndex===0?".35":"1";
 $("answeredStatus").textContent=isChecked?"JAWABAN TERSIMPAN":"BELUM DIJAWAB";
 const fb=$("answerFeedback");fb.hidden=!isChecked;
 if(isChecked) renderFeedback(q,ps.answers[q.number]);
 const map=$("questionMap");map.innerHTML="";
 bank.packages[activePackage-1].questions.forEach((item,i)=>{
  const btn=document.createElement("button");btn.className="map-number"+(i===activeIndex?" current":"")+(ps.checked[item.number]?" done":"");btn.textContent=pad(i+1);btn.title=`Soal ${i+1}`;btn.addEventListener("click",()=>{activeIndex=i;renderQuestion()});map.append(btn);
 });
 $("railProgress").style.width=`${Object.keys(ps.checked).length/25*100}%`;
}
function toggleOption(id){
 const q=getQuestion(),ps=packageState(activePackage);if(ps.checked[q.number])return;
 if(q.type==="pg"){currentSelections=[id]}else{currentSelections=currentSelections.includes(id)?currentSelections.filter(x=>x!==id):[...currentSelections,id]}
 ps.answers[q.number]=[...currentSelections];saveState();renderQuestion();
}
function renderFeedback(q,selected){
 const correct=q.options.filter(o=>o.correct).map(o=>o.id).sort(),given=[...selected].sort(),isCorrect=correct.length===given.length&&correct.every((v,i)=>v===given[i]);
 const parts=q.options.filter(o=>selected.includes(o.id)||o.correct).map(o=>`<div><b>${o.id} · ${o.correct?"KUNCI":"PILIHAN"}</b> — ${o.feedback}</div>`).join("");
 $("answerFeedback").innerHTML=`<strong>${isCorrect?"JAWABAN TEPAT":"PERLU DITINJAU KEMBALI"}</strong>${parts}`;
 $("optionsList").querySelectorAll(".option").forEach((b,i)=>{const o=q.options[i];if(o.correct)b.classList.add("correct");else if(selected.includes(o.id))b.classList.add("incorrect")});
}
function submitAnswer(){
 const q=getQuestion(),ps=packageState(activePackage);if(!currentSelections.length){toast("Pilih jawaban terlebih dahulu.");return}
 ps.answers[q.number]=[...currentSelections];ps.checked[q.number]=true;saveState();renderQuestion();
 if(q.number===10||q.number===20){$("checkpointNumber").textContent=pad(q.number);$("checkpointText").textContent=`Kamu telah menyelesaikan ${q.number} soal. Periksa kembali pola jawaban dan lanjutkan dengan fokus.`;$("checkpointModal").hidden=false}
 if(Object.keys(ps.checked).length===25){ps.completed=true;ps.score=calculateScore();saveState();setTimeout(showResult,450)}
}
function calculateScore(){const ps=packageState(activePackage),qs=bank.packages[activePackage-1].questions;return qs.filter(q=>{const a=[...(ps.answers[q.number]||[])].sort(),c=q.options.filter(o=>o.correct).map(o=>o.id).sort();return a.length===c.length&&a.every((v,i)=>v===c[i])}).length}
function showResult(){
 leaveQuizMode();
 const ps=packageState(activePackage),qs=bank.packages[activePackage-1].questions,score=calculateScore(),wrong=25-score;
 $("resultTitle").textContent=`Paket ${pad(activePackage)}`;$("resultScore").textContent=`${score*4}`;$("resultMessage").textContent=score>=20?"Pemahamanmu sudah kuat. Pertahankan ketelitian dan lanjutkan latihan.":score>=15?"Dasar pemahaman sudah terbentuk. Tinjau kembali beberapa indikator yang masih keliru.":"Gunakan pembahasan sebagai bahan belajar, lalu coba ulangi paket ini.";
 $("correctCount").textContent=score;$("wrongCount").textContent=wrong;$("accuracyCount").textContent=`${score*4}%`;$("answeredCount").textContent="25/25";
 $("reviewList").innerHTML=qs.map(q=>{
  const a=ps.answers[q.number]||[],c=q.options.filter(o=>o.correct).map(o=>o.id),ok=a.length===c.length&&c.every(x=>a.includes(x));
  const key=q.options.filter(o=>o.correct).map(o=>o.text).join("; ");
  return `<div class="review-item"><span class="review-index">${pad(q.number)}</span><div class="review-copy"><b>${q.topic}</b><p>${q.stem}<br><strong>Kunci:</strong> ${key}</p></div><span class="review-status ${ok?"":"bad"}">${ok?"TEPAT":"TINJAU"}</span></div>`;
 }).join("");
 $("nextPackage").textContent=activePackage===5?"Kembali ke dashboard":"Paket berikutnya ↗";
 $("nextPackage").onclick=()=>{if(activePackage===5)showView("homeView");else startPackage(activePackage+1)};
 $("repeatPackage").onclick=()=>{const p=packageState(activePackage);p.answers={};p.checked={};p.completed=false;p.score=null;saveState();startPackage(activePackage)};
 renderHome();showView("resultView");
}
$("exploreBtn").addEventListener("click",()=>$("packages").scrollIntoView({behavior:"smooth"}));
$("backHome").addEventListener("click",()=>{leaveQuizMode();renderHome();showView("homeView")});
$("resultHome").addEventListener("click",()=>{leaveQuizMode();renderHome();showView("homeView")});
$("submitAnswer").addEventListener("click",submitAnswer);
$("prevQuestion").addEventListener("click",()=>{if(activeIndex>0){activeIndex--;renderQuestion()}});
$("nextQuestion").addEventListener("click",()=>{if(activeIndex<24){activeIndex++;renderQuestion()}});
$("closeCheckpoint").addEventListener("click",()=>$("checkpointModal").hidden=true);
$("continueCheckpoint").addEventListener("click",()=>$("checkpointModal").hidden=true);
$("brandHome").addEventListener("click",e=>{e.preventDefault();leaveQuizMode();renderHome();showView("homeView")});
$("resetAll").addEventListener("click",()=>{if(confirm("Hapus seluruh progres latihan dari perangkat ini?")){leaveQuizMode();state={packages:{}};saveState();renderHome();toast("Progres berhasil diatur ulang.")}});
fetch("questions.json").then(r=>{if(!r.ok)throw new Error("Gagal memuat bank soal");return r.json()}).then(d=>{bank=d;renderHome();$("todayLabel").textContent=new Date().toLocaleDateString("id-ID",{day:"2-digit",month:"short",year:"numeric"}).toUpperCase()}).catch(()=>{document.querySelector("main").innerHTML="<p style='padding:40px'>Bank soal tidak dapat dimuat. Pastikan file questions.json berada di folder yang sama dengan index.html.</p>"});
