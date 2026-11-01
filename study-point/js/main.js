
import { supabase } from "./supabase.js";

/* ========================================
   Study Point!＋ - Main JavaScript
======================================== */


/* ========================================
   HTML要素
======================================== */

const homeSection =
  document.getElementById("home-section");

const contentSection =
  document.getElementById("content-section");

const selectedGradeElement =
  document.getElementById("selected-grade");

const pageTitleElement =
  document.getElementById("page-title");

const pageDescriptionElement =
  document.getElementById("page-description");

const contentList =
  document.getElementById("content-list");

const contentDetailList =
  document.getElementById("content-detail-list");

const emptyMessage =
  document.getElementById("empty-message");

const backButton =
  document.getElementById("back-button");

const gradeButtons =
  document.querySelectorAll(".grade-card");

// クイズ画面
const quizSection =
  document.getElementById("quiz-section");

const quizScreenTitle =
  document.getElementById("quiz-screen-title");

const quizScreenDescription =
  document.getElementById("quiz-screen-description");

const quizQuestionContainer =
  document.getElementById("quiz-question-container");

const quizAnswerResult =
  document.getElementById("quiz-answer-result");

const quizNextButton =
  document.getElementById("quiz-next-button");

const quizRetryButton =
  document.getElementById("quiz-retry-button");

const quizReturnButton =
  document.getElementById("quiz-return-button");


/* ========================================
   状態管理
======================================== */

let currentGrade = null;
let currentSubject = null;
let currentUnit = null;

let currentView = "home";

// クイズの状態
let currentQuizzes = [];
let currentQuizIndex = 0;
let currentQuizScore = 0;
let currentQuizAnswered = false;
let currentQuizSetTitle = "";


/* ========================================
   画面切り替え
======================================== */

function showHome() {

  homeSection.classList.remove("hidden");
  contentSection.classList.add("hidden");

  currentGrade = null;
  currentSubject = null;
  currentUnit = null;

  currentView = "home";

  resetContent();

}


function showContent() {

  homeSection.classList.add("hidden");
  contentSection.classList.remove("hidden");

}


/* ========================================
   表示のリセット
======================================== */

function resetContent() {

  contentList.innerHTML = "";
  contentDetailList.innerHTML = "";

  contentList.classList.remove("hidden");
  contentDetailList.classList.add("hidden");

  quizSection.classList.add("hidden");

  emptyMessage.classList.add("hidden");

  backButton.classList.remove("hidden");

  backButton.textContent = "← 戻る";

}


/* ========================================
   ページ見出し
======================================== */

function updatePageHeading(title, description) {

  selectedGradeElement.textContent =
    currentGrade || "";

  pageTitleElement.textContent = title;

  pageDescriptionElement.textContent =
    description;

}


/* ========================================
   読み込み表示
======================================== */

function showLoading(message = "読み込み中...") {

  resetContent();

  const loading = document.createElement("div");

  loading.className = "content-loading";
  loading.textContent = message;

  contentList.appendChild(loading);

}


/* ========================================
   学年を選択
======================================== */

gradeButtons.forEach((button) => {

  button.addEventListener("click", async () => {

    currentGrade = button.dataset.grade;

    currentSubject = null;
    currentUnit = null;

    await loadSubjects();

  });

});


/* ========================================
   教科を取得
======================================== */

