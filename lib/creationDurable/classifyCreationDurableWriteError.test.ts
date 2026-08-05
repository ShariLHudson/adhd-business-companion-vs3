/**
 * Phase P0.5 — Create Durable Trust Foundation.
 * A mid-session authentication failure (e.g. expired JWT) must never be
 * presented to the member as a missing-schema problem, and a genuinely
 * missing table must still be caught. Regression coverage for the bug
 * where `/PGRST/i.test(error.message)` matched every PostgREST error
 * code — including auth failures — as TABLE_MISSING.
 */
import { describe, expect, it } from "vitest";
import { classifyCreationDurableWriteError } from "./repository";

describe("classifyCreationDurableWriteError", () => {
  it("classifies a real missing-relation error (raw Postgres) as TABLE_MISSING", () => {
    const result = classifyCreationDurableWriteError({
      code: "42P01",
      message: 'relation "public.companion_creation_workspaces" does not exist',
    });
    expect(result.errorCode).toBe("TABLE_MISSING");
    expect(result.message).toMatch(/schema/i);
  });

  it("classifies PostgREST's schema-cache-miss code as TABLE_MISSING", () => {
    const result = classifyCreationDurableWriteError({
      code: "PGRST205",
      message: "Could not find the table 'public.companion_creation_workspaces' in the schema cache",
    });
    expect(result.errorCode).toBe("TABLE_MISSING");
  });

  it("classifies an expired-JWT auth failure as AUTH_REQUIRED, not TABLE_MISSING", () => {
    const result = classifyCreationDurableWriteError({
      code: "PGRST301",
      message: "JWT expired",
    });
    expect(result.errorCode).toBe("AUTH_REQUIRED");
    expect(result.message).toMatch(/sign in/i);
    expect(result.message).not.toMatch(/schema/i);
  });

  it("regression: a PostgREST error code that merely starts with PGRST must not false-match TABLE_MISSING", () => {
    // Any PostgREST error code is prefixed PGRST — the old bare substring
    // check on error.message would have caught this too.
    const result = classifyCreationDurableWriteError({
      code: "PGRST116",
      message: "JSON object requested, multiple (or no) rows returned",
    });
    expect(result.errorCode).not.toBe("TABLE_MISSING");
  });

  it("falls back to the raw code for an unrecognized write failure", () => {
    const result = classifyCreationDurableWriteError({
      code: "42501",
      message: "permission denied for table companion_creation_workspaces",
    });
    expect(result.errorCode).toBe("42501");
    expect(result.message).toMatch(/didn't finish saving/i);
  });

  it("falls back to DB_WRITE_FAILED when no code is present", () => {
    const result = classifyCreationDurableWriteError({ message: "unknown" });
    expect(result.errorCode).toBe("DB_WRITE_FAILED");
  });
});
