
import { supabase } from "./supabase.js";

/* ========================================
   Study Point!＋ - Admin JavaScript
======================================== */


/* ========================================
   DOM要素
======================================== */

// ログイン関連
const loginSection = document.getElementById("login-section");
const adminDashboard = document.getElementById("admin-dashboard");

const loginForm = document.getElementById("admin-login-form");
const emailInput = document.getElementById("admin-email");
const passwordInput = document.getElementById("admin-password");

const loginButton = document.getElementById("login-button");
const loginMessage = document.getElementById("login-message");

const logoutButton = document.getElementById("logout-button");
const adminUser = document.getElementById("admin-user");

// 要望管理関連
const requestsList = document.getElementById("requests-list");
const requestsCount = document.getElementById("requests-count");
const requestsMessage = document.getElementById("requests-message");
const unreadNotice = document.getElementById("unread-notice");

const refreshRequestsButton = document.getElementById(
  "refresh-requests-button"
);

// コンテンツ管理関連
const gradeButtons = document.querySelectorAll(".admin-grade-button");

const selectedGradeElement = document.getElementById(
  "admin-selected-grade"
);

const subjectForm = document.getElementById("admin-subject-form");
const subjectNameInput = document.getElementById("admin-subject-name");
const addSubjectButton = document.getElementById("add-subject-button");
const subjectMessage = document.getElementById("admin-subject-message");
const subjectList = document.getElementById("admin-subject-list");

const selectedSubjectElement = document.getElementById(
  "admin-selected-subject"
);

const unitForm = document.getElementById("admin-unit-form");
const unitNameInput = document.getElementById("admin-unit-name");
const addUnitButton = document.getElementById("add-unit-button");
const unitMessage = document.getElementById("admin-unit-message");
const unitList = document.getElementById("admin-unit-list");

// 解説セット管理関連
const selectedUnitElement = document.getElementById(
  "admin-selected-unit"
);

const setEditor = document.getElementById("admin-set-editor");
const setForm = document.getElementById("admin-set-form");

const setTitleInput = document.getElementById("admin-set-title");
const setDescriptionInput = document.getElementById(
  "admin-set-description"
);

const setDisplayTypeSelect = document.getElementById(
  "admin-set-display-type"
);

const setPublishedCheckbox = document.getElementById(
  "admin-set-published"
);

const addSetButton = document.getElementById("add-set-button");
const setMessage = document.getElementById("admin-set-message");

const setListMessage = document.getElementById(
  "admin-set-list-message"
);

const setList = document.getElementById("admin-set-list");

// 画像管理関連
const imageEditor = document.getElementById("admin-image-editor");
const selectedSetElement = document.getElementById("admin-selected-set");

const imageForm = document.getElementById("admin-image-form");
const imageFilesInput = document.getElementById("admin-image-files");
const imagePreview = document.getElementById("admin-image-preview");

const uploadImagesButton = document.getElementById(
  "upload-images-button"
);

const imageMessage = document.getElementById("admin-image-message");
const imageListMessage = document.getElementById(
  "admin-image-list-message"
);
const imageList = document.getElementById("admin-image-list");


// 選択状態
let selectedGrade = null;
let selectedSubject = null;
let selectedUnit = null;
let selectedContentSet = null;


/* ========================================
   共通処理
======================================== */

// HTML要素を作成
function createElement(tag, className, text) {
  const element = document.createElement(tag);

  if (className) {
    element.className = className;
  }

  if (text !== undefined) {
    element.textContent = text;
  }

  return element;
}

// メッセージ表示
function showMessage(element, message, isError = false) {
  element.textContent = message;

  element.classList.toggle("is-error", isError);
  element.classList.toggle("is-success", !isError);
}

// 日付を表示用に変換
function formatDate(dateString) {
  const date = new Date(dateString);

  return date.toLocaleString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}


/* ========================================
   クイズ管理：画面の作成
======================================== */

// HTMLを変更せず、画像管理欄の下にクイズ管理欄を追加
const quizSection = createElement(
  "section",
  "admin-content-card admin-quiz-section"
);

const quizHeading = createElement(
  "div",
  "admin-content-card-heading"
);

const quizHeadingInner = createElement("div");

const quizStep = createElement(
  "span",
  "admin-content-step",
  "STEP 06"
);

const quizTitle = createElement(
  "h3",
  "",
  "クイズ管理"
);

quizHeadingInner.append(quizStep, quizTitle);
quizHeading.appendChild(quizHeadingInner);

const quizDescription = createElement(
  "p",
  "admin-content-card-description",
  "選択した解説セットにクイズを登録できます。画像がなくてもクイズだけで利用できます。"
);

const selectedQuizSetElement = createElement(
  "div",
  "admin-selected-info",
  "解説セットを選択してください。"
);

// クイズ登録フォーム
const quizForm = createElement(
  "form",
  "admin-add-form"
);

const quizFormHeading = createElement(
  "h4",
  "",
  "クイズを登録"
);

const quizQuestionGroup = createElement("div", "form-group");

const quizQuestionLabel = createElement(
  "label",
  "",
  "問題文"
);

const quizQuestionInput = createElement("textarea");
quizQuestionInput.id = "admin-quiz-question";
quizQuestionInput.rows = 3;
quizQuestionInput.maxLength = 1000;
quizQuestionInput.placeholder = "問題文を入力してください。";
quizQuestionInput.required = true;