async function loadSubjects() {

  showContent();

  currentView = "subjects";

  updatePageHeading(
    "教科を選択",
    "学習したい教科を選択してください。"
  );

  showLoading("教科を読み込んでいます...");


  const {
    data: subjects,
    error: subjectError
  } = await supabase
    .from("sp_subjects")
    .select("*")
    .eq("grade", currentGrade)
    .order("created_at", {
      ascending: true
    });


  if (subjectError) {

    console.error(subjectError);

    showEmptyMessage(
      "読み込みエラー",
      "教科の読み込みに失敗しました。"
    );

    return;
  }


  if (!subjects || subjects.length === 0) {

    showEmptyMessage(
      "まだまとめがありません",
      "この学年のまとめはまだありません。欲しい教科や単元、追加してほしい学習内容があれば、ぜひ要望を送ってください！"
    );

    return;
  }


  const subjectIds =
    subjects.map((subject) => subject.id);


  const {
    data: units,
    error: unitError
  } = await supabase
    .from("sp_units")
    .select("*")
    .in("subject_id", subjectIds)
    .order("created_at", {
      ascending: true
    });


  if (unitError) {

    console.error(unitError);

    showEmptyMessage(
      "読み込みエラー",
      "単元情報の読み込みに失敗しました。"
    );

    return;
  }


  if (!units || units.length === 0) {

    showEmptyMessage(
      "まだまとめがありません",
      "この学年には公開済みの学習内容がありません。"
    );

    return;
  }


  const unitIds =
    units.map((unit) => unit.id);


  const {
    data: publishedSets,
    error: setError
  } = await supabase
    .from("sp_content_sets")
    .select("unit_id")
    .in("unit_id", unitIds)
    .eq("is_published", true);


  if (setError) {

    console.error(setError);

    showEmptyMessage(
      "読み込みエラー",
      "公開コンテンツの確認に失敗しました。"
    );

    return;
  }


  const publishedUnitIds = new Set(
    (publishedSets || []).map((set) => set.unit_id)
  );


  const publishedSubjectIds = new Set(
    units
      .filter((unit) => publishedUnitIds.has(unit.id))
      .map((unit) => unit.subject_id)
  );


  const visibleSubjects = subjects.filter(
    (subject) => publishedSubjectIds.has(subject.id)
  );


  if (visibleSubjects.length === 0) {

    showEmptyMessage(
      "まだまとめがありません",
      "この学年には公開済みの学習内容がありません。"
    );

    return;
  }


  contentList.innerHTML = "";


  visibleSubjects.forEach((subject) => {

    const card = document.createElement("button");

    card.type = "button";
    card.className = "content-card";


    const title = document.createElement("h3");

    title.textContent = subject.name;


    const description = document.createElement("p");

    description.textContent = "単元を表示する →";


    card.appendChild(title);
    card.appendChild(description);


    card.addEventListener("click", async () => {

      currentSubject = subject;
      currentUnit = null;

      await loadUnits();

    });


    contentList.appendChild(card);

  });

}


/* ========================================
   単元を取得
======================================== */

async function loadUnits() {

  currentView = "units";

  updatePageHeading(
    currentSubject.name,
    "学習したい単元を選択してください。"
  );

  showLoading("単元を読み込んでいます...");


  const {
    data: units,
    error
  } = await supabase
    .from("sp_units")
    .select("*")
    .eq("subject_id", currentSubject.id)
    .order("created_at", {
      ascending: true
    });


  if (error) {

    console.error(error);

    showEmptyMessage(
      "読み込みエラー",
      "単元の読み込みに失敗しました。"
    );

    return;
  }


  if (!units || units.length === 0) {

    showEmptyMessage(
      "まだ単元がありません",
      "この教科にはまだ公開済みの学習内容がありません。"
    );

    return;
  }


  const unitIds =
    units.map((unit) => unit.id);


  const {
    data: publishedSets,
    error: setError
  } = await supabase
    .from("sp_content_sets")
    .select("unit_id")
    .in("unit_id", unitIds)
    .eq("is_published", true);


  if (setError) {

    console.error(setError);

    showEmptyMessage(
      "読み込みエラー",
      "公開コンテンツの確認に失敗しました。"
    );

    return;
  }


  const publishedUnitIds = new Set(
    (publishedSets || []).map((set) => set.unit_id)
  );


  const visibleUnits = units.filter(
    (unit) => publishedUnitIds.has(unit.id)
  );


  if (visibleUnits.length === 0) {

    showEmptyMessage(
      "まだ単元がありません",
      "この教科にはまだ公開済みの学習内容がありません。"
    );

    return;
  }


  contentList.innerHTML = "";


  visibleUnits.forEach((unit) => {

    const card = document.createElement("button");

    card.type = "button";
    card.className = "content-card";


    const title = document.createElement("h3");

    title.textContent = unit.name;


    const description = document.createElement("p");

    description.textContent = "学習コンテンツを見る →";


    card.appendChild(title);
    card.appendChild(description);


    card.addEventListener("click", async () => {

      currentUnit = unit;

      await loadContentSets();

    });


    contentList.appendChild(card);

  });

}


