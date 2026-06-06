import {
  MY_OWN_PLAN_EXAMPLES,
  MY_OWN_PLAN_PROMPT,
  START_STYLE_OPTIONS,
  STORAGE_KEYS,
  buildNextMorningReminder,
  createTomorrowStartSelection,
  findStartStyle,
  validateTomorrowStartSelection,
} from "./tomorrowStartOptions.js";

const optionList = document.querySelector("[data-start-style-options]");
const form = document.querySelector("[data-tomorrow-start-form]");
const notePanel = document.querySelector("[data-plan-note-panel]");
const noteInput = document.querySelector("[data-plan-note]");
const todayFocusInput = document.querySelector("[data-today-focus]");
const errorMessage = document.querySelector("[data-form-error]");
const savedMessage = document.querySelector("[data-saved-message]");
const reminder = document.querySelector("[data-next-morning-reminder]");

const savedSelection = readJson(STORAGE_KEYS.tomorrowStart);
const savedTodayFocus = localStorage.getItem(STORAGE_KEYS.todayFocus) ?? "";

todayFocusInput.value = savedTodayFocus;
noteInput.value = savedSelection?.note ?? "";
renderOptions(savedSelection?.id);
renderReminder(savedSelection);
syncNotePanel();

todayFocusInput.addEventListener("input", () => {
  localStorage.setItem(STORAGE_KEYS.todayFocus, todayFocusInput.value);
});

optionList.addEventListener("change", syncNotePanel);

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const selectedOption = form.elements.tomorrowStartStyle.value;
  const selection = createTomorrowStartSelection({
    id: selectedOption,
    note: noteInput.value,
    todayFocus: todayFocusInput.value,
  });
  const validationError = validateTomorrowStartSelection(selection);

  if (validationError) {
    showError(validationError);
    return;
  }

  localStorage.setItem(STORAGE_KEYS.tomorrowStart, JSON.stringify(selection));

  if (selection.id === "continue-where-left-off") {
    localStorage.setItem(STORAGE_KEYS.todayFocus, selection.todayFocus);
  }

  showError("");
  savedMessage.textContent = "Saved for tomorrow.";
  renderReminder(selection);
});

function renderOptions(selectedId) {
  optionList.innerHTML = START_STYLE_OPTIONS.map((option, index) => {
    const checked = selectedId === option.id || (!selectedId && index === 0);

    return `
      <label class="start-card">
        <input
          type="radio"
          name="tomorrowStartStyle"
          value="${option.id}"
          ${checked ? "checked" : ""}
        />
        <span class="start-card__content">
          <span class="start-card__label">${option.emoji} ${option.label}</span>
          <span class="start-card__description">${option.description}</span>
        </span>
      </label>
    `;
  }).join("");
}

function syncNotePanel() {
  const selectedId = form.elements.tomorrowStartStyle.value;
  const selectedOption = findStartStyle(selectedId);
  const shouldShowNote = Boolean(selectedOption?.requiresNote);

  notePanel.hidden = !shouldShowNote;
  noteInput.required = shouldShowNote;

  if (shouldShowNote) {
    noteInput.focus();
  } else {
    noteInput.value = "";
  }

  savedMessage.textContent = "";
  showError("");
}

function renderReminder(selection) {
  const message = buildNextMorningReminder(selection);
  reminder.textContent = message || "No tomorrow start has been saved yet.";
}

function showError(message) {
  errorMessage.textContent = message;
  errorMessage.hidden = message.length === 0;
}

function readJson(key) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}

document.querySelector("[data-plan-note-prompt]").textContent = MY_OWN_PLAN_PROMPT;
document.querySelector("[data-plan-note-examples]").innerHTML = MY_OWN_PLAN_EXAMPLES
  .map((example) => `<li>${example}</li>`)
  .join("");
