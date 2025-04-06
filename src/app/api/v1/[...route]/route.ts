import {
  fetchAnimeByCategories,
  fetchAnimeEpisodesById,
  fetchAnimeEpisodeServers,
  fetchAnimeInfoByAnimeId,
  fetchAnimeScheduleByDate,
  fetchAnimeStreamingLinksByEpisodeId,
  fetchSearchedAnimeByName,
  getAnimeHomePage,
} from "@/app/api/v1/controller/anime";
import { createRoutePath, generateUniqueKey } from "@/lib/utils";
import {
  AnimeEpisodes,
  AnimeInfo,
  AnimeStreamingLinks,
  HomePage,
} from "@/types/anime";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ route: string[] }> },
) {
  const route = (await params).route;
  const searchParams = req.nextUrl.searchParams;
  const pathname = createRoutePath(route);

  switch (pathname) {
    case "/home": {
      const data: HomePage = await getAnimeHomePage();
      return NextResponse.json(data, { status: 200 });
    }

    case "/anime": {
      const animeId = searchParams.get("id");
      if (!animeId) {
        return NextResponse.json({ message: "Invalid Id!" }, { status: 500 });
      }

      const animeInfo: AnimeInfo = await fetchAnimeInfoByAnimeId(animeId);
      return NextResponse.json(animeInfo, { status: 200 });
    }

    case "/episodes": {
      const animeId = searchParams.get("id");
      if (!animeId) {
        return NextResponse.json({ message: "Invalid Id!" }, { status: 500 });
      }

      const animeEpisodes: AnimeEpisodes = await fetchAnimeEpisodesById(animeId);
      return NextResponse.json(animeEpisodes, { status: 200 });
    }

    case "/anime/sources": {
      const episodeId = searchParams.get("episodeId");
      const category = searchParams.get("category");
      const server = searchParams.get("server");

      const constructedId = `${episodeId}&category=${category}&server=${server}`;
      if (!episodeId) {
        return NextResponse.json({ message: "Invalid Episode ID!" }, { status: 500 });
      }

      const response: AnimeStreamingLinks = await fetchAnimeStreamingLinksByEpisodeId(constructedId);
      return NextResponse.json(response, { status: 200 });
    }

    case "/anime/episode/servers": {
      const id = searchParams.get("id");
      if (!id) {
        return NextResponse.json({ message: "Invalid Id!" }, { status: 500 });
      }

      const servers = await fetchAnimeEpisodeServers(id);
      return NextResponse.json(servers, { status: 200 });
    }

    case "/anime/schedule": {
      const date = searchParams.get("date");
      if (!date) {
        return NextResponse.json({ message: "Date is required!" }, { status: 500 });
      }

      const scheduledAnime = await fetchAnimeScheduleByDate(date);
      return NextResponse.json(scheduledAnime, { status: 200 });
    }

    case "/anime/search": {
      const keyword = searchParams.get("keyword");
      const page = searchParams.get("page") || "1";

      if (!keyword) {
        return NextResponse.json({ message: "Searched keyword is required!" }, { status: 500 });
      }

      const searchedAnimes = await fetchSearchedAnimeByName({
        keyword,
        page: Number(page),
      });

      return NextResponse.json(searchedAnimes, { status: 200 });
    }

    case "/anime/category": {
      const slug = searchParams.get("slug");
      const page = searchParams.get("page") || "1";

      if (!slug) {
        return NextResponse.json({ message: "Slug is required!" }, { status: 500 });
      }

      const animes = await fetchAnimeByCategories(slug, Number(page));
      return NextResponse.json(animes, { status: 200 });
    }

    default:
      return NextResponse.json({ message: "Unknown route" });
  }
}
