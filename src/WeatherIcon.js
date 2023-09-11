import React, { useState, useEffect, useMemo } from "react";
import styled from "@emotion/styled";
import { ReactComponent as DayThunderstorm } from "./images/day-thunderstorm.svg";
import { ReactComponent as DayClear } from "./images/day-clear.svg";
import { ReactComponent as DayCloudyFog } from "./images/day-cloudy-fog.svg";
import { ReactComponent as DayCloudy } from "./images/day-cloudy.svg";
import { ReactComponent as DayFog } from "./images/day-fog.svg";
import { ReactComponent as DayPartiallyClearWithRain } from "./images/day-partially-clear-with-rain.svg";
import { ReactComponent as DaySnowing } from "./images/day-snowing.svg";
import { ReactComponent as NightThunderstorm } from "./images/night-thunderstorm.svg";
import { ReactComponent as NightClear } from "./images/night-clear.svg";
import { ReactComponent as NightCloudyFog } from "./images/night-cloudy-fog.svg";
import { ReactComponent as NightCloudy } from "./images/night-cloudy.svg";
import { ReactComponent as NightFog } from "./images/night-fog.svg";
import { ReactComponent as NightPartiallyClearWithRain } from "./images/night-partially-clear-with-rain.svg";
import { ReactComponent as NightSnowing } from "./images/night-snowing.svg";

const IconContainer = styled.div`
  flex-basis: 30%;

  svg {
    max-height: 110px;
  }
`;

// 將WeatherCode分類
const weatherTypes = {
  isThunderstorm: [15, 16, 17, 18, 21, 22, 33, 34, 35, 36, 41],
  isClear: [1],
  isCloudyFog: [25, 26, 27, 28],
  isCloudy: [2, 3, 4, 5, 6, 7],
  isFog: [24],
  isPartiallyClearWithRain: [
    8, 9, 10, 11, 12, 13, 14, 19, 20, 29, 30, 31, 32, 38, 39,
  ],
  isSnowing: [23, 37, 42],
};

// 將code轉為type字串
const weatherCode2Type = (weatherCode) => {
  // Object.entries：將物件變為[[key, value], [key, value],...]的陣列，再利用find尋找此陣列中含有weatherCode的item
  // 解構賦值將find的參數item換成[weatherType,weatherCodes]，如此便可直接使用weatherCodes這個陣列來使用includes
  // 等式右邊會返回符合條件的[weatherType,weatherCodes]，因此等式左邊使用解構賦值取得天氣種類就好
  // 以防都找不到會返回undefined所以加上|| []（undefined在布林值判斷中會轉為false）
  const [weatherType] =
    Object.entries(weatherTypes).find(
      ([weatherType, weatherCodes]) =>
        weatherCodes.includes(Number(weatherCode)) //從props傳入的currentWeatherIcon是string，而weatherCodes裡的是number
    ) || [];
  return weatherType;
};

// 白天夜晚會有不同Icon
const weatherIcons = {
  day: {
    isThunderstorm: <DayThunderstorm />,
    isClear: <DayClear />,
    isCloudyFog: <DayCloudyFog />,
    isCloudy: <DayCloudy />,
    isFog: <DayFog />,
    isPartiallyClearWithRain: <DayPartiallyClearWithRain />,
    isSnowing: <DaySnowing />,
  },
  night: {
    isThunderstorm: <NightThunderstorm />,
    isClear: <NightClear />,
    isCloudyFog: <NightCloudyFog />,
    isCloudy: <NightCloudy />,
    isFog: <NightFog />,
    isPartiallyClearWithRain: <NightPartiallyClearWithRain />,
    isSnowing: <NightSnowing />,
  },
};

const WeatherIcon = ({ currentWeatherCode, moment }) => {
  const [currentWeatherIcon, setCurrentWeatherIcon] = useState("isClear");
  
  // 用useMemo紀錄weatherCode2Type回傳的值
  // 在dependencies放入currentWeatherCode，當currentWeatherCode改變，weatherCode2Type就會重新計算
  const theWeatherIcon = useMemo(
    () => weatherCode2Type(currentWeatherCode),
    [currentWeatherCode]
  );

  useEffect(() => {
    setCurrentWeatherIcon(theWeatherIcon);
  }, [theWeatherIcon]); //dependencies放入useMemo的值

  return (
    <IconContainer>{weatherIcons[moment][currentWeatherIcon]}</IconContainer>
  );
};

export default WeatherIcon;