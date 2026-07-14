import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { type NoteTag } from "@/types/note";
import NotesClient from "./Notes.client";
import { fetchNotes } from "@/lib/api";
import { makeQueryClient } from "@/lib/queryClient";

const PER_PAGE = 12;

interface FilterNotesPageProps {
  params: Promise<{
    slug: string[];
  }>;
}

const isTag = (value: string): value is NoteTag => {
  return ["Todo", "Work", "Personal", "Meeting", "Shopping"].includes(value);
};

export default async function FilterNotesPage({
  params,
}: FilterNotesPageProps) {
  const { slug } = await params;
  const routeTag = slug[0] ?? "all";
  const tag: NoteTag | "all" =
    routeTag === "all" ? "all" : isTag(routeTag) ? routeTag : "all";

  const queryClient = makeQueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["notes", 1, "", tag],
    queryFn: () =>
      fetchNotes({
        page: 1,
        perPage: PER_PAGE,
        search: "",
        tag,
      }),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <NotesClient tag={tag} />
    </HydrationBoundary>
  );
}