quizQuestionLabel.htmlFor = quizQuestionInput.id;

quizQuestionGroup.append(
  quizQuestionLabel,
  quizQuestionInput
);

// 選択肢A〜D
const quizChoiceInputs = {};

const quizChoiceGroups = [];

["a", "b", "c", "d"].forEach((choice, index) => {
  const letter = choice.toUpperCase();

  const group = createElement("div", "form-group");

  const label = createElement(
    "label",
    "",
    `選択肢${letter}`
  );

  const input = createElement("input");

  input.type = "text";
  input.id = `admin-quiz-choice-${choice}`;
  input.maxLength = 300;
  input.placeholder = `選択肢${letter}を入力`;
  input.required = true;

  label.htmlFor = input.id;

  quizChoiceInputs[choice] = input;

  group.append(label, input);
  quizChoiceGroups.push(group);
});

// 正解選択
const quizAnswerGroup = createElement("div", "form-group");

const quizAnswerLabel = createElement(
  "label",
  "",
  "正解"
);

const quizAnswerSelect = createElement("select");
quizAnswerSelect.id = "admin-quiz-correct-answer";
quizAnswerSelect.required = true;

[
  ["A", "A"],
  ["B", "B"],
  ["C", "C"],
  ["D", "D"]
].forEach(([value, label]) => {
  const option = createElement(
    "option",
    "",
    `選択肢${label}`
  );

  // データベースのCHECK制約に合わせて大文字で保存
  option.value = value;

  quizAnswerSelect.appendChild(option);
});

quizAnswerLabel.htmlFor = quizAnswerSelect.id;

quizAnswerGroup.append(
  quizAnswerLabel,
  quizAnswerSelect
);

// 解説
const quizExplanationGroup = createElement(
  "div",
  "form-group"
);

const quizExplanationLabel = createElement(
  "label",
  "",
  "解説（任意）"
);

const quizExplanationInput = createElement("textarea");
quizExplanationInput.id = "admin-quiz-explanation";
quizExplanationInput.rows = 3;
quizExplanationInput.maxLength = 2000;
quizExplanationInput.placeholder =
  "正解の理由などを入力してください。";

quizExplanationLabel.htmlFor = quizExplanationInput.id;

quizExplanationGroup.append(
  quizExplanationLabel,
  quizExplanationInput
);

// 登録・更新ボタン
const quizSubmitButton = createElement(
  "button",
  "primary-button",
  "クイズを登録"
);

quizSubmitButton.type = "submit";

const quizCancelButton = createElement(
  "button",
  "admin-item-select-button hidden",
  "編集をキャンセル"
);

quizCancelButton.type = "button";

const quizFormMessage = createElement(
  "p",
  "admin-content-message"
);

quizFormMessage.setAttribute("aria-live", "polite");

quizForm.append(
  quizFormHeading,
  quizQuestionGroup,
  ...quizChoiceGroups,
  quizAnswerGroup,
  quizExplanationGroup,
  quizSubmitButton,
  quizCancelButton,
  quizFormMessage
);

// 登録済みクイズ一覧
const quizListHeading = createElement(
  "div",
  "admin-set-list-heading"
);

const quizListTitle = createElement(
  "h4",
  "",
  "登録済みのクイズ"
);

quizListHeading.appendChild(quizListTitle);

const quizListMessage = createElement(
  "div",
  "admin-content-message"
);

const quizList = createElement(
  "div",
  "admin-item-list"
);

// クイズ管理欄を画像管理欄の後ろに追加
quizSection.append(
  quizHeading,
  quizDescription,
  selectedQuizSetElement,
  quizForm,
  quizListHeading,
  quizListMessage,
  quizList
);

imageEditor.insertAdjacentElement("afterend", quizSection);

// 編集中のクイズID
let editingQuizId = null;


/* ========================================
   画面切り替え
======================================== */

function showLogin() {
  loginSection.classList.remove("hidden");
  adminDashboard.classList.add("hidden");
}

function showDashboard(user) {
  loginSection.classList.add("hidden");
  adminDashboard.classList.remove("hidden");

  adminUser.textContent = `ログイン中：${user.email}`;
}


/* ========================================
   管理者確認
======================================== */

async function checkAdmin() {
  const { data, error } = await supabase.rpc("sp_is_admin");

  if (error) {
    console.error("管理者確認エラー:", error);

    return {
      isAdmin: false,
      error: true
    };
  }

  return {
    isAdmin: data === true,
    error: false
  };
}


/* ========================================
   ログイン後の処理
======================================== */

async function handleAuthenticatedUser(user) {
  const result = await checkAdmin();

  if (result.error) {
    loginMessage.textContent =
      "管理者権限の確認に失敗しました。設定を確認してください。";

    return;
  }

  if (!result.isAdmin) {
    await supabase.auth.signOut();

    showLogin();

    loginMessage.textContent =
      "このアカウントには管理者権限がありません。";

    return;
  }

  showDashboard(user);

  resetContentManagement();

  await loadRequests(true);
}


/* ========================================
   ログイン
======================================== */

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  loginButton.disabled = true;
  loginButton.textContent = "ログイン中...";

  loginMessage.textContent = "";

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      throw error;
    }

    await handleAuthenticatedUser(data.user);

  } catch (error) {
    console.error("ログインエラー:", error);

    loginMessage.textContent =
      "ログインできませんでした。メールアドレスとパスワードを確認してください。";

  } finally {
    loginButton.disabled = false;
    loginButton.textContent = "ログイン";
  }
});


