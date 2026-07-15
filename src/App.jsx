import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import axios, { isAxiosError } from "axios";
import { useEffect, useState } from "react";

import CocktailCard from "./components/CocktailCard";
import Nav from "./components/Nav";
import IngredientsPage from "./components/Base";

// 1. 무한 스크롤 API
const fetchCocktails = async ({ pageParam = "a" }) => {
  const { data } = await axios.get(
    `https://www.thecocktaildb.com/api/json/v1/1/search.php?f=${pageParam}`,
  );
  return { drinks: data.drinks || [], currentLetter: pageParam };
};

// 2. 검색 전용 API
const fetchSearchCocktails = async (keyword) => {
  if (!keyword) return [];
  const { data } = await axios.get(
    `https://www.thecocktaildb.com/api/json/v1/1/search.php?s=${keyword}`,
  );
  return data.drinks || [];
};

// 3. 재료 전용 API
const fetchFilterCocktails = async (ingredient) => {
  if (!ingredient) return [];
  const { data } = await axios.get(
    `https://www.thecocktaildb.com/api/json/v1/1/filter.php?i=${ingredient}`,
  );
  return data.drinks || [];
};

const fetchAllIngredients = async () => {
  const { data } = await axios.get(
    "https://www.thecocktaildb.com/api/json/v1/1/list.php?i=list",
  );
  return (data.drinks || []).sort((a, b) =>
    a.strIngredient1.localeCompare(b.strIngredient1),
  );
};

