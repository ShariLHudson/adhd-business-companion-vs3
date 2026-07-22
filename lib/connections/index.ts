export {
  SETTINGS_CONNECTION_CARDS,
  SETTINGS_CONNECTIONS_HIDDEN_FROM_UI,
  buildSettingsConnectionCards,
  type GoogleConnectionSnapshot,
  type SettingsConnectionCardDef,
  type SettingsConnectionCardState,
  type SettingsConnectionId,
  type SettingsConnectionKind,
  type SettingsConnectionStatus,
} from "./settingsConnectionCatalog";

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
  DEFAULT_DIGITAL_WORKSPACE_PREFERENCES,
  DOCUMENTS_PROVIDER_LABELS,
  PRINTING_PREFERENCE_LABELS,
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
