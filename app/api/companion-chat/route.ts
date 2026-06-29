import { NextRequest, NextResponse } from "next/server";
import {
  buildCompanionSystemPrompt,
  type CoachingMode,
} from "@/lib/companionPrompt";
import { resolveOpenAiApiKey } from "@/lib/openai/resolveOpenAiApiKey";
import { buildRelationshipTurnDebugApiPayload } from "@/lib/relationshipIntelligenceTurnDebug";
import {
  enforceRelationshipResponse,
  type RelationshipResponseEnforcementResult,
} from "@/lib/relationshipResponseContract";
import { enforceHumanConversation } from "@/lib/humanConversation";
import type { RelationshipMemoryConfidence } from "@/lib/relationshipIntelligencePrompt";
import {
  buildRelationshipResponseTraceSummary,
  createRelationshipResponseId,
  firstParagraphForTrace,
  logRelationshipResponseTrace,
} from "@/lib/relationshipResponseTrace";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type InputType = "voice" | "text";

const MODE_TEMPERATURE: Record<CoachingMode, number> = {
  today: 0.75,
  focus: 0.7,
  "how-do-i": 0.65,
  playbook: 0.75,
  progress: 0.75,
};

export async function POST(request: NextRequest) {
  try {
    const apiKey = resolveOpenAiApiKey();
    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "OpenAI API key is not configured. Add OPENAI_API_KEY to companion-app/.env.local and restart the dev server.",
        },
        { status: 500 },
      );
    }

    const body = await request.json();
    const messages = body.messages as ChatMessage[];
    const inputType = (body.inputType as InputType) ?? "text";
    const coachingMode = (body.coachingMode as CoachingMode) ?? "today";
    const emotionalState = body.emotionalState as string | undefined;
    const dayState = body.dayState as string | undefined;
    const aiTone = body.aiTone as string | undefined;
    const helpMode = body.helpMode as string | undefined;
    const supportStyle = body.supportStyle as string | undefined;
    const userName = body.userName as string | undefined;
    const businessContext = body.businessContext as string | undefined;
    const intentHint = body.intentHint as string | undefined;
    const relationshipIntelligencePriority = body.relationshipIntelligencePriority as
      | string
      | undefined;
    const relationshipLeadParagraph = body.relationshipLeadParagraph as
      | string
      | undefined;
    const memoryConfidence = body.memoryConfidence as
      | RelationshipMemoryConfidence
      | undefined;
    const toolOfferHint = body.toolOfferHint as string | undefined;
    const workspaceContextHint = body.workspaceContextHint as string | undefined;
    const responseLanguageHint = body.responseLanguageHint as string | undefined;
    const obstacle = body.obstacle as string | undefined;
    const somatic = Boolean(body.somatic);
    const adaptiveModeHint = body.adaptiveModeHint as string | undefined;
    const userHealthHint = body.userHealthHint as string | undefined;
    const decisionHint = body.decisionHint as string | undefined;
    const recoveryHint = body.recoveryHint as string | undefined;
    const environmentHint = body.environmentHint as string | undefined;
    const futureHint = body.futureHint as string | undefined;
    const momentumHint = body.momentumHint as string | undefined;
    const businessOSHint = body.businessOSHint as string | undefined;
    const chiefHint = body.chiefHint as string | undefined;
    const ecosystemGuidance = body.ecosystemGuidance as string | undefined;
    const intelligenceContext = body.intelligenceContext as string | undefined;
    const streamRequested = Boolean(body.stream);

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Messages are required." },
        { status: 400 },
      );
    }

    const systemPrompt = buildCompanionSystemPrompt(coachingMode, inputType, {
      emotionalState,
      dayState,
      aiTone,
      helpMode,
      supportStyle,
      userName,
      intentHint,
      responseLanguageHint,
    });

    // Emotional-attunement hints (presence before strategy).
    const attune =
      somatic || obstacle
        ? `\n\nEMOTIONAL READ (apply Presence-Before-Strategy / Somatic rules): ${
            somatic ? "SOMATIC AVOIDANCE present — validate the body response, normalize it, then at most ONE tiny step. " : ""
          }${obstacle ? `Likely obstacle: ${obstacle}. Speak to this blocker, not the surface task.` : ""}`
        : "";

    const offerBlock = toolOfferHint ? `\n\n${toolOfferHint}` : "";
    const workspaceBlock = workspaceContextHint
      ? `\n\n${workspaceContextHint}`
      : "";
    const adaptiveBlock = adaptiveModeHint ? `\n\n${adaptiveModeHint}` : "";
    const healthBlock = userHealthHint ? `\n\n${userHealthHint}` : "";
    const decisionBlock = decisionHint ? `\n\n${decisionHint}` : "";
    const recoveryBlock = recoveryHint ? `\n\n${recoveryHint}` : "";
    const environmentBlock = environmentHint ? `\n\n${environmentHint}` : "";
    const futureBlock = futureHint ? `\n\n${futureHint}` : "";
    const momentumBlock = momentumHint ? `\n\n${momentumHint}` : "";
    const businessOSBlock = businessOSHint ? `\n\n${businessOSHint}` : "";
    const chiefBlock = chiefHint ? `\n\n${chiefHint}` : "";

    const ecosystemBlock = ecosystemGuidance
      ? `\n\n${ecosystemGuidance}`
      : `${recoveryBlock}${healthBlock}${decisionBlock}${environmentBlock}${futureBlock}${momentumBlock}${businessOSBlock}${chiefBlock}`;
    const intelligenceBlock = intelligenceContext
      ? `\n\n${intelligenceContext}`
      : "";

    const priorityBlock = relationshipIntelligencePriority?.trim()
      ? `${relationshipIntelligencePriority.trim()}\n\n`
      : "";

    const finalSystem = `${priorityBlock}${
      businessContext ? `${systemPrompt}\n\n${businessContext}` : systemPrompt
    }${attune}${ecosystemBlock}${intelligenceBlock}${adaptiveBlock}${workspaceBlock}${offerBlock}`;

    if (process.env.NODE_ENV === "development" && relationshipIntelligencePriority) {
      console.debug("[relationship-intelligence-debug] API priority received", {
        priorityBlockLength: relationshipIntelligencePriority.length,
        priorityStartsWith: relationshipIntelligencePriority.slice(0, 80),
      });
    }

    const baseTemp = MODE_TEMPERATURE[coachingMode] ?? 0.75;
    const temperature =
      inputType === "voice" ? Math.min(baseTemp + 0.05, 0.9) : baseTemp;

    const relationshipResponseId = createRelationshipResponseId();
    const userProbe = messages[messages.length - 1]?.content ?? "";

    logRelationshipResponseTrace({
      responseId: relationshipResponseId,
      stage: "pre-llm",
      firstParagraph: "(pending)",
      memoryConfidence,
      relationshipLeadParagraphLength: relationshipLeadParagraph?.length ?? 0,
    });

    const openAiBody = {
      model: "gpt-4o-mini",
      messages: [{ role: "system", content: finalSystem }, ...messages],
      temperature,
      ...(streamRequested ? { stream: true } : {}),
    };

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(openAiBody),
    });

    if (!response.ok) {
      console.error("OpenAI error:", await response.text());
      return NextResponse.json(
        { error: "Something went wrong. Please try again." },
        { status: 502 },
      );
    }

    if (streamRequested && response.body) {
      const encoder = new TextEncoder();
      const readable = new ReadableStream({
        async start(controller) {
          try {
            const reader = response.body!.getReader();
            const decoder = new TextDecoder();
            let sseBuffer = "";
            let fullText = "";

            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              sseBuffer += decoder.decode(value, { stream: true });
              const lines = sseBuffer.split("\n");
              sseBuffer = lines.pop() ?? "";
              for (const line of lines) {
                if (!line.startsWith("data: ")) continue;
                const data = line.slice(6).trim();
                if (!data || data === "[DONE]") continue;
                try {
                  const json = JSON.parse(data) as {
                    choices?: Array<{ delta?: { content?: string } }>;
                  };
                  const chunk = json.choices?.[0]?.delta?.content;
                  if (chunk) {
                    fullText += chunk;
                    controller.enqueue(
                      encoder.encode(`${JSON.stringify({ delta: chunk })}\n`),
                    );
                  }
                } catch {
                  /* skip malformed SSE chunk */
                }
              }
            }

            const humanEnforcement = enforceHumanConversation({
              response: fullText,
              userText: userProbe,
              gentle:
                emotionalState?.toLowerCase().includes("overwhelm") ||
                emotionalState?.toLowerCase().includes("emotional"),
              seed: userProbe.length,
              memoryConfidence,
            });
            const message = humanEnforcement.message;
            if (message !== fullText) {
              fullText = message;
            }

            logRelationshipResponseTrace({
              responseId: relationshipResponseId,
              stage: "api-return",
              firstParagraph: firstParagraphForTrace(fullText),
              memoryConfidence,
              relationshipLeadParagraphLength: relationshipLeadParagraph?.length ?? 0,
              relationshipResponseRewritten: false,
              enforcementRan: false,
              skipReason: "stream_fast_path",
            });

            controller.enqueue(
              encoder.encode(
                `${JSON.stringify({ done: true, relationshipResponseId, message: fullText })}\n`,
              ),
            );
            controller.close();
          } catch (error) {
            console.error("Companion chat stream error:", error);
            controller.enqueue(
              encoder.encode(
                `${JSON.stringify({ error: "Something went wrong. Please try again." })}\n`,
              ),
            );
            controller.close();
          }
        },
      });

      return new Response(readable, {
        headers: { "Content-Type": "application/x-ndjson" },
      });
    }

    const data = await response.json();
    const rawMessage = data.choices?.[0]?.message?.content ?? "";

    logRelationshipResponseTrace({
      responseId: relationshipResponseId,
      stage: "post-llm",
      firstParagraph: firstParagraphForTrace(rawMessage),
      memoryConfidence,
      relationshipLeadParagraphLength: relationshipLeadParagraph?.length ?? 0,
      relationshipResponseRewritten: false,
    });

    let enforcement: RelationshipResponseEnforcementResult = {
      message: rawMessage,
      rewritten: false,
      enforcementRan: false,
      skipReason: "enforcement not invoked",
    };
    const enforcementEligible =
      Boolean(memoryConfidence) &&
      Boolean(relationshipLeadParagraph?.trim()) &&
      (memoryConfidence === "forming" || memoryConfidence === "sufficient");

    if (enforcementEligible && memoryConfidence) {
      enforcement = enforceRelationshipResponse({
        response: rawMessage,
        relationshipLeadParagraph,
        memoryConfidence,
        userText: userProbe,
      });
    } else if (!relationshipLeadParagraph?.trim()) {
      enforcement = {
        message: rawMessage,
        rewritten: false,
        enforcementRan: false,
        skipReason: relationshipLeadParagraph
          ? "empty relationshipLeadParagraph"
          : "relationshipLeadParagraph not sent to API",
      };
    } else if (!memoryConfidence) {
      enforcement = {
        message: rawMessage,
        rewritten: false,
        enforcementRan: false,
        skipReason: "memoryConfidence not sent to API",
      };
    }

    const messageAfterRelationship = enforcement.message;

    const humanEnforcement = enforceHumanConversation({
      response: messageAfterRelationship,
      userText: userProbe,
      gentle:
        emotionalState?.toLowerCase().includes("overwhelm") ||
        emotionalState?.toLowerCase().includes("emotional"),
      seed: userProbe.length,
      memoryConfidence,
    });

    const message = humanEnforcement.message;

    logRelationshipResponseTrace({
      responseId: relationshipResponseId,
      stage: "post-enforcement",
      firstParagraph: firstParagraphForTrace(message),
      memoryConfidence,
      relationshipLeadParagraphLength: relationshipLeadParagraph?.length ?? 0,
      relationshipResponseRewritten: enforcement.rewritten,
      enforcementRan: enforcement.enforcementRan,
      skipReason: enforcement.skipReason,
      violationReason: enforcement.violation?.reason,
    });

    logRelationshipResponseTrace({
      responseId: relationshipResponseId,
      stage: "api-return",
      firstParagraph: firstParagraphForTrace(message),
      memoryConfidence,
      relationshipLeadParagraphLength: relationshipLeadParagraph?.length ?? 0,
      relationshipResponseRewritten: enforcement.rewritten,
      enforcementRan: enforcement.enforcementRan,
      skipReason: enforcement.skipReason,
      violationReason: enforcement.violation?.reason,
    });

    const traceSummary = buildRelationshipResponseTraceSummary({
      responseId: relationshipResponseId,
      memoryConfidence,
      relationshipLeadParagraphLength: relationshipLeadParagraph?.length ?? 0,
      llmRawMessage: rawMessage,
      enforcedMessage: message,
      enforcementRewritten: enforcement.rewritten,
      enforcementRan: enforcement.enforcementRan,
      enforcementSkipReason: enforcement.skipReason,
      violationReason: enforcement.violation?.reason,
    });

    const apiDebug =
      process.env.NODE_ENV === "development"
        ? buildRelationshipTurnDebugApiPayload({
            relationshipIntelligencePriority,
            finalSystem,
          })
        : undefined;

    if (process.env.NODE_ENV === "development") {
      const shouldEmphasize =
        /building new things instead of finishing/i.test(userProbe) ||
        Boolean(relationshipIntelligencePriority?.trim());

      const logPayload = {
        userText: userProbe.slice(0, 160),
        ...apiDebug,
        ...traceSummary,
        lastUserMessage: userProbe,
      };

      if (shouldEmphasize) {
        console.warn("[relationship-intelligence-debug] API", logPayload);
      } else {
        console.debug("[relationship-intelligence-debug] API", logPayload);
      }
    }

    return NextResponse.json({
      message,
      relationshipResponseId,
      ...(apiDebug
        ? {
            _relationshipTurnDebug: {
              ...apiDebug,
              ...traceSummary,
              humanConversationRewritten: humanEnforcement.rewritten,
              humanConversationTwelveTestScore: humanEnforcement.twelveTests.score,
              humanConversationTwelveTestPassed: humanEnforcement.twelveTests.passed,
              humanConversationTwelveTestFailures: humanEnforcement.twelveTests.results
                .filter((r) => !r.passed)
                .map((r) => ({ id: r.id, reason: r.reason })),
            },
          }
        : process.env.NODE_ENV === "development"
          ? {
              _relationshipTurnDebug: {
                ...traceSummary,
                humanConversationRewritten: humanEnforcement.rewritten,
                humanConversationTwelveTestScore: humanEnforcement.twelveTests.score,
                humanConversationTwelveTestPassed: humanEnforcement.twelveTests.passed,
              },
            }
          : {}),
    });
  } catch (error) {
    console.error("Companion chat error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
