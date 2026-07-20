export {
  classificationTypeFromWorkingIntent,
  deriveCreationIdentity,
  isDocumentClassificationType,
  isForceNewIdentityRequest,
  mayApplyEventWorkspace,
  type CreationIdentity,
} from "./deriveCreationIdentity";

export {
  resolveCreateFoundationClassification,
  shouldRouteDirectlyToCreateFoundation,
  type CreateFoundationClassification,
} from "./createFoundationRouting";
