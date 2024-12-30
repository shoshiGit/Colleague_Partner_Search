// מצב התחלתי של מנגנון החיפוש
export const initialState = {
  loading: false, // האם החיפוש מתבצע
  results: [], // תוצאות החיפוש
  value: "", // ערך השדה הנוחכי
};

// רדוסר לחיפוש שמנהל את השינויים במצב
export function SearchReducer(state, action) {
  switch (action.type) {
    // איפוס מצב החיפוש
    case "CLEAN_QUERY":
      return initialState;
    // התחלת חיפוש
    case "START_SEARCH":
      return { ...state, loading: true, value: action.query };
    // סיום חיפוש עם תוצאות
    case "FINISH_SEARCH":
      return { ...state, loading: false, results: action.results };
    // עדכון הערך שנבחר
    case "UPDATE_SELECTION":
      return { ...state, value: action.selection };
    // במקרה של פעולה לא מוכרת
    default:
      throw new Error();
  }
}
