import { describe, expect, it, vi } from "vitest";
import {
  CHAT_RECOVERY_MESSAGE,
  friendlyFetchErrorMessage,
  isTechnicalFetchErrorMessage,
  readJsonResponse,
  SafeJsonResponseError,
} from "./safeJsonResponse";

function mockResponse(
  body: string,
  init?: { status?: number; contentType?: string },
): Response {
  const status = init?.status ?? 200;
  const headers = new Headers();
  if (init?.contentType) {
    headers.set("content-type", init.contentType);
  }
  return new Response(body, { status, headers });
}

describe("safeJsonResponse", () => {
  it("parses valid JSON responses", async () => {
    const res = mockResponse('{"message":"hello"}', {
      contentType: "application/json",
    });
    const data = await readJsonResponse<{ message: string }>(res);
    expect(data.message).toBe("hello");
  });

  it("does not throw SyntaxError when HTML is returned", async () => {
    const html = "<!DOCTYPE html><html><body>error</body></html>";
    const res = mockResponse(html, {
      status: 500,
      contentType: "text/html",
    });
    const err = await readJsonResponse(res).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(SafeJsonResponseError);
    expect(err).not.toBeInstanceOf(SyntaxError);
  });

  it("maps HTML responses to friendly recovery copy", async () => {
    const res = mockResponse("<!DOCTYPE html><html></html>", {
      status: 404,
      contentType: "text/html",
    });
    try {
      await readJsonResponse(res);
    } catch (err) {
      expect(friendlyFetchErrorMessage(err)).toBe(CHAT_RECOVERY_MESSAGE);
    }
  });

  it("never surfaces DOCTYPE or JSON parse errors in chat copy", () => {
    expect(
      isTechnicalFetchErrorMessage(
        `Unexpected token '<', "<!DOCTYPE "... is not valid JSON`,
      ),
    ).toBe(true);
    expect(friendlyFetchErrorMessage(new SyntaxError("Unexpected token '<'"))).toBe(
      CHAT_RECOVERY_MESSAGE,
    );
    expect(friendlyFetchErrorMessage(new SafeJsonResponseError("diag"))).toBe(
      CHAT_RECOVERY_MESSAGE,
    );
  });

  it("logs a safe diagnostic for non-JSON bodies in development", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const prev = process.env.NODE_ENV;
    process.env.NODE_ENV = "development";

    const res = mockResponse("<html></html>", {
      status: 502,
      contentType: "text/html",
    });
    await expect(readJsonResponse(res, { url: "/api/companion-chat" })).rejects.toThrow();

    expect(warn).toHaveBeenCalledWith(
      "[companion-fetch] expected JSON response",
      expect.objectContaining({
        url: "/api/companion-chat",
        status: 502,
      }),
    );

    process.env.NODE_ENV = prev;
    warn.mockRestore();
  });
});
