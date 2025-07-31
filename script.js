let questions = [];
let currentQuestion = 0;
let userAnswers = new Array(15).fill(null);
let timer;
let timeLeft = 1800; // 30 minutes

function startQuiz() {
  const email = document.getElementById("email").value;
  if (!email) return alert("Please enter a valid email");

  document.getElementById("start-screen").classList.add("hidden");
  document.getElementById("quiz-screen").classList.remove("hidden");
  document.getElementById("submit-button").classList.remove("hidden");

  fetchQuestions();
  startTimer();
}

function fetchQuestions() {
  fetch("https://opentdb.com/api.php?amount=15")
    .then(res => res.json())
    .then(data => {
      questions = data.results;
      renderQuestion();
      renderOverview();
    });
}

function renderQuestion() {
  if (userAnswers[currentQuestion] === null) {
    userAnswers[currentQuestion] = {
      answer: null,
      markedForReview: false
    };
  }

  const question = questions[currentQuestion];
  const optionsDiv = document.getElementById("options");
  optionsDiv.innerHTML = "";

  const options = shuffle([...question.incorrect_answers, question.correct_answer]);
  question.options = options;

  const selected = userAnswers[currentQuestion]?.answer;

  options.forEach((opt, index) => {
    const label = document.createElement("label");
    label.textContent = decodeHTMLEntities(opt);

    const input = document.createElement("input");
    input.type = "radio";
    input.name = "option";
    input.value = index;
    if (selected === index) input.checked = true;

    input.addEventListener("change", () => {
      userAnswers[currentQuestion] = {
        answer: index,
        markedForReview: userAnswers[currentQuestion]?.markedForReview || false
      };
      renderOverview();
    });

    label.addEventListener("dblclick", () => {
      input.checked = false;
      userAnswers[currentQuestion] = {
        answer: null,
        markedForReview: userAnswers[currentQuestion]?.markedForReview || false
      };
      renderQuestion();
      renderOverview();
    });

    label.prepend(input);
    optionsDiv.appendChild(label);
  });

  document.getElementById("question-text").innerHTML =
    `${currentQuestion + 1}. ${decodeHTMLEntities(question.question)}`;
}

function markForReview() {
  if (!userAnswers[currentQuestion]) {
    userAnswers[currentQuestion] = {
      answer: null,
      markedForReview: true
    };
  } else {
    userAnswers[currentQuestion].markedForReview = true;
  }

  renderOverview();
  nextQuestion(); // Optional: auto move
}

function renderOverview() {
  const container = document.getElementById("overview");
  container.innerHTML = "";

  for (let i = 0; i < questions.length; i++) {
    const btn = document.createElement("button");
    btn.textContent = i + 1;

    const ua = userAnswers[i];

    if (ua && ua.markedForReview && ua.answer !== null) {
      btn.className = "answered-review"; // Purple
    } else if (ua && ua.answer !== null) {
      btn.className = "answered"; // Green
    } else if (ua && ua.answer === null) {
      btn.className = "not-answered"; // Red
    } else {
      btn.className = "not-visited"; // Gray
    }

    if (i === currentQuestion) {
      btn.style.outline = "3px solid #fff";
    }

    btn.onclick = () => {
      currentQuestion = i;
      renderQuestion();
      renderOverview();
    };

    container.appendChild(btn);
  }
}

function nextQuestion() {
  if (currentQuestion < questions.length - 1) {
    currentQuestion++;
    renderQuestion();
    renderOverview();
  }
}

function prevQuestion() {
  if (currentQuestion > 0) {
    currentQuestion--;
    renderQuestion();
    renderOverview();
  }
}

function submitQuiz() {
  clearInterval(timer);

  document.getElementById("quiz-screen").classList.add("hidden");
  document.getElementById("result-screen").classList.remove("hidden");
  document.getElementById("submit-button").classList.add("hidden");

  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = "";

  questions.forEach((question, index) => {
    const correctAnswer = decodeHTMLEntities(question.correct_answer);
    const userAnswerIndex = userAnswers[index]?.answer;
    let userAnswerText = "<i>Not answered</i>";

    if (userAnswerIndex !== undefined && userAnswerIndex !== null) {
      userAnswerText = decodeHTMLEntities(question.options[userAnswerIndex]);
    }

    const resultItem = document.createElement("div");
    resultItem.classList.add("result-item");
    resultItem.innerHTML = `
      <h4>Q${index + 1}: ${decodeHTMLEntities(question.question)}</h4>
      <p><strong>Your answer:</strong> ${userAnswerText}</p>
      <p><strong>Correct answer:</strong> ${correctAnswer}</p>
      <hr>
    `;

    resultsDiv.appendChild(resultItem);
  });
}

function startTimer() {
  updateTimer();
  timer = setInterval(() => {
    timeLeft--;
    updateTimer();
    if (timeLeft <= 0) {
      submitQuiz();
    }
  }, 1000);
}

function updateTimer() {
  const mins = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const secs = String(timeLeft % 60).padStart(2, '0');
  document.getElementById("circle-timer").textContent = `${mins}:${secs}`;
}

function shuffle(arr) {
  return arr.sort(() => Math.random() - 0.5);
}

function decodeHTMLEntities(str) {
  const el = document.createElement("textarea");
  el.innerHTML = str;
  return el.value;
}
