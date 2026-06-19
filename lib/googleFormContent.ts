/**
 * Google Forms export — create form and add questions from draft content.
 */

export function isFormFriendlyContent(content: string): boolean {
  const t = content.trim();
  if (!t) return false;
  const questionLines = extractFormQuestions(t);
  return questionLines.length >= 2;
}

export function extractFormQuestions(content: string): string[] {
  const lines = content
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const questions: string[] = [];
  for (const line of lines) {
    const stripped = line
      .replace(/^[-•*\d]+[.)]\s+/, "")
      .replace(/^#+\s+/, "")
      .replace(/\*\*/g, "")
      .trim();
    if (!stripped) continue;
    if (stripped.endsWith("?") || /^(what|who|when|where|why|how|which|do you|are you|would you)/i.test(stripped)) {
      questions.push(stripped.endsWith("?") ? stripped : `${stripped}?`);
    } else if (questions.length < 12 && stripped.length > 8 && stripped.length < 200) {
      questions.push(`${stripped}?`);
    }
  }
  return [...new Set(questions)].slice(0, 15);
}

export function formDescriptionFromContent(content: string, title: string): string {
  const first = content
    .split("\n")
    .map((l) => l.trim())
    .find((l) => l && !l.endsWith("?"));
  return (first ?? title).slice(0, 300);
}

type FormBatchRequest = Record<string, unknown>;

export function buildFormQuestionRequests(
  questions: string[],
  startIndex = 0,
): FormBatchRequest[] {
  return questions.map((q, i) => ({
    createItem: {
      item: {
        title: q.slice(0, 300),
        questionItem: {
          question: {
            required: false,
            textQuestion: { paragraph: false },
          },
        },
      },
      location: { index: startIndex + i },
    },
  }));
}

export async function createGoogleFormWithQuestions(
  accessToken: string,
  title: string,
  description: string,
  questions: string[],
): Promise<{ fileId: string; url: string } | { error: string }> {
  const createRes = await fetch("https://forms.googleapis.com/v1/forms", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      info: {
        title: title.slice(0, 200),
        documentTitle: title.slice(0, 200),
        description: description.slice(0, 500),
      },
    }),
  });

  if (!createRes.ok) {
    const detail = await createRes.text();
    console.error("Forms create error:", detail);
    return { error: "Couldn't create the Google Form." };
  }

  const created = (await createRes.json()) as {
    formId?: string;
    responderUri?: string;
  };
  const formId = created.formId;
  if (!formId) return { error: "Google Form was created without an id." };

  if (questions.length) {
    const batchRes = await fetch(
      `https://forms.googleapis.com/v1/forms/${formId}:batchUpdate`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requests: buildFormQuestionRequests(questions),
        }),
      },
    );
    if (!batchRes.ok) {
      console.error("Forms batchUpdate error:", await batchRes.text());
    }
  }

  return {
    fileId: formId,
    url: `https://docs.google.com/forms/d/${formId}/edit`,
  };
}
