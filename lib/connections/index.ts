export {
  SETTINGS_CONNECTION_CARDS,
  SETTINGS_CONNECTIONS_HIDDEN_FROM_UI,
  buildSettingsConnectionCards,
  connectionStatusLabel,
  normalizeConnectionStatus,
  type GoogleConnectionSnapshot,
  type SettingsConnectionCardDef,
  type SettingsConnectionCardState,
  type SettingsConnectionId,
  type SettingsConnectionKind,
  type SettingsConnectionStatus,
} from "./settingsConnectionCatalog";

export {
  maybeAutoSelectSoleCalendar,
  resolveCalendarDefaults,
  resolveDocumentDefaults,
  resolvePrintingDefaults,
  resolveStorageDefaults,
  type DefaultCategory,
  type DefaultGroupState,
  type DefaultOption,
  type DefaultsConnectionSnapshot,
} from "./defaultsAvailability";

export {
  connectOutlookCalendarLocal,
  disconnectOutlookCalendarLocal,
  isOutlookCalendarConnected,
  readOutlookCalendarConnection,
  resetOutlookCalendarConnectionForTests,
  type OutlookCalendarConnectionRecord,
} from "./outlookCalendarConnection";

export {
  connectCanvaLocal,
  disconnectCanvaLocal,
  isCanvaConnected,
  normalizeCanvaDestinationUrl,
  readCanvaConnection,
  resetCanvaConnectionForTests,
  updateCanvaDestinationUrl,
  verifyCanvaConnection,
  type CanvaConnectionRecord,
} from "./canvaConnection";

export {
  CALENDAR_PROVIDER_LABELS,
  DEFAULT_DIGITAL_WORKSPACE_PREFERENCES,
  DOCUMENTS_PROVIDER_LABELS,
  PRINTING_PREFERENCE_LABELS,
  STORAGE_PROVIDER_LABELS,
  readDigitalWorkspacePreferences,
  resetDigitalWorkspacePreferencesForTests,
  writeDigitalWorkspacePreferences,
  type CalendarProviderPreference,
  type DigitalWorkspacePreferences,
  type DocumentsProviderPreference,
  type EmailProviderPreference,
  type PrintingPreference,
  type StorageProviderPreference,
} from "./digitalWorkspacePreferences";
