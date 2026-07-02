
const localPeerProfilesDB = {
  "usama khan": {
    avatarImg: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80", // Real Profile Pic
    about: "Full Stack Developer mapping scalable MERN application logic, building modular Node endpoints, and designing UI components using Tailwind CSS.",
    skills: ["MongoDB", "Express.js", "React.js", "Node.js", "Tailwind CSS"],
    experience: "Junior Developer @ Systems Alpha Ltd (6 Months)",
    education: "FAST-NUCES (Karachi) - BS Computer Science"
  },
  "usama malik": {
    avatarImg: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80", // Real Profile Pic
    about: "Creative UI/UX Designer dedicated to wireframing premium high-fidelity prototypes and optimizing cross-platform web interaction structures.",
    skills: ["Figma Architecture", "Wireframing", "Tailwind UI", "Product Design"],
    experience: "UI/UX Consultant @ GridStudio Graphics (1+ Years)",
    education: "NCA Lahore - Bachelors in Product Design"
  },
  "zainab malik": {
    avatarImg: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80", // Real Profile Pic
    about: "Technical Talent Acquisition Head focusing on agile engineering team alignments and premium open-source human resource pipelines.",
    skills: ["Strategic Recruitment", "Team Building", "Agile Roadmap Operations"],
    experience: "Senior HR Talent Executive @ TechMatrix (2+ Years)",
    education: "LUMS Lahore - MBA Human Resource Management"
  },
  "haider ali": {
    avatarImg: "", 
    about: "Core Web Developer specializing in JavaScript interface integrations, responsive web structures, and cross-browser compilation fixes.",
    skills: ["HTML5", "CSS3", "JavaScript", "REST APIs", "Git Frameworks"],
    experience: "Frontend Intern @ Pakistan Software Houses Ecosystem",
    education: "COMSATS University Islamabad - BS Software Engineering"
  },
  "default": {
    avatarImg: "",
    about: "Verified application network member on PeerGrid. Active in technical collaborative workflows and engineering shared spaces.",
    skills: ["Web Standards", "JavaScript", "Git Integration"],
    experience: "Independent Technical Contributor",
    education: "Higher Computing Institute Graduate"
  }
};


function openSideProfile(name, title, initial) {
  const sideCard = document.getElementById('sideProfileCard');
  if (!sideCard) return;

  document.getElementById('sideUserName').innerText = name;
  document.getElementById('sideUserTitle').innerText = title;

  const userKey = name.toLowerCase().trim();
  const userData = localPeerProfilesDB[userKey] || localPeerProfilesDB["default"];

  const imgElement = document.getElementById('sideUserImg');
  const avatarFallback = document.getElementById('sideUserAvatar');

  if (imgElement && avatarFallback) {
    if (userData.avatarImg && userData.avatarImg.trim() !== "") {
      imgElement.src = userData.avatarImg;
      imgElement.classList.remove('hidden');
      avatarFallback.classList.add('hidden');
    } else {
      // Agar image link blank ya undefined ho, to text avatar active ho jaye
      avatarFallback.innerText = initial;
      avatarFallback.classList.remove('hidden');
      imgElement.classList.add('hidden');
    }
  } else if (avatarFallback) {
    // Structural safety fallback logic
    avatarFallback.innerText = initial;
  }

  // Populate expanded technical parameters
  if (document.getElementById('sideUserAbout')) {
    document.getElementById('sideUserAbout').innerText = userData.about;
  }
  if (document.getElementById('sideUserExperience')) {
    document.getElementById('sideUserExperience').innerText = userData.experience;
  }
  if (document.getElementById('sideUserEducation')) {
    document.getElementById('sideUserEducation').innerText = userData.education;
  }

  // Loop and inject skill badges
  const skillsWrap = document.getElementById('sideUserSkills');
  if (skillsWrap) {
    skillsWrap.innerHTML = userData.skills.map(skill => `
      <span class="text-[9px] bg-sky-500/10 text-sky-400 px-2 py-0.5 rounded border border-sky-500/20 font-medium">
        ${skill}
      </span>
    `).join('');
  }

  // Adjust message button click routing dynamic actions
  const msgBtn = document.getElementById('sideMessageBtn');
  if (msgBtn) {
    msgBtn.setAttribute('onclick', `redirectToMessage('${encodeURIComponent(name)}')`);
  }

  // Display card UI
  sideCard.classList.remove('hidden');
}

function closeSideProfile() {
  const sideCard = document.getElementById('sideProfileCard');
  if (sideCard) sideCard.classList.add('hidden');
}

function redirectToMessage(userName) {
  window.location.href = `messages.html?user=${userName}`;
}

function executeFeedSearch() {
  const query = document.getElementById('feedSearchInput').value.toLowerCase().trim();

  const feedContainer = document.getElementById('contentDisplayStage');
  if (feedContainer) {
    const posts = feedContainer.children;
    for (let i = 0; i < posts.length; i++) {
      const postElement = posts[i];
      const textContent = postElement.innerText.toLowerCase();
      postElement.style.display = textContent.includes(query) ? "" : "none";
    }
  }

  const usersContainer = document.getElementById('usersContainer');
  if (usersContainer) {
    const userItems = usersContainer.getElementsByClassName('user-account-item');
    for (let j = 0; j < userItems.length; j++) {
      const userItem = userItems[j];
      const userText = userItem.innerText.toLowerCase();
      userItem.style.display = userText.includes(query) ? "flex" : "none";
    }
  }
}