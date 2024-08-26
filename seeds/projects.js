const mongoose = require('mongoose');
const Project = require('../models/projects');

mongoose.connect('mongodb://localhost:27017/NewProject', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});
const projectsDatas = [
    {
        title: 'AI Brain',
        description: "An AI brain created using Python is essentially a smart system that learns from data to perform tasks. Imagine it as a digital brain that can understand, reason, and make decisions like a human, but it runs on code written in Python. This AI brain can do a lot of things, depending on how it's trained. For example, it could recognize faces in photos, translate languages, recommend movies you might like, or even play games like chess. Think of it as a super-smart assistant that can analyze information, find patterns, and provide helpful insights or actions. What makes Python a popular choice for building these AI brains is its simplicity and the vast libraries available for machine learning and AI tasks. So, with Python, developers can easily create AI brains that learn from data and become smarter over time. It's like teaching a computer to think and act on its own, opening up a world of possibilities for automation and intelligent decision-making.",
        images: [{url: "/Ai_Brain.png",
            filename: "Ai_Brain"}
        ]
    },
    {
        title: "Calculator",
        description: "This Java calculator is a basic yet effective tool for performing arithmetic operations. Users input two numbers and select an operation from addition, subtraction, multiplication, or division. The program then computes the result and displays it to the user. Its simplicity makes it accessible to users of all levels, from beginners to experienced programmers. What sets this calculator apart is its error-handling capabilities. It checks for common errors like division by zero and alerts users to input mistakes, ensuring accurate results. This attention to detail enhances user experience and confidence in the calculator's output. Overall, with its user-friendly interface and robust error handling, this Java calculator is a reliable choice for anyone in need of quick and accurate mathematical computations.",
        images: [{url: "/calculator_java.jpeg",
            filename: "calculator_java"}
        ]
    },
    {
        title: "Chess",
        description: "Chess coding in Java presents an intricate challenge, involving the creation of a program that mirrors the rules and intricacies of the timeless game of chess. Developers embark on a journey of constructing classes to model the chessboard, individual pieces, and the intricate game logic that governs each move. This often includes establishing algorithms for validating moves, detecting checkmate scenarios, and managing the dynamic state of the game. In this endeavor, programmers delve into object-oriented design principles to encapsulate the behavior and properties of each chess piece. Through careful implementation, they aim to accurately simulate the strategic depth and complexity of chess, ensuring that the program enforces the rules of the game and provides an immersive experience for players. Overall, chess coding in Java is a fascinating exploration of algorithmic problem-solving, requiring a deep understanding of both the game's mechanics and Java's language features to craft a robust and enjoyable chess-playing experience.",
        images: [{url: "/Chess_java.jpeg",
            filename: "Chess_java"}
        ]
    },
    {
        title: "Music player",
        description: "Creating a music player in Python opens up a world of possibilities for music enthusiasts and developers alike. In such a project, developers typically leverage libraries like Pygame or Tkinter to build a graphical user interface (GUI) for the player, allowing users to navigate their music library with ease. Through Python's extensive ecosystem of audio processing libraries, developers can implement features such as playing, pausing, skipping tracks, adjusting volume, and even creating playlists. Additionally, integrating functionalities like audio visualization or equalizer settings enhances the user experience, providing a dynamic and immersive way to interact with music. Python's flexibility enables developers to tailor the music player to their preferences, whether they're creating a minimalistic player for personal use or a feature-rich application for broader audiences. Overall, coding a music player in Python is not only a rewarding technical challenge but also an opportunity to create a personalized and enjoyable listening experience for users.",
        images: [{url: "/music-player-python-project.webp",
            filename: "music-player-python-project"}
        ]
    }
];

const seedDB = async () => {
    await Project.deleteMany({});

    try {
        //const res = await fetch('https://fakestoreapi.com/products?limit=20');
        //const json = await res.json();
        for (let i = 0; i < projectsDatas.length; i++) {
            //const random1000 = Math.floor(Math.random() * 19);
            const project = new Project({
                author: 'sampleUser',
                title: projectsDatas[i].title,
                description: projectsDatas[i].description,
                images: [
                    {
                        url: projectsDatas[i].images[0].url,
                        filename: projectsDatas[i].images[0].filename
                    }
                ],
                id: "66cc621acc14ca4d9c5d47c7"
            });
            await project.save(); // Save each product
        }
    } catch (err) {
        console.error(err);
    }
};


seedDB().then(() => {
    mongoose.connection.close();
})