/* ========================================
   ログアウト
======================================== */

logoutButton.addEventListener("click", async () => {
  logoutButton.disabled = true;
  logoutButton.textContent = "ログアウト中...";

  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw error;
    }

    showLogin();

    loginForm.reset();
    loginMessage.textContent = "";

    resetContentManagement();

  } catch (error) {
    console.error("ログアウトエラー:", error);

    alert("ログアウトに失敗しました。もう一度お試しください。");

  } finally {
    logoutButton.disabled = false;
    logoutButton.textContent = "ログアウト";
  }
});


/* ========================================
   コンテンツ管理：初期化
======================================== */

function resetContentManagement() {
  selectedGrade = null;
  selectedSubject = null;
  selectedUnit = null;
  selectedContentSet = null;

  gradeButtons.forEach(button => {
    button.classList.remove("is-selected");
  });

  selectedGradeElement.textContent =
    "先に学年を選択してください。";

  selectedSubjectElement.textContent =
    "先に教科を選択してください。";

  selectedUnitElement.textContent =
    "先に単元を選択してください。";

  subjectNameInput.value = "";
  subjectNameInput.disabled = true;
  addSubjectButton.disabled = true;

  unitNameInput.value = "";
  unitNameInput.disabled = true;
  addUnitButton.disabled = true;

  subjectList.replaceChildren();
  unitList.replaceChildren();
  setList.replaceChildren();

  subjectMessage.textContent = "";
  unitMessage.textContent = "";
  setMessage.textContent = "";
  setListMessage.textContent = "";

  setForm.reset();
  setEditor.classList.add("hidden");

  resetSelectedSet();
}


/* ========================================
   コンテンツ管理：学年選択
======================================== */

gradeButtons.forEach(button => {
  button.addEventListener("click", async () => {
    const grade = button.dataset.grade;

    selectedGrade = grade;
    selectedSubject = null;
    selectedUnit = null;

    gradeButtons.forEach(item => {
      item.classList.remove("is-selected");
    });

    button.classList.add("is-selected");

    selectedGradeElement.textContent =
      `選択中の学年：${grade}`;

    subjectNameInput.disabled = false;
    addSubjectButton.disabled = false;

    selectedSubjectElement.textContent =
      "先に教科を選択してください。";

    unitNameInput.value = "";
    unitNameInput.disabled = true;
    addUnitButton.disabled = true;

    unitList.replaceChildren();
    unitMessage.textContent = "";

    resetSelectedUnit();

    subjectMessage.textContent = "";

    await loadSubjects();
  });
});


/* ========================================
   コンテンツ管理：教科一覧
======================================== */

async function loadSubjects() {
  if (!selectedGrade) {
    return;
  }

  subjectList.replaceChildren();

  showMessage(subjectMessage, "教科を読み込んでいます...");

  try {
    const { data, error } = await supabase
      .from("sp_subjects")
      .select("*")
      .eq("grade", selectedGrade)
      .order("created_at", { ascending: true });

    if (error) {
      throw error;
    }

    const subjects = data || [];

    subjectMessage.textContent = "";

    if (subjects.length === 0) {
      showMessage(
        subjectMessage,
        "この学年にはまだ教科が登録されていません。"
      );

      return;
    }

    subjects.forEach(subject => {
      const item = createElement("div", "admin-item");

      const name = createElement(
        "span",
        "admin-item-name",
        subject.name
      );

      const selectButton = createElement(
        "button",
        "admin-item-select-button",
        "単元を管理"
      );

      selectButton.type = "button";

      selectButton.addEventListener("click", async () => {
        await selectSubject(subject, item);
      });

      item.append(name, selectButton);

      subjectList.appendChild(item);
    });

  } catch (error) {
    console.error("教科一覧の取得に失敗しました:", error);

    showMessage(
      subjectMessage,
      "教科を読み込めませんでした。設定を確認してください。",
      true
    );
  }
}


/* ========================================
   コンテンツ管理：教科追加
======================================== */

subjectForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!selectedGrade) {
    return;
  }

  const subjectName = subjectNameInput.value.trim();

  if (!subjectName) {
    showMessage(subjectMessage, "教科名を入力してください。", true);
    return;
  }

  addSubjectButton.disabled = true;
  addSubjectButton.textContent = "追加中...";

  try {
    const { error } = await supabase
      .from("sp_subjects")
      .insert({
        grade: selectedGrade,
        name: subjectName
      });

    if (error) {
      throw error;
    }

    subjectNameInput.value = "";

    showMessage(
      subjectMessage,
      `「${subjectName}」を追加しました！`
    );

    await loadSubjects();

  } catch (error) {
    console.error("教科の追加に失敗しました:", error);

    showMessage(
      subjectMessage,
      "教科を追加できませんでした。時間をおいて再度お試しください。",
      true
    );

  } finally {
    addSubjectButton.disabled = false;
    addSubjectButton.textContent = "教科を追加";
  }
});


/* ========================================
   コンテンツ管理：教科選択
======================================== */