/* ========================================
   解説セットを取得
======================================== */

async function loadContentSets() {

  currentView = "sets";

  updatePageHeading(
    currentUnit.name,
    "解説を読んで、クイズにも挑戦してみよう！"
  );

  showLoading("学習コンテンツを読み込んでいます...");


  const {
    data: sets,
    error
  } = await supabase
    .from("sp_content_sets")
    .select("*")
    .eq("unit_id", currentUnit.id)
    .eq("is_published", true)
    .order("created_at", {
      ascending: true
    });


  if (error) {

    console.error(error);

    showEmptyMessage(
      "読み込みエラー",
      "学習コンテンツの読み込みに失敗しました。"
    );

    return;
  }


  if (!sets || sets.length === 0) {

    showEmptyMessage(
      "まだ学習内容がありません",
      "この単元にはまだ公開済みの学習内容がありません。"
    );

    return;
  }


  const setIds =
    sets.map((set) => set.id);


  const [
    imageResult,
    quizResult
  ] = await Promise.all([

    supabase
      .from("sp_images")
      .select("*")
      .in("content_set_id", setIds)
      .order("created_at", {
        ascending: true
      }),

    supabase
      .from("sp_quizzes")
      .select("*")
      .in("content_set_id", setIds)
      .order("created_at", {
        ascending: true
      })

  ]);


  if (imageResult.error) {

    console.error(imageResult.error);

    showEmptyMessage(
      "読み込みエラー",
      "画像の読み込みに失敗しました。"
    );

    return;
  }


  if (quizResult.error) {

    console.error(quizResult.error);

    showEmptyMessage(
      "読み込みエラー",
      "クイズの読み込みに失敗しました。"
    );

    return;
  }


  const images = imageResult.data || [];
  const quizzes = quizResult.data || [];


  const imagesBySet = new Map();
  const quizzesBySet = new Map();


  images.forEach((image) => {

    if (!imagesBySet.has(image.content_set_id)) {
      imagesBySet.set(image.content_set_id, []);
    }

    imagesBySet.get(image.content_set_id).push(image);

  });


  quizzes.forEach((quiz) => {

    if (!quizzesBySet.has(quiz.content_set_id)) {
      quizzesBySet.set(quiz.content_set_id, []);
    }

    quizzesBySet.get(quiz.content_set_id).push(quiz);

  });


  sets.forEach((set, index) => {

    const setImages =
      imagesBySet.get(set.id) || [];

    const setQuizzes =
      quizzesBySet.get(set.id) || [];


    const card = createContentSetCard(
      set,
      setImages,
      setQuizzes,
      index
    );


    contentDetailList.appendChild(card);

  });


  contentList.classList.add("hidden");
  contentDetailList.classList.remove("hidden");

  quizSection.classList.add("hidden");

}


/* ========================================
   解説セットカードを作成
======================================== */

function createContentSetCard(
  set,
  images,
  quizzes,
  setIndex
) {

  const card = document.createElement("article");

  card.className = "study-set-card";


  const heading = document.createElement("div");

  heading.className = "study-set-heading";


  const number = document.createElement("span");

  number.className = "study-set-number";

  number.textContent =
    `STUDY ${String(setIndex + 1).padStart(2, "0")}`;


  const title = document.createElement("h2");

  title.textContent = set.title;


  heading.appendChild(number);
  heading.appendChild(title);

  card.appendChild(heading);


  if (set.description) {

    const description = document.createElement("p");

    description.className = "study-set-description";

    description.textContent = set.description;

    card.appendChild(description);

  }


  if (images.length > 0) {

    const imageArea = createImageViewer(
      images,
      set.title
    );

    card.appendChild(imageArea);

  }


  // クイズがある場合のみ挑戦ボタンを表示
  if (quizzes.length > 0) {

    const quizButton = document.createElement("button");

    quizButton.type = "button";

    quizButton.className = "primary-button study-quiz-start-button";

    quizButton.textContent = "クイズに挑戦する →";


    quizButton.addEventListener("click", () => {

      startQuiz(quizzes, set.title);

    });


    card.appendChild(quizButton);

  }


  if (images.length === 0 && quizzes.length === 0) {

    const empty = document.createElement("p");

    empty.className = "study-set-empty";

    empty.textContent =
      "この解説セットには、まだ画像やクイズがありません。";

    card.appendChild(empty);

  }


  return card;

}


