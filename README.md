# GroupFlow - 小組專案管理APP

## 專案動機
在大學期間，學生經常需要參與各類專案開發、小組作業或課堂分組報告。然而，在實際執行的過程中，團隊成員之間常會面臨許多合作上的困難，例如只能依賴群組聊天或線下口頭溝通、工作分配不明確、任務進度難以追蹤等問題。雖然現有的通訊軟體如 LINE、Discord 等方便即時聯絡，卻缺乏針對小組任務排程與進度管理所需的功能，沒辦法有系統的管理整個專案流程。

基於這些問題，我們希望藉由這次的專題開發出一個能夠整合任務管理、進度追蹤與問題討論的平台，幫助使用者在小組中能夠清楚分工、即時更新任務狀況，並有效進行小組內部的溝通與合作，進而提升整體的合作效率與品質。

## Project Proposal
[Miro 討論版](https://miro.com/app/board/uXjVJJWyasA=/?share_link_id=780954911580)

## 安裝與啟動

1. 安裝[Node.js](https://nodejs.org/zh-tw)

2. 安裝Expo
```bash
npm install -g expo-cli
```

3. 安裝依賴套件

```bash
npm install
```

4. 啟動APP

```bash
npx expo start
```

## 啟動後該如何執行

1. 於Windows環境執行：
- 安裝[Android Studio](https://developer.android.com/studio?hl=zh-tw)
- 安裝完後開啟手機模擬器 (Android Studio → More Actions → Virtual Device Manager)
- 在Terminal按下A，模擬器上便會自動安裝Expo Go並開啟APP

2. 於MacOS環境執行：
- TBA?

3. 於手機(Android / IOS)環境執行：
- 在手機上安裝Expo Go應用程式
- 透過手機掃描Terminal中的QR Code便能在Expo Go中開啟APP

## 注意事項與常見問題
- 如果是使用手機環境執行的話，需要注意手機與PC要在同一個Wifi的連接下，否則會無法啟動APP
- 當Expo Go出現一直讀取的畫面時，請將Expo Go關閉並再次開啟APP
- 當開啟APP時，出現Network Request Failed的問題時代表Supabase後端被暫停了，要去後端重新啟用專案