async function selectSubject(subject, selectedItem) {
  selectedSubject = subject;

  subjectList.querySelectorAll(".admin-item").forEach(item => {
    item.classList.remove("is-selected");
  });

  selectedItem.classList.add("is-selected");

  selectedSubjectElement.textContent =
    `選択中の教科：${subject.name}`;

  unitNameInput.disabled = false;
  addUnitButton.disabled = false;

  unitMessage.textContent = "";

  resetSelectedUnit();

  await loadUnits();
}


/* ========================================
   コンテンツ管理：単元一覧
======================================== */

async function loadUnits() {
  if (!selectedSubject) {
    return;
  }

  unitList.replaceChildren();

  showMessage(unitMessage, "単元を読み込んでいます...");

  try {
    const { data, error } = await supabase
      .from("sp_units")
      .select("*")
      .eq("subject_id", selectedSubject.id)
      .order("created_at", { ascending: true });

    if (error) {
      throw error;
    }

    const units = data || [];

    unitMessage.textContent = "";

    if (units.length === 0) {
      showMessage(
        unitMessage,
        "この教科にはまだ単元が登録されていません。"
      );

      return;
    }

    units.forEach(unit => {
      const item = createElement("div", "admin-item");

      const name = createElement(
        "span",
        "admin-item-name",
        unit.name
      );

      const selectButton = createElement(
        "button",
        "admin-item-select-button",
        "解説セットを管理"
      );

      selectButton.type = "button";

      selectButton.addEventListener("click", async () => {
        await selectUnit(unit, item);
      });

      item.append(name, selectButton);

      unitList.appendChild(item);
    });

  } catch (error) {
    console.error("単元一覧の取得に失敗しました:", error);

    showMessage(
      unitMessage,
      "単元を読み込めませんでした。設定を確認してください。",
      true
    );
  }
}


/* ========================================
   コンテンツ管理：単元追加
======================================== */

unitForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!selectedSubject) {
    return;
  }

  const unitName = unitNameInput.value.trim();

  if (!unitName) {
    showMessage(unitMessage, "単元名を入力してください。", true);
    return;
  }

  addUnitButton.disabled = true;
  addUnitButton.textContent = "追加中...";

  try {
    const { error } = await supabase
      .from("sp_units")
      .insert({
        subject_id: selectedSubject.id,
        name: unitName
      });

    if (error) {
      throw error;
    }

    unitNameInput.value = "";

    showMessage(
      unitMessage,
      `「${unitName}」を追加しました！`
    );

    await loadUnits();

  } catch (error) {
    console.error("単元の追加に失敗しました:", error);

    showMessage(
      unitMessage,
      "単元を追加できませんでした。時間をおいて再度お試しください。",
      true
    );

  } finally {
    addUnitButton.disabled = false;
    addUnitButton.textContent = "単元を追加";
  }
});


/* ========================================
   解説セット管理：単元選択のリセット
======================================== */

function resetSelectedUnit() {
  selectedUnit = null;

  selectedUnitElement.textContent =
    "先に単元を選択してください。";

  setEditor.classList.add("hidden");

  setForm.reset();

  setMessage.textContent = "";
  setListMessage.textContent = "";

  setList.replaceChildren();

  resetSelectedSet();
}


/* ========================================
   解説セット管理：単元選択
======================================== */

async function selectUnit(unit, selectedItem) {
  selectedUnit = unit;

  unitList.querySelectorAll(".admin-item").forEach(item => {
    item.classList.remove("is-selected");
  });

  selectedItem.classList.add("is-selected");

  selectedUnitElement.textContent =
    `選択中の単元：${unit.name}`;

  setEditor.classList.remove("hidden");

  setForm.reset();

  setMessage.textContent = "";

  resetSelectedSet();

  await loadContentSets();
}


/* ========================================
   解説セット管理：一覧取得
======================================== */

async function loadContentSets() {
  if (!selectedUnit) {
    return;
  }

  setList.replaceChildren();

  showMessage(
    setListMessage,
    "解説セットを読み込んでいます..."
  );

  try {
    const { data, error } = await supabase
      .from("sp_content_sets")
      .select("*")
      .eq("unit_id", selectedUnit.id)
      .order("created_at", { ascending: true });

    if (error) {
      throw error;
    }

    const contentSets = data || [];

    setListMessage.textContent = "";

    if (contentSets.length === 0) {
      showMessage(
        setListMessage,
        "この単元にはまだ解説セットが登録されていません。"
      );

      return;
    }

    contentSets.forEach(contentSet => {
      const card = createElement("div", "admin-set-item");

      const top = createElement("div", "admin-set-item-top");

      const title = createElement(
        "h4",
        "admin-set-item-title",
        contentSet.title
      );

      const status = createElement(
        "span",
        contentSet.is_published
          ? "admin-set-status is-published"
          : "admin-set-status is-draft",
        contentSet.is_published ? "公開中" : "下書き"
      );

      top.append(title, status);

      const description = createElement(
        "p",
        "admin-set-item-description",
        contentSet.description || "説明は登録されていません。"
      );

      const displayType = createElement(
        "p",
        "admin-set-item-information",
        contentSet.display_type === "carousel"
          ? "表示形式：複数画像（カルーセル）"
          : "表示形式：1枚ずつ表示"
      );

      const createdAt = createElement(
        "p",
        "admin-set-item-information",
        `作成日時：${formatDate(contentSet.created_at)}`
      );

      const actionArea = createElement(
        "div",
        "admin-set-item-actions"
      );

      // 画像・クイズ管理ボタン
      const imageButton = createElement(
        "button",
        "admin-item-select-button",
        "画像・クイズを管理"
      );

      imageButton.type = "button";

      imageButton.addEventListener("click", async () => {
        await selectContentSet(contentSet, card);
      });

      // 公開・非公開切り替えボタン
      const toggleButton = createElement(
        "button",
        "admin-toggle-publish-button",
        contentSet.is_published
          ? "非公開にする"
          : "公開する"
      );

      toggleButton.type = "button";

      toggleButton.addEventListener("click", async () => {
        await togglePublishStatus(
          contentSet,
          toggleButton
        );
      });

      actionArea.append(imageButton, toggleButton);

      card.append(
        top,
        description,
        displayType,
        createdAt,
        actionArea
      );

      setList.appendChild(card);
    });

  } catch (error) {
    console.error("解説セット一覧の取得に失敗しました:", error);

    showMessage(
      setListMessage,
      "解説セットを読み込めませんでした。設定を確認してください。",
      true
    );
  }
}


