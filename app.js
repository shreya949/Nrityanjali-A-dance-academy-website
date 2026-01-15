// app.js
import session from "express-session";
import express from "express";
import path from "path";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import { fileURLToPath } from "url";

// For __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 8011;

// Mongoose connection
async function main() {
    try {
        await mongoose.connect("mongodb://127.0.0.1:27017/contactDance");
        console.log("✅ Connected to MongoDB!");
    } catch (err) {
        console.error("❌ Error:", err);
    }
}
main();

// Define schema and model (outside the function)
const contactSchema = new mongoose.Schema({
    name: String,
    email: String,
    phone: String,
    message: String
});
const Contact = mongoose.model("Contact", contactSchema);

// User Schema
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    password: { type: String, required: true }
});

const User = mongoose.model("User", userSchema);


// Middleware
app.use("/static", express.static(path.join(__dirname, "static")));
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: "SecretKeyForDanceAcademy",
    resave: false,
    saveUninitialized: true
}));
app.use((req, res, next) => {
    res.locals.loggedUser = req.session.user || null;
    next();
});


// View engine setup
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

// Routes
app.get("/", (req, res) => {
    res.status(200).render("home.pug", { title: "Shreya's Dance Academy" });
});

app.get("/about", (req, res) => {
    res.status(200).render("about.pug", { title: "About - Shreya's Dance Academy" });
});

app.get("/sponser", (req, res) => {
    res.status(200).render("sponser.pug", { title: "Classes - Shreya's Dance Academy" });
});

app.get("/classes", (req, res) => {
    res.status(200).render("class.pug", { title: "Sponser - Shreya's Dance Academy" });
});


app.get("/contact", (req, res) => {
    res.status(200).render("contact.pug", { title: "Contact - Shreya's Dance Academy" });
});

// Login Page
app.get("/login", (req, res) => {
    res.status(200).render("login.pug", { title: "Login - Shreya's Dance Academy" });
});

// Signup Page
app.get("/signup", (req, res) => {
    res.status(200).render("signup.pug", { title: "Sign Up - Shreya's Dance Academy" });
});

app.get("/logout", (req, res) => {
    req.session.destroy(() => {
        res.redirect("/login");
    });
});



app.post("/contact", async (req, res) => {
    try {
        const myData = new Contact(req.body);
        await myData.save();
        res.status(200).render("contact.pug", { message: "This item was saved in DB!" });
    } catch (err) {
        res.status(400).send("❌ Item was not saved in the database");
    }
});

// Signup POST
app.post("/signup", async (req, res) => {
    try {
        const newUser = new User(req.body);
        await newUser.save();
        res.status(200).render("login.pug", { message: "Signup successful! Please login." });
    } catch (err) {
        res.status(400).render("signup.pug", { message: "Error: Email might already exist." });
    }
});

// Login POST
app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email: email });

        if (user && user.password === password) { // later bcrypt ✅
            req.session.user = user.name;  // ✅ Save username in session
            return res.redirect("/"); // ✅ redirect instead of rendering directly
        } else {
            return res.status(400).render("login.pug", {
                message: "Invalid email or password!"
            });
        }
    } catch (err) {
        res.status(500).send("Server error");
    }
});



// Start server
app.listen(port, () => {
    console.log(`🚀 Server started successfully on http://localhost:${port}`);
});
