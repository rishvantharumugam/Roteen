import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { type QuestionMode } from "@/features/video/services/video";

interface AdminNoteRow {
  note_url: string | null;
  path: string | null;
  answer_type: string | null;
  Mode_type: QuestionMode | string | null;
}

type GithubFileRef = {
  owner: string;
  repo: string;
  branch: string;
  filePath: string;
  publicUrl: string;
};

function cleanNoteValue(value: string | null | undefined) {
  return value?.trim().replace(/[\r\n]+/g, "") ?? "";
}

function isHttpUrl(value: string) {
  return /^https?:\/\//i.test(value);
}

function pickAdminNote(
  rows: AdminNoteRow[],
  targetAnswerType: string,
  mode: QuestionMode | string,
) {
  return (
    rows.find((row) => row.answer_type === targetAnswerType && row.Mode_type === mode && (row.note_url || row.path)) ??
    rows.find((row) => row.answer_type === targetAnswerType && (row.note_url || row.path)) ??
    null
  );
}

function githubRefFromUrl(value: string): GithubFileRef | null {
  let url: URL;

  try {
    url = new URL(value);
  } catch {
    return null;
  }

  const segments = url.pathname.split("/").filter(Boolean);

  if (url.hostname === "github.com") {
    const [owner, repo, marker, branch, ...rest] = segments;

    if (!owner || !repo || !branch || !["blob", "tree"].includes(marker)) {
      return null;
    }

    const filePath = rest.join("/");

    return {
      owner,
      repo,
      branch,
      filePath,
      publicUrl: `https://github.com/${owner}/${repo}/blob/${branch}/${filePath}`,
    };
  }

  if (url.hostname === "raw.githubusercontent.com") {
    const [owner, repo, branch, ...rest] = segments;

    if (!owner || !repo || !branch) {
      return null;
    }

    const filePath = rest.join("/");

    return {
      owner,
      repo,
      branch,
      filePath,
      publicUrl: `https://github.com/${owner}/${repo}/blob/${branch}/${filePath}`,
    };
  }

  return null;
}

function combineGithubNotePath(noteUrl: string, path: string): GithubFileRef | null {
  const cleanNoteUrl = cleanNoteValue(noteUrl);
  const cleanPath = cleanNoteValue(path).replace(/\\/g, "/").replace(/^\/+/, "");

  if (!cleanNoteUrl || !cleanPath) {
    return null;
  }

  if (isHttpUrl(cleanPath)) {
    return githubRefFromUrl(cleanPath);
  }

  if (!isHttpUrl(cleanNoteUrl)) {
    return null;
  }

  const baseRef = githubRefFromUrl(cleanNoteUrl);

  if (!baseRef) {
    return null;
  }

  if (/\.[a-z0-9]+$/i.test(baseRef.filePath)) {
    return baseRef;
  }

  if (baseRef.filePath && baseRef.filePath.endsWith(cleanPath)) {
    return baseRef;
  }

  const baseDirectory = baseRef.filePath
    ? baseRef.filePath.slice(0, baseRef.filePath.lastIndexOf("/") + 1)
    : "";
  const filePath = `${baseDirectory}${cleanPath}`.replace(/^\/+/, "");

  return {
    ...baseRef,
    filePath,
    publicUrl: `https://github.com/${baseRef.owner}/${baseRef.repo}/blob/${baseRef.branch}/${filePath}`,
  };
}

async function fetchGithubMarkdown(fileRef: GithubFileRef) {
  const token =
    process.env.GITHUB_TOKEN ??
    process.env.GITHUB_PAT ??
    process.env.NOTES_GITHUB_TOKEN;
  const apiUrl = `https://api.github.com/repos/${fileRef.owner}/${fileRef.repo}/contents/${fileRef.filePath}?ref=${encodeURIComponent(fileRef.branch)}`;
  const response = await fetch(apiUrl, {
    headers: {
      Accept: "application/vnd.github.raw+json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      "X-GitHub-Api-Version": "2022-11-28",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    return {
      content: "",
      status: response.status,
    };
  }

  return {
    content: await response.text(),
    status: response.status,
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const questionId = searchParams.get("questionId")?.trim();
  const mode = searchParams.get("mode")?.trim() || "book-back";
  const language = searchParams.get("language") === "Tamil" ? "Tamil" : "English";
  const type = searchParams.get("type") === "quick_revision" ? "quick_revision" : "theory";

  if (!questionId) {
    return NextResponse.json({ error: "Missing questionId" }, { status: 400 });
  }

  const targetAnswerType = type === "quick_revision"
    ? (language === "English" ? "Eng quick_recall" : "Tam quick_recall")
    : (language === "English" ? "Eng answer" : "Tam answer");

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("admin_notes")
    .select("note_url, path, answer_type, Mode_type")
    .eq("question_id", questionId)
    .returns<AdminNoteRow[]>();

  if (error) {
    return NextResponse.json({ error: "Failed to load notes" }, { status: 500 });
  }

  const note = pickAdminNote(data ?? [], targetAnswerType, mode);

  if (!note) {
    return NextResponse.json({ error: "No notes available" }, { status: 404 });
  }

  const fileRef = combineGithubNotePath(note.note_url ?? "", note.path ?? "");

  if (!fileRef) {
    return NextResponse.json({ error: "Invalid note URL" }, { status: 404 });
  }

  const result = await fetchGithubMarkdown(fileRef);

  if (!result.content) {
    return NextResponse.json(
      {
        error: "Unable to fetch GitHub note",
        githubStatus: result.status,
        sourceUrl: fileRef.publicUrl,
      },
      { status: 404 },
    );
  }

  return NextResponse.json({
    content: result.content,
    sourceUrl: fileRef.publicUrl,
  });
}