/* ========================================
   解説セット管理：新規作成
======================================== */

setForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!selectedUnit) {
    showMessage(
      setMessage,
      "先に単元を選択してください。",
      true
    );

    return;
  }

  const title = setTitleInput.value.trim();
  const description = setDescriptionInput.value.trim();
  const displayType = setDisplayTypeSelect.value;
  const isPublished = setPublishedCheckbox.checked;

  if (!title) {
    showMessage(
      setMessage,
      "解説セットのタイトルを入力してください。",
      true
    );

    return;
  }

  addSetButton.disabled = true;
  addSetButton.textContent = "作成中...";

  try {
    const { error } = await supabase
      .from("sp_content_sets")
      .insert({
        unit_id: selectedUnit.id,
        title,
        description: description || null,
        display_type: displayType,
        is_published: isPublished
      });

    if (error) {
      throw error;
    }

    setForm.reset();

    showMessage(
      setMessage,
      `「${title}」を作成しました！`
    );

    await loadContentSets();

  } catch (error) {
    console.error("解説セットの作成に失敗しました:", error);

    showMessage(
      setMessage,
      "解説セットを作成できませんでした。設定を確認してください。",
      true
    );

  } finally {
    addSetButton.disabled = false;
    addSetButton.textContent = "解説セットを作成";
  }
});


/* ========================================
   解説セット管理：公開・非公開切り替え
======================================== */

async function togglePublishStatus(contentSet, button) {
  const nextStatus = !contentSet.is_published;

  const confirmationMessage = nextStatus
    ? `「${contentSet.title}」を公開しますか？`
    : `「${contentSet.title}」を非公開にしますか？`;

  if (!confirm(confirmationMessage)) {
    return;
  }

  button.disabled = true;
  button.textContent = "更新中...";

  try {
    const { error } = await supabase
      .from("sp_content_sets")
      .update({
        is_published: nextStatus
      })
      .eq("id", contentSet.id);

    if (error) {
      throw error;
    }

    await loadContentSets();

  } catch (error) {
    console.error("公開状態の更新に失敗しました:", error);

    alert(
      "公開状態を更新できませんでした。もう一度お試しください。"
    );

    button.disabled = false;

    button.textContent = contentSet.is_published
      ? "非公開にする"
      : "公開する";
  }
}


/* ========================================
   画像管理：選択状態のリセット
======================================== */

function clearImagePreview() {
  imagePreview.querySelectorAll("img").forEach(image => {
    if (image.dataset.objectUrl) {
      URL.revokeObjectURL(image.dataset.objectUrl);
    }
  });

  imagePreview.replaceChildren();
}

function resetSelectedSet() {
  selectedContentSet = null;

  imageEditor.classList.add("hidden");

  selectedSetElement.textContent =
    "解説セットを選択してください。";

  selectedQuizSetElement.textContent =
    "解説セットを選択してください。";

  imageFilesInput.value = "";

  clearImagePreview();

  imageMessage.textContent = "";
  imageListMessage.textContent = "";

  imageList.replaceChildren();

  resetQuizForm();
  quizList.replaceChildren();
  quizListMessage.textContent = "";
}


/* ========================================
   画像管理：解説セット選択
======================================== */

async function selectContentSet(contentSet, selectedCard) {
  selectedContentSet = contentSet;

  setList.querySelectorAll(".admin-set-item").forEach(card => {
    card.classList.remove("is-selected");
  });

  selectedCard.classList.add("is-selected");

  imageEditor.classList.remove("hidden");

  selectedSetElement.textContent =
    `選択中の解説セット：${contentSet.title}`;

  selectedQuizSetElement.textContent =
    `選択中の解説セット：${contentSet.title}`;

  imageFilesInput.value = "";

  clearImagePreview();

  imageMessage.textContent = "";
  imageListMessage.textContent = "";

  resetQuizForm();

  await Promise.all([
    loadImages(),
    loadQuizzes()
  ]);
}


/* ========================================
   画像管理：アップロード前プレビュー
======================================== */

imageFilesInput.addEventListener("change", () => {
  clearImagePreview();

  const files = Array.from(imageFilesInput.files || []);

  if (files.length === 0) {
    return;
  }

  files.forEach(file => {
    const item = createElement(
      "div",
      "admin-image-preview-item"
    );

    const image = createElement(
      "img",
      "admin-image-preview-photo"
    );

    const objectUrl = URL.createObjectURL(file);

    image.src = objectUrl;
    image.alt = file.name;
    image.dataset.objectUrl = objectUrl;

    const name = createElement(
      "p",
      "admin-image-file-name",
      file.name
    );

    item.append(image, name);

    imagePreview.appendChild(item);
  });
});