/* ========================================
   画像表示・カルーセル
======================================== */

function createImageViewer(images, setTitle) {

  const viewer = document.createElement("div");

  viewer.className = "study-image-viewer";


  const photo = document.createElement("img");

  photo.className = "study-image";

  photo.alt = setTitle;


  const imageUrl = (image) => {

    const {
      data
    } = supabase.storage
      .from("study-point-images")
      .getPublicUrl(image.image_path);

    return data.publicUrl;

  };


  let currentIndex = 0;

  let counter = null;
  let previousButton = null;
  let nextButton = null;


  function updateImage() {

    const currentImage = images[currentIndex];

    photo.src = imageUrl(currentImage);

    photo.alt =
      `${setTitle}（画像 ${currentIndex + 1}）`;


    if (counter) {
      counter.textContent =
        `${currentIndex + 1} / ${images.length}`;
    }


    if (previousButton) {
      previousButton.disabled =
        currentIndex === 0;
    }


    if (nextButton) {
      nextButton.disabled =
        currentIndex === images.length - 1;
    }

  }


  viewer.appendChild(photo);


  if (images.length > 1) {

    const controls = document.createElement("div");

    controls.className = "study-image-controls";


    previousButton = document.createElement("button");

    previousButton.type = "button";
    previousButton.className = "study-image-button";

    previousButton.textContent = "← 前へ";


    counter = document.createElement("span");

    counter.className = "study-image-counter";


    nextButton = document.createElement("button");

    nextButton.type = "button";
    nextButton.className = "study-image-button";

    nextButton.textContent = "次へ →";


    previousButton.addEventListener("click", () => {

      if (currentIndex > 0) {

        currentIndex--;

        updateImage();

      }

    });


    nextButton.addEventListener("click", () => {

      if (currentIndex < images.length - 1) {

        currentIndex++;

        updateImage();

      }

    });


    controls.appendChild(previousButton);
    controls.appendChild(counter);
    controls.appendChild(nextButton);

    viewer.appendChild(controls);


    updateImage();

  } else {

    photo.src = imageUrl(images[0]);

    photo.alt = setTitle;

  }


  return viewer;

}


/* ========================================
   クイズを開始
======================================== */

function startQuiz(quizzes, setTitle) {

  if (!quizzes || quizzes.length === 0) {
    return;
  }


  currentQuizzes = quizzes;

  currentQuizIndex = 0;

  currentQuizScore = 0;

  currentQuizAnswered = false;

  currentQuizSetTitle = setTitle;


  currentView = "quiz";


  // 解説画面を隠してクイズ画面を表示
  contentList.classList.add("hidden");

  contentDetailList.classList.add("hidden");

  emptyMessage.classList.add("hidden");

  quizSection.classList.remove("hidden");


  // クイズ中は通常の戻るボタンを隠す
  backButton.classList.add("hidden");


  updatePageHeading(
    "クイズに挑戦",
    `${setTitle}の確認クイズです！`
  );


  quizScreenTitle.textContent = "確認クイズ";

  quizScreenDescription.textContent =
    "学んだ内容を確認してみよう！";


  showQuizQuestion();

}


/* ========================================
   クイズの問題を表示
======================================== */

