import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  reviewText: "",
  media: null,
  suggestedKeywords: ["tasty", "fresh", "quick delivery"],
  selectedKeywords: [],
  pointsPreview: 0,
};

const reviewSlice = createSlice({
  name: "review",
  initialState,
  reducers: {
    setReviewText: (state, action) => {
      state.reviewText = action.payload;
    },
    setMedia: (state, action) => {
      state.media = action.payload;
    },
    toggleKeyword: (state, action) => {
      const keyword = action.payload;

      if (state.selectedKeywords.includes(keyword)) {
        state.selectedKeywords = state.selectedKeywords.filter(
          (item) => item !== keyword
        );
      } else {
        state.selectedKeywords.push(keyword);
      }
    },
    calculatePointsPreview: (state) => {
      const wordCount = state.reviewText.trim().split(/\s+/).filter(Boolean).length;
      let points = 0;

      if (wordCount >= 10) points += 10;
      if (wordCount >= 20) points += 10;
      points += state.selectedKeywords.length * 5;
      if (state.media) points += 10;

      state.pointsPreview = points;
    },
    clearReview: (state) => {
      state.reviewText = "";
      state.media = null;
      state.selectedKeywords = [];
      state.pointsPreview = 0;
    },
  },
});

export const {
  setReviewText,
  setMedia,
  toggleKeyword,
  calculatePointsPreview,
  clearReview,
} = reviewSlice.actions;

export default reviewSlice.reducer;