/* ========================================
   画像管理：ファイル名の安全化
======================================== */

function createSafeFileName(fileName) {
  return fileName
    .normalize("NFKC")
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .slice(-100) || "image";
}


/* ========================================
   画像管理：画像アップロード
======================================== */

imageForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!selectedContentSet) {
    showMessage(
      imageMessage,
      "先に解説セットを選択してください。",
      true
    );

    return;
  }

  const files = Array.from(imageFilesInput.files || []);

  if (files.length === 0) {
    showMessage(
      imageMessage,
      "アップロードする画像を選択してください。",
      true
    );

    return;
  }

  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp"
  ];

  const maxSize = 10 * 1024 * 1024;

  for (const file of files) {
    if (!allowedTypes.includes(file.type)) {
      showMessage(
        imageMessage,
        `「${file.name}」は対応していない画像形式です。JPEG・PNG・WebPを選択してください。`,
        true
      );

      return;
    }

    if (file.size > maxSize) {
      showMessage(
        imageMessage,
        `「${file.name}」のサイズが10MBを超えています。`,
        true
      );

      return;
    }
  }

  uploadImagesButton.disabled = true;
  uploadImagesButton.textContent = "アップロード中...";

  imageMessage.textContent = "";

  let successCount = 0;

  try {
    for (const file of files) {
      const safeFileName = createSafeFileName(file.name);

      const uniqueId = crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

      const filePath =
        `${selectedUnit.id}/${selectedContentSet.id}/${uniqueId}-${safeFileName}`;

      const { error: uploadError } = await supabase
        .storage
        .from("study-point-images")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false
        });

      if (uploadError) {
        throw uploadError;
      }

      const { error: insertError } = await supabase
        .from("sp_images")
        .insert({
          content_set_id: selectedContentSet.id,
          image_path: filePath
        });

      if (insertError) {
        throw insertError;
      }

      successCount++;
    }

    await updateDisplayType();

    imageFilesInput.value = "";

    clearImagePreview();

    showMessage(
      imageMessage,
      `${successCount}枚の画像をアップロードしました！`
    );

    await loadImages();

  } catch (error) {
    console.error("画像アップロードエラー:", error);

    showMessage(
      imageMessage,
      `${successCount}枚のアップロードが完了しましたが、途中でエラーが発生しました。登録済み画像を確認してください。`,
      true
    );

    await loadImages();

  } finally {
    uploadImagesButton.disabled = false;
    uploadImagesButton.textContent = "画像をアップロード";
  }
});


/* ========================================
   画像管理：表示形式の自動設定
======================================== */

async function updateDisplayType() {
  if (!selectedContentSet) {
    return;
  }

  const { data, error } = await supabase
    .from("sp_images")
    .select("id")
    .eq("content_set_id", selectedContentSet.id);

  if (error) {
    throw error;
  }

  const imageCount = (data || []).length;

  if (imageCount === 0) {
    return;
  }

  const nextDisplayType = imageCount === 1
    ? "single"
    : "carousel";

  if (selectedContentSet.display_type === nextDisplayType) {
    return;
  }

  const { error: updateError } = await supabase
    .from("sp_content_sets")
    .update({
      display_type: nextDisplayType
    })
    .eq("id", selectedContentSet.id);

  if (updateError) {
    throw updateError;
  }

  selectedContentSet.display_type = nextDisplayType;
}


/* ========================================
   画像管理：登録済み画像一覧
======================================== */

async function loadImages() {
  if (!selectedContentSet) {
    return;
  }

  imageList.replaceChildren();

  showMessage(
    imageListMessage,
    "登録済みの画像を読み込んでいます..."
  );

  try {
    const { data, error } = await supabase
      .from("sp_images")
      .select("*")
      .eq("content_set_id", selectedContentSet.id)
      .order("created_at", { ascending: true });

    if (error) {
      throw error;
    }

    const images = data || [];

    imageListMessage.textContent = "";

    if (images.length === 0) {
      showMessage(
        imageListMessage,
        "この解説セットには、まだ画像が登録されていません。"
      );

      return;
    }

    images.forEach((imageData, index) => {
      const item = createElement(
        "div",
        "admin-image-list-item"
      );

      const image = createElement(
        "img",
        "admin-image-list-photo"
      );

      const { data: publicUrlData } = supabase
        .storage
        .from("study-point-images")
        .getPublicUrl(imageData.image_path);

      image.src = publicUrlData.publicUrl;
      image.alt = `登録済み画像 ${index + 1}`;
      image.loading = "lazy";

      const information = createElement(
        "p",
        "admin-image-list-information",
        `画像 ${index + 1}`
      );

      item.append(image, information);

      imageList.appendChild(item);
    });

  } catch (error) {
    console.error("画像一覧の取得に失敗しました:", error);

    showMessage(
      imageListMessage,
      "画像を読み込めませんでした。Storageやデータベースの設定を確認してください。",
      true
    );
  }
}


/* ========================================
   クイズ管理：フォームリセット
======================================== */

