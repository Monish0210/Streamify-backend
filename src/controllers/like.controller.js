import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { Like } from "../models/like.model.js";
import mongoose, { isValidObjectId } from "mongoose";

const getLikedVideos = asyncHandler(async (req, res) => {
    const likedVideos = await Like.aggregate([
        // 1. Find all 'Like' documents created by this user
        {
            $match: {
                likedBy : new mongoose.Types.ObjectId(req.user._id)
            }
        },
        // 2. Fetch the 'video' details for each like
        {
            $lookup: {
                from : "videos",
                localField: "video",
                foreignField: "_id",
                as: "likedVideo",
                //3. Inside each video, fetch the owner details
                pipeline: [
                    {
                        $lookup: {
                            from : "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullName: 1,
                                        username: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            owner: {
                                $first : "$owner"
                            }
                        }
                    }
                ]
            }
        },
        //4. Convert the array to an object and Filter out empty results 
        {
            $unwind: "$likedVideo"
        },
        //5. We replace the root document with just the video info
        {
            $replaceRoot :{
                newRoot: "$likedVideo"
            }
        }
    ]);

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            likedVideos,
            "Liked Videos Fetched successfully"
        )
    );
})

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid Video Id");
    }

    const existingLike = await Like.findOne({
        video : videoId,
        likedBy: req.user._id
    })

    if(existingLike){
        await Like.findByIdAndDelete(existingLike._id);

        return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { isLiked: false },
                "Video Unliked Successfully"
            )
        )
    }
    else{
        await Like.create({
            video: videoId,
            likedBy: req.user._id
        })

        return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { isLiked: true },
                "Video Liked Successfully"
            )
        )
    }
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params

    if(!isValidObjectId(commentId)){
        throw new ApiError(400, "Invalid Comment Id")
    }

    const existingLike = await Like.findOne({
        comment : commentId,
        likedBy: req.user._id
    })

    if(existingLike){
        await Like.findByIdAndDelete(existingLike._id)
        return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { isLiked: false },
                "Comment Unliked Successfully"
            )
        )
    }
    else{
        await Like.create({
            comment: commentId,
            likedBy: req.user._id
        })

        return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { isLiked: true },
                "Comment Liked Successfully"
            )
        )
    }
})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params

    if(!isValidObjectId(tweetId)){
        throw new ApiError(400, "Invalid Tweet Id")
    }

    const existingLike = await Like.findOne({
        tweet: tweetId,
        likedBy: req.user._id
    })

    if(existingLike){
        await Like.findByIdAndDelete(existingLike._id)
        return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { isLiked: false },
                "Tweet Unliked Successfully" 
            )
        )
    }
    else{
        await Like.create({
            tweet: tweetId,
            likedBy: req.user._id
        })

        return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { isLiked: true },
                "Tweet Liked Successfully"
            )
        )
    }
})

export {
    getLikedVideos,
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike
}