function showQuizQuestion() {

  const quiz =
    currentQuizzes[currentQuizIndex];


  if (!quiz) {
    showQuizResult();
    return;
  }


  currentQuizAnswered = false;


  quizQuestionContainer.innerHTML = "";

  quizAnswerResult.innerHTML = "";


  quizAnswerResult.classList.add("hidden");

  quizNextButton.classList.add("hidden");

  quizRetryButton.classList.add("hidden");


  const questionCard = document.createElement("div");

  questionCard.className = "study-quiz-card";


  // 問題番号
  const progress = document.createElement("p");

  progress.className = "study-quiz-number";

  progress.textContent =
    `QUESTION ${currentQuizIndex + 1} / ${currentQuizzes.length}`;


  // 進捗表示
  const progressBar = document.createElement("div");

  progressBar.className = "quiz-progress";


  const progressFill = document.createElement("div");

  progressFill.className = "quiz-progress-fill";

  progressFill.style.width =
    `${((currentQuizIndex + 1) / currentQuizzes.length) * 100}%`;


  progressBar.appendChild(progressFill);


  // 問題文
  const question = document.createElement("h3");

  question.className = "study-quiz-question";

  question.textContent = quiz.question;


  questionCard.appendChild(progress);
  questionCard.appendChild(progressBar);
  questionCard.appendChild(question);


  // 選択肢
  const choiceList = document.createElement("div");

  choiceList.className = "study-quiz-choices";


  const choices = [
    {
      key: "A",
      text: quiz.choice_a
    },
    {
      key: "B",
      text: quiz.choice_b
    },
    {
      key: "C",
      text: quiz.choice_c
    },
    {
      key: "D",
      text: quiz.choice_d
    }
  ];


  choices.forEach((choice) => {

    const button = document.createElement("button");

    button.type = "button";

    button.className = "study-quiz-choice";

    button.dataset.answer = choice.key;


    const label = document.createElement("span");

    label.className = "study-quiz-choice-label";

    label.textContent = choice.key;


    const text = document.createElement("span");

    text.className = "study-quiz-choice-text";

    text.textContent = choice.text;


    button.appendChild(label);
    button.appendChild(text);


    button.addEventListener("click", () => {

      answerQuiz(choice.key, button, choiceList);

    });


    choiceList.appendChild(button);

  });


  questionCard.appendChild(choiceList);

  quizQuestionContainer.appendChild(questionCard);


  // 次の問題へ進むボタンの表示
  if (currentQuizIndex === currentQuizzes.length - 1) {

    quizNextButton.textContent = "結果を見る →";

  } else {

    quizNextButton.textContent = "次の問題へ →";

  }

}


/* ========================================
   クイズに回答
======================================== */

function answerQuiz(selectedAnswer, selectedButton, choiceList) {

  if (currentQuizAnswered) {
    return;
  }


  currentQuizAnswered = true;


  const quiz =
    currentQuizzes[currentQuizIndex];


  const correctAnswer =
    String(quiz.correct_answer).toUpperCase();


  const isCorrect =
    selectedAnswer === correctAnswer;


  if (isCorrect) {
    currentQuizScore++;
  }


  // 選択肢を操作できないようにする
  const allButtons =
    choiceList.querySelectorAll("button");


  allButtons.forEach((button) => {

    button.disabled = true;


    if (button.dataset.answer === correctAnswer) {

      button.classList.add("is-correct");

    }

  });


  if (!isCorrect) {

    selectedButton.classList.add("is-incorrect");

  }


  // 回答結果を表示
  quizAnswerResult.innerHTML = "";

  quizAnswerResult.classList.remove("hidden");


  const resultTitle = document.createElement("h3");

  resultTitle.className = "study-quiz-result-title";


  const resultMessage = document.createElement("p");

  resultMessage.className = "study-quiz-result-message";


  const explanation = document.createElement("p");

  explanation.className = "study-quiz-explanation";


  if (isCorrect) {

    quizAnswerResult.classList.add("is-correct");

    resultTitle.textContent = "🎉 正解！";

    resultMessage.textContent =
      "よくできました！";

  } else {

    quizAnswerResult.classList.add("is-incorrect");

    resultTitle.textContent = "もう少し！";

    resultMessage.textContent =
      `正解は ${correctAnswer} です。`;

  }


  explanation.textContent =
    quiz.explanation || "この問題には解説がありません。";


  quizAnswerResult.appendChild(resultTitle);

  quizAnswerResult.appendChild(resultMessage);

  quizAnswerResult.appendChild(explanation);


  // 次へ進むボタンを表示
  quizNextButton.classList.remove("hidden");

}


/* ========================================
   次の問題へ
======================================== */

quizNextButton.addEventListener("click", () => {

  if (!currentQuizAnswered) {
    return;
  }


  if (currentQuizIndex < currentQuizzes.length - 1) {

    currentQuizIndex++;

    showQuizQuestion();

  } else {

    showQuizResult();

  }

});


/* ========================================
   クイズ結果を表示
======================================== */

