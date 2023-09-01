import React, { useState, useEffect, useCallback } from "react";

// 不會setState的函式就放組件外面，避免每次，避免每次重新渲染時都會重新定義
const fetchCurrentWeather = async (locationName) => {
  // 讓此函式回傳Promise值
  return fetch(
    `https://opendata.cwb.gov.tw/api/v1/rest/datastore/O-A0003-001?Authorization=CWB-32C90A51-48E3-449D-86F7-412E5E24C13B&locationName=${locationName}`
  )
    .then((response) => response.json())
    .then((data) => {
      const locationData = data.records.location[0];
      // console.log(locationData);
      // 將風速（WDSD）、氣溫（TEMP）和濕度（HUMD）的資料取出
      // 使用reduce並搭配includes確認是否含有關鍵字，若有則將elementName作為key，elementValue作為value，傳進物件neededElements中
      const weatherElements = locationData.weatherElement.reduce(
        (neededElements, item) => {
          if (["WDSD", "TEMP", "HUMD", "Weather"].includes(item.elementName)) {
            neededElements[item.elementName] = item.elementValue;
          }
          return neededElements;
        },
        {}
      );
      // console.log(weatherElements);

      // 把取得資料回傳出去
      return {
        observationTime: locationData.time.obsTime,
        locationName: locationData.locationName,
        temperature: weatherElements.TEMP,
        windSpeed: weatherElements.WDSD,
        humid: weatherElements.HUMD,
      };
    });
};

const fetchWeatherForecast = async (cityName) => {
  // 讓此函式回傳Promise值
  return fetch(
    `https://opendata.cwb.gov.tw/api/v1/rest/datastore/F-C0032-001?Authorization=CWB-32C90A51-48E3-449D-86F7-412E5E24C13B&locationName=${cityName}`
  )
    .then((response) => response.json())
    .then((data) => {
      const locationData = data.records.location[0];
      const weatherElements = locationData.weatherElement.reduce(
        (neededElements, item) => {
          if (["Wx", "PoP", "CI"].includes(item.elementName)) {
            neededElements[item.elementName] = item.time[0].parameter;
          }
          return neededElements;
        },
        {}
      );
      return {
        description: weatherElements.Wx.parameterName,
        weatherCode: weatherElements.Wx.parameterValue,
        rainPossibility: weatherElements.PoP.parameterName,
        comfortIndex: weatherElements.CI.parameterName,
      };
    });
};

// 利用API獲得今天日出日落時間，並判斷是現在是白天還晚上
const fetchMoment = async (cityName) => {
  // 得到今天日期 格式yyyy-mm-dd
  const now = new Date();
  const nowDate = Intl.DateTimeFormat("zh-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .format(now)
    .replace(/\//g, "-");

  return fetch(
    `https://opendata.cwb.gov.tw/api/v1/rest/datastore/A-B0062-001?Authorization=CWB-32C90A51-48E3-449D-86F7-412E5E24C13B&limit=10&CountyName=${cityName}&parameter=SunRiseTime,SunSetTime&timeFrom=${nowDate}`
  )
    .then((response) => response.json())
    .then((data) => {
      const todayData = data.records.locations.location[0].time[0];
      const sunRiseTimeStamp = new Date(nowDate + " " + todayData.SunRiseTime);
      const sunSetTimeStamp = new Date(nowDate + " " + todayData.SunSetTime);
      // 若時間介於日出時間到日落時間＝>代表現在是白天
      return sunRiseTimeStamp <= now && now <= sunSetTimeStamp
        ? { moment: "day" }
        : { moment: "night" };
    });
};

const useWeatherApi = (currentLocation) => {
  const { cityName, locationName } = currentLocation;
  // 預設值
  const [weatherElement, setWeatherElement] = useState({
    observationTime: new Date(),
    locationName: "",
    description: "",
    temperature: 0,
    windSpeed: 0,
    humid: 0,
    weatherCode: 0,
    rainPossibility: 0,
    comfortIndex: 0,
    moment: "day",
    isLoading: true,
  });
  // 利用解構賦值取值
  const { moment } = weatherElement;

  const [currentTheme, serCurrentTheme] = useState("light");

  // 使用useCallback保存函式fetchingData，讓其在Function Component被呼叫時不被重新定義
  const fetchData = useCallback(() => {
    // 因資料較少，讓三筆資料同時出現，使用體驗較佳
    // 定義一個非同步函式，讓fetchCurrentWeather()、fetchWeatherForecast()、fetchMoment()的API都回傳成功才繼續執行
    const fetchingData = async () => {
      const [currentWeather, weatherForecast, currentMoment] =
        await Promise.all([
          fetchCurrentWeather(locationName), //API網址使用"臺北" => locationName
          fetchWeatherForecast(cityName), //API網址使用"臺北市" => cityName
          fetchMoment(cityName), //API網址使用"臺北市" => cityName
        ]);

      // 用prevState先取出舊資料再進行更改，避免有key-value缺失
      // 例如不同API更新物件裡的不同key-value，放進新資料而未保存舊資料，此處因三個API同時setState可以不用這樣做
      // setWeatherElement((prevState) => ({
      //   ...prevState,
      //   ...currentWeather,
      //   ...weatherForecast,
      //   ...currentMoment,
      // }));
      setWeatherElement({
        ...currentWeather,
        ...weatherForecast,
        ...currentMoment,
        isLoading: false,
      });
    };
    setWeatherElement((prevState) => {
      return {
        ...prevState,
        isLoading: true, //載入中
      };
    });
    fetchingData();
  }, [locationName, cityName]);

  // locationName 或 cityName 改變時，fetchData 就會改變，此時 useEffect 內的函式就會再次執行，拉取最新的天氣資料
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // moment改變時改變主題顏色
  useEffect(() => {
    serCurrentTheme(moment === "day" ? "light" : "dark");
  }, [moment]);

  return [weatherElement, fetchData, currentTheme];
};

export default useWeatherApi;
