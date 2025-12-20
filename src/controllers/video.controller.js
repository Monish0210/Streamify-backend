import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { Video } from "../models/video.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import mongoose, { isValidObjectId } from "mongoose";

const getAllVideos = asyncHandler(async (req, res) => {
    const {
        page = 1,
        limit = 10,
        query,
        sortBy = "createdAt",
        sortType = "desc",
        userId
    } = req.query

    const matchStage = {};

    if(query){
        matchStage.$or = [
            { title: { $regex: query, $options: "i" } },
            { description: { $regex: query, $options: "i" } }
        ];
    }

    if(userId && isValidObjectId(userId)){
        matchStage.owner = new mongoose.Types.ObjectId(userId)
    }

    matchStage.isPublished = true;

    const sortOptions = {};
    sortOptions[sortBy] = sortType === "desc" ? -1 : 1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const videos = await Video.aggregate([
        {
            $match: {
                matchStage
            }
        },
        {
            $lookup: {
                from: "users",
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
                    $first: "$owner"
                }
            }
        },
        {
            $sort: sortOptions
        },
        {
            $skip: skip
        },
        {
            $limit: parseInt(limit)
        }
    ]);

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            videos,
            "Videos fetched successfully"
        )
    )

})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    
    const video = await Video.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            fullName: 1,
                            avatar: 1,
                            subscribersCount: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                owner: { $first: "$owner" }
            }
        }
    ]);

    if(!video?.length){
        throw new ApiError(404, "Video not found");
    }

    await Video.findByIdAndUpdate(
        videoId,
        {
            $inc: { views: 1 }
        }
    );

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            video[0],
            "Video fetched successfully"
        )
    )
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body;
    
    if([title, description].some((field) => field?.trim() === "")){
        throw new ApiError(400, "Title and Description are required");
    }

    const videoLocalPath = req.files?.videoFile[0]?.path;
    const thumbnailLocalPath = req.files?.thumbnail[0]?.path;

    if(!videoLocalPath){
        throw new ApiError(400, "Video file is required");
    }
    if(!thumbnailLocalPath){
        throw new ApiError(400, "Thumbnail file is required");
    }

    const videoFile = await uploadOnCloudinary(videoLocalPath);
    const thumbnailFile = await uploadOnCloudinary(thumbnailLocalPath);

    if(!videoFile){
        throw new ApiError(500, "Video file upload failed");
    }
    if(!thumbnailFile){
        throw new ApiError(500, "Thumbnail file upload failed");
    }

    const video = await Video.create({
        videoFile: videoFile.url,
        thumbnail: thumbnailFile.url,
        title: title,
        description: description,
        duration: videoFile.duration,
        isPublished: true,
        owner: req.user._id
    });

    return res
    .status(201)
    .json(
        new ApiResponse(
            201,
            video,
            "Video published successfully"
        )
    )
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { title, description } = req.body;

    const video = await Video.findById(videoId);
    if(!video){
        throw new ApiError(404, "Video not found");
    }

    if(video.owner.toString() !== req.user._id.toString()){
        throw new ApiError(403, "You are unauthorized to update this video");
    }

    let thumbnailUrl = video.thumbnail;
    if(req.file){
        const thumbnailLocalPath = req.file.path;
        const uploadedThumbnail = await uploadOnCloudinary(thumbnailLocalPath);

        if(!uploadedThumbnail){
            throw new ApiError(500, "Failed to upload new thumbnail");
        }

        thumbnailUrl = uploadedThumbnail.url;
    }

    if(!title && !description && !req.file){
        throw new ApiError(400, "Atleast one field is required to update");
    }

    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                title: title || video.title,
                description: description || video.description,
                thumbnail: thumbnailUrl
            }
        },
        { new: true }
    );

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            updatedVideo,
            "Video updated successfully"
        )
    )
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    const video = await Video.findById(videoId);
    if(!video){
        throw new ApiError(404, "Video not found");
    }

    if(video.owner.toString() !== req.user._id.toString()){
        throw new ApiError(403, "You are unauthorized to delete this video");
    }

    await Video.findByIdAndDelete(videoId);

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {},
            "Video deleted successfully"
        )
    )
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    const video = await Video.findById(videoId);
    if(!video){
        throw new ApiError(404, "Video not found");
    }

    if(video.owner.toString() !== req.user._id.toString()){
        throw new ApiError(403, "You are unauthorized");
    }

    video.isPublished = !video.isPublished;
    await video.save({ validateBeforeSave: false });

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            video,
            "Publish status toggled"
        )
    )
}) 

export{
    getAllVideos,
    getVideoById,
    publishAVideo,
    togglePublishStatus,
    updateVideo,
    deleteVideo
}