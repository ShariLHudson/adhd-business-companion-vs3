/**
 * Durable member-record persistence — public API.
 *
 * The generic, verified persistence foundation (Beta Blocker 1). Domains
 * persist member work through upsertMemberRecord / fetchMemberRecord /
 * listMemberRecords with honest success/failure receipts. Durable success is
 * only ever produced after a verified DB write + read-back.
 *
 * NOTE: This is the storage foundation only. Wiring receipts into member-facing
 * "saved" messages belongs to Beta Blocker 2 (Trust Kernel integration).
 */

export {
  MEMBER_RECORDS_TABLE,
  DURABLE_ERROR,
  durableRecordOk,
  durableRecordFail,
  memberRecordToRow,
  rowToMemberRecord,
} from "./types";
export type {
  DurableRecordResult,
  DurableErrorCode,
  MemberRecord,
  MemberRecordRow,
  MemberRecordStatus,
} from "./types";

export {
  upsertMemberRecord,
  fetchMemberRecord,
  listMemberRecords,
  softDeleteMemberRecord,
  getAuthenticatedMemberId,
  createMemoryDurableRecordBackend,
  setDurableRecordBackendForTests,
  setDurableRecordAuthForTests,
  clearDurableRecordAuthForTests,
} from "./repository";
export type {
  DurableRecordBackend,
  UpsertMemberRecordInput,
} from "./repository";

export {
  isMemberRecordDurable,
  getMemberRecordDurableVersion,
  markMemberRecordDurable,
  clearMemberRecordDurableMark,
  clearMemberRecordDurableMarksForTests,
} from "./verifiedRegistry";

export {
  writeLocalRecoveryCache,
  readLocalRecoveryCache,
  clearLocalRecoveryCache,
} from "./localRecoveryCache";
