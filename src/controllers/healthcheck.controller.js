import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { ApiError } from "../utils/ApiError.js"
import mongoose from "mongoose"

const healthcheck = asyncHandler(async (req, res) => {
    const dbStatus = mongoose.connection.readyState === 1 ? "Connected" : "Disconnected";
    const healthStatus = {
        status: "OK",
        timestamp: new Date().toISOString(),
        service: "Streamify-Backend",
        dbStatus,
        uptime: process.uptime()
    }

    if(dbStatus !== "Connected"){
        throw new ApiError(503, "Database not connected");
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            healthStatus,
            "Health Check passed successfully"
        )
    )
})

export { healthcheck }