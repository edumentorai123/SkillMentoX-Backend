import Quiz from "../models/Quiz.js";
import userQuizProgress from "../models/userQuizProgress.js";


export const getQuizzes = async (req, res) => {
  try {
    const { stack } = req.query;
    const userId = req.user?.id;

    let filter = {};
    if (stack) {
      filter.stack = stack;
    }

    const quizzes = await Quiz.find(filter).lean();
    let userProgress = [];
    if (userId) {
      userProgress = await userQuizProgress.find({ userId }).lean();
    }

    const quizzesWithStatus = quizzes.map((quiz) => {
      const progress = userProgress.find((p) => p.quizId.toString() === quiz._id.toString());
      return {
        ...quiz,
        completed: !!progress?.completed,
        score: progress?.score || 0,
      };
    });

    res.status(200).json({ success: true, data: quizzesWithStatus });
  } catch (error) {
    console.error("Error fetching quizzes:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};


export const completeQuiz = async (req, res) => {
  try {
    const { quizId, score } = req.body;
    const userId = req.user?.id;

    if (!userId || !quizId) {
      return res.status(400).json({ success: false, message: "User ID and Quiz ID are required" });
    }

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ success: false, message: "Quiz not found" });
    }

    await UserQuizProgress.findOneAndUpdate(
      { userId, quizId },
      { completed: true, score, completedAt: new Date() },
      { upsert: true, new: true }
    );

    res.status(200).json({ success: true, message: "Quiz completed successfully" });
  } catch (error) {
    console.error("Error completing quiz:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};


export const seedQuizzes = async (req, res) => {
  try {
    const existing = await Quiz.countDocuments();
    if (existing > 0) {
      return res.status(400).json({ success: false, message: "Quizzes already seeded" });
    }

    const initialQuizzes = [
      {
        title: "JavaScript Fundamentals",
        subject: "JavaScript",
        difficulty: "Easy",
        stack: "MERN Stack",
        questions: [
          {
            question: "What is the correct way to declare a variable in JavaScript?",
            options: ["var x = 5;", "variable x = 5;", "v x = 5;", "declare x = 5;"],
            correct: 0,
          },
          {
            question: "Which method adds an element to the end of an array?",
            options: ["push()", "pop()", "shift()", "unshift()"],
            correct: 0,
          },
        ],
      },
      {
        title: "React Advanced Concepts",
        subject: "React",
        difficulty: "Hard",
        stack: "MERN Stack",
        questions: [
          {
            question: "What is the purpose of useMemo in React?",
            options: [
              "To memoize components",
              "To memoize expensive calculations",
              "To handle side effects",
              "To manage state",
            ],
            correct: 1,
          },
        ],
      },
      {
        title: "Python Basics",
        subject: "Python",
        difficulty: "Easy",
        stack: "Python Stack",
        questions: [
          {
            question: "How do you define a function in Python?",
            options: ["function myFunc():", "def myFunc():", "create myFunc():", "func myFunc():"],
            correct: 1,
          },
        ],
      },
      {
        title: "Django Fundamentals",
        subject: "Django",
        difficulty: "Medium",
        stack: "Python Stack",
        questions: [
          {
            question: "What is the purpose of Django's ORM?",
            options: [
              "To handle HTTP requests",
              "To interact with the database",
              "To manage templates",
              "To configure URLs",
            ],
            correct: 1,
          },
        ],
      },
    ];

    await Quiz.insertMany(initialQuizzes);
    res.status(201).json({ success: true, message: "Quizzes seeded successfully" });
  } catch (error) {
    console.error("Error seeding quizzes:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};