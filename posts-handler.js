let currentUser = null, selectedImageBase64 = null, publisherOpen = false, profileData = {};

window.onload = function () {
  currentUser = pgGetUser(); if (!currentUser) return;
  profileData = pgGetProfile(currentUser.email);
  pgSeedDatabase();
  pgBuildNav('feed');
  pgBuildLeftSidebar('pg-left-sidebar');
  

  const name = profileData.name || currentUser.name || 'User';
  const publisherAvatarEl = document.getElementById('publisherAvatar');
  
  if (profileData.profileImg || currentUser.profileImg) {
    const imgUrl = profileData.profileImg || currentUser.profileImg;
    publisherAvatarEl.innerHTML = `<img src="${imgUrl}" class="w-full h-full rounded-full object-cover" alt="avatar"/>`;
    publisherAvatarEl.classList.remove('bg-sky-900', 'text-sky-400', 'font-black');
  } else {
    const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    publisherAvatarEl.textContent = initials;
  }
  
  renderFeed();
};

function focusPublisher() {
  if (!publisherOpen) { document.getElementById('publisherExpanded').classList.remove('hidden'); publisherOpen = true; setTimeout(() => document.getElementById('postInput').focus(), 50); }
}
function handleImageSelect(event) {
  const file = event.target.files[0]; if (!file) return;
  const reader = new FileReader();
  reader.onload = e => { selectedImageBase64 = e.target.result; document.getElementById('imagePreviewImg').src = selectedImageBase64; document.getElementById('imagePreviewWrap').classList.remove('hidden'); };
  reader.readAsDataURL(file);
}
function removeSelectedImage() { selectedImageBase64 = null; document.getElementById('imageFileInput').value = ''; document.getElementById('imagePreviewImg').src = ''; document.getElementById('imagePreviewWrap').classList.add('hidden'); }

function handlePublishAction() {
  const mainText = document.getElementById('postInput').value.trim();
  if (!mainText) { showToast('Post cannot be empty!'); return; }
  let posts = JSON.parse(localStorage.getItem('peergrid_posts')) || [];
  
  posts.unshift({ 
    id: 'post_' + Date.now(), 
    authorName: currentUser.name, 
    authorBio: profileData.bio || currentUser.bio, 
    authorImg: profileData.profileImg || currentUser.profileImg || null,
    content: mainText, 
    image: selectedImageBase64 || null, 
    timestamp: new Date().toLocaleString(), 
    likes: 0, 
    likedBy: [], 
    comments: [] 
  });
  
  localStorage.setItem('peergrid_posts', JSON.stringify(posts));
  removeSelectedImage();
  document.getElementById('postInput').value = '';
  document.getElementById('publisherExpanded').classList.add('hidden');
  publisherOpen = false;
  renderFeed();
  showToast('Published! 🚀');
}

