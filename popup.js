/* === popup.js === */
const exercises = [
  "Deadlift", "Farmers Carry", "Front Squat", "Back Squat", "Overhead Squat", 
  "Shoulder Press", "Push Press", "Push Jerk", "Thruster", "Clean", 
  "Power Clean", "Hang Clean", "Hang Power Clean", "Snatch", "Power Snatch"
];

function calculateWeight(rm, percent) {
  return Math.round(rm * percent / 100);
}

function getPlates(total, barWeight, platesAvailable) {
  if (total < barWeight) return { plates: "Za mało na sztangę.", actualWeight: barWeight.toFixed(2) };
  let perSide = (total - barWeight) / 2;
  let result = [];
  let actualWeight = barWeight;
  for (let plate of platesAvailable) {
    let count = Math.floor(perSide / plate);
    if (count >= 1) {
      result.push(`${count} x ${plate.toFixed(2)}kg`);
      perSide -= count * plate;
      actualWeight += count * plate * 2;
    }
  }
  return result.length ? { plates: result.join(", "), actualWeight: actualWeight.toFixed(2) } : { plates: "Nie można dobrać talerzy.", actualWeight: barWeight.toFixed(2) };
}

window.onload = () => {
  const savedPlates = JSON.parse(localStorage.getItem('plates')) || [];
  const savedRM = JSON.parse(localStorage.getItem('rm')) || {};
  const savedExercise = localStorage.getItem('selectedExercise') || exercises[0];

  document.getElementById('exerciseSelect').value = savedExercise;
  document.getElementById('rmInput').value = savedRM[savedExercise] || '';
  document.getElementById('barWeight').value = '15';

  document.getElementById('exerciseSelect').addEventListener('change', () => {
    const selectedExercise = document.getElementById('exerciseSelect').value;
    const savedRM = JSON.parse(localStorage.getItem('rm')) || {};
    document.getElementById('rmInput').value = savedRM[selectedExercise] || '';
  });

  document.querySelectorAll('input[type=checkbox]').forEach(cb => {
    if (savedPlates.includes(parseFloat(cb.value))) cb.checked = true;
  });

  document.getElementById('clearRM').addEventListener('click', () => {
    const selectedExercise = document.getElementById('exerciseSelect').value;
    const savedRM = JSON.parse(localStorage.getItem('rm')) || {};
    delete savedRM[selectedExercise];
    localStorage.setItem('rm', JSON.stringify(savedRM));
    document.getElementById('rmInput').value = '';
  });
};

function saveData() {
  const checkboxes = document.querySelectorAll('input[type=checkbox]:checked');
  const plates = Array.from(checkboxes).map(cb => parseFloat(cb.value));
  localStorage.setItem('plates', JSON.stringify(plates));

  const selectedExercise = document.getElementById('exerciseSelect').value;
  localStorage.setItem('selectedExercise', selectedExercise);

  const rm = parseFloat(document.getElementById('rmInput').value);
  let savedRM = JSON.parse(localStorage.getItem('rm')) || {};
  if (rm) {
    savedRM[selectedExercise] = rm;
    localStorage.setItem('rm', JSON.stringify(savedRM));
  }
}

document.getElementById('calculateBtn').addEventListener('click', () => {
  saveData();
  const rm = parseFloat(document.getElementById('rmInput').value);
  const barWeight = parseFloat(document.getElementById('barWeight').value);
  const checkboxes = document.querySelectorAll('input[type=checkbox]:checked');
  const plates = Array.from(checkboxes).map(cb => parseFloat(cb.value)).sort((a, b) => b - a);
  const resultsDiv = document.getElementById('results');
  resultsDiv.innerHTML = '';

  if (!rm || plates.length === 0) {
    resultsDiv.innerHTML = '<p>Podaj 1RM i zaznacz talerze.</p>';
    return;
  }

  let percentages = [];
  for (let i = 10; i <= 70; i += 10) percentages.push(i);
  for (let i = 75; i <= 100; i += 5) percentages.push(i);

  percentages.forEach(percent => {
    const target = calculateWeight(rm, percent);
    if (target >= barWeight) {
      const { plates: plateStr, actualWeight } = getPlates(target, barWeight, plates);
      resultsDiv.innerHTML += `<p><strong>${percent}% = ${target}kg</strong><br> Talerze: ${plateStr}<br> Faktyczna waga: ${actualWeight}kg</p>`;
    }
  });
});
