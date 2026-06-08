export const queryKeys = {
  notes: ["notes"] as const,
  revisionPlaylists: ["revision-playlists"] as const,
  sessionDashboard: ["session-dashboard"] as const,
  sessionsAll: ["sessions-all"] as const,
  sessionRecordsWithEnrollments: ["session-records-with-enrollments"] as const,
  sessionRecordById: (id: string) => ["session-record", id] as const,
  notifications: ["notifications"] as const,
};
