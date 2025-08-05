import { NextResponse } from "next/server";
import connectDb from "../../../../../db/connectDb";
import User from "../../../../../models/User";
import nodemailer from "nodemailer";

const otpStore = {};

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

    if (!fullName || !email || !password || !phone) {
      return NextResponse.json(
        { message: "All fields are required." },
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

    otpStore[email] = {
      otp,
      expiration,
      userDetails: { fullName, email, password, phone },
    };

    const mailOptions = {
      from: `"Userflow" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Verify Your Account",
      text: `Your One-Time Password is: ${otp}`,
    };
    await transporter.sendMail(mailOptions);

    console.log(`OTP for ${email} is ${otp}. Stored temporarily.`); // For debugging

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
