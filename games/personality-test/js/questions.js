// Test determines a mathematical function that fits you. For example: sin(x)

// Test Result Axes:
// 1. Oscillation (how calm/steady someone is)
// 2. Growth (how bold/loud/"extroverted" someone is)
// 3. Chaotic (how chaotic/organized/creative someone is)
// 4. Logical (how logical/emotional someone is)

// questions should ideally be puns on mathematical functions and personality traits

const TestResultCategories = {
    Oscillation: 1,
    Growth: 2,
    Chaotic: 3,
    Logical: 4
}

const TestResultCategoryNames = {
    Chaotic: {
        en: "Chaotic",
        de: "Chaotisch"
    },
    Logical: {
        en: "Logical",
        de: "Logisch"
    },
    Oscillation: {
        en: "Oscillation",
        de: "Schwingung"
    },
    Growth: {
        en: "Growth",
        de: "Wachstum"
    }
}

const TestQuestions = [
    {
        statement: {
            en: "You enjoy taking risks.",
            de: "Du genießt es, Risiken einzugehen."
        },
        effect: {
            agree: { Growth: 0.7, Oscillation: -1.2 },
            disagree: { Growth: -0.6, Oscillation: 1.03 }
        }
    },
    {
        statement: {
            en: "You know your limits and don't push them.",
            de: "Du kennst deine Grenzen und überschreitest sie nicht."
        },
        effect: {
            agree: { Growth: -1.2 },
            disagree: { Growth: 0.82 }
        }
    },
    {
        statement: {
            en: "You are very organized and like to plan ahead.",
            de: "Du bist sehr organisiert und planst gerne im Voraus."
        },
        effect: {
            agree: { Chaotic: -1.3 },
            disagree: { Chaotic: 1.1 }
        }
    },
    {
        statement: {
            en: "When your heart disagrees with your mind, you follow your heart.",
            de: "Wenn dein Herz nicht mit deinem Verstand übereinstimmt, folgst du deinem Herzen."
        },
        effect: {
            agree: { Logical: -0.9 },
            disagree: { Logical: 1.2 }
        }
    },
    {
        statement: {
            en: "You are always on the move and can't sit still.",
            de: "Du bist immer in Bewegung und kannst nicht stillsitzen."
        },
        effect: {
            agree: { Oscillation: 1.4 },
            disagree: { Oscillation: -1.1 }
        }
    },
    {
        statement: {
            en: "You like to be the center of attention.",
            de: "Du magst es, im Mittelpunkt zu stehen."
        },
        effect: {
            agree: { Growth: 1.1 },
            disagree: { Growth: -1.2 }
        }
    },
    {
        statement: {
            en: "You are very emotional and always follow your feelings.",
            de: "Du bist sehr emotional und folgst immer deinen Gefühlen."
        },
        effect: {
            agree: { Logical: -1.8 },
            disagree: { Logical: 1.6 }
        }
    },
    {
        statement: {
            en: "You like to take things slow and steady.",
            de: "Du magst es, die Dinge langsam und stetig anzugehen."
        },
        effect: {
            agree: { Oscillation: -1, Chaotic: 0.5, Growth: -0.5 },
            disagree: { Oscillation: 1, Chaotic: -0.5, Growth: 0.5 }
        }
    },
    {
        statement: {
            en: "You don't like to try new things and experiment.",
            de: "Du magst es nicht, neue Dinge auszuprobieren und zu experimentieren."
        },
        effect: {
            agree: { Chaotic: -1.2, Growth: -0.59 },
            disagree: { Chaotic: 1.1, Growth: 0.52 }
        }
    },
    {
        statement: {
            en: "You love prime numbers.",
            de: "Du liebst Primzahlen."
        },
        effect: {
            agree: { Chaotic: 0.6, Oscillation: -0.6, Logical: 0.7 },
            disagree: { Chaotic: -0.8, Oscillation: 0.45, Logical: -0.6 }
        }
    },
    {
        statement: {
            en: "You love calculating derivatives.",
            de: "Du liebst es, Ableitungen zu berechnen."
        },
        effect: {
            agree: { Chaotic: -0.5, Logical: 1.2 },
            disagree: { Chaotic: 0.7, Logical: -1 }
        }
    },
    {
        statement: {
            en: "You have a favorite mathematical constant.",
            de: "Du hast eine Lieblings mathematische Konstante."
        },
        effect: {
            agree: { Chaotic: -0.3, Oscillation: 0.5, Logical: 1.1 },
            disagree: { Chaotic: 0.6, Oscillation: -0.4, Logical: -1 }
        }
    },
    {
        statement: {
            en: "Sometimes you feel like you are on a rollercoaster.",
            de: "Manchmal fühlt es sich an, als wärst du auf einer Achterbahn."
        },
        effect: {
            agree: { Oscillation: 1.2, Chaotic: -0.8 },
            disagree: { Oscillation: -1.1, Chaotic: 0.7 }
        }
    },
    {
        statement: {
            en: "You often find yourself asking mathematical questions in everyday life.",
            de: "Du stellst dir oft mathematische Fragen im Alltag."
        },
        effect: {
            agree: { Logical: 1.3, Chaotic: 0.51 },
            disagree: { Logical: -1.2, Chaotic: -0.52 }
        }
    },
    {
        statement: {
            en: "You can't prove the irrationality of sqrt(2) without asking ChatGPT.",
            de: "Du kannst die Irrationalität von sqrt(2) nicht beweisen, ohne ChatGPT zu fragen."
        },
        effect: {
            agree: { Logical: -1.4, Chaotic: 0.7 },
            disagree: { Logical: 1.5, Chaotic: -0.6 }
        }
    },
    {
        statement: {
            en: "Small numbers are more interesting than large numbers.",
            de: "Kleine Zahlen sind interessanter als große Zahlen."
        },
        effect: {
            agree: { Growth: -2 },
            disagree: { Growth: 2.5 }
        }
    },
    {
        statement: {
            en: "You have been to a recreational Maths meetup.",
            de: "Du warst schon mal bei einem Recreational Maths Meetup."
        },
        effect: {
            agree: { Chaotic: 0.8, Growth: 0.6 },
            disagree: { Chaotic: -0.7, Growth: -0.5 }
        }
    },
    {
        statement: {
            en: "When playing games, you never think about the optimal strategy.",
            de: "Beim Spielen denkst du nie über die optimale Strategie nach."
        },
        effect: {
            agree: { Logical: -1.3, Chaotic: 0.6 },
            disagree: { Logical: 1.4, Chaotic: -0.5 }
        }
    },
    {
        statement: {
            en: "You enjoy teaching abstract concepts to others.",
            de: "Du erklärst anderen gerne abstrakte Konzepte."
        },
        effect: {
            agree: { Growth: 0.9, Chaotic: 0.2 },
            disagree: { Growth: -1.2, Chaotic: -0.1 }
        }
    },
    {
        statement: {
            en: "You prefer working alone rather than in a group.",
            de: "Du arbeitest lieber alleine als im Team."
        },
        effect: {
            agree: { Chaotic: -0.7, Growth: 0.5, Logical: 0.6, Oscillation: -0.4 },
            disagree: { Chaotic: 0.8, Growth: -0.6, Logical: -0.7, Oscillation: 0.5 }
        }
    }
]

