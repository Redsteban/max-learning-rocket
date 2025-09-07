# Max's Learning Adventure Platform 🚀

An interactive, gamified learning platform designed for Max (9 years old, Grade 4) that combines curriculum reinforcement with life skills development. The platform enables autonomous daily learning sessions with Claude AI, progress tracking, and parent oversight capabilities.

## 🚀 Quick Start

1. **Install dependencies:**
```bash
npm install
```

2. **Set up environment variables:**
Add your Anthropic API key to `.env.local`:
```bash
ANTHROPIC_API_KEY="your-anthropic-api-key"
```

3. **Run the development server:**
```bash
npm run dev
```

4. **Open the application:**
Navigate to [http://localhost:3000](http://localhost:3000)

## 🎮 Demo Accounts

### Child Account
- **Username:** max
- **Picture Password:** 🌟🚀🌈🎮

### Parent Account
- **Username:** parent  
- **Password:** parent123

## ✨ Features Implemented

### Core Features
- ✅ **Child-Safe Authentication**
  - Picture-based password for kids (4 emoji selection)
  - Traditional login for parents
  - Session management with auto-logout

- ✅ **Gamified Dashboard**
  - XP and level progression system
  - Daily streak counter
  - Achievement badges
  - Animated, colorful UI designed for kids

- ✅ **Learning Modules** (5 subjects)
  - Monday: Science & Innovation 🔬
  - Tuesday: Math Missions 🧮
  - Wednesday: Stories & Communication 📚
  - Thursday: World Explorer 🌍
  - Friday: Entrepreneur's Lab 💼

- ✅ **Gamification System**
  - 10-level progression (Explorer → Grand Master)
  - Streak bonuses and achievements
  - Daily missions with XP rewards
  - Badge collection system

- ✅ **Claude AI Integration**
  - Child-safe prompts and content filtering
  - Module-specific learning contexts
  - Adaptive difficulty based on performance

- ✅ **Safety Features**
  - Content filtering for appropriate responses
  - Parent override PIN
  - Session timeouts
  - No external links

## 🏗️ Project Structure

```
max-learning-adventure/
├── app/
│   ├── api/
│   │   └── auth/         # Authentication endpoints
│   ├── dashboard/        # Main child dashboard
│   ├── learn/           # Learning modules
│   ├── parent/          # Parent portal
│   └── page.tsx         # Login page
├── components/
│   ├── Dashboard/       # Dashboard components
│   ├── Modules/         # Learning module components
│   ├── Chat/           # Claude chat interface
│   └── Progress/       # Progress tracking
├── lib/
│   ├── auth.ts         # Authentication logic
│   ├── claude.ts       # Claude AI integration
│   └── gamification.ts # XP, levels, badges
└── types/              # TypeScript definitions
```

## 🎯 Gamification Details

### XP Levels
1. **Explorer** (0-100 XP)
2. **Adventurer** (100-300 XP)
3. **Discoverer** (300-600 XP)
4. **Scholar** (600-1000 XP)
5. **Researcher** (1000-1500 XP)
6. **Expert** (1500-2500 XP)
7. **Master** (2500-4000 XP)
8. **Sage** (4000-6000 XP)
9. **Legend** (6000-10000 XP)
10. **Grand Master** (10000+ XP)

### Achievements
- 🌟 **First Day Hero** - Complete first day
- ⚔️ **Week Warrior** - 5-day streak
- 👑 **Month Master** - 20-day streak
- 💯 **Century Champion** - 100-day streak

### Subject Badges
- 🔬 **Science Star** - Complete 10 science lessons
- 🧮 **Math Wizard** - Solve 50 math problems
- 📚 **Story Teller** - Write 5 creative stories
- 🌍 **World Explorer** - Visit 10 countries virtually
- 💼 **Business Builder** - Create 3 business ideas

## 🔒 Safety Features

- **Child-appropriate content** - All AI responses filtered
- **Picture passwords** - Easy for kids, hard to guess
- **Parent controls** - Full access to monitor and manage
- **Session limits** - Auto-logout after inactivity
- **No external links** - Completely self-contained environment

## 🚧 Next Steps

1. **Complete Learning Modules**
   - Add interactive lessons for each subject
   - Implement quizzes and projects
   - Create adaptive difficulty system

2. **Parent Portal**
   - Activity dashboard
   - Progress reports
   - Content filtering controls
   - Chat history review

3. **Enhanced Features**
   - Voice interaction
   - Drawing tools
   - Offline mode
   - Export to school portfolio

## 📝 Notes for Development

- Keep all interactions age-appropriate for Grade 4 (9 years old)
- Use bright, engaging colors and animations
- Provide positive reinforcement frequently
- Make errors fun learning opportunities
- Include Victoria, BC local content when possible

## 🛠️ Tech Stack

- **Frontend:** Next.js 15, React, TypeScript
- **Styling:** Tailwind CSS, Framer Motion
- **AI:** Anthropic Claude API
- **Charts:** Recharts
- **Icons:** Lucide React
- **Auth:** JWT tokens, bcrypt

## 📄 License

Private project for personal use.
