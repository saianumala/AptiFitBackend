import "dotenv/config";
import prisma from "../prisma";
import { GoogleGenAI } from "@google/genai";
import fs from "fs/promises";
import path from "path";

// const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

interface updateSchema {
  userPreferences: {
    gender: string;
    age: number;
    height: number;
    weight: number;
    activityLevel: string;
    preferredWorkoutType: string;
    healthGoalFocus: string;
    dietaryRestrictions: string | null;
    cuisine: string | null;
    waterIntake: number | null;
    sleepDuration: number | null;
    coachingIntensity: string;
    motivationStyle: string;
    waistCircumference: number | null;
    notificationFrequency: number | null;
    sleepQuality: string | null;
  };
  bodyMetrics: {
    userId: string;
    createdAt: Date;
    updatedAt: Date;
    id: string;
    bmi: number | null;
    bmr: number | null;
    tdee: number | null;
    bodyFatPercentage: number | null;
    muscleMass: number | null;
    boneMass: number | null;
  };
  subscription?: any;
  ConsumedMeals?: any;
}

export async function generateWithAI({
  userId,
  taskType,
  customPrompt,
  updatedUser,
  mealData,
  imagePath,
}: {
  userId: string;
  taskType: string;
  customPrompt?: string;
  updatedUser?: any;
  mealData?: any;
  imagePath?: string;
}) {
  const user = await prisma.user.findUnique({
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
  const parts: any[] = [];
  let prompt = "";
  if (taskType === "meal-plan") {
    prompt += `Generate four meals for a single day — one for each of the following types: breakfast, lunch, snacks, and dinner.
      Include a healthy beverage for each meal. For each meal, include the following fields:
      date: Date of the meal (e.g., "2023-10-01")
      please make sure to generate the meals based on these user preferences: ${JSON.stringify(
        user?.userPreferences
      )} and body metrics: ${JSON.stringify(user?.bodyMetrics)}. provide ${
      user?.userPreferences?.cuisine
    } cuisine dishes and if cusine name is random gibberish or not related to cuisine, provide dishes related to this timezone ${
      user.timeZone
    }, users health goal is ${
      user?.userPreferences?.healthGoalFocus
    }, users dietary restrictions is ${
      user?.userPreferences?.dietaryRestrictions
    }, users activity level is  ${user?.userPreferences?.activityLevel}.
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
  } else if (taskType === "workout-plan") {
    prompt = `Generate a personalized workout plan for a user with body metrics${JSON.stringify(
      user?.bodyMetrics?.[0]
    )} and users preferred workout type is ${
      user?.userPreferences?.preferredWorkoutType
    }, healt goal is ${
      user?.userPreferences?.healthGoalFocus
    }, activity level is ${
      user?.userPreferences?.activityLevel
    }, users preferred coaching intensity is ${
      user?.userPreferences?.coachingIntensity
    }. output should be a JSON object with the following fields. generate workouts for only one day:
    {
  "summary": "",
  "frequency": "number of days a week based on the users activity level i provided you in the form of string",
  "type": "${user?.userPreferences?.preferredWorkoutType}",
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
  } else if (taskType === "meal-deviation") {
    prompt = `Analyze this consumed meal data against the user's nutrition goals:

USER preferences:
${JSON.stringify(user?.userPreferences)}
USER BODY METRICS:
${JSON.stringify(user?.bodyMetrics?.[0])}

Users meal plan: ${JSON.stringify(user?.MealPlan)}



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
    const imagePart = await encodeImageToBase64(imagePath);
    parts.push(imagePart);
  }
  const result = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: [{ role: "user", parts }],
  });

  const response = result.text;
  console.log("response", response);
  const cleanedText = response
    ?.replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();
  console.log(cleanedText);
  if (!cleanedText) {
    throw new Error("Failed to parse AI response: cleanedText is undefined");
  }
  return JSON.parse(cleanedText);
}

export async function personalisedAi({
  updatedUser,
  category,
  timeZone,
}: {
  updatedUser: updateSchema;
  category: string;
  timeZone?: string;
}) {
  let prompt = `
  Based on the following user preferences and body metrics, generate personalized ${category} advice.

  Preferences: ${JSON.stringify(updatedUser?.userPreferences)}
  Body Metrics: ${JSON.stringify(updatedUser?.bodyMetrics)}
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
      please make sure to generate the meals based on these user preferences: ${JSON.stringify(
        updatedUser?.userPreferences
      )} and body metrics: ${JSON.stringify(
      updatedUser?.bodyMetrics
    )}. provide ${
      updatedUser.userPreferences.cuisine
    } cuisine dishes and if cusine name is random gibberish or not related to cuisine, provide dishes related to this timezone ${timeZone}, users health goal is ${
      updatedUser.userPreferences.healthGoalFocus
    }, users dietary restrictions is ${
      updatedUser.userPreferences.dietaryRestrictions
    }, users activity level is  ${updatedUser.userPreferences.activityLevel}.
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
   Generate a personalized workout plan for a user with body metrics${JSON.stringify(
     updatedUser?.bodyMetrics
   )} and users preferred workout type is ${
      updatedUser?.userPreferences?.preferredWorkoutType
    }, healt goal is ${
      updatedUser?.userPreferences?.healthGoalFocus
    }, activity level is ${
      updatedUser?.userPreferences?.activityLevel
    }, users preferred coaching intensity is ${
      updatedUser?.userPreferences?.coachingIntensity
    }. output should be a JSON object with the following fields. generate workouts for only one day:
    {
  "summary": "",
  "frequency": "number of days a week based on the users activity level i provided you in string format",
  "type": "${updatedUser?.userPreferences?.preferredWorkoutType}",
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
        - Current water intake: ${
          updatedUser.userPreferences?.waterIntake || "not recorded"
        }
      
        Return JSON matching HydrationAdvice model structure:
        {
          "summary": "Personalized hydration analysis (2-3 sentences)",
          "current": {
            "amount": ${updatedUser.userPreferences?.waterIntake || null},
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
  - Current sleep data: ${
    updatedUser.userPreferences.sleepDuration || "not recorded"
  }

  Return JSON matching SleepAdvice model structure:
  {
    "summary": "Sleep quality assessment (2-3 sentences)",
    "current": {
      "duration": ${updatedUser.userPreferences?.sleepDuration || null},
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
  } else {
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
      please make sure to generate the meals based on these user preferences: ${JSON.stringify(
        updatedUser.userPreferences
      )} and body metrics: ${JSON.stringify(updatedUser.bodyMetrics)}.
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
        Generate a personalized workout plan for a user with body metrics${JSON.stringify(
          updatedUser?.bodyMetrics
        )} and users preferred workout type is ${
          updatedUser?.userPreferences?.preferredWorkoutType
        }, healt goal is ${
          updatedUser?.userPreferences?.healthGoalFocus
        }, activity level is ${
          updatedUser?.userPreferences?.activityLevel
        }, users preferred coaching intensity is ${
          updatedUser?.userPreferences?.coachingIntensity
        }. output should be a JSON object with the following fields. generate workouts for only one day:
    {
  "summary": "",
  "frequency": "number of days a week based on the users activity level i provided you in the form of string",
  "type": "${updatedUser?.userPreferences?.preferredWorkoutType}",
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
        - Current water intake: ${
          updatedUser.userPreferences?.waterIntake || "not recorded"
        }
      
        Return JSON matching HydrationAdvice model structure:
        {
          "summary": "Personalized hydration analysis (2-3 sentences)",
          "current": {
            "amount": ${updatedUser.userPreferences?.waterIntake || null},
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
  - Current sleep data: ${
    updatedUser.userPreferences.sleepDuration || "not recorded"
  }

  Return JSON matching SleepAdvice model structure:
  {
    "summary": "Sleep quality assessment (2-3 sentences)",
    "current": {
      "duration": ${updatedUser.userPreferences?.sleepDuration || null},
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

User preferences: ${JSON.stringify(
          updatedUser.userPreferences
        )}, bodyMetrics:  ${JSON.stringify(updatedUser.bodyMetrics)} and
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
    const result = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
    });

    const response = result.text;
    const cleanedText = response
      ?.replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
    if (!cleanedText) {
      throw new Error("Failed to parse AI response: cleanedText is undefined");
    }
    console.log(cleanedText);
    return JSON.parse(cleanedText);
  } catch (error: any) {
    console.error("AI service error:", error);
    return { message: error.message, error: error };
  }
}

export async function generateRecoveryActions(
  userId: string,
  contextType: "meal" | "workout",
  contextData: any
) {
  const userData = await getUserData(userId);

  const prompt = `The user has ${
    contextType === "meal" ? "deviated from a planned meal" : "missed a workout"
  }. Based on the following user data and recent logs, generate a recovery plan that includes specific actions for today and adjustments for the next day to help the user stay on track.

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
    const result = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
    });

    const response = result.text;
    const cleanedText = response
      ?.replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
    if (!cleanedText) {
      throw new Error("Failed to parse AI response: cleanedText is undefined");
    }
    return JSON.parse(cleanedText);
  } catch (error: any) {
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
}

async function getUserData(userId: string) {
  const user = await prisma.user.findUnique({
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
    bodyMetrics: {
      ...user.bodyMetrics[0],
      userId: user.userId,
      createdAt: user.bodyMetrics[0].createdAt,
      updatedAt: user.bodyMetrics[0].updatedAt,
    },
  };
}
export function calculateBodyMetrics({
  gender,
  age,
  height,
  weight,
  activityLevel,
  waistCircumference,
  hip,
  neckCircumference,
}: {
  gender: string | undefined;
  age: number | undefined;
  height: number | undefined;
  weight: number | undefined;
  activityLevel: string | undefined;
  waistCircumference?: number | undefined | null;
  hip: number | null;
  neckCircumference?: number | null;
}) {
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
    } else if (gender === "female") {
      bmr = 447.6 + 9.2 * weight + 3.1 * heightCm - 4.3 * age;
    } else {
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
    const tdee = bmr * activityMultiplier!;

    // Body Fat Percentage (Using Navy Method if Waist Circumference is Provided)
    let bodyFatPercentage = null;
    if (waistCircumference && neckCircumference && height) {
      if (gender === "male") {
        bodyFatPercentage =
          86.01 * Math.log10(waistCircumference - neckCircumference) -
          70.041 * Math.log10(heightInInches) +
          36.76;

        console.log(
          waistCircumference,
          neckCircumference,
          heightInInches,
          bodyFatPercentage
        );
      } else if (gender === "female" && hip) {
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
    } else if (gender === "female") {
      boneMass = weight * 0.12; // Approximate percentage for women
    } else {
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
  } catch (error: any) {
    return { error: `unable to calculate ${error.message}` };
  }
}

export async function generateWorkoutAdvice(updatedUser: updateSchema) {
  return await personalisedAi({ updatedUser, category: "workout" });
}

export async function generateHydrationAdvice(updatedUser: updateSchema) {
  return await personalisedAi({ updatedUser, category: "hydration" });
}

export async function generateSleepAdvice(updatedUser: updateSchema) {
  return await personalisedAi({ updatedUser, category: "sleep" });
}

export async function generateMotivationAdvice(updatedUser: updateSchema) {
  return await personalisedAi({ updatedUser, category: "motivation" });
}

export async function generateMealPlan(updatedUser: updateSchema) {
  return await personalisedAi({ updatedUser, category: "meals" });
}
export async function generateDietAdvice(updatedUser: updateSchema) {
  return await personalisedAi({ updatedUser, category: "diet" });
}
export async function encodeImageToBase64(filePath: string) {
  const imageBuffer = await fs.readFile(filePath);
  const mimeType = path.extname(filePath).includes("png")
    ? "image/png"
    : "image/jpeg";

  return {
    inlineData: {
      data: imageBuffer.toString("base64"),
      mimeType,
    },
  };
}

export async function geminiChatbot(customPrompt: string) {
  try {
    const result = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: customPrompt,
    });

    const response = result.text;
    const cleanedText = response
      ?.replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
    if (!cleanedText) {
      throw new Error("Failed to parse AI response: cleanedText is undefined");
    }
    return JSON.parse(cleanedText);
  } catch (error: any) {
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
}