function App() {
  // 무한 스크롤 감시 레이더 센서
  const { ref, inView } = useInView();

  // 검색어 상태 저장
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedIngredient, setSelectedIngredient] = useState("");

  //화면 모드 상태 all and my bar
  const [viewMode, setViewMode] = useState("all");

  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem("cocktail-theme");
    return saved === "dark";
  });

  useEffect(() => {
    localStorage.setItem("cocktail-theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  const [bookmarks, setBookmarks] = useState(() => {
    const saved = localStorage.getItem("my-cocktail-bar");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("my-cocktail-bar", JSON.stringify(bookmarks));
  }, [bookmarks]);

  //북마크 토글 함수
  const handleToggleBookmark = (cocktail) => {
    setBookmarks((prev) => {
      const isExist = prev.some((item) => item.idDrink === cocktail.idDrink);
      if (isExist) {
        return prev.filter((item) => item.idDrink !== cocktail.idDrink);
      } else {
        return [...prev, cocktail];
      }
    });
  };

  const ingredientQuery = useQuery({
    queryKey: ["all-ingredients"],
    queryFn: fetchAllIngredients,
    staleTime: Infinity,
  });

  // 탠스택 무한 스크롤 쿼리 세팅 (검색어가 없을 때만 작동)
  const infiniteQuery = useInfiniteQuery({
    queryKey: ["official-infinite-cocktails"],
    queryFn: fetchCocktails,
    initialPageParam: "a",
    getNextPageParam: (lastPage) => {
      const current = lastPage?.currentLetter;
      if (!current || current === "z") return undefined;
      return String.fromCharCode(current.charCodeAt(0) + 1);
    },
    enabled: !searchKeyword && !selectedIngredient,
  });

  // 검색 전용 단일 쿼리 세팅 (검색어가 있을 때만 작동)
  const searchQuery = useQuery({
    queryKey: ["search-cocktails", searchKeyword],
    queryFn: () => fetchSearchCocktails(searchKeyword),
    enabled: !!searchKeyword,
  });

  const filterQuery = useQuery({
    queryKey: ["filter-cocktails", selectedIngredient],
    queryFn: () => fetchFilterCocktails(selectedIngredient),
    enabled: !searchKeyword && !!selectedIngredient,
  });

  // 바닥 요소가 화면에 걸리면 리로드!
  useEffect(() => {
    if (
      inView &&
      infiniteQuery.hasNextPage &&
      !searchKeyword &&
      !selectedIngredient
    ) {
      infiniteQuery.fetchNextPage();
    }
  }, [
    inView,
    infiniteQuery.hasNextPage,
    infiniteQuery.fetchNextPage,
    searchKeyword,
    selectedIngredient,
  ]);

  // 로딩 및 에러 상태 통합 관리
  const isLoading = searchKeyword
    ? searchQuery.isLoading
    : selectedIngredient
      ? filterQuery.isLoading
      : infiniteQuery.isLoading;

  const isError = searchKeyword
    ? searchQuery.isError
    : selectedIngredient
      ? filterQuery.isError
      : infiniteQuery.isError;

  return (
    <div className={isDarkMode ? "dark" : ""}>
      <div className="bg-stone-300  min-h-screen pb-10 dark:bg-stone-800">
        <div className="container max-w-6xl mx-auto px-4">
          <Nav
            selectedIngredient={selectedIngredient}
            viewMode={viewMode}
            onViewModeChange={(mode) => {
              setViewMode(mode);
              if (mode === "mybar") {
                setSearchKeyword("");
                setSelectedIngredient("");
              }
            }}
            onSearch={(word) => {
              setSearchKeyword(word);
              setSelectedIngredient("");
              setViewMode("all");
            }}
            onFilter={(ingredient) => {
              setSelectedIngredient(ingredient);
              setSearchKeyword("");
              setViewMode("all");
            }}
            ingredientsList={ingredientQuery.data || []}
            isDarkMode={isDarkMode}
            setIsDarkMode={setIsDarkMode}
          />

          <div
            className={`${viewMode == "ingredients" ? "" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mx-auto mt-10"}`}
          >
            {viewMode === "ingredients" ? (
              <IngredientsPage />
            ) : viewMode === "mybar" ? (
              // 찜 목록
              bookmarks.length > 0 ? (
                bookmarks.map((cocktail) => (
                  <CocktailCard
                    key={cocktail.idDrink}
                    data={cocktail}
                    isBookmarked={true}
                    onToggleBookmark={handleToggleBookmark}
                  />
                ))
              ) : (
                <div className="col-span-full text-center py-20 text-stone-500 font-bold font-merri">
                  진열장에 보관한 칵테일이 없습니다.
                </div>
              )
            ) : searchKeyword ? (
              // 검색 결과
              searchQuery.data?.map((cocktail) => (
                <CocktailCard
                  key={cocktail.idDrink}
                  data={cocktail}
                  isBookmarked={bookmarks.some(
                    (b) => b.idDrink === cocktail.idDrink,
                  )}
                  onToggleBookmark={handleToggleBookmark}
                />
              ))
            ) : selectedIngredient ? (
              // 재료
              filterQuery.data?.map((cocktail) => (
                <CocktailCard
                  key={cocktail.idDrink}
                  data={cocktail}
                  isBookmarked={bookmarks.some(
                    (b) => b.idDrink === cocktail.idDrink,
                  )}
                  onToggleBookmark={handleToggleBookmark}
                />
              ))
            ) : (
              // 무한 스크롤
              infiniteQuery.data?.pages.map((page) =>
                page.drinks
                  .slice(0, 12)
                  .map((cocktail) => (
                    <CocktailCard
                      key={cocktail.idDrink}
                      data={cocktail}
                      isBookmarked={bookmarks.some(
                        (b) => b.idDrink === cocktail.idDrink,
                      )}
                      onToggleBookmark={handleToggleBookmark}
                    />
                  )),
              )
            )}
          </div>
        </div>

        {/* 바닥 트리거 */}
        {!searchKeyword && (
          <div
            ref={ref}
            className="h-24 flex justify-center items-center mt-10"
          >
            {infiniteQuery.isFetchingNextPage && (
              <p className="font-merri text-stone-500 font-semibold animate-pulse">
                칵테일 제조 중 . . .
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