function resetQuizForm() {
  editingQuizId = null;

  quizForm.reset();

  quizSubmitButton.textContent = "クイズを登録";
  quizCancelButton.classList.add("hidden");

  quizFormHeading.textContent = "クイズを登録";
  quizFormMessage.textContent = "";
}


/* ========================================
   クイズ管理：編集キャンセル
======================================== */

quizCancelButton.addEventListener("click", () => {
  resetQuizForm();
});


/* ========================================
   クイズ管理：一覧取得
======================================== */

async function loadQuizzes() {
  if (!selectedContentSet) {
    return;
  }

  quizList.replaceChildren();

  showMessage(
    quizListMessage,
    "クイズを読み込んでいます..."
  );

  try {
    const { data, error } = await supabase
      .from("sp_quizzes")
      .select("*")
      .eq("content_set_id", selectedContentSet.id)
      .order("created_at", { ascending: true });

    if (error) {
      throw error;
    }

    const quizzes = data || [];

    quizListMessage.textContent = "";

    if (quizzes.length === 0) {
      showMessage(
        quizListMessage,
        "この解説セットには、まだクイズが登録されていません。"
      );

      return;
    }

    quizzes.forEach((quiz, index) => {
      const card = createElement(
        "div",
        "admin-set-item"
      );

      const top = createElement(
        "div",
        "admin-set-item-top"
      );

      const title = createElement(
        "h4",
        "admin-set-item-title",
        `クイズ ${index + 1}`
      );

      const status = createElement(
        "span",
        "admin-set-status is-published",
        `正解：${quiz.correct_answer}`
      );

      top.append(title, status);

      const question = createElement(
        "p",
        "admin-set-item-description",
        quiz.question
      );

      const choiceInformation = createElement(
        "div",
        "admin-quiz-choice-list"
      );

      ["a", "b", "c", "d"].forEach(choice => {
        const letter = choice.toUpperCase();

        const choiceItem = createElement(
          "p",
          "admin-set-item-information",
          `${letter}：${quiz[`choice_${choice}`]}`
        );

        if (quiz.correct_answer === letter) {
          choiceItem.classList.add("is-correct-answer");
        }

        choiceInformation.appendChild(choiceItem);
      });

      const explanation = createElement(
        "p",
        "admin-set-item-information",
        quiz.explanation
          ? `解説：${quiz.explanation}`
          : "解説：未登録"
      );

      const actionArea = createElement(
        "div",
        "admin-set-item-actions"
      );

      const editButton = createElement(
        "button",
        "admin-item-select-button",
        "編集する"
      );

      editButton.type = "button";

      editButton.addEventListener("click", () => {
        startEditQuiz(quiz);
      });

      actionArea.appendChild(editButton);

      card.append(
        top,
        question,
        choiceInformation,
        explanation,
        actionArea
      );

      quizList.appendChild(card);
    });

  } catch (error) {
    console.error("クイズ一覧の取得に失敗しました:", error);

    showMessage(
      quizListMessage,
      "クイズを読み込めませんでした。データベースの設定を確認してください。",
      true
    );
  }
}


/* ========================================
   クイズ管理：編集開始
======================================== */

function startEditQuiz(quiz) {
  editingQuizId = quiz.id;

  quizQuestionInput.value = quiz.question || "";

  ["a", "b", "c", "d"].forEach(choice => {
    quizChoiceInputs[choice].value =
      quiz[`choice_${choice}`] || "";
  });

  // データベースの大文字の値をそのまま選択
  quizAnswerSelect.value = quiz.correct_answer || "A";

  quizExplanationInput.value = quiz.explanation || "";

  quizFormHeading.textContent = "クイズを編集";
  quizSubmitButton.textContent = "変更を保存";

  quizCancelButton.classList.remove("hidden");

  showMessage(
    quizFormMessage,
    "クイズを編集しています。変更後に保存してください。"
  );

  quizForm.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}


/* ========================================
   クイズ管理：新規登録・編集保存
======================================== */

quizForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!selectedContentSet) {
    showMessage(
      quizFormMessage,
      "先に解説セットを選択してください。",
      true
    );

    return;
  }

  const question = quizQuestionInput.value.trim();

  const choiceA = quizChoiceInputs.a.value.trim();
  const choiceB = quizChoiceInputs.b.value.trim();
  const choiceC = quizChoiceInputs.c.value.trim();
  const choiceD = quizChoiceInputs.d.value.trim();

  // A・B・C・Dの大文字で取得
  const correctAnswer = quizAnswerSelect.value.toUpperCase();

  const explanation = quizExplanationInput.value.trim();

  if (
    !question ||
    !choiceA ||
    !choiceB ||
    !choiceC ||
    !choiceD
  ) {
    showMessage(
      quizFormMessage,
      "問題文と4つの選択肢をすべて入力してください。",
      true
    );

    return;
  }

  const quizData = {
    content_set_id: selectedContentSet.id,
    question,
    choice_a: choiceA,
    choice_b: choiceB,
    choice_c: choiceC,
    choice_d: choiceD,
    correct_answer: correctAnswer,
    explanation: explanation || null
  };

  quizSubmitButton.disabled = true;

  quizSubmitButton.textContent = editingQuizId
    ? "更新中..."
    : "登録中...";

  quizFormMessage.textContent = "";

  try {
    let error;

    if (editingQuizId) {
      const result = await supabase
        .from("sp_quizzes")
        .update({
          question: quizData.question,
          choice_a: quizData.choice_a,
          choice_b: quizData.choice_b,
          choice_c: quizData.choice_c,
          choice_d: quizData.choice_d,
          correct_answer: quizData.correct_answer,
          explanation: quizData.explanation
        })
        .eq("id", editingQuizId)
        .eq("content_set_id", selectedContentSet.id);

      error = result.error;

    } else {
      const result = await supabase
        .from("sp_quizzes")
        .insert(quizData);

      error = result.error;
    }

    if (error) {
      throw error;
    }

    const successMessage = editingQuizId
      ? "クイズを更新しました！"
      : "クイズを登録しました！";

    resetQuizForm();

    showMessage(
      quizFormMessage,
      successMessage
    );

    await loadQuizzes();

  } catch (error) {
    console.error("クイズの保存に失敗しました:", error);

    showMessage(
      quizFormMessage,
      `クイズを保存できませんでした。${error.message || "データベースの設定を確認してください。"}`,
      true
    );

  } finally {
    quizSubmitButton.disabled = false;

    quizSubmitButton.textContent = editingQuizId
      ? "変更を保存"
      : "クイズを登録";
  }
});