// the results are normalized to the range [-1, 1]
const TestResults = [
    {
        termString: "x",
        location: {
            Growth: 0,
            Chaotic: 0,
            Logical: 0,
            Oscillation: 0
        },
        description: {
            en: "You are the identity function. You are very balanced and don't have any strong preferences. Some might say you are boring, but you are just very stable and reliable.",
            de: "Du bist die Identitätsfunktion. Du bist sehr ausgewogen und hast keine starken Vorlieben. Manche könnten sagen, du bist langweilig, aber du bist einfach sehr stabil und zuverlässig."
        },
    },
    {
        termString: "sin(x)",
        location: {
            Growth: 0,
            Chaotic: 0,
            Logical: 0,
            Oscillation: 1
        },
        description: {
            en: "You are the sine function. Your life is full of ups and downs, but you always come back to the same point. Life is a rollercoaster for you, but you enjoy the ride.",
            de: "Du bist die Sinusfunktion. Dein Leben ist voller Höhen und Tiefen, aber du kommst immer wieder zum gleichen Punkt zurück. Das Leben ist eine Achterbahnfahrt für dich, aber du genießt die Fahrt."
        }
    },
    {
        termString: "factorial(x)",
        location: {
            Growth: 1,
            Chaotic: 0,
            Logical: 0,
            Oscillation: 0
        },
        description: {
            en: "You are the factorial function. You are very bold and always take risks. You grow rapidly and don't fear to expand your horizons. Not everyone can keep up with you, but you are always ready to help others grow.",
            de: "Du bist die Fakultätsfunktion. Du bist sehr mutig und gehst immer Risiken ein. Du wächst schnell und scheust dich nicht, deine Horizonte zu erweitern. Nicht jeder kann mit dir Schritt halten, aber du bist immer bereit, anderen beim Wachsen zu helfen."
        }
    },
    {
        termString: "tan(x)",
        location: {
            Growth: 0,
            Chaotic: 1,
            Logical: 0,
            Oscillation: 0
        },
        description: {
            en: "You are the tangent function. You are very chaotic and unpredictable. You like to take risks and don't care about the consequences. You are always looking for new challenges and adventures.",
            de: "Du bist die Tangensfunktion. Du bist sehr chaotisch und unberechenbar. Du gehst gerne Risiken ein und kümmerst dich nicht um die Konsequenzen. Du suchst immer nach neuen Herausforderungen und Abenteuern."
        }
    },
    {
        termString: "e^x",
        location: {
            Growth: 1,
            Chaotic: 0,
            Logical: 1,
            Oscillation: 0
        },
        description: {
            en: "You are the exponential function. You are very logical and always follow a clear path. You grow rapidly and don't fear to expand your horizons. You are very reliable and always keep your promises. Your only enemy is the logarithm function, which tries to bring you down.",
            de: "Du bist die Exponentialfunktion. Du bist sehr logisch und folgst immer einem klaren Weg. Du wächst schnell und scheust dich nicht, deine Horizonte zu erweitern. Du bist sehr zuverlässig und hältst immer deine Versprechen. Dein einziger Feind ist die Logarithmusfunktion, die versucht, dich zu Fall zu bringen."
        }
    },
    {
        termString: "pi",
        location: {
            Growth: 0,
            Chaotic: 0,
            Logical: 0,
            Oscillation: -1
        },
        description: {
            en: "You are the constant pi. You are very stable and reliable, but you don't like to take risks. People can always count on you.",
            de: "Du bist die Konstante pi. Du bist sehr stabil und zuverlässig, aber du gehst keine Risiken ein. Die Leute können sich immer auf dich verlassen."
        }
    },
    {
        termString: "log(x)",
        location: {
            Growth: -1,
            Chaotic: -1,
            Logical: 0,
            Oscillation: 0
        },
        description: {
            en: "You are the logarithm function. You grow really really slowly, but are really quite useful! Friends can always count on you to help them solve their problems, even if it takes a while. Your only enemy is the exponential function, which tries to outgrow you.",
            de: "Du bist die Logarithmusfunktion. Du wächst wirklich sehr langsam, aber du bist wirklich nützlich! Freunde können sich immer darauf verlassen, dass du ihnen hilfst, ihre Probleme zu lösen, auch wenn es eine Weile dauert. Dein einziger Feind ist die Exponentialfunktion, die versucht, dich zu übertreffen."
        }
    },
    {
        termString: "abs(x-1)+abs(x+1)",
        location: {
            Growth: 0,
            Chaotic: 0,
            Logical: -1,
            Oscillation: 0
        },
        description: {
            en: "You make zero sense. You are the absolute value function, but you are always at least 2 units away from zero. You're really the most illogical function here, but that makes you fun and nice.",
            de: "Du machst keinen Sinn. Du bist die Absolutwertfunktion, aber du bist immer mindestens 2 Einheiten von Null entfernt. Du bist wirklich die unlogischste Funktion hier, aber das macht dich spaßig und nett."
        }
    },
    {
        termString: "sqrt(x)+sin(x)",
        location: {
            Growth: 0.3,
            Chaotic: -0.5,
            Logical: 0.5,
            Oscillation: 0.7
        },
        description: {
            en: "You are the square root function plus sine. You are very balanced and have a good mix of growth, chaos, logic, and oscillation. You are a very well-rounded person and can adapt to any situation.",
            de: "Du bist die Quadratwurzelfunktion plus Sinus. Du bist sehr ausgewogen und hast eine gute Mischung aus Wachstum, Chaos, Logik und Schwingung. Du bist eine sehr vielseitige Person und kannst dich jeder Situation anpassen."
        }
    },
    {
        termString: "x^2",
        location: {
            Growth: 0.5,
            Chaotic: 0,
            Logical: 1,
            Oscillation: -0.5
        },
        description: {
            en: "You are the quadratic function. You are very bold and always take risks. You grow rapidly and don't fear to expand your horizons. You are very reliable and always keep your promises.",
            de: "Du bist die quadratische Funktion. Du bist sehr mutig und gehst immer Risiken ein. Du wächst schnell und scheust dich nicht, deine Horizonte zu erweitern. Du bist sehr zuverlässig und hältst immer deine Versprechen."
        }
    },
    {
        termString: "cos(x)",
        location: {
            Growth: 0,
            Chaotic: 0,
            Logical: -1,
            Oscillation: 1
        },
        description: {
            en: "You are the cosine function. You are very stable and reliable, but you don't like to take risks. You really like your friend, the sine function, but you are always a bit behind. You are very logical and always follow a clear path.",
            de: "Du bist die Kosinusfunktion. Du bist sehr stabil und zuverlässig, aber du gehst keine Risiken ein. Du magst wirklich deinen Freund, die Sinusfunktion, aber du bist immer ein bisschen hinterher. Du bist sehr logisch und folgst immer einem klaren Weg." 
        }
    },
    {
        termString: "x^3",
        location: {
            Growth: -0.5,
            Chaotic: -0.3,
            Logical: 0.7,
            Oscillation: 0
        },
        description: {
            en: "You are the cubic function. You've been through a lot, but you always come out stronger. You are very logical and always follow a clear path. You are very reliable and always keep your promises.",
            de: "Du bist die kubische Funktion. Du hast viel durchgemacht, aber du kommst immer stärker heraus. Du bist sehr logisch und folgst immer einem klaren Weg. Du bist sehr zuverlässig und hältst immer deine Versprechen."
        }
    },
    {
        termString: "-x",
        location: {
            Growth: -1,
            Chaotic: -1,
            Logical: 1,
            Oscillation: 0
        },
        description: {
            en: "You are the negative identity function. You are very logical but tend to be pessimistic. You always see the negative side of things and don't like to take risks. You are very reliable and always keep your promises.",
            de: "Du bist die negative Identitätsfunktion. Du bist sehr logisch, neigst aber dazu, pessimistisch zu sein. Du siehst immer die negative Seite der Dinge und gehst keine Risiken ein. Du bist sehr zuverlässig und hältst immer deine Versprechen."
        }
    },

    // chatgpt helped with the following:
    {
        termString: "abs(x)",
        location: { Growth: 0.3, Chaotic: -0.6, Logical: 0.8, Oscillation: -0.2 },
        description: {
            en: "You are the absolute value. No matter how life dips, you bounce back non-negative. Steady, resilient, and sensibly practical.",
            de: "Du bist der Betrag. Egal, wie das Leben abfällt - du prallst nichtnegativ zurück. Beständig, widerstandsfähig und pragmatisch."
        }
    },
    {
        termString: "1/x",
        location: { Growth: 0.0, Chaotic: 0.7, Logical: 0.2, Oscillation: 0.1 },
        description: {
            en: "You're the reciprocal. Most days are smooth, but you have dramatic asymptotes. People learn to respect your boundaries.",
            de: "Du bist der Kehrwert. Meistens läuft es glatt, doch du hast dramatische Asymptoten. Man lernt, deine Grenzen zu respektieren."
        }
    },
    {
        termString: "sin(x)/x",
        location: { Growth: 0.1, Chaotic: -0.2, Logical: 0.4, Oscillation: 0.8 },
        description: {
            en: "You're sinc. You oscillate, but your waves settle. Big energy, then measured ripples—refined enthusiasm. Engineers love you.",
            de: "Du bist sinc. Du schwingst, aber die Wellen beruhigen sich. Erst viel Energie, dann maßvolle Wellen - verfeinerte Begeisterung. Ingenieure lieben dich."
        }
    },
    {
        termString: "e^(-x^2)",
        location: { Growth: -0.2, Chaotic: -0.6, Logical: 0.5, Oscillation: 0 },
        description: {
            en: "You're the Gaussian. Centered, focused, and soothing. People come to you when they need calm clarity.",
            de: "Du bist die Gauß-Funktion. Zentriert, fokussiert und beruhigend. Man kommt zu dir, wenn Ruhe und Klarheit gefragt sind."
        }
    },
    {
        termString: "cosh(x)",
        location: { Growth: 0.8, Chaotic: 0.0, Logical: 0.7, Oscillation: -0.3 },
        description: {
            en: "You're hyperbolic cosine. Quietly dramatic—no waves, just majestic rise. Ambitious with serene poise. You won't keep anyone hanging, because you're literally the formula of a chain hanging.",
            de: "Du bist der hyperbolische Kosinus. Leise dramatisch – keine Wellen, nur majestätischer Anstieg. Ehrgeizig mit gelassener Haltung. Du lässt niemanden hängen, denn du bist buchstäblich die Formel einer hängenden Kette."
        }
    },
    {
        termString: "arctan(x)",
        location: { Growth: -0.2, Chaotic: 0.5, Logical: -0.9, Oscillation: -0.5 },
        description: {
            en: "You're arctangent. You don't get carried away—everything saturates. Wise, bounded, and great at perspective.",
            de: "Du bist der Arkustangens. Du lässt dich nicht mitreißen - alles sättigt sich. Weise, begrenzt und stark in der Perspektive."
        }
    },
]