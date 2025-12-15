import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getLikedVideos, toggleCommentLike, toggleTweetLike, toggleVideoLike } from "../controllers/like.controller.js";

const router = Router();
router.use(verifyJWT) // This applies the auth middleware to all the 'like' routes

router.route("/toggle/video/:videoId").post(toggleVideoLike)
router.route("toggle/comment/:commentId").post(toggleCommentLike)
router.route("toggle/tweet/:tweetId").post(toggleTweetLike)
router.route("/videos").get(getLikedVideos)

export default router