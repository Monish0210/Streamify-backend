import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { Subscription } from "../models/subscription.model.js";
import mongoose from "mongoose";
import { User } from "../models/user.model.js";

const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params;

    const subscribedChannels = await Subscription.aggregate([
        {
            $match: {
                subscriber: new mongoose.Types.ObjectId(subscriberId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "channel",
                foreignField: "_id",
                as: "subscribedChannel",
                pipeline: [
                    {
                        $project: {
                            fullName: 1,
                            username: 1,
                            avatar: 1,
                            subscribersCount: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                subscribedChannel: {
                    $first: "$subscribedChannel"
                }
            }
        },
        {
            $project: {
                _id: 0,
                subscribedChannel: 1,
                createdAt : 1
            }
        }
    ])

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            subscribedChannels,
            "Subscribed channels fetched successfully"
        )
    )
})

const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    if(channelId.toString() === req.user?._id.toString()){
        throw new ApiError(400, "You cannot subscibe to your own channel");
    }

    const isSubscribed = await Subscription.findOne({
        subscriber: req.user._id,
        channel: channelId
    })

    if(isSubscribed){
        await Subscription.findByIdAndDelete(isSubscribed._id);
        await User.findByIdAndUpdate(
            channelId,
            {
                $inc: {
                    subscribersCount: -1
                }
            }
        )
        await User.findByIdAndUpdate(
            req.user._id,
            {
                $inc: {
                    channelsSubscribedToCount: -1
                }
            }
        )

        return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { subscribed: false },
                "Unsubscribed successfully"
            )
        )
    }
    else{
        await Subscription.create({
            subscriber: req.user._id,
            channel: channelId
        });
        await User.findByIdAndUpdate(
            channelId,
            {
                $inc: {
                    subscribersCount: 1
                }
            }
        )
        await User.findByIdAndUpdate(
            req.user._id,
            {
                $inc: {
                    channelsSubscribedToCount: 1
                }
            }
        )

        return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { subscribed: true },
                "Subscribed successfully"
            )
        )
    }
})

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    const subscribers = await Subscription.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                as: "subscriber",
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
                subscriber: {
                    $first: "$subscriber"
                }
            }
        },
        {
            $project: {
                subscriber: 1,
                createdAt: 1
            }
        }
    ])

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            subscribers,
            "Subscribers fetched successfully"
        )
    )
})

export{
    getSubscribedChannels,
    toggleSubscription,
    getUserChannelSubscribers
}