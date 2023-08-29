import styled from "@emotion/styled";
import { useState, useEffect, useCallback } from "react";
import WeatherCard from "./WeatherCard";
import { ThemeProvider } from "@emotion/react";
import useWeatherApi from "./useWeatherApi";
import WeatherSetting from "./WeatherSetting";
import { findLocation } from "./utils";

//深淺色主題
const theme = {
  light: {
    backgroundColor: "#ededed",
    foregroundColor: "#f9f9f9",
    boxShadow: "0 1px 3px 0 #999999",
    titleColor: "#212121",
    temperatureColor: "#757575",
    textColor: "#828282",
  },
  dark: {
    backgroundColor: "#1F2022",
    foregroundColor: "#121416",
    boxShadow:
      "0 1px 4px 0 rgba(12, 12, 13, 0.2), 0 0 0 1px rgba(0, 0, 0, 0.15)",
    titleColor: "#f9f9fa",
    temperatureColor: "#dddddd",
    textColor: "#cccccc",
  },
};

const Container = styled.div`
  background-color: ${({ theme }) => theme.backgroundColor};
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

function WeatherApp() {
  const storageCity = localStorage.getItem("cityName");
  // 當前要拉取天氣資訊的地區
  const [currentCity, setCurrentCity] = useState(storageCity || "臺北市");
  // 利用findLocation找到儲存對應縣市名稱的物件（一個API是用"臺北市"，另一個用"臺北"，該物件儲存兩個不同的名字）
  const currentLocation = findLocation(currentCity) || {};
  // 透過custom hook將與Api相關的程式碼移至useWeatherApi，再將需要的資料回傳回來
  const [weatherElement, fetchData, currentTheme] =
    useWeatherApi(currentLocation); //把 currentLocation 當成參數直接傳入 useWeatherApi 的函式內
  // 切換頁面的狀態
  const [currentPage, setCurrentPage] = useState("WeatherCard");

  // 當currentCity改變時，儲存至localStorage中
  useEffect(()=>{
    localStorage.setItem("cityName",currentCity)
  },[currentCity])
  return (
    <ThemeProvider theme={theme[currentTheme]}>
      <Container>
        {currentPage === "WeatherCard" && (
          <WeatherCard
            weatherElement={weatherElement}
            fetchData={fetchData}
            setCurrentPage={setCurrentPage}
            cityName={currentLocation.cityName}
          />
        )}
        {currentPage === "WeatherSetting" && (
          <WeatherSetting
            setCurrentPage={setCurrentPage}
            cityName={currentLocation.cityName}
            setCurrentCity={setCurrentCity}
          />
        )}
      </Container>
    </ThemeProvider>
  );
}

export default WeatherApp;
