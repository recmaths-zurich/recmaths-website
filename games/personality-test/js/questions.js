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
            en: 'You are steady, reliable and perfectly balanced, treating everyone equally and having a strong sense of justice. You are the “what you see is what you get” type of person, which can make you bit predictable, but sometimes is exactly what you need in a world full of complications: someone who keeps things perfectly in line.',
            de: 'Du bist stabil, zuverlässig und perfekt ausgewogen, behandelst jeden gleich und hast ein starkes Gerechtigkeitsempfinden. Du bist der Typ „was du siehst, ist was du bekommst“, was dich etwas vorhersehbar machen kann, aber manchmal ist genau das was du in einer Welt voller Komplikationen brauchst: jemanden, der die Dinge perfekt in Ordnung hält.'
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
            en: "You are smooth, rhythmic, and perfectly in tune with life’s ups and downs. Your friends appreciate your reliability and impeccable sense of timing – they can always count on your periodic check-ins, and you bring waves of harmony wherever you go. Yet you rarely step outside your comfort zone and sometimes feel unsatisfied, as if life is always repeating the same cycles — but at least you never get led off on pointless tangents.",
            de: "Du bist sanft, rhythmisch und perfekt im Einklang mit den Höhen und Tiefen des Lebens. Deine Freunde schätzen deine Zuverlässigkeit und dein makelloses Timing – sie können sich immer auf deine regelmäßigen Besuche verlassen, und du bringst Wellen der Harmonie, wohin du auch gehst. Dennoch verlässt du selten deine Komfortzone und fühlst dich manchmal unzufrieden, als ob das Leben immer die gleichen Zyklen wiederholt – aber zumindest wirst du nie auf sinnlose Tangenten geführt."
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
            en: "You light up in a crowd, and your social circle multiplies fast: each new connection bigger than the one before. You’re lively yet methodical, always building on what’s come before. You only move in the positive direction, which keeps you upbeat, but sometimes you pile on so much that even you wonder how you’ll handle it all.",
            de: "Du leuchtest in einer Menschenmenge auf, und dein Freundeskreis vergrößert sich schnell: jede neue Verbindung ist größer als die vorherige. Du bist lebhaft und doch methodisch, baust immer auf dem auf, was zuvor kam. Du bewegst dich nur in positiver Richtung, was dich optimistisch hält, aber manchmal häufst du so viel an, dass du dich fragst, wie du das alles bewältigen wirst."
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
            en: "Your life is full of excitement: there’s always something happening, and you try to take part in it all. Friends know you as the life of the party, moving effortlessly from one moment to the next. But with so much going on, it’s easy to lose track; you might skip an obligation now and then or vanish for a while before reappearing right on cue, bringing a spark people can always count on.",
            de: "Dein Leben ist voller Aufregung: Es passiert immer etwas, und du versuchst, an allem teilzunehmen. Freunde kennen dich als das Leben der Party, das mühelos von einem Moment zum nächsten wechselt. Aber bei so viel los ist es leicht, den Überblick zu verlieren; du könntest jetzt und dann eine Verpflichtung auslassen oder eine Weile verschwinden, bevor du genau im richtigen Moment wieder auftauchst und einen Funken bringst, auf den die Leute sich immer verlassen können."
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
            en: "You grow at full speed, powered by a drive that comes entirely from within: you’re your own source of momentum. Bold and logical, you approach challenges with precision, planning each move to keep your exponential rise on track. But your focus on constant growth can make you sometimes seem cold and impatient with slower paces, and that’s when the logarithm helps bring you back down to earth.",
            de: "Du wächst mit voller Geschwindigkeit, angetrieben von einem Antrieb, der ganz aus dir selbst kommt: du bist deine eigene Quelle der Dynamik. Kühn und logisch gehst du Herausforderungen mit Präzision an und planst jeden Schritt, um dein exponentielles Wachstum auf Kurs zu halten. Aber dein Fokus auf ständiges Wachstum kann dich manchmal kalt und ungeduldig gegenüber langsameren Tempi erscheinen lassen, und dann hilft dir der Logarithmus, wieder auf den Boden der Tatsachen zurückzukommen."
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
            en: "You are content with the way things are and so stable that you might seem plain at first glance, but once people discover your interesting features, they can’t help but appreciate you more. You act irrationally and follow your emotions more than most, but that‘s exactly what makes you a great companion: always there to help and making sure everything‘s coming full circle.",
            de: "Du bist zufrieden mit dem, wie die Dinge sind und so stabil, dass du auf den ersten Blick vielleicht einfach erscheinst, aber sobald die Leute deine interessanten Eigenschaften entdecken, können sie nicht anders, als dich mehr zu schätzen. Du handelst irrational und folgst deinen Emotionen mehr als die meisten, aber genau das macht dich zu einem großartigen Begleiter: immer da, um zu helfen und sicherzustellen, dass alles wieder in Einklang kommt."
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
            en: "You prefer a quiet, measured pace: quick to respond at first, then settling into a slow, deliberate flow. Structure is your comfort zone, and you like keeping things orderly and proportional. As the inverse of the exponential, you’re the one who brings their boundless energy back into balance. Some may see your reserved nature as a lack of drive, but you simply know the value of setting limits and keeping life within bounds.",
            de: "Du bevorzugst ein ruhiges, gemessenes Tempo: Zunächst schnell in der Reaktion, dann in einen langsamen, bedachten Fluss übergehend. Struktur ist deine Komfortzone, und du magst es, die Dinge ordentlich und proportional zu halten. Als Inverses des Exponentialen bist du derjenige, der ihre grenzenlose Energie wieder ins Gleichgewicht bringt. Einige sehen deine zurückhaltende Natur vielleicht als Mangel an Antrieb, aber du kennst einfach den Wert von Grenzen und hältst das Leben im Rahmen."
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
            en: 'You share the same steady rhythm as your friend sin(x), but navigate life mostly by intuition rather than calculation. You start at the peak and then just go with the flow, following the sines, which can sometimes leave you feeling overly dependent on others and a bit out of sync with the world. Still, that unique phase is what makes you who you are, adding just the right shift to keep things interesting.',
            de: 'Du teilst den gleichen stetigen Rhythmus wie dein Freund sin(x), navigierst aber das Leben hauptsächlich nach Intuition und nicht nach Berechnung. Du startest am Gipfel und gehst dann einfach mit dem Fluss, folgst den Sinuskurven, was dich manchmal etwas zu abhängig von anderen und ein wenig aus dem Takt mit der Welt fühlen lässt. Dennoch ist diese einzigartige Phase das, was dich ausmacht und genau die richtige Verschiebung hinzufügt, um die Dinge interessant zu halten.'
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
            en: "You move through life with quiet precision, logical to the core and never straying from your straight path. You value clear rules and the elegance of simple solutions, taking satisfaction in keeping things perfectly balanced. Your tendency to flip situations around can make you seem overly negative at times, but in truth you’re simply showing the other side, a perspective that keeps everything in check.",
            de: "Du bewegst dich mit ruhiger Präzision durch das Leben, logisch bis ins Mark und weicht nie von deinem geraden Weg ab. Du schätzt klare Regeln und die Eleganz einfacher Lösungen und findest Zufriedenheit darin, die Dinge perfekt im Gleichgewicht zu halten. Deine Neigung, Situationen umzudrehen, kann dich manchmal zu negativ erscheinen lassen, aber in Wahrheit zeigst du einfach die andere Seite, eine Perspektive, die alles im Gleichgewicht hält."
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