function renderFeed() {
  const stage = document.getElementById('contentDisplayStage'); 
  stage.innerHTML = '';
  let posts = JSON.parse(localStorage.getItem('peergrid_posts')) || [];
  
  if (!posts.length) { 
    stage.innerHTML = `<div class="pg-card" style="padding:40px;text-align:center;opacity:.4;"><i class="fas fa-folder-open" style="font-size:24px;margin-bottom:8px;color:#475569;"></i><p style="font-size:12px;color:#64748b;">No posts yet. Be the first!</p></div>`; 
    return; 
  }
  
  posts.forEach(p => {
    const isLiked = (p.likedBy || []).includes(currentUser.name);
    const isOwnPost = p.authorName === currentUser.name;

    let avatarMarkup = '';
    
    if (isOwnPost) {
      avatarMarkup = pgAvatarInner(profileData, currentUser);
    } else {
      let authorProfilePic = p.authorImg;
      
      for (let key in localStorage) {
        if (key.startsWith('pg_profile_')) {
          const targetProf = JSON.parse(localStorage.getItem(key)) || {};
          if (targetProf.name === p.authorName && (targetProf.profileImg || targetProf.avatar)) {
            authorProfilePic = targetProf.profileImg || targetProf.avatar;
            break;
          }
        }
      }

      if (authorProfilePic) {
        avatarMarkup = `<img src="${authorProfilePic}" class="w-full h-full rounded-full object-cover" alt="user avatar"/>`;
      } else {
        const initials = (p.authorName || 'User').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
        avatarMarkup = initials;
      }
    }

    const div = document.createElement('div');
    div.className = 'pg-card post-card overflow-hidden';
    div.id = `post-card-${p.id}`;
    
    div.innerHTML = `
      <div class="p-5 space-y-3" onclick="openPostDetail('${p.id}')">
        <div class="flex justify-between items-start">
          <div class="flex gap-3 items-center">
            <div class="w-10 h-10 rounded-full bg-sky-900/40 border border-sky-800/50 text-sky-400 flex items-center justify-center font-black text-sm flex-shrink-0 overflow-hidden">
              ${avatarMarkup}
            </div>
            <div>
              <h4 class="font-bold text-slate-200 text-sm">${p.authorName}</h4>
              <p class="text-[10px] text-slate-500">${p.authorBio || 'PeerGrid Member'}</p>
              <p class="text-[10px] text-slate-600 font-mono">${p.timestamp}</p>
            </div>
          </div>
          
          ${isOwnPost ? `
            <div class="flex gap-1.5" onclick="event.stopPropagation();">
              <button onclick="enableInlineEdit('${p.id}')" class="btn btn-ghost btn-xs text-slate-400 hover:text-sky-400 p-1" title="Edit Post">
                <i class="fas fa-edit text-xs"></i>
              </button>
              <button onclick="deletePostAction('${p.id}')" class="btn btn-ghost btn-xs text-slate-400 hover:text-rose-500 p-1" title="Delete Post">
                <i class="fas fa-trash-alt text-xs"></i>
              </button>
            </div>
          ` : ''}
        </div>
        
        <div id="post-body-${p.id}">
          <p class="text-xs text-slate-300 leading-relaxed">${p.content}</p>
        </div>

        ${p.image ? `<img src="${p.image}" class="w-full max-h-64 object-cover rounded-xl border border-slate-800" alt="post image"/>` : ''}
        ${(p.comments || []).length > 0 ? `<p class="text-[10px] text-slate-600"><i class="fas fa-comment mr-1"></i>${(p.comments || []).length} comment${(p.comments || []).length > 1 ? 's' : ''}</p>` : ''}
      </div>
      <div class="border-t border-slate-800/60 px-4 py-2 flex items-center gap-1">
        <button onclick="event.stopPropagation();toggleLikeOnCard('${p.id}')" class="action-btn ${isLiked ? 'liked' : ''}"><i class="fas fa-heart text-[10px]"></i> <span id="likes-post-${p.id}">${p.likes || 0}</span></button>
        <button onclick="openPostDetail('${p.id}')" class="action-btn"><i class="fas fa-comment text-[10px]"></i> Comment</button>
        <button onclick="event.stopPropagation();pgShare('${escQ(p.authorName)}','${escQ(p.content.slice(0,60))}')" class="action-btn ml-auto"><i class="fas fa-share text-[10px]"></i> Share</button>
      </div>`;
    stage.appendChild(div);
  });
}
function enableInlineEdit(id) {
  let posts = JSON.parse(localStorage.getItem('peergrid_posts')) || [];
  const p = posts.find(x => x.id === id);
  if (!p) return;

  const bodyContainer = document.getElementById(`post-body-${id}`);
  if (!bodyContainer) return;

  bodyContainer.parentElement.setAttribute('onclick', ''); 

  bodyContainer.innerHTML = `
    <div class="space-y-2 mt-1" onclick="event.stopPropagation();">
      <textarea id="editInput-${id}" class="textarea textarea-bordered bg-slate-950 border-slate-800 focus:border-sky-500 w-full text-xs text-slate-200 resize-none h-20">${p.content}</textarea>
      <div class="flex justify-end gap-2">
        <button onclick="cancelInlineEdit('${id}', '${escQ(p.content)}')" class="btn btn-xs rounded-full bg-slate-800 text-slate-400 hover:bg-slate-700 border-none px-3">Cancel</button>
        <button onclick="saveInlineEdit('${id}')" class="btn btn-xs btn-primary rounded-full text-slate-900 font-bold px-4">Save</button>
      </div>
    </div>
  `;
  setTimeout(() => document.getElementById(`editInput-${id}`).focus(), 50);
}

