import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { getUserTweets, createTweet, updateTweet, deleteTweet } from "../controllers/tweet.controller.js";

const router = Router();
router.use(verifyJWT);

router.route("/").post(createTweet);
router.route("/user/:userId").get(getUserTweets)
router.route("/:tweetId").patch(updateTweet).delete(deleteTweet);

export default router;