/* ========================================
   要望管理
======================================== */

// 要望一覧を取得
async function loadRequests(showNotification = false) {
  requestsMessage.textContent = "要望を読み込んでいます...";

  requestsList.replaceChildren();

  refreshRequestsButton.disabled = true;
  refreshRequestsButton.textContent = "読み込み中...";

  try {
    const { data, error } = await supabase
      .from("sp_requests")
      .select("*")
      .order("is_read", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    const requests = data || [];

    const unreadRequests = requests.filter(
      request => !request.is_read
    );

    const unreadCount = unreadRequests.length;

    requestsCount.textContent = `未読 ${unreadCount}件`;

    if (unreadCount > 0) {
      unreadNotice.textContent =
        `未読の要望が ${unreadCount} 件あります。`;

      unreadNotice.classList.remove("hidden");

      if (showNotification) {
        alert(`未読の要望が ${unreadCount} 件あります！`);
      }

    } else {
      unreadNotice.classList.add("hidden");
    }

    if (requests.length === 0) {
      requestsMessage.textContent =
        "現在、届いている要望はありません。";

      return;
    }

    requestsMessage.textContent = "";

    requests.forEach(request => {
      const card = createElement(
        "article",
        "admin-request-card"
      );

      if (!request.is_read) {
        card.classList.add("is-unread");
      }

      const top = createElement(
        "div",
        "admin-request-top"
      );

      const category = createElement(
        "span",
        "admin-request-category",
        request.category || "種類未設定"
      );

      const status = createElement(
        "span",
        request.is_read
          ? "admin-status is-read"
          : "admin-status is-unread",
        request.is_read ? "既読" : "未読"
      );

      top.append(category, status);

      const information = createElement(
        "p",
        "admin-request-information",
        `${request.grade || "学年未設定"} ・ ${formatDate(request.created_at)}`
      );

      const content = createElement(
        "p",
        "admin-request-content",
        request.message || ""
      );

      const actionArea = createElement(
        "div",
        "admin-request-actions"
      );

      const toggleButton = createElement(
        "button",
        "admin-toggle-read-button",
        request.is_read ? "未読に戻す" : "既読にする"
      );

      toggleButton.type = "button";

      toggleButton.addEventListener("click", async () => {
        await toggleReadStatus(
          request.id,
          request.is_read,
          toggleButton
        );
      });

      actionArea.appendChild(toggleButton);

      card.append(
        top,
        information,
        content,
        actionArea
      );

      requestsList.appendChild(card);
    });

  } catch (error) {
    console.error("要望の取得に失敗しました:", error);

    requestsCount.textContent = "未読 --件";

    requestsMessage.textContent =
      "要望を読み込めませんでした。時間をおいて再度お試しください。";

  } finally {
    refreshRequestsButton.disabled = false;

    refreshRequestsButton.innerHTML =
      '<span aria-hidden="true">↻</span> 更新';
  }
}


/* ========================================
   既読・未読の切り替え
======================================== */

async function toggleReadStatus(requestId, currentStatus, button) {
  button.disabled = true;
  button.textContent = "更新中...";

  try {
    const { error } = await supabase
      .from("sp_requests")
      .update({
        is_read: !currentStatus
      })
      .eq("id", requestId);

    if (error) {
      throw error;
    }

    await loadRequests(false);

  } catch (error) {
    console.error("既読状態の更新に失敗しました:", error);

    alert("更新に失敗しました。もう一度お試しください。");

    button.disabled = false;

    button.textContent = currentStatus
      ? "未読に戻す"
      : "既読にする";
  }
}


/* ========================================
   要望一覧の更新
======================================== */

refreshRequestsButton.addEventListener("click", async () => {
  await loadRequests(false);
});


/* ========================================
   ログイン状態の確認
======================================== */

async function initializeAdmin() {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    console.error("ログイン状態の確認に失敗しました:", error);

    showLogin();

    return;
  }

  const session = data.session;

  if (session) {
    await handleAuthenticatedUser(session.user);

  } else {
    showLogin();
  }
}


/* ========================================
   ログイン状態の変化を監視
======================================== */

supabase.auth.onAuthStateChange((event, session) => {
  if (event === "SIGNED_OUT" || !session) {
    showLogin();
  }
});


/* ========================================
   初期化
======================================== */

initializeAdmin();
