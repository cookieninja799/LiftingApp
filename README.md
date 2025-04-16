# LiftingApp 🏋️

A mobile workout tracker built with Expo and powered by OpenAI, LiftingApp lets users log workouts in natural language and automatically converts them into structured exercise sessions. Dive into your workout history, analyze performance over time, and track personal records—all in one place.

## 🚀 Features

- **Natural Language Logging**: Enter workouts like “Squats 3x8 @ 185 lbs” and let the AI parse exercises, sets, reps, and weights.
- **Workout Journals**: View, edit, and delete past sessions, grouped by week or month.
- **Analytics Dashboard**:
  - Calendar heatmap of weekly training volume.
  - Muscle group stats with volume and emoji-driven feedback.
  - Personal record tracking for each exercise.
- **Profile Setup**: Save age, gender, weight, and height to personalize bodyweight calculations.
- **Theming & Accessibility**: Light/dark mode support with customizable colors.

## 📋 Prerequisites

- **Node.js** >= 18
- **npm** >= 8
- **Expo CLI**: Install globally via `npm install -g expo-cli`
- **OpenAI API Key** and **Assistant ID** (see Configuration)

## ⚙️ Configuration

1. Copy `.env.example` to `.env` at the project root.
2. Set the following variables:
   ```env
   OPENAI_API_KEY=your_openai_api_key
   ASSISTANT_ID=your_openai_assistant_id
   API_BASE_URL=http://localhost:3000
   ```

### 🤖 Assistant Setup

To enable AI parsing, you must create a dedicated OpenAI Assistant with the following system prompt:

```
You are a plain English to JSON parser for exercise logs. Your task is to convert user-provided exercise descriptions into structured JSON objects, ensuring accuracy and consistency.

Output Format
Always return a JSON array, where each object represents one exercise. No additional text, explanations, or commentary should be included.

Each object must conform to the following schema:
{
  "id": "string",          // Unique identifier (null if not provided)
  "date": "YYYY-MM-DD",    // Workout date (null if not provided)
  "exercise": "string",    // Exercise name (Title Case)
  "sets": integer,         // Number of sets (default: 1 if not specified)
  "reps": [integer],       // Array of rep counts (null if not specified)
  "weights": [string],     // Array of weights per set (use "bodyweight" if applicable)
  "primaryMuscleGroup": "string" // Primary muscle group
}

ID Generation
Each exercise entry must have a unique ID using the format:
"{YYYY-MM-DD}-{exerciseIndex}"
YYYY-MM-DD is the parsed date (null if unavailable).
exerciseIndex is an incrementing counter (starting at 1) for each exercise on the same date.

Date Handling
The date field must be parsed from various input formats (e.g., "December 3rd", "12/3/24"). If no date is provided, set "date": null.

Handling Missing Values
- Reps missing: default to null
- Sets missing: default to 1
- Weights missing: use "bodyweight" for bodyweight exercises, otherwise null

Exercise-Specific Rules
- Bodyweight exercises: weights = ["bodyweight", ...]
- Dumbbell exercises: if given per dumbbell, double the weight (e.g., "35 lb dumbbells" → "70 lbs").

Normalize exercise names to Title Case and assign a primary muscle group based on common mappings (e.g., Push-Ups → Chest, Squats → Quads).

Only output valid JSON—no prose or code fences.
```

3. Ensure the Express backend (`server.js`) is running to handle AI parsing requests.

## 🔧 Installation

```bash
# Clone the repo
git clone https://github.com/yourusername/LiftingApp.git
cd LiftingApp

# Install dependencies
npm install

# Start the Express server for AI parsing
npm run start:server

# Start the Expo development server
npm run start
# or 'expo start'
```

## 📱 Running the App

In the Expo CLI output, choose one of:

- 📱 **Expo Go** (iOS/Android) to scan the QR code
- 🖥️ **Web**: Press `w`
- 📲 **Simulator/Emulator**: Press `i` (iOS) or `a` (Android)

## 📂 Project Structure

```
└── LiftingApp/
    ├── app/                   # Screens & routes (Expo Router)
    ├── components/            # Reusable UI & analytics widgets
    ├── constants/             # Color tokens, theming
    ├── hooks/                 # Custom hooks (theme, color scheme)
    ├── styles/                # Shared StyleSheet definitions
    ├── utils/                 # Helpers: date/week logic, volume calculations
    ├── server.js              # Express + OpenAI thread polling backend
    ├── .env.example           # Environment variable template
    ├── app.json               # Expo configuration
    ├── package.json
    └── tsconfig.json
```

## 🧪 Testing

```bash
# Run Jest in watch mode
npm test
```

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m "feat: add awesome feature"`)
4. Push to your branch (`git push origin feature/your-feature`)
5. Open a Pull Request

Ensure code is linted (`npm run lint`) and tests pass.

## 📜 License

This project is MIT licensed. See [LICENSE](LICENSE) for details.
