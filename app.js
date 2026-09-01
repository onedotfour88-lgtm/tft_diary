import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// 파이어베이스 설정
const firebaseConfig = {
  apiKey: "AIzaSyBigKnHH1iioUAXJiXtCpdLzryxsTmHwW",
  authDomain: "tft-diary-2d76e.firebaseapp.com",
  projectId: "tft-diary-2d76e",
  storageBucket: "tft-diary-2d76e.firebasestorage.app",
  messagingSenderId: "425413983426",
  appId: "1:425413983426:web:3f0f091c47cdb092064f5b",
  measurementId: "G-M9LZ7X2J9H"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const tierSelect = document.getElementById('tierSelect');
const blockReasonInput = document.getElementById('blockReason');
const saveBtn = document.getElementById('saveBtn');

const resTier = document.getElementById('resTier');
const resDays = document.getElementById('resDays');
const resDaily = document.getElementById('resDaily');
const resCountdown = document.getElementById('resCountdown');

const targetDate = new Date('2026-10-31T23:59:59');

// 1. 저장 데이터 불러오기
async function loadSavedData() {
  const localReason = localStorage.getItem('blockReason');
  const localTier = localStorage.getItem('selectedTier');
  if (localReason) blockReasonInput.value = localReason;
  if (localTier) tierSelect.value = localTier;

  try {
    const docRef = doc(db, "tftNotes", "userFeedback");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      if (data.reason) blockReasonInput.value = data.reason;
      if (data.targetHours) tierSelect.value = data.targetHours;
    }
  } catch (error) {
    console.error("불러오기 에러:", error);
  }
  
  updateDisplay();
}

// 2. 저장 버튼 클릭 시 파이어베이스 저장 및 기존 메인 페이지 이동
saveBtn.addEventListener('click', async () => {
  const reasonText = blockReasonInput.value;
  const targetHours = parseFloat(tierSelect.value);
  const selectedTierName = tierSelect.options[tierSelect.selectedIndex].text;

  // 브라우저 저장
  localStorage.setItem('blockReason', reasonText);
  localStorage.setItem('selectedTier', targetHours);

  try {
    await setDoc(doc(db, "tftNotes", "userFeedback"), {
      reason: reasonText,
      targetHours: targetHours,
      tierName: selectedTierName,
      updatedAt: new Date().toISOString()
    });
    alert('저장 완료! 원래 다이어리 페이지로 이동합니다.');
  } catch (error) {
    console.error("파이어베이스 저장 오류:", error);
    alert('로컬 저장 완료! 원래 페이지로 이동합니다.');
  }

  // 🚀 원래 프로젝트 메인 페이지(index.html)로 이동
  window.location.href = "./index.html";
});

// 3. 화면 및 카운트다운 업데이트
function updateDisplay() {
  const currentTime = new Date();
  const diffTime = targetDate - currentTime;

  if (diffTime <= 0) {
    resCountdown.textContent = '10월 목표 기한이 종료되었습니다!';
    return;
  }

  const daysLeft = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const hoursLeft = Math.floor((diffTime / (1000 * 60 * 60)) % 24);
  const minutesLeft = Math.floor((diffTime / (1000 * 60)) % 60);
  const secondsLeft = Math.floor((diffTime / 1000) % 60);

  const totalDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  const targetHours = parseFloat(tierSelect.value);
  const dailyHours = (targetHours / totalDays).toFixed(1);

  resTier.textContent = tierSelect.options[tierSelect.selectedIndex].text;
  resDays.textContent = totalDays;
  resDaily.textContent = dailyHours;
  resCountdown.textContent = `10월 마감까지: ${daysLeft}일 ${hoursLeft}시간 ${minutesLeft}분 ${secondsLeft}초`;
}

loadSavedData();
setInterval(updateDisplay, 1000);