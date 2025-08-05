import { NextResponse } from "next/server";
import connectDb from "../../../../../db/connectDb";
import User from "../../../../../models/User";
import nodemailer from "nodemailer";
import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL);

// Configure Nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function POST(request) {
  try {
    await connectDb();
    const body = await request.json();
    const { fullName, email, password, phone } = body;

    // --- Validation ---
    if (!fullName || fullName.trim().length < 3) {
      return NextResponse.json(
        { message: "Full name must be at least 3 characters long." },
        { status: 400 }
      );
    }
    const emailRegex =
      /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (!email || !emailRegex.test(email)) {
      return NextResponse.json(
        { message: "Please provide a valid email address." },
        { status: 400 }
      );
    }
    const passwordRules = [
      { regex: /.{8,}/, message: "Password must be at least 8 characters long." },
      { regex: /[A-Z]/, message: "Password must contain at least one uppercase letter." },
      { regex: /[a-z]/, message: "Password must contain at least one lowercase letter." },
      { regex: /[0-9]/, message: "Password must contain at least one digit." },
      { regex: /[^A-Za-z0-9]/, message: "Password must contain at least one special character." },
    ];
    for (const rule of passwordRules) {
      if (!password || !rule.regex.test(password)) {
        return NextResponse.json(
          { message: rule.message },
          { status: 400 }
        );
      }
    }
    if (!phone || !/^[0-9]{10}$/.test(phone)) {
      return NextResponse.json(
        {
          message:
            "Phone number must be exactly 10 digits and contain only numbers.",
        },
        { status: 400 }
      );
    }

    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      return NextResponse.json(
        { message: "User with this email or phone already exists." },
        { status: 409 }
      );
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiration = Date.now() + 10 * 60 * 1000;

    // Store OTP and userDetails in Redis with 10 min expiry
    const redisData = {
      otp,
      expiration,
      userDetails: { fullName, email, password, phone },
    };
    await redis.set(email, JSON.stringify(redisData), "EX", 600);

    const mailOptions = {
      from: `"Userflow" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Verify Your Account",
      text: `Your One-Time Password is: ${otp}`,
    };
    await transporter.sendMail(mailOptions);

    console.log(`OTP for ${email} is ${otp}. Stored in Redis.`); // For debugging

    return NextResponse.json(
      { message: "An OTP has been sent to your email. Please verify." },
      { status: 200 }
    );
  } catch (error) {
    console.error("SEND OTP CATCH BLOCK ERROR:", error);
    return NextResponse.json(
      { message: "Server error while sending OTP." },
      { status: 500 }
    );
  }
}
