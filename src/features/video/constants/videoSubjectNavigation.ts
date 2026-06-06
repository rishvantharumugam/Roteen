import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import type { ReadonlyURLSearchParams } from "next/navigation";

import {
  prefetchSubjectPanelData,
  titleToSubjectSlug,
  type VideoSubjectFilter,
} from "@/features/video/services/videoSubjectService";
import {
  getSelectedVideoSubject,
  setSelectedVideoSubject,
} from "@/features/video/components/videoSubjectStore";

export type NavigateToVideoSubjectInput = {
  subjectId: string;
  subjectTitle: string;
  subjectStandard?: string | null;
};

export type NavigateToVideoPlaylistInput = {
  playlistId: string;
  subjectId: string;
  subjectTitle: string;
  subjectStandard?: string | null;
};

export function buildVideoSubjectHref(input: NavigateToVideoSubjectInput): string {
  const slug = titleToSubjectSlug(input.subjectTitle);
  const params = new URLSearchParams();
  params.set("subject", slug);
  params.set("subjectId", input.subjectId);
  if (input.subjectStandard?.trim()) {
    params.set("standard", input.subjectStandard.trim());
  }

  return `/video?${params.toString()}`;
}

export function navigateToVideoSubject(
  router: AppRouterInstance,
  input: NavigateToVideoSubjectInput,
): void {
  const subjectSlug = titleToSubjectSlug(input.subjectTitle);
  setSelectedVideoSubject({
    id: input.subjectId,
    slug: subjectSlug,
    name: input.subjectTitle,
    standard: input.subjectStandard?.trim() || null,
  });

  const href = buildVideoSubjectHref(input);
  prefetchSubjectPanelData({
    subjectId: input.subjectId,
    subjectSlug,
    standard: input.subjectStandard ?? null,
  });
  router.push(href);
}

export function prefetchVideoSubjectRoute(
  router: AppRouterInstance,
  input: NavigateToVideoSubjectInput,
): void {
  const subjectSlug = titleToSubjectSlug(input.subjectTitle);

  const href = buildVideoSubjectHref(input);
  router.prefetch(href);
  prefetchSubjectPanelData({
    subjectId: input.subjectId,
    subjectSlug,
    standard: input.subjectStandard ?? null,
  });
}

export function buildVideoPlaylistHref(input: NavigateToVideoPlaylistInput): string {
  const params = new URLSearchParams();
  params.set("playlistId", input.playlistId);
  params.set("subject", titleToSubjectSlug(input.subjectTitle));
  params.set("subjectId", input.subjectId);
  if (input.subjectStandard?.trim()) {
    params.set("standard", input.subjectStandard.trim());
  }
  return `/video?${params.toString()}`;
}

export function navigateToVideoPlaylist(
  router: AppRouterInstance,
  input: NavigateToVideoPlaylistInput,
): void {
  setSelectedVideoSubject({
    id: input.subjectId,
    slug: titleToSubjectSlug(input.subjectTitle),
    name: input.subjectTitle,
    standard: input.subjectStandard?.trim() || null,
  });

  prefetchSubjectPanelData({
    subjectId: input.subjectId,
    subjectSlug: titleToSubjectSlug(input.subjectTitle),
    standard: input.subjectStandard ?? null,
  });

  router.push(buildVideoPlaylistHref(input));
}

export function parseVideoSubjectFilter(
  searchParams: URLSearchParams | ReadonlyURLSearchParams,
): VideoSubjectFilter {
  const subject = searchParams.get("subject");
  const subjectId = searchParams.get("subjectId");
  const standard = searchParams.get("standard");

  if (subjectId || subject || standard) {
    return {
      subjectSlug: subject,
      subjectId,
      standard,
    };
  }

  const cached = getSelectedVideoSubject();
  if (cached) {
    return {
      subjectSlug: cached.slug,
      subjectId: cached.id,
      standard: cached.standard,
    };
  }

  return {
    subjectSlug: null,
    subjectId: null,
    standard: null,
  };
}

export function hasActiveVideoSubjectFilter(filter: VideoSubjectFilter): boolean {
  return Boolean(filter.subjectSlug || filter.subjectId || filter.standard);
}
