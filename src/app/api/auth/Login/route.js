
import connectDb from "../../../../../db/connectDb";
import User from "../../../../../models/User";
import bcrypt from "bcryptjs";

export async function POST(request) {
  console.log("API route hit for POST /api/auth/login");
  try {
    await connectDb();
    console.log("DB connected for login.");

    const { email, password } = await request.json();
    console.log("Received login attempt for email:", email);

    // Basic validation
    if (!email || !password) {
      return new Response(
        JSON.stringify({ message: "Email and password are required." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const user = await User.findOne({ email });
    if (!user) {
      return new Response(
        JSON.stringify({ message: "Invalid credentials." }),
        { status: 401, headers: { "Content-Type": "application/json" } } 
      );
      }
      
      const isMatch = await bcrypt.compare(password, user.password);
      console.log("Did the passwords match?", isMatch);
    if (!isMatch) {
      return new Response(JSON.stringify({ message: "Invalid credentials." }), {
        status: 402,
        headers: { "Content-Type": "application/json" },
      });
    }

    console.log("User logged in successfully:", user.email);
    return new Response(
      JSON.stringify({
        message: "Login successful!",
        user: {
          id: user._id,
          email: user.email,
          fullName: user.fullName,
        },
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Login error:", error);
    return new Response(
      JSON.stringify({
        message: "Server error during login.",
        details: error.message,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
