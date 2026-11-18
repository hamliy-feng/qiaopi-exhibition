const tabs = document.querySelectorAll(".tab");
const toggleAnnotations = document.getElementById("toggleAnnotations");
const documentViewer = document.querySelector(".doc-image-wrap");
const evidenceTitle = document.getElementById("evidenceTitle");
const evidenceText = document.getElementById("evidenceText");
const annotations = document.querySelectorAll(".annotation");
const storySteps = document.querySelectorAll(".story-step");
const eventCards = document.querySelectorAll(".event-card");
const langToggle = document.getElementById("langToggle");

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach((item) => item.classList.remove("active"));
    tab.classList.add("active");
  });
});

if (toggleAnnotations && documentViewer) {
  toggleAnnotations.addEventListener("click", () => {
    const hidden = documentViewer.classList.toggle("annotations-hidden");
    toggleAnnotations.textContent = hidden ? "显示标注" : "隐藏标注";
  });
}

function setEvidence(title, text) {
  evidenceTitle.textContent = title;
  evidenceText.textContent = text;
}

function activateOne(collection, activeItem) {
  collection.forEach((item) => item.classList.remove("active"));
  activeItem.classList.add("active");
}

annotations.forEach((annotation) => {
  annotation.addEventListener("click", () => {
    setEvidence(annotation.textContent.trim(), annotation.dataset.evidence);
  });
});

storySteps.forEach((step) => {
  step.addEventListener("click", () => {
    activateOne(storySteps, step);
    const title = step.querySelector("strong").textContent;
    setEvidence(title, `原文短句：“${step.dataset.evidence}”。`);
  });
});

eventCards.forEach((card) => {
  card.addEventListener("click", () => {
    activateOne(eventCards, card);
    const title = card.querySelector("span").textContent;
    setEvidence(title, `原文短句：“${card.dataset.evidence}”。这条短句可以连接到人物、事件和批信影像。`);
  });
});

let english = false;
langToggle.addEventListener("click", () => {
  english = !english;
  const labels = {
    "纪录": "Record",
    "原文": "Original",
    "译文": "Translation",
    "影像": "Image",
    "人物": "People",
    "家族网络": "Kinship",
    "数据字段": "Fields",
  };

  tabs.forEach((tab) => {
    const original = tab.dataset.tab;
    tab.textContent = english ? labels[original] : original;
  });

  langToggle.textContent = english ? "EN / 中" : "中 / EN";
});
