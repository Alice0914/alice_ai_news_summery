# 🔥 Firebase Firestore 데이터 저장 가이드

## 1. 데이터 구조 (Schema)

Firestore에 저장될 하나의 뉴스 문서(Document) 구조입니다.
**핵심:** 검색 필터로 사용될 `categories`, `productServices`, `coreElements`는 반드시 **배열(Array)** 형태로 저장해야 합니다.

**Collection:** `news` (모든 뉴스는 이 컬렉션 안에 저장)

```json
// 문서 ID (자동 생성 또는 지정): "news_abc123"
{
  "title": "OpenAI, GPT-5 베타 테스트 시작",
  "summary": "OpenAI가 차세대 언어모델...",
  "source": "TechCrunch",
  "sourceUrl": "[https://techcrunch.com/](https://techcrunch.com/)...",
  
  // 날짜: Firestore Timestamp 객체 또는 ISO String 사용 권장
  // 정렬("최신순")을 위해 필수입니다.
  "publishedDate": "2025-11-24T10:00:00Z", 
  
  // 정렬용 숫자 데이터
  "likes": 856,
  "shareCount": 154,

  // [중요] 인기순 정렬 최적화 필드 (Pre-calculated Field)
  // 매번 (likes + shareCount)를 계산하면 비효율적이므로, 저장할 때 미리 합산해둡니다.
  // 공식: (likes * 1) + (shareCount * 5) 처럼 가중치를 줄 수도 있습니다.
  "popularityScore": 1626, 
  
  // [필수] 필터링용 태그 배열 (정확한 매칭을 위해 ID나 영문 코드 권장)
  "categories": ["business", "tech_ai"],
  "productServices": ["text_ai", "agent_ai"],
  "coreElements": ["algorithm", "compute"],
  
  //[선택] 키워드 검색 보조용 (소문자로 변환하여 저장)
  "searchKeywords": ["openai", "gpt-5", "sam altman", "beta"]
}
```

---

## 2. 데이터 저장 코드 예시 (초기 데이터 생성)

Firebase v9+ SDK를 사용하여 데이터를 저장하는 함수입니다.

```javascript
import { db } from './firebaseConfig'; // Firebase 초기화 파일 import
import { collection, addDoc, serverTimestamp } from "firebase/firestore"; 

const addNewsItem = async (newsData) => {
  try {
    // 인기 점수 미리 계산 (읽기 효율성 극대화)
    const likes = newsData.likes || 0;
    const shares = newsData.shareCount || 0;
    // 예: 공유에 가중치 2배 부여 (공식은 변경 가능)
    const popularityScore = likes + (shares * 2);

    // 'news' 컬렉션에 데이터 추가
    const docRef = await addDoc(collection(db, "news"), {
      title: newsData.title,
      summary: newsData.summary,
      source: newsData.source,
      sourceUrl: newsData.sourceUrl,
      
      // 날짜는 정렬을 위해 Date 객체나 ISO String으로 변환
      publishedDate: new Date(newsData.date).toISOString(), 
      
      // 통계
      likes: likes,
      shareCount: shares,
      popularityScore: popularityScore, // 정렬용 필드 저장
      
      // 필터링 태그들 (배열)
      categories: newsData.categories, 
      productServices: newsData.productServices,
      coreElements: newsData.coreElements,
      
      // 생성 시간 (메타 데이터)
      createdAt: serverTimestamp()
    });
    
    console.log("Document written with ID: ", docRef.id);
  } catch (e) {
    console.error("Error adding document: ", e);
  }
}
```

---

## 3. 데이터 업데이트 (좋아요 버튼 클릭 시)

사용자가 '좋아요'를 누르면 `likes`만 올리는 게 아니라 `popularityScore`도 함께 업데이트해야 합니다.

```javascript
import { doc, runTransaction } from "firebase/firestore";
import { db } from './firebaseConfig';

const handleLike = async (newsId) => {
  const newsRef = doc(db, "news", newsId);

  try {
    await runTransaction(db, async (transaction) => {
      // 1. 현재 문서 가져오기
      const newsDoc = await transaction.get(newsRef);
      if (!newsDoc.exists()) {
        throw "Document does not exist!";
      }

      // 2. 현재 값 읽기
      const currentLikes = newsDoc.data().likes || 0;
      const currentShares = newsDoc.data().shareCount || 0;

      // 3. 새로운 값 계산
      const newLikes = currentLikes + 1;
      const newScore = newLikes + (currentShares * 2); // 인기 점수 재계산

      // 4. 동시에 업데이트 (Atomic Update)
      transaction.update(newsRef, { 
        likes: newLikes,
        popularityScore: newScore
      });
    });
    console.log("Likes & Score updated successfully!");
  } catch (e) {
    console.error("Transaction failed: ", e);
  }
};
```

---

## 4. 저장 시 주의사항 (인덱스 설정)

데이터를 저장한 후, 앱에서 특정 조건으로 데이터를 불러오려면 **복합 인덱스(Composite Index)**가 필요합니다. 앱 실행 중 콘솔의 에러 링크를 클릭하면 자동 생성됩니다.

**A. "지난 7일간 비즈니스 카테고리 최신순" 쿼리용 인덱스**
* 쿼리: `.where('categories', 'array-contains', 'business').where('publishedDate', '>=', '7daysAgo').orderBy('publishedDate', 'desc')`
* **필요 인덱스:** `categories` (Arrays) + `publishedDate` (Descending)
    * 설명: `categories` 배열 안에 특정 값이 있고, `publishedDate`으로 범위 검색 및 정렬을 동시에 수행하기 위함입니다.

**B. "인기순(좋아요+공유) 정렬" 쿼리용 인덱스**
* 쿼리: `.orderBy('popularityScore', 'desc')` (단순 정렬은 인덱스 불필요)
* 복합 쿼리: `.where('categories', 'array-contains', 'business').orderBy('popularityScore', 'desc')`
* **필요 인덱스:** `categories` (Arrays) + `popularityScore` (Descending)

**C. 기타 추천 인덱스 조합**
1. `productServices` (Arrays) + `publishedDate` (Descending)
2. `coreElements` (Arrays) + `publishedDate` (Descending)
