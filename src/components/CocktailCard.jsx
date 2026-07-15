import React, { useState } from "react";
import { useInView } from "react-intersection-observer";
import plus from "../assets/plus.png";
import on from "../assets/on.png";
import off from "../assets/off.png";

export default function CocktailCard({ data, isBookmarked, onToggleBookmark }) {
  if (!data) return null;

  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  // false: 앞면, true: 정보
  const [showInfo, setShowInfo] = useState(false);

  // 재료와 계량(Measure) 정보를 묶어서 정밀 가공
  const ingredients = [];
  for (let i = 1; i <= 15; i++) {
    const ingredient = data[`strIngredient${i}`];
    const measure = data[`strMeasure${i}`];
    if (ingredient) {
      ingredients.push(`${ingredient} ${measure ? `(${measure.trim()})` : ""}`);
    }
  }

  return (
    <div
      ref={ref}
      className={`w-full h-150 overflow-hidden flex flex-col justify-between relative bg-stone-100 group transition-all duration-700 ease-out ${
        inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
      }`}
    >
      {/* 상단 이미지 영역 */}
      <div className="w-full h-full flex flex-col justify-between">
        <div className="h-120 overflow-hidden relative">
          <img
            src={data.strDrinkThumb}
            alt={data.strDrink}
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
          />

          {/*'더보기' 버튼 */}
          <button
            onClick={() => setShowInfo(true)}
            className="absolute top-4 right-4 px-3 py-3 bg-stone-800 hover:bg-stone-950 text-stone-100 text-sm font-semibold tracking-wider  transition-colors z-5 opacity-75 cursor-pointer"
          >
            <img src={plus} alt="" className="w-5" />
          </button>
        </div>

        {/* 하단 정보 */}
        <div className="absolute font-semibold inset-x-0 bottom-0 z-10 p-5 bg-stone-100">
          <div className="flex justify-between border-b ">
            <h1 className="font-merri w-full text-3xl text-stone-900 pb-4 tracking-wide">
              {data.strDrink}
            </h1>

            {/* '찜하기' 버튼 */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleBookmark(data);
              }}
              className="h-9 transition-all cursor-pointer px-2"
            >
              {isBookmarked ? (
                <img src={on} className="w-6" />
              ) : (
                <img src={off} className="w-6" />
              )}
            </button>
          </div>

          <p className="font-outfit w-50 text-stone-500 pt-5 text-sm uppercase tracking-wider">
            {data.strCategory}
          </p>
        </div>
      </div>

      <div
        className={`z-5 absolute inset-0 w-full h-120 bg-stone-950/95 p-6 flex flex-col justify-between transition-all duration-500 ease-in-out ${
          showInfo
            ? "opacity-85 pointer-events-auto backdrop-blur-sm"
            : "opacity-0 pointer-events-none"
        }`}
      >
        {/* 상단 헤더 & 닫기 */}
        <div className="overflow-y-auto pr-1 custom-scrollbar">
          <div className="flex justify-between items-center mb-6 pb-3">
            <button
              onClick={() => setShowInfo(false)}
              className="absolute top-4 right-4 px-3.5 py-2 bg-stone-200 hover:bg-stone-300 text-stone-700 text-lg font-bold transition-colors cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* 📋 재료 목록 구역 */}
          <div className="container mb-6 ">
            <h3 className="font-outfit text-[15px] font-bold text-stone-300 uppercase tracking-widest mb-3">
              Ingredients
            </h3>
            <ul className="font-outfit space-y-2 text-[17px] text-stone-300 list-none">
              {ingredients.map((item, i) => (
                <li key={i} className="py-2">
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* 📝 제조 방법 구역 */}
          <div>
            <p className="font-merri text-stone-300 text-[17px] leading-relaxed pt-7 border-t-1">
              {data.strInstructions || "Mix gently and enjoy."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
