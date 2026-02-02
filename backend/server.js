require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require("./routes/authRoutes");
const urlRoutes = require("./routes/urlRoutes");
const Url = require("./models/Url");

const connectDB = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use("/api/auth" , authRoutes);
app.use("/api/url" , urlRoutes);

app.get('/', (req, res) => {
    res.send('URL Shortener Service is running');
});

app.get("/:shortCode" , async (req, res) => {
    try{
        const {shortCode} = req.params;
        
        //get url from db
        const urlEntry = await Url.findOne({shortCode});

        //if not found 
        if(!urlEntry){
            return res.status(404).json({
                message : "Short URL not found"
            });
        }

        //check expiration
        if(urlEntry.expiresAt && urlEntry.expiresAt < new Date()){
            return res.status(410).json({
                message : "Short URL has expired"
            });
        }

        //increment click count
        urlEntry.clicks += 1;
        await urlEntry.save();

        //redirect to original url
        return res.redirect(urlEntry.originalUrl);
        
    }
    catch(error){
        console.error("Error in URL redirection:", error.message);
        res.status(500).json({
            message : "Server error"
        });
    }
});

const startServer = async () => {
    try{
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
    }
    catch(error){
        console.error("Failed to start server" , error.message);
        process.exit(1);
};

startServer();