function showQuizResult() {

  currentView = "quiz-result";


  quizQuestionContainer.innerHTML = "";

  quizAnswerResult.innerHTML = "";

  quizAnswerResult.classList.add("hidden");

  quizNextButton.classList.add("hidden");


  quizScreenTitle.textContent = "クイズ結果";

  quizScreenDescription.textContent =
    "最後までお疲れさまでした！";


  const resultCard = document.createElement("div");

  resultCard.className = "quiz-final-result";


  const resultLabel = document.createElement("p");

  resultLabel.className = "quiz-final-label";

  resultLabel.textContent = "YOUR RESULT";


  const resultScore = document.createElement("p");

  resultScore.className = "quiz-final-score";

  resultScore.textContent =
    `${currentQuizScore} / ${currentQuizzes.length}`;


  const resultRate = document.createElement("p");

  resultRate.className = "quiz-final-rate";

  const percentage = Math.round(
    (currentQuizScore / currentQuizzes.length) * 100
  );

  resultRate.textContent =
    `正答率 ${percentage}%`;


  const resultMessage = document.createElement("p");

  resultMessage.className = "quiz-final-message";


  if (currentQuizScore === currentQuizzes.length) {

    resultMessage.textContent =
      "全問正解！すばらしい！";

  } else if (currentQuizScore === 0) {

    resultMessage.textContent =
      "もう一度解説を確認して挑戦してみよう！";

  } else {

    resultMessage.textContent =
      "よく頑張りました！間違えた問題も復習してみよう！";

  }


  resultCard.appendChild(resultLabel);

  resultCard.appendChild(resultScore);

  resultCard.appendChild(resultRate);

  resultCard.appendChild(resultMessage);


  quizQuestionContainer.appendChild(resultCard);


  quizRetryButton.classList.remove("hidden");

}


/* ========================================
   もう一度挑戦
======================================== */

quizRetryButton.addEventListener("click", () => {

  currentQuizIndex = 0;

  currentQuizScore = 0;

  currentQuizAnswered = false;


  quizScreenTitle.textContent = "確認クイズ";

  quizScreenDescription.textContent =
    "もう一度挑戦してみよう！";


  quizRetryButton.classList.add("hidden");


  showQuizQuestion();

});


/* ========================================
   解説画面に戻る
======================================== */

function returnToExplanation() {

  currentView = "sets";


  quizSection.classList.add("hidden");

  contentList.classList.add("hidden");

  contentDetailList.classList.remove("hidden");


  backButton.classList.remove("hidden");


  updatePageHeading(
    currentUnit.name,
    "解説を読んで、クイズにも挑戦してみよう！"
  );

}


quizReturnButton.addEventListener("click", () => {

  returnToExplanation();

});


/* ========================================
   空のメッセージを表示
======================================== */

function showEmptyMessage(title, message) {

  contentList.innerHTML = "";

  contentDetailList.innerHTML = "";

  contentList.classList.add("hidden");

  contentDetailList.classList.add("hidden");

  quizSection.classList.add("hidden");

  backButton.classList.remove("hidden");

  emptyMessage.classList.remove("hidden");


  emptyMessage.innerHTML = `

    <div class="empty-icon">📚</div>

    <h2></h2>

    <p></p>

    <a
      href="./request.html"
      class="primary-button"
      id="empty-request-link"
    >
      要望を送る →
    </a>

  `;


  emptyMessage.querySelector("h2").textContent =
    title;

  emptyMessage.querySelector("p").textContent =
    message;


  const requestLink =
    emptyMessage.querySelector("#empty-request-link");


  if (currentGrade) {

    requestLink.href =
      `./request.html?grade=${encodeURIComponent(currentGrade)}`;

  } else {

    requestLink.href = "./request.html";

  }

}


/* ========================================
   戻るボタン
======================================== */

backButton.addEventListener("click", async () => {

  if (currentView === "sets") {

    currentUnit = null;

    await loadUnits();

    return;

  }


  if (currentView === "units") {

    currentSubject = null;

    await loadSubjects();

    return;

  }


  if (currentView === "subjects") {

    showHome();

    return;

  }


  showHome();

});


/* ========================================
   初期表示
======================================== */

showHome();
