let idCounter = 1;
const people = {};
let selectedId = null;
let modalCallback = null;
let modalMode = 'normal';

function createPerson(name, type='normal'){ 
  return {id:idCounter++, name, parents:[], children:[], partners:[], type}; 
}

function openModal(cb, mode='normal'){
  modalCallback = cb;
  modalMode = mode;
  document.getElementById('nameInput').value = '';
  document.getElementById('modalTitle').textContent = mode==='parent' ? 'Input Parent' : 'Input Nama';
  document.getElementById('parentType').style.display = mode==='parent' ? 'block' : 'none';
  document.getElementById('siblingType').style.display = mode==='sibling' ? 'block' : 'none';
  document.getElementById('modal').style.display = 'flex';
}

function closeModal(){ document.getElementById('modal').style.display = 'none'; }

function confirmName(){
  const name = document.getElementById('nameInput').value.trim();
  if(!name) return alert('Nama wajib diisi');
  let extra = null;
  if(modalMode==='parent'){ extra = document.querySelector('input[name="ptype"]:checked').value; }
  if(modalMode==='sibling'){ extra = document.querySelector('input[name="stype"]:checked').value; }
  closeModal();
  modalCallback(name, extra);
}

function card(id){
  const p = people[id];
  const d = document.createElement('div');
  d.className = 'person' + (id === selectedId ? ' selected' : '');
  if(p.type==='first') d.classList.add('first');
  if(p.type==='partner') d.classList.add('partner');
  if(p.type==='child') d.classList.add('child');
  d.textContent = p.type==='first' ? 'Aku (' + p.name + ')' : p.name;
  d.onclick = () => { selectedId = id; renderTree(); };
  return d;
}

function renderTree(){
  const tree = document.getElementById('tree');
  tree.innerHTML = '';
  if(!selectedId) return;
  const me = people[selectedId];

  // Parents
  if(me.parents.length){
    const parentRow = document.createElement('div'); parentRow.className='row';
    me.parents.forEach(id => parentRow.appendChild(card(id)));
    tree.appendChild(parentRow);
  }

  // Siblings
  const siblings = new Set();
  me.parents.forEach(pid => people[pid].children.forEach(cid => siblings.add(cid)));
  siblings.delete(selectedId);
  const older = [], younger = [];
  siblings.forEach(cid => { 
    if(people[cid].name.includes('(Kakak)')) older.push(cid); 
    else if(people[cid].name.includes('(Adik)')) younger.push(cid); 
  });
  if(older.length || younger.length){
    const siblingRow = document.createElement('div'); siblingRow.className='row';
    older.forEach(id => siblingRow.appendChild(card(id)));
    siblingRow.appendChild(card(selectedId));
    younger.forEach(id => siblingRow.appendChild(card(id)));
    tree.appendChild(siblingRow);
  } else {
    tree.appendChild(card(selectedId));
  }

  // Partners
  if(me.partners.length){
    const partnerRow = document.createElement('div'); partnerRow.className='row';
    me.partners.forEach(id => partnerRow.appendChild(card(id)));
    tree.appendChild(partnerRow);
  }

  // Children
  if(me.children.length){
    const childRow = document.createElement('div'); childRow.className='row';
    me.children.forEach(id => childRow.appendChild(card(id)));
    tree.appendChild(childRow);
  }
}

// CRUD
function addFirstPerson(){
  if(selectedId) return alert('Sudah ada orang');
  openModal(name => { const p = createPerson(name,'first'); people[p.id]=p; selectedId=p.id; renderTree(); });
}
function addParent(){
  if(!selectedId) return alert('Tambahkan orang pertama dulu');
  openModal((name,type) => { 
    const p = createPerson(name+' ('+type+')'); 
    people[p.id]=p; 
    p.children.push(selectedId); 
    people[selectedId].parents.push(p.id); 
    renderTree(); 
  },'parent');
}
function addSibling(){
  if(!selectedId) return alert('Pilih orang dulu');
  const me = people[selectedId]; if(!me.parents.length) return alert('Sibling perlu parent');
  openModal((name,type)=>{
    const s = createPerson(name+' ('+type+')');
    people[s.id] = s;
    s.parents = [...me.parents];
    s.parents.forEach(pid=>{
      const arr = people[pid].children;
      const idx = arr.indexOf(selectedId);
      if(!arr.includes(s.id)) arr.splice(type==='Kakak'?idx:idx+1,0,s.id);
    });
    renderTree();
  },'sibling');
}
function addPartner(){
  if(!selectedId) return alert('Pilih orang');
  openModal(name=>{
    const p = createPerson(name,'partner');
    people[p.id]=p;
    if(!people[selectedId].partners.includes(p.id)){
      people[selectedId].partners.push(p.id);
      p.partners.push(selectedId);
    }
    renderTree();
  });
}
function addChild(){
  if(!selectedId) return alert('Pilih orang');
  openModal(name=>{
    const c = createPerson(name,'child');
    people[c.id]=c;
    c.parents.push(selectedId);
    people[selectedId].children.push(c.id);
    renderTree();
  });
}
function deletePerson(){
  if(!selectedId) return;
  const id = selectedId; const p = people[id];
  p.parents.forEach(pid=>people[pid].children = people[pid].children.filter(i=>i!==id));
  p.children.forEach(cid=>people[cid].parents = people[cid].parents.filter(i=>i!==id));
  p.partners.forEach(pid=>people[pid].partners = people[pid].partners.filter(i=>i!==id));
  delete people[id];
  selectedId = Object.keys(people)[0] || null;
  renderTree();
}
function showAll(){
  const tree = document.getElementById('tree');
  tree.innerHTML='';
  const allRow = document.createElement('div'); allRow.className='row';
  Object.keys(people).forEach(id => allRow.appendChild(card(id)));
  tree.appendChild(allRow);
}
