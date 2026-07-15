import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

// 전체 재료 가져오기
const fetchAllIngredients = async () => {
  const { data } = await axios.get(
    "https://www.thecocktaildb.com/api/json/v1/1/list.php?i=list",
  );
  return (data.drinks || []).sort((a, b) =>
    a.strIngredient1.localeCompare(b.strIngredient1),
  );
};

// 특정 재료 디테일 가져오기
const fetchIngredientDetail = async (name) => {
  if (!name) return null;
  const { data } = await axios.get(
    `https://www.thecocktaildb.com/api/json/v1/1/search.php?i=${name}`,
  );
  return data.ingredients?.[0] || null;
};

// 해당 재료를 사용하는 칵테일 목록 가져오기
const fetchCocktailsByIngredient = async (name) => {
  if (!name) return [];
  const { data } = await axios.get(
    `https://www.thecocktaildb.com/api/json/v1/1/filter.php?i=${name}`,
  );
  return data.drinks || [];
};

export default function IngredientsPage() {
  const [selectedIngredient, setSelectedIngredient] = useState(null);

  // 1. 전체 재료 목록 로딩
  const { data: ingredientsList = [], isLoading } = useQuery({
    queryKey: ["ingredients-page-list"],
    queryFn: fetchAllIngredients,
    staleTime: Infinity,
  });

  // 2. 선택된 재료의 백과사전 내용 로딩
  const { data: detailData, isLoading: isDetailLoading } = useQuery({
    queryKey: ["ingredient-detail", selectedIngredient],
    queryFn: () => fetchIngredientDetail(selectedIngredient),
    enabled: !!selectedIngredient,
  });

  // 3. 선택된 재료를 쓰는 칵테일들 로딩
  const { data: relatedCocktails = [], isLoading: isRelatedLoading } = useQuery(
    {
      queryKey: ["related-cocktails", selectedIngredient],
      queryFn: () => fetchCocktailsByIngredient(selectedIngredient),
      enabled: !!selectedIngredient,
    },
  );

  return (
    <div className="py-8">
      <div className="mb-10 text-left">
        <h2 className="font-merri text-5xl font-bold mb-2 text-stone-900 dark:text-stone-300">
          THE BASE
        </h2>
      </div>

      {/* 카드 그리드 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
        {ingredientsList.map((item, idx) => {
          const name = item.strIngredient1;
          // 중형 일러스트 매핑 주소
          const imageUrl = `https://www.thecocktaildb.com/images/ingredients/${encodeURIComponent(name)}-Medium.png`;

          return (
            <div
              key={idx}
              onClick={() => setSelectedIngredient(name)}
              className="bg-stone-100 dark:bg-stone-900 p-8 flex flex-col items-center justify-between cursor-pointer transform hover:transition-all group"
            >
              <div className="w-50 flex items-center justify-center mb-8">
                <img
                  src={imageUrl}
                  alt={name}
                  className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform"
                />
              </div>
              <span className="w-full font-merri text-xl text-center font-bold text-stone-800 border-t-1 pt-5 dark:text-stone-200">
                {name}
              </span>
            </div>
          );
        })}
      </div>

      {/* 🌜 스르륵 열리는 재료 디테일 서랍 레이어 (모달) */}
      {selectedIngredient && (
        <div className="fixed inset-0 bg-stone-950/80 backdrop-blur-sm z-50 flex justify-center transition-all duration-500 ">
          <div className="w-full max-w-xl bg-stone-100 dark:bg-stone-800  h-full p-8 flex flex-col justify-between overflow-y-auto">
            <div>
              {/* 헤더 */}
              <div className="flex justify-between items-center mb-6 pb-4 border-b dark:border-b-stone-300">
                <span className="font-outfit text-xl text-stone-800 dark:text-stone-300 uppercase tracking-widest 0font-bold">
                  base detail
                </span>
                <button
                  onClick={() => setSelectedIngredient(null)}
                  className="px-3 py-2 bg-stone-700  hover:bg-stone-800  text-stone-100 dark:text-stone-200 text-sm font-bold transition-colors font-outfit"
                >
                  ✕
                </button>
              </div>

              {/* 기본 프로필 */}
              <div className="grid grid-cols-2 gap-0 py-5 mb-10 place-items-center">
                <img
                  src={`https://www.thecocktaildb.com/images/ingredients/${encodeURIComponent(selectedIngredient)}.png`}
                  alt={selectedIngredient}
                  className="object-contain"
                />
                <div>
                  <h3 className="font-merri text-3xl font-bold text-stone-900 dark:text-stone-200">
                    {selectedIngredient}
                  </h3>
                </div>
              </div>

              {/* 매칭 칵테일들 */}
              <div>
                <h4 className="font-outfit text-ms text-stone-800 dark:text-stone-300 uppercase tracking-widest mb-6">
                  Cocktails with {selectedIngredient}
                </h4>
                {relatedCocktails.length > 0 ? (
                  <div className="grid grid-cols-2 gap-5">
                    {relatedCocktails.map((cocktail, i) => (
                      <div
                        key={i}
                        className="bg-stone-100 dark:bg-stone-900 flex flex-col items-center text-center"
                      >
                        <img
                          src={cocktail.strDrinkThumb}
                          alt={cocktail.strDrink}
                          className="w-full object-cover"
                        />
                        <span className="font-outfit text- text-stone-800 dark:text-stone-200 line-clamp-1 py-5">
                          {cocktail.strDrink}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="font-merri text-stone-500"></p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
