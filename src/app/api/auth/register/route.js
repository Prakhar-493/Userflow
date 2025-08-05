import { NextResponse } from "next/server";
import connectDb from "../../../../../db/connectDb";
import User from "../../../../../models/User";
import bcrypt from "bcryptjs";
import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL);

export async function POST(request) {
  try {
    const { email, otp } = await request.json();
    // Retrieve OTP and userDetails from Redis
    const redisData = await redis.get(email);
    if (!redisData) {
      return NextResponse.json(
        { message: "OTP not found. Please request a new one." },
        { status: 400 }
      );
    }
    const storedData = JSON.parse(redisData);
    if (Date.now() > storedData.expiration) {
      await redis.del(email);
      return NextResponse.json(
        { message: "OTP has expired." },
        { status: 400 }
      );
    }
    if (otp !== storedData.otp) {
      return NextResponse.json({ message: "Invalid OTP." }, { status: 400 });
    }

    // --- 2. Create User (Original Logic) ---
    await connectDb();
    const { userDetails } = storedData;

    // Hash the password before saving
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userDetails.password, salt);

    const newUser = await User.create({
      fullName: userDetails.fullName,
      email: userDetails.email,
      phone: userDetails.phone,
      password: hashedPassword,
    });

    // Clean up the Redis store
    await redis.del(email);

    return NextResponse.json(
      {
        message: "User registered successfully!",
        user: {
          id: newUser._id,
          email: newUser.email,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("VERIFY OTP CATCH BLOCK ERROR:", error);
    return NextResponse.json(
      { message: "Server error during verification." },
      { status: 500 }
    );
  }
}
