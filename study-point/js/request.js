import { supabase } from "./supabase.js";

/* ========================================
   Study Point!＋ - Request JavaScript
======================================== */

const requestForm = document.getElementById("request-form");
const categorySelect = document.getElementById("request-category");
const gradeSelect = document.getElementById("request-grade");
const contentInput = document.getElementById("request-content");
const formMessage = document.getElementById("form-message");

const validGrades = ["中1", "中2", "中3", "高1", "高2", "高3"];

// URLから学年を取得
const params = new URLSearchParams(window.location.search);
const urlGrade = params.get("grade");

// URLに有効な学年が指定されていれば自動選択
if (urlGrade && validGrades.includes(urlGrade)) {
  gradeSelect.value = urlGrade;
}


// フォームの送信処理
if (
  requestForm &&
  categorySelect &&
  gradeSelect &&
  contentInput &&
  formMessage
) {

  requestForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    const category = categorySelect.value;
    const grade = gradeSelect.value;
    const content = contentInput.value.trim();

    // 入力チェック
    if (!category) {
      formMessage.textContent = "要望の種類を選択してください。";
      return;
    }

    if (!validGrades.includes(grade)) {
      formMessage.textContent = "学年を選択してください。";
      return;
    }

    if (!content) {
      formMessage.textContent = "内容を入力してください。";
      return;
    }

    const submitButton = requestForm.querySelector(
      'button[type="submit"]'
    );

    // 送信中の処理
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "送信中...";
    }

    formMessage.textContent = "送信しています...";

    try {

      // Supabaseに保存
      const { error } = await supabase
        .from("sp_requests")
        .insert({
          category: category,
          grade: grade,
          subject: null,
          unit: null,
          message: content
        });

      if (error) {
        throw error;
      }

      // 送信成功
      formMessage.textContent =
        "送信しました！ご要望ありがとうございます。";

      // フォームをリセット
      requestForm.reset();

      // URLで指定された学年があれば再選択
      if (urlGrade && validGrades.includes(urlGrade)) {
        gradeSelect.value = urlGrade;
      }

    } catch (error) {

      console.error("要望の送信に失敗しました:", error);

      formMessage.textContent =
        "送信に失敗しました。時間をおいて、もう一度お試しください。";

    } finally {

      // ボタンを元に戻す
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = "要望を送る";
      }

    }

  });

} else {

  console.error(
    "要望フォームのHTML要素が見つかりません。request.htmlを確認してください。"
  );

}