function cancelInlineEdit(id, originalContent) { renderFeed(); }

function saveInlineEdit(id) {
  const newText = document.getElementById(`editInput-${id}`).value.trim();
  if (!newText) { showToast('Post content cannot be empty!'); return; }

  let posts = JSON.parse(localStorage.getItem('peergrid_posts')) || [];
  const postIndex = posts.findIndex(x => x.id === id);
  if (postIndex === -1) return;

  posts[postIndex].content = newText;
  posts[postIndex].timestamp = new Date().toLocaleString() + " (Edited)";
  
  localStorage.setItem('peergrid_posts', JSON.stringify(posts));
  renderFeed();
  showToast('Post updated! 📝');
}

function deletePostAction(id) {
  if (!confirm("Are you sure you want to delete this post?")) return;
  let posts = JSON.parse(localStorage.getItem('peergrid_posts')) || [];
  posts = posts.filter(x => x.id !== id);
  localStorage.setItem('peergrid_posts', JSON.stringify(posts));
  renderFeed();
  showToast('Post deleted! 🗑️');
}

function toggleLikeOnCard(id) { pgToggleLike('post', id, currentUser.name, () => renderFeed()); }

function openPostDetail(postId) {
  let posts = JSON.parse(localStorage.getItem('peergrid_posts')) || [];
  const p = posts.find(x => x.id === postId); if (!p) return;
  const isLiked = (p.likedBy || []).includes(currentUser.name);
  const isOwnPost = p.authorName === currentUser.name;
  const commentsHtml = (p.comments || []).map(c => `<div class="comment-bubble"><span class="cn">${c.author}:</span>${c.text}</div>`).join('');

  let modalAvatarMarkup = '';
  if (p.authorImg) {
    modalAvatarMarkup = `<img src="${p.authorImg}" class="w-full h-full rounded-full object-cover" alt="modal avatar"/>`;
  } else {
    const initials = p.authorName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    modalAvatarMarkup = initials;
  }

  document.getElementById('detailModalContent').innerHTML = `
    <div class="p-5 border-b border-slate-800 flex justify-between items-center sticky top-0 bg-slate-900/95 backdrop-blur rounded-t-3xl z-10">
      <div class="flex items-center gap-2"><i class="fas fa-stream text-sky-400 text-xs"></i><span class="text-[10px] uppercase tracking-widest font-bold text-slate-500">Post Detail</span></div>
      <div class="flex items-center gap-2">
        ${isOwnPost ? `
          <button onclick="closeDetailModal(); enableInlineEdit('${p.id}')" class="btn btn-ghost btn-xs text-slate-400 hover:text-sky-400" title="Edit"><i class="fas fa-edit"></i></button>
          <button onclick="closeDetailModal(); deletePostAction('${p.id}')" class="btn btn-ghost btn-xs text-slate-400 hover:text-rose-500" title="Delete"><i class="fas fa-trash-alt"></i></button>
        ` : ''}
        <button onclick="closeDetailModal()" class="btn btn-ghost btn-xs btn-circle text-slate-500 hover:text-slate-100"><i class="fas fa-times"></i></button>
      </div>
    </div>
    <div class="p-6 space-y-5">
      <div class="flex items-center gap-3">
        <div class="w-14 h-14 rounded-full bg-sky-900/40 border-2 border-sky-500/30 text-sky-400 flex items-center justify-center font-black text-xl overflow-hidden">${modalAvatarMarkup}</div>
        <div><h3 class="font-black text-slate-100 text-base">${p.authorName}</h3><p class="text-xs text-slate-500">${p.authorBio || 'PeerGrid Member'}</p><p class="text-[10px] text-slate-600 font-mono">${p.timestamp}</p></div>
      </div>
      ${p.image ? `<img src="${p.image}" class="w-full max-h-96 object-cover rounded-xl border border-slate-800"/>` : ''}
      <div class="bg-slate-950 border border-slate-800 rounded-xl p-4"><p class="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">${p.content}</p></div>
      <div class="grid grid-cols-2 gap-3">
        <div class="pg-card p-3 text-center"><p class="text-[9px] uppercase text-slate-500 font-bold tracking-wider">Likes</p><p class="text-2xl font-black text-rose-400 mt-1">${p.likes || 0}</p></div>
        <div class="pg-card p-3 text-center"><p class="text-[9px] uppercase text-slate-500 font-bold tracking-wider">Comments</p><p class="text-2xl font-black text-sky-400 mt-1">${(p.comments || []).length}</p></div>
      </div>
      <div>
        <p class="text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-2"><i class="fas fa-comment mr-1"></i> Discussion</p>
        <div id="modal-comments-${p.id}">${commentsHtml || '<p class="text-[11px] text-slate-600 italic">No comments yet.</p>'}</div>
        <div class="comment-input-row"><input type="text" id="commentInput-${p.id}" placeholder="Write a comment..." onkeydown="if(event.key==='Enter')submitPostComment('${p.id}')"/><button class="comment-send-btn" onclick="submitPostComment('${p.id}')"><i class="fas fa-paper-plane"></i></button></div>
      </div>
    </div>
    <div class="px-6 pb-6 flex gap-3">
      <button onclick="toggleLikeInModal('${p.id}')" class="action-btn flex-1 justify-center py-2.5 text-xs ${isLiked ? 'liked' : ''}"><i class="fas fa-heart"></i> <span id="modal-likes-${p.id}">${p.likes || 0}</span> Like</button>
      <button onclick="pgShare('${escQ(p.authorName)}','${escQ(p.content.slice(0,50))}')" class="action-btn flex-1 justify-center py-2.5 text-xs"><i class="fas fa-share"></i> Share</button>
      <button onclick="closeDetailModal()" class="btn btn-sm btn-outline border-slate-700 text-slate-400 hover:text-white flex-1 rounded-xl text-xs"><i class="fas fa-arrow-left text-xs"></i> Back</button>
    </div>`;
  document.getElementById('detailModal').setAttribute('class', 'pg-modal active');
  document.body.style.overflow = 'hidden';
}
function closeDetailModal() { document.getElementById('detailModal').setAttribute('class', 'pg-modal'); document.body.style.overflow = ''; }
function handleDetailModalBackdrop(e) { if (e.target === document.getElementById('detailModal')) closeDetailModal(); }
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeDetailModal(); });

function submitPostComment(id) {
  const inputEl = document.getElementById('commentInput-' + id);
  const text = inputEl.value.trim(); if (!text) return;
  pgAddComment('post', id, currentUser.name, text);
  inputEl.value = '';
  document.getElementById('modal-comments-' + id).innerHTML += `<div class="comment-bubble"><span class="cn">${currentUser.name}:</span>${text}</div>`;
  showToast('Comment posted!');
  renderFeed();
}
function toggleLikeInModal(id) {
  pgToggleLike('post', id, currentUser.name, item => {
    const el = document.getElementById('modal-likes-' + id); if (el) el.textContent = item.likes;
    const btn = el ? el.closest('button') : null;
    if (btn) (item.likedBy || []).includes(currentUser.name) ? btn.classList.add('liked') : btn.classList.remove('liked');
    renderFeed();
  });
}