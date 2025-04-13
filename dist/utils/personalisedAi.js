"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.geminiChatbot = exports.encodeImageToBase64 = exports.generateDietAdvice = exports.generateMealPlan = exports.generateMotivationAdvice = exports.generateSleepAdvice = exports.generateHydrationAdvice = exports.generateWorkoutAdvice = exports.calculateBodyMetrics = exports.generateRecoveryActions = exports.personalisedAi = exports.generateWithAI = void 0;
require("dotenv/config");
const prisma_1 = __importDefault(require("../prisma"));
const genai_1 = require("@google/genai");
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
// const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const ai = new genai_1.GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
function generateWithAI(_a) {
    return __awaiter(this, arguments, void 0, function* ({ userId, taskType, customPrompt, updatedUser, mealData, imagePath, }) {
        var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
        const user = yield prisma_1.default.user.findUnique({
            where: { userId: userId },
            include: {
                userPreferences: true,
                bodyMetrics: { orderBy: { createdAt: "desc" }, take: 1 },
                MealPlan: true,
                // healthData: { orderBy: { createdAt: "desc" }, take: 1 },
            },
        });
        if (!user) {
            throw new Error("user or user preferences is not found");
        }
        const parts = [];
        let prompt = "";
        if (taskType === "meal-plan") {
            prompt += `Generate four meals for a single day — one for each of the following types: breakfast, lunch, snacks, and dinner.
      Include a healthy beverage for each meal. For each meal, include the following fields:
      date: Date of the meal (e.g., "2023-10-01")
      please make sure to generate the meals based on these user preferences: ${JSON.stringify(user === null || user === void 0 ? void 0 : user.userPreferences)} and body metrics: ${JSON.stringify(user === null || user === void 0 ? void 0 : user.bodyMetrics)}. provide ${(_b = user === null || user === void 0 ? void 0 : user.userPreferences) === null || _b === void 0 ? void 0 : _b.cuisine} cuisine dishes and if cusine name is random gibberish or not related to cuisine, provide dishes related to this timezone ${user.timeZone}, users health goal is ${(_c = user === null || user === void 0 ? void 0 : user.userPreferences) === null || _c === void 0 ? void 0 : _c.healthGoalFocus}, users dietary restrictions is ${(_d = user === null || user === void 0 ? void 0 : user.userPreferences) === null || _d === void 0 ? void 0 : _d.dietaryRestrictions}, users activity level is  ${(_e = user === null || user === void 0 ? void 0 : user.userPreferences) === null || _e === void 0 ? void 0 : _e.activityLevel}.
      For each meal, include the following fields:

      name: Name of the dish

      description: Short description of the dish

      type: One of "breakfast", "lunch", "snack", or "dinner"

      calories: Estimated calorie count (integer)

      protein: Approximate protein content in grams (float)

      carbs: Carbohydrates in grams (float)

      fat: Fat in grams (float)

      fiber: Dietary fiber in grams (float)

      sugar: Sugar in grams (float)

      sodium: Sodium in milligrams (float)

      ingredients: A list of ingredients used (as strings)

      preparation:  detailed preparation (as a string)


      Return the result as a JSON array under the "meals" key`;
        }
        else if (taskType === "workout-plan") {
            prompt = `Generate a personalized workout plan for a user with body metrics${JSON.stringify((_f = user === null || user === void 0 ? void 0 : user.bodyMetrics) === null || _f === void 0 ? void 0 : _f[0])} and users preferred workout type is ${(_g = user === null || user === void 0 ? void 0 : user.userPreferences) === null || _g === void 0 ? void 0 : _g.preferredWorkoutType}, healt goal is ${(_h = user === null || user === void 0 ? void 0 : user.userPreferences) === null || _h === void 0 ? void 0 : _h.healthGoalFocus}, activity level is ${(_j = user === null || user === void 0 ? void 0 : user.userPreferences) === null || _j === void 0 ? void 0 : _j.activityLevel}, users preferred coaching intensity is ${(_k = user === null || user === void 0 ? void 0 : user.userPreferences) === null || _k === void 0 ? void 0 : _k.coachingIntensity}. output should be a JSON object with the following fields. generate workouts for only one day:
    {
  "summary": "",
  "frequency": "number of days a week based on the users activity level i provided you in the form of string",
  "type": "${(_l = user === null || user === void 0 ? void 0 : user.userPreferences) === null || _l === void 0 ? void 0 : _l.preferredWorkoutType}",
  "workouts": [
    {
      time: "workout time"
      "name": "workout name",
      "type": "users preferred workout type",
      "description": "A short description of the workout plan.",
      "targetMuscles": [],
      "duration": duration of the exercise in minutes as number,
      "order": 1,
      "exercises": [
        {
          "name": "",
          "sets": number of sets, always provide a number not string,
          "reps": number of reps, always provide a number not string,
          "restTime": rest time inbetween reps, always provide a number not string,
          "type": "Strength"
        },
        more exercises as per users goals activity levels and preferred workout type
      ]
    },
 
  ]
}

    `;
        }
        else if (taskType === "meal-deviation") {
            prompt = `Analyze this consumed meal data against the user's nutrition goals:

USER preferences:
${JSON.stringify(user === null || user === void 0 ? void 0 : user.userPreferences)}
USER BODY METRICS:
${JSON.stringify((_m = user === null || user === void 0 ? void 0 : user.bodyMetrics) === null || _m === void 0 ? void 0 : _m[0])}

Users meal plan: ${JSON.stringify(user === null || user === void 0 ? void 0 : user.MealPlan)}



MEAL DETAILS (from ConsumedMeal.details):
${JSON.stringify(mealData)}

Calculate the percentage deviation from targets for each macro and calculate the deviation perecentage and set isSignicant based on the coachIntensity and motivation style from userPreferences that i provided.IF the deviation is more than acceptable set isSignificant to true irrespective of the preferences return only the suggested JSON structure as a string and nothing else:

{
  "isSignificant": boolean,
  "deviations": [
    {"calories": {percentage: number, direction: "over"/"under"}},
    {"protein":  {percentage: number, direction: "over"/"under"}},
    {"carbs":  {percentage: number, direction: "over"/"under"}},
    {"fat":  {percentage: number, direction: "over"/"under"}}
  ],
  "mealDetails":{
   description: "a brief description about the food item",
   calories: number of calories in number type,
   protein: number of protein in number type,
   fat: number of fat in number type,
   carbs: number of carbs in number type
   ingredients: ingredients to prepare the food item in an array of string,
   preparation: how to prepare the food,
   fiber: number of fiber in number type,
   sugar: number of sugar in number type,
   sodium: number of sodium in number type,
  }
  "recoveryActions": {
    "immediate": [string],

    "nextMealAdjustments": {
      "increase": [string],
      "decrease": [string]
    }
    "workout": suggest an array of basic workouts like walking, jogging,skippin or body exercises based on userpreferences
  },
  "notificationMessage": a message to alert the user about the deviation, message should specify the meal type and the deviation percentages(proteins,fats,calories etc.,) from the proposed meal.
}`;
        }
        parts.push({ text: prompt });
        if (imagePath) {
            const imagePart = yield encodeImageToBase64(imagePath);
            parts.push(imagePart);
        }
        const result = yield ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: [{ role: "user", parts }],
        });
        const response = result.text;
        console.log("response", response);
        const cleanedText = response === null || response === void 0 ? void 0 : response.replace(/```json/g, "").replace(/```/g, "").trim();
        console.log(cleanedText);
        if (!cleanedText) {
            throw new Error("Failed to parse AI response: cleanedText is undefined");
        }
        return JSON.parse(cleanedText);
    });
}
exports.generateWithAI = generateWithAI;
function personalisedAi(_a) {
    return __awaiter(this, arguments, void 0, function* ({ updatedUser, category, timeZone, }) {
        var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s;
        let prompt = `
  Based on the following user preferences and body metrics, generate personalized ${category} advice.

  Preferences: ${JSON.stringify(updatedUser === null || updatedUser === void 0 ? void 0 : updatedUser.userPreferences)}
  Body Metrics: ${JSON.stringify(updatedUser === null || updatedUser === void 0 ? void 0 : updatedUser.bodyMetrics)}
  if there are any missing braces, commas or anything that goes against json syntax,format the json correctly, but strictly follow the rules regarding string,numbers,arrays etc.,
  `;
        if (category === "all") {
            prompt += `
    Provide personalized recommendations for the following categories in JSON format:
    1. **Diet:** diet advice including calorie intake, macronutrient breakdown.
    2. **Workout:** Exercise plan, frequency, type, intensity.
    3. **Hydration:** Daily water intake recommendation.
    4. **Sleep:** Optimal sleep hours and best practices.
    5. **Motivation:** Tips for staying consistent.
    6. **Default meal timings:** breakfast: 8AM, lunch: 1PM, snacks: 4pm, dinner: 8pm
    7. **Default workout timings:** 7AM
    Format the response as JSON:
    {{
      "diet": { 
      "summary": "...", "
      "calories": ..., 
      "macronutrients": {
        protein: "",
        carbs: "",
        fats: "",
      }, 
    
      "recommendations": [...] 
    }, 
    {
    Generate four meals for a single day — one for each of the following types: breakfast, lunch, snacks, and dinner.
      Include a healthy beverage for each meal. For each meal, include the following fields:
      date: Date of the meal (e.g., "2023-10-01")
      please make sure to generate the meals based on these user preferences: ${JSON.stringify(updatedUser === null || updatedUser === void 0 ? void 0 : updatedUser.userPreferences)} and body metrics: ${JSON.stringify(updatedUser === null || updatedUser === void 0 ? void 0 : updatedUser.bodyMetrics)}. provide ${updatedUser.userPreferences.cuisine} cuisine dishes and if cusine name is random gibberish or not related to cuisine, provide dishes related to this timezone ${timeZone}, users health goal is ${updatedUser.userPreferences.healthGoalFocus}, users dietary restrictions is ${updatedUser.userPreferences.dietaryRestrictions}, users activity level is  ${updatedUser.userPreferences.activityLevel}.
      For each meal, include the following fields:

      name: Name of the dish

      description: Short description of the dish

      type: One of "breakfast", "lunch", "snack", or "dinner"

      calories: Estimated calorie count (integer)

      protein: Approximate protein content in grams (float)

      carbs: Carbohydrates in grams (float)

      fat: Fat in grams (float)

      fiber: Dietary fiber in grams (float)

      sugar: Sugar in grams (float)

      sodium: Sodium in milligrams (float)

      ingredients: A list of ingredients used (as strings)

      preparation:  detailed preparation (as a string)


      Return the result as a JSON array under the "meals" key
      
    }
    },
   Generate a personalized workout plan for a user with body metrics${JSON.stringify(updatedUser === null || updatedUser === void 0 ? void 0 : updatedUser.bodyMetrics)} and users preferred workout type is ${(_b = updatedUser === null || updatedUser === void 0 ? void 0 : updatedUser.userPreferences) === null || _b === void 0 ? void 0 : _b.preferredWorkoutType}, healt goal is ${(_c = updatedUser === null || updatedUser === void 0 ? void 0 : updatedUser.userPreferences) === null || _c === void 0 ? void 0 : _c.healthGoalFocus}, activity level is ${(_d = updatedUser === null || updatedUser === void 0 ? void 0 : updatedUser.userPreferences) === null || _d === void 0 ? void 0 : _d.activityLevel}, users preferred coaching intensity is ${(_e = updatedUser === null || updatedUser === void 0 ? void 0 : updatedUser.userPreferences) === null || _e === void 0 ? void 0 : _e.coachingIntensity}. output should be a JSON object with the following fields. generate workouts for only one day:
    {
  "summary": "",
  "frequency": "number of days a week based on the users activity level i provided you in string format",
  "type": "${(_f = updatedUser === null || updatedUser === void 0 ? void 0 : updatedUser.userPreferences) === null || _f === void 0 ? void 0 : _f.preferredWorkoutType}",
  "workouts": [
    {
      time: "workout time"
      "name": "workout name",
      "type": "users preferred workout type",
      "description": "A short description of the workout plan.",
      "targetMuscles": [],
      "duration": duration of the exercise in minutes as number,
      "order": order of workout as number,
      "exercises": [
        {
          "name": "",
        "sets": number of sets, always provide a number, not string,
          "reps": number of reps, always provide a number, not string,
          "restTime": rest time inbetween reps, always provide a number not string,
          "type": "Strength"
        },
        more exercises as per users goals activity levels and preferred workout type
      ]
    },
  ]
},
      "hydration":   Generate comprehensive hydration advice using:
        - User metrics: 
          * Weight: ${updatedUser.userPreferences.weight}kg
          * Height: ${updatedUser.userPreferences.height}cm
          * Age: ${updatedUser.userPreferences.age}
        - Activity level: ${updatedUser.userPreferences.activityLevel}
        - Climate data (if available)
        - Current water intake: ${((_g = updatedUser.userPreferences) === null || _g === void 0 ? void 0 : _g.waterIntake) || "not recorded"}
      
        Return JSON matching HydrationAdvice model structure:
        {
          "summary": "Personalized hydration analysis (2-3 sentences)",
          "current": {
            "amount": ${((_h = updatedUser.userPreferences) === null || _h === void 0 ? void 0 : _h.waterIntake) || null},
            "unit": "L"
          },
          "target": {
            "min": "X liters (minimum recommendation)",
            "optimal": "Y liters (ideal for their metrics)",
            "max": "Z liters (upper limit)"
          },
          "progress": 0.75, // current/target percentage
          "adjustment": "Increase/decrease by X liters",
          "recommendations": {
            "timing": ["specific time-based suggestions"],
            "quality": ["electrolyte balance tips", "beverage choices"]
          }
        }
        Include calculation methodology in the summary.,
      "sleep":Create detailed sleep recommendations using:
  - Age: ${updatedUser.userPreferences.age}
  - Activity level: ${updatedUser.userPreferences.activityLevel}
  - Current sleep data: ${updatedUser.userPreferences.sleepDuration || "not recorded"}

  Return JSON matching SleepAdvice model structure:
  {
    "summary": "Sleep quality assessment (2-3 sentences)",
    "current": {
      "duration": ${((_j = updatedUser.userPreferences) === null || _j === void 0 ? void 0 : _j.sleepDuration) || null},
      "quality": ${updatedUser.userPreferences.sleepQuality || null}
    },
    "target": {
      "duration": ${updatedUser.userPreferences.sleepDuration},
      "windows": {
        "bedtime": "XX:XX PM based on chronotype",
        "wakeup": "XX:XX AM for optimal cycles"
      }
    },
    "improvement": {
      "plan": ["step-by-step better sleep habits"],
      "environment": ["bedroom optimization tips"]
    },
    "recovery": [
      "nap strategies",
      "sleep debt recovery methods"
    ]
  },
      "motivation": Develop advanced motivation strategies using:
  - Fitness goals: ${updatedUser.userPreferences.healthGoalFocus}
  - Activity level: ${updatedUser.userPreferences.activityLevel}
  - Workout preferences: ${updatedUser.userPreferences.preferredWorkoutType}

  Return JSON matching MotivationAdvice model structure:
  {
    "summary": "Motivation profile (2-3 sentences)",
   
    "strategies": {
      "immediate": ["quick motivation boosters"],
      "longTerm": ["habit formation techniques"]
    },
    "boosters": [],
    "recovery": []
  }
  Include personality-specific approaches where possible.
    }
    `;
        }
        else {
            switch (category) {
                case "diet":
                    prompt += `
        Provide a meal plan for one day including calorie intake, macronutrient breakdown, and meal recommendations.
        Format the response in JSON: {
      "diet": { "summary": "...", "calories": ..., "macronutrients": {...}, "
, "recommendations": [...] }.
        `;
                    break;
                case "meals":
                    prompt += `Generate four meals for a single day — one for each of the following types: breakfast, lunch, snacks, and dinner. include the timings for dinner based on wakeup time of user leaving time for workout(default timings breakfast: 8AM, lunch: 1PM, snacks: 4pm, dinner: 8pm).
      Include a healthy beverage for each meal. For each meal, include the following fields:
      date: Date of the meal (e.g., "2023-10-01")
      please make sure to generate the meals based on these user preferences: ${JSON.stringify(updatedUser.userPreferences)} and body metrics: ${JSON.stringify(updatedUser.bodyMetrics)}.
      For each meal, include the following fields:

      name: Name of the dish (e.g., "Oats with Berries")

      description: Short description of the dish

      type: One of "breakfast", "lunch", "snack", or "dinner"

      calories: Estimated calorie count (integer)

      protein: Approximate protein content in grams (float)

      carbs: Carbohydrates in grams (float)

      fat: Fat in grams (float)

      fiber: Dietary fiber in grams (float)

      sugar: Sugar in grams (float)

      sodium: Sodium in milligrams (float)

      ingredients: A list of ingredients used (as strings)

      preparation: give a detailed preparation as a string

      Return the result as a JSON array under the "meals" key`;
                    break;
                case "workout":
                    prompt += `
        Generate a personalized workout plan for a user with body metrics${JSON.stringify(updatedUser === null || updatedUser === void 0 ? void 0 : updatedUser.bodyMetrics)} and users preferred workout type is ${(_k = updatedUser === null || updatedUser === void 0 ? void 0 : updatedUser.userPreferences) === null || _k === void 0 ? void 0 : _k.preferredWorkoutType}, healt goal is ${(_l = updatedUser === null || updatedUser === void 0 ? void 0 : updatedUser.userPreferences) === null || _l === void 0 ? void 0 : _l.healthGoalFocus}, activity level is ${(_m = updatedUser === null || updatedUser === void 0 ? void 0 : updatedUser.userPreferences) === null || _m === void 0 ? void 0 : _m.activityLevel}, users preferred coaching intensity is ${(_o = updatedUser === null || updatedUser === void 0 ? void 0 : updatedUser.userPreferences) === null || _o === void 0 ? void 0 : _o.coachingIntensity}. output should be a JSON object with the following fields. generate workouts for only one day:
    {
  "summary": "",
  "frequency": "number of days a week based on the users activity level i provided you in the form of string",
  "type": "${(_p = updatedUser === null || updatedUser === void 0 ? void 0 : updatedUser.userPreferences) === null || _p === void 0 ? void 0 : _p.preferredWorkoutType}",
  "workouts": [
    {
      time: "workout time"
      "name": "workout name",
      "type": "users preferred workout type",
      "description": "A short description of the workout plan.",
      "targetMuscles": [],
      "duration": duration of the exercise in minutes as number,
      "order": 1,
      "exercises": [
        {
          "name": "",
          "sets": number of sets, always provide a number not string,
          "reps": number of reps, always provide a number not string,
          "restTime": rest time inbetween reps,, always provide a number not string
          "type": "Strength"
        },
        more exercises as per users goals activity levels and preferred workout type
      ]
    },
 
  ]
}
        `;
                    break;
                // Hydration prompt with intake context
                case "hydration":
                    prompt += `
        Generate comprehensive hydration advice using:
        - User metrics: 
          * Weight: ${updatedUser.userPreferences.weight}kg
          * Height: ${updatedUser.userPreferences.height}cm
          * Age: ${updatedUser.userPreferences.age}
        - Activity level: ${updatedUser.userPreferences.activityLevel}
        - Climate data (if available)
        - Current water intake: ${((_q = updatedUser.userPreferences) === null || _q === void 0 ? void 0 : _q.waterIntake) || "not recorded"}
      
        Return JSON matching HydrationAdvice model structure:
        {
          "summary": "Personalized hydration analysis (2-3 sentences)",
          "current": {
            "amount": ${((_r = updatedUser.userPreferences) === null || _r === void 0 ? void 0 : _r.waterIntake) || null},
            "unit": "L"
          },
          "target": {
            "min": "X liters (minimum recommendation)",
            "optimal": "Y liters (ideal for their metrics)",
            "max": "Z liters (upper limit)"
          },
          "progress": 0.75, // current/target percentage
          "adjustment": "Increase/decrease by X liters",
          "recommendations": {
            "timing": ["specific time-based suggestions"],
            "quality": ["electrolyte balance tips", "beverage choices"]
          }
        }
        Include calculation methodology in the summary.
        `;
                    break;
                // Sleep prompt with intake context
                case "sleep":
                    prompt += `
  Create detailed sleep recommendations using:
  - Age: ${updatedUser.userPreferences.age}
  - Activity level: ${updatedUser.userPreferences.activityLevel}
  - Current sleep data: ${updatedUser.userPreferences.sleepDuration || "not recorded"}

  Return JSON matching SleepAdvice model structure:
  {
    "summary": "Sleep quality assessment (2-3 sentences)",
    "current": {
      "duration": ${((_s = updatedUser.userPreferences) === null || _s === void 0 ? void 0 : _s.sleepDuration) || null},
      "quality": ${updatedUser.userPreferences.sleepQuality || null}
    },
    "target": {
      "duration": ${updatedUser.userPreferences.sleepDuration},
      "windows": {
        "bedtime": "XX:XX PM based on chronotype",
        "wakeup": "XX:XX AM for optimal cycles"
      }
    },
    "improvement": {
      "plan": ["step-by-step better sleep habits"],
      "environment": ["bedroom optimization tips"]
    },
    "recovery": [
      "nap strategies",
      "sleep debt recovery methods"
    ]
  }
  `;
                    break;
                // Motivation prompt with progress context
                case "motivation":
                    prompt += `
  Develop advanced motivation strategies using:
  - Fitness goals: ${updatedUser.userPreferences.healthGoalFocus}
  - Activity level: ${updatedUser.userPreferences.activityLevel}
  - Workout preferences: ${updatedUser.userPreferences.preferredWorkoutType}

  Return JSON matching MotivationAdvice model structure:
  {
    "summary": "Motivation profile (2-3 sentences)",
   
    "strategies": {
      "immediate": ["quick motivation boosters"],
      "longTerm": ["habit formation techniques"]
    },
    "boosters": [],
    "recovery": []
  }
  Include personality-specific approaches where possible.
  `;
                    break;
                case "notification":
                    prompt += `Generate a personalized motivational notification message for a fitness app user. The message should be based on the following details:

User preferences: ${JSON.stringify(updatedUser.userPreferences)}, bodyMetrics:  ${JSON.stringify(updatedUser.bodyMetrics)} and
consumedMeal:  ${JSON.stringify(updatedUser.ConsumedMeals)}

Body metrics: {insert metrics like weight = 92kg, height = 176cm, goal = fat loss, TDEE = 2400 kcal}

Latest consumed meals: {insert latest meals, e.g., breakfast: oats + banana (350 kcal), lunch: rice + chicken curry (600 kcal), snacks: none so far}

Time since last meal or notification: {e.g., 3 hours}

The message should be friendly, motivational, and no longer than 2 sentences. Suggest the next best action (e.g., eat a snack, hydrate, stretch) based on the data. Format it as JSON with a title and body.`;
                    break;
                default:
                    prompt += `Provide general fitness and health advice.`;
                    break;
            }
        }
        try {
            const result = yield ai.models.generateContent({
                model: "gemini-2.0-flash",
                contents: prompt,
            });
            const response = result.text;
            const cleanedText = response === null || response === void 0 ? void 0 : response.replace(/```json/g, "").replace(/```/g, "").trim();
            if (!cleanedText) {
                throw new Error("Failed to parse AI response: cleanedText is undefined");
            }
            console.log(cleanedText);
            return JSON.parse(cleanedText);
        }
        catch (error) {
            console.error("AI service error:", error);
            return { message: error.message, error: error };
        }
    });
}
exports.personalisedAi = personalisedAi;
function generateRecoveryActions(userId, contextType, contextData) {
    return __awaiter(this, void 0, void 0, function* () {
        const userData = yield getUserData(userId);
        const prompt = `The user has ${contextType === "meal" ? "deviated from a planned meal" : "missed a workout"}. Based on the following user data and recent logs, generate a recovery plan that includes specific actions for today and adjustments for the next day to help the user stay on track.

User Data: ${JSON.stringify(userData)}
Context: ${JSON.stringify(contextData)}

Return the result in structured JSON format:
{
  "today": {
    "actions": [
      "Go for a 30-minute walk after dinner",
      "Drink 2 extra glasses of water"
    ],
    "notes": "Focus on light activity today to maintain momentum without overexertion."
  },
  "tomorrow": {
    "adjustments": {
      "workout": "Add 10 minutes of HIIT after your regular strength routine.",
      "diet": "Include a high-protein breakfast to balance out yesterday’s intake."
    }
  }
}`;
        try {
            const result = yield ai.models.generateContent({
                model: "gemini-2.0-flash",
                contents: prompt,
            });
            const response = result.text;
            const cleanedText = response === null || response === void 0 ? void 0 : response.replace(/```json/g, "").replace(/```/g, "").trim();
            if (!cleanedText) {
                throw new Error("Failed to parse AI response: cleanedText is undefined");
            }
            return JSON.parse(cleanedText);
        }
        catch (error) {
            console.error("Failed to parse recovery plan response:", error.message);
            return {
                today: {
                    actions: [],
                    notes: "Could not generate a recovery plan at this time.",
                },
                tomorrow: {
                    adjustments: {
                        workout: "",
                        diet: "",
                    },
                },
            };
        }
    });
}
exports.generateRecoveryActions = generateRecoveryActions;
function getUserData(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = yield prisma_1.default.user.findUnique({
            where: { userId: userId },
            select: {
                userId: true,
                userPreferences: true,
                bodyMetrics: { orderBy: { createdAt: "desc" }, take: 1 },
            },
        });
        if (!user || !user.userPreferences || !user.bodyMetrics[0]) {
            throw new Error("User data not found");
        }
        return {
            userPreferences: user.userPreferences,
            bodyMetrics: Object.assign(Object.assign({}, user.bodyMetrics[0]), { userId: user.userId, createdAt: user.bodyMetrics[0].createdAt, updatedAt: user.bodyMetrics[0].updatedAt }),
        };
    });
}
function calculateBodyMetrics({ gender, age, height, weight, activityLevel, waistCircumference, hip, neckCircumference, }) {
    try {
        // Convert height from feet to cm (for formulas)
        if (!height || !weight) {
            throw new Error("BMI(height and weight are required)");
        }
        const heightCm = height && height * 30.48;
        const heightInInches = height * 12;
        // BMI (Body Mass Index)
        const bmi = weight / (heightCm / 100) ** 2;
        // BMR (Basal Metabolic Rate)
        if (!age) {
            throw new Error("BMR(height, weight and age are required)");
        }
        let bmr;
        if (gender === "male") {
            bmr = 88.36 + 13.4 * weight + 4.8 * heightCm - 5.7 * age;
        }
        else if (gender === "female") {
            bmr = 447.6 + 9.2 * weight + 3.1 * heightCm - 4.3 * age;
        }
        else {
            bmr =
                (88.36 +
                    13.4 * weight +
                    4.8 * heightCm -
                    5.7 * age +
                    447.6 +
                    9.2 * weight +
                    3.1 * heightCm -
                    4.3 * age) /
                    2;
        }
        if (!activityLevel) {
            throw new Error("TDEE(activity level is required)");
        }
        // TDEE (Total Daily Energy Expenditure)
        const activityMultiplier = {
            sedentary: 1.2,
            lightly_active: 1.375,
            active: 1.55,
            very_active: 1.725,
        }[activityLevel];
        console.log;
        const tdee = bmr * activityMultiplier;
        // Body Fat Percentage (Using Navy Method if Waist Circumference is Provided)
        let bodyFatPercentage = null;
        if (waistCircumference && neckCircumference && height) {
            if (gender === "male") {
                bodyFatPercentage =
                    86.01 * Math.log10(waistCircumference - neckCircumference) -
                        70.041 * Math.log10(heightInInches) +
                        36.76;
                console.log(waistCircumference, neckCircumference, heightInInches, bodyFatPercentage);
            }
            else if (gender === "female" && hip) {
                bodyFatPercentage =
                    163.205 * Math.log10(waistCircumference + hip - neckCircumference) -
                        97.684 * Math.log10(heightInInches) -
                        78.387;
            }
        }
        // Muscle Mass Estimate (Lean Body Mass)
        let muscleMass = null;
        if (bodyFatPercentage !== null) {
            muscleMass = (weight * (100 - bodyFatPercentage)) / 100;
        }
        // Bone Mass Estimate
        let boneMass = null;
        if (gender === "male") {
            boneMass = weight * 0.15; // Approximate percentage for men
        }
        else if (gender === "female") {
            boneMass = weight * 0.12; // Approximate percentage for women
        }
        else {
            boneMass = weight * 0.135; // Average for non-binary users
        }
        return {
            bodyMetrics: {
                bmi: parseFloat(bmi.toFixed(2)),
                bmr: parseFloat(bmr.toFixed(2)),
                tdee: parseFloat(tdee.toFixed(2)),
                bodyFatPercentage: bodyFatPercentage
                    ? parseFloat(bodyFatPercentage.toFixed(2))
                    : null,
                muscleMass: muscleMass ? parseFloat(muscleMass.toFixed(2)) : null,
                boneMass: parseFloat(boneMass.toFixed(2)),
            },
        };
    }
    catch (error) {
        return { error: `unable to calculate ${error.message}` };
    }
}
exports.calculateBodyMetrics = calculateBodyMetrics;
function generateWorkoutAdvice(updatedUser) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield personalisedAi({ updatedUser, category: "workout" });
    });
}
exports.generateWorkoutAdvice = generateWorkoutAdvice;
function generateHydrationAdvice(updatedUser) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield personalisedAi({ updatedUser, category: "hydration" });
    });
}
exports.generateHydrationAdvice = generateHydrationAdvice;
function generateSleepAdvice(updatedUser) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield personalisedAi({ updatedUser, category: "sleep" });
    });
}
exports.generateSleepAdvice = generateSleepAdvice;
function generateMotivationAdvice(updatedUser) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield personalisedAi({ updatedUser, category: "motivation" });
    });
}
exports.generateMotivationAdvice = generateMotivationAdvice;
function generateMealPlan(updatedUser) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield personalisedAi({ updatedUser, category: "meals" });
    });
}
exports.generateMealPlan = generateMealPlan;
function generateDietAdvice(updatedUser) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield personalisedAi({ updatedUser, category: "diet" });
    });
}
exports.generateDietAdvice = generateDietAdvice;
function encodeImageToBase64(filePath) {
    return __awaiter(this, void 0, void 0, function* () {
        const imageBuffer = yield promises_1.default.readFile(filePath);
        const mimeType = path_1.default.extname(filePath).includes("png")
            ? "image/png"
            : "image/jpeg";
        return {
            inlineData: {
                data: imageBuffer.toString("base64"),
                mimeType,
            },
        };
    });
}
exports.encodeImageToBase64 = encodeImageToBase64;
function geminiChatbot(customPrompt) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = yield ai.models.generateContent({
                model: "gemini-2.0-flash",
                contents: customPrompt,
            });
            const response = result.text;
            const cleanedText = response === null || response === void 0 ? void 0 : response.replace(/```json/g, "").replace(/```/g, "").trim();
            if (!cleanedText) {
                throw new Error("Failed to parse AI response: cleanedText is undefined");
            }
            return JSON.parse(cleanedText);
        }
        catch (error) {
            console.error("Failed to parse recovery plan response:", error.message);
            return {
                today: {
                    actions: [],
                    notes: "Could not generate a recovery plan at this time.",
                },
                tomorrow: {
                    adjustments: {
                        workout: "",
                        diet: "",
                    },
                },
            };
        }
    });
}
exports.geminiChatbot = geminiChatbot;
