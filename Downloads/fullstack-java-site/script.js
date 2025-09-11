// Data (12 weeks + projects)
const weeks = [
  {week:1, topic:"Java kurulumu, Programlamaya giriş (değişkenler, operatörler, kontrol yapıları)", project:"Basit hesap makinesi", tags:["Java","Temel","IDE"]},
  {week:2, topic:"Nesne Yönelimli Programlama (Class, Object, Constructor, Inheritance, Polymorphism)", project:"Banka hesabı sınıfları", tags:["OOP","Inheritance"]},
  {week:3, topic:"Hata Yönetimi (try/catch, custom exceptions), Threads (multithreading, Runnable)", project:"Multithread sayı sayma uygulaması", tags:["Exception","Thread"]},
  {week:4, topic:"Collection Framework (List, Set, Map, Iterator, Comparable, Comparator)", project:"Öğrenci not listesi", tags:["Collections"]},
  {week:5, topic:"Stream API (filter, map, reduce, optional)", project:"Çalışan maaşlarını filtreleme", tags:["Stream","Functional"]},
  {week:6, topic:"Anotasyonlar (@Override, @Entity), Lambda expressions", project:"Lambda ile liste sıralama", tags:["Annotation","Lambda"]},
  {week:7, topic:"Advanced OOP (generics, abstract class, interface)", project:"Generic repository sınıfı", tags:["Generics","Interface"]},
  {week:8, topic:"Dosya işlemleri (okuma/yazma, serialization)", project:"Kullanıcı kayıtlarını dosyaya kaydetme", tags:["IO","Serialization"]},
  {week:9, topic:"Database temelleri & JDBC (CRUD işlemleri)", project:"Kullanıcı veritabanı yönetimi", tags:["SQL","JDBC"]},
  {week:10, topic:"Hibernate ORM (entity mapping, HQL)", project:"Ürün yönetim sistemi", tags:["ORM","Hibernate"]},
  {week:11, topic:"Spring Framework (IoC, Dependency Injection, MVC)", project:"Spring MVC ile blog uygulaması", tags:["Spring","MVC"]},
  {week:12, topic:"Spring Boot (REST API, validation, mikroservis geliştirme, Eureka, Feign, Docker)", project:"E-ticaret mikroservis projesi (Kullanıcı, Sipariş, Ödeme)", tags:["Spring Boot","Microservices","Docker"]},
];

const projects = [
  {title:"Hesap Makinesi", kicker:"Hafta 1", desc:"Temel operatörler ve kullanıcı girdisiyle çalışan basit CLI.", href:"#program"},
  {title:"Banka Hesabı", kicker:"Hafta 2", desc:"OOP ilkeleriyle hesap yönetimi ve birim testleri.", href:"#program"},
  {title:"Thread Sayaç", kicker:"Hafta 3", desc:"Aynı anda çalışan iki sayaç ve senkronizasyon.", href:"#program"},
  {title:"Öğrenci Notları", kicker:"Hafta 4", desc:"Liste/Map kullanarak veri yönetimi ve sıralama.", href:"#program"},
  {title:"Maaş Filtresi", kicker:"Hafta 5", desc:"Stream ile filtreleme, gruplama ve istatistikler.", href:"#program"},
  {title:"Lambda Sıralama", kicker:"Hafta 6", desc:"Comparator lambda ile farklı sıralama stratejileri.", href:"#program"},
  {title:"Generic Repo", kicker:"Hafta 7", desc:"T tipinde CRUD işlemleri yapan repo sınıfı.", href:"#program"},
  {title:"Kullanıcı IO", kicker:"Hafta 8", desc:"Dosyaya yaz/oku ve basit serialization.", href:"#program"},
  {title:"JDBC CRUD", kicker:"Hafta 9", desc:"PreparedStatement ile güvenli CRUD.", href:"#program"},
  {title:"Ürün Sistemi", kicker:"Hafta 10", desc:"Hibernate entity & HQL ile ürün yönetimi.", href:"#program"},
  {title:"Blog Uygulaması", kicker:"Hafta 11", desc:"Spring MVC controller, view ve validation.", href:"#program"},
  {title:"E‑Ticaret Mikroservis", kicker:"Hafta 12", desc:"Kullanıcı/Sipariş/Ödeme servisleri + Docker.", href:"#program"},
];

// Inject weeks
const weeksOl = document.querySelector(".weeks");
weeks.forEach(item => {
  const li = document.createElement("li");
  li.className = "week";
  li.innerHTML = `
    <div class="dot" aria-hidden="true"></div>
    <article class="week-card" data-animate="fade-up">
      <div class="week-meta">Hafta ${item.week}</div>
      <h3>${item.topic}</h3>
      <p><strong>Mini Proje:</strong> ${item.project}</p>
      <div class="tags">${item.tags.map(t=>`<span class="tag">${t}</span>`).join("")}</div>
    </article>
  `;
  weeksOl.appendChild(li);
});

// Inject projects
const projectWrap = document.getElementById("projectCards");
projects.forEach(p => {
  const div = document.createElement("a");
  div.href = p.href;
  div.className = "card";
  div.innerHTML = `
    <span class="kicker">${p.kicker}</span>
    <h3>${p.title}</h3>
    <p>${p.desc}</p>
    <div class="shine" aria-hidden="true"></div>
  `;
  projectWrap.appendChild(div);
});

// Theme toggle
const modeToggle = document.getElementById("modeToggle");
const root = document.documentElement;
const saved = localStorage.getItem("theme");
if(saved === "light") root.classList.add("light");
modeToggle.textContent = root.classList.contains("light") ? "🌙" : "☀️";
modeToggle.addEventListener("click", ()=>{
  root.classList.toggle("light");
  localStorage.setItem("theme", root.classList.contains("light") ? "light" : "dark");
  modeToggle.textContent = root.classList.contains("light") ? "🌙" : "☀️";
});

// Scroll animations
const observer = new IntersectionObserver((entries)=>{
  entries.forEach(e => {
    if(e.isIntersecting){ e.target.classList.add("in"); observer.unobserve(e.target); }
  });
},{threshold: .12});
document.querySelectorAll("[data-animate]").forEach(el => observer.observe(el));

// Progress demo (click to advance)
let completed = Number(localStorage.getItem("completedWeeks") || 0);
const progressBar = document.getElementById("progressBar");
const completedEl = document.getElementById("completedWeeks");
function renderProgress(){
  const pct = Math.min(100, Math.round((completed/12)*100));
  progressBar.style.width = pct + "%";
  completedEl.textContent = completed;
}
renderProgress();
document.querySelector(".float-card").addEventListener("click", ()=>{
  completed = (completed + 1) > 12 ? 0 : completed + 1;
  localStorage.setItem("completedWeeks", completed);
  renderProgress();
});

// Smooth scroll for internal links
document.querySelectorAll('a[href^="#"]').forEach(a=>{
  a.addEventListener("click", e=>{
    const id = a.getAttribute("href").slice(1);
    const el = document.getElementById(id);
    if(el){ e.preventDefault(); el.scrollIntoView({behavior:"smooth", block:"start"}); }
  });
});
