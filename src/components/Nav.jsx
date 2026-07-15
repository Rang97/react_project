import React, { useState } from "react";
import drink from "../assets/drink.png";
import search from "../assets/search.png";
import plus from "../assets/plus.png";
import bg_1 from "../assets/bg_1.png";
import bg_2 from "../assets/bg_2.png";

function Nav({
  onSearch,
  onFilter,
  selectedIngredient,
  viewMode,
  onViewModeChange,
  isDarkMode,
  setIsDarkMode,
}) {
  const [keyword, setKeyword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(keyword.trim());
  };

  return (
    <nav>
      <div className="font-outfit text-xl flex w-full gap-10 bg-stone-900 text-stone-100 py-5 px-8 ">
        <button
          onClick={() => onViewModeChange("all")}
          className="hover:text-stone-500 transition-colors"
        >
          LOUNGE
        </button>

        <button
          onClick={() => onViewModeChange("ingredients")}
          className="hover:text-stone-500 transition-colors"
        >
          BASE
        </button>

        <button
          onClick={() => onViewModeChange("mybar")}
          className="hover:text-stone-500 transition-colors"
        >
          MY BAR
        </button>
      </div>

      <div className="relative">
        <h1 className=" relative z-10 font-merri text-9xl pl-5 py-25 text-stone-900">
          Cocktail <br /> for everyone
        </h1>
        <img
          src={bg_2}
          alt=""
          className="absolute z-0 top-0 right-0 w-120 sm:w-150"
        />
      </div>

      {/* 검색창 */}
      <div className="flex w-full ml-auto justify-end border-b border-t py-6">
        <form
          onSubmit={handleSubmit}
          className="flex items-right justify-end max-w-8xl mr-5"
        >
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="칵테일 찾기"
            className="font-outfit w-full sm:w-72 px-5 border border-stone-900 text-stone-900 text-ms focus:outline-none focus:bg-stone-300 transition-colors placeholder:text-stone-500"
          />
          <button
            type="submit"
            className="font-outfit px-4 py-4 border border-stone-900 bg-stone-900 hover:bg-stone-800 active:scale-95 text-stone-50 text-base"
          >
            <img src={search} className="w-6" />
          </button>
        </form>

        {/* 재료 선택 드롭다운 */}
        <select
          value={selectedIngredient}
          onChange={(e) => {
            onFilter(e.target.value);
            setKeyword("");
          }}
          className="font-outfit px-5 py-2  bg-stone-900 text-stone-50 border border-stone-900 text-base focus:outline-none cursor-pointer    "
        >
          <option value="">전체 보기 ALL</option>
          <option value="Vodka">보드카 VODKA</option>
          <option value="Rum">럼 RUM</option>
          <option value="Gin">진 GIN</option>
          <option value="Tequila">데킬라 TEQUILA</option>
          <option value="Whiskey">위스키 WHISKEY</option>
          <option value="Brandy">브랜디 BRANDY</option>
        </select>
      </div>
    </nav>
  );
}

export default Nav;
