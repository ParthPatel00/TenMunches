# TenMunches 🍽️

**Live Demo → **https://ten-munches.vercel.app/**

---

## 📍 Overview

TenMunches is a beautifully designed, one-page web experience that helps users explore the **top 10 places to eat and drink in San Francisco** — across 20 curated categories like coffee, sushi, vegan, brunch, and more.

It uses AI-curated insights from real user reviews and web articles to surface what makes each place stand out.

---

## 💡 Highlights

- ⚡️ **Explore SF’s best food & drink spots** across 20 categories
- 🧠 **AI-curated insights** from 10,000+ Google reviews and 200+ articles
- ✨ **Elegant UI** with animated cards, scroll interaction, and a seamless mobile experience
- 🔎 **Custom sentiment analysis pipeline** extracts meaningful testimonials using Python NLP
- 📸 Includes business images and direct Google Maps links
- 🚀 Built & deployed solo from scratch (frontend + backend)

---

## 🛠️ Tech Stack

### Frontend
- [React](https://reactjs.org/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/) – for smooth animations
- Deployed via [Vercel](https://vercel.com/)

### Backend / Data
- Python scripts using:
  - Google Places API (business data, reviews, photos)
  - Custom NLP pipeline with TextBlob (sentiment + theme extraction)
  - Web scraping for article mentions
- Final data exported to JSON and consumed by the frontend

---

## ⚙️ How It Works

1. **Collects** businesses from Google Places API for each category
2. **Scrapes** 10K+ reviews and 200+ articles for insights
3. **Ranks** each business using sentiment, volume, and reputation
4. **Extracts** top testimonials and descriptive keywords
5. **Serves** all data statically to a fast frontend app


---

## 💼 Created By

**[Your Name]**  
Software Engineer • Data Curious • UI-Driven  
[LinkedIn](https://www.linkedin.com/in/parth-patel-sjsu/) • [Portfolio](patelparth.me)

---

## 🧠 Future Improvements

- Add more cities (NYC, LA, etc.)
- Use LLMs (GPT or Gemini) to extract themes more accurately
- Add voting/favorites to make it interactive
- Schedule automatic updates via serverless jobs



