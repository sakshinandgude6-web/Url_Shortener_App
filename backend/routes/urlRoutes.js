const express = require('express');
const router = express.Router();
const {nanoid} = require("nanoid");
const Url = require("../models/Url");
const authMiddleware = require("../middleware/authMiddleware");

// api route to get all urls created by logged in user
router.get("/my", authMiddleware, async (req, res) => {
  try {
    // Get user ID from auth middleware
    const userId = req.user.id;

    // Fetch URLs created by the user
    const urls = await Url.find({ userId })
      .sort({ createdAt: -1 });

    // Send response
    res.status(200).json(urls);

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error"
    });
  }
});

//api route to shorten url 
router.post("/shorten" , authMiddleware , async (req, res) => {
    try{
        // extract data from request
        const {originalUrl , expiresAt} = req.body;

        //validate originalUrl
        if(!originalUrl){
            return res.status(400).json({
                message : "Original URL is required"
            });
        }

        //check if url already exists for user
        const exisitingUrl = await Url.findOne({
            originalUrl : originalUrl,
            userId : req.user.id
        });

        if(exisitingUrl){
            return res.status(200).json({
                shortCode : exisitingUrl.shortCode,
                message : "URL already shortened"
            });
        }

        //generate short code
        const shortCode = nanoid(7);

        //create new url document
        const newUrl = new Url({
            originalUrl: originalUrl,
            shortCode: shortCode,
            userId: req.user.id,     
            expiresAt: expiresAt || null
        });

        //save to db
        await newUrl.save();

        //send response
        res.status(201).json(newUrl);

    }
    catch(error){
        console.error("Error in URL shortening:", error.message);
        res.status(500).json({
            message : "Server error"
        });
    }
});

// api route to delete a shortened url
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const urlId = req.params.id;
    const userId = req.user.id;

    //Find the URL
    const url = await Url.findById(urlId);

    if (!url) {
      return res.status(404).json({
        message: "URL not found"
      });
    }

    //Check ownership
    // Only the owner can delete it
    if (url.userId.toString() !== userId) {
      return res.status(403).json({
        message: "You are not allowed to delete this URL"
      });
    }

    //Delete the URL
    await Url.findByIdAndDelete(urlId);

    return res.status(200).json({
      message: "URL deleted successfully"
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Server error"
    });
  }
});

router.get("/:id/stats", authMiddleware, async (req, res) => {
    try{
        //get url and user id 
        const urlId = req.params.id;
        const userId = req.user.id;

        //find url and verify 
        const url = await Url.findById(urlId);
        if(!url){
            return res.status(404).json({
                message : "URL not found"
            });
        }

        //check ownership
        if(url.userId.toString() !== userId){
            return res.status(403).json({
                message : "You are not authorized to view stats for this URL"
            });
        }

        //send stats response
        return res.status(200).json({
            id: url._id,
            originalUrl: url.originalUrl,
            shortCode: url.shortCode,
            createdAt: url.createdAt,
            updatedAt: url.updatedAt,
            accessCount: url.clicks
        });
    }
    catch(error){
        console.error(error);
        return res.status(500).json({
            message: "Server error"
        });
    }
});


module.exports = router;
